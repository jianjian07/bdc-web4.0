<template>
  <div class="bdpz-bl cc-container">
    <div style="display: flex; flex-direction: column; height: 100%">
      <div style="line-height: 3em; background-color: #fff;padding: 10px 0px;">
        <div style="text-align: right;padding-right: 20px;">
          当前选中流程
          【<span style="color:#1890ff;font-weight: 600;">{{ processInfo.title }}</span>】
        </div>
      </div>
      <div style="margin-top: 8px;line-height: 3em; background-color: #fff; flex: 1;height: calc(100% - 60px); overflow: auto">
        <div style="width: 280px;padding: 10px 8px;">
          <a-directory-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys" 
                          :fieldNames="{ children:'children', title:'label', key:'value' }"
                          :tree-data="treeData"
                          multiple
                          @select="onSelect">
            <template #icon="">
            </template>
          </a-directory-tree>
        </div>
      </div>
    </div>
    <div class="userTabContent" style="height: 100%">
      <a-tabs v-model:activeKey="activeKey" style="padding: 5px; height: 100%;">
        <a-tab-pane key="1" tab="基础配置">
          <FlowModal :lcid="processInfo.key"/>
        </a-tab-pane>
        <a-tab-pane key="2" force-render tab="表单配置">
          <NodeList v-if="activeKey == '2'" :lcid="processInfo.key" :isBl="true"/>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from "vue"
import { getDictItemsByCode } from "/@/utils/form/commonUtils"
const FlowModal = defineAsyncComponent(() => import("/@/views/system/case/components/FlowModal.vue"))
const NodeList = defineAsyncComponent(() => import("/@/views/system/case/components/NodeList.vue"))
let processInfo: any = ref('')
let activeKey = ref('1')
let treeData = ref<any>([])
let selectedKeys = ref<any>([])
let expandedKeys = ref<any>([])

onMounted(() => {
  initData()
})

function initData() {
  let arr = getDictItemsByCode('bllc')
  treeData.value = arr
  if (arr.length) {
    selectedKeys.value.push(arr[0].value)
    processInfo.value = arr[0]
    processInfo.value.title = arr[0].label
    processInfo.value.key = arr[0].value
  }
}

function onSelect(_selectedKeys: any, e: any) {
  const process = e.node
  processInfo.value = process
  processInfo.value.title = process.label
  processInfo.value.key = process.value
}
</script>

<style lang="less" scoped>
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