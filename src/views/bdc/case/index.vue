<template>
    <div class="cc-container">
        <div>
            <div style="line-height: 3em; background-color: #fff;padding: 10px 0px;">
                <div style="text-align: right;padding-right: 20px;">
                    当前选中流程
                    【<span style="color:#1890ff;font-weight: 600;">
                        {{ processInfo.title }}
                    </span>】
                </div>
                <div style="text-align: right;padding-right: 20px;">
                    <a-button type="primary" :icon="h(ArrowRightOutlined)" size="small"
                        @click="handleAdd">创建流程</a-button>
                </div>
            </div>
            <div style="margin-top: 8px;line-height: 3em; background-color: #fff">
                <CLCLB @select="onSelect"></CLCLB>
            </div>
        </div>

        <div style="width: 100%;background-color: #fff;margin-left:8px;">
            <a-table :columns="columns" :data-source="dataSource" style="width: 100%;">

            </a-table>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import CLCLB from "/@/views/components/LCLB.vue"
import { defHttp } from "/@/utils/http/axios";
import { ArrowRightOutlined } from '@ant-design/icons-vue';
import { addFlow } from "../utils/case";
enum api {
    getProcessList = "/api/zrzy-bdc/bdc/slsq/list"
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
    // {
    //     title: '当前环节',
    //     dataIndex: 'SLRQ',
    //     key: 'SLRQ',
    // },
    {
        title: '操作',
        key: 'action'
    }
]
let dataSource = ref([])
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})
a()
function a() {
    defHttp.post({ url: api.getProcessList, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then((res) => {
        dataSource.value = res.result.records
    })
}
let processInfo: any = ref('')

/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any) {
    processInfo.value = process
}
function handleAdd() {
    // 跳转至创建流程页面
    const params = {
        regType: '0101',
        lcid: processInfo.value.key,
        processKey: processInfo.value.value
    }
    addFlow(params)
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