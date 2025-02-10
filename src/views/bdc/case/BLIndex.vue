<template>
    <div class="cc-container">
        <div>
            <div style="line-height: 3em; background-color: #fff;padding: 10px 0px;">
                <div style="text-align: right;padding-right: 20px;">
                    当前选中流程
                    【<span style="color:#1890ff;font-weight: 600;">
                        {{ processInfo.dictName }}
                    </span>】
                </div>
                <div style="text-align: right;padding-right: 20px;">
                    <a-button type="primary" :icon="h(ArrowRightOutlined)" size="small"
                        @click="handleAdd">创建流程</a-button>
                </div>
            </div>
            <div style="margin-top: 8px;line-height: 3em; background-color: #fff">
                <CLCLBBL @select="onSelect"></CLCLBBL>
            </div>
        </div>

        <div style="width: 100%;background-color: #fff;margin-left:8px;">
            <a-table :columns="columns" :data-source="dataSource" style="width: 100%;">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'action'">
                        <a-space>
                            <template #split>
                                <a-divider type="vertical" />
                            </template>
                            <a @click="edit(record)">编辑</a>
                            <a @click="handleDelete(record.slbh, record.ajmc)">删除</a>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, h, createVNode } from "vue";
import CLCLBBL from "/@/views/components/LCLBBL.vue"
import { defHttp } from "/@/utils/http/axios";
import { ArrowRightOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { addFlowBL } from "../utils/case";
import { Modal, message } from "ant-design-vue";
import { router } from "/@/router"
enum api {
    getProcessList = "/api/zrzy-bdc/bdc/slsq/list",
    delUrl = "/api/zrzy-bdc/bdcdj/lcsc/deleteWfAndBusinessData"
}
// 案卷编号
// 案卷名称
// 创建时间
// 当前环节
// 操作
const columns = [
    {
        title: '案卷编号',
        dataIndex: 'slbh',
        key: 'slbh',
    },
    {
        title: '案卷名称',
        dataIndex: 'ajmc',
        key: 'ajmc',
    },
    {
        title: '创建时间',
        dataIndex: 'slsj',
        key: 'slsj',
    },
    {
        title: '操作',
        with: 180,
        key: 'action'
    }
]
let dataSource = ref([])
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})
loadData()
function loadData() {
    defHttp.post({ url: api.getProcessList, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize, ajlx: 2 } }, { withToken: true }).then((res) => {
        dataSource.value = res.result.records
    })
}
let processInfo: any = ref('')
/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any) {
    // debugger
    processInfo.value = process
}
/**
 * 创建流程
 */
function handleAdd() {
    // 跳转至创建流程页面
    const params = {
        // regType: '0101',
        lcid: processInfo.value.dictCode,
        // processKey: processInfo.value.value
    }
    // debugger
    addFlowBL(params)
}
function edit(record: any) {
    router.push({ path: '/bdc/blcasedoing', query: { slbh: record.slbh } });
}
/**
 * 删除
 * @param slbh 
 */
function handleDelete(slbh: string, ajmc: string) {
    Modal.confirm({
        title: '确定要删除该案卷吗?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '案卷名称：' + ajmc,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            defHttp.delete(
                { url: api.delUrl, params: { slbh: slbh } }, { withToken: true }
            ).then((res: any) => {
                if (res?.success) {
                    message.success('删除成功！')
                    loadData()
                } else {
                    message.warning(res?.message)
                }
            })
        },
        onCancel() {
        },
    });
}
</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.line {
    width: 1px;
    height: 650px;
    background: linear-gradient(244deg, rgba(255, 255, 255, 0) 0%, rgba(24, 144, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
}
</style>