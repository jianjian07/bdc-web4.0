<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="6" :offset="0">
                    <a-form-item label="表单分类">
                        <a-tree-select v-model:value="formData.formType" :tree-data="getDictItemsByCode('BDFL')"
                            allowClear @select="onSelect" @change="changeType">
                        </a-tree-select>
                    </a-form-item>
                </a-col>
                <a-col :span="6" :offset="0">
                    <a-form-item label="表单名称">
                        <a-input v-model:value="formData.formName" />
                    </a-form-item>
                </a-col>
                <a-col :span="6" :offset="0">
                    <a-form-item label="表单编码">
                        <a-input v-model:value="formData.code" />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="loadData('query')">
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
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="editData(record)">编辑</a>
                        <a @click="design(record)">设计</a>
                        <a @click="address(record)">地址</a>
                        <!--                        <a @click="onlineAddress(record)">地址2</a>-->
                        <a @click="copyData(record)">复制</a>
                        <a @click="preview(record)">在线预览</a>
                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <form-add-modal ref="formModal" @handOver="handOver"></form-add-modal>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { router } from "/@/router";
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
import ClipboardJS from 'clipboard'
const formAddModal = defineAsyncComponent(() => import("/@/views/online/form/modules/formAddModal.vue"));
enum Api {
    copyUrl = '/api/zrzy-form/form/copyData',
}
const columns = [
    { title: "表单名称", dataIndex: "formName", ellipsis: true },
    { title: "表单编码", dataIndex: "code", width: 150 },
    { title: "表单分类", dataIndex: "typeName", width: 220 },
    { title: "分类编码", dataIndex: "formType", width: 120 },
    { title: "创建时间", dataIndex: "createTime", width: 140 },
    { title: '操作', key: 'action', width: 400, fixed: 'right', }
]
let datalist: any = ref([]);
let formData: any = ref({ formName: '', code: '', formType: '' });
let formModal = ref(); // 新增弹窗
let formTypeValue = ref('');
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
async function loadData(type?: string | undefined) {
    // 解决翻页后查询不到的问题
    if (type == 'query') {
        pagination.value = {
            total: 0,
            current: 1,
            pageSize: 10,
        }
    }
    let url = '/magicapi/zrzy-form/magic/form/form/list'
    defHttp.post({ url: url, params: { formType: formTypeValue.value, code: formData.value.code, formName: formData.value.formName, page: pagination.value.current, size: pagination.value.pageSize } }, { withToken: false }).then((res) => {
        console.log("res.list", res.list)
        datalist.value = res.list
        pagination.value.total = res.total
    }).catch(err => {
        console.info(err)
    })
}
/**
 * 表单分类改变
*/
function onSelect(_value: any, node: any, _extra: any) {
    if (_value == undefined) {
        formTypeValue.value = ''
    } else {
        const array: any = node.children;
        let arrType: any = []
        if (node.children != undefined && array.length > 0) {
            array.forEach((item: any) => {
                arrType.push("'" + item.dict_code + "'")
            });
        }
        const selectValue = "'" + _value + "'"
        if (arrType.length == 0) {
            formTypeValue.value = selectValue
        } else {
            arrType.push(selectValue)
            formTypeValue.value = arrType.join(',')
        }
    }
    pagination.value.current = 1
    loadData()
}
function changeType(_value: any) {
    if (_value == undefined) {
        formTypeValue.value = ''
        pagination.value.current = 1
        loadData()
    }
}
/**
 * 重置
*/
function refreshData() {
    formData.value = {}
    loadData()
}
function design(record: any) {
    router.push("/online/form/design" + '/' + record.id)
}
function address(record: any) {
    const { formType, code } = record;
    // 待解决为IPv4地址
    const baseUrl = `http://${window.location.host}/workflow/publicForm?`;
    // let folder = "";
    // if (formType != null) {
    //     folder = formType + "/"
    // }
    // const filePath = `${folder}${code}`;
    // const url = `${baseUrl}filePath=${filePath}`
    const url = `${baseUrl}formCode=${code}`
    ClipboardJS.copy(url);
    message.success('实体vue url复制成功:' + url);
}

function onlineAddress(record: any) {
    const baseUrl = `http://${window.location.host}/workflow/publicOnlineForm?`;
    const url = `${baseUrl}formCode=${record.code}`
    ClipboardJS.copy(url);
    message.success('在线vue url复制成功:' + url);
}

/**
 * 复制表单
*/
function copyData(record: any) {
    defHttp.post({ url: Api.copyUrl, params: { id: record.id } }, { withToken: true }).then((res) => {
        if (res) {
            message.success('复制成功')
            loadData()
        } else {
            message.error('复制失败')
        }
    }).catch(err => {
        console.info(err)
    })
}
/**
 * 在线预览
 * @param record
 */
function preview(record: any) {
    router.push("/workflow/public/" + record.id + "?formCode=" + record.code)
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
    formModal.value.add()
}
/**
 * 编辑表单
*/
function editData(record) {
    formModal.value.edit(record)
}
/**
 * 删除表单
*/
function deleteData(record) {
    if (!record.id) return
    let url = '/magicapi/zrzy-form/magic/form/form/delete' // 删除
    defHttp.post({ url: url, params: { id: record.id } }, { withToken: false, joinParamsToUrl: true }).then((res) => {
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
 * @param val { isAutoOpenDesign: boolean, data: { code: '', formName: '' } }
*/
function handOver(val) {
    loadData()
    // 是否默认新建的表单设计
    if (val.isAutoOpenDesign) {
        // design(val.data)
    }
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
