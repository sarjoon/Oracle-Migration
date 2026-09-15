package com.oraclemigration.api;

import com.oraclemigration.repository.ConnectionProfileRepository;
import com.oraclemigration.service.SourceScriptService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/source-scripts")
public class SourceScriptController {
  private final SourceScriptService service;
  private final ConnectionProfileRepository profiles;

  public SourceScriptController(SourceScriptService service, ConnectionProfileRepository profiles) {
    this.service = service;
    this.profiles = profiles;
  }

  public record Request(
      @NotNull Long sourceProfileId,
      @NotBlank @Size(max = 120) String name,
      @NotBlank @Size(max = 255) String sourceSchema) {}

  @GetMapping
  public List<SourceScriptService.ExportReport> list() throws Exception {
    return service.list();
  }

  @PostMapping
  public ResponseEntity<SourceScriptService.ExportReport> create(
      @Valid @RequestBody Request request) throws Exception {
    var profile = profiles.findById(request.sourceProfileId()).orElseThrow();
    var report = service.create(profile, request.name(), request.sourceSchema());
    service.generate(report.id(), profile);
    return ResponseEntity.accepted().body(report);
  }

  @GetMapping("/{id}/{file}")
  public ResponseEntity<Resource> download(@PathVariable String id, @PathVariable String file)
      throws Exception {
    if (!Set.of("schema.zip", "database.sql", "manifest.json").contains(file))
      throw new IllegalArgumentException("Unknown export file.");
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file)
        .body(new FileSystemResource(service.download(id, file)));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> error(Exception e) {
    return ResponseEntity.badRequest()
        .body(
            Map.of(
                "error",
                e instanceof IllegalArgumentException || e instanceof IllegalStateException
                    ? e.getMessage()
                    : "Source export request failed. Check the configuration and backend storage."));
  }
}
