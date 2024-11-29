<template>
  <div class="his-task-deal">
    <a-tabs v-model:activeKey="activeKey" tab-position="left" class="his-task-deal-tab">
      <a-tab-pane key="1">
        <template #tab> 
          <SlidersOutlined />
          <span>流程图</span>
        </template>
        <process-module></process-module>
      </a-tab-pane>
      
      <a-tab-pane key="2">
        <template #tab> 
          <SlidersOutlined />
          <span>附件预览</span>
        </template>
        <sso-file :look="true"></sso-file>
      </a-tab-pane>
      
      <template v-for="(item, index) in lcjd" :key="item.taskId + '_' + index">
        <a-tab-pane v-if="item" :key="item.taskId + '_' + index" :tab="item.taskName">
          <look-public :vueList="item.vueList" :qlrxx="item.qlrxx"></look-public>
        </a-tab-pane>
      </template>
      
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from "vue"
import { SlidersOutlined } from '@ant-design/icons-vue';
import LookPublic from "/@/views/bdc/public/LookPublic.vue"
const ProcessModule = defineAsyncComponent(() => import("/@/views/bdc/task/components/ProcessModule.vue"))
const SsoFile = defineAsyncComponent(() => import("/@/views/system/ssofile/index.vue"))
// 当前选中tab
let activeKey = ref<string>('1')
// 历史流程节点
let lcjd = ref<any[]>([])

onMounted(() => {
  getLcjd()
})

function getLcjd() {
  lcjd.value = [{
    taskName: '收件',
    taskId: '',
    vueList: [
  {
    "id0": "1861365377680969730",
    "lcid": "1780060462306840577",
    "qllx": "12",
    "jdid": "task1713765291775",
    "jdmc": null,
    "vfdtitle": "初审意见",
    "vfd": "CSYJ",
    "formId": "44",
    "orderNum": 1,
    "ispl": "0",
    "iszd": "0",
    "qlrlb": "",
    "qlrlbmc": "",
    "bdlb": "0"
  },
  {
    "id0": "1861365454856163329",
    "lcid": "1780060462306840577",
    "qllx": "12",
    "jdid": "task1713765291775",
    "jdmc": null,
    "vfdtitle": "收件信息",
    "vfd": "SJXX",
    "formId": "105",
    "orderNum": 2,
    "ispl": "0",
    "iszd": "1",
    "qlrlb": "",
    "qlrlbmc": "",
    "bdlb": "0"
  }
],
    qlrxx: {
  "lcid": "1780060462306840577",
  "djlx": "0101",
  "qllx": "12",
  "qlrlx": "4",
  "qlrlxmc": "森林、林木使用权人",
  "qlrxsmc": "森林、林木使用权人",
  "btnId": "3,1,2,4",
  "sxh": 1
}
  }]
}
</script>

<style lang="less" scoped>
.his-task-deal {
  padding: 20px;
  height: 100%;
}

.his-task-deal-tab {
  height: 100%;
  
  :deep(.ant-tabs-content) {
    height: 100%;
    overflow: auto;
  }
  
  :deep(.ant-tabs-tab) {
    display: flex;
    justify-content: end;
  }
}
</style>