package com.oraclemigration.repository;

import com.oraclemigration.domain.MigrationJob;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MigrationJobRepository extends JpaRepository<MigrationJob, Long> {}
