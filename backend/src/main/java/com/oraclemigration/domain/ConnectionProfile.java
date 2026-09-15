package com.oraclemigration.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

@Entity
public class ConnectionProfile {
  public enum DatabaseType {
    SYBASE_ASE,
    ORACLE
  }

  public enum AuthType {
    DB_SECRET,
    CERTIFICATE
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DatabaseType databaseType;

  @NotBlank
  @Size(max = 100)
  @Column(length = 100)
  private String databaseVersion;

  public String getDatabaseVersion() {
    return databaseVersion;
  }

  public void setDatabaseVersion(String version) {
    databaseVersion = version == null ? null : version.trim();
  }

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AuthType authType;

  @Column(nullable = false)
  private String host;

  @Column(nullable = false)
  private Integer port;

  private String databaseName;
  private String serviceName;
  private String schemaName;
  private String username;

  @Column(length = 2048)
  private String jdbcParameters;

  private String trustStorePath;
  private String keyStorePath;
  private boolean tlsEnabled;

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String v) {
    name = v;
  }

  public DatabaseType getDatabaseType() {
    return databaseType;
  }

  public void setDatabaseType(DatabaseType v) {
    databaseType = v;
  }

  public AuthType getAuthType() {
    return authType;
  }

  public void setAuthType(AuthType v) {
    authType = v;
  }

  public String getHost() {
    return host;
  }

  public void setHost(String v) {
    host = v;
  }

  public Integer getPort() {
    return port;
  }

  public void setPort(Integer v) {
    port = v;
  }

  public String getDatabaseName() {
    return databaseName;
  }

  public void setDatabaseName(String v) {
    databaseName = v;
  }

  public String getServiceName() {
    return serviceName;
  }

  public void setServiceName(String v) {
    serviceName = v;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore
  public String getSchemaName() {
    return schemaName;
  }

  public void setSchemaName(String v) {
    schemaName = v;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String v) {
    username = v;
  }

  public String getJdbcParameters() {
    return jdbcParameters;
  }

  public void setJdbcParameters(String v) {
    jdbcParameters = v;
  }

  public String getTrustStorePath() {
    return trustStorePath;
  }

  public void setTrustStorePath(String v) {
    trustStorePath = v;
  }

  public String getKeyStorePath() {
    return keyStorePath;
  }

  public void setKeyStorePath(String v) {
    keyStorePath = v;
  }

  public boolean isTlsEnabled() {
    return tlsEnabled;
  }

  public void setTlsEnabled(boolean v) {
    tlsEnabled = v;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant v) {
    updatedAt = v;
  }
}
