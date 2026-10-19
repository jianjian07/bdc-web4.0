<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :label-wrap="true">
      <a-row :gutter="[0, 8]" type="flex">
        <a-col :span="6">
          <a-form-item label="名称">
            <a-input v-model:value="queryForm.name" placeholder="名称/编码" allow-clear @press-enter="searchData" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="数据库类型">
            <a-select v-model:value="queryForm.dbType" :options="getDictItemsByCode('database')" placeholder="全部"
              allow-clear style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="状态">
            <a-select v-model:value="queryForm.status" :options="STATUS_OPTIONS" placeholder="全部" allow-clear
              style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item style="text-align: center">
            <a-space>
              <a-button type="primary" @click="searchData">
                <template #icon>
                  <search-outlined />
                </template>
                查询
              </a-button>
              <a-button @click="resetData">
                <template #icon>
                  <redo-outlined />
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="wonder-table-css">
    <div class="wonder-table-toolbar">
      <a-space>
        <a-button type="primary" @click="openAdd">
          <template #icon>
            <plus-outlined />
          </template>
          新增
        </a-button>
      </a-space>
    </div>
    <a-table bordered :columns="columns" :data-source="dataList" :loading="loading" :pagination="pagination"
      :scroll="{ x: 1300 }" @change="onTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'dbType'">
          <a-tag :color="typeColor(record.dbTypeText)">
            {{ record.dbTypeText || '-' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'connect'">
          <span :title="record.dbUrl">
            {{ record.hostName ? `${record.hostName}:${record.port}/${record.dbName}` : record.dbUrl }}
          </span>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === '0' ? 'red' : 'green'">
            {{ record.status === '0' ? '无效' : '有效' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'createTime'">
          {{ formatDateTime(record.createTime) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <template #split>
              <a-divider type="vertical" />
            </template>
            <a-button type="link" size="small" :loading="testingId === record.id" @click="testRecord(record)">
              测试
            </a-button>
            <a @click="openEdit(record)">编辑</a>
            <a-popconfirm title="是否确定删除该数据源？" ok-text="确定" cancel-text="取消" @confirm="deleteRecord(record)">
              <a>删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
  <DataSourceModal v-if="modalOpen" :open="modalOpen" :id="editId" :title="modalTitle" @ok="handleModalOk" />
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { PlusOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { defHttp } from '/@/utils/http/axios'
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'

enum api {
  list = '/api/zrzy-system/sys/datasource/list',
  del = '/api/zrzy-system/sys/datasource/delete',
  testConnection = '/api/zrzy-system/sys/datasource/testConnection'
}
const STATUS_OPTIONS = [
  { label: '有效', value: '1' },
  { label: '无效', value: '0' }
]

const DataSourceModal = defineAsyncComponent(() => import('./DataSourceModal.vue'))

const columns = [
  { title: '数据源名称', dataIndex: 'name', width: 180, ellipsis: true },
  { title: '编码', dataIndex: 'code', width: 180, ellipsis: true },
  { title: '类型', key: 'dbType', dataIndex: 'dbTypeText', width: 120 },
  { title: '连接信息', key: 'connect', width: 260, ellipsis: true },
  { title: '用户名', dataIndex: 'dbUsername', width: 120 },
  { title: 'Schema', dataIndex: 'schemaName', width: 110 },
  { title: '状态', key: 'status', dataIndex: 'status', width: 90 },
  { title: '创建时间', key: 'createTime', dataIndex: 'createTime', width: 160 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

const dataList = ref([])
const loading = ref(false)
const testingId = ref('')
const queryForm = ref<{ name?: string; dbType?: string; status?: string }>({})
const pagination = ref({ total: 0, current: 1, pageSize: 10 })
const modalOpen = ref(false)
const modalTitle = ref('')
const editId = ref('')

onMounted(() => {
  loadData()
})

/** 加载列表数据 */
async function loadData() {
  loading.value = true
  try {
    const res = await defHttp.post(
      {
        url: api.list,
        params: {
          pageNo: pagination.value.current,
          pageSize: pagination.value.pageSize,
          name: queryForm.value.name,
          dbType: queryForm.value.dbType,
          status: queryForm.value.status
        }
      },
      { withToken: true }
    )
    if (res.success) {
      dataList.value = res.result?.records ?? []
      pagination.value.total = res.result?.total ?? 0
    } else {
      message.error(res.message || '查询失败')
    }
  } catch (err) {
    console.info(err)
  } finally {
    loading.value = false
  }
}

/** 查询 */
function searchData() {
  pagination.value.current = 1
  loadData()
}

/** 重置 */
function resetData() {
  queryForm.value = {}
  pagination.value.current = 1
  loadData()
}

/** 分页变化 */
function onTableChange(pag: any) {
  pagination.value = pag
  loadData()
}

/** 测试连接（密码留空时后端用已保存密码） */
async function testRecord(record: any) {
  if (!record.id) return
  testingId.value = record.id
  try {
    const res = await defHttp.post(
      { url: api.testConnection, data: { ...record } },
      { withToken: true, withTimeout: false }
    )
    if (res.success) {
      if (res.result?.connected) {
        message.success(`${res.result.message}：${res.result.version}（${res.result.latencyMs}ms）`)
      } else {
        message.error(res.result?.message || '连接失败')
      }
    } else {
      message.error(res.message || '测试失败')
    }
  } catch (err) {
    console.info(err)
  } finally {
    testingId.value = ''
  }
}

/** 删除 */
async function deleteRecord(record: any) {
  if (!record.id) return
  try {
    const res = await defHttp.post(
      { url: api.del, params: { id: record.id } },
      { withToken: true }
    )
    if (res.success) {
      message.success('删除成功')
      if (dataList.value.length === 1 && pagination.value.current > 1) {
        pagination.value.current -= 1
      }
      loadData()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (err) {
    console.info(err)
  }
}

/** 新增 */
function openAdd() {
  editId.value = ''
  modalTitle.value = '新增数据源'
  modalOpen.value = true
}

/** 编辑 */
function openEdit(record: any) {
  editId.value = record.id ?? ''
  modalTitle.value = '编辑数据源'
  modalOpen.value = true
}

/** 弹窗回调 */
function handleModalOk(value: { isAdd: boolean }) {
  modalOpen.value = false
  if (value.isAdd) {
    pagination.value.current = 1
  }
  loadData()
}

/** 类型标签颜色 */
function typeColor(dbTypeText?: string) {
  const text = (dbTypeText || '').toLowerCase()
  if (text.includes('sql server') || text.includes('sqlserver')) return 'default'
  if (text.includes('postgre') || text.includes('highgo')) return 'blue'
  if (text.includes('oracle')) return 'orange'
  if (text.includes('mysql')) return 'cyan'
  return 'purple'
}

/** 格式化时间 */
function formatDateTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'
}
</script>

<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
