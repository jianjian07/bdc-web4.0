<template>
  <div class="api-param">
    <a-tabs v-model:activeKey="activeKey" class="api-param-tabs-card" hide-add @change="tabChange">
      <a-tab-pane v-if="apiType == 2" key="script" tab="接口内容" class="api-param-pane" forceRender>
        <div class="api-script" style="height: 100%; overflow: auto">
          <CodeEditor :fullScreen="true" language="javascript" :value="apiData.script" @codeValue="getCodeValue">
          </CodeEditor>
        </div>
      </a-tab-pane>
      <a-tab-pane key="header" tab="Headers" class="api-param-pane" forceRender>
        <api-header :apiData="apiData"></api-header>
      </a-tab-pane>
      <a-tab-pane key="query" tab="Params" class="api-param-pane" forceRender>
        <api-query :apiData="apiData"></api-query>
      </a-tab-pane>
      <a-tab-pane key="body" tab="请求Body" class="api-param-pane" forceRender>
        <api-body :apiData="apiData"></api-body>
      </a-tab-pane>
      <a-tab-pane v-if="apiType != 2" key="datasource" tab="数据源" class="api-param-pane" forceRender>
        <api-ex-data-source :apiData="apiData"></api-ex-data-source>
      </a-tab-pane>
      <a-tab-pane key="bz" tab="接口说明" class="api-param-pane" forceRender>
        <a-textarea v-model:value="apiData.bz" placeholder="请输入接口说明" style="height: 100%" />
      </a-tab-pane>
      <a-tab-pane key="callback" tab="串行接口">
        <a-form ref="formRef" :label-col="{ span: 3 }" :wrapper-col="{ span: 18 }">
          <a-form-item label="类路径">
            <a-input v-model:value="apiData.className"></a-input>
          </a-form-item>
          <a-form-item label="方法名">
            <a-input v-model:value="apiData.methodName"></a-input>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="dparam" tab="动态参数-在线测试" class="api-param-pane" forceRender>
        <monaco-editor v-model="apiData.dparams" height="100%" language="json" style="width: 100%;overflow: auto"
          theme="vs">
        </monaco-editor>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import ApiHeader from "/@/views/data/apimanage/modules/apiHeader.vue"
import ApiQuery from "/@/views/data/apimanage/modules/apiQuery.vue"
import ApiExDataSource from "/@/views/data/apimanage/modules/apiExDataSource.vue"
import ApiBody from "/@/views/data/apimanage/modules/apiBody.vue"
import CodeEditor from '/@/components/common/CodeEditor.vue'
import MonacoEditor from "/@/components/monaco/monacoEditor.vue"
// 选中tab
let activeKey = ref<string>('header')

const props = defineProps({
  apiData: {
    type: Object,
    default: {}
  },
  activePane: {
    type: String,
    default: ''
  },
  apiType: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:activePane'])

watch(() => props.activePane, (val: string) => {
  if (props.apiType == 2) {
    activeKey.value = val ? val : 'script'
  } else {
    activeKey.value = val ? val : 'header'
  }
}, {
  immediate: true
})

/**
 * tab改变
 * @param key
 */
function tabChange(key) {
  emit('update:activePane', key)
}

function getCodeValue(value) {
  props.apiData.script = value
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