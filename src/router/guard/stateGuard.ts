import type { Router } from 'vue-router';
import { useUserStore } from '/@/store/modules/user';
import { PageEnum } from '/@/enums/pageEnum';
import { usePermissionStore } from '/@/store/modules/permission';
import { useTabsStore } from "/@/store/modules/tabs"
import { updateCurrentRoute } from "/@/router"

export function createStateGuard(router: Router) {
  router.afterEach((to) => {
    // Just enter the login page and clear the authentication information
    updateCurrentRoute(to)
    if (to.path === PageEnum.BASE_LOGIN) {
      const userStore = useUserStore();
      const permissionStore = usePermissionStore();
      const tabStore = useTabsStore()
      userStore.resetState();
      permissionStore.resetState();
      tabStore.resetTabList()
      tabStore.resetCacheTabList()
    }
  });
}
