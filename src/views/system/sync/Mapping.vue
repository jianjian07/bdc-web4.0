<template>
    <a-table :columns="columns" :data-source="dataSource" :pagination="false">
        <template #bodyCell="{ column, record }">


            <template v-if="column.dataIndex === 'action'">
                <PauseOutlined v-if="record['action'] == 'eq'" style="color: gray;" :rotate="90" />
                <CloseOutlined v-else-if="record['action'] == 'del'" style="color: red;" />
                <PlusOutlined v-else-if="record['action'] == 'add'" style="color: green;" />
                <ArrowRightOutlined v-else style="color: #1677ff;" />

                <!-- 左边有右边没有 +
                左边有右边有× -->
            </template>
        </template>
    </a-table>
</template>

<script setup lang="ts">
import { ArrowRightOutlined, PauseOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { defHttp } from "/@/utils/http/axios"
import { ref } from 'vue';
const props = defineProps({
    formData: {
        type: Object,
        default: {}
    }
});

const columns = [
    {
        title: '源对象',
        dataIndex: 'sourceColumn',
        align: 'center'
    },
    {

        title: '操作',
        dataIndex: 'action',
        width: '150px',
        align: 'center'
    },
    {
        title: '目标对象',
        dataIndex: 'targetColumn',
        align: 'center'
    },
];
let dataSource = ref([]);
// let dataSource1: any = [
//     {
//         column: "id",
//         content: "id"
//     },
//     {
//         column: "name1",
//         content: "id1"
//     }
// ];
loadData()
function loadData() {
    defHttp.post({
        url: '/api/zrzy-cdc/data/mapping/compare',
        data: {
            sourceDb: props.formData.source_db,
            targetDb: props.formData.target_db,
            sourceTable: props.formData.source_table,
            targetTable: props.formData.target_table,
        }
    }, { withToken: true }).then(res => {
        if (res.success) {
            dataSource.value = res.result;
        }
    })
}
// function findTargetColumn(column: String) {
//     const matched = dataSource1.filter(t => t.column == column);
//     return matched.length > 0 ? matched[0].column : '';
// }
</script>

<style scoped lang="less"></style>