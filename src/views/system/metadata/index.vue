<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :label-wrap="true">
      <a-row :gutter="[0, 8]">
        <a-col :span="8">
          <a-form-item label="表名">
            <a-input v-model:value="formData.tblName" allow-clear @press-enter="loadData('query')" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item style="text-align: center">
            <a-space>
              <a-button type="primary" @click="loadData('query')">
                <template #icon>
                  <SearchOutlined />
                </template>
                查询
              </a-button>
              <a-button @click="resetSearch">
                <template #icon>
                  <RedoOutlined />
                </template>
                重置
              </a-button>
              <a-button type="primary" @click="initData()">
                <template #icon>
                  <SearchOutlined />
                </template>
                初始化
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="wonder-table-css">
    <div class="wonder-table-toolbar">
      <a-button type="primary" @click="addTable">
        <template #icon>
          <PlusOutlined />
        </template>
        新增表
      </a-button>
    </div>
    <a-table row-key="id" :columns="columns" :data-source="tableList" :pagination="pagination" :loading="loading"
      @change="onPageChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">{{ record.status === 1 ? '启用' : '停用' }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <template #split>
              <a-divider type="vertical" />
            </template>
            <a @click="editTable(record)">编辑</a>
            <a @click="manageColumns(record)">字段管理</a>
            <a-popconfirm title="确定删除该元数据表吗？" ok-text="确定" cancel-text="取消" @confirm="deleteTable(record)"><a
                class="danger-link">删除</a></a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
  <TableModal v-if="tableModalOpen" :open="tableModalOpen" :title="tableModalTitle" :data="currentTable"
    @close="closeTableModal" @saved="handleTableSaved" />
  <ColumnDrawer v-if="columnDrawerOpen" :open="columnDrawerOpen" :table="currentTable"
    @close="columnDrawerOpen = false" />
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { PlusOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'

const TableModal = defineAsyncComponent(() => import('./components/TableModal.vue'))
const ColumnDrawer = defineAsyncComponent(() => import('./components/ColumnDrawer.vue'))
const columns = [
  { title: '表名', dataIndex: 'tblName', width: 210 }, { title: '表名简称', dataIndex: 'tblShortName', width: 160 },
  { title: '表说明', dataIndex: 'tblText', minWidth: 180 }, { title: '数据源', dataIndex: 'dbKey', width: 150 },
  { title: '状态', dataIndex: 'status', width: 100 }, { title: '排序', dataIndex: 'orderNum', width: 90 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]
const api = { list: '/api/zrzy-form/metadata/tbl/list', del: '/api/zrzy-form/metadata/tbl/del' }
const tableList = ref<any[]>([])
const formData = reactive({ tblName: '' })
const loading = ref(false)
const pagination = ref({ total: 0, current: 1, pageSize: 10 })
const tableModalOpen = ref(false)
const columnDrawerOpen = ref(false)
const tableModalTitle = ref('')
const currentTable = ref<any>({})

onMounted(() =>
  loadData()
)
function initData() {
  defHttp.post({ url: '/api/zrzy-form/metadata/syncByTableName', params: { tblName: formData.tblName || '' } }, { withToken: true })
    .then((res: any) => {
      if (res.success) {
        message.success('初始化成功')
        loadData()
      } else message.error(res.message || '初始化失败')
    })
    .catch(() => {
      message.error('初始化失败')
    })
}
/**
 * 加载列表
 */
function loadData(type?: 'query') {
  if (type === 'query') pagination.value.current = 1
  loading.value = true
  defHttp.post({
    url: api.list,
    data: { tblName: formData.tblName || '' },
    params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }
  }, { withToken: true })
    .then((res: any) => {
      if (res.success) {
        tableList.value = res.result?.records || []
        pagination.value.total = res.result?.total || 0
      } else message.error(res.message || '查询失败')
    })
    .catch(() => {
      message.error('查询失败')
    })
    .finally(() => {
      loading.value = false
    })
}

function resetSearch() {
  formData.tblName = ''
  loadData('query')
}

function onPageChange(page: any) {
  pagination.value.current = page.current
  pagination.value.pageSize = page.pageSize
  loadData()
}

/**
 * 新增
 */
function addTable() {
  tableModalTitle.value = '新增元数据表'
  currentTable.value = { status: 1, orderNum: 0 }
  tableModalOpen.value = true
}

/**
 * 编辑
 */
function editTable(record: any) {
  tableModalTitle.value = '编辑元数据表'
  currentTable.value = { ...record }
  tableModalOpen.value = true
}

/**
 * 字段管理
 */
function manageColumns(record: any) {
  currentTable.value = { ...record }
  columnDrawerOpen.value = true
}

/**
 * 删除
 */
function deleteTable(record: any) {
  defHttp.post({ url: api.del, data: record }, { withToken: true })
    .then((res: any) => {
      if (res.success) {
        message.success('删除成功')
        if (tableList.value.length === 1 && pagination.value.current > 1) pagination.value.current -= 1
        loadData()
      } else message.error(res.message || '删除失败')
    })
    .catch(() => {
      message.error('删除失败')
    })
}

function closeTableModal() {
  tableModalOpen.value = false
}

function handleTableSaved() {
  tableModalOpen.value = false
  loadData()
}
</script>
<style lang="less" scoped>
@import url('/@/assets/less/table.less');

.danger-link {
  color: #ff4d4f;
}
</style>
