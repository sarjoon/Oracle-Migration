package com.oraclemigration.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oraclemigration.domain.ConnectionProfile;
import java.sql.*;
import java.util.List;
import org.junit.jupiter.api.Test;

class DatabaseSchemaTests {
  @Test
  void listsAseOwnersIncludingEmptySchemasButExcludesGroupsAndRoles() throws Exception {
    var profile = new ConnectionProfile();
    profile.setDatabaseType(ConnectionProfile.DatabaseType.SYBASE_ASE);
    var db = spy(new DatabaseAccess(new SecretVault()));
    var connection = DriverManager.getConnection("jdbc:h2:mem:schema-list");
    try (var statement = connection.createStatement()) {
      statement.execute("CREATE TABLE sysusers (name VARCHAR(100), suid INT)");
      statement.execute(
          "INSERT INTO sysusers VALUES ('dbo', 1), ('empty_owner', 5), ('guest', -1), ('public', -2), ('role', -2)");
    }
    doReturn(connection).when(db).open(profile);
    assertEquals(List.of("dbo", "empty_owner", "guest"), db.schemas(profile));
    assertTrue(connection.isClosed());
  }

  @Test
  void oracleUsesJdbcSchemas() throws Exception {
    var profile = new ConnectionProfile();
    profile.setDatabaseType(ConnectionProfile.DatabaseType.ORACLE);
    var db = spy(new DatabaseAccess(new SecretVault()));
    var connection = mock(Connection.class);
    var metadata = mock(DatabaseMetaData.class);
    var rows = mock(ResultSet.class);
    doReturn(connection).when(db).open(profile);
    when(connection.getMetaData()).thenReturn(metadata);
    when(metadata.getSchemas()).thenReturn(rows);
    when(rows.next()).thenReturn(true, true, true, false);
    when(rows.getString("TABLE_SCHEM")).thenReturn("B", "A", "A");
    assertEquals(List.of("A", "B"), db.schemas(profile));
    verify(connection).close();
  }

  @Test
  void legacySchemaIsNotPartOfConnectionConfigurationApi() throws Exception {
    var profile = new ConnectionProfile();
    profile.setSchemaName("old_owner");
    var json = new ObjectMapper().findAndRegisterModules();
    assertFalse(json.valueToTree(profile).has("schemaName"));
    assertNull(
        json.readValue("{\"schemaName\":\"ignored\"}", ConnectionProfile.class).getSchemaName());
  }
}
