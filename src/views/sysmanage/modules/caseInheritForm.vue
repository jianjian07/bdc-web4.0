<template>
  <div class="case-inherit-form">
    <a-button style="margin-bottom: 10px" type="primary" @click="addInherit">添加</a-button>
    <a-table :columns="columns" :data-source="tableData" :pagination="false" rowKey="id">
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex == 'index'">
          {{ index + 1 }}
        </template>
        <template v-else-if="column.dataIndex == 'operate'">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical"/>
          <a @click="handleDel(record)">删除</a>
        </template>
      </template>
    </a-table>
    <case-inherit-modal ref="refModal" :record="record" @ok="handleModalOk"></case-inherit-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import CaseInheritModal from "/@/views/sysmanage/modules/caseInheritModal.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const props = defineProps({
  record: {
    type: Object,
    default: {}
  }
})
// 弹窗实例
let refModal = ref()

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60
  },
  {
    title: '情形名称',
    dataIndex: 'caseName',
    key: 'caseName',
    ellipsis: true
  },
  {
    title: '情形编码',
    dataIndex: 'caseCode',
    key: 'caseCode'
  },
  {
    title: '源表',
    dataIndex: 'sourceTable',
    key: 'sourceTable'
  },
  {
    title: '目标表',
    dataIndex: 'targetTable',
    key: 'targetTable'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    width: 110
  },
]

let tableData = ref<any[]>([])

enum api {
  list = '/api/zrzy-system/inheritData/getList',
  del = '/api/zrzy-system/inheritData/deleteData'
}

onMounted(() => {
  initTableData()
})

/**
 * 初始化表格数据
 */
function initTableData() {
  defHttp.get({ url: api.list, params: { caseCode: props.record.caseCode } }, { withToken: true }).then((res) => {
    tableData.value = res && res.code == 200 ? res.result : []
  }).catch(err => {
    tableData.value = []
  })
}
/**
 * 添加
 */
function addInherit() {
  refModal.value.add()
}

/**
 * 编辑
 * @param record
 */
function handleEdit(record) {
  refModal.value.edit(record)
}

/**
 * 删除
 * @param record
 */
function handleDel(record) {
  defHttp.delete({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      message.success('删除成功')
      initTableData()
    } else {
      message.warning('删除失败')
    }
  })
}

/**
 * 弹窗确定
 */
function handleModalOk() {
  initTableData()
}
</script>

<style lang="less" scoped>

</style>
