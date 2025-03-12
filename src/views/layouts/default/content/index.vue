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
              <component :is="Component" v-if="isReload" :key="route.fullPath + isRouterAlive" />
            </keep-alive>
          </template>
        </RouterView>
      </Suspense>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { computed, nextTick, ref, watch } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { useRoute } from 'vue-router'
import { router } from "/@/router"
const route = useRoute()
const tabStore = useTabsStore()
const { getTabsShow } = useTabsSetting()
let isRouterAlive = computed(() => tabStore.getRouterAlive)
const fullscreen = computed(() => tabStore.getIsFullScreen)
let isReload = ref<boolean>(true)

const caches = computed(() => {
  return tabStore.getCacheTabs.map(tab => {
    return tab.meta.componentName
  }).filter(Boolean)
})

watch(() => tabStore.getReloadTab, (newV) => {
 if (newV) {
   isReload.value = false
   nextTick(() => {
     isReload.value = true
     tabStore.setReloadTab(false)
   })
 } 
}, {
  deep: true
})

// router.onError((error) => {
//   console.error('路由导航错误:', error);
// });
//
// watch(
//   () => route.fullPath,
//   (newPath, oldPath) => {
//     console.log('路由切换:', oldPath, '->', newPath);
//   }
// );

</script>
<style lang="less" scoped>
.content-main {
  overflow-y: hidden;
  
  :deep(.ant-spin-nested-loading) {
    height: 100%;

    .ant-spin-container {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
