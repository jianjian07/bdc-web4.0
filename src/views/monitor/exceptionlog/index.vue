<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="4" :offset="0">
          <a-form-item label="异常id">
            <a-input v-model:value="formData.traceId" />
          </a-form-item>
        </a-col>
        <a-col :span="8" :offset="0">
          <a-form-item label="请求时间">
            <a-range-picker v-model:value="formData.createTime" />
          </a-form-item>
        </a-col>
        <a-col :span="8" :offset="0">
          <a-form-item label="接口地址">
            <a-input v-model:value="formData.requestUri" allowClear />
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
              <a-button @click="refreshData">
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
    <a-table bordered :columns="columns" rowKey="id" :data-source="datalist" :pagination="pagination"
      @change="onChange($event, loadData)" :loading="loading">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <span>
            <a-spin size="small" :spinning="record.spinning" />
            <a @click="queryDetail(record)">详情</a>
            <!--          <a-divider type="vertical"/>-->
            <!--          <a>删除</a>-->
          </span>
        </template>
      </template>
    </a-table>
  </div>
  <DetailModal v-if="open" :open="open" :data="selectedRowsData" @ok="handOk" />
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import dayjs from "dayjs";
import { RedoOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const DetailModal = defineAsyncComponent(() => import("./DetailModal.vue"));

let formData = ref<any>({ createTime: '', requestUri: '' });
let datalist = ref<any>([]);
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10
})
const columns = [
  { title: '编号', dataIndex: "exceptionId", width: 40 },
  { title: '异常id', dataIndex: "traceId", ellipsis: true, width: 100 },
  { title: "ip地址", dataIndex: "ipAddress", ellipsis: true, width: 80 },
  { title: '异常类型', dataIndex: "exceptionType", ellipsis: true, width: 100 },
  { title: '接口地址', dataIndex: "requestUri", ellipsis: true, width: 240 },
  { title: '请求参数', dataIndex: "requestParams", ellipsis: true, width: 120 },
  { title: "请求时间", dataIndex: "createTime", ellipsis: true, width: 100 },
  { title: '请求人', dataIndex: "createBy", ellipsis: true, width: 50 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 50 }
]
/** 弹出框打开状态 */
let open = ref(false)
/** 当前操作的行 */
let selectedRowsData = ref<object>({})
/** 加载状态 */
let loading = ref(false)

enum api {
  // 异常日志-分页列表查询
  list = '/api/zrzy-system/sys/exception/list',
  detailInfo = '/api/zrzy-system/sys/exception/queryById'
}

onMounted(() => {
  // 初始化加载数据
  loadData()
})

/**
 * 表格数据加载
 */
async function loadData() {
  let params: any = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    exceptionTime_begin: '',
    exceptionTime_end: '',
    requestUri: ''
  }
  // 请求时间区间查询
  let ywspExceptionLog: any = { exceptionTime_begin: "", exceptionTime_end: "", exceptionType: "" }
  if (formData.value.createTime) {
    params.exceptionTime_begin = dayjs(formData.value.createTime[0]).format('YYYY-MM-DD')
    params.exceptionTime_end = dayjs(formData.value.createTime[1]).format('YYYY-MM-DD')
  } else {
    delete ywspExceptionLog.exceptionTime_begin
    delete ywspExceptionLog.exceptionTime_end
  }
  // 请求地址模糊查询
  if (formData.value.requestUri) {
    params.requestUri = `*${formData.value.requestUri}*`
  }
  if (formData.value.traceId) {
    params.traceId = formData.value.traceId
  }
  loading.value = true
  defHttp.get({
    url: api.list,
    params: params
  }, { withToken: true }).then((res) => {
    datalist.value = res.result.records
    datalist.value.map((item: any) => {
      item.spinning = false
    })
    pagination.value.total = res.result.total
    loading.value = false
  }).catch(err => {
    loading.value = false
    message.error(err.message)
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
  pagination.value = pag
  callback()
}

/**
 * 重置
 */
function refreshData() {
  formData.value = {}
  loadData()
}

/**
 * 打开详情页
 * @param row
 */
function queryDetail(record: any) {
  record.spinning = true
  defHttp.get({
    url: api.detailInfo,
    params: { id: record.exceptionId }
  }, { withToken: true }).then((res) => {
    selectedRowsData.value = res.result
    record.spinning = false
    open.value = true
  }).catch(err => {
    record.spinning = false
    message.error(err)
  })
}

/**
 * 关闭详情页
 */
function handOk() {
  open.value = false
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
