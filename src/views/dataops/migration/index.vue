<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { TableColumnsType } from 'ant-design-vue'
import {
  SwapOutlined,
  PlusOutlined,
  ImportOutlined,
  SearchOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
  DatabaseOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue'
import PageHeader from '/@/views/dataops/migration/components/PageHeader.vue'
import {
  cancelTaskApi,
  cloneTaskApi,
  deleteMigrationTaskApi,
  getTaskTemplateApi,
  importTaskTemplateApi,
  listMigrationTasksApi,
  pauseTaskApi,
  resumeTaskApi,
  runPrecheckApi,
  startTaskApi
} from '/@/views/dataops/api/migration'
import type { MigrationTask, PrecheckItem, TaskStatus } from '/@/views/dataops/api/model/migration'
import {
  MIGRATION_MODE_LABELS,
  TASK_STATUS_LABELS
} from '/@/views/dataops/utils/migration'
import { formatDateTime } from '/@/views/dataops/utils/format'
import { $message, $confirmAsync } from '/@/utils/message'
import { useTaskAction } from '/@/views/dataops/migration/composables/useTaskAction'
import { stompHub, TaskTopics } from '/@/views/dataops/api/progressPoll'

const router = useRouter()
const spinning = ref(false)
const datalist = ref<MigrationTask[]>([])
const total = ref(0)

const query = reactive({
  keyword: '',
  status: undefined as string | undefined,
  page: 1,
  size: 10
})

/** 预检查失败明细弹窗(模板态渲染,替代 h() VNode 拼接) */
const failModal = reactive({
  open: false,
  failCount: 0,
  items: [] as PrecheckItem[]
})

const statusOptions = (Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => ({
  value: s,
  label: TASK_STATUS_LABELS[s]
}))

/** 列表加载统一入口(silent=true 时不显示 loading,供轮询静默刷新) */
async function loadData(silent = false) {
  if (!silent) spinning.value = true
  try {
    const data = await listMigrationTasksApi(query)
    datalist.value = data.list ?? []
    total.value = data.total ?? 0
  } finally {
    if (!silent) spinning.value = false
  }
  syncWatch()
}

/**
 * 列表刷新策略: WS 在线时由 migration.state 推送事件驱动即时刷新
 * (为活跃任务订阅状态变更), 仅保留慢速兜底轮询(发现新建任务/外部状态漂移);
 * WS 断线时退订事件、恢复原 3s 列表轮询兜底。
 */
const hasActiveTasks = computed(() =>
  datalist.value.some((t) => t.status === 'RUNNING' || t.status === 'PAUSED')
)

const POLL_FALLBACK_MS = 3_000
const POLL_WS_SLOW_MS = 30_000
let pollTimer: number | undefined
/** 活跃任务 id -> state topic 退订函数 */
const stateUnsubs = new Map<number, () => void>()
/** 组件存活标志: 卸载后 syncWatch 不得再建订阅/重启轮询 */
let disposed = false

function schedulePoll() {
  if (pollTimer !== undefined) return
  pollTimer = window.setTimeout(async () => {
    pollTimer = undefined
    if (disposed || !hasActiveTasks.value) return
    // 兜底轮询失败不能断链: 吞掉异常后继续排下一拍, 否则一次网络抖动轮询就永久停止
    await loadData(true).catch(() => {})
    if (!disposed) schedulePoll()
  }, stompHub.isOnline() ? POLL_WS_SLOW_MS : POLL_FALLBACK_MS)
}

function stopPoll() {
  if (pollTimer !== undefined) {
    window.clearTimeout(pollTimer)
    pollTimer = undefined
  }
}

/** 同步订阅与轮询: 活跃任务状态订阅(始终订阅, 触发 hub 建连;离线时 hub 内部有 REST 兜底) + 轮询节拍 */
function syncWatch() {
  if (disposed) return
  const active = datalist.value.filter((t) => t.status === 'RUNNING' || t.status === 'PAUSED')
  active.forEach((t) => {
    if (!stateUnsubs.has(t.id)) {
      stateUnsubs.set(
        t.id,
        stompHub.subscribe(TaskTopics.state(t.id), () => loadData(true))
      )
    }
  })
  stateUnsubs.forEach((unsub, id) => {
    if (!active.some((t) => t.id === id)) {
      unsub()
      stateUnsubs.delete(id)
    }
  })
  if (hasActiveTasks.value) {
    // 重排节拍以采纳当前 WS 在线状态(在线 30s 慢速兜底, 离线 3s)
    stopPoll()
    schedulePoll()
  } else {
    stopPoll()
  }
}

watch(hasActiveTasks, () => syncWatch())
// WS 在线状态变化: 离线→退订事件+3s 轮询, 恢复→事件驱动+慢速轮询
// 必须保存退订句柄: 丢弃的话组件卸载后任意一次断连/重连都会回调 syncWatch,
// 重新建立 WS 订阅并重启轮询定时器, 完全绕过 onBeforeUnmount 的清理
const unsubWsStatus = stompHub.onStatusChange(() => syncWatch())

onBeforeUnmount(() => {
  disposed = true
  stopPoll()
  stateUnsubs.forEach((unsub) => unsub())
  stateUnsubs.clear()
  unsubWsStatus()
})

/** 搜索(重置回第一页) */
function handleSearch() {
  query.page = 1
  loadData()
}

/** 清空筛选条件并刷新 */
function handleReset() {
  query.keyword = ''
  query.status = undefined
  query.page = 1
  loadData()
}

/** 分页变化 */
function handleTableChange(pag: { current?: number; pageSize?: number }) {
  query.page = pag.current ?? 1
  query.size = pag.pageSize ?? 10
  loadData()
}

const { actingId: actLoading, run: handleAction } = useTaskAction(loadData)

/** 删除任务(二次确认) */
function handleDelete(task: MigrationTask) {
  $confirmAsync(
    '删除迁移任务',
    `确定删除任务「${task.name}」?其表配置与列映射将一并删除。`,
    async () => {
      await deleteMigrationTaskApi(task.id)
      $message('已删除')
      await loadData()
    }
  )
}

/** 预检查:通过弹成功提示,失败弹明细 */
async function handlePrecheck(task: MigrationTask) {
  actLoading.value = task.id
  try {
    const summary = await runPrecheckApi(task.id)
    if (summary.passed) {
      $message(`预检查通过: ${summary.passCount} 项 PASS, ${summary.warnCount} 项警告`)
      router.push({ path: '/dataops/migration/detail', query: { id: task.id } })
    } else {
      // 失败时停留在列表页并弹出明细,不能跳转,否则弹窗会被路由切换立刻销毁
      failModal.failCount = summary.failCount
      failModal.items = summary.items.filter((i) => i.status === 'FAIL' || i.level === 'WARN')
      failModal.open = true
    }
  } finally {
    actLoading.value = null
  }
}

/** 克隆任务(复制配置创建新任务,不含运行状态) */
async function handleClone(task: MigrationTask) {
  actLoading.value = task.id
  try {
    const created = await cloneTaskApi(task.id)
    $message(`已克隆为「${created.name}」`)
    await loadData()
  } finally {
    actLoading.value = null
  }
}

/** 导出任务模板(JSON 文件下载) */
async function handleExportTemplate(task: MigrationTask) {
  actLoading.value = task.id
  try {
    const tpl = await getTaskTemplateApi(task.id)
    const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `migration-template-${task.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    $message('任务模板已导出')
  } finally {
    actLoading.value = null
  }
}

/** 导入任务模板(隐藏 file input 触发) */
const importInputRef = ref<HTMLInputElement | null>(null)

function triggerImport() {
  importInputRef.value?.click()
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const tpl = JSON.parse(await file.text())
    const created = await importTaskTemplateApi(tpl)
    $message(`模板已导入,创建任务「${created.name}」`)
    await loadData()
  } finally {
    input.value = ''
  }
}

const columns: TableColumnsType = [
  { title: 'ID', dataIndex: 'id', width: 64 },
  { title: '任务名', dataIndex: 'name', ellipsis: true },
  { title: '源 → 目标', key: 'route', width: 320 },
  {
    title: '模式',
    dataIndex: 'migrationMode',
    width: 120,
    customRender: ({ text }) => MIGRATION_MODE_LABELS[text as string] ?? text
  },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '表数', key: 'tableCount', width: 80 },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 170,
    customRender: ({ text }) => (text ? formatDateTime(text) : '-')
  },
  { title: '操作', key: 'actions', width: 400, fixed: 'right' }
]

onMounted(loadData)
</script>

<template>
  <div class="page">
    <PageHeader title="迁移任务" description="配置源表与目标表映射，支持结构迁移、全量同步、断点续传与迁移后自动比对" :icon="SwapOutlined">
      <template #actions>
        <a-button @click="triggerImport">
          <template #icon>
            <ImportOutlined />
          </template>
          导入模板
        </a-button>
        <input ref="importInputRef" type="file" accept="application/json,.json" style="display: none"
          @change="onImportFile" />
        <a-button type="primary" @click="router.push('/dataops/migration/wizard')">
          <template #icon>
            <PlusOutlined />
          </template>
          新建迁移任务
        </a-button>
      </template>
    </PageHeader>

    <a-card :bordered="false">
      <div class="filter-bar">
        <a-form layout="inline" @submit.prevent>
          <a-form-item label="关键字">
            <a-input v-model:value="query.keyword" placeholder="任务名" allow-clear style="width: 200px"
              @press-enter="handleSearch">
              <template #prefix>
                <SearchOutlined class="filter-ico" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="query.status" :options="statusOptions" allow-clear placeholder="全部"
              style="width: 150px" @change="handleSearch" />
          </a-form-item>
          <a-form-item>
            <a-space :size="8">
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <SearchOutlined />
                </template>
                查询
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <ReloadOutlined />
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <a-table :columns="columns" :data-source="datalist" :loading="spinning" row-key="id" :pagination="{
      current: query.page,
      pageSize: query.size,
      total: total,
      showSizeChanger: true,
      showTotal: (t: number) => `共 ${t} 条`
    }" :scroll="{ x: 1250 }" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'id'">
            <span class="cell-id">#{{ record.id }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'name'">
            <a class="task-name" :title="record.name"
              @click="router.push({ path: '/dataops/migration/detail', query: { id: record.id } })">{{ record.name }}</a>
          </template>
          <template v-else-if="column.key === 'route'">
            <div class="route">
              <span class="route-node src">
                <DatabaseOutlined class="route-ico" />
                <span class="route-name">{{ record.sourceName ?? record.sourceId }}</span>
              </span>
              <ArrowRightOutlined class="route-arrow" />
              <span class="route-node dst">
                <CloudUploadOutlined class="route-ico" />
                <span class="route-name">{{ record.targetName ?? record.targetId }}</span>
              </span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <span class="status-pill" :data-status="record.status">
              <i class="status-dot" />
              {{ TASK_STATUS_LABELS[record.status as TaskStatus] ?? record.status }}
            </span>
          </template>
          <template v-else-if="column.key === 'tableCount'">
            <b class="cell-num">{{ record.includeTables?.length ?? 0 }}</b>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            <span class="cell-time">{{ record.createTime ? formatDateTime(record.createTime) : '-' }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space :size="2" wrap class="act-group">
              <a-tooltip v-if="['PENDING', 'FAILED', 'COMPLETED', 'CANCELLED'].includes(record.status)" title="启动">
                <a-button size="small" type="primary" :loading="actLoading === record.id"
                  @click="handleAction(record.id, startTaskApi, '任务已启动(执行引擎将在阶段 3 接入)')">启动</a-button>
              </a-tooltip>
              <a-button v-if="record.status === 'RUNNING'" size="small" :loading="actLoading === record.id"
                @click="handleAction(record.id, pauseTaskApi, '已暂停')">暂停</a-button>
              <a-button v-if="record.status === 'PAUSED'" size="small" :loading="actLoading === record.id"
                @click="handleAction(record.id, resumeTaskApi, '已恢复')">恢复</a-button>
              <a-button v-if="['RUNNING', 'PAUSED'].includes(record.status)" size="small" danger
                :loading="actLoading === record.id" @click="handleAction(record.id, cancelTaskApi, '已取消')">取消</a-button>
              <a-button size="small" type="link" :loading="actLoading === record.id"
                @click="handlePrecheck(record)">预检查</a-button>
              <a-button size="small" type="link"
                @click="router.push({ path: '/dataops/migration/detail', query: { id: record.id } })">详情</a-button>
              <a-button v-if="['PENDING', 'FAILED', 'COMPLETED', 'CANCELLED'].includes(record.status)" size="small"
                type="link" @click="router.push({ path: '/dataops/migration/wizard', query: { id: record.id } })">编辑</a-button>
              <a-button size="small" type="link" :loading="actLoading === record.id"
                @click="handleClone(record)">克隆</a-button>
              <a-button size="small" type="link" :loading="actLoading === record.id"
                @click="handleExportTemplate(record)">导出模板</a-button>
              <a-button v-if="!['RUNNING', 'PAUSED'].includes(record.status)" size="small" type="link" danger
                @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 预检查失败明细弹窗 -->
    <a-modal v-model:open="failModal.open" :title="`预检查未通过（${failModal.failCount} 项失败）`" :width="720" :footer="null">
      <div class="fail-list">
        <div v-for="i in failModal.items" :key="i.key" class="fail-line">
          <a-tag :color="i.status === 'FAIL' ? 'red' : 'orange'">{{ i.category }}/{{ i.key }}</a-tag>
          <span>{{ i.message }}</span>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
/* ============================================================
   页面级设计 token(dataops 浅色基线, 与 db-web 设计系统一致)
   PageHeader / 表格 / 胶囊样式均依赖这些变量
   ============================================================ */
.page {
  --brand: #2563eb;
  --brand-600: #1d4ed8;
  --brand-bg: #eff6ff;
  --warning: #f59e0b;
  --danger: #dc2626;
  --bg-subtle: #fafbfd;
  --border: #e8ebf2;
  --border-strong: #d9dee9;
  --text-1: #171c2c;
  --text-2: #4a5268;
  --text-3: #7c8497;
  --radius-sm: 8px;
  --radius: 12px;
}

/* ---------- 筛选栏 ---------- */
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

.filter-bar :deep(.ant-form-item-label > label) {
  color: var(--text-2);
  font-size: 13px;
}

.filter-ico {
  color: var(--text-3);
}

/* ---------- 单元格细节 ---------- */
.cell-id {
  font-size: 12.5px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.task-name {
  color: var(--text-1);
  font-weight: 550;
  transition: color 0.18s ease;
}

.task-name:hover {
  color: var(--brand);
}

.cell-num {
  font-weight: 600;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

.cell-time {
  color: var(--text-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

/* ---------- 源 → 目标 路由胶囊 ---------- */
.route {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.route-node {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 130px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
}

.route-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-node.src {
  color: var(--brand-600);
  background: var(--brand-bg);
  border: 1px solid rgba(37, 99, 235, 0.18);
}

.route-node.dst {
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.route-ico {
  font-size: 11px;
  flex-shrink: 0;
}

.route-arrow {
  color: var(--text-3);
  font-size: 12px;
  flex-shrink: 0;
}

/* ---------- 状态胶囊(带呼吸点) ---------- */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pill[data-status='PENDING'],
.status-pill[data-status='CANCELLED'] {
  color: var(--text-3);
  background: #f1f3f8;
}

.status-pill[data-status='PENDING'] .status-dot,
.status-pill[data-status='CANCELLED'] .status-dot {
  background: #98a1b3;
}

.status-pill[data-status='RUNNING'] {
  color: var(--brand-600);
  background: var(--brand-bg);
}

.status-pill[data-status='RUNNING'] .status-dot {
  background: var(--brand);
  animation: dot-pulse 1.6s ease-in-out infinite;
}

.status-pill[data-status='PAUSED'] {
  color: #92400e;
  background: #fffbeb;
}

.status-pill[data-status='PAUSED'] .status-dot {
  background: var(--warning);
}

.status-pill[data-status='COMPLETED'] {
  color: #15803d;
  background: #f0fdf4;
}

.status-pill[data-status='COMPLETED'] .status-dot {
  background: #16a34a;
}

.status-pill[data-status='FAILED'] {
  color: #b91c1c;
  background: #fef2f2;
}

.status-pill[data-status='FAILED'] .status-dot {
  background: var(--danger);
}

@keyframes dot-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.35);
  }

  50% {
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
}

/* ---------- 操作列 ---------- */
.act-group :deep(.ant-btn-link) {
  padding-inline: 6px;
}

.act-group :deep(.ant-btn) {
  transition: color 0.18s ease;
}

/* ---------- 预检查明细弹窗 ---------- */
.fail-list {
  max-height: 400px;
  overflow: auto;
}

.fail-line {
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  color: var(--text-2);
  transition: background 0.15s ease;
}

.fail-line:hover {
  background: var(--bg-subtle);
}

.fail-line:last-child {
  border-bottom: none;
}
</style>