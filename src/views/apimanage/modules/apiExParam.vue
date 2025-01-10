<template>
    <div class="api-param">
    <a-tabs v-model:activeKey="activeKey" class="api-param-tabs-card" hide-add @change="tabChange">
      <a-tab-pane v-if="apiType == '2'" key="script" tab="script" class="api-param-pane" forceRender>
        <div class="api-script" style="height: 100%; overflow: auto">
           <CodeEditor :fullScreen="true" language="javascript" :value="apiData.apiScript" @codeValue="getCodeValue"></CodeEditor>
        </div>
      </a-tab-pane>
      <a-tab-pane key="header" tab="Header" class="api-param-pane" forceRender>
        <api-header :apiData="apiData"></api-header>
      </a-tab-pane>
      <a-tab-pane key="query" tab="params" class="api-param-pane" forceRender>
        <api-query :apiData="apiData"></api-query>
      </a-tab-pane>
      <a-tab-pane v-if="apiType == '2'"  key="body" tab="json" class="api-param-pane" forceRender>
        <api-body :apiData="apiData"></api-body>
      </a-tab-pane>
      <a-tab-pane v-else key="datasource" tab="数据源" class="api-param-pane" forceRender>
        <api-ex-data-source :apiData="apiData"></api-ex-data-source>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import ApiHeader from "/@/views/apimanage/modules/apiHeader.vue"
import ApiQuery from "/@/views/apimanage/modules/apiQuery.vue"
import ApiExDataSource from "/@/views/apimanage/modules/apiExDataSource.vue"
import ApiBody from "/@/views/apimanage/modules/apiBody.vue"
import CodeEditor from '/@/components/common/CodeEditor.vue'

// 选中tab
let activeKey = ref<string>('header')

const props = defineProps({
  apiData: {
    type: Object,
    default: {}
  },
  activePane: {
    type: String,
    default: 'header'
  },
  apiType: {
    type: String,
    default: '1'
  }
})

const emit = defineEmits(['update:activePane'])

watch(() => props.activePane, (val: string) => {
  activeKey.value = val
})
/**
 * tab改变
 * @param key
 */
function tabChange(key) {
  emit('update:activePane',key)
}

function getCodeValue(value) {
  props.apiData.apiScript = value
}
</script>

<style lang="less" scoped>
.api-param {
  height: 100%;

  .api-param-tabs-card {
    height: 100%;

    :deep(.ant-tabs-content-holder) {
      height: 100%;

      .ant-tabs-content {
        height: 100%;

        .api-param-pane {
          height: 100%;
        }
      }
    }
  }
}

.api-script {
  :deep(.full-screen-parent) {
    height: 100%
  }
}
</style>