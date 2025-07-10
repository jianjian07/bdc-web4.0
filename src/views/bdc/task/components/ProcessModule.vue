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
    <a-card title="流程历史跟踪">
      <a-table
          :columns="columns"
          :data-source="tableData"
          :loading="loading"
          :scroll="{ x: 1300 }"
          row-key="index"
          size="small"
          bordered>
        <template #bodyCell="{ column, record, index }">
          <div v-if="column.dataIndex == 'index'" style="text-align: center">
            {{ index + 1 }}
          </div>
          <div v-if="column.dataIndex == 'czjg'">
            {{ getDictItemsByCode('shyjczjg').find(f => f.value == record[column.dataIndex])?.label }}
          </div>
          <template v-if="column.key === 'yjzt'">
                        <span>
                          <a-space>
                            <a-tag color="orange" v-if="record.yjzt == 1">
                                <template #icon>
                                    <RollbackOutlined/>
                                </template>
                                预警
                            </a-tag>
                            <a-tag color="red" v-else-if="record.yjzt == 2">
                                <template #icon>
                                    <AlertOutlined/>
                                </template>
                                超时
                            </a-tag>
                            <a-tag color="green" v-else>正常</a-tag>
                          </a-space>
                        </span>
          </template>
        </template>
      </a-table>
    </a-card>
    
    <node-info-modal v-if="false" ref="nodeInfoModal"></node-info-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import NodeInfoModal from "/@/views/bdc/task/components/NodeInfoModal.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { useRoute } from "vue-router"
import { AlertOutlined, RollbackOutlined, SolutionOutlined } from "@ant-design/icons-vue";
const route = useRoute()

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
  title: '节点名称',
  dataIndex: 'jdmc',
  key: 'jdmc',
  width: 100
}, {
  title: '节点id',
  dataIndex: 'jdid',
  key: 'jdid',
  width: 150
}, {
  title: '状态',
  dataIndex: 'yjzt',
  key: 'yjzt',
  width: 80
}, {
  title: '开始时间',
  dataIndex: 'blkssj',
  key: 'blkssj',
   width: 150
}, {
  title: '结束时间',
  dataIndex: 'bljssj',
  key: 'bljssj',
   width: 150
}, {
  title: '负责人',
  dataIndex: 'blr',
  key: 'blr',
  width: 100
}, {
  title: '处理结果',
  dataIndex: 'czjg',
  key: 'czjg'
}, {
  title: '处理意见',
  fixed: 'right',
  width: 250,
  dataIndex: 'shyj',
  key: 'shyj',
  ellipse: true
}
]

let nodeInfoModal = ref()

enum api {
  list = '/api/zrzy-bdc/bdc/public/getYwShBySlbh',
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
  initTableData()
})

/**
 * 加载流程图
 * @param id
 */
function getImage(id) {
  defHttp.get({ url: api.image, params: { processInstanceId: id }, responseType: "blob" }, { withToken: true }).then((res) => {
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
  let slbh = route.query.slbh
  defHttp.get({ url: api.list, params: { slbh: slbh } }, { withToken: true }).then((res) => {
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