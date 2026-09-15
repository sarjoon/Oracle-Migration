package com.oraclemigration.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class AuditEvent {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private Long jobId;
  private String action;

  @Column(length = 2000)
  private String detail;

  private Instant occurredAt = Instant.now();

  public AuditEvent() {}

  public AuditEvent(Long j, String a, String d) {
    jobId = j;
    action = a;
    detail = d;
  }

  public Long getId() {
    return id;
  }

  public Long getJobId() {
    return jobId;
  }

  public String getAction() {
    return action;
  }

  public String getDetail() {
    return detail;
  }

  public Instant getOccurredAt() {
    return occurredAt;
  }
}
