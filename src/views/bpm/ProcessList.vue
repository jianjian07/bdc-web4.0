<template>
    <div style="padding: 20px 20px 0px 20px;">
        <a-form :label-col="{ style: { width: '100px' } }">
            <a-row>
                <a-col :span="8">
                    <a-form-item label="流程ID">
                        <a-input v-model:value="processData.id" allow-clear />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="流程名称">
                        <a-input v-model:value="processData.processName" allow-clear />
                    </a-form-item>
                </a-col>
                <a-col :span="8">
                    <a-form-item label="流程编码">
                        <a-input v-model:value="processData.processKey" allow-clear />
                    </a-form-item>
                </a-col>
                <!-- <a-col :span="8">
                    <a-form-item label="流程类型">
                        <a-select ref="select" v-model:value="processData.processType" style="width: 100%"
                            :options="dictOptions" :field-names="{ label: 'name', value: 'code' }" allow-clear>
                        </a-select>
                    </a-form-item>
                </a-col> -->
            </a-row>
            <a-row>
                <a-col :span="8">
                    <a-form-item label="流程状态">
                        <a-select v-model:value="processData.processStatus" allow-clear>
                            <a-select-option value="1">已发布</a-select-option>
                            <a-select-option value="0">未发布</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="8" style="padding-left: 100px;">
                    <a-space>
                        <a-button type="primary" :icon="h(SearchOutlined)" @click="loadData">查询</a-button>
                        <a-button :icon="h(RetweetOutlined)" @click="clear">重置</a-button>
                    </a-space>

                </a-col>
            </a-row>
        </a-form>

    </div>
    <div style="padding:0 20px;">
        <a-button type="primary" :icon="h(PlusOutlined)" @click="handleAdd">新建流程</a-button>
        <a-button style="margin-left: 8px" :icon="h(UploadOutlined)" @click="handleUpload">上传流程</a-button>
        <a-alert show-icon type="info" style="margin: 10px 0px;">
            <template #message>
                已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}&nbsp;</a>项
                <a style="margin-left: 24px" @click="onClearSelected">清空</a>
            </template>
        </a-alert>

        <a-table :columns="columns" :data-source="processList" :pagination="pagination" @change="onTableChange"
            :row-selection="rowSelection" row-key="id" @resizeColumn="handleResizeColumn" :loading="loading">
            <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex == 'index'">
                    {{ index + 1 }}
                </template>
                <template v-if="column.key === 'name'">
                    <a>
                        {{ record.name }}
                    </a>
                </template>
                <template v-else-if="column.key === 'processType'">
                    {{ getLabelByDictCode(record.processType) }}
                </template>
                <template v-else-if="column.key === 'processStatus'">
                    <span>
                        <a-tag :color="record.processStatus === 1 ? 'green' : 'volcano'">
                            {{ record.processStatus === 1 ? '已发布' : '未发布' }}
                        </a-tag>
                    </span>
                </template>
                <template v-else-if="column.key === 'action'">
                    <span>
                        <a-space>
                            <template #split>
                                <a-divider type="vertical" />
                            </template>
                            <a @click="handleAction(record, 'sj')">设计</a>
                            <!-- <a @click="handleAction(record, 'pz')">配置</a> -->
                            <a @click="handleAction(record, 'fb')">发布</a>
                            <a-dropdown>
                                <a class="ant-dropdown-link" @click.prevent>
                                    更多
                                    <DownOutlined />
                                </a>
                                <template #overlay>
                                    <a-menu>
                                        <a-menu-item key="1" @click="handleAction(record, 'jk')">版本监控</a-menu-item>
                                        <a-menu-item key="2" @click="handleAction(record, 'fz')">流程复制</a-menu-item>
                                        <a-menu-item key="3" @click="handleAction(record, 'xz')">下载流程</a-menu-item>
                                        <a-menu-item key="4" @click="handleAction(record, 'sc')">流程删除</a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
                        </a-space>

                    </span>
                </template>
            </template>
        </a-table>
    </div>
    <a-modal v-model:open="open" title="版本监控" width="100%" wrap-class-name="full-modal" :footer="null">
        <CRViewer ref="rView" v-if="open" id="2058741547024576514" :p-router="router" :p-route="route"
            :p-formData="{ bdc: bdc, key: processKey }" v-bind="attrs"></CRViewer>
    </a-modal>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, h, createVNode, useAttrs, watch } from 'vue';
import { SearchOutlined, PlusOutlined, DownOutlined, RetweetOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { message, Modal, type TableColumnsType } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { router, currentRoute } from "/@/router";
import * as bdc from '/@/views/bdc/public/bdc'
const attrs = useAttrs()
const route = currentRoute;
// 选中的值
let selectedRowKeys = ref<any>([])
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})
let fieldInfo: any = ref([]);
let orderInfo: any = ref([]);
let loading = ref(false)
let processData = ref({
    id: '',
    processName: '',
    processKey: '',
    processType: '',
    processStatus: ''
})
let open = ref(false)
const columns = ref<TableColumnsType>([
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 80,
    },
    {
        title: '流程ID',
        dataIndex: 'id',
        key: 'id',
        width: 200,
    },
    {
        title: '流程名称',
        dataIndex: 'processName',
        key: 'processName',
        width: 400,
    },
    {
        title: '流程编码',
        dataIndex: 'processKey',
        key: 'processKey',
        resizable: true,
        width: 200,
        minWidth: 200,
        maxWidth: 400,
    },
    // {
    //     title: '流程类型',
    //     dataIndex: 'processType',
    //     key: 'processType',
    // },
    {
        title: '流程状态',
        dataIndex: 'processStatus',
        key: 'processStatus',
        sorter: { multiple: 1 }, // 启用后端排序
    },
    {
        title: '修改时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        sorter: { multiple: 2 }, // 启用后端排序
    },
    {
        title: '操作',
        key: 'action',
        width: 300,
    },
]);
let processList = ref([])
/**
 * 点击操作
 * @param record 行数据
 * @param type 操作类型
 */
function handleAction(record: any, type: string) {
    switch (type) {
        case 'sj':
            handleDesign(record)
            break;
        case 'pz':
            handleConfig(record)
            break;
        case 'fb':
            deployProcess(record)
            break;
        case 'jk':
            handleVersionMonitor(record)
            break;
        case 'fz':
            copyProcess(record)
            break;
        case 'xz':
            downloadProcess(record)
            break;
        case 'sc':
            delProcess(record)
            break;
    }
}

/**
 * 下载流程
 * @param record 行数据
 */
function downloadProcess(record: any) {
    defHttp.get(
        { url: '/bpmapi/act/process/extActProcess/exportBpmn', params: { id: record.id }, responseType: 'blob' },
        { withToken: true }
    ).then((res: any) => {
        if (!res || res.size === 0) {
            message.error('下载失败')
            return
        }
        const blob = new Blob([res])
        const elink = document.createElement('a')
        elink.download = (record.processKey || 'process') + '.bpmn'
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
    }).catch(() => {
        message.error('下载失败')
    })
}
/**
 * 上传流程
 */
function handleUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.bpmn'
    input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await defHttp.post(
                { url: '/bpmapi/act/process/extActProcess/importBpmn', data: formData, headers: { 'Content-Type': 'multipart/form-data' } },
                { withToken: true }
            )
            if (res.success) {
                message.success(res.message || '上传成功')
                loadData()
            } else {
                message.error(res.message || '上传失败')
            }
        } catch (e) {
            message.error('上传失败')
        }
    }
    input.click()
}
/**
 * 新增流程
 */
function handleAdd() {
    // 实现设计逻辑
    router.push("/bpm/design" + '/' + Date.now())
}
// 设计流程
function handleDesign(record: any) {
    // 实现设计逻辑
    router.push("/bpm/design" + '/' + record.id)
}

// 配置流程
function handleConfig(record: any) {
    // 实现配置逻辑
}
let processKey = ref('')
// 版本监控
function handleVersionMonitor(record: any) {
    // 实现版本监控逻辑
    processKey.value = record.processKey
    open.value = true
}
/**
 * 复制流程
 * @param record 行数据
 */
function copyProcess(record: any) {
    Modal.confirm({
        title: '系统提示',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, '确定要「复制」该流程吗?'),
        onOk() {
            defHttp.get({ url: '/bpmapi/bpm/design/copyProcess', params: { id: record.id } }, { withToken: true }).then((res) => {
                if (res.success) {
                    message.success('复制成功')
                    loadData()
                }
                else {
                    message.error(res.message)
                }
            })
        },
        onCancel() {

        }
    });
}
/**
 * 发布流程
 * @param record 行数据
 */
function deployProcess(record: any) {
    Modal.confirm({
        title: '系统提示',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, '确定要「发布」该流程吗?'),
        onOk() {
            defHttp.get({ url: '/bpmapi/bpm/design/deployProcess', params: { id: record.id } }, { withToken: true }).then((res) => {
                if (res.success) {
                    message.success(res.message)
                    record.processStatus = 1
                }
                else {
                    message.error(res.message)
                }
            })
        },
        onCancel() {

        }
    });
}
/**
 * 删除流程
 * @param record 行数据
 */
function delProcess(record: any) {
    if (record.processStatus == 1) {
        message.warning('该流程已发布，不能删除！！！')
        return
    } else {
        Modal.confirm({
            title: '系统提示',
            icon: createVNode(ExclamationCircleOutlined),
            content: createVNode('div', { style: 'color:red;' }, '确定要「删除」该流程吗?'),
            onOk() {
                defHttp.get({ url: '/bpmapi/bpm/design/delProcess', params: { id: record.id } }, { withToken: true }).then((res) => {
                    if (res.success) {
                        message.success('删除成功')
                        loadData()
                    }
                    else {
                        message.error(res.message)
                    }
                })
            },
            onCancel() {

            }
        });

    }
}
loadData()
/**
 * 加载数据
 */
function loadData() {

    loading.value = true
    defHttp.get({ url: '/bpmapi/bpm/design/list', params: { field: fieldInfo.value.join(','), order: orderInfo.value.join(','), pageNo: pagination.value.current, pageSize: pagination.value.pageSize, ...processData.value } }, { withToken: true }).then((res) => {
        if (res.success) {
            const { result } = res
            processList.value = result.records
            pagination.value.total = result.total
            loading.value = false
        }
    })
}
watch(open, (val) => {
    if (!val) {
        loadData();
    }
});
/**
 * 重置
 */
function clear() {
    processData.value = {
        processName: '',
        processKey: '',
        processType: '',
        processStatus: ''
    }
    loadData()
}
// 行选择
const rowSelection = computed(() => {
    return {
        type: 'checkbox',
        selectedRowKeys: selectedRowKeys.value,
        onChange: (rowKeys, rows) => {
            selectedRowKeys.value = rowKeys
        },
    }
})
/**
 * 清空选中
 */
function onClearSelected() {
    selectedRowKeys.value = []
}

function onTableChange(pag, filters, sorter) {
    pagination.value = pag
    fieldInfo.value = []
    orderInfo.value = []
    if (Array.isArray(sorter)) {
        for (let i = 0; i < sorter.length; i++) {
            fieldInfo.value.push(sorter[i].field)
            orderInfo.value.push(sorter[i].order)
        }

    } else {
        fieldInfo.value.push(sorter.field)
        orderInfo.value.push(sorter.order)
    }
    loadData()
}
function handleResizeColumn(w, col) {
    col.width = w;
}
onMounted(async () => {
    // await userStore.initToken()
})

let dictOptions = ref([])
getDictLcfl()

async function getDictLcfl() {
    const i = await defHttp.get(
        { url: '/api/zrzy-bdc/flow/sxml/list', params: { type: 1 } },
        { withToken: true }
    );
    dictOptions.value = i.result || []; // 更简洁
}
/**
 * 数据字典获取标题
 * @param dict
 * @param value
 */
function getLabelByDictCode(code: any) {
    if (!code) {
        return ''
    }
    const item = dictOptions.value.find(t => t.code == code)
    return item?.name || ''
}
</script>
<style lang="less">
.full-modal {
    .ant-modal {
        max-width: 100%;
        top: 0;
        padding-bottom: 0;
        margin: 0;
    }

    .ant-modal-content {
        display: flex;
        flex-direction: column;
        height: calc(100vh);
    }

    .ant-modal-body {
        flex: 1;
    }
}
</style>