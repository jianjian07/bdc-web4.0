<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TableColumnsType } from 'ant-design-vue'
import {
  cancelTaskApi,
  dryRunScriptApi,
  getLatestPrecheckApi,
  getMigrationTaskApi,
  getTaskHistoryApi,
  getTaskLogsApi,
  getTaskScriptsApi,
  pauseTaskApi,
  resumeTaskApi,
  runPrecheckApi,
  startTaskApi
} from '/@/views/dataops/api/migration'
import { stompHub, TaskTopics } from '/@/views/dataops/api/progressPoll'
import type { MigrationHistory, MigrationLogItem } from '/@/views/dataops/api/model/history'
import type {
  MigrationTask,
  PrecheckSummary,
  ScriptPhase,
  ScriptResponse,
  ScriptStatus,
  TaskStatus
} from '/@/views/dataops/api/model/migration'
import { LOG_LEVEL_COLORS } from '/@/views/dataops/utils/history'
import {
  MIGRATION_MODE_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  WRITE_MODE_LABELS
} from '/@/views/dataops/utils/migration'
import { formatDateTime, formatDuration } from '/@/views/dataops/utils/format'
import { $message, $warning } from '/@/utils/message'
import { useTaskAction } from '/@/views/dataops/migration/composables/useTaskAction'

const route = useRoute()
const router = useRouter()
// 详情页路由: /dataops/migration/detail?id=xx (query 传参, 与项目 sync 页面一致)
const taskId = Number(route.query.id)
// 坏路由参数(缺失/非数字)拦下: 否则以 NaN 打全量接口, 并引导回列表
const validTaskId = Number.isFinite(taskId)
if (!validTaskId) {
  $message('非法的任务 ID, 请从任务列表进入')
  router.replace('/dataops/migration')
}

const spinning = ref(false)
const task = ref<MigrationTask | null>(null)
const precheck = ref<PrecheckSummary | null>(null)
const precheckLoading = ref(false)

/** 最近历史 */
const history = ref<MigrationHistory | null>(null)

/** WS 实时消息 */
const liveState = ref<string | null>(null)
const liveProgress = ref<{
  totalTables?: number
  completedTables?: number
  failedTables?: number
  totalRows?: number
  migratedRows?: number
  historyId?: number
} | null>(null)
/** WS 实时日志消息(后端 ProgressHub 字段为 table) */
interface LiveLogMsg {
  taskId: number
  historyId: number
  table: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  loggedAt: string
}

const liveLogs = ref<LiveLogMsg[]>([])

/** DB 日志(分页, 供"运行日志"页签) */
const dbLogs = ref<MigrationLogItem[]>([])
const dbLogTotal = ref(0)
const dbLogPage = ref(1)
const dbLogLevel = ref<string | undefined>(undefined)
const dbLogKeyword = ref('')

/** WS 退订句柄 */
let unsubscribers: Array<() => void> = []

/** 任务状态(WS 实时优先) */
const status = computed<TaskStatus | undefined>(
  () => (liveState.value ?? task.value?.status) as TaskStatus | undefined
)

/** SQL_SCRIPT 模式: 以脚本清单替代表配置 */
const isScriptMode = computed(() => task.value?.migrationMode === 'SQL_SCRIPT')
const scripts = ref<ScriptResponse[]>([])

const SCRIPT_PHASE_LABELS: Record<ScriptPhase, string> = {
  PRE: '前置',
  MAIN: '主体',
  POST: '后置'
}
const SCRIPT_STATUS_COLORS: Record<ScriptStatus, string> = {
  PENDING: 'default',
  RUNNING: 'processing',
  COMPLETED: 'success',
  FAILED: 'error',
  SKIPPED: 'warning'
}

/** 脚本清单加载(运行中每秒随 WS 进度刷新) */
async function loadScripts() {
  try {
    scripts.value = await getTaskScriptsApi(taskId)
  } catch {
    scripts.value = []
  }
}

/** 详情加载统一入口 */
async function loadData() {
  spinning.value = true
  try {
    task.value = await getMigrationTaskApi(taskId)
    if (task.value.migrationMode === 'SQL_SCRIPT') {
      await loadScripts()
      if (activeTab.value === 'tables') activeTab.value = 'scripts'
    } else {
      scripts.value = []
    }
    try {
      precheck.value = await getLatestPrecheckApi(taskId)
    } catch {
      precheck.value = null
    }
    try {
      history.value = await getTaskHistoryApi(taskId)
    } catch {
      history.value = null
    }
    syncSubscription()
  } finally {
    spinning.value = false
  }
}

/** 按当前状态订阅/退订 WS */
function syncSubscription() {
  const st = status.value
  const needSubscribe = st === 'RUNNING' || st === 'PAUSED'
  if (needSubscribe && !unsubscribers.length) {
    unsubscribers.push(
      stompHub.subscribe(TaskTopics.state(taskId), (msg) => {
        const m = msg as { from: string; to: string }
        liveState.value = m.to
        if (['COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED'].includes(m.to)) {
          setTimeout(() => {
            loadData()
          }, 800)
        }
      }),
      stompHub.subscribe(TaskTopics.progress(taskId), (msg) => {
        liveProgress.value = msg as typeof liveProgress.value
        // 脚本模式: 进度即脚本状态,每秒随推送刷新一次清单
        if (isScriptMode.value) {
          loadScripts()
        }
      }),
      stompHub.subscribe(TaskTopics.tables(taskId), (msg) => {
        const t = msg as {
          table: string
          status?: string
          migratedRows?: number
          totalRows?: number
        }
        const row = task.value?.taskTables?.find(
          (x) => x.targetTable === t.table || x.sourceTable === t.table
        )
        if (row) {
          row.migratedRows = t.migratedRows ?? row.migratedRows
          row.totalRows = t.totalRows ?? row.totalRows
          if (t.status) row.status = t.status as typeof row.status
        }
      }),
      stompHub.subscribe(TaskTopics.log(taskId), (msg) => {
        liveLogs.value.unshift(msg as LiveLogMsg)
        if (liveLogs.value.length > 200) {
          liveLogs.value.splice(200)
        }
      })
    )
  } else if (!needSubscribe && unsubscribers.length) {
    if (status.value && !['RUNNING', 'PAUSED'].includes(status.value)) {
      unsubscribers.forEach((u) => u())
      unsubscribers = []
    }
  }
}

const { acting, run: runTaskAction } = useTaskAction(loadData)

/** 任务操作(启动/暂停/恢复/取消) */
function handleAction(fn: (id: number) => Promise<unknown>, ok: string) {
  // 操作成功后丢弃 WS 推送的实时状态,以接口返回的最新状态为准
  return runTaskAction(taskId, fn, ok, () => {
    liveState.value = null
  })
}

/** 执行预检查 */
async function handlePrecheck() {
  precheckLoading.value = true
  try {
    precheck.value = await runPrecheckApi(taskId)
    $message(precheck.value.passed ? '预检查通过' : `预检查 ${precheck.value.failCount} 项失败`)
  } finally {
    precheckLoading.value = false
  }
}

/** 加载 DB 运行日志(分页,支持关键字搜索) */
async function loadDbLogs() {
  const page = await getTaskLogsApi(taskId, {
    level: dbLogLevel.value,
    keyword: dbLogKeyword.value.trim() || undefined,
    page: dbLogPage.value,
    size: 50
  })
  dbLogs.value = page.list ?? []
  dbLogTotal.value = page.total ?? 0
}

function onDbLogPageChange(p: number) {
  dbLogPage.value = p
  loadDbLogs()
}

function onLogLevelChange() {
  dbLogPage.value = 1
  loadDbLogs()
}

function onLogKeywordSearch() {
  dbLogPage.value = 1
  loadDbLogs()
}

const tableColumns: TableColumnsType = [
  { title: '源表', dataIndex: 'sourceTable', ellipsis: true },
  { title: '目标表', dataIndex: 'targetTable', ellipsis: true },
  {
    title: '模式',
    dataIndex: 'migrationMode',
    width: 120,
    customRender: ({ text }) => MIGRATION_MODE_LABELS[text as string] ?? text
  },
  {
    title: '写入',
    dataIndex: 'writeMode',
    width: 170,
    customRender: ({ text }) => WRITE_MODE_LABELS[text as keyof typeof WRITE_MODE_LABELS] ?? text ?? '-'
  },
  { title: '状态', dataIndex: 'status', width: 110 },
  { title: '进度', key: 'progress', width: 160 },
  { title: '已迁/总行数', key: 'rows', width: 160 },
  { title: '列映射', key: 'cmCount', width: 90 }
]

const scriptColumns: TableColumnsType = [
  { title: '顺序', dataIndex: 'seq', width: 70 },
  { title: '脚本名', dataIndex: 'scriptName', ellipsis: true },
  { title: '阶段', dataIndex: 'execPhase', width: 90 },
  { title: '执行库', dataIndex: 'scriptType', width: 100 },
  { title: '失败策略', dataIndex: 'onError', width: 110 },
  { title: '目标表(自动比对)', dataIndex: 'targetTables', width: 200, ellipsis: true },
  { title: '写前动作', dataIndex: 'preWriteAction', width: 110 },
  { title: '状态', dataIndex: 'status', width: 110 },
  { title: '语句数', dataIndex: 'executedStatements', width: 90 },
  { title: '影响行数', dataIndex: 'affectedRows', width: 110 },
  { title: '耗时', key: 'duration', width: 100 },
  { title: '错误信息', dataIndex: 'errorMessage', ellipsis: true },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

const precheckColumns: TableColumnsType = [
  { title: '类别', dataIndex: 'category', width: 100 },
  { title: '检查项', dataIndex: 'key', width: 240, ellipsis: true },
  { title: '级别', dataIndex: 'level', width: 80 },
  { title: '结果', dataIndex: 'status', width: 80 },
  { title: '说明', dataIndex: 'message' }
]

/** 表级进度百分比 */
function progressOf(row: { status: string; totalRows?: number; migratedRows?: number }): number {
  if (row.status === 'COMPLETED') return 100
  if (!row.totalRows || row.totalRows <= 0) return 0
  return Math.min(100, Math.round(((row.migratedRows ?? 0) / row.totalRows) * 100))
}

/** 脚本耗时(开始→结束) */
function scriptDuration(s: ScriptResponse): string {
  if (!s.startedAt) return '-'
  const end = s.finishedAt ? Date.parse(s.finishedAt) : Date.now()
  return formatDuration(end - Date.parse(s.startedAt))
}

/** 单脚本试运行(事务内执行后回滚, 不落库) */
const dryRunningId = ref<number | null>(null)
async function dryRunScript(row: ScriptResponse) {
  dryRunningId.value = row.id
  try {
    const r = await dryRunScriptApi(taskId, {
      scriptName: row.scriptName,
      scriptContent: row.scriptContent ?? '',
      execPhase: row.execPhase,
      scriptType: row.scriptType,
      onError: row.onError,
      timeoutSec: row.timeoutSec
    })
    if (r.success) {
      $message(
        `试运行通过 ✅ ${r.statementCount ?? 0} 条语句, 影响 ${r.affectedRows ?? 0} 行, 耗时 ${r.durationMs ?? 0} ms(已回滚)`
      )
    } else {
      $warning(`试运行失败${r.errorLine ? ` (第 ${r.errorLine} 行附近)` : ''}: ${r.errorMessage ?? '未知错误'}`)
    }
  } finally {
    dryRunningId.value = null
  }
}

const activeTab = ref('tables')

onMounted(() => {
  if (!validTaskId) return
  loadData()
  loadDbLogs()
})

onBeforeUnmount(() => {
  unsubscribers.forEach((u) => u())
  unsubscribers = []
})
</script>

<template>
  <a-spin :spinning="spinning">
    <a-card v-if="task" :title="`任务 #${task.id} ${task.name}`">
      <template #extra>
        <a-space>
          <a-button v-if="['PENDING', 'FAILED', 'COMPLETED', 'CANCELLED'].includes(status!)" type="primary"
            :loading="acting" @click="handleAction(startTaskApi, '任务已启动,引擎已开始搬运数据')">启动</a-button>
          <a-button v-if="status === 'RUNNING'" :loading="acting"
            @click="handleAction(pauseTaskApi, '已请求暂停,worker 将在批边界停下')">暂停</a-button>
          <a-button v-if="status === 'PAUSED'" :loading="acting"
            @click="handleAction(resumeTaskApi, '已从断点恢复')">恢复</a-button>
          <a-button v-if="['RUNNING', 'PAUSED'].includes(status!)" danger :loading="acting"
            @click="handleAction(cancelTaskApi, '已请求取消')">取消</a-button>
          <a-button :loading="precheckLoading" @click="handlePrecheck">执行预检查</a-button>
          <a-button v-if="['PENDING', 'FAILED', 'COMPLETED', 'CANCELLED'].includes(status!)"
            @click="router.push({ path: '/dataops/migration/wizard', query: { id: taskId } })">编辑</a-button>
          <a-button @click="router.push('/dataops/migration')">返回列表</a-button>
        </a-space>
      </template>

      <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
        <a-descriptions-item label="状态">
          <a-tag :color="TASK_STATUS_COLORS[status!]">
            {{ TASK_STATUS_LABELS[status!] ?? status }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="模式">
          <a-tag>{{ MIGRATION_MODE_LABELS[task.migrationMode] }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="源 → 目标">
          {{ task.sourceName ?? task.sourceId }} → {{ task.targetName ?? task.targetId }}
        </a-descriptions-item>
        <a-descriptions-item label="并行 Worker">{{ task.parallelWorkers }}</a-descriptions-item>
        <a-descriptions-item label="批大小">{{ task.batchSize?.toLocaleString() }}</a-descriptions-item>
        <a-descriptions-item label="断点续传">
          <a-tag :color="task.enableCheckpoint ? 'green' : 'default'">{{ task.enableCheckpoint ? '开' : '关' }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDateTime(task.createTime) }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ formatDateTime(task.updateTime) }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ task.remark || '-' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 实时进度概览(运行中) -->
      <a-alert v-if="liveProgress && ['RUNNING', 'PAUSED'].includes(status!)"
        :type="status === 'RUNNING' ? 'info' : 'warning'" show-icon style="margin-bottom: 16px">
        <template #message>
          实时进度: {{ isScriptMode ? '脚本' : '表' }} {{ liveProgress.completedTables ?? 0 }}/{{
    liveProgress.totalTables ?? (isScriptMode ? scripts.length : task.taskTables?.length) ?? 0
  }} 完成
          (失败 {{ liveProgress.failedTables ?? 0 }}),
          {{ isScriptMode ? '影响' : '行' }} {{ Number(liveProgress.migratedRows ?? 0).toLocaleString() }}
          <template v-if="!isScriptMode">
            / {{ Number(liveProgress.totalRows ?? 0).toLocaleString() }}
          </template>
        </template>
      </a-alert>

      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane v-if="isScriptMode" key="scripts" :tab="`脚本清单 (${scripts.length})`">
          <a-alert type="info" show-icon style="margin-bottom: 12px"
            message="脚本按阶段(PRE→MAIN→POST)+顺序串行执行,每个脚本独立一个事务;失败时整体回滚。" />
          <a-table :columns="scriptColumns" :data-source="scripts" row-key="id" size="small" :pagination="false"
            :scroll="{ x: 1320 }" style="margin-bottom: 8px">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'execPhase'">
                <a-tag :color="record.execPhase === 'PRE' ? 'blue' : record.execPhase === 'POST' ? 'purple' : 'green'">
                  {{ SCRIPT_PHASE_LABELS[record.execPhase as ScriptPhase] ?? record.execPhase }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'scriptType'">
                {{ record.scriptType === 'SOURCE_DB' ? '源库' : '目标库' }}
              </template>
              <template v-else-if="column.dataIndex === 'targetTables'">
                <template v-if="record.targetTables?.length">
                  <a-tag v-for="t in record.targetTables" :key="t" color="geekblue">{{ t }}</a-tag>
                </template>
                <span v-else style="color: #bbb">-</span>
              </template>
              <template v-else-if="column.dataIndex === 'preWriteAction'">
                <a-tag v-if="record.preWriteAction === 'TRUNCATE_TARGETS'" color="orange">清空再写入</a-tag>
                <span v-else style="color: #bbb">不清空</span>
              </template>
              <template v-else-if="column.dataIndex === 'onError'">
                {{ record.onError === 'CONTINUE' ? '继续下一个' : '中止后续' }}
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <a-tag :color="SCRIPT_STATUS_COLORS[record.status as ScriptStatus] ?? 'default'">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'affectedRows'">
                {{ Number(record.affectedRows ?? 0).toLocaleString() }}
              </template>
              <template v-else-if="column.key === 'duration'">
                {{ scriptDuration(record) }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button size="small" :loading="dryRunningId === record.id" @click="dryRunScript(record)">
                  试运行
                </a-button>
              </template>
            </template>
            <template #expandedRowRender="{ record }">
              <div class="sql-preview">{{ record.scriptContent || '(空)' }}</div>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane v-if="!isScriptMode" key="tables" :tab="`表配置 (${task.taskTables?.length ?? 0})`">
          <a-table :columns="tableColumns" :data-source="task.taskTables ?? []" row-key="id" size="small"
            :pagination="false" :scroll="{ x: 1000 }" style="margin-bottom: 8px">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag :color="record.status === 'COMPLETED' ? 'green' : record.status === 'FAILED' ? 'red'
    : record.status === 'RUNNING' ? 'processing' : record.status === 'PAUSED' ? 'warning' : 'default'">{{
    record.status }}</a-tag>
              </template>
              <template v-else-if="column.key === 'progress'">
                <a-progress :percent="progressOf(record)" size="small"
                  :status="record.status === 'FAILED' ? 'exception' : undefined" />
              </template>
              <template v-else-if="column.key === 'rows'">
                {{ Number(record.migratedRows ?? 0).toLocaleString() }} / {{ Number(record.totalRows ??
    0).toLocaleString() }}
              </template>
              <template v-else-if="column.key === 'cmCount'">
                {{ record.columnMappings?.length ?? 0 }}
              </template>
            </template>
            <template #expandedRowRender="{ record }">
              <div v-if="record.columnMappings?.length">
                <div v-for="cm in record.columnMappings" :key="cm.sourceColumn" class="cm-line">
                  <a-tag>{{ cm.sourceColumn }}</a-tag>
                  <span v-if="cm.targetColumn">→ <b>{{ cm.targetColumn }}</b></span>
                  <span v-else style="color: red">→ (忽略)</span>
                  <a-tag v-if="cm.targetType" style="margin-left: 8px">{{ cm.targetType }}</a-tag>
                  <code v-if="cm.transformExpr" style="margin-left: 8px">{{ cm.transformExpr }}</code>
                </div>
              </div>
              <div v-else style="color: #999">全部列同名映射（未定制）</div>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="history" :tab="`最近历史${history ? ` #${history.id}` : ''}`">
          <a-empty v-if="!history" description="尚无运行历史" :image-style="{ height: '48px' }" style="padding: 32px 0" />
          <template v-else>
            <a-descriptions :column="4" bordered size="small" style="margin-bottom: 12px">
              <a-descriptions-item label="历史 ID">#{{ history.id }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ history.status }}</a-descriptions-item>
              <a-descriptions-item label="表(完成/失败/总)">
                {{ history.completedTables }} / {{ history.failedTables }} / {{ history.totalTables }}
              </a-descriptions-item>
              <a-descriptions-item label="迁移行数">
                {{ Number(history.migratedRows ?? 0).toLocaleString() }}
              </a-descriptions-item>
              <a-descriptions-item label="耗时">{{ formatDuration(history.durationMs) }}</a-descriptions-item>
              <a-descriptions-item label="开始">{{ formatDateTime(history.startedAt) }}</a-descriptions-item>
              <a-descriptions-item label="结束">{{ formatDateTime(history.finishedAt) }}</a-descriptions-item>
              <a-descriptions-item label="操作">
                <a @click="router.push('/dataops/history')">更多历史</a>
              </a-descriptions-item>
            </a-descriptions>
            <a-alert v-if="history.errorSummary" type="error" show-icon :message="`失败摘要: ${history.errorSummary}`" />
          </template>
        </a-tab-pane>

        <a-tab-pane key="liveLogs" :tab="`实时日志 (${liveLogs.length})`">
          <div class="log-toolbar">
            <a-tag :color="['RUNNING', 'PAUSED'].includes(status!) ? 'processing' : 'default'">
              {{ ['RUNNING', 'PAUSED'].includes(status!) ? 'WS 订阅中' : '任务未运行' }}
            </a-tag>
          </div>
          <div v-if="liveLogs.length" class="log-stream">
            <div v-for="(l, i) in liveLogs" :key="i" class="log-line">
              <span class="log-time">{{ formatDateTime(l.loggedAt, 'HH:mm:ss') }}</span>
              <a-tag :color="LOG_LEVEL_COLORS[l.level]" class="log-level">{{ l.level }}</a-tag>
              <span class="log-table">{{ l.table || '-' }}</span>
              <span class="log-msg">{{ l.message }}</span>
            </div>
          </div>
          <a-empty v-else description="暂无实时日志(任务启动后自动推送)" :image-style="{ height: '48px' }" style="padding: 32px 0" />
        </a-tab-pane>

        <a-tab-pane key="dbLogs" :tab="`运行日志 (${dbLogTotal})`">
          <div class="log-toolbar">
            <a-select v-model:value="dbLogLevel" allow-clear placeholder="级别" style="width: 120px"
              :options="['INFO', 'WARN', 'ERROR'].map((l) => ({ value: l, label: l }))" @change="onLogLevelChange" />
            <a-input-search v-model:value="dbLogKeyword" placeholder="日志内容关键字" allow-clear style="width: 220px"
              @search="onLogKeywordSearch" />
            <a-button size="small" @click="loadDbLogs">刷新</a-button>
          </div>
          <a-table :columns="[
    { title: '时间', dataIndex: 'loggedAt', width: 170 },
    { title: '级别', dataIndex: 'level', width: 80 },
    { title: '表', dataIndex: 'tableName', width: 200, ellipsis: true },
    { title: '内容', dataIndex: 'message', ellipsis: true }
  ]" :data-source="dbLogs" row-key="id" size="small" :pagination="{
    current: dbLogPage,
    pageSize: 50,
    total: dbLogTotal,
    onChange: onDbLogPageChange,
    showTotal: (t: number) => `共 ${t} 条`
  }">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'loggedAt'">
                {{ formatDateTime(record.loggedAt) }}
              </template>
              <template v-else-if="column.dataIndex === 'level'">
                <a-tag :color="LOG_LEVEL_COLORS[record.level]">{{ record.level }}</a-tag>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="precheck" :tab="`预检查${precheck ? ` (${precheck.failCount} FAIL)` : ''}`">
          <div v-if="precheck" style="padding-bottom: 16px">
            <a-alert :type="precheck.passed ? 'success' : 'error'" show-icon
              :message="`PASS ${precheck.passCount} / FAIL ${precheck.failCount} / WARN ${precheck.warnCount}`"
              style="margin-bottom: 12px" />
            <a-table :columns="precheckColumns" :data-source="precheck.items" row-key="key" size="small"
              :pagination="false" :scroll="{ y: 300 }">
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'level'">
                  <a-tag :color="record.level === 'ERROR' ? 'red' : record.level === 'WARN' ? 'orange' : 'green'">
                    {{ record.level }}
                  </a-tag>
                </template>
                <template v-else-if="column.dataIndex === 'status'">
                  <a-tag :color="record.status === 'PASS' ? 'green' : record.status === 'FAIL' ? 'red' : 'default'">
                    {{ record.status }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </div>
          <div v-else style="color: #999; padding: 12px 0">尚未执行预检查</div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </a-spin>
</template>

<style scoped>
h4 {
  margin: 16px 0 8px;
}

.cm-line {
  padding: 2px 0;
}

.sql-preview {
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 260px;
  overflow: auto;
  background: #fafafa;
  border-radius: 4px;
  padding: 8px;
  color: #333;
}

.log-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.log-stream {
  height: 420px;
  overflow: auto;
  font-size: 12px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: #0d1117;
  border-radius: 6px;
  padding: 8px 10px;
}

.log-line {
  display: flex;
  gap: 6px;
  padding: 2px 0;
  align-items: baseline;
}

.log-time {
  color: #8b949e;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  transform: scale(0.85);
}

.log-table {
  color: #79c0ff;
  flex-shrink: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-msg {
  color: #c9d1d9;
  word-break: break-all;
}
</style>