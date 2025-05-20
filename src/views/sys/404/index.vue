<template>
  <div class="error-404">
    <a-result status="404" title="404" sub-title="非常抱歉，您访问的页面不存在!">
      <template #extra>
        <a-button type="primary" @click="handleBackHome">关闭并返回</a-button>
      </template>
    </a-result>
  </div>
</template>

<script lang="ts" setup>
import { closeCurrentTab } from "/@/views/bdc/public/bdc"

/**
 * 返回首页
 */
function handleBackHome() {
  closeCurrentTab()
}
</script>

<style lang="less" scoped>

</style>