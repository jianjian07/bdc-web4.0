import { defineStore } from "pinia"
import { store } from "/@/store"
import { nextTick } from "vue"
import { router } from "/@/router"

interface TabsState {
  tabList: any[],
  tabActiveKey: string,
  isRouterAlive: boolean,
  isFullScreen: boolean,
  cacheTabList: any[]
}

export const useTabsStore = defineStore({
  id: 'app-tabs',
  state: (): TabsState => ({
    // 标签页列表
    tabList: [],
    // 当前标签页
    tabActiveKey: '',
    // 刷新路由
    isRouterAlive: true,
    // 是否全屏content
    isFullScreen: false,
    // 缓存路由
    cacheTabList: []
  }),
  getters: {
    getTabList() {
      return this.tabList;
    },
    getTabActiveKey(): string {
      return this.tabActiveKey;
    },
    getCurrentTab() {
      const tabIndex = this.tabList.findIndex(t => t.fullPath == this.tabActiveKey)
      if (tabIndex > -1) {
        return this.tabList[tabIndex]
      } else {
        return null
      }
    },
    getRouterAlive(): boolean {
      return this.isRouterAlive
    },
    getIsFullScreen(): boolean {
      return this.isFullScreen
    },
    getCacheTabs() {
      return this.cacheTabList
    }
  },
  actions: {
    addTab(tab) {
      const tabFind = this.tabList.some(t => t.fullPath == tab.fullPath)
      if (!tabFind) {
        this.tabList.push(tab)
      }
      this.tabActiveKey = tab.fullPath
      this.setCacheTabList()
    },
    removeTab(tab) {
      const tabIndex = this.tabList.findIndex(t => t.fullPath == tab.fullPath)
      if (tabIndex !== -1) {
        this.tabList.splice(tabIndex, 1)
        if (this.tabActiveKey == tab.fullPath) {
          this.tabActiveKey = this.tabList[tabIndex - 1].fullPath
        }
      }
      this.setCacheTabList()
    },
    resetTabList() {
      this.tabList = []
      this.setCacheTabList()
    },
    resetCacheTabList() {
      this.cacheTabList = []
    },
    setTabActiveKey(key) {
      this.tabActiveKey = key
    },
    setCacheTabList() {
      this.cacheTabList = this.tabList.filter(tab => tab.meta.cache)
    },
    refreshTab() {
      let find = this.cacheTabList.find(cacheTab => cacheTab.fullPath == this.getCurrentTab.fullPath)
      if (find) {
        this.cacheTabList = this.cacheTabList.filter(cacheTab => cacheTab.fullPath != find.fullPath)
      }
      router.push('/redirect')
    },
    closeCurrentTab(tab) {
      this.removeTab(tab)
    },
    closeOtherTab(tab) {
      // 除了自己和第一个都关掉
      this.closeLeftTab(tab)
      this.closeRightTab(tab)
      this.setCacheTabList()
    },
    closeLeftTab(tab) {
      const tabIndex = this.tabList.findIndex(t => t.fullPath == tab.fullPath)
      if (tabIndex !== -1) {
        let leftTabIndex = tabIndex - 1
        if (leftTabIndex > -1 && leftTabIndex !== 0) {
          // 除了第一个都关掉在左边的都关掉
          for (let i = leftTabIndex; i > 0; i--) {
            this.tabList.splice(i, 1)
          }
        }
      }
      this.setCacheTabList()
    },
    closeRightTab(tab) {
      const tabIndex = this.tabList.findIndex(t => t.fullPath == tab.fullPath)
      if (tabIndex !== -1) {
        let rightTabIndex = tabIndex + 1
        let length = this.tabList.length
        if (rightTabIndex < length) {
          // 关右边所有
          for (let i = length - 1; i >= rightTabIndex; i--) {
            this.tabList.splice(rightTabIndex, 1)
          }
        }
      }
      this.setCacheTabList()
    },
    closeAllTab() {
      // 只保留第一个
      let length = this.tabList.length
      this.tabList.splice(1, length - 1)
      this.tabActiveKey = this.tabList[0].fullPath
      this.setCacheTabList()
    },
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen
    }
  }
})

export function useTabsStoreWithOut() {
  return useTabsStore(store);
}
