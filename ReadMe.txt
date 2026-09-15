SYBASE TO ORACLE MIGRATION SCRIPT GENERATOR
===========================================

OVERVIEW
--------
This project contains an Angular user interface and a Spring Boot backend for
generating migration scripts from SAP Sybase ASE metadata and data. It does not
execute generated scripts against Oracle.

The interface uses a Tech Mahindra-aligned visual theme based on Mahindra red,
clarity grey, dark navigation, and the refreshed lozenge motif. The application
does not bundle or redistribute an official logo asset.

Generation is split into:
1. Base DDL without indexes, primary keys, unique constraints, or foreign keys.
2. DML INSERT statements.
3. Indexes and deferred primary/foreign-key constraints.

STATUS AND CURRENT LIMITATIONS
------------------------------
This is an initial working implementation. Table and view discovery uses JDBC
metadata. Tables, columns, basic type conversion, INSERT statements, indexes,
primary keys, and foreign keys are generated. Sybase-specific extraction and
translation for view bodies, sequences, triggers, procedures, functions,
synonyms, users/grants, partition definitions, computed columns, defaults,
check constraints, and advanced index options remains a manual-review area.
View files are intentionally marked for manual review rather than silently
producing invalid Oracle SQL.

Large-table bulk export and chunk-level restart are not yet implemented. The
current version writes literal INSERT statements and checkpoints each table.
Binary and LOB values may require additional conversion for production use.

PROJECT LAYOUT
--------------
backend/       Spring Boot 3 application (Java 17, JPA, Flyway, file-based H2)
frontend/      Angular 18 standalone application
ReadMe.txt     This document

PREREQUISITES
-------------
- Java 17
- Maven 3.9 or later
- Node.js and npm
- SAP jConnect JDBC driver compatible with the installed ASE version
- Oracle JDBC driver only if future target connection validation needs it

SAP JCONNECT DRIVER
-------------------
SAP's jConnect artifact is not included because it is normally supplied under
SAP's license and is not reliably available from Maven Central. Obtain jconn4.jar
from the licensed SAP ASE installation and either:

1. Install it into the local Maven repository and add the matching runtime
   dependency to backend/pom.xml; or
2. Start the packaged application with jconn4.jar on the Java classpath.

The required driver class is normally com.sybase.jdbc4.jdbc.SybDriver. Confirm
the correct driver and TLS properties for the exact SAP ASE/jConnect version.

RUNNING THE BACKEND
-------------------
From backend:
  mvn spring-boot:run

Default backend URL:
  http://localhost:8080

Persistent H2 data is written to:
  <backend working directory>/data/migration-config.mv.db

H2 SCHEMA MANAGEMENT
--------------------
Flyway owns the H2 schema. Hibernate is configured with ddl-auto=validate and
does not create or alter tables. On startup, Flyway automatically applies pending
versioned SQL files from backend/src/main/resources/db/migration. The initial
migration creates connection profiles, jobs, checkpoints, audit events, keys,
and operational indexes. Existing databases created by the earlier prototype are
automatically baselined at version 0 before the migrations are evaluated.

Never edit a migration that has already been deployed. Add the next numbered
V<version>__<description>.sql file instead. Back up the H2 file before deploying
schema changes.

Override locations with environment variables:
  APP_DATA_DIR             H2 directory
  MIGRATION_OUTPUT_DIR     generated-script root
  MIGRATION_WORKERS        bounded async worker maximum (default 4)
  DML_CHUNK_SIZE            reserved chunk size setting (default 10000)
  BULK_THRESHOLD_ROWS      reserved bulk-mode threshold (default 100000)

RUNNING THE FRONTEND
--------------------
From frontend:
  npm install
  npm start

Open:
  http://localhost:4200

Production build:
  npm run build

The frontend build automatically runs a post-build Prettier step over generated
JavaScript and CSS. This keeps main.js, polyfills.js, and styles.css readable in
the dist directory. The generated files remain build artifacts and should not be
edited manually because the next build replaces them.

CONNECTION AND SECRET HANDLING
------------------------------
Connection profiles persist host, port, database/service name, schema, username,
authentication selection, TLS flag, certificate paths, and optional JDBC
parameters in file-based H2. Users do not enter JDBC URLs; the backend builds
them from these fields.

Database and keystore passwords are submitted separately and retained only in
backend process memory. They are never written to H2, logs, failure manifests,
or generated scripts. After a JAR restart, credentials must be supplied again
before discovering objects, testing connections, resuming, or retrying.

TLS does not automatically replace database authentication. The exact truststore,
keystore, mutual-TLS, and external-authentication behavior depends on the chosen
Sybase and Oracle JDBC drivers. Certificate paths refer to files accessible to
the backend host, not the user's browser computer.

SCRIPT LOCATIONS
----------------
For migration name <name>, output is stored under:
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/tables
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/views
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/sequences
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/triggers
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/procedureandfunctions
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/synonyms
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/userandgrants
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/partitions
  <MIGRATION_OUTPUT_DIR>/<name>/DDL/indexes
  <MIGRATION_OUTPUT_DIR>/<name>/DML/inserts

MIGRATION WORKFLOW
------------------
The interface uses a persistent side menu and breadcrumbs. Migration contains
separate Database Configurations and Build Migrations pages. Reconciliation is a
top-level placeholder for the future reconciliation requirements.

1. Create a Sybase source profile and Oracle target profile.
2. Enter memory-only credentials for the profiles.
3. Test the source connection.
4. Select the source schema and discover objects.
5. Select the entire schema or individual objects.
6. Enable overwrite if an existing output set should be replaced. The UI asks
   for explicit confirmation.
7. Start generation and monitor the job list.

Jobs interrupted by a backend restart are marked INTERRUPTED. After credentials
are re-entered, Resume skips completed object checkpoints. Retry failures handles
only FAILED or SKIPPED_DEPENDENCY checkpoints.

PROGRESS GRAPHS
---------------
The migration screen refreshes job data every five seconds and displays:
- A generated-unit success/failure stacked graph
- A job-status distribution graph
- A completion progress bar and percentage for every job

The denominator is calculated when Sybase object discovery finishes: tables
contribute DDL, DML, and index units; other discovered objects contribute DDL and
index/dependency-phase units. Failed units count as processed so a completed job
can reach 100 percent while still clearly showing its failures.

QUANTITATIVE RECONCILIATION
---------------------------
The Reconciliation menu contains Quantitative Recon and Qualitative Recon.

Quantitative Recon selects a configured Sybase source, Oracle target, and their
schemas. It runs asynchronously and stores reports in the filesystem; no
reconciliation result data is persisted in H2. The object-count
report compares schema objects by normalized type and name. Matched rows display
a green indicator; mismatches display a red indicator and a Details action. The
details dialog has separate Missing in source and Missing in target grids, each
with configurable 10/25/50-row pages and independent pagination.

The record-count report lists the union of source and target tables, executes
COUNT(*) where the table exists, and shows source/target values and match status.
It uses server-side pagination with configurable 10/25/50-row pages. Counts may
be expensive and can affect busy production databases, so reconciliation should
be scheduled appropriately. A database or table-level failure is reported rather
than being represented as a zero count.

On successful completion, the application creates and validates an immutable
pair with the same timestamped report identifier:
  <jar-home>/reconfiles/quantitative/json/ObjectCount_<timestamp>.json
  <jar-home>/reconfiles/quantitative/xlsx/ObjectCount_<timestamp>.xlsx

Set RECONCILIATION_OUTPUT_DIR through app.reconciliation-directory if an
alternative report root is required. The Reconciliation Reports home scans the
JSON directory and displays quantitative and qualitative report grids. Reload
reads the existing JSON without querying either database. Download returns the
existing XLSX rather than regenerating it.

Both formats identify the source and target configuration, database type, host,
port, database/service, and schema. Secrets and JDBC parameters are excluded.
The XLSX contains Summary, Object Counts, Missing In Source, Missing In Target,
and Record Counts worksheets; every worksheet repeats the source/target header.
Loaded quantitative reports display matching/mismatching doughnut charts derived
from the JSON data.

QUALITATIVE RECONCILIATION
--------------------------
Qualitative reconciliation configuration is persisted in the file-based H2
database. Flyway V3 creates logical_table, logical_column, db_table_mapping,
recon_db_mapping, recon_column_mapping, recon_batch, and recon_batch_table.
Configuration rows can be deactivated while preserving their relationships.

Logical tables support automatic or manual comparison, excluded columns, and
ordered primary-key positions for single or composite keys. A physical table
mapping always identifies one connection profile, schema, and table. A table-pair
mapping connects one source mapping to one target mapping. Identically named
columns can be discovered and mapped automatically. Manual mode provides a
source/target drag-and-drop mapper and requires every included logical column to
be mapped before execution. Metadata is validated against each database before
records are compared.

Batches contain reusable table pairs. On the execution page, the source and
target profile selections filter the available batches. The A / Tables action
previews the resolved source and target tables. Credentials are requested only
when the selected profile has no secret in singleton memory. Passwords are
masked, are never stored in H2 or report files, and must be supplied again after
the application restarts.

Tables in a batch run concurrently using app.reconciliation-worker-threads
(default 2). An individual table error does not stop other tables; duplicate or
missing primary keys fail only the affected table. Text comparison is exact and
case-sensitive after trimming. NULL and an empty string compare as equal.
Numbers compare by numeric value. BLOB, binary, and CLOB content is streamed into
SHA-256 digests; reports show only type, length, and digest rather than full LOB
values.

Matched records contribute only to totals and charts. They are not written as
report details. Missing-record sheets contain the complete available record.
Mismatch sheets contain composite key names and values as JSON arrays followed
by the source column/value and target column/value. Excel output is divided into
numbered sheets before the worksheet row limit is reached.

Completed batch output is stored at:
  <jar-home>/reconfiles/qualitative/json/<BatchName>_<timestamp>.json
  <jar-home>/reconfiles/qualitative/zip/<BatchName>_<timestamp>.zip

JSON contains summary counts, missing-column diagnostics, table statuses, chart
data, the ZIP filename, and each table XLSX filename. Detailed missing and
mismatched records are available only in the XLSX workbooks inside the ZIP, and
the browser displays that fact with the exact filename. Files use a .partial
suffix until complete. After an application restart, incomplete files are not
resumed automatically; rerun the batch after checking database consistency.
Retention and external backup of reconciliation reports are manual operational
tasks and are outside this application.

FAILURE MANIFESTS
-----------------
Generation continues when an individual independent object fails. Each output
root contains failure-manifest.json with timestamp, job, phase, object name/type,
status, error, and retry count. The UI can download this manifest, upload a JSON
manifest into a job, and retry only those objects. Original external manifests
are not modified; H2 retains current retry status and audit history.

FILESYSTEM SAFETY
-----------------
Names are sanitized and output paths are normalized beneath the configured root.
Each file is written to a temporary sibling and atomically moved into place.
Overwrite requires an explicit flag and UI confirmation. Use a dedicated output
directory with adequate disk capacity and operating-system access controls,
because DML scripts contain business data in clear text.

ORACLE IDEMPOTENCY
------------------
Oracle support for native CREATE IF NOT EXISTS varies by version and object type.
Generated SQL currently includes a note that deployment must perform an Oracle
metadata guard. A production release should generate version-specific PL/SQL
guards after the supported Oracle version range is confirmed.

BUILD VERIFICATION
------------------
Backend:
  cd backend
  mvn test
  mvn spotless:check

Frontend:
  cd frontend
  npm install
  npm run build
  npm run format:check

SOURCE FORMATTING
-----------------
Java source uses Spotless with Google Java Format. To reformat it:
  cd backend
  mvn spotless:apply

TypeScript, Angular HTML, CSS, and frontend JSON use Prettier. To reformat them:
  cd frontend
  npm run format

Generated frontend JavaScript and CSS can be reformatted without rebuilding:
  npm run format:dist

The Maven verify lifecycle runs the Java formatting check. Formatting commands
should be run before committing source changes; compiled frontend output remains
minified independently of the readable source files.

PRODUCTION FOLLOW-UP
--------------------
Before production use, confirm the exact SAP ASE, jConnect, and Oracle versions;
complete Sybase catalog readers for all requested object types; implement bulk
export/chunk restart; add version-specific Oracle idempotent wrappers; define
retention/backup cleanup; and test generated output against representative schema
fixtures. Review npm audit findings when updating the Angular dependency line.

NATIVE SYBASE SOURCE EXPORT (STEP 1)
----------------------------------
DB Configurations now records Database type and Database version. Existing
profiles keep their connection settings; edit them to supply the installed version. Schema is selected for each migration, not in DB Configurations.
Oracle profiles can record their version, but native extraction currently accepts
Sybase ASE only (15.7, 16.0, 16.1 families). The connected database product and
version family are checked before extraction; service-pack compatibility depends
on the installed SAP utility, so use matching licensed SAP client libraries.

Build Migrations and Generate Source Scripts fetch schemas when a source connection is selected. Choose the source schema from the dropdown. Generate Source Scripts exports only that chosen schema/owner. A schema is required; blank or wildcard schemas are rejected. Catalog
queries bind the exact owner and each SAP ddlgen invocation targets one owned
object (-Ddatabase -Ttype -Nowner.object). There is no full-database fallback.
Tables include indexes and constraints; triggers are exported separately. Views,
procedures, SQLJ functions, defaults and rules have their own type directories.
Other catalog types and unsupported identifiers are recorded as MANUAL_REVIEW
instead of silently expanding the scope. Catalog components may be included in
table DDL; user-defined datatypes, grants and database-level objects need separate
assessment. Cross-schema references are preserved but other owners are not
extracted automatically. Review dependency ordering before replaying the files.
It does not export table rows, convert to Oracle, or execute target SQL.
EXPORTED means native files were produced, not that replay has been validated.
Diagnostics, failed objects and unsupported types produce REVIEW_REQUIRED with
per-object results. A ZIP may contain partial success; consult the manifest.

Install SAP's licensed ddlgen libraries on the backend host; they are not bundled.
Set SYBASE_DDLGEN_CLASSPATH to the absolute Java classpath from the installed SAP
ddlgen launcher (including DDLGen.jar, jConnect, dsparser and any other required
libraries for that release). Separate entries with semicolons on Windows or
colons on Linux. The backend JDBC connection also needs jConnect on its runtime
classpath as described above. SYBASE_DDLGEN_JAVA optionally selects the Java
executable compatible with the SAP utility; otherwise the backend JVM is used.
SYBASE_DDLGEN_TIMEOUT_SECONDS defaults to 1800.

Native export currently supports DB_SECRET connections using hostname/IPv4 and
standard database names. TLS, certificate authentication and custom JDBC
parameters are explicitly rejected for this exporter until their equivalent
SAP utility options are implemented. The password is supplied through stdin
using SAP's -Pext mechanism, never in command arguments. The process uses no shell.

Output defaults to <jar-home>/dbscripts/source/<export-uuid>/schemas/<schema>/<type>/<id>_<object>.sql plus
manifest.json, objects.json and a schema.zip download. During IDE or Maven execution the working directory is used.
SOURCE_SCRIPT_DIR can override the source root. The backend account needs write
access to that directory. Exports have unique folders and do not overwrite each
other. Manifests record configured/detected versions, database, schema, per-object results, status and output
location. Pending exports become INTERRUPTED on restart; start a new export.
Downloads and report history remain available after restart. Keep this directory
private and manage retention externally.

API: GET /api/profiles/<id>/schemas lists schemas using session credentials. ASE lists users/owners (excluding groups and roles), including owners with no objects. Oracle uses JDBC schema metadata. POST /api/source-scripts requires {"sourceProfileId":1,"name":"Export","sourceSchema":"dbo"}. The chosen schema is validated against the source and saved in the export manifest. Previous profile schema values are retained in storage for compatibility but are ignored by the API and export workflow.
Download /api/source-scripts/<id>/schema.zip or /manifest.json. Old database.sql downloads remain available only for legacy full-database exports.
The existing Build Migrations page remains the legacy basic Oracle generator.
AI conversion (step 2) is not part of this source-export implementation.
