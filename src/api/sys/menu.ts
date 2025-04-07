/**
 * 菜单接口
 * component 模块
 * redirect 重定向
 */
// import { defHttp } from "/@/utils/http/demo";
import { defHttp } from "/@/utils/http/axios/index";
// import { resolve } from "path";
import { menuModel } from "./model/menuModel";
// import { getMenuListResultModel } from "./model/menuModel";
enum api {
    menuUrlapi = '/src/assets/sys/menu.json',
    // menuUrlApi = '/api/zrzy-system/menu/tree?subsystemId=1'
    menuUrlApi = '/api/zrzy-system/menu/getPermissionList',
    permissionListApi = '/api/zrzy-system/menu/getPermissionList'
    // menuUrlapi = '/sys/zrzy-usermanager-biz/menu/getUserMenu?subsystemName=数据管理系统',
    // allMenuUrlapi = '/api/sys/zrzy-usermanager-biz/menu/getUserMenuAll?subsystemName=数据管理系统',
}
/**
 * @description: 用户菜单
 */
export function getMenuList() {
    // return new Promise((resolve) => {
    //     defHttp.get<menuModel[]>({ url: api.allMenuUrlapi, params: {} }, { withToken: true }).then((res) => {
    //         resolve(res)
    //     }).catch((err => {
    //         resolve(null)
    //     }))
    // })
}
/**
 * @description: 用户菜单
 */
export function getMenuListByJson() {
    return new Promise((resolve) => {
        defHttp.get<menuModel[]>({ url: api.menuUrlapi }, { withToken: true }).then((res) => {
            resolve(res)
        }).catch((err => {
            resolve(null)
        }))
    })
}


/**
 * 根据默认的系统id获取菜单
 */
export function getMenuListBySysId() {
    return new Promise((resolve) => {
        let subsystemId = window.settingConfig.subsystemId
        defHttp.get({ url: api.permissionListApi + `?subsystemId=${subsystemId}` }, { withToken: true }).then((res) => {
            if (res.code == 200) {
                resolve(res.result)
            } else {
                resolve([])
            }
        }).catch((err => {
            resolve(null)
        }))
    })
}
