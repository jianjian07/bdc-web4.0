<template>
  <a-drawer
      :title="`${table.tblText || table.tblName || ''} - 字段管理`"
      :width="1500"
      v-model:open="drawerOpen"
      :body-style="{ paddingBottom: '80px' }"
      @close="requestClose"
      @after-open-change="afterOpenChange"
  >
    <div class="drawer-toolbar">
      <a-space>
        <a-button type="primary" @click="addColumn">
          <template #icon>
            <PlusOutlined/>
          </template>
          新增字段
        </a-button>
        <a-popconfirm v-if="selectedRowKeys.length" title="确定删除已选字段吗？" ok-text="确定" cancel-text="取消"
                      @confirm="deleteSelected">
          <a-button danger :disabled="!selectedRowKeys.length">
            <template #icon>
              <DeleteOutlined/>
            </template>
            批量删除
          </a-button>
        </a-popconfirm>
      </a-space>
    </div>

    <a-table
        row-key="_rowKey"
        size="small"
        :columns="columns"
        :data-source="columnList"
        :pagination="false"
        :row-selection="rowSelection"
        :scroll="{ x: 1450 }"
        :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'colName'">
          <a-input v-model:value="record.colName" :maxlength="255" placeholder="字段名"/>
        </template>
        <template v-else-if="column.dataIndex === 'colComment'">
          <a-input v-model:value="record.colComment" :maxlength="1000" placeholder="字段描述"/>
        </template>
        <template v-else-if="column.dataIndex === 'colType'">
          <a-select v-model:value="record.colType" :options="fieldTypeOptions" allow-clear show-search
                    option-filter-prop="label" placeholder="字段类型" style="width: 100%"/>
        </template>
        <template v-else-if="column.dataIndex === 'colLength'">
          <a-input-number v-model:value="record.colLength" :min="0" :precision="0" style="width: 100%"/>
        </template>
        <template v-else-if="column.dataIndex === 'widgetType'">
          <a-select v-model:value="record.widgetType" :options="getDictItemsByCode('kjlx')" allow-clear show-search
                    option-filter-prop="label" placeholder="控件类型" style="width: 100%"/>
        </template>
        <template v-else-if="column.dataIndex === 'isEncode'">
          <a-select v-model:value="record.isEncode" :options="booleanOptions" style="width: 100%"/>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <a-select v-model:value="record.status" :options="statusOptions" style="width: 100%"/>
        </template>
        <template v-else-if="column.dataIndex === 'orderNum'">
          <a-input-number v-model:value="record.orderNum" :min="0" :precision="0" style="width: 100%"/>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-popconfirm title="确定删除该字段吗？" ok-text="确定" cancel-text="取消" @confirm="deleteRows([record])">
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <template #extra>
      <a-space>
        <a-button type="primary" :loading="saving" @click="saveAll">保存</a-button>
        <a-button @click="requestClose">关闭</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  table: { type: Object, required: true },
})
const emit = defineEmits(['close'])
const api = {
  list: '/api/zrzy-form/metadata/col/list',
  saveOrUpdate: '/api/zrzy-form/metadata/col/saveOrUpdate',
  batchDelCol: '/api/zrzy-form/metadata/col/batchDelCol',
}
const columns = [
  { title: '字段名', dataIndex: 'colName', width: 170 },
  { title: '字段描述', dataIndex: 'colComment', width: 200 },
  { title: '字段类型', dataIndex: 'colType', width: 155 },
  { title: '字段长度', dataIndex: 'colLength', width: 115 },
  { title: '控件类型', dataIndex: 'widgetType', width: 155 },
  { title: '是否加密', dataIndex: 'isEncode', width: 105 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '排序', dataIndex: 'orderNum', width: 100 },
  { title: '操作', key: 'action', fixed: 'right', width: 75 },
]
const booleanOptions = [{ label: '是', value: 1 }, { label: '否', value: 0 }]
const statusOptions = [{ label: '启用', value: 1 }, { label: '停用', value: 0 }]
const fieldTypeOptions = [
  { value: 'Array', label: 'Array' },
  { value: 'Object', label: 'Object' },
  { value: 'String', label: 'String' },
  { value: 'Boolean', label: 'Boolean' },
  { value: 'Integer', label: 'Integer' },
  { value: 'Long', label: 'Long' },
  { value: 'Short', label: 'Short' },
  { value: 'Date', label: 'Date' },
  { value: 'Double', label: 'Double' },
  { value: 'Float', label: 'Float' },
  { value: 'Byte', label: 'Byte' },
]
const columnList = ref<any[]>([])
const selectedRowKeys = ref<string[]>([])
const drawerOpen = ref(props.open)
const loading = ref(false)
const saving = ref(false)
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  },
}))

onMounted(() => {
  loadColumns()
})

/**
 * 查询
 */
function loadColumns() {
  loading.value = true
  defHttp.post({
      url: api.list,
      data: { tblId: (props.table as any).id },
      params: { pageNo: 1, pageSize: 1000 },
    }, { withToken: true })
    .then((res: any) => {
    if (res.success) {
      columnList.value = (res.result?.records || []).map((item: any) => normaliseColumn(item))
      selectedRowKeys.value = []
    } else {
      message.error(res.message || '获取字段列表失败')
    }
    })
    .catch(() => {
      message.error('获取字段列表失败')
    })
    .finally(() => {
      loading.value = false
    })
}

/**
 * 格式化字段
 */
function normaliseColumn(item: any) {
  return {
    ...item,
    tblId: item.tblId ?? (props.table as any).id,
    tblName: item.tblName || (props.table as any).tblName,
    isEncode: Number(item.isEncode) === 1 ? 1 : 0,
    status: item.status === 0 || item.status === '0' ? 0 : 1,
    orderNum: item.orderNum ?? 0,
    dictCode: item.dictCode || '',
    dictType: item.dictType || '',
    colType: item.colType || undefined,
    colLength: item.colLength ?? undefined,
    widgetType: item.widgetType || undefined,
    _isNew: false,
    _rowKey: item.id ? `saved-${item.id}` : createRowKey(),
  }
}

function createRowKey() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * 新增
 */
function addColumn() {
  columnList.value.push({
    tblId: (props.table as any).id,
    tblName: (props.table as any).tblName,
    colName: '',
    colComment: '',
    isEncode: 0,
    orderNum: columnList.value.length + 1,
    status: 1,
    dictCode: '',
    dictType: '',
    colType: undefined,
    colLength: undefined,
    widgetType: undefined,
    _isNew: true,
    _rowKey: createRowKey(),
  })
}

/**
 * 保存
 */
function saveAll() {
  const invalidRow = columnList.value.find(item => !String(item.colName || '').trim())
  if (invalidRow) {
    message.warning('请填写字段名后再保存')
    return
  }
  const names = columnList.value.map(item => String(item.colName || '').trim())
  if (new Set(names).size !== names.length) {
    message.warning('字段名不能重复')
    return
  }

  saving.value = true
  defHttp.post({
      url: api.saveOrUpdate,
      data: columnList.value.map(toPayload),
    }, { withToken: true })
    .then((res: any) => {
    if (res.success) {
      message.success('保存成功')
      loadColumns()
    } else {
      message.error(res.message || '保存失败')
    }
    })
    .catch(() => {
      message.error('保存失败')
    })
    .finally(() => {
      saving.value = false
    })
}

function toPayload(row: any) {
  const { _rowKey, _isNew, ...data } = row
  return {
    ...data,
    tblId: (props.table as any).id,
    tblName: (props.table as any).tblName,
  }
}

function deleteSelected() {
  deleteRows(columnList.value.filter(item => selectedRowKeys.value.includes(item._rowKey)))
}

/**
 * 删除
 */
function deleteRows(rows: any[]) {
  const ids = rows.filter(item => item.id).map(item => item.id)
  if (!ids.length) {
    removeRows(rows)
    return
  }
  defHttp.post({ url: api.batchDelCol, data: ids }, { withToken: true })
    .then((res: any) => {
      if (!res.success) {
        message.error(res.message || '删除失败')
        return
      }
      removeRows(rows)
    })
    .catch(() => {
      message.error('删除失败')
    })
}

function removeRows(rows: any[]) {
  const keys = new Set(rows.map(item => item._rowKey))
  columnList.value = columnList.value.filter(item => !keys.has(item._rowKey))
  selectedRowKeys.value = selectedRowKeys.value.filter(key => !keys.has(key))
  message.success('删除成功')
}

function requestClose() {
  drawerOpen.value = false
}

function afterOpenChange(isOpen: boolean) {
  if (!isOpen) emit('close')
}
</script>

<style scoped lang="less">
.drawer-toolbar {
  margin-bottom: 16px;
}

.danger-link {
  color: #ff4d4f;
}
</style>
