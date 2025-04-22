<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="4" :offset="0">
                    <a-form-item label="AppName">
                        <a-input v-model:value="formData.appname" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item label="执行器名称">
                        <a-input v-model:value="formData.title" allowClear />
                    </a-form-item>
                </a-col>

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
                <template v-if="column.dataIndex === 'addressType'">
                    <a-tag :color="record[column.dataIndex] == '0' ? 'green' : 'red'">
                        {{ record.addressType == '0' ? '自动注册' : '手动注册' }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <!-- <a @click="design(record)">设计</a> -->
                        <a @click="editData(record)">编辑</a>
                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <JobGropModal v-if="open" :open="open" :data="data" :title="title" @ok="handOver"></JobGropModal>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined, DownOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { get } from "http";
const JobGropModal = defineAsyncComponent(() => import("/@/views/data/cdc/modules/JobGropModal.vue"));
const columns = [
    { title: "任务ID", dataIndex: "id", width: 80 },
    { title: "AppName", dataIndex: "appname" },
    { title: "名称", dataIndex: "title" },
    { title: "注册方式", dataIndex: "addressType" },
    { title: "OnLine机器地址", dataIndex: "addressList" },
    { title: '操作', key: 'action', width: 180 }
]
let datalist: any = ref([]);
let formData: any = ref({
    appname: '',
    title: ''
});
let data = ref({});
let title = ref('')
let open = ref(false)

onMounted(() => {
    loadData() // 初始化加载数据
})
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})

enum Api {
    list = '/api/zrzy-api/jobgroup/pageList',
    delUrl = '/api/zrzy-api/jobgroup/remove',
}

/**
 * 表格数据加载
*/
async function loadData() {
    defHttp.get({ url: Api.list, params: { start: pagination.value.current - 1, length: pagination.value.pageSize, ...formData.value } }, { withToken: true, isTransformResponse: false }).then((res) => {
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
    formData.value = {
        appname: '',
        title: ''
    }
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
    title.value = "新增执行器"
    data.value = {}
    open.value = true
}
/**
 * 编辑表单
*/
function editData(record: any) {
    title.value = '编辑执行器'
    data.value = record
    open.value = true
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
