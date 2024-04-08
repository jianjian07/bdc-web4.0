<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="表名">
                        <a-input v-model:value="formData.dataTable" placeholder="表名" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="数据id">
                        <a-input v-model:value="formData.dataId" placeholder="数据id" allowClear />
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
        <div class="wonder-table-toolbar">
            <a-space>
                <a-button type="primary" @click="handleCompare">
                    <template #icon>
                        <plus-outlined />
                    </template>
                    对比
                </a-button>
            </a-space>
        </div>
        <a-table :row-selection="rowSelection" bordered :columns="columns" rowKey="id" :data-source="datalist"
            :pagination="pagination" @change="onChange($event, loadData)">
        </a-table>
    </div>
    <CompareModal v-if="open" :open="open" :data="selectedRowsData" :title="title" @ok="handOk" />
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent, computed } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
const CompareModal = defineAsyncComponent(() => import("./CompareModal.vue"));
const columns = [
    // { title: "ID", dataIndex: "id", width: 0, ellipsis: true },
    // { title: "ID", dataIndex: "id", width: 150 },
    { title: "表名", dataIndex: "dataTable", width: 180, ellipsis: true },
    { title: "数据id", dataIndex: "dataId", width: 200, ellipsis: true },
    { title: '数据内容', dataIndex: "dataContent", ellipsis: true },
    { title: '版本号', dataIndex: "dataVersion", width: 80 },
    { title: '创建人', dataIndex: "createBy", width: 120 }
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
    let url = '/api/zrzy-system/sys/datalog/list'
    defHttp.post({ url: url, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize, dataTable: formData.value.dataTable, dataId: formData.value.dataId } }, { withToken: true }).then((res) => {
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
