package com.oraclemigration.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    uniqueConstraints =
        @UniqueConstraint(
            columnNames = {"job_id", "phase", "objectType", "objectName", "chunkNumber"}))
public class JobCheckpoint {
  public enum Status {
    PENDING,
    RUNNING,
    COMPLETED,
    FAILED,
    SKIPPED_DEPENDENCY
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "job_id")
  private MigrationJob job;

  private String phase, objectType, objectName;
  private int chunkNumber;

  @Enumerated(EnumType.STRING)
  private Status status;

  @Column(length = 4000)
  private String errorMessage;

  private int retryCount;
  private Instant updatedAt = Instant.now();

  public Long getId() {
    return id;
  }

  public MigrationJob getJob() {
    return job;
  }

  public void setJob(MigrationJob v) {
    job = v;
  }

  public String getPhase() {
    return phase;
  }

  public void setPhase(String v) {
    phase = v;
  }

  public String getObjectType() {
    return objectType;
  }

  public void setObjectType(String v) {
    objectType = v;
  }

  public String getObjectName() {
    return objectName;
  }

  public void setObjectName(String v) {
    objectName = v;
  }

  public int getChunkNumber() {
    return chunkNumber;
  }

  public void setChunkNumber(int v) {
    chunkNumber = v;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status v) {
    status = v;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(String v) {
    errorMessage = v;
  }

  public int getRetryCount() {
    return retryCount;
  }

  public void setRetryCount(int v) {
    retryCount = v;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant v) {
    updatedAt = v;
  }
}
