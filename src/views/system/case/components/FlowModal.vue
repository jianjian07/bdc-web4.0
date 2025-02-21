<template>
    <a-form :model="flowInfo" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
        <a-form-item label="流程ID" name="lcid">
            <a-input v-model:value="flowInfo.lcid" readOnly />
        </a-form-item>
        <!-- <a-form-item label="流程分类" name="password">
            <a-select v-model:value="flowInfo.password" :options="getDictItemsByCode('bpm_process_type')" />
        </a-form-item> -->
        <a-form-item label="流程名称">
            <a-input v-model:value="flowInfo.lcmc" />
        </a-form-item>
        <a-form-item label="登记大类">
            <a-input v-model:value="flowInfo.djdl" />
        </a-form-item>
        <a-form-item label="RegType" name="regType" :rules="[{ required: true, message: '请输入登记类型' }]">
            <a-input v-model:value="flowInfo.regType" />
        </a-form-item>
        <a-form-item label="显示类型">
            <a-input v-model:value="flowInfo.xslx" />
        </a-form-item>
        <a-form-item label="国标登记类型">
            <a-input v-model:value="flowInfo.gbdjlx" />
        </a-form-item>
        <a-form-item label="流程前缀(补录)">
            <a-input v-model:value="flowInfo.prefix" />
        </a-form-item>
        <!-- <a-form-item label="国标登记类型">
            <a-select v-model:value="flowInfo.gbdjlx" :options="getDictItemsByCode('gbdjlx')" mode="multiple" />
        </a-form-item> -->
        <!-- <a-form-item label="是否补录流程">
            <a-switch v-model:checked="flowInfo.bllc" />
        </a-form-item> -->
        <a-form-item :wrapper-col="{ offset: 6, span: 16 }">
            <a-button type="primary" @click="handleAdd">保存</a-button>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
// import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
const props = defineProps({
    lcid: {
        type: String,
        default: ""
    }
})
enum api {
    queryByLcidUrl = "/api/zrzy-bdc/flow/flowConfig/queryByLcid",
    saveUrl = "/api/zrzy-bdc/flow/flowConfig/save"
}
let flowInfo: any = ref({
    username: "",
    password: "",
    remember: true
});

const emit = defineEmits(['setBaseInfo'])

flowInfo.value.lcid = props.lcid;
getFlowInfo(props.lcid)
function getFlowInfo(lcid: string) {
    defHttp.get({ url: api.queryByLcidUrl, params: { lcid: lcid } }, { withToken: true }).then((res) => {
        if (res.success) {
            flowInfo.value = res.result
        } else {
            flowInfo.value = { lcid: flowInfo.value.lcid }
        }
        emit('setBaseInfo', flowInfo.value)
    })
}
function handleAdd() {
    defHttp.post({ url: api.saveUrl, data: flowInfo.value }, { withToken: true }).then((res) => {
        if (res.success) {
            message.success("保存成功")
            emit('setBaseInfo', flowInfo.value)
        } else {
            message.error("保存失败")
        }
    })
}
watch(() => props.lcid, (newValue, _oldValue) => {
    flowInfo.value.lcid = newValue
    getFlowInfo(newValue)
});
</script>

<style scoped lang="less"></style>