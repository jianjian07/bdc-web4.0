<template>
    <div class="cc-container">
        <div>
            <div style="line-height: 3em; background-color: #fff;padding: 10px 0px;">
                <div style="text-align: right;padding-right: 20px;">
                    当前选中流程
                    【<span style="color:#1890ff;font-weight: 600;">
                        {{ processInfo.title }}
                    </span>】
                </div>
                <!-- <div style="text-align: right;padding-right: 20px;">
                    <a-button type="primary" :icon="h(ArrowRightOutlined)" size="small"
                        @click="handleAdd">创建流程</a-button>
                </div> -->
            </div>
            <div style="margin-top: 8px;line-height: 3em; background-color: #fff">
                <CLCLB @select="onSelect"></CLCLB>
            </div>
        </div>

        <div style="width: 100%;background-color: #fff;margin-left:8px;">
            <a-tabs v-model:activeKey="activeKey" style="padding: 5px;">
                <a-tab-pane key="1" tab="基础配置">
                    <FlowModal :lcid="processInfo.key" />
                </a-tab-pane>
                <a-tab-pane key="2" tab="表单配置" force-render>
                    <NodeList v-if="activeKey == '2'" :lcid="processInfo.key" />
                </a-tab-pane>
            </a-tabs>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import CLCLB from "/@/views/components/LCLB.vue"
const FlowModal = defineAsyncComponent(() => import("/@/views/system/case/components/FlowModal.vue"))
const NodeList = defineAsyncComponent(() => import("/@/views/system/case/components/NodeList.vue"))
const activeKey = ref('1');
let processInfo: any = ref('')
/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any) {
    processInfo.value = process
}
</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.line {
    width: 1px;
    height: 650px;
    background: linear-gradient(244deg, rgba(255, 255, 255, 0) 0%, rgba(24, 144, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
}
</style>