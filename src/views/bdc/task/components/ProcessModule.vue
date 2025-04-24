<template>
  <div class="process-module">
    <div style="margin-bottom: 20px;overflow: auto">
      <img :src="imgPath" alt="流程图" style="border: 2px; cursor: hand" usemap="#planetmap">
      <map v-if="false" name="planetmap">
        <template v-for="(item, key, index) in nodePositionInfo.positionList" :key="index">
          <area
              :coords="item.coords"
              shape="rect"
              title="Venus"
              @mouseover="showNodeInfo(nodePositionInfo.hisTasks,item.id)">
        </template>
      </map>
    </div>
    <a-card v-if="false" title="流程历史跟踪">
      <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :scroll="{ x: 1300 }"
          row-key="taskId"
          size="small"
          bordered>
      </a-table>
    </a-card>
    
    <node-info-modal v-if="false" ref="nodeInfoModal"></node-info-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import NodeInfoModal from "/@/views/bdc/task/components/NodeInfoModal.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const props = defineProps({
  processInstanceId: {
    type: String,
    default: ''
  }
})

// 流程图背景
let imgPath = ref<any>('')
// 流程节点信息
let nodePositionInfo = ref<any>([])
// 表格loading
let loading = ref<boolean>(false)
// 表格数据
let tableData = ref<any>([])
// 表头
const columns = [{
  title: '#',
  dataIndex: 'index',
  key: 'index',
  width: 40,
}, {
  title: '名称',
  dataIndex: 'name',
  key: 'name'
}, {
  title: '流程实例ID',
  dataIndex: 'processInstanceId',
  key: 'processInstanceId'
}, {
  title: '开始时间',
  dataIndex: 'startTime',
  key: 'startTime'
}, {
  title: '结束时间',
  dataIndex: 'endTime',
  key: 'endTime'
}, {
  title: '负责人',
  dataIndex: 'assigneeName',
  key: 'assigneeName'
}, {
  title: '处理结果',
  dataIndex: 'deleteReason',
  key: 'deleteReason'
}, {
  title: '处理意见',
  fixed: 'right',
  width: 250,
  dataIndex: 'remarks',
  key: 'remarks',
  ellipse: true
}
]

let nodeInfoModal = ref()

enum api {
  list = '',
  nodeInfo = '',
  image = '/api/zrzy-bdc/act/task/traceImage'
}

watch(() => props.processInstanceId, (newValue, _oldValue) => {
  if (newValue) {
    getImage(newValue)
  }
}, {
  immediate: true
})

onMounted(() => {
  
})

/**
 * 加载流程图
 * @param id
 */
function getImage(id) {
  defHttp.get({ url: api.image, params: { processInstanceId: id }, responseType: "blob" }, { withToken: true }).then((res) => {
    console.log('getImageres',res)
    if (res.size == 0) {
      message.error('加载流程图出错！')
      return
    }
    //处理二进制数据并创建 Blob 对象
    const blob = new Blob([res])
    imgPath.value = URL.createObjectURL(blob)
  })
}

/**
 * 加载流程图
 */
function initImg() {
  let _t = Date.parse(new Date().toString()) / 1000
  let processInstanceId = ''
  imgPath.value = `${import.meta.env.VITE_GLOB_API_URL}/act/task/traceImage?_t=${_t}&processInstanceId=${processInstanceId}`
}

/**
 * 加载表格数据
 */
function initTableData() {
  loading.value = true
  let params = { processInstanceId: '' }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
    if (res && res.success) {
      tableData.value = res.result
    } else {
      message.warning(res?.message)
    }
    loading.value = false
  })
}

/**
 * 获取流程位置信息
 */
function getNodePositionInfoData() {
  let params = { processInstanceId: '' }
   defHttp.get({ url: api.nodeInfo, params: params }, { withToken: true }).then((res) => {
    if (res && res.success) {
      nodePositionInfo.value = res.result
    } else {
      message.warning(res?.message)
    }
  })
}

/**
 * 查看详情
 * @param data
 * @param taskId
 */
function showNodeInfo(data, taskId) {
  if (nodeInfoModal.value) {
    nodeInfoModal.value.close()
    nodeInfoModal.value.showInfo(data, taskId)
  }
}
</script>

<style lang="less" scoped>
.process-module {
  padding: 10px;
}
</style>