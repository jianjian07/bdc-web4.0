<template>
    <div class="cc-container">
        <div style="display: flex; flex-direction: column; height: 100%">

            <div style="line-height: 3em; background-color: #fff;padding: 10px 10px;">
                <a-space style="padding-bottom: 10px;">
                    <a-button type="primary" @click="handleMlAdd()" :disabled="!processInfo">
                        <PlusOutlined />新增目录
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
                    :fieldNames="{ children: 'children', title: 'title', key: 'key' }"
                    v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys" @select="onSelect">
                    <template #icon="">
                    </template>
                </a-directory-tree>
            </div>
        </div>

        <div class="userTabContent" style="height: 100%">
            <a-tabs v-model:activeKey="activeKey" style="padding: 5px; height: 100%;">
                <a-tab-pane key="1" tab="基础配置">
                    <SxxxModal :data="processInfo" @setBaseInfo="setBaseInfo" @refreshTree="refreshTree"
                        @openFlowDesign="openFlowDesign" @addMx="handleMxAdd" />
                </a-tab-pane>
                <a-tab-pane v-if="showFlow" key="2" tab="流程配置" force-render>
                    <CBpmDesign v-if="showFlow" :key="lcid" :id="lcid"></CBpmDesign>
                </a-tab-pane>
                <a-tab-pane v-if="processInfo.ml == 0" key="3" tab="表单配置" force-render>
                    <NodeList v-if="activeKey == '3'" :lcid="processInfo.key" :isBl="sxlx != 1" />
                </a-tab-pane>
                <a-tab-pane key="4" tab="权利其他配置" force-render>
                    <QlqtpzList v-if="activeKey == '4'" :lcid="processInfo.key" :baseInfo="processInfo" />
                </a-tab-pane>
                <a-tab-pane v-if="processInfo.ml == 0 && sxlx == 1" key="5" tab="业务约束配置" force-render>
                    <YwysList v-if="activeKey == '5'" :lcid="processInfo.key" :baseInfo="processInfo"
                        :treeData="treeData" />
                </a-tab-pane>
                <a-tab-pane v-if="processInfo.ml == 0" key="6" tab="材料目录配置" force-render>
                    <ClmlList v-if="activeKey == '6'" :lcid="processInfo.key" :baseInfo="processInfo" />
                </a-tab-pane>
                <a-tab-pane v-if="processInfo.ml == 0 && sxlx == 1" key="7" tab="权利人配置" force-render>
                    <qlrpz v-if="activeKey == '7'" :lcid="processInfo.key" :baseInfo="processInfo"></qlrpz>
                </a-tab-pane>
                <!-- <a-tab-pane key="8" tab="规则配置" force-render>
                    <node-line-list v-if="activeKey == '8'" :lcid="processInfo.key"
                        :baseInfo="processInfo"></node-line-list>
                </a-tab-pane> -->
            </a-tabs>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from "vue";
import { PlusOutlined } from '@ant-design/icons-vue'
import { defHttp } from "/@/utils/http/axios";

const SxxxModal = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components/SxxxModal.vue"))
const NodeList = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components//NodeList.vue"))
const QlqtpzList = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components/QlqtpzList.vue"))
const YwysList = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components/YwysList.vue"))
const ClmlList = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components/ClmlList.vue"))
const Qlrpz = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components/Qlrpz.vue"))
const NodeLineList = defineAsyncComponent(() => import("/@/views/bpm/sxgl/components/NodeLineList.vue"))
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
let sxlx = ref(1)
let ml = ref(1)
/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any, e: any) {
    processInfo.value = e.node
    selectedKeys.value = [e.node.key]
    if (e.node.ml == 1) {
        activeKey.value = '1'
    }
    sxlx.value = e.node.sxlx
    if (activeKey.value == '2') {
        showFlow.value = false
        activeKey.value = '1'
    }
}

/**
 * 目录树
 * @param process 选中的流程
 */
async function loadData() {
    const res = await defHttp.get({ url: "/api/zrzy-bdc/flow/sxml/treeList", params: {} }, { withToken: true })
    treeData.value = res.result
    if (res.result.length > 0 && Object.keys(processInfo.value).length == 0) {
        expandedKeys.value = [res.result[0].value]
        if (res.result[0].children != undefined && res.result[0].children.length > 0) {
            processInfo.value = res.result[0].children[0]
            ml.value = 0
        } else {
            processInfo.value = res.result[0]
        }
        selectedKeys.value = [processInfo.value.key]
    }
}
async function refreshTree(data: { type: string, id: any }) {
    await loadData()
    const _ml = processInfo.value.ml
    if (_ml == 1) {
        if (data.type == 'add') {
            if (processInfo.value.id == undefined) {
                const findData = treeData.value.filter(t => t.id == data.id)
                processInfo.value = findData[0]
                selectedKeys.value = [processInfo.value.key]
            }
        } else {
            if (treeData.value.length > 0) {
                processInfo.value = treeData.value[0]
                selectedKeys.value = [processInfo.value.key]
            }
        }
    } else {
        if (data.type == 'add') {
            if (processInfo.value.id == undefined) {
                const findData = treeData.value.filter(t => t.key == processInfo.value.lclx)
                const findSx = findData[0].children.filter(t => t.id == data.id)
                processInfo.value = findSx[0]
                selectedKeys.value = [processInfo.value.key]
            }
        } else {
            const findData = treeData.value.filter(t => t.key == processInfo.value.parentId)
            processInfo.value = findData[0]
            selectedKeys.value = [processInfo.value.key]
        }
    }

}
/**
 * 基础配置
 * @param data 当前选中流程的基础配置
 */
function setBaseInfo(data: any) {
    // data.prefix = data.prefix || processInfo.value.value
    data.lcmc = data.lcmc || processInfo.value.title
    baseInfo.value = data
    selectedKeys.value = [data.code]
}
/** 新增目录 */
function handleMlAdd() {
    processInfo.value = {
        ml: 1,
        type: 0,
        orderNum: 1,
    }
}
/** 新增事项明细（由SxxxModal编辑目录时触发） */
function handleMxAdd() {
    const lclx = processInfo.value.ml == 1 ? processInfo.value.key : processInfo.value.parentId
    processInfo.value = {
        code: '',
        name: '',
        ml: 0,
        orderNum: 1,
        lclx: lclx,
        sxlx: processInfo.value.sxlx,
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
