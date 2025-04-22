import { Router, RouteRecordRaw } from "vue-router";
import { PageEnum } from "/@/enums/pageEnum";
import { PAGE_NOT_FOUND_ROUTE } from "/@/router/routes/basic";
import { usePermissionStoreWithOut } from "/@/store/modules/permission";
import { useUserStoreWithOut } from "/@/store/modules/user";
import { nextTick } from "vue"

const LOGIN_PATH = PageEnum.BASE_LOGIN
const BASE_ZSTP = PageEnum.BASE_ZSTP
// const BASE_EXTRA = PageEnum.BASE_EXTRA
const ERROR_401 = PageEnum.ERROR_401

const whitePathList: PageEnum[] = [LOGIN_PATH, BASE_ZSTP, ERROR_401, PageEnum.BASE_INIT];
export function createPermissionGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const permissionStore = usePermissionStoreWithOut();

  router.beforeEach(async (to, from, next) => {
    /***************上架开始****************/
    // 非上架环境屏蔽该部分代码
    // const licence = userStore.getLicence
    // if (licence == "") {
    //   // 先去验证授权
    //   const l = await userStore.licenceAction()
    //   userStore.setLicence(l)
    //   if (l == 'false' || l == '') {
    //     // 跳转到401 未授权页面
    //     next({ path: '/401', replace: true })
    //     return
    //   }
    // } else if (licence == '-1') {
    //   // 跳转到401 未授权页面
    //   next({ path: '/401', replace: true })
    //   return;
    // }
    /***************上架结束****************/
    // 首页特殊处理
    let tabTitle = to.meta.title || to.name
    document.title = tabTitle ? tabTitle + ' · ' + '不动产登记信息管理系统' : '不动产登记信息管理系统'

    if (from.path === '/' && to.path === PageEnum.BASE_HOME && userStore.getUserInfo.homePath && userStore.getUserInfo.homePath !== PageEnum.BASE_HOME) {
      next(userStore.getUserInfo.homePath);
      return;
    }
    const token = userStore.getToken;
    // 白名单
    if (whitePathList.includes(to.path as PageEnum)) {
      if (to.path === LOGIN_PATH && token) {
        const isSessionTimeout = userStore.getSessionTimeout;
        try {
          await userStore.afterLoginAction();
          if (!isSessionTimeout) {
            next((to.query?.redirect as string) || '/');
            return;
          }
        } catch { }
      }
      next();
      return;
    }

    // token不存在
    if (!token) {
      // You can access without permission. You need to set the routing meta.ignoreAuth to true
      if (to.meta.ignoreAuth) {
        next();
        return;
      }

      // if (BASE_EXTRA.includes(to.path)) {
      //   const formData = {
      //     username: "mSkNhL7oDgrElRf0s0dNCg==",
      //     password: "WKKzoI74dTZv3hSGGshnpg==",
      //     goHome: false
      //   };
      //   await userStore.login(formData);
      //   next(to.path)
      //   return
      // }
      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        path: LOGIN_PATH,
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }

    // Jump to the 404 page after processing the login
    if (from.path === LOGIN_PATH && to.name === PAGE_NOT_FOUND_ROUTE.name && to.fullPath !== (userStore.getUserInfo.homePath || PageEnum.BASE_HOME)) {
      next(userStore.getUserInfo.homePath || PageEnum.BASE_HOME);
      return;
    }

    // 上次获取时间为空的时候  重新获取用户信息
    if (userStore.getLastUpdateTime === 0) {
      try {
        await userStore.getUserInfoAction();
      } catch (err) {
        console.info(err);
        next();
      }
    }

    if (permissionStore.getIsDynamicAddedRoute) {
      next();
      return;
    }
    const routes = await permissionStore.buildRoutesAction();

    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw);
    });

    router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);

    permissionStore.setDynamicAddedRoute(true);
    await nextTick()
    // console.log('Updated Routes1:', router.getRoutes().map(route => route.path));
    if (to.name === PAGE_NOT_FOUND_ROUTE.name) {
      // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
      next({ path: to.fullPath, replace: true, query: to.query });
    } else {
      const redirectPath = (from.query.redirect || to.path) as string;
      const redirect = decodeURIComponent(redirectPath);
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect };
      next(nextData);
    }
  });
}
