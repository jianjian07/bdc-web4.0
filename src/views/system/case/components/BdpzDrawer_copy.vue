<template>
    <a-drawer :title="title" :width="1200" :open="open" :closable="false" @close="onClose">
        <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
            <a-button type="primary" @click="onOk">保存</a-button>
        </template>
        <a-form-item label="权利类型">
            <a-select v-model:value="flowNode.qllx" :options="getDictItemsByCode('qllx')" allowClear
                style="width: 330px;" @change="onChangeQllx">
            </a-select>
        </a-form-item>
        <BdList :nodeData="nodeInfo"></BdList>
        <BtnList :nodeData="nodeInfo"></BtnList>
        <a-form :model="flowNode" layout="inline" autocomplete="off" style="padding-top: 15px;">
            <a-form-item label="权利人分类" name="username">
                <a-select v-model:value="flowNode.qlrfl" :options="getDictItemsByCode('qlrfl')" allowClear
                    style="width: 330px;">
                </a-select>
            </a-form-item>
            <a-form-item label="所属表单名称">
                <a-input v-model:value="flowNode.vfd" style="width: 200px;">
                </a-input>
            </a-form-item>

            <a-form-item>

            </a-form-item>
        </a-form>
    </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BdList from '/@/views/system/case/components/BdList.vue';
import BtnList from '/@/views/system/case/components/BtnList.vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { defHttp } from '/@/utils/http/axios';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "弹出框"
    },
    nodeData: {
        type: Object
    }
});
enum api {
    add = '/api/zrzy-bdc/node/add',
    update = '/api/zrzy-bdc/node/update',
    delete = '/api/zrzy-bdc/node/delete',
    list = '/api/zrzy-bdc/node/list'
}
let nodeInfo: any = ref({ ...props.nodeData })
let flowNode: any = ref({ ...props.nodeData })
const emit = defineEmits(["ok"])
function onOk() {
    debugger
    defHttp.post({ url: api.add, data: flowNode.value }, { withToken: true }).then(res => {
        debugger
        console.log(res)
    })
    //  emit("ok")
}
const onClose = () => {
    emit("ok")
};
function onChangeQllx(value: String, option: any) {
    flowNode.qlrfl = ''
    nodeInfo.value.qllx = value
    flowNode.value.qllx = value
}
</script>

<style scoped lang="less">
::v-deep(.ant-table) {
    .ant-table-cell {
        padding: 10px 5px;
    }
}
</style>