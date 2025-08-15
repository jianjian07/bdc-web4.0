<template>
  <div :class="prefixCls">
    <RouterView :key="route.fullPath"></RouterView>
  </div>
  <spin-mask v-if="maskShow" :mask-text="maskText"></spin-mask>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"
const appStore = useAppStore()
let prefixCls = 'default-layout'
import { useAppStore } from "/@/store/modules/app"
import { currentRoute } from "/@/router"
const route = currentRoute;
// 蒙版相关
let { maskShow, maskText } = toRefs(appStore.$state)
</script>

<style lang="less" scoped>
.default-layout {
  height: 100%;
}
</style>
<style lang="less">
@prefix-cls: ~'default-layout';

.@{prefix-cls} {
  display: flex;
  width: 100%;
  min-height: 100% !important;
  // background-color: @content-bg;
  flex-direction: column;
}
</style>
