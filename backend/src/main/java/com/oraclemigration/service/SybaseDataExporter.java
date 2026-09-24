package com.oraclemigration.service;

import com.oraclemigration.domain.ConnectionProfile;
import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Exports source rows as ASE SQL. Does not execute INSERTs against either database. */
@Component
public class SybaseDataExporter {
  private static final Logger log = LoggerFactory.getLogger(SybaseDataExporter.class);
  private static final int MAX_LITERAL_BYTES = 16384;
  private final DatabaseAccess db;
  private final int rowsPerFile;

  public SybaseDataExporter(
      DatabaseAccess db, @Value("${app.dml-chunk-size:10000}") int rowsPerFile) {
    if (rowsPerFile < 1) throw new IllegalArgumentException("DML chunk size must be positive.");
    this.db = db;
    this.rowsPerFile = rowsPerFile;
  }

  record Column(String name, boolean identity, String type) {}

  public List<SybaseDdlExporter.ScriptResult> export(
      ConnectionProfile profile,
      String schema,
      Path directory,
      List<SybaseDdlExporter.SourceObject> objects)
      throws IOException {
    SybaseDdlExporter.validateSchema(schema);
    if (objects.stream().anyMatch(o -> !schema.equals(o.owner())))
      throw new IllegalArgumentException(
          "Data export requires objects belonging to the selected schema.");
    var results = new ArrayList<SybaseDdlExporter.ScriptResult>();
    for (var table : objects) {
      if (!table.type().equals("U")) continue;
      if (!table.name().matches("[A-Za-z_][A-Za-z0-9_$#]*")) {
        results.add(
            result(
                table,
                "MANUAL_REVIEW",
                null,
                "This table identifier requires manual data export."));
        continue;
      }
      Path data = directory.resolve(schema).resolve("data");
      Files.createDirectories(data);
      Path staging = Files.createTempDirectory(data, "." + table.id() + "-");
      var published = new ArrayList<Path>();
      try {
        List<SybaseDdlExporter.ScriptResult> tableResults;
        try (var connection = db.open(profile)) {
          tableResults = exportTable(connection, schema, table, staging);
        }
        for (var part : tableResults) {
          Path target = data.resolve(part.file());
          Files.move(staging.resolve(part.file()), target, StandardCopyOption.ATOMIC_MOVE);
          published.add(target);
        }
        for (var part : tableResults)
          results.add(result(table, "EXPORTED", schema + "/data/" + part.file(), part.message()));
      } catch (Exception e) {
        // A failed table must not leave apparently complete, replayable chunks behind.
        for (Path path : published) Files.deleteIfExists(path);
        String detail =
            e instanceof UnsupportedDataException
                ? e.getMessage()
                : e instanceof SQLException sql
                    ? "Database read failed (SQLState="
                        + sql.getSQLState()
                        + ", vendorCode="
                        + sql.getErrorCode()
                        + "). Check SELECT permissions and the server log."
                    : "Data export failed ("
                        + e.getClass().getSimpleName()
                        + "). Check backend storage and connectivity.";
        log.error(
            "Data export failed for {}.{}.{}: {}",
            profile.getDatabaseName(),
            schema,
            table.name(),
            detail);
        results.add(
            result(
                table,
                e instanceof UnsupportedDataException ? "MANUAL_REVIEW" : "FAILED",
                null,
                detail));
      } finally {
        try (var files = Files.list(staging)) {
          for (Path path : files.toList()) Files.deleteIfExists(path);
        }
        Files.deleteIfExists(staging);
      }
    }
    return List.copyOf(results);
  }

  private static SybaseDdlExporter.ScriptResult result(
      SybaseDdlExporter.SourceObject table, String status, String file, String message) {
    return new SybaseDdlExporter.ScriptResult(
        "DATA", table.name(), table.owner(), status, file, message);
  }

  List<SybaseDdlExporter.ScriptResult> exportTable(
      Connection connection, String schema, SybaseDdlExporter.SourceObject table, Path staging)
      throws Exception {
    var columns = new ArrayList<Column>();
    int omitted = 0;
    try (var query =
        connection.prepareStatement(
            "SELECT c.name, c.status, c.status2, t.name FROM syscolumns c "
                + "JOIN systypes t ON c.usertype=t.usertype WHERE c.id=? ORDER BY c.colid")) {
      query.setLong(1, table.id());
      try (var rows = query.executeQuery()) {
        while (rows.next()) {
          String type = rows.getString(4).toLowerCase(Locale.ROOT).trim();
          int flags = rows.getInt(3);
          if ((flags & 16) != 0 || type.equals("timestamp")) {
            omitted++;
            continue;
          }
          if ((flags & 128) != 0)
            throw new UnsupportedDataException(
                "Encrypted columns require a DBA-managed data export.");
          columns.add(new Column(rows.getString(1), (rows.getInt(2) & 128) != 0, type));
        }
      }
    }
    if (columns.isEmpty())
      throw new UnsupportedDataException("No insertable columns are visible for this table.");
    String qualified = quote(schema) + "." + quote(table.name());
    String names = columns.stream().map(c -> quote(c.name())).collect(Collectors.joining(", "));
    boolean identity = columns.stream().anyMatch(Column::identity);
    // SET affects only this export session. Avoid the server's default text/image truncation.
    try (var settings = connection.createStatement()) {
      settings.execute("SET QUOTED_IDENTIFIER ON");
      settings.execute("SET TEXTSIZE 2147483647");
    }
    var parts = new ArrayList<SybaseDdlExporter.ScriptResult>();
    try (var statement =
        connection.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)) {
      statement.setFetchSize(Math.min(rowsPerFile, 1000));
      try (var rows = statement.executeQuery("SELECT " + names + " FROM " + qualified)) {
        var metadata = rows.getMetaData();
        boolean available = rows.next();
        int number = 0;
        do {
          String file =
              table.id()
                  + "_"
                  + table.name()
                  + "_data_"
                  + String.format(Locale.ROOT, "%03d", ++number)
                  + ".sql";
          int count = 0;
          try (var writer =
              Files.newBufferedWriter(staging.resolve(file), StandardCharsets.UTF_8)) {
            writer.write(
                "-- ASE source data. Load into an empty matching table after reviewing constraints"
                    + " and triggers.\n"
                    + "-- Export is not a database-wide consistent snapshot.\n"
                    + "SET QUOTED_IDENTIFIER ON\n"
                    + "go\n");
            if (omitted > 0)
              writer.write(
                  "-- Omitted "
                      + omitted
                      + " computed/timestamp column(s); ASE regenerates them.\n");
            if (identity) writer.write("SET IDENTITY_INSERT " + qualified + " ON\ngo\n");
            while (available && count < rowsPerFile) {
              var values = new ArrayList<String>();
              for (int i = 0; i < columns.size(); i++)
                values.add(literal(rows, metadata, i + 1, columns.get(i)));
              String insert =
                  "INSERT INTO "
                      + qualified
                      + " ("
                      + names
                      + ") VALUES ("
                      + String.join(", ", values)
                      + ");\ngo\n";
              if (insert.length() > 60000)
                throw new UnsupportedDataException(
                    "A row exceeds the supported SQL statement size; use a DBA-managed bulk"
                        + " export.");
              writer.write(insert);
              count++;
              available = rows.next();
            }
            if (identity) writer.write("SET IDENTITY_INSERT " + qualified + " OFF\ngo\n");
            writer.write("-- Exported rows in this file: " + count + "\n");
          }
          parts.add(
              result(
                  table,
                  "EXPORTED",
                  file,
                  "Exported "
                      + count
                      + " rows; "
                      + omitted
                      + " computed/timestamp columns omitted. Source ASE syntax; review replay"
                      + " order."));
        } while (available);
      }
    }
    return parts;
  }

  private static String quote(String identifier) {
    return "\"" + identifier.replace("\"", "\"\"") + "\"";
  }

  private static String literal(
      ResultSet rows, ResultSetMetaData metadata, int index, Column column)
      throws SQLException, IOException {
    int type = metadata.getColumnType(index);
    if (Set.of("time", "bigtime").contains(column.type())) {
      String value = rows.getString(index);
      if (value == null) return "NULL";
      if (!value.matches("[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,6})?"))
        throw new UnsupportedDataException(
            "The driver returned an unsupported time representation.");
      return "CONVERT(" + column.type() + ", '" + value + "')";
    }
    switch (type) {
      case Types.CHAR,
          Types.VARCHAR,
          Types.LONGVARCHAR,
          Types.NCHAR,
          Types.NVARCHAR,
          Types.LONGNVARCHAR,
          Types.CLOB,
          Types.NCLOB:
        {
          try (Reader reader = rows.getCharacterStream(index)) {
            if (reader == null) return "NULL";
            var buffer = new char[MAX_LITERAL_BYTES + 1];
            int size = 0, n;
            while (size < buffer.length
                && (n = reader.read(buffer, size, buffer.length - size)) != -1) size += n;
            String value = new String(buffer, 0, size);
            if (size > MAX_LITERAL_BYTES
                || value.getBytes(StandardCharsets.UTF_8).length > MAX_LITERAL_BYTES
                || (column.type().startsWith("uni") && size * 2 > MAX_LITERAL_BYTES))
              throw new UnsupportedDataException(
                  "A text value exceeds 16 KB; use a DBA-managed LOB/bulk export. No data was"
                      + " truncated.");
            return stringLiteral(value);
          }
        }
      case Types.BINARY, Types.VARBINARY, Types.LONGVARBINARY, Types.BLOB:
        {
          try (InputStream input = rows.getBinaryStream(index)) {
            if (input == null) return "NULL";
            byte[] bytes = input.readNBytes(MAX_LITERAL_BYTES + 1);
            if (bytes.length > MAX_LITERAL_BYTES)
              throw new UnsupportedDataException(
                  "A binary value exceeds 16 KB; use a DBA-managed LOB/bulk export. No data was"
                      + " truncated.");
            return "0x" + HexFormat.of().formatHex(bytes);
          }
        }
      case Types.BIT, Types.BOOLEAN:
        {
          boolean value = rows.getBoolean(index);
          return rows.wasNull() ? "NULL" : value ? "1" : "0";
        }
      case Types.TINYINT, Types.SMALLINT, Types.INTEGER, Types.BIGINT, Types.NUMERIC, Types.DECIMAL:
        {
          BigDecimal value = rows.getBigDecimal(index);
          return value == null ? "NULL" : value.toPlainString();
        }
      case Types.REAL, Types.FLOAT, Types.DOUBLE:
        {
          double value = rows.getDouble(index);
          if (rows.wasNull()) return "NULL";
          if (!Double.isFinite(value))
            throw new UnsupportedDataException("Non-finite numeric values require manual export.");
          return Double.toString(value);
        }
      case Types.DATE:
        {
          java.sql.Date value = rows.getDate(index);
          return value == null
              ? "NULL"
              : "CONVERT(date, '"
                  + value.toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE)
                  + "', 112)";
        }
      case Types.TIMESTAMP:
        {
          Timestamp value = rows.getTimestamp(index);
          if (value == null) return "NULL";
          String target =
              Set.of("datetime", "smalldatetime", "bigdatetime").contains(column.type())
                  ? column.type()
                  : "bigdatetime";
          return "CONVERT("
              + target
              + ", '"
              + value
                  .toLocalDateTime()
                  .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS", Locale.ROOT))
              + "', 121)";
        }
      default:
        throw new UnsupportedDataException(
            "Unsupported JDBC column type " + type + "; manual data export required.");
    }
  }

  static String stringLiteral(String value) {
    // Escape backslashes and controls so embedded newlines/GO cannot become isql batch separators.
    var out = new StringBuilder("U&'");
    value
        .codePoints()
        .forEach(
            c -> {
              if (c == '\'') out.append("''");
              else if (c == '\\') out.append("\\\\");
              else if (c >= 32 && c < 127) out.append((char) c);
              else
                out.append(
                    c <= 0xffff
                        ? String.format(Locale.ROOT, "\\%04x", c)
                        : String.format(Locale.ROOT, "\\+%06x", c));
            });
    return out.append("'").toString();
  }

  private static class UnsupportedDataException extends IOException {
    UnsupportedDataException(String message) {
      super(message);
    }
  }
}
