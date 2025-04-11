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
            <a-select v-model:value="formData.ajlx" placeholder="待补充下拉数据" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="业务类型">
            <a-select v-model:value="formData.ywlx" :options="getDictItemsByCode('ywlx')" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="办理节点">
            <a-select v-model:value="formData.completedNode" placeholder="待补充下拉数据" allowClear/>
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
          <template v-if="column.key === 'action'">
            <a-space :size="2">
              <template #split>
                <a-divider type="vertical"/>
              </template>
              <a-button type="link" :disabled="record.recallFlag == '0'" @click="itemRecall(record)">撤回</a-button>
              <a-button type="link" :disabled="record.recallFlag == '0'" @click="itemSingleRecall(record)">单点撤回
              </a-button>
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

enum api {
  donelist = '/api/zrzy-bdc/act/task/getCaseDoneList',
}

let datalist = ref([]);
let formData: any = ref({})
let spinning = ref<boolean>(true);
const columns = [
  { title: "案卷编号", dataIndex: "slbh", align: "center" },
  { title: "项目名称", dataIndex: "xmmc", align: "center", key: 'xmmc' },
  { title: "案卷类型", dataIndex: "ajlx", align: "center" },
  { title: "办理时间", dataIndex: "endTime", align: "center" },
  { title: "办理节点", dataIndex: "completedNode", align: "center" },
  { title: "当前在办情况", dataIndex: "currentNode", align: "center" },
  { title: '操作', key: 'action', width: 200, align: "center" }
]
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
    return `共 ${pagination.value.total} 条数据`
  }
})
onMounted(() => {
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
  // TODO 此种写法，第一次点击查看项目时跳转不过去
  router.push('/task/hisTaskDeal?slbh=' + record.slbh)
}

/**
 * 撤回
 * @param record
 */
function itemRecall(record: any) {

}

/**
 * 单点撤回
 * @param record
 */
function itemSingleRecall(record: any) {

}

</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
