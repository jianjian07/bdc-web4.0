<template>
    <a-form :model="flowInfo" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
        <a-form-item label="流程ID" name="lcid">
            <a-input v-model:value="flowInfo.lcid" />
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
            <a-select v-model:value="flowInfo.gbdjlx" :options="getDictItemsByCode('djlx')" />
        </a-form-item>
        <a-form-item label="是否补录流程">
            <a-switch v-model:checked="flowInfo.bllc" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6, span: 16 }">
            <a-button type="primary" @click="handleAdd">保存</a-button>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
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

flowInfo.value.lcid = props.lcid;
watch(() => props.lcid, (newValue, _oldValue) => {
    flowInfo.value.lcid = newValue
    getFlowInfo(newValue)
});
const getFlowInfo = (lcid: string) => {
    defHttp.get({ url: api.queryByLcidUrl, params: { lcid: lcid } }, { withToken: true }).then((res) => {
        if (res.success) {
            flowInfo.value = res.result
        } else {
            flowInfo.value = { lcid: flowInfo.value.lcid }
        }
    })
}
function handleAdd() {
    defHttp.post({ url: api.saveUrl, data: flowInfo.value }, { withToken: true }).then((res) => {
        if (res.success) {
            message.success("保存成功")
        } else {
            message.error("保存失败")
        }
    })
}

</script>

<style scoped lang="less"></style>