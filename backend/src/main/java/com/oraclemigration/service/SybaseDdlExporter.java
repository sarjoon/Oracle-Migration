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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Runs SAP's native utility without a shell or passwords in process arguments. */
@Component
public class SybaseDdlExporter {
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
          "Configure SYBASE_DDLGEN_CLASSPATH with the licensed SAP ddlgen libraries on the backend host.");
    if (profile.isTlsEnabled()
        || profile.getAuthType() != ConnectionProfile.AuthType.DB_SECRET
        || (profile.getJdbcParameters() != null && !profile.getJdbcParameters().isBlank()))
      throw new IllegalArgumentException(
          "Native export currently supports password connections without TLS or custom JDBC parameters. These settings cannot be silently omitted by ddlgen.");
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
          "Native export requires a literal database name using letters, digits, _, $, or #; patterns are not supported.");
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
          "Set one literal source schema/owner in Build Migrations. Blank names, patterns and multiple schemas are not supported.");
  }

  static List<SourceObject> discover(Connection connection, String schema) throws SQLException {
    validateSchema(schema);
    var objects = new ArrayList<SourceObject>();
    try (var statement =
        connection.prepareStatement(
            "SELECT o.id, o.type, o.name, u.name FROM sysobjects o JOIN sysusers u ON o.uid=u.uid WHERE u.name=? AND o.type NOT IN ('S','L') ORDER BY o.type, o.name")) {
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
          "No visible objects were found for the selected schema/owner. Check its exact spelling and permissions; export will not fall back to the full database.");
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
                "No standalone extraction for this type/identifier. Table components may be included in their table script; review other objects manually."));
        continue;
      }
      String relative =
          "schemas/" + schema + "/" + folder + "/" + object.id() + "_" + object.name() + ".sql";
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
                    ? "SAP utility diagnostics require DBA review."
                    : "Native definition exported; validate dependencies before replay."));
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw e;
      } catch (Exception e) {
        results.add(
            new ScriptResult(
                object.type(),
                object.name(),
                object.owner(),
                "FAILED",
                null,
                "Extraction failed. Check utility compatibility, visibility and permissions."));
      }
    }
    var result = new ExportResult(List.copyOf(results));
    Path inventory = directory.resolve("objects.json");
    new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(inventory.toFile(), result);
    Path archive = directory.resolve("schema.zip.partial");
    try (var zip = new ZipOutputStream(Files.newOutputStream(archive))) {
      zip.putNextEntry(new ZipEntry("objects.json"));
      Files.copy(inventory, zip);
      zip.closeEntry();
      for (var script : results) {
        if (script.file() == null) continue;
        zip.putNextEntry(new ZipEntry(script.file()));
        Files.copy(directory.resolve(script.file()), zip);
        zip.closeEntry();
      }
    }
    Files.move(archive, directory.resolve("schema.zip"), StandardCopyOption.ATOMIC_MOVE);
    return result;
  }

  boolean exportObject(
      ConnectionProfile profile, String schema, String secret, SourceObject object, Path output)
      throws Exception {
    Path sql = output.resolveSibling(output.getFileName() + ".partial");
    Path errors = output.resolveSibling(output.getFileName() + ".diagnostics.partial");
    Process process =
        new ProcessBuilder(command(profile, schema, object, sql, errors))
            .redirectOutput(ProcessBuilder.Redirect.DISCARD)
            .redirectError(ProcessBuilder.Redirect.DISCARD)
            .start();
    try {
      try (var input = process.getOutputStream()) {
        input.write((secret + System.lineSeparator()).getBytes(StandardCharsets.UTF_8));
      }
      if (!process.waitFor(timeout, TimeUnit.SECONDS))
        throw new IOException("Native object export timed out.");
      if (process.exitValue() != 0 || !Files.isRegularFile(sql) || Files.size(sql) == 0)
        throw new IOException("SAP ddlgen did not produce a successful object export.");
      boolean diagnostics = Files.exists(errors) && Files.size(errors) > 0;
      Files.move(sql, output, StandardCopyOption.ATOMIC_MOVE);
      return diagnostics;
    } finally {
      if (process.isAlive()) {
        process.descendants().forEach(ProcessHandle::destroyForcibly);
        process.destroyForcibly();
      }
      Files.deleteIfExists(errors);
    }
  }
}
