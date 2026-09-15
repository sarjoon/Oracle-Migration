package com.oraclemigration.service;

import com.oraclemigration.domain.ConnectionProfile;
import java.sql.*;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class DatabaseAccess {
  private final SecretVault vault;

  public DatabaseAccess(SecretVault v) {
    vault = v;
  }

  public Connection open(ConnectionProfile p) throws SQLException {
    var secret = vault.require(p.getId());
    var props = new Properties();
    if (p.getUsername() != null) props.setProperty("user", p.getUsername());
    if (secret.databaseSecret() != null) props.setProperty("password", secret.databaseSecret());
    if (p.isTlsEnabled()) {
      if (p.getTrustStorePath() != null)
        props.setProperty("javax.net.ssl.trustStore", p.getTrustStorePath());
      if (p.getKeyStorePath() != null)
        props.setProperty("javax.net.ssl.keyStore", p.getKeyStorePath());
      if (secret.keyStoreSecret() != null)
        props.setProperty("javax.net.ssl.keyStorePassword", secret.keyStoreSecret());
    }
    return DriverManager.getConnection(url(p), props);
  }

  public List<String> schemas(ConnectionProfile profile) throws SQLException {
    try (var connection = open(profile)) {
      var names = new TreeSet<String>();
      if (profile.getDatabaseType() == ConnectionProfile.DatabaseType.SYBASE_ASE) {
        // ASE schemas are database users/owners. Groups and roles have suid=-2.
        try (var statement = connection.createStatement();
            var rows =
                statement.executeQuery(
                    "SELECT name FROM sysusers WHERE suid <> -2 ORDER BY name")) {
          while (rows.next()) {
            String name = rows.getString(1);
            if (name != null && !name.isBlank()) names.add(name);
          }
        }
      } else {
        try (var rows = connection.getMetaData().getSchemas()) {
          while (rows.next()) {
            String name = rows.getString("TABLE_SCHEM");
            if (name != null && !name.isBlank()) names.add(name);
          }
        }
      }
      return List.copyOf(names);
    }
  }

  public String url(ConnectionProfile p) {
    String base =
        p.getDatabaseType() == ConnectionProfile.DatabaseType.SYBASE_ASE
            ? "jdbc:sybase:Tds:" + p.getHost() + ":" + p.getPort() + "/" + p.getDatabaseName()
            : "jdbc:oracle:thin:@//" + p.getHost() + ":" + p.getPort() + "/" + p.getServiceName();
    return p.getJdbcParameters() == null || p.getJdbcParameters().isBlank()
        ? base
        : base + (base.contains("?") ? "&" : "?") + p.getJdbcParameters();
  }
}
