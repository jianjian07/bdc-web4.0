<template>
    <div class="cc-container">
        <div style="line-height: 3em;">
            <a-row>
                <a-col :span="24" style="text-align: right;padding-right: 20px;">当前选中流程
                    【<span style="color:#1890ff;font-weight: 600;">
                        {{ aaa }}
                    </span>】
                </a-col>
                <a-col :span="24" style="text-align: right;padding-right: 20px;">
                    <a-button type="primary" :icon="h(ArrowRightOutlined)" size="small">创建流程</a-button>
                </a-col>
            </a-row>
            <CLCLB @select="onSelect"></CLCLB>
        </div>

        <div class="line"></div>
        <a-table :columns="columns" :data-source="dataSource" style="width: 100%;">

        </a-table>
    </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import CLCLB from "/@/views/components/LCLB.vue"
import { defHttp } from "/@/utils/http/axios";
import { ArrowRightOutlined } from '@ant-design/icons-vue';
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
        dataIndex: 'SLMC',
        key: 'SLMC',
    },
    {
        title: '创建时间',
        dataIndex: 'SLRQ',
        key: 'SLRQ',
    },
    {
        title: '当前环节',
        dataIndex: 'SLRQ',
        key: 'SLRQ',
    },
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
let aaa = ref('')

/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any) {
    aaa.value = process.title
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