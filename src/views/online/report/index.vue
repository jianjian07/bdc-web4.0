<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="6" :offset="0">
                    <a-form-item label="报表ID">
                        <a-input v-model:value="formData.id" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="6" :offset="0">
                    <a-form-item label="报表标题">
                        <a-input v-model:value="formData.title" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="6" :offset="0">
                    <a-form-item label="报表编码">
                        <a-input v-model:value="formData.code" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="searchData">
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
            <a-space>
                <a-button v-if="showCreate" type="primary" @click="addData">
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
                <a-upload name="file" v-model:file-list="fileList" :max-count="1"
                    :headers="{ authorization: 'authorization-text' }" :showUploadList="false"
                    :customRequest="handleImportJson" style="margin: auto 2px;">
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
            :pagination="pagination" @change="onChange($event, loadData)">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'isLoad' || column.dataIndex === 'isMybatis'">
                    <a-tag :color="record[column.dataIndex] === 1 ? 'green' : 'red'" style="padding: 0 15px;">
                        {{ record[column.dataIndex] === 1 ? '是' : '否' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="design(record)">设计</a>
                        <a @click="editData(record)">编辑</a>
                        <a-dropdown>
                            <a class="ant-dropdown-link" @click.prevent>
                                更多
                                <DownOutlined />
                            </a>
                            <template #overlay>
                                <a-menu>

                                    <a-menu-item>
                                        <a @click="preview(record)">预览</a>
                                    </a-menu-item>
                                    <!--                                    <a-menu-item>-->
                                    <!--                                        <a @click="previewTest(record)">测试预览2</a>-->
                                    <!--                                    </a-menu-item>-->
                                    <a-menu-item>
                                        <a @click="copyData(record)">复制</a>
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
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
    <report-modal v-if="open" :open="open" :data="data" :title="title" @ok="handOver"></report-modal>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted, defineAsyncComponent, computed } from "vue"
import { PlusOutlined, SearchOutlined, RedoOutlined, DownOutlined, ExportOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { router } from "/@/router";
import { exprotJson, importJson } from "../utils/file";
import { usePermissionStore } from "/@/store/modules/permission";
const permissionStore = usePermissionStore()
const showCreate = computed(() => permissionStore.showCreateBtn)
const ReportModal = defineAsyncComponent(() => import("/@/views/online/report/ReportModal.vue"));
const columns = [
    { title: "ID", dataIndex: "id", width: 200 },
    { title: "初始加载", dataIndex: "isLoad", width: 100 },
    { title: "编号", dataIndex: "code", width: 150 },
    { title: "报表标题", dataIndex: "title" },
    { title: "数据来源", dataIndex: "cType" },
    { title: "MyBatis", dataIndex: "isMybatis" },
    { title: "修改时间", dataIndex: "updateTime", width: 140 },
    { title: '操作', key: 'action', width: 180 }
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

enum Api {
    copyUrl = '/api/zrzy-form/form/report/copyData',
    delUrl = '/api/zrzy-form/form/report/delete',
    list = '/api/zrzy-form/form/report/pages',
}
/**
 * 表格数据加载
*/
async function loadData() {
    defHttp.post({ url: Api.list, data: { id: formData.value.id || '', code: formData.value.code || '', formName: formData.value.title || '' }, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then((res) => {
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
    pagination.value.current = 1
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
 * 测试预览
 * @param record
 */
function previewTest(record: any) {
    router.push('/online/report/viewOnline' + '/' + record.id)
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
    const params = { ids: selectedAllKeys.value.join(','), formType: 'report' }
    let title = "报表"
    if (!params.ids.includes(',')) {
        const foundItem = datalist.value.find(item => item.id === params.ids);
        if (foundItem) {
            title = foundItem.title;
        }
    }
    exprotJson(params, title)
}
/**
 * 导入json
 */
let fileList: any = ref([])

// 自定义上传
const handleImportJson = () => {
    importJson(fileList.value, { formType: 'report' }, "", loadData)
};
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
