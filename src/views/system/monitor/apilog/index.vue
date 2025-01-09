<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="请求时间">
                        <a-range-picker v-model:value="formData.createTime" />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="标志">
                        <a-input v-model:value="formData.flag" placeholder="数据id" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="searchData">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询</a-button>
                            <a-button @click="refreshData">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置</a-button>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </div>
    <div class="wonder-table-css">
        <a-table :row-selection="rowSelection" bordered :columns="columns" rowKey="id" :data-source="datalist"
            :pagination="pagination" @change="onChange($event, loadData)">
        </a-table>
    </div>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios"
import dayjs from 'dayjs';
import { ref, onMounted, defineAsyncComponent, computed } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
const columns = [
    { title: "地址", dataIndex: "url", ellipsis: true },
    { title: "参数", dataIndex: "params", ellipsis: true },
    { title: '请求类型', dataIndex: "requestType", ellipsis: true },
    { title: '创建人', dataIndex: "createBy", ellipsis: true },
    { title: '创建时间', dataIndex: "createTime", ellipsis: true },
    { title: '备注', dataIndex: "remark", ellipsis: true },
    { title: '标志', dataIndex: "flag", ellipsis: true },
    { title: '异常信息', dataIndex: "errorMessage", ellipsis: true },
    { title: '返回结果', dataIndex: "result", ellipsis: true },
    { title: '请求头', dataIndex: "headers", ellipsis: true }
]
let datalist: any = ref([]);
let formData: any = ref([]);
onMounted(() => {
    loadData() // 初始化加载数据
})
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})
/**
 * 表格数据加载
*/
async function loadData() {
    let url = '/api/zrzy-api/apiLog/getApiLogList'
    if (formData.value.createTime) {
        formData.value.startTime = dayjs(formData.value.createTime[0]).format('YYYY-MM-DD')
        formData.value.endTime = dayjs(formData.value.createTime[1]).format('YYYY-MM-DD')
    } else {
        delete formData.value.startTime
        delete formData.value.endTime
    }
    defHttp.get({ url: url, params: { page: pagination.value.current, size: pagination.value.pageSize, startTime: formData.value.startTime, endTime: formData.value.endTime, flag: formData.value.flag } }, { withToken: true }).then((res) => {
        datalist.value = res.result.records
        pagination.value.total = res.result.total
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

let open = ref(false)
let title = ref("")
let selectedRowsData = [];
/**
 * 对比数据
*/
function handleCompare() {
    if (selectedRowsData.length == 2) {
        title.value = "数据对比"
        open.value = true
    } else {
        message.success("请选择2条数据进行对比")
    }
}
function handOk(value: any) {
    open.value = false
}

const rowSelection = computed(() => {
    return {
        onChange: (selectedRowKeys: any, selectedRows: any) => {
            selectedRowsData = selectedRows
        },
    }
})
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
