<template>
  <div class="ssoFileContent">
    <div class="titleContent ">
      <span class="title">
        材料信息
      </span>
    </div>
    <div class="ssoFileList">
      <dir-tree :formData="_formData"></dir-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, reactive, watch } from 'vue'
import dirTree from './components/dirTree.vue';
import { useRoute } from 'vue-router'
import { createScopedBus } from "/@/views/online/utils/scopeEventBus.ts"
import { updateCModalScopeBus } from "/@/components/cModal/index.ts"
import { updateCDrawerScopeBus } from "/@/components/cDrawer/index.ts"
const eventBus = createScopedBus()
updateCModalScopeBus(eventBus)
updateCDrawerScopeBus(eventBus)
provide('scopedEventBus', eventBus)
const route = useRoute();
const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

let _formData = reactive<any>({
  slbh: '',
  processId: '',
  nodeId: '',
  isNeedDefault: true
})

onMounted(() => {
  _formData.slbh = props.formData?.ywh || route?.query?.slbh || 'CQSC202412090000534'
  if (props.formData.isNeedDefault !== null && props.formData.isNeedDefault !== undefined) {
    _formData.isNeedDefault = props.formData.isNeedDefault
  }
})

</script>

<style scoped lang="less">
.ssoFileContent {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .titleContent {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;

    .title {
      border-left: 4px #5094F9 solid;
      padding: 0px 5px;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .ssoFileList {
    padding: 10px 0;
    display: flex;
    flex: 1;
  }
}
</style>