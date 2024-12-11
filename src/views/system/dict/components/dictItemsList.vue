<template>
    <a-drawer title="字典列表" :width="720" :open="open1" :body-style="{ paddingBottom: '80px' }"
        :footer-style="{ textAlign: 'right' }" @close="onClose">
        <div class="wonder-table-form">
            <a-form :label-col="{ style: { width: '60px' } }" :labelWrap="true">
                <a-row tyle="flex">
                    <a-col :span="8" :offset="0">
                        <a-form-item label="名称">
                            <a-input v-model:value="formData.name" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="8" :offset="0">
                        <a-form-item label="子项值">
                            <a-input v-model:value="formData.code" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="4" :offset="1">
                        <a-form-item style="text-align: center;">
                            <a-space>
                                <a-button type="primary" @click="loadData">
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
                <a-button type="primary" @click="addData">
                    <template #icon>
                        <plus-outlined />
                    </template>
                    新增
                </a-button>
            </div>
            <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
                @change="onChange($event, loadData)"><template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex == 'status'">
                        {{ record.status == 1 ? '有效' : '无效' }}
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-space>
                            <template #split>
                                <a-divider type="vertical" />
                            </template>
                            <a @click="editData(record)">编辑</a>
                            <a-popconfirm title="是否确定删除该数据字典项？" ok-text="确定" cancel-text="取消"
                                @confirm="deleteData(record)">
                                <a>删除</a>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </div>
        <DictModal v-if="open" :open="open" @ok="handOk" :dataInfo="dataInfo" :title="title"></DictModal>
    </a-drawer>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { del, updateHasChild } from "/@/api/sys/dict";
const DictModal = defineAsyncComponent(() => import("/@/views/system/dict/components/dictModal.vue"));
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    parentId: {
        type: String,
        default: ""
    },
    data: {
        type: Object,
        default: {}
    },
    dmlx: {
        type: String,
        default: ''
    }
})
let open1 = ref(props.open)
let parentId = ref(props.parentId)

// watch(() => props.parentId, (newVal) => {
//     parentId.value = newVal
//     loadData()
// })
// onMounted(() => {
//     loadData() // 初始化加载数据
// })
const columns = [
    { title: "名称", dataIndex: "dictName", width: 300 },
    { title: "子项值", dataIndex: "dictCode", width: 200 },
    { title: "状态", dataIndex: "status", width: 100 },
    { title: "排序", dataIndex: "sort", width: 100 },
    { title: '操作', key: 'action', width: 200 }
]
let datalist: any = ref([]);
let formData = ref<any>({});

let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})
loadData()
/**
 * 表格数据加载
*/
async function loadData() {
    let url = '/api/zrzy-bdc/sys/dict/list';//'/magicapi/zrzy-form/magic/dict/list'
    defHttp.post({
        url: url, data: {
            dictCode: formData.value.code || '',
            dictName: formData.value.name || '',
            parentId: parentId.value
        }, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }
    }, { withToken: true }).then((res) => {
        const { success, result } = res
        if (success) {
            datalist.value = result.records
            pagination.value.total = result.total
            if (result.records && result.records.length < 1) { //更新hasChild状态
                updateHasChild(parentId.value, "0");
            }
        }
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
let open = ref(false)
let dataInfo = ref<any>({})
let title = ref("")
/**
 * 添加表单
*/
function addData() {
    dataInfo.value = { parentId: props.parentId, dictType: props.data.dictType != "1" ? "0" : "1", status: "1", delFlag: 0, dmlx: props.dmlx }
    title.value = "新增"
    open.value = true
}
/**
 * 编辑表单
*/
function editData(record: any) {
    record.dmlx = props.dmlx
    dataInfo.value = record
    open.value = true
    title.value = "编辑"
}
let refreshParentPage = ref(false)
function handOk(value: any) {
    open.value = false
    if (value.isAdd == true) {
        loadData()
    }
    if (value.refreshParentPage) {
        refreshParentPage.value = true
    }
}
/**
 * 删除表单
*/
async function deleteData(record: any) {
    if (!record.id) return
    const res = await del(record.id)
    if (res.result == 1) {
        message.success('删除成功')
        loadData()
    }
}
const emit = defineEmits(["onClose"])
function onClose() {
    emit("onClose", { refreshParentPage: true, children: datalist.value.length > 0 ? datalist.value : undefined })
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
