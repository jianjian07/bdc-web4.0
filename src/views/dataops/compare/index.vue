<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import {
  CheckCircleOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  FileSearchOutlined
} from '@ant-design/icons-vue'
import PageHeader from '/@/views/dataops/migration/components/PageHeader.vue'
import {
  createCompareTaskApi,
  deleteCompareTaskApi,
  diffCsvExportUrl,
  getCompareChunkDiffsApi,
  getCompareProgressApi,
  getCompareResultsApi,
  listCompareTasksApi,
  startCompareTaskApi
} from '/@/views/dataops/api/compare'
import { listTablesApi } from '/@/views/dataops/api/metadata'
import { listAllDataSourcesApi } from '/@/views/dataops/api/datasource'
import type { DataSource } from '/@/views/dataops/api/model/datasource'
import type { CompareChunk, CompareProgress, CompareResult, CompareTask } from '/@/views/dataops/api/model/compare'
import {
  COMPARE_MODE_COLORS,
  COMPARE_MODE_LABELS,
  COMPARE_RESULT_COLORS,
  COMPARE_RESULT_LABELS,
  COMPARE_STRATEGY_LABELS
} from '/@/views/dataops/utils/compare'
import { formatDateTime } from '/@/views/dataops/utils/format'
import { openDownload } from '/@/views/dataops/utils/download'
import { $message, $confirmAsync } from '/@/utils/message'

//region ==================== 列表 ====================

const loading = ref(false)
const datalist = ref<CompareTask[]>([])
const total = ref(0)
const query = reactive({ keyword: '', result: undefined as string | undefined, page: 1, size: 10 })

const resultOptions = ['RUNNING', 'MATCH', 'MISMATCH', 'FAILED'].map((r) => ({
  value: r,
  label: COMPARE_RESULT_LABELS[r]
}))

async function loadData() {
  loading.value = true
  try {
    const page = await listCompareTasksApi(query)
    datalist.value = page.list ?? []
    total.value = page.total ?? 0
    // 存在运行中任务则保持/启动进度轮询, 全部终态时停表
    if (datalist.value.some((t) => t.overallResult === 'RUNNING')) {
      startProgressPolling()
    } else {
      stopProgressPolling()
    }
  } finally {
    loading.value = false
  }
}

//region ==================== 运行中进度轮询 ====================

const PROGRESS_INTERVAL = 3000

/** 运行中任务进度(id -> 快照), 列表"结果"列实时展示 */
const runningProgress = reactive<Record<number, CompareProgress>>({})
/** 结果弹窗当前对应任务 id(弹窗打开且任务 RUNNING 时, 明细随轮询增量刷新) */
const resultTaskId = ref<number | null>(null)
let progressTimer: ReturnType<typeof setInterval> | null = null

function runningIds(): number[] {
  return datalist.value.filter((t) => t.overallResult === 'RUNNING').map((t) => t.id)
}

/** 静默刷新列表(不动 loading, 避免轮询导致表格反复闪烁) */
async function reloadListSilently() {
  try {
    const page = await listCompareTasksApi(query)
    datalist.value = page.list ?? []
    total.value = page.total ?? 0
  } catch {
    /* 单次刷新失败忽略, 下一轮轮询重试 */
  }
  if (!datalist.value.some((t) => t.overallResult === 'RUNNING')) {
    stopProgressPolling()
  }
}

async function pollProgress() {
  const ids = runningIds()
  if (!ids.length) {
    // 无运行中任务: 停表并静默刷新一次让终态落地
    stopProgressPolling()
    await reloadListSilently()
    return
  }
  await Promise.all(
    ids.map(async (id) => {
      try {
        const snap = await getCompareProgressApi(id)
        if (snap?.overall && snap.overall !== 'RUNNING') {
          // 后端已终态: 回收该任务进度并刷列表(内部停表)
          delete runningProgress[id]
          await reloadListSilently()
        } else if (snap) {
          runningProgress[id] = snap
        }
      } catch {
        /* 单次轮询失败忽略, 下一轮重试 */
      }
    })
  )
  // 结果弹窗打开且对应任务仍在跑: 明细随轮询增量刷新
  if (resultOpen.value && resultTaskId.value != null && runningIds().includes(resultTaskId.value)) {
    try {
      results.value = await getCompareResultsApi(resultTaskId.value)
    } catch {
      /* 忽略, 下一轮重试 */
    }
  }
}

function startProgressPolling() {
  if (progressTimer) return
  progressTimer = setInterval(pollProgress, PROGRESS_INTERVAL)
}

function stopProgressPolling() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

//endregion

function handleSearch() {
  query.page = 1
  loadData()
}

function handleTableChange(pag: { current?: number; pageSize?: number }) {
  query.page = pag.current ?? 1
  query.size = pag.pageSize ?? 10
  loadData()
}

const actLoading = ref<number | null>(null)

async function handleStart(task: CompareTask) {
  actLoading.value = task.id
  try {
    await startCompareTaskApi(task.id)
    $message('比对已启动,结果将实时写入')
    await loadData()
    openResults(task.id)
  } finally {
    actLoading.value = null
  }
}

function handleDelete(task: CompareTask) {
  $confirmAsync('删除比对任务', `确定删除「${task.name}」?其结果明细将一并删除。`, async () => {
    await deleteCompareTaskApi(task.id)
    $message('已删除')
    await loadData()
  })
}

const columns: TableColumnsType = [
  { title: 'ID', dataIndex: 'id', width: 64 },
  { title: '任务名', dataIndex: 'name', ellipsis: true },
  { title: '源 → 目标', key: 'route', width: 320 },
  { title: '表数', key: 'tableCount', width: 80 },
  { title: '策略', dataIndex: 'strategy', width: 110 },
  { title: '结果', dataIndex: 'overallResult', width: 100 },
  { title: '开始时间', dataIndex: 'startedAt', width: 170 },
  { title: '操作', key: 'actions', width: 300, fixed: 'right' }
]

//endregion

//region ==================== 新建表单 ====================

const dataSources = ref<DataSource[]>([])
const createOpen = ref(false)
const creating = ref(false)
const formRef = ref()
const tablesLoading = ref(false)
const availableTables = ref<string[]>([])

const form = reactive({
  name: '',
  sourceId: undefined as string | undefined,
  targetId: undefined as string | undefined,
  sourceSchema: '',
  targetSchema: '',
  tables: [] as string[],
  strategy: 'CHECKSUM' as 'ROW_COUNT' | 'CHECKSUM' | 'DIFF_ROWS',
  parallelWorkers: 4
})

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入任务名', trigger: 'blur' }],
  sourceId: [{ required: true, message: '请选择源数据源', trigger: 'change' }],
  targetId: [{ required: true, message: '请选择目标数据源', trigger: 'change' }]
}

async function openCreate() {
  createOpen.value = true
  if (!dataSources.value.length) {
    dataSources.value = await listAllDataSourcesApi()
  }
}

/** 源/源 schema 变化后拉取可比对表清单(取源/目标交集) */
async function loadTables() {
  if (!form.sourceId || !form.targetId) return
  tablesLoading.value = true
  form.tables = []
  try {
    const src = await listTablesApi(form.sourceId, form.sourceSchema || undefined)
    const dst = await listTablesApi(form.targetId, form.targetSchema || undefined)
    const dstNames = new Set(dst.map((t) => t.tableName))
    availableTables.value = src
      .filter((t) => dstNames.has(t.tableName))
      .map((t) => t.tableName)
    if (!availableTables.value.length) {
      $message('两侧无同名表,请检查 schema')
    }
  } finally {
    tablesLoading.value = false
  }
}

async function handleCreate() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  if (!form.tables.length) {
    $message('至少选择一张两侧都存在的表')
    return
  }
  creating.value = true
  try {
    await createCompareTaskApi({
      name: form.name.trim(),
      sourceId: form.sourceId!,
      targetId: form.targetId!,
      sourceSchema: form.sourceSchema.trim() || undefined,
      targetSchema: form.targetSchema.trim() || undefined,
      tables: [...form.tables],
      strategy: form.strategy,
      parallelWorkers: form.parallelWorkers
    })
    $message('比对任务已创建')
    createOpen.value = false
    form.name = ''
    form.tables = []
    await loadData()
  } finally {
    creating.value = false
  }
}

//endregion

//region ==================== 结果明细 ====================

const resultOpen = ref(false)
const resultLoading = ref(false)
const results = ref<CompareResult[]>([])
const resultTaskName = ref('')

async function openResults(id: number) {
  const task = datalist.value.find((t) => t.id === id)
  resultTaskName.value = task?.name ?? `#${id}`
  resultTaskId.value = id
  resultOpen.value = true
  resultLoading.value = true
  try {
    results.value = await getCompareResultsApi(id)
  } finally {
    resultLoading.value = false
  }
}

function downloadDiff(compareTaskId: number, resultId: number) {
  openDownload(diffCsvExportUrl(compareTaskId, resultId))
}

const resultColumns: TableColumnsType = [
  { title: '源表', dataIndex: 'sourceTable', ellipsis: true },
  { title: '目标表', dataIndex: 'targetTable', ellipsis: true },
  { title: '源行数', dataIndex: 'sourceRowCount', width: 110 },
  { title: '目标行数', dataIndex: 'targetRowCount', width: 110 },
  { title: '行数一致', dataIndex: 'rowCountMatch', width: 100 },
  { title: '内容一致', dataIndex: 'checksumMatch', width: 100 },
  { title: '校验模式', dataIndex: 'comparedMode', width: 110 },
  { title: '差异行', key: 'diffCount', width: 130 },
  { title: '差异块', key: 'chunk', width: 120 },
  { title: '口径说明', dataIndex: 'note', width: 220, ellipsis: true },
  { title: '操作', key: 'actions', width: 120, fixed: 'right' }
]

/** 差异行展示口径(分块=精确 / 回退=抽样估算 / 否则=行数差) */
function diffCountText(record: CompareResult): string {
  if (record.comparedMode === 'CHUNKED') {
    return record.diffExact != null ? `精确 ${Number(record.diffExact).toLocaleString()}` : '未精确'
  }
  if (record.diffEstimate != null) {
    return `抽样≈${Number(record.diffEstimate).toLocaleString()}`
  }
  return Number(record.diffCount ?? 0).toLocaleString()
}

/** 是否存在需要关注的不一致(用于启用差异 CSV) */
function hasDiff(record: CompareResult): boolean {
  return (
    record.checksumMatch === false ||
    record.rowCountMatch === false ||
    (record.diffExact != null && record.diffExact > 0)
  )
}

//region ==================== 差异块明细(P1-10) ====================

const chunkModalVisible = ref(false)
const chunkLoading = ref(false)
const chunkList = ref<CompareChunk[]>([])
const chunkResult = ref<CompareResult | null>(null)

async function openChunks(record: CompareResult) {
  chunkResult.value = record
  chunkModalVisible.value = true
  chunkLoading.value = true
  chunkList.value = []
  try {
    chunkList.value = await getCompareChunkDiffsApi(record.compareTaskId, record.id)
  } finally {
    chunkLoading.value = false
  }
}

const chunkColumns: TableColumnsType = [
  { title: '#', dataIndex: 'chunkIndex', width: 60 },
  { title: '主键区间', key: 'range', width: 200 },
  { title: '源行数', dataIndex: 'sourceRows', width: 110 },
  { title: '目标行数', dataIndex: 'targetRows', width: 110 },
  { title: '块内差异', dataIndex: 'diffRows', width: 110 },
  { title: '源块哈希', dataIndex: 'sourceHash', ellipsis: true },
  { title: '目标块哈希', dataIndex: 'targetHash', ellipsis: true }
]

function chunkRange(record: CompareChunk): string {
  const lo = record.lowerBound ?? 'MIN'
  const hi = record.upperBound ?? 'MAX'
  return `[${lo}, ${hi})`
}

//endregion

//endregion

onMounted(loadData)
onBeforeUnmount(stopProgressPolling)
</script>

<template>
  <div class="page">
    <PageHeader title="数据比对" description="行数比对与 SHA-256 校验和校验，快速发现迁移前后的差异数据" :icon="CheckCircleOutlined">
      <template #actions>
        <a-button @click="loadData">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          新建比对任务
        </a-button>
      </template>
    </PageHeader>

    <a-card :bordered="false">
      <div class="filter-bar">
        <a-form layout="inline" @submit.prevent>
          <a-form-item label="关键字">
            <a-input v-model:value="query.keyword" placeholder="任务名" allow-clear style="width: 200px"
              @press-enter="handleSearch" />
          </a-form-item>
          <a-form-item label="结果">
            <a-select v-model:value="query.result" :options="resultOptions" allow-clear placeholder="全部"
              style="width: 130px" @change="handleSearch" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
        </a-form>
      </div>

      <a-table :columns="columns" :data-source="datalist" :loading="loading" row-key="id" :pagination="{
      current: query.page,
      pageSize: query.size,
      total: total,
      showSizeChanger: true,
      showTotal: (t: number) => `共 ${t} 条`
    }" :scroll="{ x: 1100 }" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'route'">
            <a-tag color="blue">{{ record.sourceName ?? record.sourceId }}</a-tag>
            →
            <a-tag color="green">{{ record.targetName ?? record.targetId }}</a-tag>
          </template>
          <template v-else-if="column.key === 'tableCount'">
            {{ record.tables?.length ?? 0 }}
          </template>
          <template v-else-if="column.dataIndex === 'strategy'">
            <a-tag>{{ COMPARE_STRATEGY_LABELS[record.strategy as keyof typeof COMPARE_STRATEGY_LABELS] ??
      record.strategy }}</a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'overallResult'">
            <a-tag v-if="record.overallResult === 'RUNNING'" color="processing">
              <template v-if="runningProgress[record.id]">
                进行中 {{ runningProgress[record.id].completed }}/{{ runningProgress[record.id].total }}
              </template>
              <template v-else>进行中</template>
            </a-tag>
            <a-tag v-else-if="record.overallResult" :color="COMPARE_RESULT_COLORS[record.overallResult]">
              {{ COMPARE_RESULT_LABELS[record.overallResult] ?? record.overallResult }}
            </a-tag>
            <span v-else style="color: #999">未运行</span>
          </template>
          <template v-else-if="column.dataIndex === 'startedAt'">
            {{ record.startedAt ? formatDateTime(record.startedAt) : '-' }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space :size="4" wrap>
              <a-tooltip :title="record.overallResult === 'RUNNING' ? '比对进行中' : '启动比对'">
                <a-button size="small" type="link" :disabled="record.overallResult === 'RUNNING'"
                  :loading="actLoading === record.id" @click="handleStart(record)">
                  <template #icon>
                    <PlayCircleOutlined />
                  </template>
                  启动
                </a-button>
              </a-tooltip>
              <a-button size="small" type="link" @click="openResults(record.id)">
                <template #icon>
                  <FileSearchOutlined />
                </template>
                结果
              </a-button>
              <a-button size="small" type="link" danger :disabled="record.overallResult === 'RUNNING'"
                @click="handleDelete(record)">
                <template #icon>
                  <DeleteOutlined />
                </template>
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建比对任务 -->
    <a-modal v-model:open="createOpen" title="新建比对任务" :width="640" :confirm-loading="creating" ok-text="创建"
      cancel-text="取消" @ok="handleCreate">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" style="margin-top: 12px">
        <a-form-item label="任务名" name="name" required>
          <a-input v-model:value="form.name" placeholder="如 users-check-2026" allow-clear />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="源数据源" name="sourceId" required>
              <a-select v-model:value="form.sourceId" show-search option-filter-prop="label"
                :options="dataSources.map((d) => ({ value: d.id, label: `${d.name} (${d.dbType})` }))" placeholder="源库"
                @change="loadTables" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标数据源" name="targetId" required>
              <a-select v-model:value="form.targetId" show-search option-filter-prop="label"
                :options="dataSources.map((d) => ({ value: d.id, label: `${d.name} (${d.dbType})` }))" placeholder="目标库"
                @change="loadTables" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="源 Schema">
              <a-input v-model:value="form.sourceSchema" placeholder="空=数据源默认" @change="loadTables" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标 Schema">
              <a-input v-model:value="form.targetSchema" placeholder="空=数据源默认" @change="loadTables" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="比对表(仅展示两侧同名表)">
          <a-select v-model:value="form.tables" mode="multiple"
            :options="availableTables.map((t) => ({ value: t, label: t }))" :loading="tablesLoading"
            placeholder="选择要比对的表" :max-tag-count="6" style="width: 100%" />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="比对策略">
              <a-select v-model:value="form.strategy" style="width: 300px;"
                :options="(Object.keys(COMPARE_STRATEGY_LABELS) as ('ROW_COUNT' | 'CHECKSUM' | 'DIFF_ROWS')[]).map((s) => ({ value: s, label: COMPARE_STRATEGY_LABELS[s] }))" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="并行 Worker">
              <a-input-number v-model:value="form.parallelWorkers" :min="1" :max="64" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 结果明细 -->
    <a-modal v-model:open="resultOpen" :title="`比对结果 - ${resultTaskName}`" :width="1600" :footer="null">
      <a-alert v-if="results.length"
        :type="results.every((r) => r.rowCountMatch && (r.checksumMatch === null || r.checksumMatch)) ? 'success' : 'error'"
        show-icon style="margin-bottom: 12px" :message="results.every((r) => r.rowCountMatch && (r.checksumMatch === null || r.checksumMatch))
      ? '全部表一致'
      : '存在不一致或失败的表'" />
      <a-table :columns="resultColumns" :data-source="results" :loading="resultLoading" row-key="id" size="small"
        :pagination="false" :scroll="{ x: 1480, y: 420 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'rowCountMatch'">
            <a-tag :color="record.rowCountMatch ? 'green' : 'red'">
              {{ record.rowCountMatch ? '一致' : '不一致' }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'checksumMatch'">
            <a-tag v-if="record.checksumMatch === null" color="default">未校验</a-tag>
            <a-tag v-else :color="record.checksumMatch ? 'green' : 'red'">
              {{ record.checksumMatch ? '一致' : '不一致' }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'comparedMode'">
            <a-tag v-if="record.comparedMode" :color="COMPARE_MODE_COLORS[record.comparedMode ?? ''] ?? 'default'">
              {{ COMPARE_MODE_LABELS[record.comparedMode ?? ''] ?? record.comparedMode }}
            </a-tag>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'diffCount'">
            <a-tooltip :title="record.comparedMode === 'CHUNKED'
      ? '分块精确差异行数'
      : (record.diffEstimate != null ? '旧口径: max(行数差, 抽样差异)' : '行数差')">
              <span :style="{ color: (record.diffExact ?? record.diffCount) ? '#ff4d4f' : undefined }">
                {{ diffCountText(record) }}
              </span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'chunk'">
            <a-button v-if="record.chunkCount" type="link" size="small" @click="openChunks(record)">
              {{ Number(record.diffChunkCount ?? 0).toLocaleString() }} / {{ Number(record.chunkCount).toLocaleString()
              }}
            </a-button>
            <span v-else style="color: #999">-</span>
          </template>
          <template v-else-if="column.dataIndex === 'note'">
            <a-tooltip v-if="record.note" :title="record.note" placement="topLeft">
              <span class="note-text">{{ record.note }}</span>
            </a-tooltip>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-button size="small" :disabled="!hasDiff(record)" @click="downloadDiff(record.compareTaskId, record.id)">
              差异 CSV
            </a-button>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 差异块明细(P1-10) -->
    <a-modal v-model:open="chunkModalVisible" :title="`差异块 - ${chunkResult?.sourceTable ?? ''}`" :width="1100"
      :footer="null">
      <a-alert message="分块校验: 仅展示哈希不一致的分块; 块内精确差异为 null 表示超阈值未精确计数。" type="info" show-icon
        style="margin-bottom: 12px" />
      <a-table :columns="chunkColumns" :data-source="chunkList" :loading="chunkLoading" row-key="id" size="small"
        :pagination="false" :scroll="{ x: 1000, y: 420 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'range'">
            {{ chunkRange(record) }}
          </template>
          <template v-else-if="column.dataIndex === 'diffRows'">
            <span v-if="record.diffRows != null" :style="{ color: '#ff4d4f' }">
              {{ Number(record.diffRows).toLocaleString() }}
            </span>
            <span v-else style="color: #999">未精确</span>
          </template>
          <template v-else-if="column.dataIndex === 'sourceHash'">
            <span class="hash-text">{{ record.sourceHash }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'targetHash'">
            <span class="hash-text">{{ record.targetHash }}</span>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<style scoped>
.filter-bar {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.filter-bar :deep(.ant-form-item) {
  margin-bottom: 0;
}

.note-text {
  color: var(--text-secondary, #8c8c8c);
  font-size: 12px;
}

.hash-text {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-secondary, #8c8c8c);
  word-break: break-all;
}
</style>
../../../utils/message../utils/compare../utils/download../utils/format