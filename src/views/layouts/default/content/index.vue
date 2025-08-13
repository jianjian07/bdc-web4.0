<template>
  <div :style="{
    height: getTabsShow ? (fullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 110px)') : 'calc(100vh - 50px)',
    margin: '5px', backgroundColor: 'white'
  }" class="content-main">
    <a-spin style="height: 100%" :spinning="!isRouterAlive" tip="Loading...">
      <Suspense>
        <RouterView>
          <template #default="{ Component, route }">
            <keep-alive :include="caches" :key="keepAliveKey">
              <component :is="Component" v-if="isReload" :key="`${route.fullPath}_${reloadKey}`" />
            </keep-alive>
          </template>
        </RouterView>
      </Suspense>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { RouterView, useRouter } from 'vue-router'
import { computed, nextTick, ref, watch } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
const tabStore = useTabsStore()
const { getTabsShow } = useTabsSetting()
let isRouterAlive = computed(() => tabStore.getRouterAlive)
const fullscreen = computed(() => tabStore.getIsFullScreen)
let isReload = ref<boolean>(true)
const reloadKey = ref(Date.now())
const router = useRouter()
const caches = ref<string[]>([])
const keepAliveKey = ref(Date.now())

// 记录 只有新增加时才重置
const seenComponentTypes = new Set<string>()

watch(() => tabStore.getCacheTabs, (newTabs) => {
  const newCaches = newTabs.map(tab => {
    return tab.meta?.componentName
  }).filter(Boolean) as string[]
  
  // 是否有新的组件
  const hasNewComponentType = newCaches.some(componentName => 
    !seenComponentTypes.has(componentName)
  )
  
  if (hasNewComponentType) {
    newCaches.forEach(componentName => seenComponentTypes.add(componentName))
    
    // 重置keep-alive实例
    keepAliveKey.value = Date.now()
    
    // 更新缓存列表
    caches.value = [...seenComponentTypes]
  } else {
    // 不删除已见过的组件
    const allKnownComponents = Array.from(seenComponentTypes)
    if (JSON.stringify(caches.value.sort()) !== JSON.stringify(allKnownComponents.sort())) {
      // console.log('更新缓存列表，但不重置keep-alive')
      caches.value = allKnownComponents
    }
  }
}, {
  immediate: true,
  deep: true 
})

watch(() => tabStore.getReloadTab, (newV) => {
 if (newV) {
   isReload.value = false
   nextTick(() => {
     reloadKey.value = Date.now()
     isReload.value = true
     tabStore.setReloadTab(false)
   })
 } 
}, {
  deep: true
})

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
