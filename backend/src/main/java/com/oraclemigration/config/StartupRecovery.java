package com.oraclemigration.config;

import com.oraclemigration.service.MigrationService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupRecovery implements ApplicationRunner {
  private final MigrationService service;

  public StartupRecovery(MigrationService s) {
    service = s;
  }

  public void run(ApplicationArguments args) {
    service.markInterrupted();
  }
}
