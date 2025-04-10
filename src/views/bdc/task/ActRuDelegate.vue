<template>
  <div class="act-ru-delegate">
    <div class="act-ru-delegate-table-header">
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <PlusOutlined/>
          </template>
          新增
        </a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-popconfirm title="确定删除?" @confirm="handleBatchDelete">
                <a-menu-item key="1">
                  <DeleteOutlined/>
                  删除
                </a-menu-item>
              </a-popconfirm>
            </a-menu>
          </template>
          <a-button>
            批量操作
            <DownOutlined/>
          </a-button>
        </a-dropdown>
      </a-space>
    </div>
    <div style="margin-bottom: 10px">
      <a-alert show-icon type="info">
        <template #message>
          已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}&nbsp;</a>项
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
        </template>
      </a-alert>
    </div>
    <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        bordered
        row-key="id"
        @change="onTableChange">
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex == 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.dataIndex == 'estate'">
          {{ getDictItemsByCode(column.dict).find(f => f.value == record[column.key])?.label }}
        </template>
        <template v-if="column.dataIndex == 'action'">
          <a-space :size="2">
            <template #split>
              <a-divider type="vertical"/>
            </template>
            <template v-if="record.estate == '1'">
              <a @click="cancelEntrust(record, 0)">撤销</a>
            </template>
            <template v-else>
              <a @click="cancelEntrust(record, 1)">委托</a>
            </template>
            <a @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确定删除?" @confirm="onDelete(record.id, index)">
              <a>删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    <act-ru-delegate-modal ref="modalForm" @ok="modalFormOk"></act-ru-delegate-modal>
  </div>
</template>

<script lang="ts" setup>
import { PlusOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'
import { computed, onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import ActRuDelegateModal from "/@/views/bdc/task/components/ActRuDelegateModal.vue"
import { message } from "ant-design-vue"

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60
  },
  {
    title: '委托人',
    dataIndex: 'ownername',
    key: 'ownername'
  },
  {
    title: '代理人',
    dataIndex: 'agentname',
    key: 'agentname'
  },
  {
    title: '开始时间',
    dataIndex: 'beginDate',
    key: 'beginDate'
  },
  {
    title: '结束时间',
    dataIndex: 'endDate',
    key: 'endDate'
  },
  {
    title: '委托状态',
    dataIndex: 'estate',
    key: 'estate',
    dict: 'wtzt'
  },
  {
    title: '委托原因',
    dataIndex: 'ereason',
    key: 'ereason',
    ellipsis: true
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 180
  },
]
// 表格数据
let dataSource = ref<any>([])
// 分页
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})
// loading
let loading = ref<any>(false)
// 选中的值
let selectedRowKeys = ref<any>([])
// 弹窗
let modalForm = ref<any>()

// 行选择
const rowSelection = computed(() => {
  return {
    type: 'checkbox',
    selectedRowKeys: selectedRowKeys.value,
    onChange: (rowKeys, rows) => {
      selectedRowKeys.value = rowKeys
    },
  }
})

enum api {
  list = '/api/zrzy-bdc/bpm/actRuDelegate/list',
  cancel = '/api/zrzy-bdc/bpm/actRuDelegate/cancel',
  del = '/api/zrzy-bdc/bpm/actRuDelegate/delete',
  batchDel = '/api/zrzy-bdc/bpm/actRuDelegate/deleteBatch'
}

onMounted(() => {
  initData()
})

/**
 * 加载数据
 */
function initData() {
  defHttp.get({
    url: api.list,
    params: { order: 'desc,desc', column: 'createTime,id' }
  }, { withToken: true }).then((res) => {
    if (res && res.success) {
      dataSource.value = res.result.records
      pagination.value.total = res.result.total
      pagination.value.current = res.result.current
    }
  })
}

/**
 * 分页变化
 * @param pag
 */
function onTableChange(pag) {
  pagination.value = pag
  initData()
}

/**
 * 批量删除
 */
function handleBatchDelete() {
  let ids = selectedRowKeys.value.join(',')
  defHttp.delete({ url: api.batchDel, params: { ids: ids } }, { withToken: true }).then((res: any) => {
    if (res && res.success) {
      message.success('删除成功!')
      initData()
    } else {
      message.warning('删除失败!')
    }
  })
}

/**
 * 清空选中
 */
function onClearSelected() {
  selectedRowKeys.value = []
}

/**
 * 取消委托
 * @param record
 * @param state
 */
function cancelEntrust(record, state) {
  defHttp.post({ url: api.cancel, params: { id: record.id, state: state } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      initData()
      message.success(res?.message)
    } else {
      message.warning('发生错误!')
    }
  })
}

/**
 * 新增
 */
function handleAdd() {
  modalForm.value.add()
}

/**
 * 编辑
 * @param record
 */
function handleEdit(record) {
  modalForm.value.edit(record)
}

/**
 * 删除
 * @param record
 * @param index
 */
function onDelete(id, index) {
  defHttp.delete({ url: api.del, params: { id: id } }, { withToken: true }).then((res: any) => {
    if (res && res.success) {
      message.success('删除成功!')
      initData()
    } else {
      message.warning('删除失败!')
    }
  })
}

/**
 * 弹窗确认
 */
function modalFormOk() {
  initData()
}
</script>

<style lang="less" scoped>
.act-ru-delegate {
  padding: 10px;

  .act-ru-delegate-table-header {
    margin-bottom: 10px;
  }
}
</style>