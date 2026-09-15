package com.oraclemigration.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oraclemigration.domain.ConnectionProfile;
import java.nio.file.*;
import java.sql.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

class SourceScriptServiceTests {
  @TempDir Path root;
  DatabaseAccess db = mock(DatabaseAccess.class);
  SybaseDdlExporter exporter = mock(SybaseDdlExporter.class);
  SecretVault vault = new SecretVault();
  ConnectionProfile profile;
  SourceScriptService service;

  @BeforeEach
  void setup() throws Exception {
    profile = new ConnectionProfile();
    profile.setId(1L);
    profile.setDatabaseType(ConnectionProfile.DatabaseType.SYBASE_ASE);
    profile.setDatabaseVersion("16.0 SP03");
    profile.setDatabaseName("example");
    profile.setSchemaName("legacy_owner");
    profile.setHost("localhost");
    profile.setPort(5000);
    profile.setUsername("testuser");
    profile.setAuthType(ConnectionProfile.AuthType.DB_SECRET);
    vault.put(1L, "test-password", null);
    service =
        new SourceScriptService(
            new ObjectMapper().findAndRegisterModules(), db, vault, exporter, root.toString());
    service.recover();
    Connection connection = mock(Connection.class);
    DatabaseMetaData metadata = mock(DatabaseMetaData.class);
    when(db.open(profile)).thenReturn(connection);
    when(db.schemas(profile)).thenReturn(java.util.List.of("dbo", "other"));
    when(connection.getMetaData()).thenReturn(metadata);
    PreparedStatement statement = mock(PreparedStatement.class);
    ResultSet rows = mock(ResultSet.class);
    when(connection.prepareStatement(anyString())).thenReturn(statement);
    when(statement.executeQuery()).thenReturn(rows);
    when(rows.next()).thenReturn(true, false);
    when(rows.getLong(1)).thenReturn(1L);
    when(rows.getString(2)).thenReturn("P");
    when(rows.getString(3)).thenReturn("p");
    when(rows.getString(4)).thenReturn("dbo");
    when(metadata.getDatabaseProductName()).thenReturn("Adaptive Server Enterprise");
    when(metadata.getDatabaseProductVersion())
        .thenReturn("Adaptive Server Enterprise/16.0 SP03 PL15");
  }

  @Test
  void persistsExportAndNativeSqlWithoutCredentials() throws Exception {
    when(exporter.export(eq(profile), eq("dbo"), anyString(), any(), anyList()))
        .thenAnswer(
            invocation -> {
              Files.writeString(
                  ((Path) invocation.getArgument(3)).resolve("schema.zip"),
                  "create procedure dbo.p as select 1\ngo\n");
              return new SybaseDdlExporter.ExportResult(
                  java.util.List.of(
                      new SybaseDdlExporter.ScriptResult(
                          "P",
                          "p",
                          "dbo",
                          "EXPORTED",
                          "schemas/dbo/procedures/1_p.sql",
                          "Exported")));
            });
    var report = service.create(profile, "Source export", "dbo");
    service.generate(report.id(), profile);
    var completed = service.get(report.id());
    assertEquals("EXPORTED", completed.status());
    assertTrue(completed.detectedVersion().contains("16.0"));
    assertTrue(
        Files.readString(service.download(report.id(), "schema.zip")).contains("create procedure"));
    assertFalse(
        Files.readString(service.download(report.id(), "manifest.json")).contains("test-password"));
    assertEquals(1, service.list().size());
  }

  @Test
  void rejectsVersionMismatchBeforeUtilityRuns() throws Exception {
    profile.setDatabaseVersion("15.7");
    var report = service.create(profile, "Mismatch", "dbo");
    service.generate(report.id(), profile);
    assertEquals("FAILED", service.get(report.id()).status());
    verify(exporter, never()).export(any(), anyString(), anyString(), any(), anyList());
    assertThrows(IllegalArgumentException.class, () -> service.download(report.id(), "schema.zip"));
  }

  @Test
  void diagnosticOutputRequiresReview() throws Exception {
    when(exporter.export(any(), anyString(), anyString(), any(), anyList()))
        .thenReturn(
            new SybaseDdlExporter.ExportResult(
                java.util.List.of(
                    new SybaseDdlExporter.ScriptResult(
                        "P", "p", "dbo", "FAILED", null, "Failed"))));
    var report = service.create(profile, "Review", "dbo");
    service.generate(report.id(), profile);
    assertEquals("REVIEW_REQUIRED", service.get(report.id()).status());
  }

  @Test
  void failureDoesNotPublishVendorExceptionOrCredentials() throws Exception {
    when(exporter.export(any(), anyString(), anyString(), any(), anyList()))
        .thenThrow(new java.io.IOException("test-password"));
    var report = service.create(profile, "Failure", "dbo");
    service.generate(report.id(), profile);
    assertEquals("FAILED", service.get(report.id()).status());
    assertFalse(
        Files.readString(service.download(report.id(), "manifest.json")).contains("test-password"));
  }

  @Test
  void restartMarksQueuedExportsInterrupted() throws Exception {
    var report = service.create(profile, "Restart", "dbo");
    service.recover();
    assertEquals("INTERRUPTED", service.get(report.id()).status());
    assertThrows(IllegalArgumentException.class, () -> service.get("../outside"));
  }

  @Test
  void rejectsUnsupportedSourceAndMissingVersion() {
    profile.setDatabaseType(ConnectionProfile.DatabaseType.ORACLE);
    assertThrows(IllegalArgumentException.class, () -> service.create(profile, "Oracle", "dbo"));
    profile.setDatabaseType(ConnectionProfile.DatabaseType.SYBASE_ASE);
    profile.setDatabaseVersion(null);
    assertThrows(IllegalArgumentException.class, () -> service.create(profile, "Missing", "dbo"));
    assertThrows(IllegalArgumentException.class, () -> SourceScriptService.versionFamily("16.10"));
  }

  @Test
  void nativeCommandUsesOnlyConfiguredOwnerAndStdinPassword() {
    var nativeExporter = new SybaseDdlExporter("C:/SAP libraries/*", "", 30);
    var args =
        nativeExporter.command(
            profile,
            "dbo",
            new SybaseDdlExporter.SourceObject(1, "P", "p", "dbo"),
            root.resolve("p.sql"),
            root.resolve("errors"));
    assertTrue(args.contains("-Pext"));
    assertFalse(args.contains("-XDE"));
    assertFalse(args.contains("-TDB"));
    assertTrue(args.contains("-TP"));
    assertTrue(args.contains("-Ndbo.p"));
    assertFalse(args.stream().anyMatch(a -> a.startsWith("-F")));
    assertFalse(args.toString().contains("test-password"));
    nativeExporter.validate(profile);
    profile.setTlsEnabled(true);
    assertThrows(IllegalArgumentException.class, () -> nativeExporter.validate(profile));
  }

  @Test
  void rejectsMissingAndWildcardSchemasBeforeCreatingRun() {
    for (String schema : java.util.Arrays.asList(null, "", "%", "dbo.%", "dbo,other")) {

      assertThrows(
          IllegalArgumentException.class, () -> service.create(profile, "Invalid", schema));
    }
  }

  @Test
  void catalogQueryIsBoundToOneExactOwner() throws Exception {
    Connection connection = mock(Connection.class);
    PreparedStatement statement = mock(PreparedStatement.class);
    ResultSet rows = mock(ResultSet.class);
    when(connection.prepareStatement(anyString())).thenReturn(statement);
    when(statement.executeQuery()).thenReturn(rows);
    when(rows.next()).thenReturn(true, true, false);
    when(rows.getString(4)).thenReturn("dbo", "other");
    when(rows.getLong(1)).thenReturn(1L);
    when(rows.getString(2)).thenReturn("P");
    when(rows.getString(3)).thenReturn("same_name");
    var objects = SybaseDdlExporter.discover(connection, "dbo");
    verify(connection).prepareStatement(contains("WHERE u.name=?"));
    verify(statement).setString(1, "dbo");
    assertEquals(1, objects.size());
    assertEquals("dbo", objects.get(0).owner());
  }

  @Test
  void nativeExporterRefusesOtherOwnersAndPackagesSelectedObjects() throws Exception {
    var nativeExporter = spy(new SybaseDdlExporter("C:/SAP libraries/*", "", 30));
    var owned = new SybaseDdlExporter.SourceObject(1, "P", "p", "dbo");
    var other = new SybaseDdlExporter.SourceObject(2, "P", "p", "other");
    assertThrows(
        IllegalArgumentException.class,
        () ->
            nativeExporter.export(
                profile, "dbo", "test-password", root, java.util.List.of(owned, other)));
    assertThrows(
        IllegalArgumentException.class,
        () ->
            nativeExporter.command(
                profile, "dbo", other, root.resolve("bad.sql"), root.resolve("errors")));
    doAnswer(
            invocation -> {
              Path output = invocation.getArgument(4);
              Files.writeString(output, "create procedure dbo.p as select 1\ngo\n");
              return false;
            })
        .when(nativeExporter)
        .exportObject(eq(profile), eq("dbo"), anyString(), eq(owned), any());
    var result =
        nativeExporter.export(profile, "dbo", "test-password", root, java.util.List.of(owned));
    assertFalse(result.requiresReview());
    assertTrue(Files.exists(root.resolve("schemas/dbo/procedures/1_p.sql")));
    try (var zip = new java.util.zip.ZipFile(root.resolve("schema.zip").toFile())) {
      assertNotNull(zip.getEntry("schemas/dbo/procedures/1_p.sql"));
      assertNotNull(zip.getEntry("objects.json"));
      assertEquals(2, zip.size());
    }
  }

  @Test
  void selectedSchemaBelongsToExportAndDoesNotChangeConnection() throws Exception {
    var first = service.create(profile, "First", "dbo");
    var second = service.create(profile, "Second", "other");
    assertEquals("dbo", service.get(first.id()).schemaName());
    assertEquals("other", service.get(second.id()).schemaName());
    assertEquals("legacy_owner", profile.getSchemaName());
    assertThrows(
        IllegalArgumentException.class, () -> service.create(profile, "Absent", "missing"));
  }
}
