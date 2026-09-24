package com.oraclemigration.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.oraclemigration.domain.ConnectionProfile;
import java.io.*;
import java.math.BigDecimal;
import java.nio.file.*;
import java.sql.*;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

class SybaseDataExporterTests {
  @TempDir Path root;
  DatabaseAccess db = mock(DatabaseAccess.class);
  Connection connection = mock(Connection.class);
  Statement select = mock(Statement.class);
  ResultSet data = mock(ResultSet.class);
  ResultSetMetaData metadata = mock(ResultSetMetaData.class);
  ConnectionProfile profile = new ConnectionProfile();
  SybaseDdlExporter.SourceObject table =
      new SybaseDdlExporter.SourceObject(7, "U", "orders", "dbo");
  SybaseDataExporter exporter = new SybaseDataExporter(db, 2);

  @BeforeEach
  void setup() throws Exception {
    profile.setDatabaseName("example");
    when(db.open(profile)).thenReturn(connection);
    when(connection.createStatement()).thenReturn(mock(Statement.class));
    when(connection.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY))
        .thenReturn(select);
    when(select.executeQuery(anyString())).thenReturn(data);
    when(data.getMetaData()).thenReturn(metadata);
  }

  void columns(String[] names, String[] types, int[] flags, int[] extended) throws Exception {
    PreparedStatement query = mock(PreparedStatement.class);
    ResultSet catalog = mock(ResultSet.class);
    when(connection.prepareStatement(contains("FROM syscolumns"))).thenReturn(query);
    when(query.executeQuery()).thenReturn(catalog);
    AtomicInteger row = new AtomicInteger(-1);
    when(catalog.next()).thenAnswer(i -> row.incrementAndGet() < names.length);
    when(catalog.getString(1)).thenAnswer(i -> names[row.get()]);
    when(catalog.getString(4)).thenAnswer(i -> types[row.get()]);
    when(catalog.getInt(2)).thenAnswer(i -> flags[row.get()]);
    when(catalog.getInt(3)).thenAnswer(i -> extended[row.get()]);
  }

  List<SybaseDdlExporter.ScriptResult> run() throws Exception {
    return exporter.export(profile, "dbo", root, List.of(table));
  }

  @Test
  void chunksRowsPreservesIdentityAndOmitsGeneratedColumns() throws Exception {
    columns(
        new String[] {"id", "description", "total", "stamp"},
        new String[] {"numeric", "varchar", "numeric", "timestamp"},
        new int[] {128, 0, 0, 0},
        new int[] {0, 0, 16, 0});
    when(metadata.getColumnType(1)).thenReturn(Types.NUMERIC);
    when(metadata.getColumnType(2)).thenReturn(Types.VARCHAR);
    AtomicInteger row = new AtomicInteger();
    when(data.next()).thenAnswer(i -> row.incrementAndGet() <= 3);
    when(data.getBigDecimal(1)).thenAnswer(i -> BigDecimal.valueOf(row.get()));
    when(data.getCharacterStream(2))
        .thenAnswer(i -> row.get() == 3 ? null : new StringReader("O'Brien\ngo\n\\中文"));
    var result = run();
    assertEquals(2, result.size());
    String first = Files.readString(root.resolve(result.get(0).file()));
    String last = Files.readString(root.resolve(result.get(1).file()));
    assertTrue(first.contains("SET IDENTITY_INSERT \"dbo\".\"orders\" ON"));
    assertTrue(first.contains("SET IDENTITY_INSERT \"dbo\".\"orders\" OFF"));
    assertTrue(first.contains("O''Brien\\000ago\\000a\\\\\\4e2d\\6587"));
    assertTrue(first.contains("Exported rows in this file: 2"));
    assertTrue(last.contains("VALUES (3, NULL)"));
    assertTrue(last.contains("Exported rows in this file: 1"));
    verify(select).executeQuery("SELECT \"id\", \"description\" FROM \"dbo\".\"orders\"");
    verify(select).setFetchSize(2);
    verify(connection).close();
  }

  @Test
  void emptyTableStillHasAnExplicitZeroRowFile() throws Exception {
    columns(new String[] {"id"}, new String[] {"int"}, new int[] {0}, new int[] {0});
    var result = run();
    assertEquals(1, result.size());
    assertTrue(result.get(0).message().contains("Exported 0 rows"));
    assertFalse(Files.readString(root.resolve(result.get(0).file())).contains("INSERT INTO"));
  }

  @Test
  void lateReadFailureDoesNotPublishEarlierChunks() throws Exception {
    columns(new String[] {"id"}, new String[] {"int"}, new int[] {0}, new int[] {0});
    when(metadata.getColumnType(1)).thenReturn(Types.INTEGER);
    when(data.getBigDecimal(1)).thenReturn(BigDecimal.ONE);
    when(data.next())
        .thenReturn(true, true, true)
        .thenThrow(new SQLException("sensitive-value", "08006", 99));
    var result = run();
    assertEquals(1, result.size());
    assertEquals("FAILED", result.get(0).status());
    assertNull(result.get(0).file());
    assertTrue(result.get(0).message().contains("08006"));
    assertFalse(result.get(0).message().contains("sensitive-value"));
    try (var files = Files.list(root.resolve("dbo/data"))) {
      assertEquals(0, files.count());
    }
  }

  @Test
  void exportsPreciseNumbersDatesTimesAndBinaryInAseSyntax() throws Exception {
    columns(
        new String[] {"amount", "day", "created", "payload", "clock", "enabled"},
        new String[] {"numeric", "date", "bigdatetime", "varbinary", "bigtime", "bit"},
        new int[6],
        new int[6]);
    when(data.next()).thenReturn(true, false);
    when(metadata.getColumnType(1)).thenReturn(Types.DECIMAL);
    when(metadata.getColumnType(2)).thenReturn(Types.DATE);
    when(metadata.getColumnType(3)).thenReturn(Types.TIMESTAMP);
    when(metadata.getColumnType(4)).thenReturn(Types.VARBINARY);
    when(metadata.getColumnType(5)).thenReturn(Types.TIME);
    when(metadata.getColumnType(6)).thenReturn(Types.BIT);
    when(data.getBigDecimal(1)).thenReturn(new BigDecimal("12345678901234567890.123456"));
    when(data.getDate(2)).thenReturn(Date.valueOf("2026-09-24"));
    when(data.getTimestamp(3)).thenReturn(Timestamp.valueOf("2026-09-24 12:34:56.123456"));
    when(data.getBinaryStream(4))
        .thenReturn(new ByteArrayInputStream(new byte[] {0, 15, (byte) 255}));
    when(data.getString(5)).thenReturn("12:34:56.123456");
    when(data.getBoolean(6)).thenReturn(true);
    var result = run();
    String sql = Files.readString(root.resolve(result.get(0).file()));
    assertTrue(sql.contains("12345678901234567890.123456"));
    assertTrue(sql.contains("CONVERT(date, '20260924', 112)"));
    assertTrue(sql.contains("CONVERT(bigdatetime, '2026-09-24 12:34:56.123456', 121)"));
    assertTrue(sql.contains("0x000fff"));
    assertTrue(sql.contains("CONVERT(bigtime, '12:34:56.123456'), 1)"));
  }

  @Test
  void largeLobIsFlaggedWithoutTruncationOrPublishedChunks() throws Exception {
    columns(new String[] {"body"}, new String[] {"text"}, new int[] {0}, new int[] {0});
    when(data.next()).thenReturn(true, false);
    when(metadata.getColumnType(1)).thenReturn(Types.LONGVARCHAR);
    when(data.getCharacterStream(1)).thenReturn(new StringReader("x".repeat(16385)));
    var result = run();
    assertEquals("MANUAL_REVIEW", result.get(0).status());
    assertNull(result.get(0).file());
    assertTrue(result.get(0).message().contains("No data was truncated"));
    try (var files = Files.list(root.resolve("dbo/data"))) {
      assertEquals(0, files.count());
    }
  }

  @Test
  void encryptedColumnsRequireReviewAndViewsAreNotRead() throws Exception {
    columns(new String[] {"secret"}, new String[] {"varchar"}, new int[] {0}, new int[] {128});
    assertEquals("MANUAL_REVIEW", run().get(0).status());
    verify(select, never()).executeQuery(anyString());
    assertTrue(
        exporter
            .export(
                profile,
                "dbo",
                root,
                List.of(new SybaseDdlExporter.SourceObject(8, "V", "v", "dbo")))
            .isEmpty());
    assertThrows(
        IllegalArgumentException.class,
        () -> exporter.export(profile, "other", root, List.of(table)));
  }
}
