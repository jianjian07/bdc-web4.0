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
                <CLCLB @select="onSelect" @setTreeData="setTreeData"></CLCLB>
            </div>
        </div>

        <div style="width: 100%;background-color: #fff;margin-left:8px;">
            <a-tabs v-model:activeKey="activeKey" style="padding: 5px;">
                <a-tab-pane key="1" tab="基础配置">
                    <FlowModal :lcid="processInfo.key" @setBaseInfo="setBaseInfo"/>
                </a-tab-pane>
                <a-tab-pane key="2" tab="表单配置" force-render>
                    <NodeList v-if="activeKey == '2'" :lcid="processInfo.key" />
                </a-tab-pane>
                <a-tab-pane key="3" tab="业务权利其他配置" force-render>
                    <QlqtpzList v-if="activeKey == '3'" :lcid="processInfo.key" :baseInfo="baseInfo"/>
                </a-tab-pane>
                <a-tab-pane key="4" tab="业务约束配置" force-render>
                    <YwysList v-if="activeKey == '4'" :lcid="processInfo.key" :baseInfo="baseInfo" :treeData="treeData"/>
                </a-tab-pane>
                <a-tab-pane key="5" tab="材料目录配置" force-render>
                    <ClmlList v-if="activeKey == '5'" :lcid="processInfo.key" :baseInfo="baseInfo"/>
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
const QlqtpzList = defineAsyncComponent(() => import("/@/views/system/case/components/QlqtpzList.vue"))
const YwysList = defineAsyncComponent(() => import("/@/views/system/case/components/YwysList.vue"))
const ClmlList = defineAsyncComponent(() => import("/@/views/system/case/components/ClmlList.vue"))
const activeKey = ref('1');
let processInfo: any = ref('')
let baseInfo: any = ref(null)
let treeData: any = ref(null)
/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any) {
  processInfo.value = process
}

/**
 * 目录树
 * @param process 选中的流程
 */
function setTreeData(data: any) {
  treeData.value = data
}

/**
 * 基础配置
 * @param data 当前选中流程的基础配置
 */
function setBaseInfo(data: any) {
  baseInfo.value = data
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