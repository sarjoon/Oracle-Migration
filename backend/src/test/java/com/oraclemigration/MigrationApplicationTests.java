package com.oraclemigration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:migration-test;DB_CLOSE_DELAY=-1",
      "app.output-directory=./target/test-output"
    })
class MigrationApplicationTests {
  @Test
  void contextLoadsAndFlywayCreatesSchema() {}
}
