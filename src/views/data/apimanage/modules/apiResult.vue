<template>
  <div class="api-result">
    <!-- <a-button class="claer" @click="handleClear">清除</a-button> -->
    <a-tabs v-model:activeKey="activeKey" class="api-result-tabs-card" hide-add>
      <a-tab-pane key="response" tab="实时响应" class="api-result-pane">
        <monaco-editor :modelValue="responseBody" :readOnly="true" theme="vs" language="json"
          style="width: 100%;overflow: auto" height="100%">
        </monaco-editor>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import MonacoEditor from "/@/components/monaco/monacoEditor.vue"
// 选中tab
let activeKey = ref<string>('response')
const props = defineProps({
  responseBody: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['clearResponseBody'])

function handleClear() {
  emit('clearResponseBody', "")
}


</script>

<style lang="less" scoped>
.api-result {
  height: 100%;
  position: relative;

  .api-result-tabs-card {
    height: 100%;

    :deep(.ant-tabs-content-holder) {
      height: 100%;

      .ant-tabs-content {
        height: 100%;

        .api-result-pane {
          height: 100%;
          position: relative;
        }
      }
    }
  }

  :deep(.monaco-mouse-cursor-text) {
    font-size: 12px !important;
  }

  .claer {
    position: absolute;
    right: 0px;
    cursor: pointer;
    z-index: 999;
    top: 5px;
  }
}
</style>
