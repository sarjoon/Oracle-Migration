package com.oraclemigration.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class MigrationJob {
  public enum Status {
    CREATED,
    RUNNING,
    COMPLETED,
    COMPLETED_WITH_ERRORS,
    FAILED,
    INTERRUPTED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @ManyToOne(optional = false)
  private ConnectionProfile sourceProfile;

  @ManyToOne(optional = false)
  private ConnectionProfile targetProfile;

  @Enumerated(EnumType.STRING)
  private Status status = Status.CREATED;

  private String sourceSchema;

  @Column(length = 10000)
  private String selectedObjectsJson;

  private boolean entireSchema, overwrite;
  private String currentPhase, outputDirectory;
  private Instant createdAt = Instant.now(), startedAt, finishedAt;
  private int totalUnits, completedUnits, failedUnits;

  public Long getId() {
    return id;
  }

  public void setId(Long v) {
    id = v;
  }

  public String getName() {
    return name;
  }

  public void setName(String v) {
    name = v;
  }

  public ConnectionProfile getSourceProfile() {
    return sourceProfile;
  }

  public void setSourceProfile(ConnectionProfile v) {
    sourceProfile = v;
  }

  public ConnectionProfile getTargetProfile() {
    return targetProfile;
  }

  public void setTargetProfile(ConnectionProfile v) {
    targetProfile = v;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status v) {
    status = v;
  }

  public String getSourceSchema() {
    return sourceSchema;
  }

  public void setSourceSchema(String v) {
    sourceSchema = v;
  }

  public String getSelectedObjectsJson() {
    return selectedObjectsJson;
  }

  public void setSelectedObjectsJson(String v) {
    selectedObjectsJson = v;
  }

  public boolean isEntireSchema() {
    return entireSchema;
  }

  public void setEntireSchema(boolean v) {
    entireSchema = v;
  }

  public boolean isOverwrite() {
    return overwrite;
  }

  public void setOverwrite(boolean v) {
    overwrite = v;
  }

  public String getCurrentPhase() {
    return currentPhase;
  }

  public void setCurrentPhase(String v) {
    currentPhase = v;
  }

  public String getOutputDirectory() {
    return outputDirectory;
  }

  public void setOutputDirectory(String v) {
    outputDirectory = v;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getStartedAt() {
    return startedAt;
  }

  public void setStartedAt(Instant v) {
    startedAt = v;
  }

  public Instant getFinishedAt() {
    return finishedAt;
  }

  public void setFinishedAt(Instant v) {
    finishedAt = v;
  }

  public int getTotalUnits() {
    return totalUnits;
  }

  public void setTotalUnits(int v) {
    totalUnits = v;
  }

  public int getCompletedUnits() {
    return completedUnits;
  }

  public void setCompletedUnits(int v) {
    completedUnits = v;
  }

  public int getFailedUnits() {
    return failedUnits;
  }

  public void setFailedUnits(int v) {
    failedUnits = v;
  }
}
