package com.oraclemigration.repository;

import com.oraclemigration.domain.AuditEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
  List<AuditEvent> findByJobIdOrderByOccurredAtDesc(Long id);
}
