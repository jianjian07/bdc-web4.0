<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TableColumnsType } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { listDataSourcesApi } from '/@/views/dataops/api/datasource'
import { getTableColumnsApi, listTablesApi } from '/@/views/dataops/api/metadata'
import {
  createMigrationTaskApi,
  getMigrationTaskApi,
  runPrecheckApi,
  updateMigrationTaskApi
} from '/@/views/dataops/api/migration'
import type { DataSource } from '/@/views/dataops/api/model/datasource'
import type {
  ColumnMappingItem,
  ColumnMeta,
  CreateMigrationTask,
  MigrationMode,
  PrecheckSummary,
  ScriptItem,
  TableMeta,
  TableOverride,
  ViewTargetType,
  WriteMode
} from '/@/views/dataops/api/model/migration'
import { isView } from '/@/views/dataops/api/model/migration'
import ScriptListEditor from './components/ScriptListEditor.vue'
import {
  FILTER_CONDITION_HINT,
  MIGRATION_MODE_DESCRIPTIONS,
  MIGRATION_MODE_LABELS,
  WRITE_MODE_LABELS,
  findInvalidFilterCondition,
  isUnsupportedType,
  qualifiedName,
  suggestTargetType,
  validateFilterCondition
} from '/@/views/dataops/utils/migration'
import { $message, $warning } from '/@/utils/message'

const router = useRouter()
const route = useRoute()

const step = ref(0)

/** 编辑模式: 路由 /dataops/migration/wizard?id=xx (query 传参) */
const editId = computed<number | null>(() =>
  route.query.id === undefined ? null : Number(route.query.id)
)
const isEdit = computed(() => editId.value !== null)

/** SQL_SCRIPT 模式: 用脚本清单替代表选择/列映射/写入策略 */
const isScriptMode = computed(() => basic.migrationMode === 'SQL_SCRIPT')

const scripts = ref<ScriptItem[]>([])

const stepItems = computed(() =>
  isScriptMode.value
    ? [{ title: '基本信息' }, { title: '脚本清单' }, { title: '预检查与提交' }]
    : [
      { title: '基本信息' },
      { title: '表选择' },
      { title: '列映射与写入策略' },
      { title: '预检查与提交' }
    ]
)
const maxStep = computed(() => stepItems.value.length - 1)

//region ==================== Step 1: 基本信息 ====================

const dataSources = ref<DataSource[]>([])
const basicFormRef = ref()
const basic = reactive({
  name: '',
  sourceId: undefined as string | undefined,
  targetId: undefined as string | undefined,
  migrationMode: 'STRUCTURE_AND_DATA' as MigrationMode,
  parallelWorkers: 4,
  batchSize: 5000,
  enableCheckpoint: true,
  enableAutoCompare: false,
  autoCompareStrategy: 'CHECKSUM' as 'ROW_COUNT' | 'CHECKSUM' | 'DIFF_ROWS',
  compareTables: [] as string[],
  remark: ''
})

const basicRules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入任务名', trigger: 'blur' }],
  sourceId: [{ required: true, message: '请选择源数据源', trigger: 'change' }],
  targetId: [{ required: true, message: '请选择目标数据源', trigger: 'change' }]
}

const source = computed(() => dataSources.value.find((d) => d.id === basic.sourceId))
const target = computed(() => dataSources.value.find((d) => d.id === basic.targetId))
const sameSourceTarget = computed(() => basic.sourceId && basic.sourceId === basic.targetId)

const modeOptions = (Object.keys(MIGRATION_MODE_DESCRIPTIONS) as MigrationMode[]).map((m) => ({
  value: m,
  label: MIGRATION_MODE_LABELS[m]
}))

//endregion

//region ==================== Step 2: 表选择 ====================

const spinning = ref(false)
const allTables = ref<TableMeta[]>([])
const tableKeyword = ref('')
const selectedTableNames = ref<string[]>([]) // "schema.table"

const filteredTables = computed(() => {
  const kw = tableKeyword.value.trim().toLowerCase()
  return kw ? allTables.value.filter((t) => t.tableName.toLowerCase().includes(kw)) : allTables.value
})

const tableRowKey = (t: TableMeta) => qualifiedName(t.schema, t.tableName)
const totalLabel = (t: number) => `共 ${t} 条`

/** 表清单加载统一入口 */
async function loadData() {
  if (!source.value) return
  spinning.value = true
  try {
    allTables.value = await listTablesApi(source.value.id)
    // 移除已不在源库中的历史选择
    const valid = new Set(allTables.value.map((t) => qualifiedName(t.schema, t.tableName)))
    selectedTableNames.value = selectedTableNames.value.filter((n) => valid.has(n))
  } finally {
    spinning.value = false
  }
}

const tableColumns: TableColumnsType = [
  // 表名/主键的"视图"标签走模板 #bodyCell 渲染 —— antd 组件在模板里用 <a-tag>,
  // 不在 customRender 里用 h(Tag) (eslint 禁止直接 import antd 组件)
  { title: '表名', dataIndex: 'tableName', ellipsis: true },
  { title: 'Schema', dataIndex: 'schema', width: 120 },
  { title: '注释', dataIndex: 'tableComment', ellipsis: true, customRender: ({ text }) => text || '-' },
  {
    title: '行数',
    dataIndex: 'rowCount',
    width: 110,
    sorter: (a: TableMeta, b: TableMeta) => a.rowCount - b.rowCount,
    // 视图行数按 0 返回, 直接显示 "0" 会被误读成"空表", 用 '-' 更准确
    customRender: ({ record }) => (isView(record as TableMeta) ? '-' : Number((record as TableMeta).rowCount).toLocaleString())
  },
  { title: '列数', dataIndex: 'columnCount', width: 80 },
  { title: '主键', dataIndex: 'hasPrimaryKey', width: 80 }
]

/** 表选择分页: 大表清单分页渲染, 避免一次性渲染上千行导致卡顿 */
const tablePagination = {
  pageSize: 200,
  showSizeChanger: true,
  pageSizeOptions: ['20', '50', '100', '200'],
  size: 'small' as const,
  showTotal: totalLabel
}

/** 全选当前过滤结果(跨页), 配合分页也能一次选中大量表 */
function selectAllFiltered() {
  const keys = filteredTables.value.map((t) => qualifiedName(t.schema, t.tableName))
  selectedTableNames.value = Array.from(new Set([...selectedTableNames.value, ...keys]))
}

//endregion

//region ==================== Step 3: 列级映射 ====================

/**
 * 编辑模式下从服务端读回的"原始配置"。
 * 用户没有进入对应步骤时(列结构/表覆盖未加载),提交时原样回传,避免被静默清空。
 */
const savedColumnMappings = ref<ColumnMappingItem[]>([])
const savedOverrides = ref<Record<string, TableOverride>>({})

/** 每表列映射编辑态: key = "schema.table" */
interface ColumnEdit {
  columns: ColumnMeta[]
  loading: boolean
  loaded: boolean
  /** sourceColumn -> 编辑值 */
  edits: Record<
    string,
    { targetColumn: string; targetType: string; transformExpr: string; ignore: boolean }
  >
}
const columnEdits = reactive<Record<string, ColumnEdit>>({})

/** 懒加载表结构并初始化同名映射 + 类型建议(展开某张表时才触发) */
async function ensureColumnsLoaded(tableName: string) {
  if (!source.value || columnEdits[tableName]?.loaded) return
  if (!columnEdits[tableName]) {
    columnEdits[tableName] = { columns: [], loading: false, loaded: false, edits: {} }
  }
  const state = columnEdits[tableName]
  state.loading = true
  try {
    const [schema, table] = tableName.split('.')
    const structure = await getTableColumnsApi(source.value.id, schema, table)
    state.columns = structure.columns
    for (const c of structure.columns) {
      state.edits[c.name] = {
        targetColumn: c.name,
        targetType: suggestTargetType(c.dataType, c.length, c.scale) ?? '',
        transformExpr: '',
        ignore: false
      }
    }
    state.loaded = true
    applySavedMappingsForTable(tableName)
  } finally {
    state.loading = false
  }
}

/** 取某表某列的编辑态(供模板内联引用/修改) */
function editOf(tableName: string, column: string) {
  return columnEdits[tableName]?.edits?.[column]
}

/**
 * 编辑模式: 把任务里已保存的列映射套用到指定表的列编辑态
 * (必须在 ensureColumnsLoaded 初始化 edits 之后调用)
 */
function applySavedMappingsForTable(tableName: string) {
  const state = columnEdits[tableName]
  if (!state) return
  for (const m of savedColumnMappings.value) {
    if (m.sourceTable !== tableName) continue
    const e = state.edits[m.sourceColumn]
    if (!e) continue
    if (!m.targetColumn) {
      e.ignore = true
      continue
    }
    e.ignore = false
    e.targetColumn = m.targetColumn
    if (m.targetType) e.targetType = m.targetType
    if (m.transformExpr) e.transformExpr = m.transformExpr
  }
}

const columnTableColumns: TableColumnsType = [
  { title: '#', dataIndex: 'ordinal', width: 50 },
  { title: '主键', dataIndex: 'isPrimaryKey', width: 60 },
  { title: '源列', dataIndex: 'name', width: 160 },
  { title: '源类型', key: 'fullType', width: 150 },
  { title: '忽略', key: 'ignore', width: 60 },
  { title: '目标列', key: 'targetColumn' },
  { title: '目标类型', key: 'targetType', width: 170 },
  { title: '转换表达式', key: 'transformExpr', width: 200 }
]

/** 列完整类型描述,如 nvarchar(50) / numeric(18,2) / datetime2(7) */
function fullTypeOf(c: ColumnMeta): string {
  const t = (c.dataType || '').toLowerCase()
  if (['varchar', 'nvarchar', 'char', 'nchar', 'binary', 'varbinary'].includes(t)) {
    return c.length === -1 ? `${c.dataType}(MAX)` : `${c.dataType}(${c.length})`
  }
  if (['numeric', 'decimal'].includes(t)) return `${c.dataType}(${c.precision},${c.scale})`
  // 小数秒位数是时间类型签名的一部分,不显示会让用户误判目标类型(如 datetime2(7) 实际映射为 timestamp(6))
  if (['datetime2', 'time', 'datetimeoffset'].includes(t) && (c.scale ?? 0) > 0) {
    return `${c.dataType}(${c.scale})`
  }
  return c.dataType
}

/**
 * 目标类型输入框的 placeholder
 * <p>不支持自动映射的类型必须明确告知,否则默认的"自动映射"会让用户误以为能生效。</p>
 */
function targetTypePlaceholder(c: ColumnMeta): string {
  return isUnsupportedType(c.dataType) ? '不支持自动映射,请手工指定或勾选忽略' : '自动映射'
}

/**
 * 目标类型输入框的状态
 * <p>不支持自动映射的类型,若既未手工填写、也未勾选忽略,标红提醒 ——
 * 这种列提交后必定在预检查阶段被判失败,提前在向导里暴露。</p>
 */
function targetTypeStatus(tableName: string, c: ColumnMeta): 'error' | undefined {
  if (!isUnsupportedType(c.dataType)) return undefined
  const e = editOf(tableName, c.name)
  if (!e || e.ignore || e.targetType.trim()) return undefined
  return 'error'
}

/** 导出列映射(跳过"无任何修改"的列,减少 payload) */
function buildColumnMappings() {
  const result: CreateMigrationTask['columnMappings'] = []
  const loadedTables = new Set<string>()
  for (const tableName of selectedTableNames.value) {
    const state = columnEdits[tableName]
    if (!state?.loaded) continue
    loadedTables.add(tableName)
    for (const c of state.columns) {
      const e = state.edits[c.name]
      if (!e) continue
      const touched =
        e.ignore || e.targetColumn !== c.name || e.transformExpr ||
        // 必须与 ensureColumnsLoaded 里的预填调用保持完全相同的入参,
        // 否则未改动的列会被误判为 touched,给每张表每个列都生成冗余映射记录
        (e.targetType && e.targetType !== suggestTargetType(c.dataType, c.length, c.scale))
      if (!touched) continue
      result.push({
        sourceTable: tableName,
        sourceColumn: c.name,
        targetColumn: e.ignore ? '' : e.targetColumn,
        targetType: e.ignore ? undefined : e.targetType || undefined,
        transformExpr: e.ignore ? undefined : e.transformExpr || undefined
      })
    }
  }
  // 编辑模式: 结构未加载的表(用户没进列映射步骤)保留原有映射,避免被清空
  for (const m of savedColumnMappings.value) {
    if (!loadedTables.has(m.sourceTable)) result.push(m)
  }
  return result
}

//endregion

//region ==================== Step 4: 写入策略 ====================

/** 每表覆盖编辑态 */
interface OverrideEdit {
  migrationMode: string
  writeMode: WriteMode
  filterCondition: string
  /** 目标表名(空 = 与源表同名)。支持 A -> B 改名 */
  targetTable: string
  /** 视图目标形态: TABLE=物化为实体表(默认) / VIEW=在目标库保持为视图 */
  targetObjectType: ViewTargetType
  maxQps: number | undefined
}
const overrides = reactive<Record<string, OverrideEdit>>({})

/** 懒初始化某表的覆盖编辑态 */
function ensureOverride(tableName: string) {
  if (!overrides[tableName]) {
    overrides[tableName] = {
      migrationMode: 'INHERIT_FROM_TASK',
      writeMode: 'TRUNCATE',
      filterCondition: '',
      targetTable: '',
      targetObjectType: 'TABLE',
      maxQps: undefined
    }
  }
  return overrides[tableName]
}

/** 导出被修改过的表级覆盖 */
function buildTableOverrides() {
  const result: Record<string, unknown> = {}
  for (const tableName of selectedTableNames.value) {
    const o = overrides[tableName]
    if (!o) continue
    // 编辑模式: 任务里已存过覆盖配置的表一律保留, 避免未改动时被清空
    const saved = savedOverrides.value[tableName]
    const touched =
      saved != null ||
      o.migrationMode !== 'INHERIT_FROM_TASK' ||
      o.writeMode !== 'TRUNCATE' ||
      o.filterCondition.trim() ||
      o.targetTable.trim() ||
      o.targetObjectType !== 'TABLE' ||
      o.maxQps
    if (!touched) continue
    result[tableName] = {
      migrationMode: o.migrationMode,
      writeMode: o.writeMode,
      filterCondition: o.filterCondition || undefined,
      // 空串不发送: 后端留空即"与源表同名", 发空串会让 payload 无谓变大
      targetTable: o.targetTable.trim() || undefined,
      // 只有视图才有意义; 普通表不发这个字段, 让后端走默认
      targetObjectType: o.targetObjectType,
      maxQps: o.maxQps
    }
  }
  return result
}

const writeModeOptions = (Object.keys(WRITE_MODE_LABELS) as WriteMode[]).map((w) => ({
  value: w,
  label: WRITE_MODE_LABELS[w]
}))

/**
 * 各表过滤条件的即时校验结果（表名 -> 拒绝原因）
 *
 * 后端 `SqlFilterValidator` 会在预检查与任务创建时拒绝非法条件，但那个反馈链路太长 ——
 * 用户要填完全部步骤才能发现。这里做前端即时校验，输入时就标红并告知具体原因。
 *
 * 注意：两侧规则必须同步，且**后端始终是权威**（绕过前端直调 API 仍会被拦）。
 */
const filterErrors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}
  for (const [tableName, o] of Object.entries(overrides)) {
    const reason = validateFilterCondition(o.filterCondition)
    if (reason) out[tableName] = reason
  }
  return out
})

/** 某表过滤条件的拒绝原因（合法或未填写时返回 undefined） */
function filterErrorOf(tableName: string): string | undefined {
  return filterErrors.value[tableName]
}

/**
 * 校验当前已选表的过滤条件
 *
 * @returns 全部合法返回 true；否则弹出首个非法项并返回 false
 */
function assertFilterConditionsValid(): boolean {
  const bad = findInvalidFilterCondition(
    selectedTableNames.value.map(
      (t) => [t, ensureOverride(t).filterCondition] as const
    )
  )
  if (!bad) return true
  $warning(`表 ${bad.table} 的过滤条件不合法：${bad.reason}`)
  return false
}

const tableModeOptions = [
  { value: 'INHERIT_FROM_TASK', label: '继承任务设置' },
  { value: 'STRUCTURE_ONLY', label: '仅结构' },
  { value: 'DATA_ONLY', label: '仅数据' },
  { value: 'STRUCTURE_AND_DATA', label: '结构+数据' }
]

/** 合并步骤: 以表为单位的主表列定义与行数据 */
const strategyColumns: TableColumnsType = [
  // 只展示对象名, 不带 schema 前缀(与 step 2 的"表名 + 独立 Schema 列"保持一致);
  // 本表没有 Schema 列, 所以完整限定名放到悬停 title 里, 不丢信息。
  { title: '源表名', key: 'sourceTable', dataIndex: 'label', ellipsis: true },
  // 目标表名: 业务上存在 A -> B 改名(如 users -> t_user), 留空即与源表同名
  { title: '目标表名', key: 'targetTable', width: 200 },
  // 视图目标形态: 只有源对象是视图时才可选(普通表恒为实体表)
  { title: '视图处理', key: 'viewTargetType', width: 160 },
  { title: '迁移模式', key: 'migrationMode', width: 220 },
  { title: '写入策略', key: 'writeMode', width: 220 },
  { title: '过滤条件 (WHERE)', key: 'filterCondition', width: 250 },
  { title: '限流 QPS', key: 'maxQps', width: 110 }
]

/** 视图目标形态选项: 物化成真表 / 目标库也保持视图 */
const viewTargetOptions = [
  { value: 'TABLE', label: '物化为实体表' },
  { value: 'VIEW', label: '保持为视图' }
]

/**
 * 合并步骤行数据
 * <p>带上源对象类型: "视图处理"列只对视图生效, 普通表要显示为不可选。
 * 另给一个 {@code label} = 去掉 schema 前缀的对象名用于展示(见 strategyColumns 注释)。</p>
 */
const strategyRows = computed(() =>
  selectedTableNames.value.map((t) => {
    const meta = allTables.value.find((m) => qualifiedName(m.schema, m.tableName) === t)
    return { tableName: t, label: bareName(t), objectType: meta?.objectType ?? 'TABLE' }
  })
)

/** 去掉 "schema." 前缀只留对象名("demo.users" -> "users") */
function bareName(qualified: string): string {
  const i = qualified.lastIndexOf('.')
  return i < 0 ? qualified : qualified.slice(i + 1)
}

/** 目标数据源的默认 schema —— 后端 buildTargetTable() 就是用它给"留空/纯表名"补前缀的 */
const targetSchema = computed(() => target.value?.schemaName ?? '')

/**
 * 目标表名的展示值
 * <p>要处理两件事:</p>
 * <ol>
 *   <li><b>还原"未设置"</b>: 后端把留空的目标表名规范化成 "目标schema.源表名" 存库, 回填时
 *       分不清"用户没改过"和"用户手填了同名"。与默认值等价的一律还原成空, 让
 *       "xxx(默认同名)" 占位提示重新出现, 否则每行都像被显式改过名;</li>
 *   <li><b>剥掉目标 schema 前缀</b>: 只剥<b>与目标数据源 schema 相同</b>的那个前缀。
 *       用户若显式指定了别的 schema(如 {@code archive.aa}), 必须原样保留 —— 否则提交时
 *       后端会当成纯表名, 静默改回默认 schema。</li>
 * </ol>
 */
function targetTableValue(srcTable: string, stored: string): string {
  if (!stored) return ''
  const bare = bareName(srcTable)
  const schema = targetSchema.value
  const keepExactly = schema ? `${schema}.${bare}` : bare
  const lower = stored.toLowerCase()
  if (lower === keepExactly.toLowerCase() || lower === bare.toLowerCase()) return ''
  const i = stored.lastIndexOf('.')
  if (i < 0) return stored
  return schema && stored.slice(0, i).toLowerCase() === schema.toLowerCase()
    ? stored.slice(i + 1)
    : stored
}

/** 目标表名占位提示: 留空即与源表同名(目标 schema 由后端按目标数据源补齐) */
function targetPlaceholder(srcTable: string): string {
  return `${bareName(srcTable)}(默认同名)`
}

/** 写入策略分页: 每行含多个表单组件, 分页渲染显著降低开销 */
const strategyPagination = {
  pageSize: 20,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  size: 'small' as const,
  showTotal: totalLabel
}

/** 展开某行时懒加载该表列结构 */
function handleStrategyExpand(expanded: boolean, record: { tableName: string }) {
  if (expanded) ensureColumnsLoaded(record.tableName)
}

//endregion

//region ==================== Step 5: 预检查与提交 ====================

const creating = ref(false)
const precheckRunning = ref(false)
const precheckSummary = ref<PrecheckSummary | null>(null)
const createdTaskId = ref<number | null>(null)

/**
 * 提交用的脚本清单: 过滤掉未填写内容的草稿脚本(否则后端 @NotBlank 会报参数校验失败),
 * 并为空名称补默认名;顺序保持不变,后端按提交顺序生成 seq。
 */
const submitScripts = computed<ScriptItem[] | undefined>(() => {
  if (!isScriptMode.value) return undefined
  return scripts.value
    .filter((s) => !!s.scriptContent?.trim())
    .map((s, i) => ({ ...s, scriptName: s.scriptName?.trim() || `脚本 ${i + 1}` }))
})

const payloadPreview = computed<CreateMigrationTask>(() => ({
  name: basic.name,
  sourceId: basic.sourceId!,
  targetId: basic.targetId!,
  migrationMode: basic.migrationMode,
  parallelWorkers: basic.parallelWorkers,
  batchSize: basic.batchSize,
  enableCheckpoint: basic.enableCheckpoint,
  enableAutoCompare: basic.enableAutoCompare,
  autoCompareStrategy: basic.enableAutoCompare ? basic.autoCompareStrategy : undefined,
  compareTables: !isScriptMode.value && basic.enableAutoCompare ? [...basic.compareTables] : undefined,
  includeTables: [...selectedTableNames.value],
  tableOverrides: buildTableOverrides() as CreateMigrationTask['tableOverrides'],
  columnMappings: buildColumnMappings(),
  scripts: submitScripts.value,
  remark: basic.remark || undefined
}))

/** 脚本清单是否有效(至少一个启用且内容非空) */
const scriptsValid = computed(
  () => scripts.value.filter((s) => s.enabled !== false && !!s.scriptContent?.trim()).length > 0
)

/**
 * 自动比对配置是否有效:
 * - 关闭自动比对 → 有效
 * - 非脚本模式 → 比对对象就是本次成功迁移的表(后端 launchAutoCompare 自动推断,见 TaskScheduler),
 *   无需用户单独填写比对表清单,因此始终有效
 * - 脚本模式 → 比对清单由后端按各启用脚本的 targetTables 去重汇总(不再依赖任务级 compareTables),
 *   故校验口径同步为: 至少一个启用脚本声明了目标表
 */
const autoCompareValid = computed(() => {
  if (!basic.enableAutoCompare) return true
  if (!isScriptMode.value) return true
  return scripts.value.some((s) => s.enabled !== false && (s.targetTables?.length ?? 0) > 0)
})

/** 创建/更新任务并执行预检查 */
async function handleSubmit() {
  // 最后防线：用户可点击步骤条直接跳步，不一定经过「下一步」的校验路径
  if (!isScriptMode.value && !assertFilterConditionsValid()) return
  creating.value = true
  try {
    const task = isEdit.value
      ? await updateMigrationTaskApi(editId.value!, payloadPreview.value)
      : await createMigrationTaskApi(payloadPreview.value)
    createdTaskId.value = task.id
    $message(isEdit.value ? `任务「${task.name}」已更新` : `任务「${task.name}」已创建 (ID=${task.id})`)
    precheckRunning.value = true
    try {
      precheckSummary.value = await runPrecheckApi(task.id)
      $message(
        precheckSummary.value.passed
          ? '预检查通过 ✅'
          : `预检查有 ${precheckSummary.value.failCount} 项失败`
      )
    } finally {
      precheckRunning.value = false
    }
  } finally {
    creating.value = false
  }
}

/** precheck 级别/结果颜色 */
function levelColor(level: string) {
  return level === 'ERROR' ? 'red' : level === 'WARN' ? 'orange' : 'green'
}
function statusColor(status: string) {
  return status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'default'
}

const precheckColumns: TableColumnsType = [
  { title: '类别', dataIndex: 'category', width: 100 },
  { title: '检查项', dataIndex: 'key', width: 220, ellipsis: true },
  { title: '级别', dataIndex: 'level', width: 80 },
  { title: '结果', dataIndex: 'status', width: 80 },
  { title: '说明', dataIndex: 'message' }
]

//endregion

//region ==================== 步骤流转 ====================

/** 上一步/下一步导航忙碌态(防重复点击 + 加载反馈) */
const navLoading = ref(false)

/** 等待浏览器完成一次真实绘制(双 rAF), 确保 loading 态可见 */
const nextFrame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  )

/** 步骤流转(进入下一步前校验/预加载) */
const handleStepChange = async (next: number) => {
  if (navLoading.value) return
  navLoading.value = true
  // 等待浏览器真正绘制出 loading 态(nextTick 是微任务不会触发绘制), 否则同步流程看不到加载且能重复点击
  await nextFrame()
  try {
    if (step.value === 0) {
      // 校验失败会 reject, 捕获后直接返回, 避免未处理异常
      try {
        await basicFormRef.value?.validate()
      } catch {
        return
      }
      // 脚本模式不需要加载源表清单
      if (!isScriptMode.value) {
        await loadData()
      }
    }
    if (!isScriptMode.value && step.value === 1 && next > step.value) {
      if (!selectedTableNames.value.length) {
        $warning('请至少勾选一张表')
        return
      }
      // 仅初始化表级覆盖编辑态(廉价);列结构改为展开对应表时再懒加载,避免选中表过多时卡顿
      selectedTableNames.value.forEach(ensureOverride)
    }
    if (isScriptMode.value && step.value === 1 && next > step.value && !scriptsValid.value) {
      $warning('请至少添加一个「已启用且内容非空」的脚本')
      return
    }
    // 离开「列映射与写入策略」前拦截非法过滤条件：后端同样会拒，
    // 提前到向导里反馈，避免用户填完全部步骤才在预检查阶段发现问题
    if (!isScriptMode.value && step.value === 2 && next > step.value) {
      if (!assertFilterConditionsValid()) return
    }
    step.value = next
    // 等新步骤(可能是大表)渲染完成后再解除 loading
    await nextTick()
  } finally {
    navLoading.value = false
  }
}

/** 上一步: 同样先置忙渲染 loading, 等页面渲染完成再解除, 防止连续点击 */
const handlePrev = async () => {
  if (navLoading.value || step.value <= 0) return
  navLoading.value = true
  await nextFrame()
  step.value--
  await nextTick()
  navLoading.value = false
}

/**
 * 编辑模式: 回填任务配置
 * 表结构/列映射属于懒加载,这里只回填能直接落到编辑态的字段。
 */
async function loadTaskForEdit(id: number) {
  spinning.value = true
  try {
    const task = await getMigrationTaskApi(id)
    basic.name = task.name
    basic.sourceId = task.sourceId
    basic.targetId = task.targetId
    basic.migrationMode = task.migrationMode
    basic.parallelWorkers = task.parallelWorkers ?? 4
    basic.batchSize = task.batchSize ?? 5000
    basic.enableCheckpoint = task.enableCheckpoint ?? true
    basic.enableAutoCompare = task.enableAutoCompare ?? false
    basic.autoCompareStrategy = task.autoCompareStrategy ?? 'CHECKSUM'
    basic.compareTables = task.compareTables ?? []
    basic.remark = task.remark ?? ''

    selectedTableNames.value = [...(task.includeTables ?? [])]
    savedColumnMappings.value = task.columnMappings ?? []
    savedOverrides.value = task.tableOverrides ?? {}

    // 表级覆盖回填到编辑态(未进入写入策略步骤时也会原样回传)
    for (const [t, ov] of Object.entries(savedOverrides.value)) {
      const o = ensureOverride(t)
      o.migrationMode = ov.migrationMode ?? o.migrationMode
      o.writeMode = ov.writeMode ?? o.writeMode
      o.filterCondition = ov.filterCondition ?? ''
      o.targetTable = ov.targetTable ?? ''
      o.targetObjectType = ov.targetObjectType ?? 'TABLE'
      o.maxQps = ov.maxQps
    }

    // 脚本清单: ScriptResponse -> ScriptItem(去掉执行态字段)
    scripts.value = (task.scripts ?? []).map((s) => ({
      scriptName: s.scriptName,
      scriptContent: s.scriptContent ?? '',
      execPhase: s.execPhase,
      scriptType: s.scriptType,
      onError: s.onError,
      timeoutSec: s.timeoutSec,
      enabled: s.enabled,
      sqlParams: s.sqlParams,
      targetTables: s.targetTables ?? [],
      preWriteAction: s.preWriteAction ?? 'NONE'
    }))
  } catch {
    $warning('该任务当前不可编辑(仅 PENDING / FAILED 状态允许修改)')
    router.replace({ path: '/dataops/migration/detail', query: { id } })
  } finally {
    spinning.value = false
  }
}

onMounted(async () => {
  const page = await listDataSourcesApi({ page: 1, size: 200 })
  dataSources.value = page.list ?? []
  if (editId.value !== null) {
    await loadTaskForEdit(editId.value)
  }
})

//endregion
</script>

<template>
  <div class="wizard">
    <a-card :title="isEdit ? `编辑迁移任务 #${editId}` : '新建迁移任务'">
      <template #extra>
        <a-button v-if="isEdit" size="small"
          @click="router.push({ path: '/dataops/migration/detail', query: { id: editId } })">返回详情</a-button>
      </template>
      <a-steps :current="step" :items="stepItems" style="margin-bottom: 24px" />

      <!-- Step 1: 基本信息 -->
      <div v-if="step === 0">
        <a-form ref="basicFormRef" :model="basic" :rules="basicRules" layout="vertical" style="max-width: 640px">
          <a-form-item label="任务名" name="name" required>
            <a-input v-model:value="basic.name" placeholder="如 lims-full-load-2026" allow-clear />
          </a-form-item>
          <a-form-item label="源数据源 (SQL Server / PostgreSQL)" name="sourceId" required>
            <a-select v-model:value="basic.sourceId" show-search option-filter-prop="label"
              :options="dataSources.map((d) => ({ value: d.id, label: `${d.name} (${d.dbType} @ ${d.address ?? d.code ?? ''})` }))"
              placeholder="选择源库" @change="selectedTableNames = []" />
          </a-form-item>
          <a-form-item label="目标数据源" name="targetId" required>
            <a-select v-model:value="basic.targetId" show-search option-filter-prop="label"
              :options="dataSources.map((d) => ({ value: d.id, label: `${d.name} (${d.dbType} @ ${d.address ?? d.code ?? ''})` }))"
              placeholder="选择目标库" />
          </a-form-item>
          <a-alert v-if="sameSourceTarget" type="error" show-icon message="源与目标数据源相同,无法提交"
            style="margin-bottom: 16px" />
          <a-form-item label="迁移模式" required>
            <a-select v-model:value="basic.migrationMode" :options="modeOptions" />
            <div class="mode-desc">{{ MIGRATION_MODE_DESCRIPTIONS[basic.migrationMode] }}</div>
          </a-form-item>
          <a-space size="large">
            <a-form-item label="并行 Worker">
              <a-input-number v-model:value="basic.parallelWorkers" :min="1" :max="64" />
            </a-form-item>
            <a-form-item label="批大小">
              <a-input-number v-model:value="basic.batchSize" :min="100" :max="100000" :step="500" />
            </a-form-item>
            <a-form-item label="断点续传">
              <a-switch v-model:checked="basic.enableCheckpoint" />
            </a-form-item>
          </a-space>
          <a-space size="large">
            <a-form-item label="迁移后自动比对">
              <a-switch v-model:checked="basic.enableAutoCompare" />
            </a-form-item>
            <a-form-item v-if="basic.enableAutoCompare" label="比对策略">
              <a-select v-model:value="basic.autoCompareStrategy" style="width: 400px">
                <a-select-option value="CHECKSUM">CHECKSUM（行数 + SHA-256 校验和）</a-select-option>
                <a-select-option value="ROW_COUNT">ROW_COUNT（仅行数，快速）</a-select-option>
                <a-select-option value="DIFF_ROWS">DIFF_ROWS（校验和 + 差异抽样）</a-select-option>
              </a-select>
            </a-form-item>
          </a-space>
          <a-form-item label="备注">
            <a-textarea v-model:value="basic.remark" :rows="2" />
          </a-form-item>
        </a-form>
      </div>

      <!-- SQL_SCRIPT 模式 Step 2: 脚本清单 -->
      <div v-else-if="isScriptMode && step === 1">
        <!-- 编辑模式下任务已存在,可直接试运行 -->
        <ScriptListEditor v-model:scripts="scripts" :task-id="isEdit ? editId : null" />
      </div>

      <!-- Step 2: 表选择 -->
      <div v-else-if="step === 1">
        <div class="table-toolbar">
          <a-input v-model:value="tableKeyword" placeholder="按表名过滤" allow-clear style="width: 240px"
            :suffix="`${filteredTables.length} 张表`" />
          <a-space>
            <a-button size="small" @click="selectAllFiltered">全选当前 {{ filteredTables.length }} 张</a-button>
            <a-button size="small" :disabled="!selectedTableNames.length" @click="selectedTableNames = []">清空</a-button>
            <span>已选 <b>{{ selectedTableNames.length }}</b> 张表</span>
          </a-space>
        </div>
        <a-table class="table-select-compact" :columns="tableColumns" :data-source="filteredTables" :loading="spinning"
          :row-key="tableRowKey" size="small" :pagination="tablePagination" :row-selection="{
      selectedRowKeys: selectedTableNames,
      preserveSelectedRowKeys: true,
      onChange: (keys: string[]) => (selectedTableNames = keys as string[])
    }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'tableName'">
              {{ record.tableName }}
              <!-- 视图没有数据量, 必须在清单里就能分辨, 否则用户会以为它和表一样会被搬数据 -->
              <a-tag v-if="isView(record as TableMeta)" color="purple" style="margin-left: 6px">视图</a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'hasPrimaryKey'">
              <span v-if="isView(record as TableMeta)">-</span>
              <a-tag v-else :color="record.hasPrimaryKey ? 'green' : 'orange'">
                {{ record.hasPrimaryKey ? '有' : '无' }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </div>

      <!-- Step 3: 列映射与写入策略(仅非脚本模式,合并为以表为单位的列表) -->
      <div v-else-if="!isScriptMode && step === 2">
        <a-alert type="info" show-icon style="margin-bottom: 12px"
          message="以表为单位设置目标表名、视图处理方式与写入策略;目标表名留空即与源表同名(支持 A 迁移成 B)。视图的「视图处理」可选「物化为实体表」(建一张真表并搬数据)或「保持为视图」(目标库只建视图定义)。点击行首箭头展开可编辑该表的列级映射(默认同名映射 + 类型自动建议,仅被修改过的列会写入配置)。" />
        <a-table class="strategy-table" :columns="strategyColumns" :data-source="strategyRows" row-key="tableName"
          size="small" :pagination="strategyPagination" @expand="handleStrategyExpand">
          <!-- 展开行: 列级映射编辑 -->
          <template #expandedRowRender="{ record }">
            <a-table :columns="columnTableColumns" :data-source="columnEdits[record.tableName]?.columns ?? []"
              :loading="columnEdits[record.tableName]?.loading" row-key="name" size="small" :pagination="false"
              :scroll="{ y: 360 }">
              <template #bodyCell="{ column, record: col }">
                <template v-if="column.dataIndex === 'isPrimaryKey'">
                  <a-tag v-if="col.isPrimaryKey" color="blue">PK</a-tag>
                </template>
                <template v-else-if="column.key === 'fullType'">
                  {{ fullTypeOf(col) }}
                </template>
                <template v-else-if="column.key === 'ignore'">
                  <a-checkbox :checked="editOf(record.tableName, col.name)?.ignore" @update:checked="(v: boolean) => {
      const e = editOf(record.tableName, col.name); if (e) e.ignore = v
    }" />
                </template>
                <template v-else-if="column.key === 'targetColumn'">
                  <a-input size="small" :value="editOf(record.tableName, col.name)?.targetColumn"
                    :disabled="editOf(record.tableName, col.name)?.ignore" @update:value="(v: string) => {
      const e = editOf(record.tableName, col.name); if (e) e.targetColumn = v
    }" />
                </template>
                <template v-else-if="column.key === 'targetType'">
                  <a-input size="small" :placeholder="targetTypePlaceholder(col)"
                    :status="targetTypeStatus(record.tableName, col)"
                    :value="editOf(record.tableName, col.name)?.targetType"
                    :disabled="editOf(record.tableName, col.name)?.ignore" @update:value="(v: string) => {
      const e = editOf(record.tableName, col.name); if (e) e.targetType = v
    }" />
                </template>
                <template v-else-if="column.key === 'transformExpr'">
                  <a-input size="small" placeholder="如 'XXX-XX-' || substring(ssn, 8, 4)"
                    :value="editOf(record.tableName, col.name)?.transformExpr"
                    :disabled="editOf(record.tableName, col.name)?.ignore" @update:value="(v: string) => {
      const e = editOf(record.tableName, col.name); if (e) e.transformExpr = v
    }" />
                </template>
              </template>
            </a-table>
          </template>
          <!-- 主表: 写入策略 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'sourceTable'">
              <!-- 只显示对象名(不带 schema 前缀); 完整限定名放 title, 悬停可见 -->
              <span :title="record.tableName">{{ record.label }}</span>
            </template>
            <template v-else-if="column.key === 'targetTable'">
              <!-- 目标表名: 支持 A -> B 改名; 留空走"与源表同名"
                   展示值去掉与目标 schema 相同的前缀; 与默认同名时显示为空以还原占位提示 -->
              <a-input size="small" :placeholder="targetPlaceholder(record.tableName)"
                :value="targetTableValue(record.tableName, ensureOverride(record.tableName).targetTable)"
                @change="(e: any) => (ensureOverride(record.tableName).targetTable = e.target.value)" />
            </template>
            <template v-else-if="column.key === 'viewTargetType'">
              <!-- 视图才需要选目标形态: 物化成真表 / 目标库也保持视图; 普通表恒为实体表 -->
              <a-select v-if="record.objectType === 'VIEW'" size="small" style="width: 100%"
                :value="ensureOverride(record.tableName).targetObjectType" :options="viewTargetOptions"
                @change="(v: ViewTargetType) => (ensureOverride(record.tableName).targetObjectType = v)" />
              <span v-else style="color: #bfbfbf">—</span>
            </template>
            <template v-else-if="column.key === 'migrationMode'">
              <a-select size="small" style="width: 100%" :value="ensureOverride(record.tableName).migrationMode"
                :options="tableModeOptions"
                @change="(v: string) => (ensureOverride(record.tableName).migrationMode = v)" />
            </template>
            <template v-else-if="column.key === 'writeMode'">
              <a-select size="small" style="width: 100%" :value="ensureOverride(record.tableName).writeMode"
                :options="writeModeOptions"
                @change="(v: WriteMode) => (ensureOverride(record.tableName).writeMode = v)" />
            </template>
            <template v-else-if="column.key === 'filterCondition'">
              <!-- tooltip 挂到 input 上：告知完整禁用规则，避免用户不知道为何被拒 -->
              <a-tooltip placement="topLeft" :overlay-style="{ maxWidth: '560px' }">
                <template #title>
                  <div style="white-space: pre-wrap; line-height: 1.6">{{ FILTER_CONDITION_HINT }}</div>
                </template>
                <a-input size="small" placeholder="如 created_at >= '2024-01-01'"
                  :status="filterErrorOf(record.tableName) ? 'error' : undefined"
                  :value="ensureOverride(record.tableName).filterCondition"
                  @change="(e: any) => (ensureOverride(record.tableName).filterCondition = e.target.value)" />
              </a-tooltip>
              <!-- 即时拒绝原因：不等预检查，输入时就告知 -->
              <div v-if="filterErrorOf(record.tableName)" class="filter-error">
                {{ filterErrorOf(record.tableName) }}
              </div>
            </template>
            <template v-else-if="column.key === 'maxQps'">
              <a-input-number size="small" style="width: 100%" :min="0" :value="ensureOverride(record.tableName).maxQps"
                @change="(v: number | null) => (ensureOverride(record.tableName).maxQps = v ?? undefined)" />
            </template>
          </template>
        </a-table>
      </div>

      <!-- 最后一步: 预检查与提交 -->
      <div v-else-if="step === maxStep">
        <a-descriptions title="任务预览" :column="2" bordered size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="任务名">{{ basic.name }}</a-descriptions-item>
          <a-descriptions-item label="模式">
            <a-tag color="blue">{{ MIGRATION_MODE_LABELS[basic.migrationMode] }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="源">{{ source?.name ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="目标">{{ target?.name ?? '-' }}</a-descriptions-item>
          <a-descriptions-item v-if="!isScriptMode" label="选中表">
            {{ selectedTableNames.length }} 张
          </a-descriptions-item>
          <a-descriptions-item v-if="!isScriptMode" label="列映射条目">
            {{ payloadPreview.columnMappings?.length ?? 0 }} 条
          </a-descriptions-item>
          <a-descriptions-item v-else label="脚本清单">
            {{ scripts.length }} 个 (启用 {{ scripts.filter((s) => s.enabled !== false).length }} 个)
          </a-descriptions-item>
        </a-descriptions>

        <a-space style="margin-bottom: 16px">
          <a-button type="primary" :loading="creating || precheckRunning"
            :disabled="(isScriptMode && !scriptsValid) || !autoCompareValid" @click="handleSubmit">
            {{ isEdit ? '保存修改并预检查' : createdTaskId ? '重新创建并预检查' : '创建任务并预检查' }}
          </a-button>
          <a-button v-if="createdTaskId"
            @click="router.push({ path: '/dataops/migration/detail', query: { id: createdTaskId } })">
            {{ isEdit ? '返回详情' : '查看详情' }}
          </a-button>
        </a-space>

        <a-spin v-if="precheckRunning" tip="预检查执行中..." style="display: block; padding: 40px" />

        <div v-if="precheckSummary">
          <a-alert :type="precheckSummary.passed ? 'success' : 'error'" show-icon style="margin-bottom: 12px" :message="precheckSummary.passed
      ? `预检查通过: ${precheckSummary.passCount} 项 PASS, ${precheckSummary.warnCount} 项警告`
      : `预检查未通过: ${precheckSummary.failCount} 项 FAIL, ${precheckSummary.warnCount} 项警告`" />
          <a-table :columns="precheckColumns" :data-source="precheckSummary.items" row-key="key" size="small"
            :pagination="false" :scroll="{ y: 360 }">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'level'">
                <a-tag :color="levelColor(record.level)">{{ record.level }}</a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="wizard-footer">
        <a-space>
          <a-button v-if="step > 0" :loading="navLoading" @click="handlePrev">上一步</a-button>
          <a-button v-if="step < maxStep" type="primary" :loading="navLoading"
            @click="handleStepChange(step + 1)">下一步</a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<style scoped>
/* 过滤条件即时校验的拒绝原因 */
.filter-error {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #ff4d4f;
  word-break: break-all;
}

.wizard-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  margin: 20px -24px -24px;
  padding: 12px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(16, 24, 40, 0.06);
  display: flex;
  justify-content: flex-end;
}

.mode-desc {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

/* 列映射与写入策略合并表: 紧凑排版 */
.strategy-table :deep(.ant-table) {
  font-size: 12px;
}

.strategy-table :deep(.ant-table-cell) {
  padding: 6px 8px !important;
}

.strategy-table :deep(.ant-table-thead > tr > th) {
  font-size: 12px;
  font-weight: 600;
}

.strategy-table :deep(.ant-table-expanded-row > td) {
  background: #fafafa;
  padding: 12px !important;
}

/* 页内所有文本与表单控件统一 12 号字 */
.strategy-table :deep(.ant-input),
.strategy-table :deep(.ant-input-number),
.strategy-table :deep(.ant-input-number-input),
.strategy-table :deep(.ant-select),
.strategy-table :deep(.ant-select-selection-item),
.strategy-table :deep(.ant-select-selection-placeholder),
.strategy-table :deep(.ant-checkbox-wrapper),
.strategy-table :deep(.ant-tag) {
  font-size: 12px;
}

.field-hint {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.5;
}

.field-hint code {
  background: #f0f0f0;
  padding: 0 4px;
  border-radius: 3px;
  font-size: 12px;
}

/* 表选择页: 一页全显示 + 缩小字体, 提升长表清单可读性 */
.table-select-compact :deep(.ant-table) {
  font-size: 12px;
}

.table-select-compact :deep(.ant-table-cell) {
  padding: 4px 8px !important;
}

.table-select-compact :deep(.ant-table-thead > tr > th) {
  font-size: 12px;
  font-weight: 600;
}
</style>