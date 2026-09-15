package com.oraclemigration.api;

import com.oraclemigration.repository.ConnectionProfileRepository;
import com.oraclemigration.service.DatabaseAccess;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qualitative/config")
public class QualitativeConfigurationController {
  private final JdbcTemplate jdbc;
  private final ConnectionProfileRepository profiles;
  private final DatabaseAccess databases;

  public QualitativeConfigurationController(
      JdbcTemplate jdbc, ConnectionProfileRepository profiles, DatabaseAccess databases) {
    this.jdbc = jdbc;
    this.profiles = profiles;
    this.databases = databases;
  }

  public record LogicalTableRequest(
      @NotBlank String name, String description, boolean autoCompare, boolean active) {}

  public record LogicalColumnRequest(
      @NotNull Long logicalTableId,
      @NotBlank String name,
      boolean excluded,
      Integer primaryKeyPosition) {}

  public record DbTableRequest(
      @NotNull Long logicalTableId,
      @NotNull Long connectionProfileId,
      @NotBlank String schemaName,
      @NotBlank String tableName,
      boolean active) {}

  public record PairRequest(
      @NotNull Long logicalTableId,
      @NotNull Long sourceTableMappingId,
      @NotNull Long targetTableMappingId,
      boolean active) {}

  public record ColumnMappingRequest(
      @NotNull Long logicalColumnId,
      @NotBlank String sourceColumnName,
      @NotBlank String targetColumnName) {}

  public record BatchRequest(@NotBlank String name, String description, boolean active) {}

  public record BatchMemberRequest(@NotNull Long reconDbMappingId, int executionOrder) {}

  @GetMapping("/logical-tables")
  public List<Map<String, Object>> logicalTables() {
    return list("SELECT * FROM logical_table ORDER BY name");
  }

  @PostMapping("/logical-tables")
  public Map<String, Object> createLogicalTable(@Valid @RequestBody LogicalTableRequest r) {
    Long id =
        insert(
            "INSERT INTO logical_table(name, description, auto_compare, active) VALUES (?,?,?,?)",
            r.name(),
            r.description(),
            r.autoCompare(),
            r.active());
    return one("SELECT * FROM logical_table WHERE id=?", id);
  }

  @PutMapping("/logical-tables/{id}")
  public Map<String, Object> updateLogicalTable(
      @PathVariable Long id, @Valid @RequestBody LogicalTableRequest r) {
    jdbc.update(
        "UPDATE logical_table SET name=?, description=?, auto_compare=?, active=? WHERE id=?",
        r.name(),
        r.description(),
        r.autoCompare(),
        r.active(),
        id);
    return one("SELECT * FROM logical_table WHERE id=?", id);
  }

  @GetMapping("/logical-tables/{id}/columns")
  public List<Map<String, Object>> columns(@PathVariable Long id) {
    return list(
        "SELECT * FROM logical_column WHERE logical_table_id=? "
            + "ORDER BY CASE WHEN primary_key_position IS NULL THEN 1 ELSE 0 END, primary_key_position, name",
        id);
  }

  @PostMapping("/logical-columns")
  public Map<String, Object> createColumn(@Valid @RequestBody LogicalColumnRequest r) {
    Long id =
        insert(
            "INSERT INTO logical_column(logical_table_id,name,excluded,primary_key_position) VALUES (?,?,?,?)",
            r.logicalTableId(),
            normalize(r.name()),
            r.excluded(),
            r.primaryKeyPosition());
    return one("SELECT * FROM logical_column WHERE id=?", id);
  }

  @PutMapping("/logical-columns/{id}")
  public Map<String, Object> updateColumn(
      @PathVariable Long id, @Valid @RequestBody LogicalColumnRequest r) {
    jdbc.update(
        "UPDATE logical_column SET name=?, excluded=?, primary_key_position=? WHERE id=?",
        normalize(r.name()),
        r.excluded(),
        r.primaryKeyPosition(),
        id);
    return one("SELECT * FROM logical_column WHERE id=?", id);
  }

  @GetMapping("/db-tables")
  public List<Map<String, Object>> dbTables() {
    return list(
        "SELECT d.*,l.name logical_table_name,p.name profile_name,p.database_type FROM db_table_mapping d "
            + "JOIN logical_table l ON l.id=d.logical_table_id JOIN connection_profile p ON p.id=d.connection_profile_id "
            + "ORDER BY l.name,p.name,d.schema_name,d.table_name");
  }

  @PostMapping("/db-tables")
  public Map<String, Object> createDbTable(@Valid @RequestBody DbTableRequest r) {
    Long id =
        insert(
            "INSERT INTO db_table_mapping(logical_table_id,connection_profile_id,schema_name,table_name,active) VALUES (?,?,?,?,?)",
            r.logicalTableId(),
            r.connectionProfileId(),
            r.schemaName(),
            r.tableName(),
            r.active());
    return one("SELECT * FROM db_table_mapping WHERE id=?", id);
  }

  @PutMapping("/db-tables/{id}")
  public Map<String, Object> updateDbTable(
      @PathVariable Long id, @Valid @RequestBody DbTableRequest r) {
    jdbc.update(
        "UPDATE db_table_mapping SET logical_table_id=?,connection_profile_id=?,schema_name=?,table_name=?,active=? WHERE id=?",
        r.logicalTableId(),
        r.connectionProfileId(),
        r.schemaName(),
        r.tableName(),
        r.active(),
        id);
    return one("SELECT * FROM db_table_mapping WHERE id=?", id);
  }

  @GetMapping("/pairs")
  public List<Map<String, Object>> pairs() {
    return list(
        "SELECT r.*,l.name logical_table_name,s.schema_name source_schema,s.table_name source_table,"
            + "sp.id source_profile_id,sp.name source_profile,t.schema_name target_schema,t.table_name target_table,"
            + "tp.id target_profile_id,tp.name target_profile FROM recon_db_mapping r "
            + "JOIN logical_table l ON l.id=r.logical_table_id JOIN db_table_mapping s ON s.id=r.source_table_mapping_id "
            + "JOIN connection_profile sp ON sp.id=s.connection_profile_id JOIN db_table_mapping t ON t.id=r.target_table_mapping_id "
            + "JOIN connection_profile tp ON tp.id=t.connection_profile_id ORDER BY l.name");
  }

  @PostMapping("/pairs")
  public Map<String, Object> createPair(@Valid @RequestBody PairRequest r) {
    Long id =
        insert(
            "INSERT INTO recon_db_mapping(logical_table_id,source_table_mapping_id,target_table_mapping_id,active) VALUES (?,?,?,?)",
            r.logicalTableId(),
            r.sourceTableMappingId(),
            r.targetTableMappingId(),
            r.active());
    return one("SELECT * FROM recon_db_mapping WHERE id=?", id);
  }

  @PutMapping("/pairs/{id}")
  public Map<String, Object> updatePair(@PathVariable Long id, @Valid @RequestBody PairRequest r) {
    jdbc.update(
        "UPDATE recon_db_mapping SET logical_table_id=?,source_table_mapping_id=?,target_table_mapping_id=?,active=? WHERE id=?",
        r.logicalTableId(),
        r.sourceTableMappingId(),
        r.targetTableMappingId(),
        r.active(),
        id);
    return one("SELECT * FROM recon_db_mapping WHERE id=?", id);
  }

  @GetMapping("/pairs/{id}/columns")
  public List<Map<String, Object>> columnMappings(@PathVariable Long id) {
    return list(
        "SELECT m.*,c.name logical_column_name,c.excluded,c.primary_key_position FROM recon_column_mapping m "
            + "JOIN logical_column c ON c.id=m.logical_column_id WHERE m.recon_db_mapping_id=? ORDER BY c.name",
        id);
  }

  @PutMapping("/pairs/{id}/columns")
  public List<Map<String, Object>> saveColumnMappings(
      @PathVariable Long id, @RequestBody List<@Valid ColumnMappingRequest> mappings) {
    jdbc.update("DELETE FROM recon_column_mapping WHERE recon_db_mapping_id=?", id);
    for (var m : mappings)
      jdbc.update(
          "INSERT INTO recon_column_mapping(recon_db_mapping_id,logical_column_id,source_column_name,target_column_name,active) VALUES (?,?,?,?,TRUE)",
          id,
          m.logicalColumnId(),
          normalize(m.sourceColumnName()),
          normalize(m.targetColumnName()));
    return columnMappings(id);
  }

  @GetMapping("/profiles/{profileId}/columns")
  public List<String> physicalColumns(
      @PathVariable Long profileId, @RequestParam String schema, @RequestParam String table)
      throws Exception {
    var profile = profiles.findById(profileId).orElseThrow();
    var result = new ArrayList<String>();
    try (var connection = databases.open(profile);
        var columns =
            connection.getMetaData().getColumns(connection.getCatalog(), schema, table, null)) {
      while (columns.next()) result.add(columns.getString("COLUMN_NAME"));
    }
    if (result.isEmpty()) {
      try (var connection = databases.open(profile);
          var columns =
              connection
                  .getMetaData()
                  .getColumns(
                      connection.getCatalog(),
                      schema.toUpperCase(Locale.ROOT),
                      table.toUpperCase(Locale.ROOT),
                      null)) {
        while (columns.next()) result.add(columns.getString("COLUMN_NAME"));
      }
    }
    return result;
  }

  @PostMapping("/pairs/{id}/auto-map")
  public List<Map<String, Object>> autoMap(@PathVariable Long id) throws Exception {
    var pair = one("SELECT * FROM recon_db_mapping WHERE id=?", id);
    long sourceId = number(pair, "SOURCE_TABLE_MAPPING_ID"),
        targetId = number(pair, "TARGET_TABLE_MAPPING_ID");
    var source = one("SELECT * FROM db_table_mapping WHERE id=?", sourceId);
    var target = one("SELECT * FROM db_table_mapping WHERE id=?", targetId);
    List<String> sourceColumns = metadata(source), targetColumns = metadata(target);
    Map<String, String> targets = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
    targetColumns.forEach(v -> targets.put(v, v));
    long logicalTableId = number(pair, "LOGICAL_TABLE_ID");
    for (String sourceName : sourceColumns) {
      String targetName = targets.get(sourceName);
      if (targetName == null) continue;
      Long columnId = findOrCreateColumn(logicalTableId, sourceName);
      jdbc.update(
          "MERGE INTO recon_column_mapping(recon_db_mapping_id,logical_column_id,source_column_name,target_column_name,active) KEY(recon_db_mapping_id,logical_column_id) VALUES (?,?,?,?,TRUE)",
          id,
          columnId,
          normalize(sourceName),
          normalize(targetName));
    }
    return columnMappings(id);
  }

  @GetMapping("/batches")
  public List<Map<String, Object>> batches(
      @RequestParam(required = false) Long sourceProfileId,
      @RequestParam(required = false) Long targetProfileId) {
    if (sourceProfileId == null || targetProfileId == null)
      return list("SELECT * FROM recon_batch ORDER BY name");
    return list(
        "SELECT DISTINCT b.* FROM recon_batch b JOIN recon_batch_table bt ON bt.batch_id=b.id "
            + "JOIN recon_db_mapping r ON r.id=bt.recon_db_mapping_id JOIN db_table_mapping s ON s.id=r.source_table_mapping_id "
            + "JOIN db_table_mapping t ON t.id=r.target_table_mapping_id WHERE b.active=TRUE AND r.active=TRUE "
            + "AND s.connection_profile_id=? AND t.connection_profile_id=? ORDER BY b.name",
        sourceProfileId,
        targetProfileId);
  }

  @PostMapping("/batches")
  public Map<String, Object> createBatch(@Valid @RequestBody BatchRequest r) {
    Long id =
        insert(
            "INSERT INTO recon_batch(name,description,active) VALUES (?,?,?)",
            r.name(),
            r.description(),
            r.active());
    return one("SELECT * FROM recon_batch WHERE id=?", id);
  }

  @PutMapping("/batches/{id}")
  public Map<String, Object> updateBatch(
      @PathVariable Long id, @Valid @RequestBody BatchRequest r) {
    jdbc.update(
        "UPDATE recon_batch SET name=?,description=?,active=? WHERE id=?",
        r.name(),
        r.description(),
        r.active(),
        id);
    return one("SELECT * FROM recon_batch WHERE id=?", id);
  }

  @GetMapping("/batches/{id}/tables")
  public List<Map<String, Object>> batchTables(@PathVariable Long id) {
    return list(
        "SELECT bt.*,r.logical_table_id,l.name logical_table_name,r.source_table_mapping_id,r.target_table_mapping_id,"
            + "s.schema_name source_schema,s.table_name source_table,t.schema_name target_schema,t.table_name target_table "
            + "FROM recon_batch_table bt JOIN recon_db_mapping r ON r.id=bt.recon_db_mapping_id "
            + "JOIN logical_table l ON l.id=r.logical_table_id JOIN db_table_mapping s ON s.id=r.source_table_mapping_id "
            + "JOIN db_table_mapping t ON t.id=r.target_table_mapping_id WHERE bt.batch_id=? ORDER BY bt.execution_order,l.name",
        id);
  }

  @PutMapping("/batches/{id}/tables")
  public List<Map<String, Object>> saveBatchTables(
      @PathVariable Long id, @RequestBody List<@Valid BatchMemberRequest> members) {
    jdbc.update("DELETE FROM recon_batch_table WHERE batch_id=?", id);
    for (var m : members)
      jdbc.update(
          "INSERT INTO recon_batch_table(batch_id,recon_db_mapping_id,execution_order) VALUES (?,?,?)",
          id,
          m.reconDbMappingId(),
          m.executionOrder());
    return batchTables(id);
  }

  private List<String> metadata(Map<String, Object> mapping) throws Exception {
    return physicalColumns(
        number(mapping, "CONNECTION_PROFILE_ID"),
        Objects.toString(mapping.get("SCHEMA_NAME")),
        Objects.toString(mapping.get("TABLE_NAME")));
  }

  private Long findOrCreateColumn(long tableId, String name) {
    var found =
        jdbc.query(
            "SELECT id FROM logical_column WHERE logical_table_id=? AND UPPER(name)=UPPER(?)",
            (rs, row) -> rs.getLong(1),
            tableId,
            name);
    if (!found.isEmpty()) return found.get(0);
    return insert(
        "INSERT INTO logical_column(logical_table_id,name,excluded) VALUES (?,?,FALSE)",
        tableId,
        normalize(name));
  }

  private List<Map<String, Object>> list(String sql, Object... args) {
    return jdbc.queryForList(sql, args);
  }

  private Map<String, Object> one(String sql, Object... args) {
    return jdbc.queryForMap(sql, args);
  }

  private Long insert(String sql, Object... args) {
    var holder = new org.springframework.jdbc.support.GeneratedKeyHolder();
    jdbc.update(
        connection -> {
          var statement = connection.prepareStatement(sql, new String[] {"ID"});
          for (int i = 0; i < args.length; i++) statement.setObject(i + 1, args[i]);
          return statement;
        },
        holder);
    return Objects.requireNonNull(holder.getKey()).longValue();
  }

  private long number(Map<String, Object> row, String key) {
    return ((Number) row.get(key)).longValue();
  }

  private String normalize(String value) {
    return value.trim().toUpperCase(Locale.ROOT);
  }
}
