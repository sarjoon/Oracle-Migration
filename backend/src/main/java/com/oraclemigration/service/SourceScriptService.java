package com.oraclemigration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oraclemigration.domain.ConnectionProfile;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.nio.file.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SourceScriptService {
  public record ExportReport(
      String id,
      String name,
      String databaseType,
      String configuredVersion,
      String detectedVersion,
      String databaseName,
      String schemaName,
      List<SybaseDdlExporter.ScriptResult> objects,
      String status,
      Instant createdAt,
      String outputDirectory,
      String message) {}

  private final ObjectMapper json;
  private final DatabaseAccess db;
  private final SecretVault vault;
  private final SybaseDdlExporter exporter;
  private final SybaseDataExporter dataExporter;
  private final Path root;

  public SourceScriptService(
      ObjectMapper json,
      DatabaseAccess db,
      SecretVault vault,
      SybaseDdlExporter exporter,
      SybaseDataExporter dataExporter,
      @Value("${app.source-script-directory:}") String configured) {
    this.json = json;
    this.db = db;
    this.vault = vault;
    this.exporter = exporter;
    this.dataExporter = dataExporter;
    root =
        configured.isBlank()
            ? jarHome().resolve("dbscripts/source")
            : Path.of(configured).toAbsolutePath().normalize();
  }

  static Path jarHome() {
    try {
      String location =
          SourceScriptService.class.getProtectionDomain().getCodeSource().getLocation().toString();
      if (location.startsWith("jar:nested:"))
        location = "file:" + location.substring(11).split("/!", 2)[0];
      else if (location.startsWith("jar:")) location = location.substring(4).split("!", 2)[0];
      Path path = location.startsWith("file:") ? Path.of(URI.create(location)) : Path.of(location);
      if (Files.isRegularFile(path)) return path.toAbsolutePath().getParent();
    } catch (Exception ignored) {
    }
    return Path.of(System.getProperty("user.dir")).toAbsolutePath();
  }

  @PostConstruct
  void recover() throws IOException {
    Files.createDirectories(root);
    for (var report : list())
      if (Set.of("QUEUED", "RUNNING").contains(report.status()))
        write(
            update(
                report,
                "INTERRUPTED",
                report.detectedVersion(),
                "Backend restarted; start a new export."));
  }

  public ExportReport create(ConnectionProfile p, String name, String schema) throws Exception {
    if (p.getDatabaseType() != ConnectionProfile.DatabaseType.SYBASE_ASE)
      throw new IllegalArgumentException(
          "Native source export currently supports Sybase ASE only.");
    versionFamily(p.getDatabaseVersion());
    SybaseDdlExporter.validateSchema(schema);
    if (!db.schemas(p).contains(schema))
      throw new IllegalArgumentException("Select a schema available in the source database.");
    exporter.validate(p);
    var secret = vault.require(p.getId()).databaseSecret();
    if (secret == null || secret.contains("\n") || secret.contains("\r"))
      throw new IllegalArgumentException("Enter database credentials before generating scripts.");
    String id = UUID.randomUUID().toString();
    String database = p.getDatabaseName();
    if (database == null || !database.matches("[A-Za-z_][A-Za-z0-9_$#]*"))
      throw new IllegalArgumentException(
          "A literal database name is required for the export folder.");
    Path parent = root.resolve(database);
    Files.createDirectories(parent);
    Path dir =
        parent.resolve(LocalDateTime.now().format(DateTimeFormatter.ofPattern("ddMMyyyyHHmmss")));
    try {
      Files.createDirectory(dir);
    } catch (FileAlreadyExistsException e) {
      throw new IllegalArgumentException(
          "An export for this database already exists for this second. Retry after one second.");
    }
    var report =
        new ExportReport(
            id,
            name,
            p.getDatabaseType().name(),
            p.getDatabaseVersion(),
            null,
            p.getDatabaseName(),
            schema,
            List.of(),
            "QUEUED",
            Instant.now(),
            dir.toString(),
            "DDL and table data export for the selected schema only.");
    write(report);
    return report;
  }

  static String versionFamily(String version) {
    var matcher =
        Pattern.compile("^(15\\.7|16\\.[01])(?:$|[^0-9].*)")
            .matcher(version == null ? "" : version.trim());
    if (!matcher.matches())
      throw new IllegalArgumentException(
          "Native export supports ASE version families 15.7, 16.0 and 16.1. Enter the installed"
              + " version, for example 16.0 SP03.");
    return matcher.group(1);
  }

  @Async("migrationExecutor")
  public void generate(String id, ConnectionProfile p) {
    ExportReport report = null;
    try {
      report = get(id);
      write(update(report, "RUNNING", null, "Checking the source database version."));
      List<SybaseDdlExporter.SourceObject> objects;
      try (var connection = db.open(p)) {
        var metadata = connection.getMetaData();
        String product = metadata.getDatabaseProductName();
        String detected = metadata.getDatabaseProductVersion();
        report = update(report, "RUNNING", detected, "Checking the source database version.");
        if (product == null
            || !(product.toLowerCase(Locale.ROOT).contains("adaptive server")
                || product.toLowerCase(Locale.ROOT).contains("sybase")))
          throw new IllegalArgumentException("The connected database is not Sybase ASE.");
        if (detected == null
            || !Pattern.compile(
                    "(?<![0-9])"
                        + Pattern.quote(versionFamily(report.configuredVersion()))
                        + "(?![0-9])")
                .matcher(detected)
                .find())
          throw new IllegalArgumentException(
              "Configured ASE version family does not match the connected database. Update the DB"
                  + " configuration.");
        objects = SybaseDdlExporter.discover(connection, report.schemaName());
        report =
            update(
                report,
                "RUNNING",
                detected,
                "SAP ddlgen is extracting objects from the selected schema only.");
        write(report);
      }
      var result =
          exporter.export(
              p,
              report.schemaName(),
              vault.require(p.getId()).databaseSecret(),
              directory(id),
              objects);
      report =
          update(
              report,
              "RUNNING",
              report.detectedVersion(),
              "Exporting table data as ASE INSERT scripts.");
      write(report);
      var combined = new ArrayList<>(result.objects());
      combined.addAll(dataExporter.export(p, report.schemaName(), directory(id), objects));
      result = new SybaseDdlExporter.ExportResult(List.copyOf(combined));
      exporter.packageExport(directory(id), report.schemaName(), objects, result);
      report =
          new ExportReport(
              report.id(),
              report.name(),
              report.databaseType(),
              report.configuredVersion(),
              report.detectedVersion(),
              report.databaseName(),
              report.schemaName(),
              result.objects(),
              report.status(),
              report.createdAt(),
              report.outputDirectory(),
              report.message());
      boolean diagnostics = result.requiresReview();
      write(
          update(
              report,
              diagnostics ? "REVIEW_REQUIRED" : "EXPORTED",
              report.detectedVersion(),
              diagnostics
                  ? "Some schema objects or data exports failed or require manual review. See the"
                      + " per-object manifest."
                  : "DDL and table data exported. Review constraints, triggers and replay order"
                      + " with a DBA. Data is not a database-wide consistent snapshot."));
    } catch (Exception e) {
      if (report != null) {
        try {
          String message =
              e instanceof IllegalArgumentException
                  ? e.getMessage()
                  : "Export failed. Check credentials, connectivity, SAP libraries, permissions and"
                      + " backend output-directory access.";
          write(update(report, "FAILED", report.detectedVersion(), message));
        } catch (IOException ignored) {
        }
      }
    }
  }

  private ExportReport update(ExportReport r, String status, String detected, String message) {
    return new ExportReport(
        r.id(),
        r.name(),
        r.databaseType(),
        r.configuredVersion(),
        detected,
        r.databaseName(),
        r.schemaName(),
        r.objects(),
        status,
        r.createdAt(),
        r.outputDirectory(),
        message);
  }

  private Path directory(String id) throws IOException {
    if (id == null || !id.matches("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"))
      throw new IllegalArgumentException("Invalid export identifier.");
    Path legacy = root.resolve(id);
    if (Files.isRegularFile(legacy.resolve("manifest.json"))) return legacy;
    for (Path manifest : manifests()) {
      try {
        if (id.equals(json.readValue(manifest.toFile(), ExportReport.class).id()))
          return manifest.getParent();
      } catch (IOException ignored) {
      }
    }
    throw new NoSuchFileException("Export not found: " + id);
  }

  private List<Path> manifests() throws IOException {
    if (!Files.exists(root)) return List.of();
    try (var paths = Files.walk(root, 3)) {
      return paths
          .filter(p -> p.getFileName().toString().equals("manifest.json"))
          .filter(p -> Files.isRegularFile(p, LinkOption.NOFOLLOW_LINKS))
          .toList();
    }
  }

  public ExportReport get(String id) throws IOException {
    return json.readValue(directory(id).resolve("manifest.json").toFile(), ExportReport.class);
  }

  public List<ExportReport> list() throws IOException {
    var reports = new ArrayList<ExportReport>();
    for (var manifest : manifests()) {
      try {
        reports.add(json.readValue(manifest.toFile(), ExportReport.class));
      } catch (IOException | IllegalArgumentException ignored) {
      }
    }
    reports.sort(Comparator.comparing(ExportReport::createdAt).reversed());
    return reports;
  }

  public Path download(String id, String file) throws IOException {
    var report = get(id);
    if (!file.equals("manifest.json")
        && !Set.of("EXPORTED", "REVIEW_REQUIRED").contains(report.status()))
      throw new IllegalArgumentException("SQL is available only after extraction finishes.");
    if (!Set.of("manifest.json", "schema.zip", "database.sql").contains(file))
      throw new IllegalArgumentException("Unknown export file.");
    if ((file.equals("database.sql") && report.schemaName() != null)
        || (file.equals("schema.zip") && report.schemaName() == null))
      throw new IllegalArgumentException("This file is not available for this export.");
    return directory(id).resolve(file);
  }

  private void write(ExportReport report) throws IOException {
    Path dir = Path.of(report.outputDirectory()).toAbsolutePath().normalize();
    if (!dir.startsWith(root.toAbsolutePath().normalize()))
      throw new IllegalArgumentException("Export directory is outside the source script folder.");
    Path temp = dir.resolve("manifest.json.partial");
    json.writerWithDefaultPrettyPrinter().writeValue(temp.toFile(), report);
    Files.move(
        temp,
        dir.resolve("manifest.json"),
        StandardCopyOption.ATOMIC_MOVE,
        StandardCopyOption.REPLACE_EXISTING);
  }
}
