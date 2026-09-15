package com.oraclemigration.api;

import com.oraclemigration.repository.ConnectionProfileRepository;
import com.oraclemigration.service.QualitativeReconciliationService;
import com.oraclemigration.service.QualitativeReconciliationService.*;
import com.oraclemigration.service.SecretVault;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Path;
import java.util.List;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qualitative")
public class QualitativeReconciliationController {
  private final QualitativeReconciliationService service;
  private final ConnectionProfileRepository profiles;
  private final SecretVault secrets;

  public QualitativeReconciliationController(
      QualitativeReconciliationService service,
      ConnectionProfileRepository profiles,
      SecretVault secrets) {
    this.service = service;
    this.profiles = profiles;
    this.secrets = secrets;
  }

  public record RunRequest(
      @NotNull Long batchId, @NotNull Long sourceProfileId, @NotNull Long targetProfileId) {}

  @PostMapping("/runs")
  public RunStatus run(@Valid @RequestBody RunRequest request) {
    profiles.findById(request.sourceProfileId()).orElseThrow();
    profiles.findById(request.targetProfileId()).orElseThrow();
    if (!secrets.contains(request.sourceProfileId()))
      throw new IllegalStateException("Credentials are required for the source database");
    if (!secrets.contains(request.targetProfileId()))
      throw new IllegalStateException("Credentials are required for the target database");
    RunStatus run = service.createRun(request.batchId());
    service.generate(
        run.reportId(), request.batchId(), request.sourceProfileId(), request.targetProfileId());
    return run;
  }

  @GetMapping("/runs/{id}/status")
  public RunStatus status(@PathVariable String id) {
    return service.status(id);
  }

  @GetMapping("/reports")
  public List<ReportSummary> reports() throws Exception {
    return service.summaries();
  }

  @GetMapping("/reports/{id}")
  public QualitativeReport report(@PathVariable String id) throws Exception {
    return service.load(id);
  }

  @GetMapping("/reports/{id}/zip")
  public ResponseEntity<Resource> download(@PathVariable String id) throws Exception {
    Path path = service.zipPath(id);
    if (!path.toFile().isFile()) return ResponseEntity.notFound().build();
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("application/zip"))
        .header(
            HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName() + "\"")
        .body(new FileSystemResource(path));
  }
}
