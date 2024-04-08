import { computed, unref } from "vue";
import { MenuSetting } from "/#/config";
import { useAppStore } from "/@/store/modules/app";

export function useMenuSetting() {
    const appStore = useAppStore();
    const getCollapsed = computed(() => appStore.getProjectConfig.menuSetting.collapsed);
    function toggleCollapsed() {
        setMenuSetting({
            collapsed: !unref(getCollapsed),
        });
    }
    function setMenuSetting(menuSetting: Partial<MenuSetting>): void {
        appStore.setProjectConfig({ menuSetting });
    }
    return {
        getCollapsed,
        toggleCollapsed
    }
}
