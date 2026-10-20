/** 任务级迁移模式 */
export type MigrationMode = 'STRUCTURE_ONLY' | 'DATA_ONLY' | 'STRUCTURE_AND_DATA' | 'SQL_SCRIPT'

/** 表级模式（多一个 INHERIT_FROM_TASK；SQL_SCRIPT 已上收到任务级） */
export type TableMigrationMode =
  | 'STRUCTURE_ONLY'
  | 'DATA_ONLY'
  | 'STRUCTURE_AND_DATA'
  | 'INHERIT_FROM_TASK'

/** 脚本执行阶段 */
export type ScriptPhase = 'PRE' | 'MAIN' | 'POST'

/** 脚本执行库 */
export type ScriptTarget = 'TARGET_DB' | 'SOURCE_DB'

/** 脚本失败策略 */
export type ScriptOnError = 'ABORT' | 'CONTINUE'

/** 脚本写前动作: NONE=脚本自保证幂等 / TRUNCATE_TARGETS=同事务内先清空目标表再执行 */
export type ScriptPreWrite = 'NONE' | 'TRUNCATE_TARGETS'

/** 脚本状态 */
export type ScriptStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'

/** 脚本清单项（创建/更新入参） */
export interface ScriptItem {
  scriptName: string
  scriptContent: string
  execPhase?: ScriptPhase
  scriptType?: ScriptTarget
  onError?: ScriptOnError
  timeoutSec?: number
  enabled?: boolean
  sqlParams?: Record<string, unknown>
  /** 脚本影响的目标表清单(元素为 "table" 或 "schema.table");SQL_SCRIPT 模式自动比对时汇总 */
  targetTables?: string[]
  /** 写前动作: NONE=脚本自保证幂等 / TRUNCATE_TARGETS=同事务内先清空目标表再执行 */
  preWriteAction?: ScriptPreWrite
}

/** 脚本清单响应（含执行态） */
export interface ScriptResponse extends ScriptItem {
  id: number
  seq: number
  status: ScriptStatus
  executedStatements: number
  affectedRows: number
  /** 脚本影响的目标表清单(SQL_SCRIPT 自动比对用) */
  targetTables?: string[]
  errorMessage?: string
  startedAt?: string
  finishedAt?: string
}

/** 单脚本试运行结果 */
export interface ScriptDryRunResult {
  success: boolean
  statementCount?: number
  affectedRows?: number
  durationMs?: number
  errorMessage?: string
  errorLine?: number
}

/** 任务状态 */
export type TaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

/** 写入策略 */
export type WriteMode = 'TRUNCATE' | 'INSERT' | 'REPLACE' | 'UPSERT'

// ==================== 元数据 ====================

export interface TableMeta {
  schema: string
  tableName: string
  tableComment?: string
  rowCount: number
  columnCount: number
  hasPrimaryKey: boolean
  /** 对象类型: TABLE=表 / VIEW=视图(P1-12, 视图可选但无数据量) */
  objectType?: 'TABLE' | 'VIEW'
}

/** 是否为视图对象 */
export function isView(t: TableMeta): boolean {
  return t.objectType === 'VIEW'
}

export interface ColumnMeta {
  ordinal: number
  name: string
  dataType: string
  length?: number
  precision?: number
  scale?: number
  nullable: boolean
  isPrimaryKey: boolean
  isIdentity: boolean
  defaultValue?: string
  comment?: string
}

export interface TableStructure {
  schema: string
  tableName: string
  columns: ColumnMeta[]
  primaryKeys: string[]
}

// ==================== 任务 ====================

export interface ActiveWindow {
  startHour: number
  endHour: number
}

/** 视图的目标形态 */
export type ViewTargetType = 'TABLE' | 'VIEW'

/** 按表覆盖配置（key = "dbo.users"） */
export interface TableOverride {
  migrationMode?: TableMigrationMode
  writeMode?: WriteMode
  filterCondition?: string
  /** 目标表名（A -> B 改名；省略则与源表同名，可写 "name" 或 "schema.name"） */
  targetTable?: string
  /** 视图的目标形态（仅当源对象是视图时有意义；省略即物化为实体表） */
  targetObjectType?: ViewTargetType
  maxQps?: number
  activeWindow?: ActiveWindow
}

/** 列级映射 */
export interface ColumnMappingItem {
  sourceTable: string
  sourceColumn: string
  /** null/空 表示忽略该列 */
  targetColumn?: string
  targetType?: string
  defaultValue?: string
  transformExpr?: string
  remark?: string
}

export interface CreateMigrationTask {
  name: string
  /** 迁移源数据源 id(桥接 sys_data_source 字符串主键) */
  sourceId: string
  targetId: string
  migrationMode: MigrationMode
  parallelWorkers?: number
  batchSize?: number
  enableCheckpoint?: boolean
  /** 迁移成功后自动执行数据比对 */
  enableAutoCompare?: boolean
  /** 自动比对策略(默认 CHECKSUM) */
  autoCompareStrategy?: 'ROW_COUNT' | 'CHECKSUM' | 'DIFF_ROWS'
  /**
   * 标识符大小写策略(默认 PRESERVE)
   * LOWERCASE 推荐: 目标表名/列名统一转小写, PG 目标库查询免带双引号
   */
  identifierCase?: 'PRESERVE' | 'LOWERCASE' | 'UPPERCASE'
  /** SQL_SCRIPT 模式自动比对表清单(元素为 "table" 或 "schema.table") */
  compareTables?: string[]
  includeTables: string[]
  excludeTables?: string[]
  tableOverrides?: Record<string, TableOverride>
  columnMappings?: ColumnMappingItem[]
  /** SQL_SCRIPT 模式: 有序脚本清单 */
  scripts?: ScriptItem[]
  remark?: string
}

export interface MigrationTaskTable {
  id: number
  sourceTable: string
  targetTable: string
  /** 源对象类型(TABLE=表 / VIEW=视图) */
  objectType?: 'TABLE' | 'VIEW'
  /** 视图的目标形态(TABLE=实体表 / VIEW=视图); 编辑态回填用 */
  targetObjectType?: ViewTargetType
  migrationMode: TableMigrationMode
  writeMode: WriteMode
  filterCondition?: string
  maxQps?: number
  activeWindow?: ActiveWindow
  status: 'PENDING' | 'RUNNING' | 'STRUCTURE_DONE' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  totalRows: number
  migratedRows: number
  errorMessage?: string
  progressPercent?: number
  columnMappings?: ColumnMappingItem[]
}

export interface MigrationTask extends CreateMigrationTask {
  id: number
  status: TaskStatus
  sourceName?: string
  targetName?: string
  createTime?: string
  updateTime?: string
  taskTables?: MigrationTaskTable[]
  /** SQL_SCRIPT 模式下的脚本清单 */
  scripts?: ScriptResponse[]
}

// ==================== 任务进度 ====================

/** 任务聚合进度快照(WS 推送与 REST 兜底同源) */
export interface TaskProgressSnapshot {
  taskId?: number
  status?: string
  currentStage?: string
  totalTables?: number
  completedTables?: number
  failedTables?: number
  dataRunningTables?: number
  totalRows?: number
  migratedRows?: number
  /** 平滑迁移速率(行/秒, EMA) */
  qps?: number
  /** 预计剩余秒数(-1=不可估) */
  etaSeconds?: number
  historyId?: number
}

// ==================== 任务模板 ====================

/** 任务模板(JSON 序列化导出/导入, 完整承载任务配置) */
export interface TaskTemplate extends Omit<CreateMigrationTask, 'migrationMode'> {
  /** 模板格式版本(导出时写入, 导入时用于兼容判断) */
  templateVersion?: string
  /** 迁移模式(模板层允许缺省, 由导入处按需补全) */
  migrationMode?: MigrationMode
  /** 导出时间 */
  exportedAt?: string
}

// ==================== 预检查 ====================

export type PrecheckLevel = 'INFO' | 'WARN' | 'ERROR'
export type PrecheckStatus = 'PASS' | 'FAIL' | 'SKIP'

export interface PrecheckItem {
  category: 'SOURCE' | 'TARGET' | 'TYPE' | 'CONFIG' | 'NETWORK'
  key: string
  level: PrecheckLevel
  status: PrecheckStatus
  message: string
  checkedAt?: string
}

export interface PrecheckSummary {
  passed: boolean
  passCount: number
  failCount: number
  warnCount: number
  items: PrecheckItem[]
}

