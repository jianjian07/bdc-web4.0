<template>
    <a-row>
        <a-col :span="3">
            <a-tabs default-active-key @change="nodeClick" size="small" tab-position="left" class="tab-left">
                <a-tab-pane class="tab-panel" v-for="item in nodeList" :key="item.processNodeCode"
                    :tab="item.processNodeName" />
            </a-tabs>
        </a-col>
        <a-col :span="21">
            <BdpzModal :lcid="lcid" :jdid="jdid"></BdpzModal>
        </a-col>
    </a-row>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import BdpzModal from '/@/views/system/case/components/BdpzModal.vue';
let props = defineProps({
    lcid: {
        type: String,
        default: ""
    }
})
enum api {
    nodelistUrl = '/api/zrzy-bdc/act/process/extActProcessNode/list'
}
let nodeList = ref()
let lcid = ref(props.lcid)
let jdid = ref()
function getNode() {
    defHttp.get({ url: api.nodelistUrl, params: { processId: lcid.value } }, { withToken: true }).then((res) => {
        nodeList.value = res.result;
        jdid.value = res.result[0].processNodeCode
    });
}
/**
 * 节点点击
 */
function nodeClick(key: any) {
    jdid.value = key
}
watch(() => props.lcid, (newValue, _oldValue) => {
    lcid.value = newValue
    getNode()
});

getNode()

</script>

<style scoped lang="less"></style>