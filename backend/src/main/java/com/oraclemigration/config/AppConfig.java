package com.oraclemigration.config;

import java.util.concurrent.Executor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {
  @Bean(name = "migrationExecutor")
  Executor migrationExecutor(@Value("${app.worker-threads:4}") int threads) {
    var executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(1);
    executor.setMaxPoolSize(threads);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("migration-");
    executor.initialize();
    return executor;
  }

  @Bean(name = "reconciliationExecutor")
  Executor reconciliationExecutor(@Value("${app.reconciliation-worker-threads:2}") int threads) {
    var executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(Math.max(1, threads));
    executor.setMaxPoolSize(Math.max(1, threads));
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("reconciliation-");
    executor.initialize();
    return executor;
  }

  @Bean
  WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins("http://localhost:4200").allowedMethods("*");
      }
    };
  }
}
