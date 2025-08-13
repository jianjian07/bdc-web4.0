import { defineStore } from "pinia"
import { store } from "/@/store"
import { nextTick } from "vue"

interface TabsState {
  tabList: any[],
  tabActiveKey: string,
  isRouterAlive: boolean,
  isFullScreen: boolean,
  cacheTabList: any[],
  reloadTab: boolean,
  routerChangeObj: any,
  isFromTab: any
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
    cacheTabList: [],
    // 刷新tab
    reloadTab: false,
    // 路由变化
    routerChangeObj: null,
    // tab锁
    isFromTab: false,
  }),
  getters: {
    getTabList(): any {
      return this.tabList;
    },
    getTabActiveKey(): string {
      return this.tabActiveKey;
    },
    getCurrentTab(): any {
      const tabIndex = this.tabList.findIndex((t: any) => t.fullPath == this.tabActiveKey)
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
    getCacheTabs(): any {
      return this.tabList.filter(tab => tab.meta.cache);
    },
    getReloadTab(): boolean {
      return this.reloadTab
    },
    getRouterChangeObj(): any {
      return this.routerChangeObj
    }
  },
  actions: {
    addTab(tab: any) {
      const tabFind = this.tabList.some(t => t.fullPath == tab.fullPath)
      if (!tabFind) {
        this.tabList.push(tab)
      }
      this.tabActiveKey = tab.fullPath
      this.setCacheTabList()
    },
    removeTab(tab: any) {
      const tabIndex = this.tabList.findIndex(t => t.fullPath == tab.fullPath)
      if (tabIndex !== -1) {
        this.tabList.splice(tabIndex, 1)
        if (this.tabActiveKey === tab.fullPath) {
          // 旧标签页存在则跳转到旧标签页
          const oldPath = this.routerChangeObj?.old;
          const oldIndex = this.tabList.findIndex(f => f.fullPath === oldPath);
        
          const fallbackIndex = Math.max(0, tabIndex - 1)
          const newActiveTab = (oldPath && oldIndex !== -1)
            ? this.tabList[oldIndex].fullPath
            : this.tabList[fallbackIndex]?.fullPath;
          this.tabActiveKey = newActiveTab;
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
    setTabActiveKey(key: string) {
      this.tabActiveKey = key
    },
    setCacheTabList() {
      this.cacheTabList = this.tabList.filter(tab => tab.meta.cache)
    },
    setReloadTab(value) {
      this.reloadTab = value
    },
    setRouterChangeObj(obj) {
      this.routerChangeObj = obj
    },
    setFromTab(flag: boolean) {
      this.isFromTab = flag
    },
    refreshTab() {
      let find = this.cacheTabList.find(cacheTab => cacheTab.fullPath == this.getCurrentTab.fullPath)
      if (find) {
        // 去掉相同的缓存路由
        this.cacheTabList = this.cacheTabList.filter(cacheTab => cacheTab.name != find.name)
      }
      nextTick(() => {
        // 删除后在添加
        this.setReloadTab(true)
        this.setCacheTabList()
      })
    },
    closeCurrentTab(tab: any) {
      this.removeTab(tab)
    },
    closeOtherTab(tab: any) {
      // 除了自己和第一个都关掉
      this.closeLeftTab(tab)
      this.closeRightTab(tab)
      this.setCacheTabList()
    },
    closeLeftTab(tab: any) {
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
    closeRightTab(tab: any) {
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
