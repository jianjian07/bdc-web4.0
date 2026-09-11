<template>
  <div class="permission-list">
    <div class="wonder-table-form">
      <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
        <a-row :gutter="[0, 8]" tyle="flex">
          <a-col :span="8" :offset="0">
            <a-form-item label="用户">
              <a-input v-model:value="formState.realName" />
            </a-form-item>
          </a-col>
          <a-col :span="4" :offset="0">
            <a-form-item style="text-align: center;">
              <a-space>
                <a-button type="primary" @click="searchData">
                  <template #icon>
                    <component :is="SearchOutlined"></component>
                  </template>
                  查询
                </a-button>
                <a-button @click="clear">
                  <template #icon>
                    <component :is="RedoOutlined"></component>
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
      <a-table :columns="columns" :data-source="datalist" :pagination="pagination" row-key="id"
        @change="onChange($event, initData)" :loading="loading">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex == 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex == 'superviseStatus' || column.dataIndex == 'urgentStatus'">
            <a-tag color="green" v-if="record[column.dataIndex] == '1'">启用</a-tag>
            <a-tag color="red" v-else>禁用</a-tag>
          </template>
          <template v-if="column.dataIndex == 'action'">
            <a-space>
              <a-button type="link" @click="handleSetting(record)">配置</a-button>
            </a-space>
          </template>
          <template v-if="column.dataIndex == 'superviseProcess' || column.dataIndex == 'urgentProcess'">
            {{ getProcessName(record[column.dataIndex]) }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <permission-modal ref="modalRef" :type="type" :treeData="treeData" @ok="onOk"></permission-modal>
</template>

<script setup lang="ts">
import { RedoOutlined, SearchOutlined } from "@ant-design/icons-vue"
import { onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import PermissionModal from "/@/views/system/permission/modules/PermissionModal.vue"
import { message } from "ant-design-vue"
import { findNode } from "/@/views/online/utils/commonUtils.ts"

const props = defineProps({
  type: {
    type: String,
    default: 'db' // db 督办 jj 加急
  }
})

let pagination = ref<any>({
  total: 0,
  current: 1,
  pageSize: 10,
})

let formState = ref<any>({
  realName: '',
})

const columns = [
  { title: '序号', dataIndex: 'index', align: 'center', width: 100 },
  { title: '用户', dataIndex: 'realName', align: 'center', width: 200 },
  { title: props.type == 'db' ? '督办流程' : '加急流程', dataIndex: props.type == 'db' ? 'superviseProcess' : 'urgentProcess', align: 'center', ellipsis: true },
  { title: '状态', dataIndex: props.type == 'db' ? 'superviseStatus' : 'urgentStatus', align: 'center', width: 120 },
  { title: '操作', dataIndex: 'action', align: 'center', width: 120 }
]

let datalist = ref<any[]>([])
let loading = ref<boolean>(false)
let treeData = ref<any>([])
let modalRef = ref()

enum api {
  dbList = '/api/zrzy-bdc/process/extActSuperviseAuthority/list',
  jjList = '/api/zrzy-bdc/process/extActUrgentAuthority/list',
  processlist = '/api/zrzy-bdc/flow/sxml/tenantSxTreeList',
}

onMounted(() => {
  initProcessList()
  initData()
})

/**
 * 初始化数据
 */
function initData() {
  let url = props.type == 'db' ? api.dbList : api.jjList
  loading.value = true
  defHttp.get({ url: url, params: { pageSize: pagination.value.pageSize, pageNo: pagination.value.current, realName: formState.value.realName } }, { withToken: true }).then((res) => {
    loading.value = false
    if (res && res.success) {
      datalist.value = res.result.records
      pagination.value.total = res.result.total
    } else {
      message.error(res?.message)
    }
  })
}

/**
 * 初始化流程节点
 */
function initProcessList() {
  defHttp.get({ url: api.processlist }, { withToken: true }).then((res) => {
    if (res && res.success) {
      treeData.value = setPidList(res.result)
    } else {
      message.warning(res?.message)
    }
  })
}

/**
 * 设置pid
 * @param newArr
 * @param parentId
 */
function setPidList(newArr, parentId?: any) {
  let newData = newArr.map(item => {
    if (parentId) {
      item.pid = parentId
    }
    let pid = item.value
    if (item.children) {
      item.children = setPidList(item.children, pid)
    }
    return item
  })
  return newData
}

/**
 * 查询
 */
function searchData() {
  initData()
}

/**
 * 重置
 */
function clear() {
  formState.value = {}
  initData()
}

/**
 * 分页
 * @param pag
 * @param callback 回调函数
 */
function onChange(pag: any, callback: any) {
  pagination.value.current = pag.current
  callback()
}

/**
 * 配置
 */
function handleSetting(record: any) {
  if (modalRef && modalRef.value) {
    modalRef.value.edit(record)
  }
}

/**
 * 获取流程名
 * @param process
 */
function getProcessName(process: any) {
  if (!process) return ''
  let processArr = process.split(',')
  let processNameArr: any = []
  processArr.forEach((item: any) => {
    let node = findNode(treeData.value, item, 'key')
    if (node) {
      processNameArr.push(node.title)
    }
  })
  return processNameArr.join(',')
}

/**
 * 确定
 */
function onOk() {
  initData()
}
</script>

<style scoped lang="less">
@import url('/@/assets/less/table.less');
</style>