package com.oraclemigration.api;

import com.oraclemigration.repository.ConnectionProfileRepository;
import com.oraclemigration.service.ReconciliationService;
import com.oraclemigration.service.ReconciliationService.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.nio.file.Path;
import java.util.*;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reconciliation")
public class ReconciliationController {
  private final ConnectionProfileRepository profiles;
  private final ReconciliationService service;

  public ReconciliationController(
      ConnectionProfileRepository profiles, ReconciliationService service) {
    this.profiles = profiles;
    this.service = service;
  }

  public record RunRequest(
      @NotNull Long sourceProfileId,
      @NotNull Long targetProfileId,
      @NotBlank String sourceSchema,
      @NotBlank String targetSchema) {}

  @PostMapping("/runs")
  public RunStatus start(@Valid @RequestBody RunRequest request) {
    var source = profiles.findById(request.sourceProfileId()).orElseThrow();
    var target = profiles.findById(request.targetProfileId()).orElseThrow();
    RunStatus run = service.createRun();
    service.generate(
        run.reportId(), source, target, request.sourceSchema(), request.targetSchema());
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
  public QuantitativeReport report(@PathVariable String id) throws Exception {
    return service.load(id);
  }

  @GetMapping("/reports/{id}/xlsx")
  public ResponseEntity<Resource> download(@PathVariable String id) throws Exception {
    Path path = service.xlsxPath(id);
    if (!path.toFile().isFile()) return ResponseEntity.notFound().build();
    return ResponseEntity.ok()
        .contentType(
            MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .header(
            HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName() + "\"")
        .body(new FileSystemResource(path));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<Map<String, String>> error(Exception e) {
    return ResponseEntity.badRequest()
        .body(
            Map.of(
                "error", e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
  }
}
