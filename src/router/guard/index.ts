import nProgress from "nprogress";
import { unref } from "vue";
import { Router } from "vue-router";
import { createPermissionGuard } from "./permissionGuard";
import { createStateGuard } from "./stateGuard";
import { useAppStoreWithOut } from "/@/store/modules/app";

export function setupRouterGuard(router: Router) {
    // 许可保护机制
    createPermissionGuard(router)
    // 状态机制
    createStateGuard(router)
    createProgressGuard(router);
}
export function createProgressGuard(router: Router) {
    const getOpenNProgress = true;
    const appStore = useAppStoreWithOut();
    router.beforeEach(async (to) => {
        if (to.meta.loaded) {
            return true;
        }
        appStore.setPageLoading(true)
        unref(getOpenNProgress) && nProgress.start();
        return true;
    });

    router.afterEach(async () => {
        unref(getOpenNProgress) && nProgress.done();
        appStore.setPageLoading(false)
        return true;
    });
}
