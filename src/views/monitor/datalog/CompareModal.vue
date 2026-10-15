<template>
    <a-drawer v-model:open="open" :title="title" @close="onClose" :width="720">
        <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
        </template>
        <a-table bordered :columns="columns" :dataSource="dataSource" :rowClassName="setDataCss"
            :pagination="{ pageSize: 20 }">
            <template #dataVersionTitle1="{ record }">
                <Icon icon="icon-park-outline:grinning-face" /> 版本:{{ dataVersion1Num }}
            </template>
            <template #dataVersionTitle2="{ record }">
                <Icon icon="icon-park-outline:grinning-face" /> 版本:{{ dataVersion2Num }}
            </template>
        </a-table>
    </a-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "弹出框"
    },
    data: {
        type: Object,
        default: {}
    }
})
let data = ref<any>(props.data)
let open = ref(props.open)
const emit = defineEmits(["ok"])
//定义表格列
const columns = [
    {
        title: '字段名',
        dataIndex: 'code',
        width: 20,
        align: 'left',
    },
    {
        dataIndex: 'dataVersion1',
        align: 'left',
        width: 60,
        slots: { title: 'dataVersionTitle1' },
    },
    {
        align: 'left',
        dataIndex: 'dataVersion2',
        width: 60,
        slots: { title: 'dataVersionTitle2' },
    },
];
let dataVersion1Num = ref('');
let dataVersion2Num = ref('');
let dataSource: any = ref([]);
initData();
/**
 * 初始化数据
 */
function initData() {
    dataVersion1Num.value = data.value[0].dataVersion;
    dataVersion2Num.value = data.value[1].dataVersion;
    let obj1 = JSON.parse(data.value[0].dataContent);
    let obj2 = JSON.parse(data.value[1].dataContent);
    for (var item1 in obj1) {
        for (var item2 in obj2) {
            if (item1 == item2) {
                dataSource.value.push({
                    code: item1,
                    dataVersion1: obj1[item1],
                    dataVersion2: obj2[item2],
                });
            }
        }
    }
}
/**
 * 设置行颜色
 * @param record
 * @returns
 */
function setDataCss(record) {
    let className = 'trcolor';
    const dataVersion1 = record.dataVersion1;
    const dataVersion2 = record.dataVersion2;
    if (dataVersion1 != dataVersion2) {
        return className;
    }
}
function onClose() {
    // 执行取消
    emit("ok")
}
</script>

<style lang="less" scoped>
::v-deep(.ant-table) {
    .trcolor {
        color: red;
    }
}
</style>
