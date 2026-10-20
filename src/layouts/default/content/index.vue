<template>
  <div :style="{
    height: getTabsShow ? (fullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 110px)') : 'calc(100vh - 60px)',
    margin: '5px', backgroundColor: 'white'
  }" class="content-main">
    <a-spin style="height: 100%" :spinning="!isRouterAlive" tip="Loading...">
      <Suspense>
        <RouterView>
          <template #default="{ Component, route }">
            <keep-alive :include="caches" :key="devMode ? keepAliveKey : undefined">
              <component :is="Component" v-if="isReload" :key="getTabKey(route)" />
            </keep-alive>
          </template>
        </RouterView>
      </Suspense>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { RouterView, useRouter } from 'vue-router'
import { computed, nextTick, reactive, ref, watch } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
const tabStore = useTabsStore()
const { getTabsShow } = useTabsSetting()
let isRouterAlive = computed(() => tabStore.getRouterAlive)
const fullscreen = computed(() => tabStore.getIsFullScreen)
let isReload = ref<boolean>(true)
const router = useRouter()
const caches = ref<string[]>([])
const keepAliveKey = ref(Date.now())
const devMode = import.meta.env.DEV
// 记录 只有新增加时才重置
const seenComponentTypes = new Set<string>()

// 每个 fullPath 独立的重载版本号 作为 key 的一部分 防止回到旧缓存
const reloadVersionMap = reactive<Record<string, number>>({})

/**
 * 获取 tab 缓存的 key
 * @param route
 */
function getTabKey(route: any) {
  const componentPart = (route.meta?.componentName || route.name || 'anonymous') as string
  const base = `${componentPart}_${route.fullPath}`
  const ver = reloadVersionMap[route.fullPath as string]
  return ver ? `${base}__v${ver}` : base
}

watch(() => tabStore.getTabList, (list) => {
  const aliveFullPaths = new Set((list as any[]).map(t => t.fullPath))
  Object.keys(reloadVersionMap).forEach(fp => {
    if (!aliveFullPaths.has(fp)) {
      // 关闭 tab 时清理对应的版本号
      delete reloadVersionMap[fp]
    }
  })
}, {
  deep: true,
  immediate: true
})

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
    // 仅在开发模式路由 matcher 损坏时重置 keep-alive
    if (devMode && window.routerMatcherBroken) {
      keepAliveKey.value = Date.now()
    }
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
    const fullPath = router.currentRoute.value.fullPath as string
    reloadVersionMap[fullPath] = Date.now()
    isReload.value = false
    nextTick(() => {
      isReload.value = true
      tabStore.setReloadTab(false)
    })
  }
}, {
  deep: true
})

const originalWarn = console.warn
console.warn = function (...args) {
  if (args[0] && typeof args[0] === 'string' &&
    args[0].includes('No match found for location with path')) {

    // 从警告信息中提取目标路径
    const match = args[0].match(/No match found for location with path "([^"]+)"/)
    const targetPath = match ? match[1] : ''
    // console.log('matcher为损坏状态', ...args)
    // 标记matcher为损坏状态
    window.routerMatcherBroken = true

    setTimeout(() => {
      const lastParams = window.getLastPushParams?.()
      if (lastParams) {
        // 使用保存的完整参数进行替换
        if (typeof lastParams === 'string') {
          router.replace(lastParams)
        } else {
          router.replace({ ...lastParams })
        }
      } else if (targetPath) {
        router.replace(targetPath)
      }
    }, 100)

    return
  }
  originalWarn.apply(console, args)
}

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
