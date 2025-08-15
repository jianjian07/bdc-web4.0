<template>
  <div class="his-task-deal">
    <a-tabs v-model:activeKey="activeKey" tab-position="left" class="his-task-deal-tab">
      <a-tab-pane key="1">
        <template #tab> 
          <SlidersOutlined />
          <span>流程图</span>
        </template>
        <process-module :formData="formData" :processInstanceId="processInstanceId"></process-module>
      </a-tab-pane>
      
      <a-tab-pane key="2">
        <template #tab> 
          <SlidersOutlined />
          <span>附件预览</span>
        </template>
        <sso-file></sso-file>
      </a-tab-pane>
      
      <template v-for="(item, index) in lcjd" :key="item.id + '_' + index">
        <a-tab-pane v-if="item" :key="item.id + '_' + index" :tab="item.jdmc">
          <look-public :data="item"></look-public>
        </a-tab-pane>
      </template>
      
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from "vue"
import { SlidersOutlined } from '@ant-design/icons-vue';
import LookPublic from "/@/views/bdc/public/LookPublic.vue"
import { defHttp } from "/@/utils/http/axios"
const ProcessModule = defineAsyncComponent(() => import("/@/views/bdc/task/components/ProcessModule.vue"))
const SsoFile = defineAsyncComponent(() => import("/@/views/system/ssofile/LookIndex.vue"))
import { currentRoute } from "/@/router"
const route = currentRoute;
// 当前选中tab
let activeKey = ref<string>('1')
// 历史流程节点
let lcjd = ref<any[]>([])
// 实例id
let processInstanceId = ref<any>('')

enum api {
  info = '/api/zrzy-bdc/hi/taskinst/getTaskInfo'
}

onMounted(() => {
  getLcjd()
})

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

/**
 * 获取节点信息
 */
function getLcjd() {
  let slbh = route.query.slbh || props.formData?.slbh
  defHttp.get({ url: api.info, params: { slbh: slbh } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      lcjd.value = res.result || []
      processInstanceId.value = res.result.length ?  res.result[0].procInstId : ''
    } 
  })
}
</script>

<style lang="less" scoped>
.his-task-deal {
  padding: 20px;
  height: 100%;
  
  :deep(.ant-spin-container) {
    padding: 10px;
  }
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