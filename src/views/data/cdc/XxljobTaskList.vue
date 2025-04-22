<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">

                <a-col :span="8" :offset="0">
                    <a-form-item label="执行器">
                        <a-select v-model:value="jobGroup" :options="jobGroupList"
                            :field-names="{ label: 'title', value: 'id' }" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="任务状态">
                        <a-select ref="select" v-model:value="formData.triggerStatus">
                            <a-select-option value="-1">全部</a-select-option>
                            <a-select-option value="0">停止</a-select-option>
                            <a-select-option value="1">启动</a-select-option>
                        </a-select>

                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="任务描述">
                        <a-input v-model:value="formData.jobDesc" allowClear />
                    </a-form-item>
                </a-col>

            </a-row>

            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="JobHandler">
                        <a-input v-model:value="formData.executorHandler" allowClear />
                    </a-form-item>
                </a-col>

                <a-col :span="4" :offset="0">
                    <a-form-item label="负责人">
                        <a-input v-model:value="formData.author" allowClear />
                    </a-form-item>
                </a-col>

                <!-- <a-col :span="4" :offset="0">
                    <a-form-item label="任务ID">
                        <a-input v-model:value="formData.id" allowClear />
                    </a-form-item>
                </a-col> -->

                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="loadData">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询
                            </a-button>
                            <a-button @click="refreshData">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置
                            </a-button>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </div>
    <div class="wonder-table-css">
        <div class="wonder-table-toolbar">
            <a-button type="primary" @click="addData">
                <template #icon>
                    <plus-outlined />
                </template>
                新增
            </a-button>
        </div>
        <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
            @change="onChange($event, loadData)">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'scheduleType'">
                    <a-tag :color="record[column.dataIndex] === 'CRON' ? 'geekblue' : 'green'">
                        {{ record.scheduleType }}</a-tag>{{ record.scheduleConf }}
                </template>
                <template v-if="column.dataIndex === 'glueType'">
                    <a-tag :color="record[column.dataIndex] === 'BEAN' ? 'green' : 'geekblue'">
                        {{ record.glueType }}</a-tag>{{ record.executorHandler }}
                </template>
                <template v-if="column.dataIndex === 'triggerStatus'">
                    <a-tag :color="record[column.dataIndex] === 1 ? 'green' : 'red'" style="padding: 0 15px;">
                        {{ record[column.dataIndex] === 1 ? 'RUNNING' : 'STOP' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <!-- <a @click="design(record)">设计</a> -->
                        <a @click="editData(record)">编辑</a>
                        <a @click="start(record)">{{ record["triggerStatus"] === 1 ? '停止' : '启动' }}</a>

                        <a-dropdown>
                            <a class="ant-dropdown-link" @click.prevent>
                                更多
                                <DownOutlined />
                            </a>
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item>
                                        <a @click="trigger(record)">执行一次</a>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a>查看日志</a>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a>下次执行时间</a>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a>复制</a>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消"
                                            @confirm="deleteData(record)">
                                            <a>删除</a>
                                        </a-popconfirm>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <JobInfoModal v-if="open" :open="open" :data="data" :title="title" @ok="handOver"></JobInfoModal>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined, DownOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
const JobInfoModal = defineAsyncComponent(() => import("/@/views/data/cdc/modules/JobInfoModal.vue"));
const columns = [
    { title: "任务ID", dataIndex: "id", width: 80 },
    { title: "任务描述", dataIndex: "jobDesc" },
    { title: "调度类型", dataIndex: "scheduleType" },
    { title: "运行模式", dataIndex: "glueType" },
    { title: "负责人", dataIndex: "author", width: 120 },
    { title: "状态", dataIndex: "triggerStatus", width: 120 },
    { title: '操作', key: 'action', width: 250 }
]
let datalist: any = ref([]);
let jobGroup = ref('');
let formData: any = ref({
    // jobGroup: '',
    triggerStatus: '-1',
    jobDesc: '',
    executorHandler: '',
    author: ''
});
let data = ref({});
let title = ref('')
let open = ref(false)
onMounted(() => {
    loadJobGroup();
    loadData() // 初始化加载数据
})
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})

enum Api {
    list = '/api/zrzy-api/jobinfo/pageList',
    startUrl = '/api/zrzy-api/jobinfo/start',
    stopUrl = '/api/zrzy-api/jobinfo/stop',
    triggerUrl = '/api/zrzy-api/jobinfo/trigger',
    delUrl = '/api/zrzy-api/jobinfo/remove',
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
    debugger
    let jobGroupValue = (jobGroup.value == '' || jobGroup.value == undefined) ? -1 : jobGroup.value
    defHttp.post({ url: Api.list, params: { start: pagination.value.current - 1, length: pagination.value.pageSize, jobGroup: jobGroupValue, ...formData.value } }, { withToken: true, isTransformResponse: false }).then((res) => {
        if (res.status != 200) return;
        const { data, recordsTotal } = res.data
        datalist.value = data
        pagination.value.total = recordsTotal
    }).catch(err => {
        console.info(err)
    })
}
/**
 * 重置
*/
function refreshData() {
    formData.value = {}
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
 * 添加表单
*/
function addData() {
    title.value = "新增任务"
    data.value = {}
    open.value = true
}
/**
 * 编辑表单
*/
function editData(record: any) {
    title.value = '编辑任务'
    data.value = record
    open.value = true
}
function trigger(record: any) {
    defHttp.post({ url: Api.triggerUrl, params: { id: record.id, executorParam: '', addressList: '' } }, { withToken: true }).then((res) => {
        if (!res.message) {
            message.success('执行成功')
            // loadData()
        } else {
            message.error('执行失败' + res?.message)
        }
    }).catch(err => {
        message.error('执行失败' + err)
    })
}
function start(record: any) {
    let ulr = record.triggerStatus === 1 ? Api.stopUrl : Api.startUrl
    defHttp.post({ url: ulr, params: { id: record.id } }, { withToken: true }).then((res) => {
        if (!res.message) {
            message.success('启动成功')
            loadData()
        } else {
            message.error('启动失败' + res?.message)
        }
    }).catch(err => {
        message.error('启动失败' + err)
    })
}
/**
 * 删除表单
*/
function deleteData(record) {
    if (!record.id) return
    defHttp.post({ url: Api.delUrl, params: { id: record.id } }, { withToken: true }).then((res) => {
        if (!res.message) {
            message.success('删除成功')
            loadData()
        } else {
            message.error('删除失败' + res?.message)
        }
    }).catch(err => {
        message.error('删除失败')
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
