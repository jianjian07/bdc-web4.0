<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { TableColumnsType } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import {
  DownloadOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'
import PageHeader from '/@/views/dataops/migration/components/PageHeader.vue'
import {
  dirtyDataExportUrl,
  getHistoryApi,
  getHistoryDirtyDataApi,
  getHistoryLogsApi,
  getHistoryTablesApi,
  historyReportExcelExportUrl,
  listHistoriesApi
} from '/@/views/dataops/api/history'
import type {
  DirtyDataItem,
  HistoryTable,
  MigrationHistory,
  MigrationLogItem
} from '/@/views/dataops/api/model/history'
import { HISTORY_STATUS_COLORS, HISTORY_STATUS_LABELS, LOG_LEVEL_COLORS } from '/@/views/dataops/utils/history'
import { formatDateTime, formatDuration } from '/@/views/dataops/utils/format'
import { openDownload } from '/@/views/dataops/utils/download'

const router = useRouter()

//region ==================== 列表 ====================

const loading = ref(false)
const datalist = ref<MigrationHistory[]>([])
const total = ref(0)
const query = reactive({
  taskId: undefined as number | undefined,
  status: undefined as string | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
  page: 1,
  size: 10
})

/** 时间范围(a-range-picker, Dayjs 数组) */
const timeRange = ref<[Dayjs, Dayjs] | null>(null)

function onTimeRangeChange() {
  if (timeRange.value && timeRange.value.length === 2) {
    query.startTime = timeRange.value[0].startOf('day').toISOString()
    query.endTime = timeRange.value[1].endOf('day').toISOString()
  } else {
    query.startTime = undefined
    query.endTime = undefined
  }
  handleSearch()
}

const statusOptions = (Object.keys(HISTORY_STATUS_LABELS)).map((s) => ({
  value: s,
  label: HISTORY_STATUS_LABELS[s]
}))

async function loadData() {
  loading.value = true
  try {
    const page = await listHistoriesApi(query)
    datalist.value = page.list ?? []
    total.value = page.total ?? 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  loadData()
}

function handleTableChange(pag: { current?: number; pageSize?: number }) {
  query.page = pag.current ?? 1
  query.size = pag.pageSize ?? 10
  loadData()
}

const columns: TableColumnsType = [
  { title: 'ID', dataIndex: 'id', width: 64 },
  { title: '任务', key: 'task', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '表(完成/失败/总)', key: 'tables', width: 150 },
  { title: '迁移行数', key: 'rows', width: 130 },
  { title: '耗时', dataIndex: 'durationMs', width: 100 },
  { title: '开始时间', dataIndex: 'startedAt', width: 170 },
  { title: '结束时间', dataIndex: 'finishedAt', width: 170 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

//endregion

//region ==================== 详情抽屉 ====================

const detailOpen = ref(false)
const detailLoading = ref(false)
const detail = ref<MigrationHistory | null>(null)
const detailTables = ref<HistoryTable[]>([])
const detailLogs = ref<MigrationLogItem[]>([])
const dirtyData = ref<DirtyDataItem[]>([])
const dirtyTotal = ref(0)
const logLevelFilter = ref<string | undefined>(undefined)
const logKeyword = ref('')
const activeTab = ref('tables')

async function openDetail(id: number) {
  detailOpen.value = true
  detailLoading.value = true
  activeTab.value = 'tables'
  logKeyword.value = ''
  try {
    detail.value = await getHistoryApi(id)
    const [tables, logs, dirty] = await Promise.all([
      getHistoryTablesApi(id),
      getHistoryLogsApi(id, { size: 200 }),
      getHistoryDirtyDataApi(id, { size: 50 })
    ])
    detailTables.value = tables ?? []
    detailLogs.value = (logs.list ?? []).slice().reverse()
    dirtyData.value = dirty.list ?? []
    dirtyTotal.value = dirty.total ?? 0
  } finally {
    detailLoading.value = false
  }
}

async function filterLogs() {
  if (!detail.value) return
  const page = await getHistoryLogsApi(detail.value.id, {
    level: logLevelFilter.value,
    keyword: logKeyword.value.trim() || undefined,
    size: 200
  })
  detailLogs.value = (page.list ?? []).slice().reverse()
}

async function loadDirty() {
  if (!detail.value) return
  const page = await getHistoryDirtyDataApi(detail.value.id, { size: 50 })
  dirtyData.value = page.list ?? []
  dirtyTotal.value = page.total ?? 0
}

const download = openDownload

const tableColumns: TableColumnsType = [
  { title: '源表', dataIndex: 'sourceTable', ellipsis: true },
  { title: '目标表', dataIndex: 'targetTable', ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '已迁/总行数', key: 'rows', width: 160 },
  { title: '错误', dataIndex: 'errorMessage', ellipsis: true }
]

const logColumns: TableColumnsType = [
  { title: '时间', dataIndex: 'loggedAt', width: 170 },
  { title: '级别', dataIndex: 'level', width: 80 },
  { title: '表', dataIndex: 'tableName', width: 180, ellipsis: true },
  { title: '内容', dataIndex: 'message', ellipsis: true }
]

const dirtyColumns: TableColumnsType = [
  { title: '表', dataIndex: 'tableName', width: 180, ellipsis: true },
  { title: '主键', key: 'sourcePk', width: 140, ellipsis: true },
  { title: '错误', dataIndex: 'errorMessage', ellipsis: true },
  { title: '记录时间', dataIndex: 'createdAt', width: 170 }
]

//endregion

onMounted(loadData)
</script>

<template>
  <div class="page">
    <PageHeader title="历史记录" description="查看每次迁移的耗时、行数、失败摘要、运行日志与脏数据明细" :icon="HistoryOutlined">
    </PageHeader>

    <a-card :bordered="false">
      <div class="table-toolbar">
        <a-form layout="inline" @submit.prevent>
          <a-form-item label="任务 ID">
            <a-input-number v-model:value="query.taskId" :min="1" placeholder="如 100" style="width: 140px"
              @press-enter="handleSearch" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="query.status" :options="statusOptions" allow-clear placeholder="全部"
              style="width: 120px" @change="handleSearch" />
          </a-form-item>
          <a-form-item label="开始时间">
            <a-range-picker v-model:value="timeRange" :placeholder="['开始日期', '结束日期']" style="width: 240px"
              @change="onTimeRangeChange" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <SearchOutlined />
              </template>
              查询
            </a-button>
            &nbsp;
            <a-button @click="loadData">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <a-table :columns="columns" :data-source="datalist" :loading="loading" row-key="id" :pagination="{
      current: query.page,
      pageSize: query.size,
      total: total,
      showSizeChanger: true,
      showTotal: (t: number) => `共 ${t} 条`
    }" :scroll="{ x: 1250 }" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'task'">
            <a @click="router.push({ path: '/dataops/migration/detail', query: { id: record.taskId } })">
              #{{ record.taskId }} {{ record.taskName }}
            </a>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <a-tag :color="HISTORY_STATUS_COLORS[record.status]">
              {{ HISTORY_STATUS_LABELS[record.status] ?? record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'tables'">
            {{ record.completedTables }} / <span style="color: #ff4d4f">{{ record.failedTables }}</span> / {{
      record.totalTables }}
          </template>
          <template v-else-if="column.key === 'rows'">
            {{ Number(record.migratedRows ?? 0).toLocaleString() }}
          </template>
          <template v-else-if="column.dataIndex === 'durationMs'">
            {{ formatDuration(record.durationMs) }}
          </template>
          <template v-else-if="column.dataIndex === 'startedAt' || column.dataIndex === 'finishedAt'">
            {{ record[column.dataIndex] ? formatDateTime(record[column.dataIndex]) : '-' }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space :size="4">
              <a-button size="small" @click="openDetail(record.id)">
                <template #icon>
                  <FileTextOutlined />
                </template>
                详情
              </a-button>
              <!-- <a-button size="small" @click="download(historyReportExportUrl(record.id))">
                <template #icon>
                  <DownloadOutlined />
                </template>
                报告 CSV
              </a-button> -->
              <a-button size="small" @click="download(historyReportExcelExportUrl(record.id))">
                <template #icon>
                  <DownloadOutlined />
                </template>
                报告 Excel
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情抽屉 -->
    <a-drawer v-model:open="detailOpen" :title="detail ? `历史 #${detail.id} - ${detail.taskName}` : '历史详情'" :width="860">
      <a-spin :spinning="detailLoading">
        <template v-if="detail">
          <a-alert v-if="detail.errorSummary" type="error" show-icon style="margin-bottom: 12px"
            :message="`失败摘要: ${detail.errorSummary}`" />
          <a-descriptions :column="3" bordered size="small" style="margin-bottom: 16px">
            <a-descriptions-item label="状态">
              <a-tag :color="HISTORY_STATUS_COLORS[detail.status]">
                {{ HISTORY_STATUS_LABELS[detail.status] }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="任务">
              <a @click="router.push({ path: '/dataops/migration/detail', query: { id: detail.taskId } })">#{{
      detail.taskId }}</a>
            </a-descriptions-item>
            <a-descriptions-item label="耗时">{{ formatDuration(detail.durationMs) }}</a-descriptions-item>
            <a-descriptions-item label="表(完成/失败/总)">
              {{ detail.completedTables }} / {{ detail.failedTables }} / {{ detail.totalTables }}
            </a-descriptions-item>
            <a-descriptions-item label="迁移行数">
              {{ Number(detail.migratedRows ?? 0).toLocaleString() }}
            </a-descriptions-item>
            <a-descriptions-item label="开始">
              {{ formatDateTime(detail.startedAt) }}
            </a-descriptions-item>
          </a-descriptions>

          <a-tabs v-model:active-key="activeTab">
            <a-tab-pane key="tables" tab="表级明细">
              <a-table :columns="tableColumns" :data-source="detailTables" row-key="id" size="small" :pagination="false"
                :scroll="{ y: 400 }">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'status'">
                    <a-tag
                      :color="record.status === 'COMPLETED' ? 'green' : record.status === 'FAILED' ? 'red' : record.status === 'RUNNING' ? 'processing' : 'default'">
                      {{ record.status }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'rows'">
                    {{ Number(record.migratedRows ?? 0).toLocaleString() }} / {{ Number(record.totalRows ??
      0).toLocaleString() }}
                  </template>
                </template>
              </a-table>
            </a-tab-pane>

            <a-tab-pane key="logs" tab="运行日志">
              <div class="log-toolbar">
                <a-select v-model:value="logLevelFilter" allow-clear placeholder="级别" style="width: 120px"
                  :options="['INFO', 'WARN', 'ERROR'].map((l) => ({ value: l, label: l }))" @change="filterLogs" />
                <a-input-search v-model:value="logKeyword" placeholder="日志内容关键字" allow-clear style="width: 240px"
                  @search="filterLogs" />
              </div>
              <a-table :columns="logColumns" :data-source="detailLogs" row-key="id" size="small" :pagination="false"
                :scroll="{ y: 380 }">
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

            <a-tab-pane :key="`dirty`" :tab="`脏数据 (${dirtyTotal})`">
              <div class="log-toolbar">
                <a-button size="small" type="primary" @click="loadDirty">刷新</a-button>
                <a-button v-if="dirtyTotal" size="small" @click="detail && download(dirtyDataExportUrl(detail.id))">
                  <template #icon>
                    <DownloadOutlined />
                  </template>
                  导出 CSV
                </a-button>
              </div>
              <a-empty v-if="!dirtyData.length" description="本次迁移无脏数据(或未启用脏数据捕获)" :image-style="{ height: '48px' }"
                style="padding: 40px 0" />
              <a-table v-else :columns="dirtyColumns" :data-source="dirtyData" row-key="id" size="small"
                :pagination="{ pageSize: 10 }">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'sourcePk'">
                    <code>{{ JSON.stringify(record.sourcePk) }}</code>
                  </template>
                  <template v-else-if="column.dataIndex === 'createdAt'">
                    {{ formatDateTime(record.createdAt) }}
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </template>
      </a-spin>
    </a-drawer>
  </div>
</template>

<style scoped>
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.log-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style>../utils/download../utils/format../utils/history
