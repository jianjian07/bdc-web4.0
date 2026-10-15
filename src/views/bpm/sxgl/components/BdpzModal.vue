<template>
    <a-row>
        <a-col :span="12">
            <a-form-item label="权利类型">
                <a-select :options="getDictItemsByCode('qllx')" allowClear style="width: 98%;" @change="onChangeQllx"
                    show-search optionFilterProp="label" v-model:value="nodeInfo.qllx">
                </a-select>
            </a-form-item>
        </a-col>
        <a-col :span="12">
            <a-space>
                <!-- <a-button type="primary" @click="onExport">导出表单配置</a-button>
                <a-button type="primary" @click="onupload">导入表单配置</a-button> -->
                <a-button type="primary" @click="onUnifiedAssign">统赋</a-button>
            </a-space>
        </a-col>
    </a-row>
    <BdList :nodeInfo="nodeInfo" :isBl="isBl"></BdList>
    <BtnList :nodeInfo="nodeInfo" :isBl="isBl"></BtnList>
    <UnifiedAssignModal v-if="unifiedAssignOpen" v-model:open="unifiedAssignOpen" :nodeInfo="nodeInfo"
        :isBl="props.isBl" />
    <!-- <a-form :model="flowNode" layout="inline" autocomplete="off" style="padding-top: 15px;">
        <a-form-item label="权利人分类" name="username">
            <a-select v-model:value="flowNode.qlrfl" :options="getDictItemsByCode('qlrfl')" allowClear
                style="width: 330px;">
            </a-select>
        </a-form-item>
        <a-form-item label="所属表单名称">
            <a-input v-model:value="flowNode.vfd" style="width: 200px;">
            </a-input>
        </a-form-item>
    </a-form> -->

</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BdList from '/@/views/bpm/sxgl/components/BdList.vue';
import BtnList from '/@/views/bpm/sxgl/components/BtnList.vue';
import UnifiedAssignModal from '/@/views/bpm/sxgl/components/UnifiedAssignModal.vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { message } from 'ant-design-vue';
const props = defineProps({
    lcid: {
        type: String,
        default: ""
    },
    jdid: {
        type: String,
        default: ""
    },
    qllx: {
        type: String,
        default: ""
    },
    jdmc: {
        type: String,
        default: ""
    },
    isBl: {
        type: Boolean,
        default: false
    }
});

let nodeInfo: any = ref({ lcid: '', jdid: '', qllx: '', jdmc: '' })
nodeInfo.value = JSON.parse(JSON.stringify(props))
console.log('nodeInfo.value', nodeInfo.value)

const unifiedAssignOpen = ref(false)

function onChangeQllx(value: String, option: any) {
    nodeInfo.value.qllx = value
}
watch(() => props.jdid, (newValue, _oldValue) => {

    nodeInfo.value.lcid = props.lcid
    nodeInfo.value.jdid = props.jdid
    nodeInfo.value.jdmc = props.jdmc
});

watch(() => props.lcid, (newValue, _oldValue) => {

    nodeInfo.value.lcid = props.lcid
    nodeInfo.value.jdid = props.jdid
    nodeInfo.value.jdmc = props.jdmc
});
/**
 * 导出
 */
function onExport() {
    message.info('后续开放功能')
}
/**
 * 导入
 */
function onupload() {
    message.info('后续开放功能')
}
/**
 * 打开统赋弹窗
 */
function onUnifiedAssign() {
    if (!nodeInfo.value.lcid || !nodeInfo.value.jdid) {
        message.warning('请先选择流程节点')
        return
    }
    if (!nodeInfo.value.qllx) {
        message.warning('请先选择权利类型')
        return
    }
    unifiedAssignOpen.value = true
}
</script>

<style scoped lang="less">
::v-deep(.ant-table) {
    .ant-table-cell {
        padding: 10px 5px;
    }
}
</style>
