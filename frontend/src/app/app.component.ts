import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
type Profile = {
  id?: number;
  name: string;
  databaseType: 'SYBASE_ASE' | 'ORACLE';
  databaseVersion: string;
  authType: 'DB_SECRET' | 'CERTIFICATE';
  host: string;
  port: number;
  databaseName: string;
  serviceName: string;

  username: string;
  jdbcParameters: string;
  trustStorePath: string;
  keyStorePath: string;
  tlsEnabled: boolean;
};
type SourceExport = {
  schemaName?: string;
  id: string;
  name: string;
  databaseType: string;
  configuredVersion: string;
  detectedVersion?: string;
  databaseName: string;
  status: string;
  createdAt: string;
  outputDirectory: string;
  message: string;
};
type DbObject = { type: string; name: string };
type Job = {
  id: number;
  name: string;
  status: string;
  currentPhase: string;
  totalUnits: number;
  completedUnits: number;
  failedUnits: number;
  sourceProfile: Profile;
  targetProfile: Profile;
};
type Endpoint = {
  profileId?: number;
  name?: string;
  configurationName: string;
  databaseType: string;
  host: string;
  port: number;
  databaseOrService: string;
  schema: string;
};
type ReconciliationRun = {
  reportId: string;
  status: string;
  generatedAt: string;
  source: Endpoint;
  target: Endpoint;
  matched: number;
  mismatched: number;
  fileSize: number;
  downloadable: boolean;
};
type ObjectCount = {
  objectType: string;
  sourceCount: number;
  targetCount: number;
  matched: boolean;
  missingInSource: string[];
  missingInTarget: string[];
};
type RunStatus = { reportId: string; status: string; errorMessage?: string };
type QuantitativeReport = {
  metadata: {
    reportId: string;
    generatedAt: string;
    status: string;
    source: Endpoint;
    target: Endpoint;
  };
  objectCounts: ObjectCount[];
  recordCounts: TableCount[];
};
type TableCount = {
  id: number;
  tableName: string;
  sourceCount?: number;
  targetCount?: number;
  status: string;
  errorMessage?: string;
};
type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
type DetailPage = {
  content: string[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
type ConfigRow = {
  ID?: any;
  NAME?: any;
  DESCRIPTION?: any;
  ACTIVE?: any;
  AUTO_COMPARE?: any;
  EXCLUDED?: any;
  PRIMARY_KEY_POSITION?: any;
  LOGICAL_TABLE_ID?: any;
  LOGICAL_TABLE_NAME?: any;
  CONNECTION_PROFILE_ID?: any;
  PROFILE_NAME?: any;
  DATABASE_TYPE?: any;
  SCHEMA_NAME?: any;
  TABLE_NAME?: any;
  SOURCE_TABLE_MAPPING_ID?: any;
  TARGET_TABLE_MAPPING_ID?: any;
  SOURCE_PROFILE_ID?: any;
  TARGET_PROFILE_ID?: any;
  SOURCE_PROFILE?: any;
  TARGET_PROFILE?: any;
  SOURCE_SCHEMA?: any;
  TARGET_SCHEMA?: any;
  SOURCE_TABLE?: any;
  TARGET_TABLE?: any;
  LOGICAL_COLUMN_ID?: any;
  LOGICAL_COLUMN_NAME?: any;
  SOURCE_COLUMN_NAME?: any;
  TARGET_COLUMN_NAME?: any;
  RECON_DB_MAPPING_ID?: any;
  logicalTable?: any;
  sourceTable?: any;
  targetTable?: any;
  sourceCount?: any;
  targetCount?: any;
  status?: any;
  errorMessage?: any;
  xlsxFile?: any;
};
type QualRun = {
  reportId: string;
  status: string;
  errorMessage?: string;
  totalTables: number;
  completedTables: number;
  failedTables: number;
  processedRecords: number;
  matched: number;
  mismatched: number;
  missingInSource: number;
  missingInTarget: number;
};
type QualReport = {
  reportId: string;
  batchName: string;
  generatedAt: string;
  status: string;
  source: Endpoint;
  target: Endpoint;
  matched: number;
  mismatched: number;
  missingInSource: number;
  missingInTarget: number;
  detailLabel?: string;
  zipFile: string;
  tables?: ConfigRow[];
};
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private api = '/api';
  profiles: Profile[] = [];
  jobs: Job[] = [];
  objects: DbObject[] = [];
  selected = new Set<string>();
  message = '';
  busy = false;
  activeProfileId?: number;
  activePage:
    | 'db-configurations'
    | 'source-scripts'
    | 'build-migrations'
    | 'reconciliation-home'
    | 'quantitative-reconciliation'
    | 'qualitative-reconciliation' = 'db-configurations';
  showProfileForm = false;
  reconciliationRuns: ReconciliationRun[] = [];
  activeReconciliation?: ReconciliationRun;
  activeRun?: RunStatus;
  objectCounts: ObjectCount[] = [];
  allTableCounts: TableCount[] = [];
  tableCounts: Page<TableCount> = {
    content: [],
    number: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  };
  recon = { sourceProfileId: 0, targetProfileId: 0, sourceSchema: 'dbo', targetSchema: '' };
  details?: ObjectCount;
  missingSource: DetailPage = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
  missingTarget: DetailPage = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
  detailSize = 10;
  qualSection: 'tables' | 'physical' | 'pairs' | 'batches' | 'execute' = 'tables';
  logicalTables: ConfigRow[] = [];
  logicalColumns: ConfigRow[] = [];
  dbTableMappings: ConfigRow[] = [];
  reconPairs: ConfigRow[] = [];
  reconBatches: ConfigRow[] = [];
  batchTables: ConfigRow[] = [];
  sourceMapperColumns: string[] = [];
  targetMapperColumns: string[] = [];
  mappedColumns: ConfigRow[] = [];
  selectedLogicalTableId = 0;
  selectedPairId = 0;
  selectedBatchId = 0;
  draggedSource = '';
  showBatchPreview = false;
  logicalForm = { id: 0, name: '', description: '', autoCompare: true, active: true };
  columnForm = { id: 0, name: '', excluded: false, primaryKeyPosition: null as number | null };
  dbTableForm = {
    id: 0,
    logicalTableId: 0,
    connectionProfileId: 0,
    schemaName: '',
    tableName: '',
    active: true,
  };
  pairForm = {
    id: 0,
    logicalTableId: 0,
    sourceTableMappingId: 0,
    targetTableMappingId: 0,
    active: true,
  };
  batchForm = { id: 0, name: '', description: '', active: true };
  qualExecution = { sourceProfileId: 0, targetProfileId: 0, batchId: 0 };
  qualRun?: QualRun;
  qualReports: QualReport[] = [];
  activeQualReport?: QualReport;
  credentialPrompt: {
    ids: number[];
    index: number;
    secret: string;
    keyStoreSecret: string;
  } | null = null;
  profile: Profile = {
    name: '',
    databaseType: 'SYBASE_ASE',
    databaseVersion: '',
    authType: 'DB_SECRET',
    host: 'localhost',
    port: 5000,
    databaseName: '',
    serviceName: '',
    username: '',
    jdbcParameters: '',
    trustStorePath: '',
    keyStorePath: '',
    tlsEnabled: false,
  };
  job = {
    name: 'migration',
    sourceProfileId: 0,
    targetProfileId: 0,
    sourceSchema: '',
    entireSchema: true,
    overwrite: false,
  };
  sourceExports: SourceExport[] = [];
  sourceExport = { sourceProfileId: 0, name: 'Sybase native export', sourceSchema: '' };
  schemaLists = {
    export: { names: [] as string[], loading: false, error: '', request: 0 },
    migration: { names: [] as string[], loading: false, error: '', request: 0 },
  };
  private discoveryRequest = 0;
  clearMigrationObjects() {
    this.discoveryRequest++;
    this.objects = [];
    this.selected.clear();
  }
  async loadSchemas(flow: 'export' | 'migration') {
    const state = this.schemaLists[flow];
    const selection = flow === 'export' ? this.sourceExport : this.job;
    selection.sourceSchema = '';
    state.names = [];
    state.error = '';
    state.loading = false;
    const request = ++state.request;
    if (flow === 'migration') this.clearMigrationObjects();
    if (!selection.sourceProfileId) return;
    if (!(await this.ensureCredentials([selection.sourceProfileId]))) return;
    if (request !== state.request) return;
    state.loading = true;
    this.http.get<string[]>(`${this.api}/profiles/${selection.sourceProfileId}/schemas`).subscribe({
      next: (names) => {
        if (request !== state.request) return;
        state.names = names;
        state.loading = false;
        if (!names.length) state.error = 'No schemas are available for this connection.';
      },
      error: (e) => {
        if (request !== state.request) return;
        state.loading = false;
        state.error =
          e.error?.error || 'Could not load schemas. Check connection credentials and retry.';
      },
    });
  }
  exporting = false;
  loadSourceExports() {
    this.http.get<SourceExport[]>(`${this.api}/source-scripts`).subscribe({
      next: (reports) => (this.sourceExports = reports),
      error: (e) => {
        if (this.activePage === 'source-scripts') this.fail(e);
      },
    });
  }
  async generateSourceScripts() {
    if (!(await this.ensureCredentials([this.sourceExport.sourceProfileId]))) return;
    if (!this.schemaLists.export.names.includes(this.sourceExport.sourceSchema)) return;
    this.exporting = true;
    this.http.post<SourceExport>(`${this.api}/source-scripts`, this.sourceExport).subscribe({
      next: () => {
        this.exporting = false;
        this.message = 'Native Sybase script extraction queued.';
        this.loadSourceExports();
      },
      error: (e) => {
        this.exporting = false;
        this.fail(e);
      },
    });
  }
  downloadSourceScript(id: string, file: string) {
    window.open(`${this.api}/source-scripts/${id}/${file}`, '_blank');
  }
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.refresh();
    setInterval(() => {
      this.loadSourceExports();
      this.loadJobs();
      this.loadReconciliationRuns();
      this.loadQualitativeReports();
    }, 5000);
  }
  refresh() {
    this.http.get<Profile[]>(`${this.api}/profiles`).subscribe((v) => (this.profiles = v));
    this.loadSourceExports();
    this.loadJobs();
    this.loadReconciliationRuns();
    this.loadQualitativeConfiguration();
    this.loadQualitativeReports();
  }
  loadJobs() {
    this.http.get<Job[]>(`${this.api}/jobs`).subscribe((v) => (this.jobs = v));
  }
  navigate(
    page:
      | 'db-configurations'
      | 'source-scripts'
      | 'build-migrations'
      | 'reconciliation-home'
      | 'quantitative-reconciliation'
      | 'qualitative-reconciliation',
  ) {
    this.activePage = page;
    this.message = '';
  }
  pageTitle() {
    if (this.activePage === 'db-configurations') return 'DB Configurations';
    if (this.activePage === 'source-scripts') return 'Generate Source Scripts';
    if (this.activePage === 'build-migrations') return 'Build Migrations';
    if (this.activePage === 'reconciliation-home') return 'Reconciliation Reports';
    if (this.activePage === 'quantitative-reconciliation') return 'Quantitative Reconciliation';
    return 'Qualitative Reconciliation';
  }
  addProfile() {
    this.profile = {
      name: '',
      databaseType: 'SYBASE_ASE',
      databaseVersion: '',
      authType: 'DB_SECRET',
      host: 'localhost',
      port: 5000,
      databaseName: '',
      serviceName: '',
      username: '',
      jdbcParameters: '',
      trustStorePath: '',
      keyStorePath: '',
      tlsEnabled: false,
    };
    this.showProfileForm = true;
  }
  editProfile(profile: Profile) {
    this.profile = { ...profile };
    this.activeProfileId = profile.id;
    this.showProfileForm = true;
  }
  cancelProfile() {
    this.showProfileForm = false;
  }
  deleteProfile(profile: Profile) {
    if (!confirm(`Delete connection profile "${profile.name}"?`)) return;
    this.http.delete(`${this.api}/profiles/${profile.id}`).subscribe({
      next: () => {
        this.message = 'Connection profile deleted.';
        this.refresh();
      },
      error: (error) => this.fail(error),
    });
  }
  saveProfile() {
    this.busy = true;
    const request = this.profile.id
      ? this.http.put<Profile>(`${this.api}/profiles/${this.profile.id}`, this.profile)
      : this.http.post<Profile>(`${this.api}/profiles`, this.profile);
    request.subscribe({
      next: (p) => {
        this.activeProfileId = p.id;
        this.showProfileForm = false;
        this.message = 'Connection configuration saved.';
        this.refresh();
        this.busy = false;
      },
      error: (e) => this.fail(e),
    });
  }
  async test(p: Profile) {
    if (!(await this.ensureCredentials([p.id!]))) return;
    this.http.post<any>(`${this.api}/profiles/${p.id}/test`, {}).subscribe(
      (v) => (this.message = v.message),
      (error) => this.fail(error),
    );
  }
  discover() {
    this.clearMigrationObjects();
    if (!this.schemaLists.migration.names.includes(this.job.sourceSchema)) return;
    const request = this.discoveryRequest;
    this.http
      .get<DbObject[]>(`${this.api}/profiles/${this.job.sourceProfileId}/objects`, {
        params: { schema: this.job.sourceSchema },
      })
      .subscribe({
        next: (v) => {
          if (request === this.discoveryRequest) this.objects = v;
        },
        error: (e) => {
          if (request === this.discoveryRequest) this.fail(e);
        },
      });
  }
  toggle(o: DbObject, event: Event) {
    const k = o.type + '|' + o.name;
    (event.target as HTMLInputElement).checked ? this.selected.add(k) : this.selected.delete(k);
  }
  async createAndStart() {
    if (!(await this.ensureCredentials([this.job.sourceProfileId, this.job.targetProfileId])))
      return;
    if (!this.schemaLists.migration.names.includes(this.job.sourceSchema)) return;
    if (
      this.job.overwrite &&
      !confirm('Existing scripts for this migration name will be overwritten. Continue?')
    )
      return;
    const selectedObjects = this.objects.filter((o) => this.selected.has(o.type + '|' + o.name));
    this.http.post<Job>(`${this.api}/jobs`, { ...this.job, selectedObjects }).subscribe({
      next: (j) =>
        this.http.post(`${this.api}/jobs/${j.id}/start`, {}).subscribe(() => {
          this.message = 'Migration generation started.';
          this.loadSourceExports();
          this.loadJobs();
        }),
      error: (e) => this.fail(e),
    });
  }
  async action(j: Job, a: 'resume' | 'retry') {
    if (!(await this.ensureCredentials([j.sourceProfile.id!, j.targetProfile.id!]))) return;
    this.http.post(`${this.api}/jobs/${j.id}/${a}`, {}).subscribe(() => {
      this.message = `${a} started`;
      this.loadSourceExports();
      this.loadJobs();
    });
  }
  upload(j: Job, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const f = new FormData();
    f.append('file', input.files[0]);
    this.http.post(`${this.api}/jobs/${j.id}/failure-manifest`, f).subscribe(() => {
      this.message = 'Failure manifest imported. Click Retry failures.';
      this.loadSourceExports();
      this.loadJobs();
    });
  }
  manifest(j: Job) {
    window.open(`${this.api}/jobs/${j.id}/failure-manifest`, '_blank');
  }
  progress(j: Job) {
    return j.totalUnits
      ? Math.min(100, Math.round(((j.completedUnits + j.failedUnits) / j.totalUnits) * 100))
      : 0;
  }
  successWidth() {
    const total = this.jobs.reduce((n, j) => n + j.completedUnits + j.failedUnits, 0);
    return total
      ? Math.round((this.jobs.reduce((n, j) => n + j.completedUnits, 0) * 100) / total)
      : 0;
  }
  failedWidth() {
    const total = this.jobs.reduce((n, j) => n + j.completedUnits + j.failedUnits, 0);
    return total ? Math.round((this.jobs.reduce((n, j) => n + j.failedUnits, 0) * 100) / total) : 0;
  }
  statusCount(status: string) {
    return this.jobs.filter((j) => j.status === status).length;
  }
  loadReconciliationRuns() {
    this.http
      .get<ReconciliationRun[]>(`${this.api}/reconciliation/reports`)
      .subscribe((runs) => (this.reconciliationRuns = runs));
    if (this.activeRun?.status === 'CREATED' || this.activeRun?.status === 'RUNNING') {
      this.http
        .get<RunStatus>(`${this.api}/reconciliation/runs/${this.activeRun.reportId}/status`)
        .subscribe((status) => {
          this.activeRun = status;
          if (status.status.startsWith('COMPLETED')) {
            this.loadReconciliationRuns();
            this.reloadReport(status.reportId);
          }
        });
    }
  }
  loadQualitativeConfiguration() {
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/logical-tables`)
      .subscribe((v) => (this.logicalTables = v));
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/db-tables`)
      .subscribe((v) => (this.dbTableMappings = v));
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/pairs`)
      .subscribe((v) => (this.reconPairs = v));
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/batches`)
      .subscribe((v) => (this.reconBatches = v));
  }
  saveLogicalTable() {
    const body = this.logicalForm;
    const request = body.id
      ? this.http.put(`${this.api}/qualitative/config/logical-tables/${body.id}`, body)
      : this.http.post(`${this.api}/qualitative/config/logical-tables`, body);
    request.subscribe({
      next: () => {
        this.logicalForm = { id: 0, name: '', description: '', autoCompare: true, active: true };
        this.loadQualitativeConfiguration();
      },
      error: (e) => this.fail(e),
    });
  }
  editLogicalTable(row: ConfigRow) {
    this.logicalForm = {
      id: row.ID,
      name: row.NAME,
      description: row.DESCRIPTION || '',
      autoCompare: row.AUTO_COMPARE,
      active: row.ACTIVE,
    };
    this.selectLogicalTable(row.ID);
  }
  selectLogicalTable(id: number) {
    this.selectedLogicalTableId = id;
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/logical-tables/${id}/columns`)
      .subscribe((v) => (this.logicalColumns = v));
  }
  saveLogicalColumn() {
    const body = { ...this.columnForm, logicalTableId: this.selectedLogicalTableId };
    const request = body.id
      ? this.http.put(`${this.api}/qualitative/config/logical-columns/${body.id}`, body)
      : this.http.post(`${this.api}/qualitative/config/logical-columns`, body);
    request.subscribe({
      next: () => {
        this.columnForm = { id: 0, name: '', excluded: false, primaryKeyPosition: null };
        this.selectLogicalTable(this.selectedLogicalTableId);
      },
      error: (e) => this.fail(e),
    });
  }
  editLogicalColumn(row: ConfigRow) {
    this.columnForm = {
      id: row.ID,
      name: row.NAME,
      excluded: row.EXCLUDED,
      primaryKeyPosition: row.PRIMARY_KEY_POSITION,
    };
  }
  saveDbTable() {
    const body = this.dbTableForm;
    const request = body.id
      ? this.http.put(`${this.api}/qualitative/config/db-tables/${body.id}`, body)
      : this.http.post(`${this.api}/qualitative/config/db-tables`, body);
    request.subscribe({
      next: () => {
        this.dbTableForm = {
          id: 0,
          logicalTableId: 0,
          connectionProfileId: 0,
          schemaName: '',
          tableName: '',
          active: true,
        };
        this.loadQualitativeConfiguration();
      },
      error: (e) => this.fail(e),
    });
  }
  editDbTable(row: ConfigRow) {
    this.dbTableForm = {
      id: row.ID,
      logicalTableId: row.LOGICAL_TABLE_ID,
      connectionProfileId: row.CONNECTION_PROFILE_ID,
      schemaName: row.SCHEMA_NAME,
      tableName: row.TABLE_NAME,
      active: row.ACTIVE,
    };
  }
  savePair() {
    const body = this.pairForm;
    const request = body.id
      ? this.http.put(`${this.api}/qualitative/config/pairs/${body.id}`, body)
      : this.http.post(`${this.api}/qualitative/config/pairs`, body);
    request.subscribe({
      next: () => {
        this.pairForm = {
          id: 0,
          logicalTableId: 0,
          sourceTableMappingId: 0,
          targetTableMappingId: 0,
          active: true,
        };
        this.loadQualitativeConfiguration();
      },
      error: (e) => this.fail(e),
    });
  }
  editPair(row: ConfigRow) {
    this.pairForm = {
      id: row.ID,
      logicalTableId: row.LOGICAL_TABLE_ID,
      sourceTableMappingId: row.SOURCE_TABLE_MAPPING_ID,
      targetTableMappingId: row.TARGET_TABLE_MAPPING_ID,
      active: row.ACTIVE,
    };
    this.selectPair(row.ID);
  }
  selectPair(id: number) {
    this.selectedPairId = id;
    const pair = this.reconPairs.find((v) => v.ID === id);
    if (!pair) return;
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/pairs/${id}/columns`)
      .subscribe((v) => (this.mappedColumns = v));
    this.http
      .get<string[]>(`${this.api}/qualitative/config/profiles/${pair.SOURCE_PROFILE_ID}/columns`, {
        params: { schema: pair.SOURCE_SCHEMA, table: pair.SOURCE_TABLE },
      })
      .subscribe({ next: (v) => (this.sourceMapperColumns = v), error: (e) => this.fail(e) });
    this.http
      .get<string[]>(`${this.api}/qualitative/config/profiles/${pair.TARGET_PROFILE_ID}/columns`, {
        params: { schema: pair.TARGET_SCHEMA, table: pair.TARGET_TABLE },
      })
      .subscribe({ next: (v) => (this.targetMapperColumns = v), error: (e) => this.fail(e) });
    this.selectLogicalTable(pair.LOGICAL_TABLE_ID);
  }
  autoMapColumns() {
    this.http
      .post<ConfigRow[]>(`${this.api}/qualitative/config/pairs/${this.selectedPairId}/auto-map`, {})
      .subscribe({ next: (v) => (this.mappedColumns = v), error: (e) => this.fail(e) });
  }
  dropColumn(target: string) {
    if (!this.draggedSource) return;
    const logical = this.logicalColumns.find(
      (v) => String(v.NAME).toUpperCase() === this.draggedSource.toUpperCase(),
    );
    if (!logical) {
      this.message = 'Create the logical column before mapping it.';
      return;
    }
    this.mappedColumns = this.mappedColumns.filter(
      (v) => v.LOGICAL_COLUMN_ID !== logical.ID && v.TARGET_COLUMN_NAME !== target,
    );
    this.mappedColumns.push({
      LOGICAL_COLUMN_ID: logical.ID,
      LOGICAL_COLUMN_NAME: logical.NAME,
      SOURCE_COLUMN_NAME: this.draggedSource,
      TARGET_COLUMN_NAME: target,
    });
    this.draggedSource = '';
  }
  saveColumnMappings() {
    const body = this.mappedColumns.map((v) => ({
      logicalColumnId: v.LOGICAL_COLUMN_ID,
      sourceColumnName: v.SOURCE_COLUMN_NAME,
      targetColumnName: v.TARGET_COLUMN_NAME,
    }));
    this.http
      .put(`${this.api}/qualitative/config/pairs/${this.selectedPairId}/columns`, body)
      .subscribe({
        next: () => (this.message = 'Column mappings saved.'),
        error: (e) => this.fail(e),
      });
  }
  mappingForTarget(name: string) {
    return this.mappedColumns.find((v) => v.TARGET_COLUMN_NAME === name)?.SOURCE_COLUMN_NAME || '';
  }
  saveBatch() {
    const body = this.batchForm;
    const request = body.id
      ? this.http.put(`${this.api}/qualitative/config/batches/${body.id}`, body)
      : this.http.post(`${this.api}/qualitative/config/batches`, body);
    request.subscribe({
      next: () => this.loadQualitativeConfiguration(),
      error: (e) => this.fail(e),
    });
  }
  editBatch(row: ConfigRow) {
    this.batchForm = {
      id: row.ID,
      name: row.NAME,
      description: row.DESCRIPTION || '',
      active: row.ACTIVE,
    };
    this.selectBatch(row.ID);
  }
  selectBatch(id: number) {
    this.selectedBatchId = id;
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/batches/${id}/tables`)
      .subscribe((v) => (this.batchTables = v));
  }
  batchHasPair(id: number) {
    return this.batchTables.some((v) => v.RECON_DB_MAPPING_ID === id);
  }
  toggleBatchPair(id: number, checked: boolean) {
    if (checked && !this.batchHasPair(id)) this.batchTables.push({ RECON_DB_MAPPING_ID: id });
    if (!checked) this.batchTables = this.batchTables.filter((v) => v.RECON_DB_MAPPING_ID !== id);
  }
  saveBatchTables() {
    const body = this.batchTables.map((v, index) => ({
      reconDbMappingId: v.RECON_DB_MAPPING_ID,
      executionOrder: index + 1,
    }));
    this.http
      .put(`${this.api}/qualitative/config/batches/${this.selectedBatchId}/tables`, body)
      .subscribe({
        next: () => {
          this.message = 'Batch table assignments saved.';
          this.selectBatch(this.selectedBatchId);
        },
        error: (e) => this.fail(e),
      });
  }
  loadEligibleBatches() {
    if (!this.qualExecution.sourceProfileId || !this.qualExecution.targetProfileId) return;
    this.http
      .get<ConfigRow[]>(`${this.api}/qualitative/config/batches`, {
        params: {
          sourceProfileId: this.qualExecution.sourceProfileId,
          targetProfileId: this.qualExecution.targetProfileId,
        },
      })
      .subscribe((v) => (this.reconBatches = v));
  }
  previewExecutionBatch() {
    this.selectBatch(this.qualExecution.batchId);
    this.showBatchPreview = true;
  }
  private credentialDone?: (accepted: boolean) => void;
  credentialSaving = false;
  private credentialQueue: Promise<boolean> = Promise.resolve(true);
  ensureCredentials(profileIds: number[]): Promise<boolean> {
    const ids = [...new Set(profileIds.filter((id) => id > 0))];
    const request = this.credentialQueue.then(async () => {
      try {
        for (const id of ids) {
          const status = await this.http
            .get<{ available: boolean }>(this.api + '/profiles/' + id + '/credentials/status')
            .toPromise();
          if (status?.available) continue;
          const accepted = await new Promise<boolean>((resolve) => {
            this.credentialDone = resolve;
            this.credentialPrompt = { ids: [id], index: 0, secret: '', keyStoreSecret: '' };
          });
          if (!accepted) return false;
        }
        return true;
      } catch (error) {
        this.fail(error);
        return false;
      }
    });
    this.credentialQueue = request;
    return request;
  }
  credentialProfileName() {
    const id = this.credentialPrompt?.ids[this.credentialPrompt.index];
    return this.profiles.find((p) => p.id === id)?.name || 'Selected database';
  }
  cancelCredentialPrompt() {
    this.credentialPrompt = null;
    const done = this.credentialDone;
    this.credentialDone = undefined;
    done?.(false);
  }
  async startQualitative() {
    if (
      await this.ensureCredentials([
        this.qualExecution.sourceProfileId,
        this.qualExecution.targetProfileId,
      ])
    )
      this.executeQualitative();
  }
  submitQualCredential() {
    if (!this.credentialPrompt || this.credentialSaving) return;
    const id = this.credentialPrompt.ids[this.credentialPrompt.index];
    this.credentialSaving = true;
    this.http
      .post(this.api + '/profiles/' + id + '/credentials', {
        databaseSecret: this.credentialPrompt.secret,
        keyStoreSecret: this.credentialPrompt.keyStoreSecret,
      })
      .subscribe({
        next: () => {
          this.credentialSaving = false;
          this.credentialPrompt = null;
          const done = this.credentialDone;
          this.credentialDone = undefined;
          done?.(true);
        },
        error: (error) => {
          this.credentialSaving = false;
          this.fail(error);
        },
      });
  }
  executeQualitative() {
    this.http.post<QualRun>(`${this.api}/qualitative/runs`, this.qualExecution).subscribe({
      next: (run) => {
        this.qualRun = run;
        this.message = 'Qualitative reconciliation started.';
      },
      error: (e) => this.fail(e),
    });
  }
  loadQualitativeReports() {
    this.http
      .get<QualReport[]>(`${this.api}/qualitative/reports`)
      .subscribe((v) => (this.qualReports = v));
    if (this.qualRun && ['CREATED', 'RUNNING'].includes(this.qualRun.status))
      this.http
        .get<QualRun>(`${this.api}/qualitative/runs/${this.qualRun.reportId}/status`)
        .subscribe((v) => {
          this.qualRun = v;
          if (v.status.startsWith('COMPLETED')) this.loadQualitativeReports();
        });
  }
  reloadQualitative(id: string) {
    this.http.get<QualReport>(`${this.api}/qualitative/reports/${id}`).subscribe((v) => {
      this.activeQualReport = v;
      this.activePage = 'qualitative-reconciliation';
      this.qualSection = 'execute';
    });
  }
  downloadQualitative(id: string) {
    window.open(`${this.api}/qualitative/reports/${id}/zip`, '_blank');
  }
  qualProgress() {
    return this.qualRun?.totalTables
      ? Math.round((this.qualRun.completedTables * 100) / this.qualRun.totalTables)
      : 0;
  }
  async startReconciliation() {
    if (!(await this.ensureCredentials([this.recon.sourceProfileId, this.recon.targetProfileId])))
      return;
    this.busy = true;
    this.http.post<RunStatus>(`${this.api}/reconciliation/runs`, this.recon).subscribe({
      next: (run) => {
        this.activeRun = run;
        this.activeReconciliation = undefined;
        this.objectCounts = [];
        this.allTableCounts = [];
        this.pageTableCounts(0);
        this.message = 'Quantitative reconciliation started.';
        this.busy = false;
      },
      error: (error) => this.fail(error),
    });
  }
  selectReconciliation(run: ReconciliationRun) {
    this.activeReconciliation = run;
    this.activeRun = undefined;
    this.reloadReport(run.reportId);
  }
  reloadReport(reportId: string) {
    this.http
      .get<QuantitativeReport>(`${this.api}/reconciliation/reports/${reportId}`)
      .subscribe((report) => {
        this.objectCounts = report.objectCounts;
        this.allTableCounts = report.recordCounts;
        this.pageTableCounts(0);
        this.activeReconciliation =
          this.reconciliationRuns.find((value) => value.reportId === reportId) ??
          ({
            reportId,
            generatedAt: report.metadata.generatedAt,
            source: report.metadata.source,
            target: report.metadata.target,
            status: report.metadata.status,
            matched: report.objectCounts.filter((value) => value.matched).length,
            mismatched: report.objectCounts.filter((value) => !value.matched).length,
            fileSize: 0,
            downloadable: true,
          } as ReconciliationRun);
      });
  }
  loadTableCounts(page: number) {
    this.pageTableCounts(page);
  }
  pageTableCounts(page: number) {
    const size = this.tableCounts.size;
    const from = Math.min(page * size, this.allTableCounts.length);
    this.tableCounts = {
      content: this.allTableCounts.slice(from, from + size),
      number: page,
      size,
      totalElements: this.allTableCounts.length,
      totalPages: Math.ceil(this.allTableCounts.length / size),
    };
  }
  changeTableSize(size: number) {
    this.tableCounts.size = size;
    this.loadTableCounts(0);
  }
  openDetails(result: ObjectCount) {
    this.details = result;
    this.pageDetails('source', 0);
    this.pageDetails('target', 0);
  }
  loadDetail(side: 'source' | 'target', page: number) {
    this.pageDetails(side, page);
  }
  pageDetails(side: 'source' | 'target', page: number) {
    if (!this.details) return;
    const values = side === 'source' ? this.details.missingInSource : this.details.missingInTarget;
    const from = Math.min(page * this.detailSize, values.length);
    const result: DetailPage = {
      content: values.slice(from, from + this.detailSize),
      page,
      size: this.detailSize,
      totalElements: values.length,
      totalPages: Math.ceil(values.length / this.detailSize),
    };
    if (side === 'source') this.missingSource = result;
    else this.missingTarget = result;
  }
  changeDetailSize(size: number) {
    this.detailSize = size;
    this.loadDetail('source', 0);
    this.loadDetail('target', 0);
  }
  downloadReport(reportId: string) {
    window.open(`${this.api}/reconciliation/reports/${reportId}/xlsx`, '_blank');
  }
  objectMatchCount(matched: boolean) {
    return this.objectCounts.filter((value) => value.matched === matched).length;
  }
  objectChartWidth(matched: boolean) {
    return this.objectCounts.length
      ? Math.round((this.objectMatchCount(matched) * 100) / this.objectCounts.length)
      : 0;
  }
  recordMatchCount(matched: boolean) {
    return this.allTableCounts.filter((value) => (value.status === 'MATCHED') === matched).length;
  }
  private fail(e: any) {
    this.message = e?.error?.error || e?.message || 'Request failed';
    this.busy = false;
  }
}
