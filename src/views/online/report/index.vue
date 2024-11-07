<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="表单编码">
                        <a-input v-model:value="formData.code" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="报表标题">
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
                <template v-if="column.dataIndex === 'isLoad' || column.dataIndex === 'isMybatis'">
                    <a-tag :color="record[column.dataIndex] === 1 ? 'green' : 'red'" style="padding: 0 15px;">
                        {{ record[column.dataIndex] === 1 ? '是' : '否' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <span>
                        <a @click="editData(record)">编辑</a><a-divider type="vertical" />
                        <a @click="design(record)">在线设计</a><a-divider type="vertical" />
                        <a @click="preview(record)">在线预览</a><a-divider type="vertical" />
                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </span>
                </template>
            </template>
        </a-table>
    </div>
    <report-modal v-if="open" :open="open" :data="data" :title="title" @ok="handOver"></report-modal>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { router } from "/@/router";
const ReportModal = defineAsyncComponent(() => import("/@/views/online/report/ReportModal.vue"));
const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "初始加载", dataIndex: "isLoad", width: 100 },
    { title: "编号", dataIndex: "code", width: 180 },
    { title: "报表标题", dataIndex: "title" },
    { title: "数据来源", dataIndex: "cType" },
    { title: "MyBatis", dataIndex: "isMybatis" },
    { title: '操作', key: 'action', width: 230 }
]
let datalist: any = ref([]);
let formData: any = ref([]);
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
/**
 * 表格数据加载
*/
async function loadData() {
    // 解决翻页后查询不到的问题
    // if (type == 'query') {
    //     pagination.value = {
    //         total: 0,
    //         current: 1,
    //         pageSize: 10,
    //     }
    // }
    let url = '/api/zrzy-form/form/report/pages'
    defHttp.post({ url: url, data: { code: formData.value.code || '', formName: formData.value.title || '' }, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then((res) => {
        if (!res.success) return
        const { records, total } = res.result
        datalist.value = records
        pagination.value.total = total
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
function design(record: any) {
    router.push("/online/report/design" + '/' + record.id)
}
/**
 * 在线预览
 * @param record
 */
function preview(record: any) {
    router.push("/online/report/view" + '/' + record.id)
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
    title.value = "新增报表"
    data.value = {}
    open.value = true
}
/**
 * 编辑表单
*/
function editData(record: any) {
    title.value = '编辑报表'
    data.value = record
    open.value = true
}
/**
 * 删除表单
*/
function deleteData(record) {
    if (!record.id) return
    let url = '/api/zrzy-form/form/report/delete' // 删除
    defHttp.post({ url: url, params: { id: record.id } }, { withToken: false }).then((res) => {
        if (!res.message) {
            message.success('删除成功')
            loadData()
        } else {
            message.error('删除失败' + res.message)
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
