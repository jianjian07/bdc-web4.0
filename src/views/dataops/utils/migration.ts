import type { MigrationMode, TaskStatus, WriteMode } from '/@/views/dataops/api/model/migration'

/** 模式显示文案 */
export const MIGRATION_MODE_LABELS: Record<string, string> = {
  STRUCTURE_ONLY: '仅结构',
  DATA_ONLY: '仅数据',
  STRUCTURE_AND_DATA: '结构+数据',
  SQL_SCRIPT: 'SQL 脚本',
  INHERIT_FROM_TASK: '继承任务'
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: '待启动',
  RUNNING: '运行中',
  PAUSED: '已暂停',
  COMPLETED: '已完成',
  FAILED: '失败',
  CANCELLED: '已取消'
}

export const WRITE_MODE_LABELS: Record<WriteMode, string> = {
  TRUNCATE: '清空再写入 (TRUNCATE)',
  INSERT: '追加写入 (INSERT)',
  REPLACE: '替换冲突行 (REPLACE)',
  UPSERT: '存在则更新 (UPSERT)'
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: 'default',
  RUNNING: 'processing',
  PAUSED: 'warning',
  COMPLETED: 'success',
  FAILED: 'error',
  CANCELLED: 'default'
}

/** MSSQL -> PG 类型自动映射建议（向导列映射步骤预填） */
const TYPE_MAP: Record<string, string> = {
  bigint: 'bigint',
  int: 'integer',
  smallint: 'smallint',
  tinyint: 'smallint',
  bit: 'boolean',
  decimal: 'numeric',
  numeric: 'numeric',
  money: 'numeric(19,4)',
  smallmoney: 'numeric(10,4)',
  float: 'double precision',
  real: 'real',
  date: 'date',
  datetime: 'timestamp',
  datetime2: 'timestamp',
  smalldatetime: 'timestamp',
  datetimeoffset: 'timestamptz',
  time: 'time',
  char: 'char',
  nchar: 'char',
  varchar: 'varchar',
  nvarchar: 'varchar',
  text: 'text',
  ntext: 'text',
  uniqueidentifier: 'uuid',
  varbinary: 'bytea',
  binary: 'bytea',
  image: 'bytea',
  // 以下类型后端 `TypeMapping.UNSUPPORTED` 明确拒绝（返回 null，预检查会拦），
  // 前端必须同步标记为 unsupported，否则向导会预填一个后端根本不认的类型：
  // - xml：PG 虽有 xml 类型，但 SQL Server xml 的文档序/命名空间语义无法平移，后端一律拒绝
  // - rowversion / timestamp：SQL Server 的自动递增**行版本号**（不是时间！），
  //   由引擎维护、不可写入，迁移后目标库无法延续其语义
  // - cursor / table：非持久化数据类型，不会出现在表结构中
  xml: 'unsupported',
  rowversion: 'unsupported',
  timestamp: 'unsupported',
  cursor: 'unsupported',
  table: 'unsupported',
  geometry: 'unsupported',
  geography: 'unsupported',
  hierarchyid: 'unsupported',
  sql_variant: 'unsupported'
}

/**
 * 是否为后端明确拒绝自动映射的类型
 *
 * `suggestTargetType` 对「不支持」与「未知类型」都返回 undefined，无法区分；
 * 而两者的 UI 提示应该不同：前者需要明确告知用户「必须手工指定或忽略」，
 * 否则 placeholder 的「自动映射」会让用户误以为能生效，直到预检查才发现失败。
 *
 * @param dataType 源类型名
 */
export function isUnsupportedType(dataType: string): boolean {
  return TYPE_MAP[(dataType || '').toLowerCase()] === 'unsupported'
}

/**
 * 小数秒精度上限(SQL Server 最大 7 位,PG timestamp/time 最大 6 位微秒)
 * 超出部分后端 TypeMapping 会截断,这里同步截断,避免向导显示的类型与实际建表类型不一致
 */
const MAX_FRACTION_DIGITS = 6

/** 需要按 scale 保留小数秒精度的时间类型 */
const FRACTIONAL_TIME_TYPES = ['datetime2', 'time', 'datetimeoffset']

/**
 * 根据源类型给出 PG 类型建议
 *
 * <p><b>必须与后端 `util/TypeMapping.toPostgresType()` 保持一致</b> ——
 * 向导里预填的目标类型就是用户看到的"最终类型",两处口径漂移会造成所见非所得。
 * 未修改类型的列不会生成映射记录,后端会用自己的 TypeMapping 建表。</p>
 *
 * @param dataType 源类型名（如 nvarchar / datetime2）
 * @param length   字符长度。SQL Server 的 `sys.columns.max_length` 对 nvarchar/nchar
 *                 返回的是**字节数**(UTF-16 每字符 2 字节),因此 n 系列需折半;
 *                 `-1` 表示 MAX
 * @param scale    小数秒位数,仅对 datetime2 / time / datetimeoffset 有意义
 */
export function suggestTargetType(
  dataType: string,
  length?: number,
  scale?: number
): string | undefined {
  const t = (dataType || '').toLowerCase()
  const base = TYPE_MAP[t]
  if (!base || base === 'unsupported') return undefined

  if (t === 'nvarchar' || t === 'nchar') {
    if (length === undefined || length === -1) return 'text'
    const half = Math.floor(length / 2)
    if (half <= 0) return 'text'
    return `${base}(${half})`
  }

  if (t === 'varchar' || t === 'char') {
    // length 缺失或为 MAX(-1) 时退化为 text,否则会拼出 varchar(undefined) 这类非法 DDL
    if (length === undefined || length <= 0) return 'text'
    return `${base}(${length})`
  }

  if (FRACTIONAL_TIME_TYPES.includes(t)) {
    const frac = Math.min(scale ?? 0, MAX_FRACTION_DIGITS)
    return frac > 0 ? `${base}(${frac})` : base
  }

  return base
}

/** 组装源表 "schema.table" 标识 */
export function qualifiedName(schema: string, table: string) {
  return `${schema}.${table}`
}

/** 任务级模式文案描述 */
export const MIGRATION_MODE_DESCRIPTIONS: Record<MigrationMode, string> = {
  STRUCTURE_ONLY: '仅在目标库建表（DDL），不迁移数据。适合先建表后补数据的场景。',
  DATA_ONLY: '假设目标表已存在，仅迁移数据。适合多次同步的测试库。',
  STRUCTURE_AND_DATA: '先建表再搬数据（默认）。适合首次全量迁移。',
  SQL_SCRIPT: '按顺序执行任务下的脚本清单（可添加多个脚本），用于数据加工/聚合/清洗。每个脚本独立一个事务。'
}

//region ==================== 过滤条件安全校验 ====================

/**
 * 表级过滤条件(filterCondition)前端校验
 *
 * 过滤条件会被后端以字符串拼接方式嵌入 `SELECT ... WHERE (<filter>)`，无法参数化，
 * 因此后端 `util/SqlFilterValidator` 对其做了严格限制。本模块是它的**前端轻量镜像**：
 * 让用户在输入框里就立刻看到被拒原因，而不是走到「预检查」或「创建任务」才报错。
 *
 * 两侧规则必须保持同步；**后端始终是权威**，前端仅用于提前反馈，
 * 绕过前端（直调 API）仍会被后端拦住。
 */

/** 过滤条件长度上限（与后端 `SqlFilterValidator.MAX_LENGTH` 一致） */
export const FILTER_MAX_LENGTH = 2000

/** 输入框旁的规则提示文案 */
export const FILTER_CONDITION_HINT =
  '仅允许只读的 WHERE 布尔表达式。禁用：分号 ; 、注释 -- 与 /* */ 、# 、' +
  'UNION / INTO 、增删改类关键字（INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE/EXEC 等）、' +
  '系统目录（sys.* / information_schema / pg_catalog）、时间型盲注函数（WAITFOR/SLEEP）。' +
  `上限 ${FILTER_MAX_LENGTH} 字符。字符串字面量内部的关键字不会被误判，如 remark = 'please delete' 可正常通过。`

/** 禁用关键字（与后端 `FORBIDDEN_KEYWORDS` 一致） */
const FILTER_FORBIDDEN_KEYWORDS = new Set([
  // DML / DDL
  'INSERT', 'UPDATE', 'DELETE', 'MERGE',
  'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'RENAME',
  'GRANT', 'REVOKE', 'DENY',
  // 事务与会话控制
  'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'TRANSACTION', 'SET', 'SHUTDOWN', 'KILL',
  // 过程调用 / 动态 SQL
  'EXEC', 'EXECUTE', 'DO', 'DECLARE', 'DBCC', 'PREPARE', 'DEALLOCATE',
  // 批量与文件通道
  'COPY', 'BULK', 'OPENROWSET', 'OPENDATASOURCE', 'OPENQUERY', 'OUTFILE', 'DUMPFILE',
  // 查询形态注入（布尔表达式中永不应出现）
  'UNION', 'INTO', 'FOR',
  // 时间型盲注
  'WAITFOR', 'SLEEP', 'BENCHMARK',
  // 有副作用的序列操作
  'NEXTVAL', 'SETVAL'
])

/** 高危函数名（仅在紧跟 `(` 即真正发生调用时才拦截） */
const FILTER_DANGEROUS_FUNCTIONS = new Set([
  // PostgreSQL 文件 / 进程 / 配置
  'PG_READ_FILE', 'PG_READ_BINARY_FILE', 'PG_LS_DIR', 'PG_STAT_FILE',
  'PG_TERMINATE_BACKEND', 'PG_CANCEL_BACKEND', 'PG_RELOAD_CONF', 'PG_SLEEP',
  // PostgreSQL 大对象与外部连接
  'LO_IMPORT', 'LO_EXPORT', 'LO_UNLINK',
  'DBLINK', 'DBLINK_EXEC', 'DBLINK_CONNECT', 'DBLINK_SEND_QUERY',
  // SQL Server
  'XP_CMDSHELL', 'SP_EXECUTESQL', 'SP_CONFIGURE', 'SP_OACREATE', 'SP_OAMETHOD',
  // MySQL 风格（兼容拦截）
  'SLEEP', 'BENCHMARK', 'LOAD_FILE',
  // Oracle 风格（兼容拦截）
  'UTL_FILE', 'UTL_HTTP', 'UTL_TCP'
])

/** 系统目录 / 系统对象名（与后端 `SYSTEM_OBJECTS` 一致） */
const FILTER_SYSTEM_OBJECTS = new Set([
  'SYS', 'SYSOBJECTS', 'SYSCOLUMNS', 'SYSLOGINS', 'SYSUSERS', 'SYSDATABASES',
  'SYSTYPES', 'SYSINDEXES', 'SYSPROCESSES', 'SYSSERVERS', 'SYSFILES',
  'SYSPERMISSIONS', 'SYSCOMMENTS', 'SYSCONFIGURES', 'SYSMESSAGES',
  'MASTER', 'MSDB', 'TEMPDB',
  'INFORMATION_SCHEMA',
  'PG_CATALOG', 'PG_CLASS', 'PG_NAMESPACE', 'PG_ATTRIBUTE', 'PG_PROC', 'PG_TYPE',
  'PG_USER', 'PG_USERS', 'PG_SHADOW', 'PG_AUTHID', 'PG_ROLES', 'PG_SETTINGS',
  'PG_STAT_ACTIVITY', 'PG_DATABASE', 'PG_TABLES', 'PG_INDEX', 'PG_CONSTRAINT',
  'PG_LARGEOBJECT', 'PG_FILE_SETTINGS', 'PG_HBA_FILE_RULES', 'PG_SEQUENCES',
  'SQLITE_MASTER'
])

/** 禁用标识符前缀（仅函数调用形态时拦截，避免误杀同名列） */
const FILTER_FORBIDDEN_PREFIXES = ['xp_', 'sp_', 'pg_', 'lo_', 'dm_', 'fn_', 'utl_']

/** 允许出现的符号（分号、井号等在词法扫描阶段即被拒绝） */
const FILTER_ALLOWED_SYMBOLS = new Set([
  '(', ')', ',', '.', '+', '-', '*', '/', '%',
  '=', '<', '>', '!', '&', '|', '^', '~', ':'
])

/** 以下正则对齐 Java 的 `Character.isLetter/isDigit/isLetterOrDigit/isWhitespace`，支持 Unicode */
const RE_SPACE = /\s/u
const RE_LETTER = /[\p{L}_]/u
const RE_DIGIT = /\p{Nd}/u
const RE_WORD_CHAR = /[\p{L}\p{Nd}_$]/u

type FilterTokenType = 'WORD' | 'NUM' | 'STR' | 'QUOTED' | 'SYM'

interface FilterToken {
  type: FilterTokenType
  text: string
}

/**
 * 扫描以 `quote` 起始的字面量，返回结束下标（不含）；未闭合返回 -1。
 * 支持 `''` / `""` / ``` `` ``` 双写转义。
 */
function scanQuoted(s: string, start: number, quote: string): number {
  const n = s.length
  let j = start + 1
  while (j < n) {
    if (s[j] === quote) {
      if (j + 1 < n && s[j + 1] === quote) {
        j += 2
        continue
      }
      return j + 1
    }
    j++
  }
  return -1
}

/**
 * 逐字符扫描切 token。字符串与引用标识符整体作为一个 token，
 * 其内容**不参与**关键字匹配（否则 `name = 'update time'` 会被误杀）。
 */
function tokenizeFilter(s: string): { tokens: FilterToken[]; error?: string } {
  const out: FilterToken[] = []
  const n = s.length
  let depth = 0
  let i = 0
  while (i < n) {
    const c = s[i]

    if (RE_SPACE.test(c)) {
      i++
      continue
    }

    // 注释: 可用于截断语句或藏匿关键字,一律拒绝
    if (c === '-' && s[i + 1] === '-') return { tokens: out, error: "不允许包含行注释 '--'" }
    if (c === '/' && s[i + 1] === '*') return { tokens: out, error: "不允许包含块注释 '/*'" }
    if (c === '*' && s[i + 1] === '/') return { tokens: out, error: "不允许包含块注释 '*/'" }
    // 多语句: 最经典的注入形态
    if (c === ';') return { tokens: out, error: "不允许多语句（出现 ';'）" }
    // '#' 在 SQL Server 是临时表前缀、在 MySQL 是行注释,都不应出现
    if (c === '#') return { tokens: out, error: "不允许包含 '#'（临时表或注释语法）" }

    // 字符串字面量 / 引用标识符: 整体吞掉
    if (c === "'" || c === '"' || c === '`') {
      const end = scanQuoted(s, i, c)
      if (end < 0) {
        return {
          tokens: out,
          error:
            c === "'"
              ? "字符串字面量未闭合（缺少结尾的 '）"
              : `引用标识符未闭合（缺少结尾的 ${c}）`
        }
      }
      out.push({ type: c === "'" ? 'STR' : 'QUOTED', text: s.slice(i, end) })
      i = end
      continue
    }
    // SQL Server 方括号引用标识符
    if (c === '[') {
      const end = s.indexOf(']', i + 1)
      if (end < 0) return { tokens: out, error: '引用标识符未闭合（缺少结尾的 ]）' }
      out.push({ type: 'QUOTED', text: s.slice(i, end + 1) })
      i = end + 1
      continue
    }

    if (RE_LETTER.test(c)) {
      let j = i
      while (j < n && RE_WORD_CHAR.test(s[j])) j++
      out.push({ type: 'WORD', text: s.slice(i, j) })
      i = j
      continue
    }
    if (RE_DIGIT.test(c)) {
      let j = i
      while (j < n && RE_WORD_CHAR.test(s[j])) j++
      out.push({ type: 'NUM', text: s.slice(i, j) })
      i = j
      continue
    }

    if (c === '(') {
      depth++
    } else if (c === ')') {
      depth--
      if (depth < 0) return { tokens: out, error: "括号不匹配: 出现多余的 ')'" }
    }
    out.push({ type: 'SYM', text: c })
    i++
  }
  if (depth > 0) return { tokens: out, error: `括号不匹配: 缺少 ${depth} 个 ')'` }
  return { tokens: out }
}

/**
 * 校验单个过滤条件
 *
 * @param filter 过滤条件，空值（null / undefined / 空白）表示不过滤，直接通过
 * @returns 第一条拒绝原因；通过时返回 `undefined`
 */
export function validateFilterCondition(filter?: string | null): string | undefined {
  if (filter === null || filter === undefined) return undefined
  const text = filter.trim()
  if (!text) return undefined
  if (text.length > FILTER_MAX_LENGTH) {
    return `过滤条件过长（上限 ${FILTER_MAX_LENGTH} 字符，当前 ${text.length}）`
  }

  const { tokens, error } = tokenizeFilter(text)
  // 词法层已判定非法,不再做语义判断（此时 token 序列可能不完整）
  if (error) return error

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]

    if (t.type === 'SYM') {
      if (!FILTER_ALLOWED_SYMBOLS.has(t.text)) {
        return `包含非法字符 '${t.text}'（仅允许比较/算术/逻辑运算符与括号）`
      }
      continue
    }
    // NUM / STR / QUOTED 均为字面量或显式引用标识符,无需匹配关键字
    if (t.type !== 'WORD') continue

    const upper = t.text.toUpperCase()
    if (FILTER_FORBIDDEN_KEYWORDS.has(upper)) {
      return `只允许只读的 WHERE 布尔表达式，检测到禁用关键字: ${upper}`
    }
    if (FILTER_SYSTEM_OBJECTS.has(upper)) {
      return `不允许访问系统目录/系统对象: ${t.text}`
    }

    // 非函数调用形态时不检查函数黑名单与前缀,避免误杀同名列
    const next = tokens[i + 1]
    if (!(next && next.type === 'SYM' && next.text === '(')) continue
    if (FILTER_DANGEROUS_FUNCTIONS.has(upper)) {
      return `包含高危函数调用: ${t.text}`
    }
    const lower = t.text.toLowerCase()
    for (const p of FILTER_FORBIDDEN_PREFIXES) {
      if (lower.startsWith(p)) return `不允许调用 ${p}* 系统过程/函数: ${t.text}`
    }
  }
  return undefined
}

/**
 * 批量校验多张表的过滤条件
 *
 * @param entries `[表名, 过滤条件]` 二元组集合
 * @returns 第一条非法项（含表名）；全部通过时返回 `undefined`
 */
export function findInvalidFilterCondition(
  entries: Iterable<readonly [string, string | undefined]>
): { table: string; reason: string } | undefined {
  for (const [table, filter] of entries) {
    const reason = validateFilterCondition(filter)
    if (reason) return { table, reason }
  }
  return undefined
}

//endregion
