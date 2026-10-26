<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { GaugeChart, BarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { GridComponent, TooltipComponent } from 'echarts/components'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import PageHeader from '/@/views/dataops/migration/components/PageHeader.vue'
import { useMonitorStore } from '/@/store/modules/migrationMonitor'
import { getMetricsApi } from '/@/views/dataops/api/monitor'
import type { MetricsSnapshot } from '/@/views/dataops/api/model/monitor'
import type { MigrationTask, TaskStatus } from '/@/views/dataops/api/model/migration'
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '/@/views/dataops/utils/migration'
import { formatDateTime, formatSeconds, percent } from '/@/views/dataops/utils/format'

// 按需注册 ECharts 组件
use([GaugeChart, BarChart, CanvasRenderer, GridComponent, TooltipComponent])

const router = useRouter()
const monitor = useMonitorStore()

/** 暗色大屏主题下的图表公共配色 */
const CHART = {
  text: '#94a3b8',
  textBright: '#e2e8f0',
  track: 'rgba(148, 163, 184, 0.14)',
  split: 'rgba(148, 163, 184, 0.12)',
  blue: '#38bdf8',
  indigo: '#6366f1'
}

/** 暗色主题 tooltip */
const darkTooltip = {
  backgroundColor: 'rgba(15, 23, 42, 0.92)',
  borderColor: 'rgba(148, 163, 184, 0.25)',
  textStyle: { color: CHART.textBright }
}

/**
 * 列表/指标刷新节拍(兜底): WS 在线时任务状态变更事件已驱动列表实时刷新(store 订阅
 * migration.state), 这里只做慢速兜底(发现新建任务/刷新指标);WS 断线时恢复 5s REST 兜底。
 */
const POLL_FALLBACK_MS = 5_000
const POLL_WS_SLOW_MS = 30_000
const POLL_IDLE_MS = 60_000
let pollTimer: number | undefined
/** 组件存活标志: 卸载后不得再重排轮询 —— clearTimeout 只能取消尚未触发的定时器,
 *  回调若已进入 await, finally 里的 schedulePoll 会在卸载后重新挂表, 永久轮询 */
let disposed = false

function schedulePoll() {
  const delay = !monitor.wsOnline
    ? POLL_FALLBACK_MS
    : monitor.runningTasks.length > 0
      ? POLL_WS_SLOW_MS
      : POLL_IDLE_MS
  pollTimer = window.setTimeout(async () => {
    if (disposed) return
    try {
      await Promise.all([monitor.fetchTasksAction(), loadMetrics()])
    } finally {
      if (!disposed) schedulePoll()
    }
  }, delay)
}

/** WS 在线状态变化时立即重排节拍(断线→5s 兜底, 恢复→慢速兜底) */
watch(
  () => monitor.wsOnline,
  () => {
    if (pollTimer !== undefined) {
      window.clearTimeout(pollTimer)
      schedulePoll()
    }
  }
)

/** 引擎指标快照(P1-13): 与任务列表同一节拍刷新, 不额外开定时器 */
const metrics = ref<MetricsSnapshot | null>(null)

async function loadMetrics() {
  try {
    metrics.value = await getMetricsApi()
  } catch {
    // 指标是锦上添花, 拿不到不该影响大屏主体
    metrics.value = null
  }
}

onMounted(() => {
  // 先绑定连接状态监听,否则 wsOnline 恒为初始值,断线时大屏会一直显示"已连接"
  monitor.bindWsStatus()
  monitor.fetchTasksAction()
  loadMetrics()
  schedulePoll()
})

onBeforeUnmount(() => {
  disposed = true
  if (pollTimer) window.clearTimeout(pollTimer)
})

/** 全局统计(响应式) */
const stats = computed(() => monitor.stats)

/** 运行中/暂停任务 + 实时进度合并展示 */
const runningTasks = computed(() => monitor.runningTasks)

/** 全局行数进度 */
const rowStats = computed(() => {
  let totalRows = 0
  let migratedRows = 0
  // 只聚合活跃(运行中/暂停)任务 —— 与 totalQps/totalEtaSeconds 同口径。
  // 已完成任务的进度快照是"历史值", 混入聚合会把后续任务的进度稀释/虚增
  // (典型症状: 已迁移 > 总数、总进度被钳到 100%)。
  for (const t of monitor.runningTasks) {
    const p = monitor.progressMap[t.id]
    if (p) {
      totalRows += p.totalRows ?? 0
      migratedRows += p.migratedRows ?? 0
    }
  }
  return { totalRows, migratedRows, percent: percent(migratedRows, totalRows) }
})

/** 全局实时速率(所有运行任务 QPS 之和) */
const totalQps = computed(() =>
  runningTasks.value.reduce((sum, t) => sum + (monitor.progressMap[t.id]?.qps ?? 0), 0)
)

/** 全局预计剩余时间(剩余行数 / 全局速率) */
const totalEtaSeconds = computed(() => {
  const remaining = rowStats.value.totalRows - rowStats.value.migratedRows
  if (rowStats.value.totalRows <= 0 || totalQps.value <= 0 || remaining <= 0) return -1
  return Math.round(remaining / totalQps.value)
})

/** ETA 人类可读;小于 1 秒视为即将完成 */
function etaFormat(seconds: number | undefined): string {
  return formatSeconds(seconds, { lessThanOneText: '即将完成' })
}

/** 全局进度仪表盘 option(暗色 + 渐变光环) */
const gaugeOption = computed(() => ({
  series: [
    {
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      radius: '95%',
      progress: {
        show: true,
        width: 16,
        roundCap: true,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: CHART.blue },
              { offset: 1, color: CHART.indigo }
            ]
          },
          shadowColor: 'rgba(56, 189, 248, 0.45)',
          shadowBlur: 14
        }
      },
      axisLine: { lineStyle: { width: 16, color: [[1, CHART.track]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 34,
        fontWeight: 700,
        color: CHART.textBright,
        offsetCenter: [0, 0]
      },
      title: { show: false },
      data: [{ value: rowStats.value.percent }]
    }
  ]
}))

/** 各运行任务进度柱状图 option(暗色) */
const barOption = computed(() => {
  const tasks = runningTasks.value.slice(0, 8)
  return {
    tooltip: { trigger: 'axis', ...darkTooltip },
    grid: { left: 8, right: 34, top: 10, bottom: 24, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: CHART.text, fontSize: 11 },
      splitLine: { lineStyle: { color: CHART.split } },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: tasks.map((t) => t.name),
      axisLabel: { width: 110, overflow: 'truncate', color: CHART.text, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: tasks.map((t) => {
          const p = monitor.progressMap[t.id]
          if (!p || !p.totalRows) return 0
          return percent(p.migratedRows, p.totalRows)
        }),
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: CHART.indigo },
              { offset: 1, color: CHART.blue }
            ]
          }
        },
        barMaxWidth: 14,
        label: { show: true, position: 'right', formatter: '{c}%', color: CHART.textBright, fontSize: 11 },
        showBackground: true,
        backgroundStyle: { color: CHART.track, borderRadius: [0, 6, 6, 0] }
      }
    ]
  }
})

/** 实时日志(倒序展示最新) */
const logs = computed(() => [...monitor.logs].reverse())

function liveStatus(t: MigrationTask): TaskStatus {
  return (monitor.stateMap[t.id] ?? t.status) as TaskStatus
}

const statCards = computed(() => [
  { label: '任务总数', value: stats.value.total, icon: DashboardOutlined, color: '#38bdf8' },
  { label: '运行中 / 暂停', value: stats.value.running, icon: PlayCircleOutlined, color: '#fbbf24' },
  { label: '已完成', value: stats.value.completed, icon: CheckCircleOutlined, color: '#34d399' },
  { label: '失败', value: stats.value.failed, icon: CloseCircleOutlined, color: '#f87171' }
])

/**
 * 引擎指标卡片(P1-13)
 * 只挑运维真正会盯的几个数: 活跃 worker 反映并发是否跑满, 累计行数反映吞吐,
 * 重试/失败/脏数据反映稳定性 —— 这三个数突然抬头就是该介入的信号, 因此标红。
 */
const metricCards = computed(() => {
  const m = metrics.value
  return [
    { label: '活跃 worker', value: m?.activeWorkers ?? 0, alert: false },
    { label: '运行中任务', value: m?.runningTasks ?? 0, alert: false },
    { label: '累计迁移行数', value: m?.migratedRowsTotal ?? 0, alert: false },
    // { label: 'chunk 重试', value: m?.chunkRetriesTotal ?? 0, alert: (m?.chunkRetriesTotal ?? 0) > 0 },
    // { label: 'chunk 失败', value: m?.chunkFailuresTotal ?? 0, alert: (m?.chunkFailuresTotal ?? 0) > 0 },
    { label: '表失败', value: m?.tableFailuresTotal ?? 0, alert: (m?.tableFailuresTotal ?? 0) > 0 },
    { label: '脏数据 chunk', value: m?.dirtyChunksTotal ?? 0, alert: (m?.dirtyChunksTotal ?? 0) > 0 }
  ]
})

function percentOf(task: MigrationTask): number {
  const p = monitor.progressMap[task.id]
  if (!p || !p.totalRows) return 0
  return percent(p.migratedRows, p.totalRows)
}
</script>

<template>
  <div class="page monitor-page">
    <PageHeader title="监控大屏" description="实时总进度、各表进度、迁移速率与预计剩余时间，异常日志即时推送" :icon="DashboardOutlined">
      <template #actions>
        <span class="ws-badge" :class="{ online: monitor.wsOnline }">
          <span class="ws-dot" />
          {{ monitor.wsOnline ? '实时推送已连接' : '实时推送未连接' }}
        </span>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div v-for="c in statCards" :key="c.label" class="stat-card">
        <div class="stat-icon" :style="{
      color: c.color,
      background: `radial-gradient(circle at 30% 30%, ${c.color}2e, ${c.color}10)`,
      boxShadow: `inset 0 0 0 1px ${c.color}3d, 0 0 16px ${c.color}26`
    }">
          <component :is="c.icon" />
        </div>
        <div class="stat-meta">
          <div class="stat-value" :style="{ textShadow: `0 0 24px ${c.color}55` }">{{ c.value.toLocaleString() }}</div>
          <div class="stat-label">{{ c.label }}</div>
        </div>
        <i class="stat-glow" :style="{ background: `radial-gradient(circle, ${c.color}2b, transparent 70%)` }" />
      </div>
    </div>

    <!-- 引擎指标(P1-13): 与 Prometheus 上的 dbmigrator_* 同源 -->
    <div class="panel">
      <div class="panel-head">
        <span class="panel-title">引擎指标</span>
        <span class="metrics-endpoint">
          <!-- Prometheus: <code>{{ metrics?.prometheusEndpoint ?? '/actuator/prometheus' }}</code> -->
        </span>
      </div>
      <div class="metric-grid">
        <div v-for="m in metricCards" :key="m.label" class="metric-item" :class="{ 'is-alert': m.alert }">
          <div class="metric-value" :class="{ 'is-alert': m.alert }">{{ m.value.toLocaleString() }}</div>
          <div class="metric-label">
            <i v-if="m.alert" class="alert-dot" />{{ m.label }}
          </div>
        </div>
      </div>
      <div v-if="!metrics" class="metrics-unavailable">指标服务暂不可用（不影响迁移）</div>
    </div>

    <!-- 进度区 -->
    <div class="grid progress-grid">
      <div class="panel gauge-panel">
        <div class="panel-head">
          <span class="panel-title">总迁移进度</span>
        </div>
        <div class="gauge-wrap">
          <div class="gauge-halo" />
          <VChart :option="gaugeOption" autoresize class="gauge-chart" />
        </div>
        <div class="gauge-rows">
          <span class="gauge-kv">
            <ThunderboltOutlined class="gauge-ico cyan" />
            <span class="gauge-k">总行数</span>
            <b>{{ rowStats.totalRows.toLocaleString() }}</b>
          </span>
          <span class="gauge-kv">
            <CheckCircleOutlined class="gauge-ico green" />
            <span class="gauge-k">已迁移</span>
            <b>{{ rowStats.migratedRows.toLocaleString() }} 行</b>
          </span>
          <span class="gauge-kv">
            <ThunderboltOutlined class="gauge-ico amber" />
            <span class="gauge-k">速率</span>
            <b>{{ totalQps.toLocaleString() }} 行/s</b>
          </span>
          <span class="gauge-kv">
            <DashboardOutlined class="gauge-ico cyan" />
            <span class="gauge-k">预计剩余</span>
            <b>{{ etaFormat(totalEtaSeconds) }}</b>
          </span>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">运行任务进度</span>
        </div>
        <VChart v-if="runningTasks.length" :option="barOption" autoresize class="bar-chart" />
        <div v-else class="screen-empty">
          <div class="screen-empty-ring" />
          <p>暂无运行中的任务</p>
        </div>
      </div>
    </div>

    <!-- 运行任务 + 实时日志 -->
    <div class="grid bottom-grid">
      <div class="panel">
        <div class="panel-head">
          <span class="panel-title">运行中的迁移任务</span>
        </div>
        <div v-if="runningTasks.length" class="table-wrap">
          <a-table :data-source="runningTasks" row-key="id" size="small" :pagination="false" :scroll="{ y: 300 }">
            <a-table-column title="任务" data-index="name" :ellipsis="true">
              <template #default="{ record }">
                <a class="task-link"
                  @click="router.push({ path: '/dataops/migration/detail', query: { id: record.id } })">{{ record.name
                  }}</a>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="90">
              <template #default="{ record }">
                <a-tag :color="TASK_STATUS_COLORS[liveStatus(record)]">
                  {{ TASK_STATUS_LABELS[liveStatus(record)] }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="表" key="tables" :width="110">
              <template #default="{ record }">
                <span class="mono">
                  {{ monitor.progressMap[record.id]?.completedTables ?? '-' }} /
                  {{ monitor.progressMap[record.id]?.totalTables ?? record.includeTables?.length ?? 0 }}
                </span>
              </template>
            </a-table-column>
            <a-table-column title="进度" key="progress" :width="160">
              <template #default="{ record }">
                <a-progress :percent="percentOf(record)" size="small"
                  :status="liveStatus(record) === 'PAUSED' ? 'normal' : undefined" />
              </template>
            </a-table-column>
            <a-table-column title="速率(行/s)" key="qps" :width="100">
              <template #default="{ record }">
                <span class="mono">{{ (monitor.progressMap[record.id]?.qps ?? 0).toLocaleString() }}</span>
              </template>
            </a-table-column>
            <a-table-column title="预计剩余" key="eta" :width="100">
              <template #default="{ record }">
                {{ etaFormat(monitor.progressMap[record.id]?.etaSeconds) }}
              </template>
            </a-table-column>
          </a-table>
        </div>
        <div v-else class="screen-empty">
          <div class="screen-empty-ring" />
          <p>空闲中(无运行/暂停任务)</p>
        </div>
      </div>

      <div class="panel log-panel">
        <div class="panel-head">
          <span class="panel-title">实时日志流</span>
          <span class="log-status" :class="{ online: monitor.wsOnline }">
            <i class="ws-dot" />{{ monitor.wsOnline ? '已连接' : '未连接' }}
          </span>
        </div>
        <div v-if="logs.length" class="log-stream">
          <div v-for="(l, i) in logs" :key="i" class="log-line">
            <span class="log-time">{{ formatDateTime(l.loggedAt, 'HH:mm:ss') }}</span>
            <span class="log-level" :class="String(l.level).toLowerCase()">{{ l.level }}</span>
            <span class="log-table">{{ l.table || '-' }}</span>
            <span class="log-msg">{{ l.message }}</span>
          </div>
        </div>
        <div v-else class="screen-empty">
          <div class="screen-empty-ring" />
          <p>暂无实时日志</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   监控大屏 · 暗色主题
   深蓝渐变底 + 玻璃拟态面板 + 霓虹点缀;数据密集区全部
   纯 CSS Grid 布局(无 gutter 负边距),不产生横向滚动。
   ============================================================ */
.monitor-page {
  /* 让 PageHeader 的文字/图标在暗色底上正确显示 */
  --brand: #38bdf8;
  --radius: 16px;
  --border: rgba(148, 163, 184, 0.16);
  --text-1: #f1f5f9;
  --text-2: #cbd5e1;
  --text-3: #7c8aa0;
  --bg-subtle: rgba(148, 163, 184, 0.08);

  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px 24px;
  min-width: 0;
  min-height: 100%;
  overflow-x: hidden;
  /* border-radius: 14px; */
  background:
    radial-gradient(1100px 420px at 12% -8%, rgba(56, 189, 248, 0.16), transparent 60%),
    radial-gradient(900px 380px at 88% -4%, rgba(99, 102, 241, 0.14), transparent 55%),
    radial-gradient(700px 500px at 50% 118%, rgba(99, 102, 241, 0.1), transparent 60%),
    linear-gradient(180deg, #0b1220 0%, #0d1526 55%, #0b1220 100%);
  color: var(--text-2);
}

/* ---------- 玻璃面板 ---------- */
.panel {
  position: relative;
  min-width: 0;
  background: rgba(148, 163, 184, 0.055);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  backdrop-filter: blur(6px);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.panel:hover {
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.08), 0 8px 28px rgba(2, 6, 23, 0.5);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.panel-title {
  position: relative;
  padding-left: 13px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text-1);
}

.panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 15px;
  border-radius: 2px;
  background: linear-gradient(180deg, #38bdf8, #6366f1);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.7);
}

/* ---------- 连接徽标 ---------- */
.ws-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 13px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--text-3);
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border);
}

.ws-badge.online {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.09);
  border-color: rgba(74, 222, 128, 0.35);
}

.ws-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #64748b;
  flex-shrink: 0;
}

.ws-badge.online .ws-dot,
.log-status.online .ws-dot {
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.16), 0 0 8px rgba(74, 222, 128, 0.8);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.16), 0 0 6px rgba(74, 222, 128, 0.7);
  }

  50% {
    box-shadow: 0 0 0 5px rgba(74, 222, 128, 0.08), 0 0 12px rgba(74, 222, 128, 1);
  }
}

/* ---------- 统计卡片 ---------- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: rgba(148, 163, 184, 0.055);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(148, 163, 184, 0.32);
}

/* 右上角柔光 */
.stat-glow {
  position: absolute;
  top: -34px;
  right: -30px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  pointer-events: none;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-meta {
  min-width: 0;
}

.stat-value {
  font-size: 27px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 12.5px;
  color: var(--text-3);
  margin-top: 3px;
  letter-spacing: 0.5px;
}

/* ---------- 引擎指标 ---------- */
.metrics-endpoint {
  font-size: 12px;
  color: var(--text-3);
}

.metrics-endpoint code {
  padding: 1px 7px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.09);
  border: 1px solid rgba(56, 189, 248, 0.22);
  font-size: 11.5px;
  color: #7dd3fc;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.metric-item {
  min-width: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.metric-item.is-alert {
  background: rgba(248, 113, 113, 0.09);
  border-color: rgba(248, 113, 113, 0.35);
  box-shadow: inset 0 0 24px rgba(248, 113, 113, 0.07);
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
}

.metric-value.is-alert {
  color: #f87171;
  text-shadow: 0 0 18px rgba(248, 113, 113, 0.45);
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  font-size: 12px;
  color: var(--text-3);
}

.alert-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f87171;
  box-shadow: 0 0 8px rgba(248, 113, 113, 0.9);
  flex-shrink: 0;
}

.metrics-unavailable {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-3);
}

/* ---------- 栅格区 ---------- */
.grid {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.grid>* {
  min-width: 0;
}

.progress-grid {
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
}

.bottom-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* ---------- 仪表盘 ---------- */
.gauge-panel {
  overflow: hidden;
}

.gauge-wrap {
  position: relative;
  display: flex;
  justify-content: center;
}

/* 仪表盘底部的柔和光晕 */
.gauge-halo {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 240px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.16), transparent 70%);
  pointer-events: none;
}

.gauge-chart {
  width: 100%;
  height: 210px;
}

.gauge-rows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px 16px;
  padding: 6px 6px 0;
}

.gauge-kv {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--text-2);
  min-width: 0;
}

.gauge-kv b {
  color: var(--text-1);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.gauge-k {
  color: var(--text-3);
}

.gauge-ico {
  font-size: 13px;
  flex-shrink: 0;
}

.gauge-ico.cyan {
  color: #38bdf8;
}

.gauge-ico.green {
  color: #34d399;
}

.gauge-ico.amber {
  color: #fbbf24;
}

.bar-chart {
  width: 100%;
  height: 258px;
}

/* ---------- 大屏空状态(替代 a-empty, 暗色下更协调) ---------- */
.screen-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 52px 0;
}

.screen-empty-ring {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2px dashed rgba(148, 163, 184, 0.35);
  animation: spin 9s linear infinite;
}

.screen-empty p {
  margin: 0;
  font-size: 13px;
  color: var(--text-3);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- 任务表(暗色适配) ---------- */
.table-wrap {
  min-width: 0;
  overflow: hidden;
  margin: -8px;
}

.table-wrap :deep(.ant-table) {
  background: transparent;
  color: var(--text-2);
}

.table-wrap :deep(.ant-table-thead>tr>th) {
  background: rgba(148, 163, 184, 0.08);
  color: var(--text-3);
  font-weight: 500;
  border-bottom: 1px solid var(--border);
}

.table-wrap :deep(.ant-table-tbody>tr>td) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.09);
  color: var(--text-2);
}

.table-wrap :deep(.ant-table-tbody>tr:hover>td) {
  background: rgba(56, 189, 248, 0.06);
}

.table-wrap :deep(.ant-progress-text) {
  color: var(--text-3);
}

.task-link {
  color: #7dd3fc;
  font-weight: 500;
}

.task-link:hover {
  color: #bae6fd;
}

.mono {
  font-variant-numeric: tabular-nums;
}

/* ---------- 实时日志 ---------- */
.log-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-3);
}

.log-status.online {
  color: #4ade80;
}

.log-stream {
  height: 300px;
  overflow: auto;
  font-size: 12px;
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: rgba(2, 6, 23, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
}

.log-stream::-webkit-scrollbar {
  width: 6px;
}

.log-stream::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 3px;
}

.log-line {
  display: flex;
  gap: 8px;
  padding: 3px 0;
  align-items: baseline;
}

.log-line:hover {
  background: rgba(148, 163, 184, 0.06);
}

.log-time {
  color: #52607a;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  width: 46px;
  text-align: center;
  border-radius: 4px;
  font-size: 11px;
  line-height: 17px;
  background: rgba(148, 163, 184, 0.12);
  color: #94a3b8;
}

.log-level.error,
.log-level.fail {
  background: rgba(248, 113, 113, 0.15);
  color: #fca5a5;
}

.log-level.warn {
  background: rgba(251, 191, 36, 0.14);
  color: #fcd34d;
}

.log-level.info {
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
}

.log-table {
  color: #67e8f9;
  flex-shrink: 0;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-msg {
  color: #cbd5e1;
  word-break: break-all;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {

  .stat-grid,
  .progress-grid,
  .bottom-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 576px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gauge-rows {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>