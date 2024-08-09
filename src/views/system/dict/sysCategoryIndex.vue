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
            @change="onChange($event, loadData)" @expand="onExpand" :expandedRowKeys="expandedRowKeys"><template
                #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="editData(record)">编辑</a>
                        <a @click="design(record)">字典配置</a>
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
    <DictItemsList v-if="drawerOpen" :open="drawerOpen" :parentId="parentId" :data="dictData" @onClose="onClose" />
    <!-- </a-drawer> -->
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent, reactive } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { del, updateHasChild } from "/@/api/sys/dict";
const DictModal = defineAsyncComponent(() => import("/@/views/system/dict/components/dictModal.vue"));
const DictItemsList = defineAsyncComponent(() => import("/@/views/system/dict/components/dictItemsList.vue"));
const columns = [
    { title: "字典名称", dataIndex: "dictName" },
    { title: "字典编码", dataIndex: "dictCode" },
    { title: "说明", dataIndex: "description" },
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
    let url = '/magicapi/zrzy-form/magic/dict/list'
    defHttp.post({ url: url, params: { dict_code: formData.value.code || '', dict_name: formData.value.name || '', dict_type: 1, parent_id: "0", page: pagination.value.current, size: pagination.value.pageSize } }, { withToken: true }).then((res) => {

        const { list } = res;
        datalist.value = list
        for (let i = 0; i < list.length; i++) {
            if (list[i].hasChild == "1") {
                datalist.value[i].key = datalist.value[i].id
                datalist.value[i].children = []
            }
        }
        pagination.value.total = res.total


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
/*
* 查询
*/
function searchData() {
    pagination.value.current = 1
    loadData()
}
let drawerOpen = ref(false)
let parentId = ref("0")
let dictData = ref<any>()
function design(record: any) {
    dictData.value = record
    parentId.value = record.id
    drawerOpen.value = true
}
function onClose(value: any) {
    drawerOpen.value = false
    if (value.refreshParentPage) {
        dictData.value.children = value.children
    }
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
const expandedRowKeys = ref<any>([]);
function onExpand(expanded, record) {
    // let url = '/magicapi/zrzy-form/magic/dict/query'
    if (expanded) {
        expandedRowKeys.value.push(record.id);
        if (record.children.length > 0) {
            return
        } else {
            loadChildList(record)
            // defHttp.post({ url: url, params: { parent_id: record.id } }, { withToken: true }).then((res) => {
            //     let childList = res
            //     for (let i = 0; i < childList.length; i++) {
            //         if (childList[i].hasChild == "1") {
            //             childList[i].key = childList[i].id
            //             childList[i].children = []
            //         }
            //     }
            //     record.children = childList
            // }).catch(err => {
            //     console.info(err)
            // })
        }

    } else {
        let keyIndex = expandedRowKeys.value.indexOf(record.id);
        if (keyIndex >= 0) {
            expandedRowKeys.value.splice(keyIndex, 1);
        }
    }
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
    dataInfo.value = { parentId: "0", dictType: "1" }
    title.value = "新增字典"
    open.value = true
}
function handOk(value: any) {
    open.value = false
    let find = findNodeById(datalist.value, Number(dataInfo.value.parentId))
    loadChildList(find)
    // return
    // if (value.isAdd == true) {
    //     loadData()
    // }
}

function loadChildList(record) {
    let url = '/magicapi/zrzy-form/magic/dict/query'
    defHttp.post({ url: url, params: { parent_id: record.id } }, { withToken: true }).then((res) => {
        let childList = res
        for (let i = 0; i < childList.length; i++) {
            if (childList[i].hasChild == "1") {
                childList[i].key = childList[i].id
                childList[i].children = []
            }
        }
        record.children = childList
    }).catch(err => {
        console.info(err)
    })
}

/**
 * 根据id找节点
 * @param arr
 * @param key
 */
function findNodeById(arr, id) {
    for (let i = 0; i < arr.length; i++) {
        let node = arr[i];
        if (node.id === id) return node;
        if (node.children && node.children.length > 0) {
            let foundNode = findNodeById(node.children, id);
            if (foundNode) return foundNode;
        }
    }
    return null;
}

/**
 * 删除表单
*/
async function deleteData(record: any) {
    if (record.children != undefined) {
        message.info("该字典存在子项,不能删除！");
        return;
    } else {
        const res = await del(record.id)
        if (res == 1) {
            message.success('删除成功')
            if (record.parentId == "0") {
                datalist.value.splice(datalist.value.indexOf(record), 1)
            } else {
                const find = findParent(datalist.value, record.parentId)
                if (find) {
                    if (dataInfo.value.children.length > 1) {
                        dataInfo.value.children.splice(dataInfo.value.children.indexOf(record), 1)
                    } else {
                        delete dataInfo.value["children"];
                        //将父级的children置空
                        updateHasChild(dataInfo.value.id, "0")
                    }
                }
            }
        }
    }
}
// 递归查找上级
const findParent = (list: any[], id: string) => {
    for (let item of list) {
        if (item.id == id) {
            dataInfo.value = item
            return true
        }
        if (item.children && item.children.length > 0) {
            let isFind = findParent(item.children, id)
            if (isFind) {
                dataInfo.value = item
                return true
            }
        }
    }
    return false
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
