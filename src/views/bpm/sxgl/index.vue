<template>
    <div class="cc-container">
        <div style="display: flex; flex-direction: column; height: 100%">

            <div style="line-height: 3em; background-color: #fff;padding: 10px 10px;">
                <a-space style="padding-bottom: 10px;">
                    <a-button type="primary" @click="handleMxAdd()" :disabled="!processInfo">
                        <PlusOutlined />新增事项
                    </a-button>
                </a-space>
                <a-alert type="info" :show-icon="true">
                    <template #message>
                        当前选择：
                        <span style="font-weight: 600;">
                            {{ processInfo.title }}
                        </span>
                    </template>
                </a-alert>
            </div>
            <div
                style=" width: 280px;padding: 10px 8px;margin-top: 8px;line-height: 3em; background-color: #fff; flex: 1;height: calc(100% - 60px); overflow: auto">
                <a-directory-tree multiple :tree-data="treeData"
                    :fieldNames="{ children: 'children', title: 'title', key: 'value' }"
                    v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys" @select="onSelect">
                    <template #icon="">
                    </template>
                </a-directory-tree>
            </div>
        </div>

        <div class="userTabContent" style="height: 100%">
            <a-tabs v-model:activeKey="activeKey" style="padding: 5px; height: 100%;">
                <a-tab-pane key="1" tab="基础配置">
                    <SxxxModal :data="processInfo" @setBaseInfo="setBaseInfo" @refreshTree="loadData"
                        @openFlowDesign="openFlowDesign" />
                </a-tab-pane>
                <a-tab-pane v-if="showFlow" key="2" tab="流程配置" force-render>
                    <CBpmDesign v-if="showFlow" :key="lcid" :id="lcid"></CBpmDesign>
                </a-tab-pane>
                <!-- <a-tab-pane key="2" tab="表单配置" force-render>
                    <NodeList v-if="activeKey == '2'" :lcid="processInfo.key" />
                </a-tab-pane>
                <a-tab-pane key="3" tab="权利其他配置" force-render>
                    <QlqtpzList v-if="activeKey == '3'" :lcid="processInfo.key" :baseInfo="baseInfo" />
                </a-tab-pane>
                <a-tab-pane key="4" tab="业务约束配置" force-render>
                    <YwysList v-if="activeKey == '4'" :lcid="processInfo.key" :baseInfo="baseInfo"
                        :treeData="treeData" />
                </a-tab-pane>
                <a-tab-pane key="5" tab="材料目录配置" force-render>
                    <ClmlList v-if="activeKey == '5'" :lcid="processInfo.key" :baseInfo="baseInfo" />
                </a-tab-pane>
                <a-tab-pane key="6" tab="权利人配置" force-render>
                    <qlrpz v-if="activeKey == '6'" :lcid="processInfo.key" :baseInfo="baseInfo"></qlrpz>
                </a-tab-pane>
                <a-tab-pane key="7" tab="规则配置" force-render>
                    <node-line-list v-if="activeKey == '7'" :lcid="processInfo.key"
                        :baseInfo="baseInfo"></node-line-list>
                </a-tab-pane> -->
            </a-tabs>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from "vue";
import { PlusOutlined } from '@ant-design/icons-vue'
// import CLCLB from "/@/views/bdc/case/LCLB.vue"
import NodeLineList from "/@/views/system/case/components/NodeLineList.vue"
import { defHttp } from "/@/utils/http/axios";
const SxxxModal = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components/SxxxModal.vue"))
// const NodeList = defineAsyncComponent(() => import("/@/views/system/case/components/NodeList.vue"))
// const QlqtpzList = defineAsyncComponent(() => import("/@/views/system/case/components/QlqtpzList.vue"))
// const YwysList = defineAsyncComponent(() => import("/@/views/system/case/components/YwysList.vue"))
// const ClmlList = defineAsyncComponent(() => import("/@/views/system/case/components/ClmlList.vue"))
// const Qlrpz = defineAsyncComponent(() => import("/@/views/system/case/components/Qlrpz.vue"))
const activeKey = ref('1');
let processInfo: any = ref({})
let baseInfo: any = ref(null)
let treeData: any = ref([])
const expandedKeys = ref<string[]>(['1000']);
const selectedKeys = ref<string[]>([]);
let showFlow = ref(false)
let lcid = ref('')
onMounted(() => {
    loadData()
})

/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any, e: any) {
    // debugger
    processInfo.value = e.node
}

/**
 * 目录树
 * @param process 选中的流程
 */
function loadData() {
    defHttp.get({ url: "/api/zrzy-bdc/bpm/sxml/treeList", params: {} }, { withToken: true }).then((res) => {
        treeData.value = res.result
        if (res.result.length > 0 && Object.keys(processInfo.value).length == 0) {
            expandedKeys.value = [res.result[0].value]
            if (res.result[0].children.length > 0) {
                processInfo.value = res.result[0].children[0]
            } else {
                processInfo.value = res.result[0]
            }
            selectedKeys.value = [processInfo.value.value]
        }
    })
}

/**
 * 基础配置
 * @param data 当前选中流程的基础配置
 */
function setBaseInfo(data: any) {
    data.prefix = data.prefix || processInfo.value.value
    data.lcmc = data.lcmc || processInfo.value.title
    baseInfo.value = data
}
function handleMxAdd() {
    const lclx = processInfo.value.type == 1 ? processInfo.value.parentId : processInfo.value.value
    processInfo.value = {
        code: '',
        name: '',
        type: 1,
        orderNum: 1,
        lclx: lclx
    }
}
function openFlowDesign(data: any) {
    lcid.value = data
    showFlow.value = true
    activeKey.value = '2'
}

</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.line {
    width: 1px;
    height: 650px;
    background: linear-gradient(244deg, rgba(255, 255, 255, 0) 0%, rgba(24, 144, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
}

.userTabContent {
    width: 100%;
    background-color: #fff;
    margin-left: 8px;

    :deep(.ant-tabs-content) {
        height: 100%;
    }

    :deep(.ant-tabs-content-holder) {
        height: 100%;
        overflow: auto;
    }
}
</style>