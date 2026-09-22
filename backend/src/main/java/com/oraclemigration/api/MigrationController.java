package com.oraclemigration.api;

import com.fasterxml.jackson.databind.*;
import com.oraclemigration.domain.*;
import com.oraclemigration.repository.*;
import com.oraclemigration.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.nio.file.*;
import java.sql.SQLException;
import java.time.Instant;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class MigrationController {
  private static final Logger log = LoggerFactory.getLogger(MigrationController.class);
  private final ConnectionProfileRepository profiles;
  private final MigrationJobRepository jobs;
  private final JobCheckpointRepository checkpoints;
  private final AuditEventRepository audit;
  private final SecretVault vault;
  private final DatabaseAccess db;
  private final MigrationService migration;
  private final ObjectMapper json;

  public MigrationController(
      ConnectionProfileRepository p,
      MigrationJobRepository j,
      JobCheckpointRepository c,
      AuditEventRepository a,
      SecretVault v,
      DatabaseAccess d,
      MigrationService m,
      ObjectMapper o) {
    profiles = p;
    jobs = j;
    checkpoints = c;
    audit = a;
    vault = v;
    db = d;
    migration = m;
    json = o;
  }

  public record Credentials(String databaseSecret, String keyStoreSecret) {}

  public record TestResult(boolean success, String message) {}

  public record CredentialStatus(boolean available) {}

  public record JobRequest(
      @NotBlank String name,
      @NotNull Long sourceProfileId,
      @NotNull Long targetProfileId,
      @NotBlank String sourceSchema,
      boolean entireSchema,
      List<MigrationService.ObjectRef> selectedObjects,
      boolean overwrite) {}

  @GetMapping("/profiles")
  public List<ConnectionProfile> profiles() {
    return profiles.findAll();
  }

  @PostMapping("/profiles")
  public ConnectionProfile save(@Valid @RequestBody ConnectionProfile p) {
    p.setId(null);
    p.setUpdatedAt(Instant.now());
    return profiles.save(p);
  }

  @PutMapping("/profiles/{id}")
  public ConnectionProfile update(@PathVariable Long id, @Valid @RequestBody ConnectionProfile p) {
    p.setId(id);
    p.setUpdatedAt(Instant.now());
    return profiles.save(p);
  }

  @DeleteMapping("/profiles/{id}")
  public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
    ConnectionProfile profile = profiles.findById(id).orElseThrow();
    vault.clear(id);
    profiles.delete(profile);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/profiles/{id}/credentials")
  public void credentials(@PathVariable Long id, @RequestBody Credentials c) {
    profiles.findById(id).orElseThrow();
    vault.put(id, c.databaseSecret(), c.keyStoreSecret());
  }

  @GetMapping("/profiles/{id}/credentials/status")
  public CredentialStatus credentialStatus(@PathVariable Long id) {
    profiles.findById(id).orElseThrow();
    return new CredentialStatus(vault.contains(id));
  }

  @PostMapping("/profiles/{id}/test")
  public TestResult test(@PathVariable Long id) {
    try (var c = db.open(profiles.findById(id).orElseThrow())) {
      return new TestResult(c.isValid(5), "Connection succeeded");
    } catch (Exception e) {
      log.error("Database connection test failed for profile {}", id, e);
      var messages = new StringJoiner(" | ");
      Set<Throwable> visited = Collections.newSetFromMap(new IdentityHashMap<>());
      var pending = new ArrayDeque<Throwable>();
      pending.add(e);
      while (!pending.isEmpty()) {
        var failure = pending.removeFirst();
        if (!visited.add(failure)) continue;
        String message =
            failure.getMessage() == null
                ? failure.getClass().getSimpleName()
                : failure.getMessage();
        if (failure instanceof SQLException sql) {
          // SQLWarnings are SQLExceptions and may be linked outside the cause chain.
          message =
              "SQLState="
                  + sql.getSQLState()
                  + ", vendorCode="
                  + sql.getErrorCode()
                  + ": "
                  + message;
          if (sql.getNextException() != null) pending.addLast(sql.getNextException());
        }
        log.error("Database connection diagnostic for profile {}: {}", id, message);
        messages.add(message);
        if (failure.getCause() != null) pending.addLast(failure.getCause());
      }
      return new TestResult(false, messages.toString());
    }
  }

  @GetMapping("/profiles/{id}/schemas")
  public List<String> schemas(@PathVariable Long id) throws Exception {
    return db.schemas(profiles.findById(id).orElseThrow());
  }

  @GetMapping("/profiles/{id}/objects")
  public List<MigrationService.ObjectRef> objects(
      @PathVariable Long id, @RequestParam String schema) throws Exception {
    return migration.discover(profiles.findById(id).orElseThrow(), schema);
  }

  @GetMapping("/jobs")
  public List<MigrationJob> jobs() {
    return jobs.findAll();
  }

  @PostMapping("/jobs")
  public MigrationJob create(@Valid @RequestBody JobRequest r) throws Exception {
    var j = new MigrationJob();
    j.setName(r.name());
    var source = profiles.findById(r.sourceProfileId()).orElseThrow();
    if (!db.schemas(source).contains(r.sourceSchema()))
      throw new IllegalArgumentException("Select a schema available in the source database.");
    j.setSourceProfile(source);
    j.setTargetProfile(profiles.findById(r.targetProfileId()).orElseThrow());
    j.setSourceSchema(r.sourceSchema());
    j.setEntireSchema(r.entireSchema());
    j.setSelectedObjectsJson(
        json.writeValueAsString(r.selectedObjects() == null ? List.of() : r.selectedObjects()));
    j.setOverwrite(r.overwrite());
    var saved = jobs.save(j);
    audit.save(new AuditEvent(saved.getId(), "JOB_CREATED", "Migration job created"));
    return saved;
  }

  @PostMapping("/jobs/{id}/start")
  public ResponseEntity<Void> start(@PathVariable Long id) {
    migration.run(id, false);
    return ResponseEntity.accepted().build();
  }

  @PostMapping("/jobs/{id}/resume")
  public ResponseEntity<Void> resume(@PathVariable Long id) {
    migration.run(id, false);
    return ResponseEntity.accepted().build();
  }

  @PostMapping("/jobs/{id}/retry")
  public ResponseEntity<Void> retry(@PathVariable Long id) {
    migration.run(id, true);
    return ResponseEntity.accepted().build();
  }

  @GetMapping("/jobs/{id}/checkpoints")
  public List<JobCheckpoint> cps(@PathVariable Long id) {
    return checkpoints.findByJobIdOrderByPhaseAscObjectTypeAscObjectNameAscChunkNumberAsc(id);
  }

  @GetMapping("/jobs/{id}/audit")
  public List<AuditEvent> events(@PathVariable Long id) {
    return audit.findByJobIdOrderByOccurredAtDesc(id);
  }

  @GetMapping("/jobs/{id}/failure-manifest")
  public ResponseEntity<Resource> manifest(@PathVariable Long id) {
    var j = jobs.findById(id).orElseThrow();
    var p = Path.of(j.getOutputDirectory(), "failure-manifest.json");
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=failure-manifest.json")
        .body(new FileSystemResource(p));
  }

  @PostMapping("/jobs/{id}/failure-manifest")
  public Map<String, Object> upload(@PathVariable Long id, @RequestParam MultipartFile file)
      throws Exception {
    var job = jobs.findById(id).orElseThrow();
    var entries = json.readTree(file.getBytes());
    if (!entries.isArray()) throw new IllegalArgumentException("Manifest must be a JSON array");
    int accepted = 0;
    for (var e : entries) {
      String phase = text(e, "phase"), type = text(e, "objectType"), name = text(e, "objectName");
      if (phase == null || type == null || name == null) continue;
      var cp =
          checkpoints
              .findByJobIdAndPhaseAndObjectTypeAndObjectNameAndChunkNumber(id, phase, type, name, 0)
              .orElseGet(
                  () -> {
                    var n = new JobCheckpoint();
                    n.setJob(job);
                    n.setPhase(phase);
                    n.setObjectType(type);
                    n.setObjectName(name);
                    n.setChunkNumber(0);
                    return n;
                  });
      cp.setStatus(JobCheckpoint.Status.FAILED);
      cp.setErrorMessage("Imported from failure manifest");
      cp.setUpdatedAt(Instant.now());
      checkpoints.save(cp);
      accepted++;
    }
    audit.save(new AuditEvent(id, "FAILURE_MANIFEST_IMPORTED", accepted + " entries accepted"));
    return Map.of("accepted", accepted);
  }

  private String text(JsonNode n, String field) {
    return n.hasNonNull(field) ? n.get(field).asText() : null;
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Map<String, String>> error(Exception e) {
    return ResponseEntity.badRequest()
        .body(
            Map.of(
                "error", e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
  }
}
