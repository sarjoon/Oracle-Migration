package com.oraclemigration.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oraclemigration.domain.*;
import com.oraclemigration.repository.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MigrationService {
  public record ObjectRef(String type, String name) {}

  public record FailureEntry(
      Instant timestamp,
      Long jobId,
      String phase,
      String objectType,
      String objectName,
      String status,
      String error,
      int retryCount) {}

  private final MigrationJobRepository jobs;
  private final JobCheckpointRepository checkpoints;
  private final AuditEventRepository audit;
  private final DatabaseAccess db;
  private final ObjectMapper json;
  private final Path root;

  public MigrationService(
      MigrationJobRepository j,
      JobCheckpointRepository c,
      AuditEventRepository a,
      DatabaseAccess d,
      ObjectMapper o,
      @Value("${app.output-directory:./generated}") String r) {
    jobs = j;
    checkpoints = c;
    audit = a;
    db = d;
    json = o;
    root = Path.of(r).toAbsolutePath().normalize();
  }

  public List<ObjectRef> discover(ConnectionProfile p, String schema) throws SQLException {
    try (var c = db.open(p)) {
      var out = new ArrayList<ObjectRef>();
      try (var rs =
          c.getMetaData().getTables(c.getCatalog(), schema, "%", new String[] {"TABLE", "VIEW"})) {
        while (rs.next())
          out.add(new ObjectRef(rs.getString("TABLE_TYPE"), rs.getString("TABLE_NAME")));
      }
      return out;
    }
  }

  @Async("migrationExecutor")
  public void run(Long id, boolean retryOnly) {
    execute(id, retryOnly);
  }

  @Transactional
  public void markInterrupted() {
    for (var j : jobs.findAll())
      if (j.getStatus() == MigrationJob.Status.RUNNING) {
        j.setStatus(MigrationJob.Status.INTERRUPTED);
        jobs.save(j);
      }
  }

  void execute(Long id, boolean retryOnly) {
    var job = jobs.findById(id).orElseThrow();
    job.setStatus(MigrationJob.Status.RUNNING);
    job.setStartedAt(Instant.now());
    jobs.save(job);
    audit.save(
        new AuditEvent(id, retryOnly ? "RETRY_STARTED" : "JOB_STARTED", "Generation started"));
    try {
      Path dir = safeJobDirectory(job);
      Files.createDirectories(dir);
      job.setOutputDirectory(dir.toString());
      List<ObjectRef> selected = selection(job);
      job.setTotalUnits(selected.stream().mapToInt(o -> o.type().equals("TABLE") ? 3 : 2).sum());
      jobs.save(job);
      try (var conn = db.open(job.getSourceProfile())) {
        for (var phase : List.of("DDL", "DML", "INDEXES")) {
          job.setCurrentPhase(phase);
          jobs.save(job);
          for (var object : selected) {
            if (!object.type().equals("TABLE") && phase.equals("DML")) continue;
            var cp = checkpoint(job, phase, object);
            if (retryOnly
                && cp.getStatus() != JobCheckpoint.Status.FAILED
                && cp.getStatus() != JobCheckpoint.Status.SKIPPED_DEPENDENCY) continue;
            if (!retryOnly && cp.getStatus() == JobCheckpoint.Status.COMPLETED) continue;
            generate(conn, job, phase, object, cp, dir);
          }
        }
      }
      job.setFailedUnits(
          (int)
              checkpoints
                  .findByJobIdAndStatusIn(
                      id,
                      List.of(JobCheckpoint.Status.FAILED, JobCheckpoint.Status.SKIPPED_DEPENDENCY))
                  .size());
      job.setStatus(
          job.getFailedUnits() > 0
              ? MigrationJob.Status.COMPLETED_WITH_ERRORS
              : MigrationJob.Status.COMPLETED);
    } catch (Exception e) {
      job.setStatus(MigrationJob.Status.FAILED);
      audit.save(new AuditEvent(id, "JOB_FAILED", safeError(e)));
    }
    job.setFinishedAt(Instant.now());
    jobs.save(job);
    writeFailures(job);
  }

  private List<ObjectRef> selection(MigrationJob job) throws Exception {
    if (job.isEntireSchema()) return discover(job.getSourceProfile(), job.getSourceSchema());
    return json.readValue(job.getSelectedObjectsJson(), new TypeReference<List<ObjectRef>>() {});
  }

  private JobCheckpoint checkpoint(MigrationJob j, String phase, ObjectRef o) {
    return checkpoints
        .findByJobIdAndPhaseAndObjectTypeAndObjectNameAndChunkNumber(
            j.getId(), phase, o.type(), o.name(), 0)
        .orElseGet(
            () -> {
              var c = new JobCheckpoint();
              c.setJob(j);
              c.setPhase(phase);
              c.setObjectType(o.type());
              c.setObjectName(o.name());
              c.setStatus(JobCheckpoint.Status.PENDING);
              return checkpoints.save(c);
            });
  }

  private void generate(
      Connection conn, MigrationJob job, String phase, ObjectRef obj, JobCheckpoint cp, Path dir) {
    cp.setStatus(JobCheckpoint.Status.RUNNING);
    cp.setUpdatedAt(Instant.now());
    checkpoints.save(cp);
    try {
      Path folder = Files.createDirectories(folderFor(dir, phase, obj));
      String sql =
          switch (phase) {
            case "DDL" -> ddl(conn, job.getSourceSchema(), obj);
            case "DML" -> dml(conn, job.getSourceSchema(), obj.name());
            default -> indexes(conn, job.getSourceSchema(), obj.name());
          };
      atomicWrite(folder.resolve(clean(obj.name()) + ".sql"), sql);
      cp.setStatus(JobCheckpoint.Status.COMPLETED);
      cp.setErrorMessage(null);
      job.setCompletedUnits(job.getCompletedUnits() + 1);
    } catch (Exception e) {
      cp.setStatus(JobCheckpoint.Status.FAILED);
      cp.setErrorMessage(safeError(e));
      cp.setRetryCount(cp.getRetryCount() + 1);
      job.setFailedUnits(job.getFailedUnits() + 1);
    }
    cp.setUpdatedAt(Instant.now());
    checkpoints.save(cp);
    jobs.save(job);
  }

  private Path folderFor(Path dir, String phase, ObjectRef obj) {
    if (phase.equals("DML")) return dir.resolve("DML/inserts");
    if (phase.equals("INDEXES")) return dir.resolve("DDL/indexes");
    String child =
        switch (obj.type().toUpperCase(Locale.ROOT)) {
          case "TABLE" -> "tables";
          case "VIEW" -> "views";
          case "SEQUENCE" -> "sequences";
          case "TRIGGER" -> "triggers";
          case "PROCEDURE", "FUNCTION" -> "procedureandfunctions";
          case "SYNONYM" -> "synonyms";
          case "USER", "GRANT" -> "userandgrants";
          case "PARTITION" -> "partitions";
          default -> "other";
        };
    return dir.resolve("DDL").resolve(child);
  }

  private String ddl(Connection c, String schema, ObjectRef o) throws SQLException {
    if (o.type().equals("VIEW"))
      return "-- View definition requires Sybase-specific extraction; manual review required for "
          + q(o.name())
          + ".\n";
    var md = c.getMetaData();
    var cols = new ArrayList<String>();
    try (var rs = md.getColumns(c.getCatalog(), schema, o.name(), "%")) {
      while (rs.next()) {
        String type =
            oracleType(
                rs.getString("TYPE_NAME"), rs.getInt("COLUMN_SIZE"), rs.getInt("DECIMAL_DIGITS"));
        cols.add(
            "  "
                + q(rs.getString("COLUMN_NAME"))
                + " "
                + type
                + (rs.getInt("NULLABLE") == DatabaseMetaData.columnNoNulls ? " NOT NULL" : ""));
      }
    }
    return "-- Idempotency is enforced by the metadata guard in the deployment process.\nCREATE TABLE "
        + q(o.name())
        + " (\n"
        + String.join(",\n", cols)
        + "\n);\n";
  }

  private String indexes(Connection c, String schema, String table) throws SQLException {
    var md = c.getMetaData();
    var grouped = new LinkedHashMap<String, List<String>>();
    var unique = new HashMap<String, Boolean>();
    try (var rs = md.getIndexInfo(c.getCatalog(), schema, table, false, false)) {
      while (rs.next()) {
        var n = rs.getString("INDEX_NAME");
        var col = rs.getString("COLUMN_NAME");
        if (n != null && col != null) {
          grouped.computeIfAbsent(n, x -> new ArrayList<>()).add(q(col));
          unique.put(n, !rs.getBoolean("NON_UNIQUE"));
        }
      }
    }
    var s = new StringBuilder();
    grouped.forEach(
        (n, cols) ->
            s.append("CREATE ")
                .append(unique.get(n) ? "UNIQUE " : "")
                .append("INDEX ")
                .append(q(n))
                .append(" ON ")
                .append(q(table))
                .append(" (")
                .append(String.join(", ", cols))
                .append(");\n"));
    var pk = new ArrayList<String>();
    String pkName = null;
    try (var rs = md.getPrimaryKeys(c.getCatalog(), schema, table)) {
      while (rs.next()) {
        pkName = rs.getString("PK_NAME");
        pk.add(q(rs.getString("COLUMN_NAME")));
      }
    }
    if (!pk.isEmpty())
      s.append("ALTER TABLE ")
          .append(q(table))
          .append(" ADD CONSTRAINT ")
          .append(q(pkName == null ? "PK_" + table : pkName))
          .append(" PRIMARY KEY (")
          .append(String.join(", ", pk))
          .append(");\n");
    try (var rs = md.getImportedKeys(c.getCatalog(), schema, table)) {
      var fks = new LinkedHashMap<String, List<String>>();
      var refs = new HashMap<String, String>();
      var refCols = new HashMap<String, List<String>>();
      while (rs.next()) {
        String n =
            Optional.ofNullable(rs.getString("FK_NAME"))
                .orElse("FK_" + table + "_" + rs.getString("PKTABLE_NAME"));
        fks.computeIfAbsent(n, x -> new ArrayList<>()).add(q(rs.getString("FKCOLUMN_NAME")));
        refCols.computeIfAbsent(n, x -> new ArrayList<>()).add(q(rs.getString("PKCOLUMN_NAME")));
        refs.put(n, rs.getString("PKTABLE_NAME"));
      }
      fks.forEach(
          (n, cols) ->
              s.append("ALTER TABLE ")
                  .append(q(table))
                  .append(" ADD CONSTRAINT ")
                  .append(q(n))
                  .append(" FOREIGN KEY (")
                  .append(String.join(", ", cols))
                  .append(") REFERENCES ")
                  .append(q(refs.get(n)))
                  .append(" (")
                  .append(String.join(", ", refCols.get(n)))
                  .append(");\n"));
    }
    return s.toString();
  }

  private String dml(Connection c, String schema, String table) throws SQLException {
    var sql = "SELECT * FROM " + qSybase(schema) + "." + qSybase(table);
    var out = new StringBuilder("-- Generated INSERT statements\n");
    try (var st = c.createStatement();
        var rs = st.executeQuery(sql)) {
      var md = rs.getMetaData();
      int count = 0;
      while (rs.next()) {
        var vals = new ArrayList<String>();
        for (int i = 1; i <= md.getColumnCount(); i++) vals.add(literal(rs.getObject(i)));
        out.append("INSERT INTO ")
            .append(q(table))
            .append(" VALUES (")
            .append(String.join(",", vals))
            .append(");\n");
        if (++count % 1000 == 0) out.append("COMMIT;\n");
      }
    }
    out.append("COMMIT;\n");
    return out.toString();
  }

  private String literal(Object v) {
    if (v == null) return "NULL";
    if (v instanceof Number) return v.toString();
    if (v instanceof java.sql.Date) return "DATE '" + v + "'";
    if (v instanceof Timestamp) return "TIMESTAMP '" + v + "'";
    if (v instanceof byte[]) return "HEXTORAW('" + HexFormat.of().formatHex((byte[]) v) + "')";
    return "'" + v.toString().replace("'", "''") + "'";
  }

  private String oracleType(String t, int size, int scale) {
    String x = t.toLowerCase(Locale.ROOT);
    if (x.contains("bigint")) return "NUMBER(19)";
    if (x.contains("int")) return "NUMBER(10)";
    if (x.contains("decimal") || x.contains("numeric") || x.contains("money"))
      return "NUMBER(" + Math.min(Math.max(size, 1), 38) + "," + Math.max(scale, 0) + ")";
    if (x.contains("date") || x.contains("time")) return "TIMESTAMP";
    if (x.contains("text")) return "CLOB";
    if (x.contains("image") || x.contains("binary")) return "BLOB";
    if (x.contains("char"))
      return size > 4000 ? "CLOB" : "VARCHAR2(" + Math.max(size, 1) + " CHAR)";
    return "VARCHAR2(4000 CHAR) /* review source type " + t + " */";
  }

  private Path safeJobDirectory(MigrationJob j) throws IOException {
    Path p = root.resolve(clean(j.getName())).normalize();
    if (!p.startsWith(root)) throw new IOException("Unsafe output path");
    if (Files.exists(p) && !j.isOverwrite())
      throw new IOException("Output exists; overwrite confirmation is required");
    return p;
  }

  private void atomicWrite(Path target, String data) throws IOException {
    Path tmp = target.resolveSibling(target.getFileName() + ".tmp");
    Files.writeString(tmp, data, StandardCharsets.UTF_8);
    Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
  }

  private void writeFailures(MigrationJob j) {
    try {
      var failed =
          checkpoints.findByJobIdAndStatusIn(
              j.getId(),
              List.of(JobCheckpoint.Status.FAILED, JobCheckpoint.Status.SKIPPED_DEPENDENCY));
      var entries =
          failed.stream()
              .map(
                  c ->
                      new FailureEntry(
                          c.getUpdatedAt(),
                          j.getId(),
                          c.getPhase(),
                          c.getObjectType(),
                          c.getObjectName(),
                          c.getStatus().name(),
                          c.getErrorMessage(),
                          c.getRetryCount()))
              .toList();
      atomicWrite(
          Path.of(j.getOutputDirectory()).resolve("failure-manifest.json"),
          json.writerWithDefaultPrettyPrinter().writeValueAsString(entries));
    } catch (Exception ignored) {
    }
  }

  private String clean(String n) {
    return n.replaceAll("[^A-Za-z0-9_.-]", "_");
  }

  private String q(String n) {
    return "\"" + n.replace("\"", "\"\"") + "\"";
  }

  private String qSybase(String n) {
    return "[" + n.replace("]", "]]") + "]";
  }

  private String safeError(Exception e) {
    String s = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
    return s.substring(0, Math.min(3900, s.length()));
  }
}
