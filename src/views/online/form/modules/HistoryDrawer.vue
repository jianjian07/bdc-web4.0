<template>
    <a-drawer :title="title" :width="1200" :open="open" :closable="false" @close="onClose">
        <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
        </template>
        <a-table :columns="columns" :data-source="data">
            <template #action="{ record }">
                <a-space>
                    <!-- <a-tag color="processing" style="cursor: pointer;">详情</a-tag> -->
                    <a-tag color="error" style="cursor: pointer;" @click="revert(record.id)">还原</a-tag>
                </a-space>
            </template>
        </a-table>
    </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "表单历史列表"
    },
    dataId: {
        type: Number,
        default: 0
    }
});
let data = ref([])
const columns = [
    {
        title: '操作人',
        dataIndex: 'createBy',
        key: 'createBy',
    },
    {
        title: '操作时间',
        dataIndex: 'createTime',
        key: 'createTime',
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        slots: { customRender: 'action' },
    },
]
enum api {
    list = '/api/zrzy-form/log/list',
    revert = '/api/zrzy-form/log/revert',
}

const emit = defineEmits(["ok"])
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
});
loadData()

function loadData() {
    defHttp.get({ url: api.list, params: { dataId: props.dataId, pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then(res => {
        if (res.success) {
            pagination.value.total = res.result.total
            data.value = res.result.records
            console.log(res)
        }
    })
    //  emit("ok")
}
function revert(id: number) {
    defHttp.post({ url: api.revert, params: { id: id, dataId: props.dataId, type: 'form' } }, { withToken: true }).then(res => {
        if (res) {
            message.info("还原成功")
        }
    })
}
const onClose = () => {
    emit("ok")
};
</script>

<style scoped lang="less"></style>