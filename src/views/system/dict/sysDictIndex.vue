<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="字典名称">
                        <a-input v-model:value="formData.name" />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="字典编码">
                        <a-input v-model:value="formData.code" />
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
                <!-- <a-button @click="deleteBatch">
                    <template #icon>
                        <DeleteOutlined />
                    </template>
                    删除
                </a-button> -->
            </a-space>
        </div>
        <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
            @change="onChange($event, loadData)"><template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="editData(record)">编辑</a>
                        <a @click="design(record)">字典配置</a>
                        <a @click="copy(record)">复制</a>
                        <a-popconfirm title="是否确定删除该数据字典项？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <DictModal v-if="open" :open="open" @ok="handOk" :dataInfo="dataInfo" :title="title"></DictModal>
    <!-- <a-drawer title="字典列表" :width="720" :open="drawerOpen" :body-style="{ paddingBottom: '80px' }"
        :footer-style="{ textAlign: 'right' }" @close="onClose"> -->
    <DictItemsList v-if="drawerOpen" :open="drawerOpen" :parentId="parentId" @onClose="onClose" />
    <!-- </a-drawer> -->
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { del } from "/@/api/sys/dict";
const DictModal = defineAsyncComponent(() => import("/@/views/system/dict/components/dictModal.vue"));
const DictItemsList = defineAsyncComponent(() => import("/@/views/system/dict/components/dictItemsList.vue"));
const columns = [
    { title: "字典名称", dataIndex: "dictName" },
    { title: "字典编码", dataIndex: "dictCode" },
    { title: "说明", dataIndex: "description" },
    { title: '操作', key: 'action', width: 250 }
]
let datalist: any = ref([]);
let formData: any = ref([]);

enum api {
    list = '/api/zrzy-system/sys/datadict/list',
    copy = '/api/zrzy-system/sys/datadict/copyDict'
}
onMounted(() => {
    loadData() // 初始化加载数据
})
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 2,
})
/**
 * 表格数据加载
*/
async function loadData() {
    defHttp.post({ url: api.list, data: { dictCode: formData.value.code || '', dictName: formData.value.name || '', dictType: 0, parentId: "0" }, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then((res) => {
        const { result } = res
        datalist.value = result.records
        pagination.value.total = result.total
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
let drawerOpen = ref(false)
let parentId = ref("0")
function design(record: any) {
    parentId.value = record.id
    drawerOpen.value = true
}

/**
 * 复制
 * @param record
 */
function copy(record: any) {
    defHttp.get({ url: api.copy, params: { dictCode: record.dictCode } }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            message.success('复制成功')
            loadData()
        } else {
            message.warning(res.message)
        }
    }).catch(err => {
        message.warning(err)
    })
}

function onClose() {
    drawerOpen.value = false
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
 * 编辑表单
*/
function editData(record: any) {
    dataInfo.value = record
    open.value = true
    title.value = "编辑字典"
}
/**
 * 添加表单
*/
function addData() {
    parentId.value = "0"
    dataInfo.value = { parentId: "0", dictType: "0", status: "1", delFlag: 0 }
    title.value = "新增字典"
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
    let url = '/api/zrzy-system/sys/datadict/getChildrenCount'
    defHttp.get({ url: url, params: { parentId: record.id } }, { withToken: true }).then(async (res) => {
        if (res.result > 0) {
            message.info("该字典存在子项,不能删除！")
        }
        else {
            const res = await del(record.id)
            if (res.result == 1) {
                message.success('删除成功')
                datalist.value.splice(datalist.value.indexOf(record), 1)
            } else {
                message.error('删除失败' + res.message)
            }
        }
    })
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
