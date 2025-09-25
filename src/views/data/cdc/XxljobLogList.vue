<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">

                <a-col :span="4" :offset="0">
                    <a-form-item label="执行器">
                        <a-select v-model:value="jobGroup" :options="jobGroupList"
                            :field-names="{ label: 'title', value: 'id' }" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item label="状态">
                        <a-select ref="select" v-model:value="formData.logStatus" style="width: 100%;">
                            <a-select-option value="-1">全部</a-select-option>
                            <a-select-option value="1">成功</a-select-option>
                            <a-select-option value="2">失败</a-select-option>
                            <a-select-option value="3">进行中</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <!-- <a-col :span="8" :offset="0">
                    <a-form-item label="任务描述">
                        <a-input v-model:value="formData.jobDesc" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="JobHandler">
                        <a-input v-model:value="formData.executorHandler" allowClear />
                    </a-form-item>
                </a-col> -->
                <a-col :span="4" :offset="0">
                    <a-form-item label="任务ID">
                        <a-input v-model:value="jobId" allowClear />
                    </a-form-item>
                </a-col>

                <a-col :span="6" :offset="0">
                    <a-form-item label="调度时间">
                        <a-range-picker v-model:value="timeValue" show-time />
                    </a-form-item>
                </a-col>


                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;margin-left: 10px">
                        <a-space>
                            <a-button type="primary" @click="searchData">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询
                            </a-button>
                            <a-button @click="refreshData">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置
                            </a-button>
                            <a-button @click="clear">
                                <template #icon>
                                    <component :is="DeleteOutlined"></component>
                                </template>清理
                            </a-button>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </div>
    <div class="wonder-table-css">
<!--        <div class="wonder-table-toolbar">-->
<!--            <a-button type="primary" @click="addData">-->
<!--                <template #icon>-->
<!--                    <plus-outlined />-->
<!--                </template>-->
<!--                新增-->
<!--            </a-button>-->
<!--        </div>-->
        <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
            @change="onChange($event, loadData)">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'triggerCode'">
                    <a-tag :color="record[column.dataIndex] === 200 ? 'green' : 'red'">
                        {{ record.triggerCode === 200 ? '成功' : '失败' }}</a-tag>
                </template>
                <template v-if="column.dataIndex === 'handleCode'">
                    <a-tag v-if="record.handleCode === 502" color="red">
                        失败(超时)</a-tag>
                    <span v-else-if="record.handleCode === 0">
                    </span>
                    <a-tag v-else color="green">
                        成功</a-tag>
                </template>
                <template v-if="column.dataIndex === 'triggerMsg'">
                    <a @click="showMes(record)">查看</a>
                </template>
                <template v-if="column.key === 'action' && record.triggerCode === 200">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="showLog(record)">日志</a>
                        <a-popconfirm v-if="record.handleCode === 0" title="是否确定终止该任务？" ok-text="确定" cancel-text="取消"
                            @confirm="kill(record)">
                            <a>终止</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <JobLogModal v-if="open" :open="open" :data="data" :title="title" :lType="lType" :width="width" @ok="handOver">
    </JobLogModal>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { formatToDate } from "/@/views/online/utils/dateUtil";
const JobLogModal = defineAsyncComponent(() => import("/@/views/data/cdc/modules/JobLogModal.vue"));
const columns = [
    { title: "任务ID", dataIndex: "jobId", width: 80 },
    { title: "调度时间", dataIndex: "triggerTime" },
    { title: "调度结果", dataIndex: "triggerCode" },
    { title: "调度备注", dataIndex: "triggerMsg" },
    { title: "执行时间", dataIndex: "handleTime" },
    { title: "执行结果", dataIndex: "handleCode" },
    { title: "执行备注", dataIndex: "handleMsg" },
    { title: '操作', key: 'action', width: 120 }
]
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

let datalist: any = ref([]);
let jobGroup: any = ref([]);
let formData: any = ref({
    // jobGroup: 0,
    jobId: '',
    logStatus: '-1',
    filterTime: ''
});
let jobId = ref('');
const time = new Date().getTime();
const dayValue = formatToDate(time);
let timeValue = ref<[Dayjs, Dayjs]>([
    dayjs(dayValue + " 00:00:00", dateFormat),
    dayjs(dayValue + " 23:59:59", dateFormat),
])
let data = ref({});
let title = ref('')
let open = ref(false)
onMounted(() => {
    loadJobGroup()
    loadData() // 初始化加载数据
})
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: () => {
      return `共 ${pagination.value.total} 条数据`
    }
})

enum Api {
    list = '/api/zrzy-api/joblog/pageList',
    killUrl = '/api/zrzy-api/joblog/logKill',
    clearUrl = '/api/zrzy-api/joblog/clearLog',
    jobGroupUrl = '/api/zrzy-api/jobgroup/getAll'
}
let jobGroupList = ref([])
function loadJobGroup() {
    defHttp.post({ url: Api.jobGroupUrl }, { withToken: true, isTransformResponse: false }).then((res) => {
        if (res.data.success) {
            jobGroupList.value = res.data.result
        }
    }).catch(err => {
        console.info(err)
    })
}
/**
 * 表格数据加载
*/
async function loadData() {
  if (timeValue.value && timeValue.value.length == 2) {
    let startTime = dayjs(timeValue.value[0]).format(dateFormat)
    let endTime = dayjs(timeValue.value[1]).format(dateFormat)
    formData.value.filterTime = startTime + ' - ' + endTime
  } else {
    formData.value.filterTime = ''
  }
    formData.value.jobId = jobId.value == "" ? 0 : jobId.value
    let jobGroupValue = (jobGroup.value == '' || jobGroup.value == undefined) ? 0 : jobGroup.value
    defHttp.get({ url: Api.list, params: { start: (pagination.value.current - 1) * pagination.value.pageSize, length: pagination.value.pageSize, jobGroup: jobGroupValue, ...formData.value } }, { withToken: true, isTransformResponse: false }).then((res) => {
        if (res.status != 200) return;
        const { data, recordsTotal } = res.data
        datalist.value = data
        pagination.value.total = recordsTotal
    }).catch(err => {
        console.info(err)
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
 * 重置
*/
function refreshData() {
    // 默认查询当天的数据
    const time = new Date().getTime();
    const dayValue = formatToDate(time);
    timeValue.value = ([
      dayjs(dayValue + " 00:00:00", dateFormat),
      dayjs(dayValue + " 23:59:59", dateFormat),
    ])
    pagination.value.current = 1
    formData.value = {
      logStatus: '-1',
      filterTime: '',
      jobId: '',
    }
    jobGroup.value = undefined
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
let lType = ref('msg')
let width = ref('calc(50vw)')
/**
 * 执行日志
*/
function showMes(record: any) {
    title.value = '调度结果'
    lType.value = 'msg'
    width.value = 'calc(50vw)'
    data.value = record
    open.value = true
}

function showLog(record: any) {
    title.value = '执行日志'
    lType.value = 'log'
    width.value = 'calc(80vw)'
    data.value = record
    open.value = true
}
function kill(record: any) {
    defHttp.post({ url: Api.killUrl, params: { id: record.id } }, { withToken: true }).then((res) => {
        if (res.code === 200) {
            message.success('操作成功')
            loadData()
        } else {
            message.error('操作失败' + res?.message)
        }
    }).catch(err => {
        message.error('操作失败' + err)
    })
}
function clear(record: any) {
    defHttp.post({
        url: Api.clearUrl, params: { jobGroup: 0, jobId: 0, type: 1 }
    }, { withToken: true }).then((res) => {
        if (res.code === 200) {
            message.success('操作成功')
            loadData()
        } else {
            message.error('操作失败' + res?.message)
        }
    }).catch(err => {
        message.error('操作失败' + err)
    })
}
/**
 * 表单创建后回调
 * @param val { refresh: boolean}
*/
function handOver(val: any) {
    if (val.refresh) {
        loadData()
    }
    open.value = false
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
