<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="6" :offset="0">
                    <a-form-item label="表单ID">
                        <a-input v-model:value="formData.id" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="6" :offset="0">
                    <a-form-item label="表单名称">
                        <a-input v-model:value="formData.formName" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="6" :offset="0">
                    <a-form-item label="表单编码">
                        <a-input v-model:value="formData.code" allowClear />
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
            <a-space>
                <a-button type="primary" @click="addData">
                    <template #icon>
                        <plus-outlined />
                    </template>
                    新增
                </a-button>
                <a-button type="primary" @click="handleExprotJson">
                    <template #icon>
                        <ExportOutlined />
                    </template>
                    导出
                </a-button>
                <a-upload name="file" v-model:file-list="fileList" :headers="{ authorization: 'authorization-text' }"
                    :showUploadList="false" :customRequest="handleImportJson" style="margin: auto 2px;">
                    <a-button>
                        <upload-outlined></upload-outlined>
                        导入
                    </a-button>
                </a-upload>
            </a-space>
            <a-alert type="info" show-icon style="margin: 5px 0px -2px;">
                <template #message>
                    {{ selectedAllKeys.length > 0 ? "已选中 " + selectedAllKeys.length + " 条记录" : "未选中任何数据" }}
                </template>
            </a-alert>
        </div>
        <a-table :row-selection="rowSelection" :columns="columns" rowKey="id" :data-source="datalist"
            :pagination="pagination" :loading="loading" @change="onChange($event, loadData)">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'isLocked'">
                    <a-tag :color="record.isLocked == 1 ? 'warning' : 'success'">
                        {{ record.isLocked == 1 ? '已锁定 ' + (record.lockedTime == null ? "" : record.lockedTime) : '未锁定'
                        }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="design(record)">设计</a>
                        <a v-if="record.isLocked == 1" @click="unLock(record)">解锁</a>
                        <a-dropdown>
                            <a class="ant-dropdown-link" @click.prevent>
                                更多
                                <DownOutlined />
                            </a>
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item>
                                        <a @click="editData(record)">编辑</a>
                                    </a-menu-item>
                                    <a-menu-item key="1">
                                        <CVfd :formId="record.id"></CVfd>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a @click="copyData(record)">复制</a>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a @click="revert(record)">回滚</a>
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
                        <!--                        <a @click="editData(record)">编辑</a>-->
                        <!--                        <a @click="design(record)">设计</a>-->
                        <!--&lt;!&ndash;                        <a @click="address(record)">地址</a>&ndash;&gt;-->
                        <!--                        <a @click="copyData(record)">复制</a>-->
                        <!--                        <a @click="revert(record.id)">回滚</a>-->
                        <!--                        &lt;!&ndash; <a @click="preview(record)">在线预览</a> &ndash;&gt;-->
                        <!--                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">-->
                        <!--                            <a>删除</a>-->
                        <!--                        </a-popconfirm>-->
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <form-add-modal ref="formModal" @handOver="handOver"></form-add-modal>
    <HistoryDrawer v-if="open" :open="open" :dataId="dataId" @ok="handOk" />
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined, DownOutlined, ExportOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { router } from "/@/router";
import { exprotJson, importJson } from './../utils/file';
import ClipboardJS from 'clipboard'
import HistoryDrawer from './modules/HistoryDrawer.vue';
import CVfd from './modules/Vfd.vue'
const formAddModal = defineAsyncComponent(() => import("/@/views/online/form/modules/formAddModal.vue"));
enum Api {
    copyUrl = '/api/zrzy-form/form/copyData',
    lockFormUrl = '/api/zrzy-form/form/lockForm',
    unlockFormUrl = '/api/zrzy-form/form/unlockForm',
    delUrl = '/api/zrzy-form/form/delete'
}
const columns = [
    { title: "ID", dataIndex: "id", width: 200 },
    { title: "表单名称", dataIndex: "formName", ellipsis: true },
    { title: "表单编码", dataIndex: "code", width: 200 },
    // { title: "表单分类", dataIndex: "typeName", width: 220 },
    { title: "分类编码", dataIndex: "formType", width: 120 },
    { title: "是否锁定", dataIndex: "isLocked", width: 150 },
    { title: "加锁时间", dataIndex: "lockedTime", ellipsis: true, width: 0 },
    { title: "修改时间", dataIndex: "updateTime", width: 140 },
    { title: '操作', key: 'action', width: 180, fixed: 'right', }
]
let datalist: any = ref([]);
let formData: any = ref({ formName: '', code: '', id: '' });
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
let loading = ref(false)
let dataId = ref()
let open = ref(false)
/**
 * 回滚
*/
function revert(record: any) {
    dataId.value = record.id
    open.value = true
}
function handOk() {
    open.value = false
}
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
    loading.value = true
    let url = '/api/zrzy-form/form/list'
    defHttp.post({ url: url, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }, data: { id: formData.value.id, code: formData.value.code, formName: formData.value.formName } }, { withToken: true }).then((res) => {
        if (res.success) {
            datalist.value = res.result.records
            pagination.value.total = res.result.total
        }

        loading.value = false
    }).catch(err => {
        loading.value = false
        console.info(err)
    })
}
/**
 * 表单分类改变
*/
function onSelect(_value: any, node: any, _extra: any) {
    // if (_value == undefined) {
    //     formTypeValue.value = ''
    // } else {
    //     const array: any = node.children;
    //     let arrType: any = []
    //     if (node.children != undefined && array.length > 0) {
    //         array.forEach((item: any) => {
    //             arrType.push("'" + item.dictCode + "'")
    //         });
    //     }
    //     const selectValue = "'" + _value + "'"
    //     if (arrType.length == 0) {
    //         formTypeValue.value = selectValue
    //     } else {
    //         arrType.push(selectValue)
    //         formTypeValue.value = arrType.join(',')
    //     }
    // }
    formTypeValue.value = _value
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
    formData.value = {
        id: '',
        formName: '',
        code: '',
        formType: ''
    }
    loadData('query')
}
function design(record: any) {
    if (record.isLocked == 1) {
        message.error('该表单已锁定，无法编辑')
    } else {
        defHttp.post({ url: Api.lockFormUrl, params: { id: record.id } }, { withToken: true }).then((res) => {
            if (res.success) {
                record.isLocked = 1
                record.lockedTime = new Date().toLocaleString()
                router.push("/online/form/design" + '/' + record.id)
            } else {
                message.error(res?.message)
            }
        }).catch(_err => {
        })
    }
}
/**
 * 解锁
 * @param record
 */
function unLock(record: any) {
    defHttp.post({ url: Api.unlockFormUrl, params: { id: record.id } }, { withToken: true }).then((res) => {
        if (res.success) {
            record.isLocked = 0
        } else {
            message.error(res?.message)
        }
    }).catch(_err => {
    })
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
 * @param val { isAutoOpenDesign: boolean, data: { code: '', formName: '' } }
*/
function handOver(val) {
    loadData()
    // 是否默认新建的表单设计
    if (val.isAutoOpenDesign) {
        // design(val.data)
    }
}
let selectedAllKeys: any = ref([])
const rowSelection: any = {
    onChange: (selectedRowKeys: string[]) => {
        selectedAllKeys.value = selectedRowKeys;
    }
};
/**
 * 导出json
 */
function handleExprotJson() {
    const params = { ids: selectedAllKeys.value.join(',') }
    exprotJson(params, "表单")
}
/**
 * 导入json
 */
let fileList: any = ref([])

// 自定义上传
const handleImportJson = () => {
    importJson(fileList.value, { formType: 'form' }, loadData)
};
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
