<template>
    <div class="cc-container">
        <CLCLB @select="onSelect"></CLCLB>
        <div class="line"></div>
        <a-table :columns="columns" :data-source="dataSource">

        </a-table>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CLCLB from "/@/views/components/LCLB.vue"
import { defHttp } from "/@/utils/http/axios";
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
        dataIndex: 'SLBH',
        key: 'SLBH',
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
        debugger
        dataSource.value = res.result
    })
}

/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any) {
    console.log(process)
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