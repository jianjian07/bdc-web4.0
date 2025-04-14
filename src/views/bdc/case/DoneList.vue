<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="6" :offset="0">
          <a-form-item label="项目名称">
            <a-input v-model:value="formData.xmmc" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="受理编号">
            <a-input v-model:value="formData.slbh" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="12" :offset="0">
          <a-form-item label="办理时间">
            <a-range-picker v-model:value="formData.blsj" allowClear/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="6" :offset="0">
          <a-form-item label="流程类型">
            <a-tree-select v-model:value="formData.ajlx" :tree-data="treeData" show-search tree-node-filter-prop="title"
                           label-in-value
                           @change="onChangeAjlx"
                           :field-names="{
                             children: 'children',
                             value: 'key',
                             label: 'title',
                          }"
                           allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="业务类型">
            <a-select v-model:value="formData.ywlx" :options="getDictItemsByCode('ywlx')" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="办理节点" v-show="formData.ajlx">
            <a-select v-model:value="formData.nodeName" :options="nodeList" allowClear/>
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
    <a-spin :spinning="spinning">
      <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
               @change="onChange($event, loadData)">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'xmmc'">
            <a-space :size="2">
              <template #split>
                <a-divider type="vertical"/>
              </template>
              <a @click="itemView(record)">{{ record.xmmc }}</a>
            </a-space>
          </template>
          <template v-if="column.key === 'currentNode'">
            {{ record.currentNode }}【
            <a-span style="color: orangered">
              {{ record.currentAssignee }}
            </a-span>
            】
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="2">
              <template #split>
                <a-divider type="vertical"/>
              </template>
              <a-popconfirm title="是否确定撤回该任务？" ok-text="确定" cancel-text="取消" @confirm="itemRecall(record)">
                <a-button type="link" :disabled="record.recallFlag == '0'">撤回</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref, onMounted } from 'vue';
import { SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { router } from "/@/router";
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils.ts";
import dayjs from "dayjs";
import { message } from "ant-design-vue";

enum api {
  donelist = '/api/zrzy-bdc/act/task/getCaseDoneList',
  caseDoneRecall = '/api/zrzy-bdc/act/task/caseDoneRecall',
  processlist = '/api/zrzy-bdc/act/process/extActProcess/list',
  nodelistUrl = '/api/zrzy-bdc/act/process/extActProcessNode/list'
}

let datalist = ref([]);
let formData: any = ref({})
let spinning = ref<boolean>(true);
// 流程下拉树
let treeData = ref([])
// 业务节点下拉
let nodeList = ref([])
let currentLcid = ""
const columns = [
  { title: "案卷编号", dataIndex: "slbh", align: "center" },
  { title: "项目名称", dataIndex: "xmmc", align: "center", key: 'xmmc' },
  { title: "案卷类型", dataIndex: "ajlx", align: "center" },
  { title: "办理时间", dataIndex: "endTime", align: "center" },
  { title: "办理节点", dataIndex: "nodeName", align: "center" },
  { title: "当前在办情况", dataIndex: "currentNode", align: "center", key: 'currentNode' },
  { title: '操作', key: 'action', width: 100, align: "center" }]
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
    return `共 ${pagination.value.total} 条数据`
  }
})
onMounted(() => {
  loadTreeData()
  loadData()
})

/**
 * 加载数据
 */
function loadData() {
  spinning.value = true
  let queryDto = JSON.parse(JSON.stringify(formData.value))
  queryDto.pageNo = pagination.value.current
  queryDto.pageSize = pagination.value.pageSize
  if (queryDto.blsj) {
    queryDto.startTime = dayjs(queryDto.blsj[0]).format('YYYY-MM-DD') + ' 00:00:00'
    queryDto.endTime = dayjs(queryDto.blsj[1]).format('YYYY-MM-DD') + ' 23:59:59'
  }
  if (queryDto.ajlx) {
    queryDto.ajlx = queryDto.ajlx.label
  }
  // 处理时间
  delete queryDto.blsj
  defHttp.post({
    url: api.donelist,
    data: queryDto
  }, { withToken: true }).then(res => {
    if (res.success) {
      const result = res.result
      datalist.value = result.records
      pagination.value.total = result.total
    }
    spinning.value = false
  }).catch(_err => {
    spinning.value = false
  })
}

/**
 * 查询
 */
function searchData() {
  pagination.value.current = 1
  loadData()
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
 * 重置
 */
function clear() {
  formData.value = {}
  loadData()
}

/**
 * 查看项目信息
 * @param record
 */
function itemView(record: any) {
  router.push('/task/hisTaskDeal?slbh=' + record.slbh)
}

/**
 * 撤回
 * @param record
 */
function itemRecall(record: any) {
  const procInstId = record.procInstId
  const endTime = record.endTime
  const assignee = record.assignee
  const completedDefKey = record.defKey
  if (!procInstId || !endTime || !completedDefKey || !assignee) {
    message.warning("请确认流程是否已办或刷新重试！")
    return;
  }
  defHttp.post({
    url: api.caseDoneRecall,
    data: record
  }, { withToken: true }).then(res => {
    if (res && res.success) {
      message.success(res.result)
      // 刷新数据
      pagination.value.current = 1
      loadData()
    } else {
      message.warning(res.message)
    }
  }).catch(_err => {
    message.error(_err)
  })
}

/**
 * 流程类型下拉树
 */
function loadTreeData() {
  if (treeData.value.length > 0) {
    return
  }
  defHttp.get({ url: api.processlist, params: { ajlx: '1' } }, { withToken: true }).then((res) => {
    treeData.value = res.result
  })
}

/**
 * 案件类型下拉
 */
function onChangeAjlx(_value) {
  if (_value && _value.value) {
    currentLcid = _value.value
    getNode(currentLcid)
  }
}

/**
 * 业务节点下拉
 */
function getNode(currentLcid) {
  defHttp.get({ url: api.nodelistUrl, params: { processId: currentLcid } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      nodeList.value = res.result.map(item => {
        return {
          value: item.processNodeName,
          label: item.processNodeName
        }
      })
    }
  })
}
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
