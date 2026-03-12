<template>
    <CBpmView v-if="processInstanceId != ''" :procInstId="processInstanceId"></CBpmView>
    <a-card title="流程历史跟踪">
        <a-table :columns="columns" :data-source="tableData" :loading="loading" :scroll="{ x: 1300 }" row-key="index"
            size="small" bordered>
            <template #bodyCell="{ column, record, index }">
                <div v-if="column.dataIndex == 'index'" style="text-align: center">
                    {{ index + 1 }}
                </div>
                <div v-if="column.dataIndex == 'czjg'">
                    {{ getDictItemsByCode('shyjczjg').find(f => f.value == record[column.dataIndex])?.label }}
                </div>
                <template v-if="column.key === 'yjzt'">
                    <span>
                        <a-space>
                            <a-tag color="orange" v-if="record.yjzt == 1">
                                <template #icon>
                                    <RollbackOutlined />
                                </template>
                                预警
                            </a-tag>
                            <a-tag color="red" v-else-if="record.yjzt == 2">
                                <template #icon>
                                    <AlertOutlined />
                                </template>
                                超时
                            </a-tag>
                            <a-tag color="green" v-else>正常</a-tag>
                        </a-space>
                    </span>
                </template>
            </template>
        </a-table>
    </a-card>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { onMounted, ref } from 'vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { currentRoute } from "/@/router"

const props = defineProps({
    processInstanceId: {
        type: String,
        default: ''
    },
    formData: {
        type: Object,
        default: null
    }
})
const route = currentRoute;
// 表格loading
let loading = ref<boolean>(false)
// 表格数据
let tableData = ref<any>([])
// 表头
const columns = [{
    title: '#',
    dataIndex: 'index',
    key: 'index',
    width: 40,
}, {
    title: '节点名称',
    dataIndex: 'jdmc',
    key: 'jdmc',
    width: 100
}, {
    title: '节点id',
    dataIndex: 'jdid',
    key: 'jdid',
    width: 150
}, {
    title: '状态',
    dataIndex: 'yjzt',
    key: 'yjzt',
    width: 80
}, {
    title: '开始时间',
    dataIndex: 'blkssj',
    key: 'blkssj',
    width: 150
}, {
    title: '结束时间',
    dataIndex: 'bljssj',
    key: 'bljssj',
    width: 150
}, {
    title: '负责人',
    dataIndex: 'blr',
    key: 'blr',
    width: 100
}, {
    title: '处理结果',
    dataIndex: 'czjg',
    key: 'czjg'
}, {
    title: '处理意见',
    fixed: 'right',
    width: 250,
    dataIndex: 'shyj',
    key: 'shyj',
    ellipse: true
}
]
/**
 * 加载表格数据
 */
function initTableData() {
    loading.value = true
    let slbh = route.query.slbh || props.formData?.slbh
    defHttp.get({ url: '/api/zrzy-bdc/bdc/public/getYwShBySlbh', params: { slbh: slbh } }, { withToken: true }).then((res) => {
        if (res && res.success) {
            tableData.value = res.result
        } else {
            message.warning(res?.message)
        }
        loading.value = false
    })
}
onMounted(() => {
    initTableData()
})
</script>

<style scoped lang="less"></style>