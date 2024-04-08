import { computed, unref } from "vue";
import { useAppStore } from "/@/store/modules/app";

export function useTabsSetting() {
  const appStore = useAppStore();
  const getTabsShow = computed(() => appStore.getProjectConfig.multiTabsSetting);
  function toggleShowTabs() {
    setTabsSetting(!unref(getTabsShow));
  }
  function setTabsSetting(showTabs: boolean): void {
    appStore.setProjectConfig({ multiTabsSetting: showTabs});
  }
  return {
    getTabsShow,
    toggleShowTabs
  }
}
