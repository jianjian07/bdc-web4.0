import { defineStore } from "pinia";
import { store } from '/@/store';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE,REFRESH_ROUTE } from "../../router/routes/basic"
import { AppRouteRecordRaw } from "../../router/types";
import { getMenuList, getMenuListByJson, getMenuListBySysId } from "/@/api/sys/menu"
import { dynamicRouter } from "/@/router/helper/routeHelper"
import { menuModel } from "/@/api/sys/model/menuModel";
import { IGS_INFO } from "/@/enums/cacheEnum";
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { toolbarModel } from '/@/api/sys/model/toolBarModel'
import { IgsInfoModel } from '/@/api/sys/model/igsModel'
interface PermissionState {
    // 是否已动态添加路由
    isDynamicAddedRoute: boolean;
    menuList: menuModel[];
    toolBarInfo: toolbarModel[],
    igsInfo: IgsInfoModel[]
}
/**
 * 菜单及工具栏
 */
export const usePermissionStore = defineStore({
    id: 'app-permission',
    state: (): PermissionState => ({
        // 是否已动态添加路由
        isDynamicAddedRoute: false,
        menuList: [],
        toolBarInfo: [],
        igsInfo: []
    }),
    getters: {
        getIsDynamicAddedRoute(): boolean {
            return this.isDynamicAddedRoute;
        },
        getMenuInfo(): menuModel[] {
            // return this.menuList || getAuthCache(MENU_INFO);
            // return this.menuList.length > 0 ? this.menuList : getAuthCache(MENU_INFO);
            return this.menuList
        },
        getToolBarInfo(): toolbarModel[] {
            return this.toolBarInfo;
        },
        getIgsInfo(): IgsInfoModel[] {
            return this.igsInfo.length > 0 ? this.igsInfo : getAuthCache<IgsInfoModel[]>(IGS_INFO);
        }
    },
    actions: {
        setDynamicAddedRoute(added: boolean) {
            this.isDynamicAddedRoute = added;
        },
        setMenuList(list: any) {
            this.menuList = list;
        },
        setToolBarList(list: any) {
            this.toolBarInfo = list;
        },
        setIgsList(list: IgsInfoModel[]) {
            this.igsInfo = list;
            setAuthCache(IGS_INFO, list);
        },
        async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
            // const mock = import.meta.env.VITE_GLOB_MOCK
            // 获取菜单   后面改为接口
            let routes: AppRouteRecordRaw[] = [];
            let routeList: AppRouteRecordRaw[] = [];
            // 动态
            if (this.getMenuInfo != null && this.getMenuInfo.length > 0) {
                routeList = this.getMenuInfo
            } else {
                // let list = (await getMenuListByJson()) as AppRouteRecordRaw[]
                let list = (await getMenuListBySysId()) as AppRouteRecordRaw[]
                // if (!list || list?.length == 0) {
                //     list = (await getMenuListByJson()) as AppRouteRecordRaw[]
                // }
                // let list = (await getMenuList()) as AppRouteRecordRaw[]
                if (list != null && list.length > 0) {
                    routeList = (list) as AppRouteRecordRaw[]
                    this.setMenuList(list)
                    // this.setToolBarList(toolbar)
                }
            }

            routeList = dynamicRouter(routeList)
            // routes = [...routeList, PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE,REFRESH_ROUTE]
            routes = [...routeList, REDIRECT_ROUTE, REFRESH_ROUTE]
            routes.push(ERROR_LOG_ROUTE);
            return routes
        },
        resetState(): void {
            this.setDynamicAddedRoute(false)
            this.setMenuList(null);
            this.setIgsList([]);
        },
    }
})
// 需要在设置之外使用
export function usePermissionStoreWithOut() {
    return usePermissionStore(store);
}
