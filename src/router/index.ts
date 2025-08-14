import { App, reactive } from "vue"
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { basicRoutes } from "./routes";
import { useUserStoreWithOut } from "/@/store/modules/user"
import { PAGE_NOT_FOUND_ROUTE } from "/@/router/routes/basic"
import { usePermissionStoreWithOut } from "/@/store/modules/permission"

declare global {
  interface Window {
    routerMatcherBroken: boolean;
    getLastPushParams: () => any;
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: basicRoutes as unknown as RouteRecordRaw[],
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 当前路由
export let currentRoute: any = reactive(router.currentRoute.value || null)

// 初始化全局标记：Vue Router matcher是否已损坏
if (typeof window.routerMatcherBroken === 'undefined') {
  window.routerMatcherBroken = false
}

// 保存最后一次push的参数
let lastPushParams = null

// 通用路由保护：push损坏后自动降级为replace
const originalPush = router.push

// 重写push方法
router.push = function(to: any) {
  lastPushParams = to
  // console.log('保存push参数:', to)

  if (window.routerMatcherBroken) {
    // console.log('🔧 检测到matcher已损坏，push自动降级为replace:', to)

    // 确保参数完整传递
    if (typeof to === 'string') {
      return this.replace(to)
    } else {
      // 对象形式时，确保所有属性都传递
      const fullLocation = { ...to }
      // console.log('完整参数replace:', fullLocation)
      return this.replace(fullLocation)
    }
  }

  return originalPush.call(this, to)
}

// 获取最后push参数的方法
window.getLastPushParams = function() {
  return lastPushParams
}

/**
 * 更新当前路由
 * @param _currentRoute
 */
export function updateCurrentRoute(_currentRoute) {
  Object.assign(currentRoute, _currentRoute)
}

/**
 * 获取当前路由
 */
export function getCurrentRoute() {
 return currentRoute
}

export async function setupRouter(app: App<Element>) {
  // 如果已经是登陆状态 先动态添加路由
  const userStore = useUserStoreWithOut()
  const permissionStore = usePermissionStoreWithOut();
  if (userStore.getToken) {
    const routes = await permissionStore.buildRoutesAction();
    routes.forEach((route) => {
      router.addRoute(route as unknown as RouteRecordRaw);
    });

    router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
    permissionStore.setDynamicAddedRoute(true);
  }
  app.use(router);
  await router.isReady()  
  currentRoute = Object.assign(currentRoute, router.currentRoute.value)
}
