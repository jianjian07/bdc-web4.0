<template>
    <a-row style="padding: 10px">
        <a-col :span="3" v-if="nodeList && nodeList.length">
            <a-tabs default-active-key v-model:activeKey="activeKey" @change="nodeClick" size="small"
                tab-position="left" class="tab-left">
                <a-tab-pane class="tab-panel" v-for="item in nodeList" :key="item.processNodeCode"
                    :tab="item.processNodeName" />
            </a-tabs>
        </a-col>
        <a-col :span="(nodeList && nodeList.length) ? 21 : 24">
            <BdpzModal :lcid="lcid" :jdid="jdid" :jdmc="jdmc"></BdpzModal>
        </a-col>
    </a-row>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue'
import { defHttp } from '/@/utils/http/axios';
import BdpzModal from '/@/views/bpm/sxgl/components/BdpzModal.vue';
let props = defineProps({
    lcid: {
        type: String,
        default: ""
    },
    isBl: {
        type: Boolean,
        default: false
    }
})
enum api {
    nodelistUrl = '/api/zrzy-bdc/act/process/extActProcessNode/list'
}
let nodeList = ref([])
let lcid = ref(props.lcid)
let jdid = ref()
let jdmc = ref()
let activeKey = ref()
function getNode() {
    defHttp.get({ url: api.nodelistUrl, params: { processId: lcid.value } }, { withToken: true }).then((res) => {
        if (res && res.success) {
            nodeList.value = res.result;
            if (res.result.length) {
                jdid.value = res.result[0].processNodeCode
                jdmc.value = res.result[0].processNodeName
                activeKey.value = res.result[0].processNodeCode
            }
        }
    });
}
/**
 * 节点点击
 */
function nodeClick(key: any) {
    jdid.value = key
    jdmc.value = nodeList.value.find(item => item.processNodeCode == key).processNodeName
}
watch(() => props.lcid, (newValue, _oldValue) => {
    lcid.value = newValue
    if (!props.isBl) {
        getNode()
    }
});

onMounted(() => {
    if (!props.isBl) {
        getNode()
    }
})



</script>

<style scoped lang="less"></style>