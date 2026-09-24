package com.oraclemigration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oraclemigration.domain.ConnectionProfile;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.zip.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Runs SAP's native utility without a shell or passwords in process arguments. */
@Component
public class SybaseDdlExporter {
  private static final Logger log = LoggerFactory.getLogger(SybaseDdlExporter.class);
  private final String classpath;
  private final String javaExecutable;
  private final long timeout;

  public SybaseDdlExporter(
      @Value("${app.sybase-ddlgen-classpath:}") String classpath,
      @Value("${app.sybase-ddlgen-java:}") String javaExecutable,
      @Value("${app.sybase-ddlgen-timeout-seconds:1800}") long timeout) {
    this.classpath = classpath;
    this.javaExecutable =
        javaExecutable.isBlank()
            ? Path.of(System.getProperty("java.home"), "bin", "java").toString()
            : javaExecutable;
    this.timeout = timeout;
  }

  public void validate(ConnectionProfile profile) {
    if (classpath.isBlank())
      throw new IllegalArgumentException(
          "Configure SYBASE_DDLGEN_CLASSPATH with the licensed SAP ddlgen libraries on the backend"
              + " host.");
    if (profile.isTlsEnabled()
        || profile.getAuthType() != ConnectionProfile.AuthType.DB_SECRET
        || (profile.getJdbcParameters() != null && !profile.getJdbcParameters().isBlank()))
      throw new IllegalArgumentException(
          "Native export currently supports password connections without TLS or custom JDBC"
              + " parameters. These settings cannot be silently omitted by ddlgen.");
    if (profile.getUsername() == null || profile.getUsername().isBlank())
      throw new IllegalArgumentException("A database username is required.");
    if (profile.getHost() == null
        || !profile.getHost().matches("[A-Za-z0-9._-]+")
        || profile.getPort() == null
        || profile.getPort() < 1
        || profile.getPort() > 65535)
      throw new IllegalArgumentException(
          "Native export requires a hostname or IPv4 address and valid port.");
    if (profile.getDatabaseName() == null
        || !profile.getDatabaseName().matches("[A-Za-z_][A-Za-z0-9_$#]*"))
      throw new IllegalArgumentException(
          "Native export requires a literal database name using letters, digits, _, $, or #;"
              + " patterns are not supported.");
  }

  public record SourceObject(long id, String type, String name, String owner) {}

  public record ScriptResult(
      String type, String name, String owner, String status, String file, String message) {}

  public record ExportResult(List<ScriptResult> objects) {
    public boolean requiresReview() {
      return objects.stream().anyMatch(o -> !o.status().equals("EXPORTED"));
    }
  }

  public static void validateSchema(String schema) {
    if (schema == null || !schema.matches("[A-Za-z_][A-Za-z0-9_$#]*"))
      throw new IllegalArgumentException(
          "Set one literal source schema/owner in Build Migrations. Blank names, patterns and"
              + " multiple schemas are not supported.");
  }

  static List<SourceObject> discover(Connection connection, String schema) throws SQLException {
    validateSchema(schema);
    var objects = new ArrayList<SourceObject>();
    try (var statement =
        connection.prepareStatement(
            "SELECT o.id, o.type, o.name, u.name FROM sysobjects o JOIN sysusers u ON o.uid=u.uid"
                + " WHERE u.name=? AND o.type NOT IN ('S','L') ORDER BY o.type, o.name")) {
      statement.setString(1, schema);
      try (var rows = statement.executeQuery()) {
        while (rows.next()) {
          String owner = rows.getString(4);
          // An exact check also prevents case-insensitive catalog matching from broadening scope.
          if (!schema.equals(owner)) continue;
          objects.add(
              new SourceObject(
                  rows.getLong(1), rows.getString(2).trim(), rows.getString(3), owner));
        }
      }
    }
    if (objects.isEmpty())
      throw new IllegalArgumentException(
          "No visible objects were found for the selected schema/owner. Check its exact spelling"
              + " and permissions; export will not fall back to the full database.");
    return objects;
  }

  private static String folder(String type) {
    return switch (type) {
      case "U" -> "tables";
      case "V" -> "views";
      case "P", "XP" -> "procedures";
      case "TR" -> "triggers";
      case "F" -> "functions";
      case "D" -> "defaults";
      case "R" -> "rules";
      default -> null;
    };
  }

  List<String> command(
      ConnectionProfile p, String schema, SourceObject object, Path sql, Path errors) {
    validateSchema(schema);
    if (!schema.equals(object.owner()))
      throw new IllegalArgumentException("Object owner does not match the selected source schema.");
    if (folder(object.type()) == null || !object.name().matches("[A-Za-z_][A-Za-z0-9_$#]*"))
      throw new IllegalArgumentException("This object type or identifier needs manual extraction.");
    var args =
        new ArrayList<>(
            List.of(
                javaExecutable,
                "-cp",
                classpath,
                "com.sybase.ddlgen.DDLGenerator",
                "-U" + p.getUsername(),
                "-Pext",
                "-S" + p.getHost() + ":" + p.getPort(),
                "-D" + p.getDatabaseName(),
                "-T" + object.type(),
                "-N" + schema + "." + object.name(),
                "-O" + sql.toAbsolutePath(),
                "-E" + errors.toAbsolutePath()));
    // Triggers are exported separately for the selected owner; retain table indexes/constraints.
    if (object.type().equals("U")) args.add("-FTR");
    return args;
  }

  public ExportResult export(
      ConnectionProfile profile,
      String schema,
      String secret,
      Path directory,
      List<SourceObject> objects)
      throws Exception {
    validate(profile);
    validateSchema(schema);
    if (objects.isEmpty() || objects.stream().anyMatch(o -> !schema.equals(o.owner())))
      throw new IllegalArgumentException(
          "Export requires objects belonging only to the selected schema.");
    if (secret == null || secret.contains("\n") || secret.contains("\r"))
      throw new IllegalArgumentException(
          "Enter a database password without line breaks for native export.");
    var results = new ArrayList<ScriptResult>();
    for (var object : objects) {
      String folder = folder(object.type());
      if (folder == null || !object.name().matches("[A-Za-z_][A-Za-z0-9_$#]*")) {
        results.add(
            new ScriptResult(
                object.type(),
                object.name(),
                object.owner(),
                "MANUAL_REVIEW",
                null,
                "No standalone extraction for this type/identifier. Table components may be"
                    + " included in their table script; review other objects manually."));
        continue;
      }
      String relative = schema + "/" + folder + "/" + object.id() + "_" + object.name() + ".sql";
      Path output = directory.resolve(relative);
      Files.createDirectories(output.getParent());
      try {
        boolean diagnostics = exportObject(profile, schema, secret, object, output);
        results.add(
            new ScriptResult(
                object.type(),
                object.name(),
                object.owner(),
                diagnostics ? "REVIEW_REQUIRED" : "EXPORTED",
                relative,
                diagnostics
                    ? "SAP utility diagnostics require DBA review. See " + relative + ".ddlgen.log."
                    : "Native definition exported; validate dependencies before replay."));
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw e;
      } catch (Exception e) {
        String detail = redact(e.getClass().getSimpleName() + ": " + e.getMessage(), secret);
        String diagnostic = readDiagnostic(diagnosticFile(output), secret);
        if (!diagnostic.isBlank()) detail += " | " + diagnostic;
        log.error(
            "DDL export failed for {}.{}.{}: {}",
            profile.getDatabaseName(),
            schema,
            object.name(),
            detail);
        results.add(
            new ScriptResult(
                object.type(),
                object.name(),
                object.owner(),
                "FAILED",
                null,
                "Extraction failed: " + detail));
      }
    }
    var result = new ExportResult(List.copyOf(results));
    packageExport(directory, schema, objects, result);
    return result;
  }

  public void packageExport(
      Path directory, String schema, List<SourceObject> objects, ExportResult result)
      throws IOException {
    Path inventory = directory.resolve("objects.json");
    new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(inventory.toFile(), result);
    Path archive = directory.resolve("schema.zip.partial");
    try (var zip = new ZipOutputStream(Files.newOutputStream(archive))) {
      zip.putNextEntry(new ZipEntry("objects.json"));
      Files.copy(inventory, zip);
      zip.closeEntry();
      for (var script : result.objects()) {
        if (script.file() == null) continue;
        zip.putNextEntry(new ZipEntry(script.file()));
        Files.copy(directory.resolve(script.file()), zip);
        zip.closeEntry();
      }
      for (var object : objects) {
        String folder = folder(object.type());
        if (folder == null || !object.name().matches("[A-Za-z_][A-Za-z0-9_$#]*")) continue;
        Path diagnostic =
            diagnosticFile(
                directory.resolve(
                    schema + "/" + folder + "/" + object.id() + "_" + object.name() + ".sql"));
        if (!Files.isRegularFile(diagnostic)) continue;
        zip.putNextEntry(
            new ZipEntry(directory.relativize(diagnostic).toString().replace('\\', '/')));
        Files.copy(diagnostic, zip);
        zip.closeEntry();
      }
    }
    Files.move(
        archive,
        directory.resolve("schema.zip"),
        StandardCopyOption.ATOMIC_MOVE,
        StandardCopyOption.REPLACE_EXISTING);
  }

  boolean exportObject(
      ConnectionProfile profile, String schema, String secret, SourceObject object, Path output)
      throws Exception {
    Path sql = output.resolveSibling(output.getFileName() + ".partial");
    Path errors = output.resolveSibling(output.getFileName() + ".diagnostics.partial");
    Path console = output.resolveSibling(output.getFileName() + ".console.partial");
    Process process = null;
    try {
      process = startProcess(command(profile, schema, object, sql, errors), console);
      IOException inputFailure = null;
      try (var input = process.getOutputStream()) {
        input.write((secret + System.lineSeparator()).getBytes(StandardCharsets.UTF_8));
      } catch (IOException e) {
        // An early JVM/utility exit may close stdin; still collect its exit code and output.
        inputFailure = e;
      }
      if (!process.waitFor(timeout, TimeUnit.SECONDS))
        throw new IOException("SAP ddlgen timed out after " + timeout + " seconds.");
      if (process.exitValue() != 0 || !Files.isRegularFile(sql) || Files.size(sql) == 0)
        throw new IOException(
            "SAP ddlgen exit code "
                + process.exitValue()
                + "; "
                + (Files.isRegularFile(sql) && Files.size(sql) > 0
                    ? "utility reported failure"
                    : "no non-empty SQL file was produced")
                + ".");
      if (inputFailure != null)
        throw new IOException("Could not supply the ddlgen password on stdin.");
      boolean diagnostics = Files.exists(errors) && Files.size(errors) > 0;
      Files.move(sql, output, StandardCopyOption.ATOMIC_MOVE);
      return diagnostics;
    } finally {
      if (process != null && process.isAlive()) {
        process.descendants().forEach(ProcessHandle::destroyForcibly);
        process.destroyForcibly();
        process.waitFor(5, TimeUnit.SECONDS);
      }
      String diagnostic = readDiagnostic(console, secret);
      String utilityErrors = readDiagnostic(errors, secret);
      if (!utilityErrors.isBlank()) diagnostic += "\nSAP ddlgen error output:\n" + utilityErrors;
      if (!diagnostic.isBlank()) Files.writeString(diagnosticFile(output), diagnostic);
      Files.deleteIfExists(console);
      Files.deleteIfExists(errors);
    }
  }

  private static Path diagnosticFile(Path output) {
    return output.resolveSibling(output.getFileName() + ".ddlgen.log");
  }

  Process startProcess(List<String> args, Path console) throws IOException {
    return new ProcessBuilder(args)
        .redirectErrorStream(true)
        .redirectOutput(console.toFile())
        .start();
  }

  static String redact(String text, String secret) {
    return secret == null || secret.isEmpty() ? text : text.replace(secret, "[REDACTED]");
  }

  private static String readDiagnostic(Path path, String secret) throws IOException {
    if (!Files.isRegularFile(path)) return "";
    // Bound report size, retaining overlap so a password crossing the cutoff is redacted.
    int limit = 16384;
    int overlap = secret == null ? 0 : secret.getBytes(StandardCharsets.UTF_8).length;
    try (var input = Files.newInputStream(path)) {
      String text =
          redact(new String(input.readNBytes(limit + overlap), StandardCharsets.UTF_8), secret);
      return text.length() > limit ? text.substring(0, limit) + "\n[truncated]" : text;
    }
  }
}
