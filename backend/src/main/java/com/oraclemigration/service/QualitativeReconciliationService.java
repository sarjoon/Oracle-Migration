package com.oraclemigration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oraclemigration.domain.ConnectionProfile;
import com.oraclemigration.repository.ConnectionProfileRepository;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.sql.*;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Function;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class QualitativeReconciliationService {
  public record RunStatus(
      String reportId,
      String status,
      String errorMessage,
      int totalTables,
      int completedTables,
      int failedTables,
      long processedRecords,
      long matched,
      long mismatched,
      long missingInSource,
      long missingInTarget) {}

  public record Endpoint(
      long profileId, String name, String databaseType, String databaseOrService) {}

  public record TableSummary(
      String logicalTable,
      String sourceTable,
      String targetTable,
      String status,
      long sourceCount,
      long targetCount,
      long matched,
      long mismatched,
      long missingInSource,
      long missingInTarget,
      List<String> missingSourceColumns,
      List<String> missingTargetColumns,
      String xlsxFile,
      String errorMessage) {}

  public record QualitativeReport(
      String reportId,
      String batchName,
      OffsetDateTime generatedAt,
      String status,
      Endpoint source,
      Endpoint target,
      long matched,
      long mismatched,
      long missingInSource,
      long missingInTarget,
      String detailLabel,
      String zipFile,
      List<TableSummary> tables) {}

  public record ReportSummary(
      String reportId,
      String batchName,
      OffsetDateTime generatedAt,
      String status,
      Endpoint source,
      Endpoint target,
      long matched,
      long mismatched,
      long missingInSource,
      long missingInTarget,
      String zipFile,
      long fileSize) {}

  private record Mapping(
      long id,
      String logicalName,
      boolean autoCompare,
      long sourceMappingId,
      long targetMappingId,
      String sourceSchema,
      String sourceTable,
      String targetSchema,
      String targetTable) {}

  private record ColumnConfig(long id, String logicalName, boolean excluded, Integer keyPosition) {}

  private record ColumnPair(
      String logicalName, String source, String target, Integer keyPosition) {}

  private record Compared(TableSummary summary, Path workbook) {}

  private static final DateTimeFormatter FILE_TIME =
      DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS");
  private static final int XLSX_MAX_DATA_ROWS = 1_048_000;
  private final JdbcTemplate jdbc;
  private final ConnectionProfileRepository profiles;
  private final DatabaseAccess databases;
  private final ObjectMapper json;
  private final Executor worker;
  private final Path jsonDirectory;
  private final Path zipDirectory;
  private final Map<String, RunStatus> runs = new ConcurrentHashMap<>();

  public QualitativeReconciliationService(
      JdbcTemplate jdbc,
      ConnectionProfileRepository profiles,
      DatabaseAccess databases,
      ObjectMapper json,
      @Qualifier("reconciliationExecutor") Executor worker,
      @Value("${app.reconciliation-directory:}") String configured) {
    this.jdbc = jdbc;
    this.profiles = profiles;
    this.databases = databases;
    this.json = json;
    this.worker = worker;
    Path root =
        configured == null || configured.isBlank()
            ? jarHome().resolve("reconfiles")
            : Path.of(configured).toAbsolutePath().normalize();
    jsonDirectory = root.resolve("qualitative/json");
    zipDirectory = root.resolve("qualitative/zip");
  }

  public RunStatus createRun(long batchId) {
    String batch =
        jdbc.queryForObject(
            "SELECT name FROM recon_batch WHERE id=? AND active=TRUE", String.class, batchId);
    String id = safeName(batch) + "_" + OffsetDateTime.now().format(FILE_TIME);
    int total =
        jdbc.queryForObject(
            "SELECT COUNT(*) FROM recon_batch_table WHERE batch_id=?", Integer.class, batchId);
    var status = new RunStatus(id, "CREATED", null, total, 0, 0, 0, 0, 0, 0, 0);
    runs.put(id, status);
    return status;
  }

  @Async("migrationExecutor")
  public void generate(String id, long batchId, long sourceProfileId, long targetProfileId) {
    RunStatus initial = runs.get(id);
    runs.put(id, withStatus(initial, "RUNNING", null));
    List<Path> workbooks = new CopyOnWriteArrayList<>();
    try {
      ConnectionProfile source = profiles.findById(sourceProfileId).orElseThrow();
      ConnectionProfile target = profiles.findById(targetProfileId).orElseThrow();
      String batch =
          jdbc.queryForObject("SELECT name FROM recon_batch WHERE id=?", String.class, batchId);
      List<Mapping> mappings = mappings(batchId, sourceProfileId, targetProfileId);
      if (mappings.isEmpty())
        throw new IllegalArgumentException(
            "The batch has no active tables for the selected database pair");
      runs.compute(
          id, (k, v) -> new RunStatus(id, "RUNNING", null, mappings.size(), 0, 0, 0, 0, 0, 0, 0));
      List<CompletableFuture<Compared>> futures = new ArrayList<>();
      for (Mapping mapping : mappings)
        futures.add(
            CompletableFuture.supplyAsync(
                () -> compareSafely(id, mapping, source, target), worker));
      List<TableSummary> summaries = new ArrayList<>();
      for (CompletableFuture<Compared> future : futures) {
        Compared compared = future.join();
        summaries.add(compared.summary());
        if (compared.workbook() != null) workbooks.add(compared.workbook());
      }
      String status =
          summaries.stream().anyMatch(v -> "ERROR".equals(v.status()))
              ? "COMPLETED_WITH_ERRORS"
              : "COMPLETED";
      long matched = sum(summaries, TableSummary::matched),
          mismatched = sum(summaries, TableSummary::mismatched);
      long missingSource = sum(summaries, TableSummary::missingInSource),
          missingTarget = sum(summaries, TableSummary::missingInTarget);
      String zipName = id + ".zip";
      var report =
          new QualitativeReport(
              id,
              batch,
              OffsetDateTime.now(),
              status,
              endpoint(source),
              endpoint(target),
              matched,
              mismatched,
              missingSource,
              missingTarget,
              "Missing and mismatched record details are available in "
                  + zipName
                  + " (table XLSX files).",
              zipName,
              summaries);
      writeReport(report, workbooks);
      RunStatus current = runs.get(id);
      runs.put(
          id,
          new RunStatus(
              id,
              status,
              null,
              summaries.size(),
              summaries.size(),
              (int) summaries.stream().filter(v -> "ERROR".equals(v.status())).count(),
              current.processedRecords(),
              matched,
              mismatched,
              missingSource,
              missingTarget));
    } catch (Exception e) {
      runs.compute(id, (k, v) -> withStatus(v == null ? initial : v, "FAILED", safeMessage(e)));
    } finally {
      for (Path path : workbooks)
        try {
          Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }
  }

  public RunStatus status(String id) {
    return runs.getOrDefault(id, new RunStatus(id, "NOT_FOUND", null, 0, 0, 0, 0, 0, 0, 0, 0));
  }

  public List<ReportSummary> summaries() throws IOException {
    Files.createDirectories(jsonDirectory);
    List<ReportSummary> result = new ArrayList<>();
    try (Stream<Path> files = Files.list(jsonDirectory)) {
      for (Path file : files.filter(p -> p.getFileName().toString().endsWith(".json")).toList()) {
        try {
          QualitativeReport report = json.readValue(file.toFile(), QualitativeReport.class);
          Path zip = safePath(zipDirectory, report.reportId(), ".zip");
          result.add(
              new ReportSummary(
                  report.reportId(),
                  report.batchName(),
                  report.generatedAt(),
                  report.status(),
                  report.source(),
                  report.target(),
                  report.matched(),
                  report.mismatched(),
                  report.missingInSource(),
                  report.missingInTarget(),
                  report.zipFile(),
                  Files.exists(zip) ? Files.size(zip) : 0));
        } catch (Exception ignored) {
        }
      }
    }
    result.sort(Comparator.comparing(ReportSummary::generatedAt).reversed());
    return result;
  }

  public QualitativeReport load(String id) throws IOException {
    return json.readValue(safePath(jsonDirectory, id, ".json").toFile(), QualitativeReport.class);
  }

  public Path zipPath(String id) throws IOException {
    return safePath(zipDirectory, id, ".zip");
  }

  private Compared compareSafely(
      String runId, Mapping mapping, ConnectionProfile source, ConnectionProfile target) {
    Path workbook = null;
    try {
      workbook = Files.createTempFile("qualitative-", ".xlsx");
      Compared result = compare(mapping, source, target, workbook);
      updateProgress(runId, result.summary(), false);
      return result;
    } catch (Exception e) {
      try {
        if (workbook != null) Files.deleteIfExists(workbook);
      } catch (IOException ignored) {
      }
      var summary =
          new TableSummary(
              mapping.logicalName(),
              qualified(mapping.sourceSchema(), mapping.sourceTable()),
              qualified(mapping.targetSchema(), mapping.targetTable()),
              "ERROR",
              0,
              0,
              0,
              0,
              0,
              0,
              List.of(),
              List.of(),
              null,
              safeMessage(e));
      updateProgress(runId, summary, true);
      return new Compared(summary, null);
    }
  }

  private Compared compare(
      Mapping mapping,
      ConnectionProfile sourceProfile,
      ConnectionProfile targetProfile,
      Path workbook)
      throws Exception {
    List<ColumnConfig> logical = logicalColumns(mapping.id());
    try (Connection source = databases.open(sourceProfile);
        Connection target = databases.open(targetProfile)) {
      Map<String, String> sourceColumns =
          physicalColumns(source, mapping.sourceSchema(), mapping.sourceTable());
      Map<String, String> targetColumns =
          physicalColumns(target, mapping.targetSchema(), mapping.targetTable());
      List<String> missingSource = new ArrayList<>(), missingTarget = new ArrayList<>();
      if (mapping.autoCompare()) {
        targetColumns.keySet().stream()
            .filter(name -> !sourceColumns.containsKey(name))
            .forEach(missingSource::add);
        sourceColumns.keySet().stream()
            .filter(name -> !targetColumns.containsKey(name))
            .forEach(missingTarget::add);
      } else {
        for (ColumnConfig c : logical) {
          if (c.excluded()) continue;
          if (!sourceColumns.containsKey(c.logicalName())) missingSource.add(c.logicalName());
          if (!targetColumns.containsKey(c.logicalName())) missingTarget.add(c.logicalName());
        }
      }
      List<ColumnPair> pairs =
          mapping.autoCompare()
              ? automaticPairs(logical, sourceColumns, targetColumns)
              : configuredPairs(mapping.id(), logical, sourceColumns, targetColumns);
      List<ColumnPair> keys =
          pairs.stream()
              .filter(v -> v.keyPosition() != null)
              .sorted(Comparator.comparing(ColumnPair::keyPosition))
              .toList();
      if (keys.isEmpty())
        throw new IllegalStateException("No usable primary key mapping is configured");
      if (keys.stream()
          .anyMatch(
              v ->
                  !sourceColumns.containsKey(v.source()) || !targetColumns.containsKey(v.target())))
        throw new IllegalStateException("A primary key column is missing from source or target");
      List<Map<String, Object>> sourceRows =
          readRows(source, sourceProfile, mapping.sourceSchema(), mapping.sourceTable());
      List<Map<String, Object>> targetRows =
          readRows(target, targetProfile, mapping.targetSchema(), mapping.targetTable());
      Map<String, Map<String, Object>> sourceByKey = index(sourceRows, keys, true);
      Map<String, Map<String, Object>> targetByKey = index(targetRows, keys, false);
      List<Map<String, Object>> missingInSourceRows = new ArrayList<>(),
          missingInTargetRows = new ArrayList<>();
      List<List<Object>> mismatches = new ArrayList<>();
      long matched = 0, mismatched = 0;
      Set<String> allKeys = new LinkedHashSet<>(sourceByKey.keySet());
      allKeys.addAll(targetByKey.keySet());
      for (String key : allKeys) {
        Map<String, Object> s = sourceByKey.get(key), t = targetByKey.get(key);
        if (s == null) {
          missingInSourceRows.add(t);
          continue;
        }
        if (t == null) {
          missingInTargetRows.add(s);
          continue;
        }
        boolean recordMatch = true;
        for (ColumnPair pair : pairs) {
          if (pair.keyPosition() != null) continue;
          Object sv = value(s, pair.source()), tv = value(t, pair.target());
          if (!equivalent(sv, tv)) {
            recordMatch = false;
            mismatches.add(
                List.of(
                    keyNames(keys),
                    key,
                    pair.source(),
                    printable(sv),
                    pair.target(),
                    printable(tv)));
          }
        }
        if (recordMatch) matched++;
        else mismatched++;
      }
      String xlsxName = safeName(mapping.logicalName()) + ".xlsx";
      writeWorkbook(
          workbook,
          mapping,
          sourceProfile,
          targetProfile,
          sourceRows.size(),
          targetRows.size(),
          matched,
          mismatched,
          keys.stream().map(ColumnPair::source).toList(),
          keys.stream().map(ColumnPair::target).toList(),
          missingInSourceRows,
          missingInTargetRows,
          mismatches);
      var summary =
          new TableSummary(
              mapping.logicalName(),
              qualified(mapping.sourceSchema(), mapping.sourceTable()),
              qualified(mapping.targetSchema(), mapping.targetTable()),
              "COMPLETED",
              sourceRows.size(),
              targetRows.size(),
              matched,
              mismatched,
              missingInSourceRows.size(),
              missingInTargetRows.size(),
              missingSource,
              missingTarget,
              xlsxName,
              null);
      return new Compared(summary, workbook);
    }
  }

  private List<Mapping> mappings(long batchId, long sourceProfileId, long targetProfileId) {
    return jdbc.query(
        "SELECT r.id,l.name,l.auto_compare,r.source_table_mapping_id,r.target_table_mapping_id,"
            + "s.schema_name,s.table_name,t.schema_name,t.table_name FROM recon_batch_table bt "
            + "JOIN recon_batch b ON b.id=bt.batch_id JOIN recon_db_mapping r ON r.id=bt.recon_db_mapping_id "
            + "JOIN logical_table l ON l.id=r.logical_table_id JOIN db_table_mapping s ON s.id=r.source_table_mapping_id "
            + "JOIN db_table_mapping t ON t.id=r.target_table_mapping_id WHERE bt.batch_id=? AND b.active=TRUE "
            + "AND r.active=TRUE AND l.active=TRUE AND s.active=TRUE AND t.active=TRUE "
            + "AND s.connection_profile_id=? AND t.connection_profile_id=? ORDER BY bt.execution_order,l.name",
        (rs, n) ->
            new Mapping(
                rs.getLong(1),
                rs.getString(2),
                rs.getBoolean(3),
                rs.getLong(4),
                rs.getLong(5),
                rs.getString(6),
                rs.getString(7),
                rs.getString(8),
                rs.getString(9)),
        batchId,
        sourceProfileId,
        targetProfileId);
  }

  private List<ColumnConfig> logicalColumns(long reconId) {
    return jdbc.query(
        "SELECT c.id,c.name,c.excluded,c.primary_key_position FROM logical_column c JOIN recon_db_mapping r "
            + "ON r.logical_table_id=c.logical_table_id WHERE r.id=? ORDER BY c.name",
        (rs, n) ->
            new ColumnConfig(
                rs.getLong(1),
                rs.getString(2),
                rs.getBoolean(3),
                rs.getObject(4) == null ? null : rs.getInt(4)),
        reconId);
  }

  private List<ColumnPair> automaticPairs(
      List<ColumnConfig> logical, Map<String, String> source, Map<String, String> target) {
    List<ColumnPair> result = new ArrayList<>();
    Map<String, ColumnConfig> config = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
    logical.forEach(value -> config.put(value.logicalName(), value));
    for (String sourceName : source.keySet()) {
      if (!target.containsKey(sourceName)) continue;
      ColumnConfig column = config.get(sourceName);
      if (column != null && column.excluded()) continue;
      result.add(
          new ColumnPair(
              column == null ? sourceName : column.logicalName(),
              source.get(sourceName),
              target.get(sourceName),
              column == null ? null : column.keyPosition()));
    }
    return result;
  }

  private List<ColumnPair> configuredPairs(
      long id, List<ColumnConfig> logical, Map<String, String> source, Map<String, String> target) {
    Map<Long, ColumnConfig> configs = new HashMap<>();
    logical.forEach(v -> configs.put(v.id(), v));
    List<ColumnPair> result =
        jdbc
            .query(
                "SELECT logical_column_id,source_column_name,target_column_name FROM recon_column_mapping WHERE recon_db_mapping_id=? AND active=TRUE",
                (rs, n) -> {
                  ColumnConfig c = configs.get(rs.getLong(1));
                  if (c == null || c.excluded()) return null;
                  return new ColumnPair(
                      c.logicalName(), rs.getString(2), rs.getString(3), c.keyPosition());
                },
                id)
            .stream()
            .filter(Objects::nonNull)
            .toList();
    List<String> invalid =
        result.stream()
            .filter(v -> !source.containsKey(v.source()) || !target.containsKey(v.target()))
            .map(ColumnPair::logicalName)
            .toList();
    if (!invalid.isEmpty())
      throw new IllegalStateException("Mapped columns are missing: " + invalid);
    long expected = logical.stream().filter(v -> !v.excluded()).count();
    if (result.size() != expected)
      throw new IllegalStateException("Every non-excluded logical column must be mapped");
    return result;
  }

  private Map<String, String> physicalColumns(Connection connection, String schema, String table)
      throws SQLException {
    Map<String, String> result = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
    DatabaseMetaData md = connection.getMetaData();
    try (ResultSet rs = md.getColumns(connection.getCatalog(), schema, table, null)) {
      while (rs.next()) result.put(rs.getString("COLUMN_NAME"), rs.getString("COLUMN_NAME"));
    }
    if (result.isEmpty())
      try (ResultSet rs =
          md.getColumns(
              connection.getCatalog(),
              schema.toUpperCase(Locale.ROOT),
              table.toUpperCase(Locale.ROOT),
              null)) {
        while (rs.next()) result.put(rs.getString("COLUMN_NAME"), rs.getString("COLUMN_NAME"));
      }
    return result;
  }

  private List<Map<String, Object>> readRows(
      Connection connection, ConnectionProfile profile, String schema, String table)
      throws Exception {
    String sql = "SELECT * FROM " + quote(profile, schema) + "." + quote(profile, table);
    List<Map<String, Object>> rows = new ArrayList<>();
    try (Statement statement = connection.createStatement()) {
      statement.setFetchSize(500);
      try (ResultSet rs = statement.executeQuery(sql)) {
        ResultSetMetaData md = rs.getMetaData();
        while (rs.next()) {
          Map<String, Object> row = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
          for (int i = 1; i <= md.getColumnCount(); i++)
            row.put(md.getColumnLabel(i), materialize(rs.getObject(i)));
          rows.add(row);
        }
      }
    }
    return rows;
  }

  private Map<String, Map<String, Object>> index(
      List<Map<String, Object>> rows, List<ColumnPair> keys, boolean source) throws Exception {
    Map<String, Map<String, Object>> result = new LinkedHashMap<>();
    for (Map<String, Object> row : rows) {
      List<String> values = new ArrayList<>();
      for (ColumnPair key : keys) {
        Object value = value(row, source ? key.source() : key.target());
        if (value == null || value.toString().isBlank())
          throw new IllegalStateException("Primary key contains NULL or empty value");
        values.add(canonical(value));
      }
      String serialized = json.writeValueAsString(values);
      if (result.putIfAbsent(serialized, row) != null)
        throw new IllegalStateException("Duplicate primary key: " + serialized);
    }
    return result;
  }

  private void writeWorkbook(
      Path path,
      Mapping mapping,
      ConnectionProfile source,
      ConnectionProfile target,
      long sourceCount,
      long targetCount,
      long matched,
      long mismatched,
      List<String> sourceKeys,
      List<String> targetKeys,
      List<Map<String, Object>> missingSource,
      List<Map<String, Object>> missingTarget,
      List<List<Object>> mismatches)
      throws IOException {
    try (Workbook book = new XSSFWorkbook()) {
      CellStyle heading = heading(book);
      Sheet summary = book.createSheet("Summary");
      int r = cells(summary, 0, heading, "Qualitative Reconciliation", mapping.logicalName());
      r = cells(summary, r, heading, "Property", "Source", "Target");
      r = cells(summary, r, null, "Database", source.getName(), target.getName());
      r =
          cells(
              summary,
              r,
              null,
              "Table",
              qualified(mapping.sourceSchema(), mapping.sourceTable()),
              qualified(mapping.targetSchema(), mapping.targetTable()));
      r = cells(summary, r, null, "Record Count", sourceCount, targetCount);
      cells(summary, r, null, "Matched", matched, "Mismatched", mismatched);
      writeRecordSheets(book, "Missing_In_Source", missingSource, targetKeys, heading);
      writeRecordSheets(book, "Missing_In_Target", missingTarget, sourceKeys, heading);
      writeMismatchSheets(book, mismatches, heading);
      for (int i = 0; i < Math.min(6, summary.getRow(1).getLastCellNum()); i++)
        summary.autoSizeColumn(i);
      try (OutputStream out = Files.newOutputStream(path)) {
        book.write(out);
      }
    }
  }

  private void writeRecordSheets(
      Workbook book,
      String base,
      List<Map<String, Object>> rows,
      List<String> keyColumns,
      CellStyle heading) {
    if (rows.isEmpty()) {
      cells(book.createSheet(base), 0, heading, "No records");
      return;
    }
    List<String> columns = new ArrayList<>(rows.get(0).keySet());
    columns.sort(
        Comparator.comparingInt(
            name -> {
              int key = indexOfIgnoreCase(keyColumns, name);
              return key < 0 ? keyColumns.size() + 1 : key;
            }));
    int sheetNumber = 1, rowNumber = 0;
    Sheet sheet = book.createSheet(base);
    cells(sheet, rowNumber++, heading, columns.toArray());
    for (Map<String, Object> row : rows) {
      if (rowNumber >= XLSX_MAX_DATA_ROWS) {
        sheet = book.createSheet(base + "_" + (++sheetNumber));
        rowNumber = 0;
        cells(sheet, rowNumber++, heading, columns.toArray());
      }
      cells(sheet, rowNumber++, null, columns.stream().map(c -> printable(row.get(c))).toArray());
    }
  }

  private void writeMismatchSheets(Workbook book, List<List<Object>> rows, CellStyle heading) {
    String base = "Mismatches";
    int sheetNumber = 1, rowNumber = 0;
    Sheet sheet = book.createSheet(base);
    rowNumber =
        cells(
            sheet,
            rowNumber,
            heading,
            "Primary Key Columns",
            "Primary Key Values",
            "Source Column",
            "Source Value",
            "Target Column",
            "Target Value");
    for (List<Object> row : rows) {
      if (rowNumber >= XLSX_MAX_DATA_ROWS) {
        sheet = book.createSheet(base + "_" + (++sheetNumber));
        rowNumber = 0;
        rowNumber =
            cells(
                sheet,
                rowNumber,
                heading,
                "Primary Key Columns",
                "Primary Key Values",
                "Source Column",
                "Source Value",
                "Target Column",
                "Target Value");
      }
      cells(sheet, rowNumber++, null, row.toArray());
    }
  }

  private void writeReport(QualitativeReport report, List<Path> workbooks) throws Exception {
    Files.createDirectories(jsonDirectory);
    Files.createDirectories(zipDirectory);
    Path jsonTarget = safePath(jsonDirectory, report.reportId(), ".json");
    Path zipTarget = safePath(zipDirectory, report.reportId(), ".zip");
    Path jsonPartial = jsonTarget.resolveSibling(jsonTarget.getFileName() + ".partial");
    Path zipPartial = zipTarget.resolveSibling(zipTarget.getFileName() + ".partial");
    Files.writeString(
        jsonPartial,
        json.writerWithDefaultPrettyPrinter().writeValueAsString(report),
        StandardCharsets.UTF_8);
    try (ZipOutputStream zip = new ZipOutputStream(Files.newOutputStream(zipPartial))) {
      for (int i = 0; i < workbooks.size(); i++) {
        String name =
            report.tables().stream().filter(t -> t.xlsxFile() != null).toList().get(i).xlsxFile();
        zip.putNextEntry(new ZipEntry(name));
        Files.copy(workbooks.get(i), zip);
        zip.closeEntry();
      }
    }
    Files.move(zipPartial, zipTarget, StandardCopyOption.REPLACE_EXISTING);
    Files.move(jsonPartial, jsonTarget, StandardCopyOption.REPLACE_EXISTING);
  }

  private void updateProgress(String id, TableSummary summary, boolean failed) {
    runs.computeIfPresent(
        id,
        (k, v) ->
            new RunStatus(
                id,
                "RUNNING",
                null,
                v.totalTables(),
                v.completedTables() + 1,
                v.failedTables() + (failed ? 1 : 0),
                v.processedRecords() + summary.sourceCount() + summary.targetCount(),
                v.matched() + summary.matched(),
                v.mismatched() + summary.mismatched(),
                v.missingInSource() + summary.missingInSource(),
                v.missingInTarget() + summary.missingInTarget()));
  }

  private Endpoint endpoint(ConnectionProfile p) {
    return new Endpoint(
        p.getId(),
        p.getName(),
        p.getDatabaseType().name(),
        p.getDatabaseType() == ConnectionProfile.DatabaseType.ORACLE
            ? p.getServiceName()
            : p.getDatabaseName());
  }

  private long sum(List<TableSummary> values, Function<TableSummary, Long> getter) {
    return values.stream().map(getter).mapToLong(Long::longValue).sum();
  }

  private Object materialize(Object value) throws Exception {
    if (value instanceof Blob blob)
      try (InputStream in = blob.getBinaryStream()) {
        return new LobValue("BLOB", blob.length(), hex(in));
      }
    if (value instanceof Clob clob)
      try (Reader reader = clob.getCharacterStream()) {
        return new LobValue("CLOB", clob.length(), hex(reader));
      }
    if (value instanceof byte[] bytes)
      return new LobValue(
          "BINARY",
          bytes.length,
          HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)));
    return value;
  }

  private record LobValue(String type, long length, String sha256) {}

  private String hex(InputStream in) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] b = new byte[8192];
    int n;
    while ((n = in.read(b)) >= 0) digest.update(b, 0, n);
    return HexFormat.of().formatHex(digest.digest());
  }

  private String hex(Reader reader) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    char[] c = new char[4096];
    int n;
    while ((n = reader.read(c)) >= 0)
      digest.update(new String(c, 0, n).getBytes(StandardCharsets.UTF_8));
    return HexFormat.of().formatHex(digest.digest());
  }

  private boolean equivalent(Object a, Object b) {
    if (empty(a) && empty(b)) return true;
    if (a instanceof Number && b instanceof Number)
      return new java.math.BigDecimal(a.toString())
              .compareTo(new java.math.BigDecimal(b.toString()))
          == 0;
    if (a instanceof java.time.temporal.Temporal || b instanceof java.time.temporal.Temporal)
      return Objects.equals(a.toString().trim(), b.toString().trim());
    return Objects.equals(canonical(a), canonical(b));
  }

  private boolean empty(Object v) {
    return v == null || (v instanceof CharSequence s && s.toString().trim().isEmpty());
  }

  private String canonical(Object value) {
    return value == null ? "" : value instanceof String s ? s.trim() : value.toString();
  }

  private Object printable(Object value) {
    if (value instanceof LobValue lob)
      return "<" + lob.type() + " length=" + lob.length() + " sha256=" + lob.sha256() + ">";
    String text = canonical(value);
    return text.length() > 32767 ? text.substring(0, 32700) + "…" : text;
  }

  private Object value(Map<String, Object> row, String column) {
    return row.get(column);
  }

  private String keyNames(List<ColumnPair> keys) {
    try {
      return json.writeValueAsString(keys.stream().map(ColumnPair::logicalName).toList());
    } catch (Exception e) {
      return keys.toString();
    }
  }

  private int indexOfIgnoreCase(List<String> values, String value) {
    for (int i = 0; i < values.size(); i++) if (values.get(i).equalsIgnoreCase(value)) return i;
    return -1;
  }

  private String quote(ConnectionProfile p, String name) {
    return p.getDatabaseType() == ConnectionProfile.DatabaseType.ORACLE
        ? "\"" + name.replace("\"", "\"\"") + "\""
        : "[" + name.replace("]", "]]") + "]";
  }

  private String qualified(String schema, String table) {
    return schema + "." + table;
  }

  private String safeName(String value) {
    String safe = value.replaceAll("[^A-Za-z0-9._-]", "_");
    return safe.isBlank() ? "batch" : safe;
  }

  private String safeMessage(Throwable e) {
    Throwable cause = e instanceof CompletionException && e.getCause() != null ? e.getCause() : e;
    return cause.getMessage() == null ? cause.getClass().getSimpleName() : cause.getMessage();
  }

  private RunStatus withStatus(RunStatus v, String status, String error) {
    return new RunStatus(
        v.reportId(),
        status,
        error,
        v.totalTables(),
        v.completedTables(),
        v.failedTables(),
        v.processedRecords(),
        v.matched(),
        v.mismatched(),
        v.missingInSource(),
        v.missingInTarget());
  }

  private CellStyle heading(Workbook book) {
    CellStyle s = book.createCellStyle();
    s.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
    s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    Font f = book.createFont();
    f.setBold(true);
    f.setColor(IndexedColors.WHITE.getIndex());
    s.setFont(f);
    return s;
  }

  private int cells(Sheet sheet, int number, CellStyle style, Object... values) {
    Row row = sheet.createRow(number);
    for (int i = 0; i < values.length; i++) {
      Cell cell = row.createCell(i);
      Object v = values[i];
      if (v instanceof Number n) cell.setCellValue(n.doubleValue());
      else cell.setCellValue(v == null ? "" : v.toString());
      if (style != null) cell.setCellStyle(style);
    }
    return number + 1;
  }

  private Path safePath(Path dir, String id, String suffix) throws IOException {
    Files.createDirectories(dir);
    Path p = dir.resolve(id + suffix).normalize();
    if (!p.getParent().equals(dir.normalize()) || !id.matches("[A-Za-z0-9._-]+"))
      throw new IllegalArgumentException("Invalid report id");
    return p;
  }

  private Path jarHome() {
    try {
      Path source =
          Path.of(
              QualitativeReconciliationService.class
                  .getProtectionDomain()
                  .getCodeSource()
                  .getLocation()
                  .toURI());
      return Files.isRegularFile(source)
          ? source.getParent()
          : Path.of(System.getProperty("user.dir"));
    } catch (Exception e) {
      return Path.of(System.getProperty("user.dir"));
    }
  }
}
