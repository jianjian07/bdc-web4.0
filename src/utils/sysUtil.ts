/** 系统管理模块相关工具函数 */
/**
 * 关闭当前页面
 */
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { router } from "/@/router"
import { computed } from "vue"

export function closeCurrentTab() {
    const tabStore = useTabsStore()
    const { getTabsShow } = useTabsSetting()
    if (getTabsShow.value) {
        const currentTab = computed(() => tabStore.getCurrentTab)
        tabStore.removeTab(currentTab.value)
        setTimeout(() => {
            if (tabStore.getCurrentTab.fullPath == '/bdc/case/list' || tabStore.getCurrentTab.fullPath == '/bdc/case/AdminList') {
                const tabStore = useTabsStore()
                tabStore.refreshTab()
            }
        }, 500)
    } else {
        router.push('/analysis')
    }
}