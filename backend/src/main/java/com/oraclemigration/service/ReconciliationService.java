package com.oraclemigration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oraclemigration.domain.ConnectionProfile;
import java.io.OutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class ReconciliationService {
  public record Endpoint(
      String configurationName,
      String databaseType,
      String host,
      int port,
      String databaseOrService,
      String schema) {}

  public record ReportMetadata(
      String reportId,
      OffsetDateTime generatedAt,
      String reconciliationType,
      Endpoint source,
      Endpoint target,
      String status) {}

  public record ObjectComparison(
      String objectType,
      int sourceCount,
      int targetCount,
      boolean matched,
      List<String> missingInSource,
      List<String> missingInTarget) {}

  public record TableComparison(
      String tableName, Long sourceCount, Long targetCount, String status, String errorMessage) {}

  public record QuantitativeReport(
      ReportMetadata metadata,
      List<ObjectComparison> objectCounts,
      List<TableComparison> recordCounts) {}

  public record ReportSummary(
      String reportId,
      OffsetDateTime generatedAt,
      Endpoint source,
      Endpoint target,
      String status,
      long matched,
      long mismatched,
      long fileSize,
      boolean downloadable) {}

  public record RunStatus(String reportId, String status, String errorMessage) {}

  private static final DateTimeFormatter FILE_TIME =
      DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS");
  private final DatabaseAccess databaseAccess;
  private final ObjectMapper json;
  private final Path jsonDirectory, xlsxDirectory;
  private final Map<String, RunStatus> activeRuns = new ConcurrentHashMap<>();

  public ReconciliationService(
      DatabaseAccess databaseAccess,
      ObjectMapper json,
      @Value("${app.reconciliation-directory:}") String configured) {
    this.databaseAccess = databaseAccess;
    this.json = json;
    Path root =
        configured == null || configured.isBlank()
            ? jarHome().resolve("reconfiles")
            : Path.of(configured).toAbsolutePath().normalize();
    jsonDirectory = root.resolve("quantitative/json");
    xlsxDirectory = root.resolve("quantitative/xlsx");
  }

  public RunStatus createRun() {
    String id = "ObjectCount_" + OffsetDateTime.now().format(FILE_TIME);
    var status = new RunStatus(id, "CREATED", null);
    activeRuns.put(id, status);
    return status;
  }

  @Async("migrationExecutor")
  public void generate(
      String id,
      ConnectionProfile sourceProfile,
      ConnectionProfile targetProfile,
      String sourceSchema,
      String targetSchema) {
    activeRuns.put(id, new RunStatus(id, "RUNNING", null));
    try (var source = databaseAccess.open(sourceProfile);
        var target = databaseAccess.open(targetProfile)) {
      var sourceObjects = inventory(source, sourceProfile, sourceSchema);
      var targetObjects = inventory(target, targetProfile, targetSchema);
      var objectCounts = compareObjects(sourceObjects, targetObjects);
      var recordCounts =
          compareRecords(
              source,
              target,
              sourceProfile,
              targetProfile,
              sourceSchema,
              targetSchema,
              sourceObjects.getOrDefault("TABLE", Set.of()),
              targetObjects.getOrDefault("TABLE", Set.of()));
      String status =
          recordCounts.stream().anyMatch(row -> "ERROR".equals(row.status()))
              ? "COMPLETED_WITH_ERRORS"
              : "COMPLETED";
      var metadata =
          new ReportMetadata(
              id,
              OffsetDateTime.now(),
              "QUANTITATIVE",
              endpoint(sourceProfile, sourceSchema),
              endpoint(targetProfile, targetSchema),
              status);
      writePair(new QuantitativeReport(metadata, objectCounts, recordCounts));
      activeRuns.put(id, new RunStatus(id, status, null));
    } catch (Exception error) {
      activeRuns.put(id, new RunStatus(id, "FAILED", safeMessage(error)));
    }
  }

  public RunStatus status(String id) {
    return activeRuns.getOrDefault(id, new RunStatus(id, "NOT_FOUND", null));
  }

  public List<ReportSummary> summaries() throws Exception {
    Files.createDirectories(jsonDirectory);
    var reports = new ArrayList<ReportSummary>();
    try (Stream<Path> files = Files.list(jsonDirectory)) {
      for (Path path : files.filter(p -> p.getFileName().toString().endsWith(".json")).toList()) {
        var report = json.readValue(path.toFile(), QuantitativeReport.class);
        long matched = report.objectCounts().stream().filter(ObjectComparison::matched).count();
        reports.add(
            new ReportSummary(
                report.metadata().reportId(),
                report.metadata().generatedAt(),
                report.metadata().source(),
                report.metadata().target(),
                report.metadata().status(),
                matched,
                report.objectCounts().size() - matched,
                Files.size(path),
                Files.exists(xlsxPath(report.metadata().reportId()))));
      }
    }
    reports.sort(Comparator.comparing(ReportSummary::generatedAt).reversed());
    return reports;
  }

  public QuantitativeReport load(String id) throws Exception {
    return json.readValue(safePath(jsonDirectory, id, ".json").toFile(), QuantitativeReport.class);
  }

  public Path xlsxPath(String id) throws Exception {
    return safePath(xlsxDirectory, id, ".xlsx");
  }

  private void writePair(QuantitativeReport report) throws Exception {
    Files.createDirectories(jsonDirectory);
    Files.createDirectories(xlsxDirectory);
    Path jsonTarget = safePath(jsonDirectory, report.metadata().reportId(), ".json"),
        xlsxTarget = safePath(xlsxDirectory, report.metadata().reportId(), ".xlsx");
    Path jsonTemp = jsonTarget.resolveSibling(jsonTarget.getFileName() + ".tmp"),
        xlsxTemp = xlsxTarget.resolveSibling(xlsxTarget.getFileName() + ".tmp");
    Files.writeString(
        jsonTemp,
        json.writerWithDefaultPrettyPrinter().writeValueAsString(report),
        StandardCharsets.UTF_8);
    writeWorkbook(report, xlsxTemp);
    json.readValue(jsonTemp.toFile(), QuantitativeReport.class);
    try (Workbook ignored = WorkbookFactory.create(xlsxTemp.toFile())) {}
    Files.move(
        jsonTemp, jsonTarget, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
    Files.move(
        xlsxTemp, xlsxTarget, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
  }

  private void writeWorkbook(QuantitativeReport report, Path path) throws Exception {
    try (Workbook workbook = new XSSFWorkbook()) {
      CellStyle heading = style(workbook, IndexedColors.DARK_GREEN),
          matched = style(workbook, IndexedColors.GREEN),
          mismatched = style(workbook, IndexedColors.RED);
      Sheet summary = workbook.createSheet("Summary");
      int row = header(summary, report.metadata(), heading) + 1;
      row = cells(summary, row, heading, "Metric", "Value");
      long objectMatched = report.objectCounts().stream().filter(ObjectComparison::matched).count(),
          tableMatched =
              report.recordCounts().stream().filter(v -> "MATCHED".equals(v.status())).count();
      cells(summary, row++, null, "Matched object types", objectMatched);
      cells(
          summary,
          row++,
          null,
          "Mismatched object types",
          report.objectCounts().size() - objectMatched);
      cells(summary, row++, null, "Matched table counts", tableMatched);
      cells(
          summary,
          row,
          null,
          "Mismatched/error table counts",
          report.recordCounts().size() - tableMatched);
      Sheet objects = workbook.createSheet("Object Counts");
      row = header(objects, report.metadata(), heading) + 1;
      row = cells(objects, row, heading, "Object Type", "Source Count", "Target Count", "Result");
      for (var value : report.objectCounts()) {
        int current = row++;
        cells(
            objects,
            current,
            null,
            value.objectType(),
            value.sourceCount(),
            value.targetCount(),
            value.matched() ? "MATCHED" : "MISMATCH");
        objects.getRow(current).getCell(3).setCellStyle(value.matched() ? matched : mismatched);
      }
      missingSheet(workbook.createSheet("Missing In Source"), report, true, heading);
      missingSheet(workbook.createSheet("Missing In Target"), report, false, heading);
      Sheet records = workbook.createSheet("Record Counts");
      row = header(records, report.metadata(), heading) + 1;
      row =
          cells(
              records,
              row,
              heading,
              "Table",
              "Source Records",
              "Target Records",
              "Result",
              "Error");
      for (var value : report.recordCounts()) {
        int current = row++;
        cells(
            records,
            current,
            null,
            value.tableName(),
            value.sourceCount(),
            value.targetCount(),
            value.status(),
            value.errorMessage());
        records
            .getRow(current)
            .getCell(3)
            .setCellStyle("MATCHED".equals(value.status()) ? matched : mismatched);
      }
      for (Sheet sheet : List.of(summary, objects, records)) autoSize(sheet);
      try (OutputStream output = Files.newOutputStream(path)) {
        workbook.write(output);
      }
    }
  }

  private void missingSheet(
      Sheet sheet, QuantitativeReport report, boolean source, CellStyle heading) {
    int row = header(sheet, report.metadata(), heading) + 1;
    row =
        cells(
            sheet, row, heading, "Object Type", source ? "Missing In Source" : "Missing In Target");
    for (var comparison : report.objectCounts())
      for (String name : source ? comparison.missingInSource() : comparison.missingInTarget())
        cells(sheet, row++, null, comparison.objectType(), name);
    autoSize(sheet);
  }

  private int header(Sheet sheet, ReportMetadata m, CellStyle heading) {
    int row = cells(sheet, 0, heading, "Quantitative Reconciliation", m.reportId());
    row = cells(sheet, row, null, "Generated", m.generatedAt());
    row = cells(sheet, row, heading, "Property", "Source", "Target");
    row =
        cells(
            sheet,
            row,
            null,
            "Configuration",
            m.source().configurationName(),
            m.target().configurationName());
    row =
        cells(
            sheet,
            row,
            null,
            "Database Type",
            m.source().databaseType(),
            m.target().databaseType());
    row = cells(sheet, row, null, "Host", m.source().host(), m.target().host());
    row = cells(sheet, row, null, "Port", m.source().port(), m.target().port());
    row =
        cells(
            sheet,
            row,
            null,
            "Database / Service",
            m.source().databaseOrService(),
            m.target().databaseOrService());
    return cells(sheet, row, null, "Schema", m.source().schema(), m.target().schema());
  }

  private int cells(Sheet sheet, int number, CellStyle style, Object... values) {
    Row row = sheet.createRow(number);
    for (int column = 0; column < values.length; column++) {
      Cell cell = row.createCell(column);
      Object value = values[column];
      if (value instanceof Number n) cell.setCellValue(n.doubleValue());
      else cell.setCellValue(value == null ? "" : value.toString());
      if (style != null) cell.setCellStyle(style);
    }
    return number + 1;
  }

  private CellStyle style(Workbook workbook, IndexedColors color) {
    CellStyle style = workbook.createCellStyle();
    style.setFillForegroundColor(color.getIndex());
    style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    Font font = workbook.createFont();
    font.setBold(true);
    font.setColor(IndexedColors.WHITE.getIndex());
    style.setFont(font);
    return style;
  }

  private void autoSize(Sheet sheet) {
    for (int column = 0; column < 6; column++) sheet.autoSizeColumn(column);
  }

  private List<ObjectComparison> compareObjects(
      Map<String, Set<String>> source, Map<String, Set<String>> target) {
    var types = new TreeSet<String>();
    types.addAll(source.keySet());
    types.addAll(target.keySet());
    var results = new ArrayList<ObjectComparison>();
    for (String type : types) {
      var sourceNames = source.getOrDefault(type, Set.of());
      var targetNames = target.getOrDefault(type, Set.of());
      var missingSource = new TreeSet<>(targetNames);
      missingSource.removeAll(sourceNames);
      var missingTarget = new TreeSet<>(sourceNames);
      missingTarget.removeAll(targetNames);
      results.add(
          new ObjectComparison(
              type,
              sourceNames.size(),
              targetNames.size(),
              missingSource.isEmpty() && missingTarget.isEmpty(),
              List.copyOf(missingSource),
              List.copyOf(missingTarget)));
    }
    return results;
  }

  private List<TableComparison> compareRecords(
      Connection source,
      Connection target,
      ConnectionProfile sourceProfile,
      ConnectionProfile targetProfile,
      String sourceSchema,
      String targetSchema,
      Set<String> sourceTables,
      Set<String> targetTables) {
    var all = new TreeSet<>(sourceTables);
    all.addAll(targetTables);
    var results = new ArrayList<TableComparison>();
    for (String table : all) {
      try {
        Long sourceCount =
            sourceTables.contains(table) ? count(source, sourceProfile, sourceSchema, table) : null;
        Long targetCount =
            targetTables.contains(table) ? count(target, targetProfile, targetSchema, table) : null;
        String status =
            sourceCount != null && sourceCount.equals(targetCount) ? "MATCHED" : "MISMATCH";
        results.add(new TableComparison(table, sourceCount, targetCount, status, null));
      } catch (Exception error) {
        results.add(new TableComparison(table, null, null, "ERROR", safeMessage(error)));
      }
    }
    return results;
  }

  private Map<String, Set<String>> inventory(
      Connection connection, ConnectionProfile profile, String schema) throws SQLException {
    return profile.getDatabaseType() == ConnectionProfile.DatabaseType.ORACLE
        ? oracleInventory(connection, schema)
        : sybaseInventory(connection, schema);
  }

  private Map<String, Set<String>> oracleInventory(Connection connection, String schema)
      throws SQLException {
    var result = new TreeMap<String, Set<String>>();
    try (var statement =
        connection.prepareStatement(
            "SELECT object_type, object_name FROM all_objects WHERE owner = ? AND object_type <> 'LOB'")) {
      statement.setString(1, schema.toUpperCase(Locale.ROOT));
      try (var rows = statement.executeQuery()) {
        while (rows.next()) add(result, rows.getString(1), rows.getString(2));
      }
    }
    return result;
  }

  private Map<String, Set<String>> sybaseInventory(Connection connection, String schema)
      throws SQLException {
    var result = new TreeMap<String, Set<String>>();
    try (var statement =
        connection.prepareStatement(
            "SELECT o.type, o.name FROM sysobjects o JOIN sysusers u ON o.uid=u.uid WHERE u.name=?")) {
      statement.setString(1, schema);
      try (var rows = statement.executeQuery()) {
        while (rows.next()) add(result, sybaseType(rows.getString(1)), rows.getString(2));
      }
      try (var indexes =
          connection.prepareStatement(
              "SELECT i.name FROM sysindexes i JOIN sysobjects o ON i.id=o.id JOIN sysusers u ON o.uid=u.uid WHERE u.name=? AND i.indid > 0 AND i.indid < 255")) {
        indexes.setString(1, schema);
        try (var rows = indexes.executeQuery()) {
          while (rows.next()) add(result, "INDEX", rows.getString(1));
        }
      }
    }
    return result;
  }

  private String sybaseType(String type) {
    return switch (type.trim().toUpperCase(Locale.ROOT)) {
      case "U" -> "TABLE";
      case "V" -> "VIEW";
      case "P", "XP" -> "PROCEDURE";
      case "TR" -> "TRIGGER";
      case "F", "FN" -> "FUNCTION";
      case "S", "SO" -> "SEQUENCE";
      default -> "OTHER (" + type.trim() + ")";
    };
  }

  private long count(Connection connection, ConnectionProfile profile, String schema, String table)
      throws SQLException {
    String qualified =
        profile.getDatabaseType() == ConnectionProfile.DatabaseType.ORACLE
            ? quote(schema) + "." + quote(table)
            : bracket(schema) + "." + bracket(table);
    try (var statement = connection.createStatement();
        var result = statement.executeQuery("SELECT COUNT(*) FROM " + qualified)) {
      result.next();
      return result.getLong(1);
    }
  }

  private Endpoint endpoint(ConnectionProfile profile, String schema) {
    String database =
        profile.getDatabaseType() == ConnectionProfile.DatabaseType.ORACLE
            ? profile.getServiceName()
            : profile.getDatabaseName();
    return new Endpoint(
        profile.getName(),
        profile.getDatabaseType().name(),
        profile.getHost(),
        profile.getPort(),
        database,
        schema);
  }

  private void add(Map<String, Set<String>> values, String type, String name) {
    if (type != null && name != null)
      values
          .computeIfAbsent(type.toUpperCase(Locale.ROOT), ignored -> new TreeSet<>())
          .add(name.toUpperCase(Locale.ROOT));
  }

  private Path safePath(Path directory, String id, String extension) throws Exception {
    if (!id.matches("ObjectCount_[0-9]{8}_[0-9]{6}_[0-9]{3}"))
      throw new IllegalArgumentException("Invalid report identifier");
    Path path = directory.resolve(id + extension).normalize();
    if (!path.startsWith(directory)) throw new IllegalArgumentException("Unsafe report path");
    return path;
  }

  private Path jarHome() {
    try {
      URI location =
          ReconciliationService.class.getProtectionDomain().getCodeSource().getLocation().toURI();
      Path path = Path.of(location).toAbsolutePath().normalize();
      return Files.isRegularFile(path)
          ? path.getParent()
          : Path.of(System.getProperty("user.dir")).toAbsolutePath();
    } catch (Exception ignored) {
      return Path.of(System.getProperty("user.dir")).toAbsolutePath();
    }
  }

  private String quote(String value) {
    return "\"" + value.replace("\"", "\"\"") + "\"";
  }

  private String bracket(String value) {
    return "[" + value.replace("]", "]]") + "]";
  }

  private String safeMessage(Exception error) {
    String value =
        error.getMessage() == null ? error.getClass().getSimpleName() : error.getMessage();
    return value.substring(0, Math.min(value.length(), 3900));
  }
}
