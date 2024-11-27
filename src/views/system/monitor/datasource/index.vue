<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="数据源名称">
                        <a-input v-model:value="formData.name" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="数据库类型">
                        <a-select v-model:value="formData.dbType" :options="getDictItemsByCode('database')" allowClear
                            style="width: 100%;">
                        </a-select>
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
                <a-button type="primary" @click="addData">
                    <template #icon>
                        <plus-outlined />
                    </template>
                    新增
                </a-button>
            </a-space>
        </div>
        <a-table bordered :columns="columns" :data-source="datalist" :pagination="pagination"
            @change="onChange($event, loadData)"><template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="editData(record)">编辑</a>
                        <a-popconfirm title="是否确定删除该数据源配置？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <DataSourceModal v-if="open" :open="open" :id="dataSourceId" :title="title" @ok="handOk" />
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { getDictItemsByCode } from "/@/utils/form/commonUtils";
const DataSourceModal = defineAsyncComponent(() => import("./DataSourceModal.vue"));
const columns = [
    // { title: "ID", dataIndex: "id", width: 0, ellipsis: true },
    { title: "数据源名称", dataIndex: "name", width: 200 },
    // { title: "编码", dataIndex: "code", width: 250 },
    { title: "数据源类型", dataIndex: "dbTypeText", width: 200 },
    { title: '驱动', dataIndex: "dbDriver", width: 200 },
    { title: '数据源地址', dataIndex: "dbUrl", ellipsis: true },
    { title: '操作', key: 'action', width: 200 }
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
    let url = '/api/zrzy-system/sys/datasource/list'
    defHttp.post({ url: url, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize, name: formData.value.name, dbType: formData.value.dbType } }, { withToken: true }).then((res) => {
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
let dataInfo = ref<any>({})
let title = ref("")
let dataSourceId = ref("")
/**
 * 编辑表单
*/
function editData(record: any) {
    dataSourceId.value = record.id
    // dataInfo.value = record
    open.value = true
    title.value = "编辑数据源"
}
/**
 * 添加表单
*/
function addData() {
    dataSourceId.value = ""
    title.value = "新增数据源"
    open.value = true
}
function handOk(value: any) {
    open.value = false
    if (value.isAdd == true) {
        loadData()
    }
}
/**
 * 删除表单
*/
function deleteData(record: any) {
    if (!record.id) return
    let url = '/api/zrzy-system/sys/datasource/delete'
    defHttp.post({ url: url, params: { id: record.id } }, { withToken: true }).then(async (res) => {
        if (res.success) {
            message.success('删除成功')
            datalist.value.splice(datalist.value.indexOf(record), 1)
        } else {
            message.error('删除失败' + res.message)
        }
    })
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
