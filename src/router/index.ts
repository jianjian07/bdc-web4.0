import { App } from "vue";
import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from "vue-router";
import { basicRoutes } from "./routes";
import { useUserStoreWithOut } from "/@/store/modules/user"
import { PAGE_NOT_FOUND_ROUTE } from "/@/router/routes/basic"
import { usePermissionStoreWithOut } from "/@/store/modules/permission"
export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: basicRoutes as unknown as RouteRecordRaw[],
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

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
}  
