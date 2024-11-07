<template>
  <div :style="{
    height: getTabsShow ? (fullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 110px)') : 'calc(100vh - 50px)',
    margin: '5px', backgroundColor: 'white'
  }" class="content-main">
    <a-spin style="height: 100%" :spinning="!isRouterAlive" tip="Loading...">
      <Suspense>
        <RouterView>
          <template #default="{ Component, route }">
            <keep-alive :include="caches">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </template>
        </RouterView>
      </Suspense>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { computed } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { useRoute } from 'vue-router'
const route = useRoute()
const tabStore = useTabsStore()
const { getTabsShow } = useTabsSetting()
let isRouterAlive = computed(() => tabStore.getRouterAlive)
const fullscreen = computed(() => tabStore.getIsFullScreen)
const caches = computed(() => {
  return tabStore.getCacheTabs.map(tab => {
    if (!tab.meta.componentName) {
      // 默认取组件文件名
      let name = tab.meta.component.split('/')
      tab.meta.componentName = name[name.length-1]
    }
    return tab.meta.componentName
  }).filter(tab => tab)
})

</script>
<style lang="less" scoped>
.content-main {
  overflow-y: hidden;
  
  :deep(.ant-spin-nested-loading) {
    height: 100%;

    .ant-spin-container {
      height: 100%;
    }
  }
}
</style>
