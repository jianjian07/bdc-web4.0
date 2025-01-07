<template>
  <div class="api-param">
    <a-tabs v-model:activeKey="activeKey" class="api-param-tabs-card" hide-add @change="tabChange">
      <a-tab-pane key="header" tab="Header" class="api-param-pane" forceRender>
        <api-header :apiData="apiData"></api-header>
      </a-tab-pane>
      <a-tab-pane key="query" tab="params" class="api-param-pane" forceRender>
        <api-query :apiData="apiData"></api-query>
      </a-tab-pane>
      <a-tab-pane key="body" tab="json" class="api-param-pane" forceRender>
        <api-body :apiData="apiData"></api-body>
      </a-tab-pane>
      <a-tab-pane key="remark" tab="接口说明" class="api-param-pane" forceRender>
        <a-textarea
            v-model:value="apiData.remark"
            placeholder="请输入接口说明"
            style="height: 100%"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import ApiHeader from "/@/views/apimanage/modules/apiHeader.vue"
import ApiQuery from "/@/views/apimanage/modules/apiQuery.vue"
import ApiBody from "/@/views/apimanage/modules/apiBody.vue"

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
</style>
