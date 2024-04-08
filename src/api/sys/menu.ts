/**
 * 菜单接口
 * component 模块
 * redirect 重定向
 */
// import aa from './model/menu.json'
// import { defHttp } from "/@/utils/http/demo";
import { defHttp } from "/@/utils/http/axios/index";
// import aa from './model/onemapmenu.json'
// import { resolve } from "path";
// import { IgsInfoModel } from "./model/igsModel";
import { menuModel } from "./model/menuModel";
// import { collectListModel } from "/@/api/sys/model/collectListModel";
// import { getMenuListResultModel } from "./model/menuModel";
enum api {
    // menuUrlSzls = '/src/api/sys/model/menu.json',
    menuUrlapi = '/src/assets/sys/menu.json',
    menuUrlApi = '/api/zrzy-system/menu/tree?subsystemId=1'
    // menuUrlapi = '/sys/zrzy-usermanager-biz/menu/getUserMenu?subsystemName=数据管理系统',
    // allMenuUrlapi = '/api/sys/zrzy-usermanager-biz/menu/getUserMenuAll?subsystemName=数据管理系统',
    // treeApi = '/onemap/zrzy-om-resourcemanage/resourcedir/appcatelog?catelogId=26',
    // collectListApi = '/onemap/zrzy-om-resourcemanage/collect/list',
    // addCollectApi = '/onemap/zrzy-om-resourcemanage/collect/addcollect',
    // delCollectApi = '/onemap/zrzy-om-resourcemanage/collect/cancel?metaguidList='
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
        defHttp.get({ url: api.menuUrlApi }, { withToken: true }).then((res) => {
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
/**
 * 目录树
 * @returns
 */
export function getDataTreeList() {
    // return new Promise((resolve) => {
    //     defHttp.post<IgsInfoModel[]>({ url: api.treeApi }, { withToken: true }).then((res) => {
    //         resolve(res)
    //     }).catch((err => {
    //         resolve(null)
    //     }))
    // })
}

/**
 * 目录树收藏列表
 * @returns
 */
export function getCollectDataList() {
    // return new Promise((resolve) => {
    //     defHttp.get<collectListModel[]>({ url: api.collectListApi }, { withToken: true }).then((res) => {
    //         console.log('res', res)
    //         resolve(res)
    //     }).catch((err => {
    //         resolve(null)
    //     }))
    // })
}

/**
 * 目录树收藏
 * @param data
 * @returns
 */
export function addCollectDataList(data) {
    // return new Promise((resolve) => {
    //     defHttp.post({ url: api.addCollectApi, params: data }, { withToken: true }).then((res) => {
    //         resolve(res)
    //     }).catch((err => {
    //         resolve(null)
    //     }))
    // })
}

/**
 * 目录树取消收藏
 * @param data
 * @returns
 */

export function delCollectDataList(data) {
    // return new Promise((resolve) => {
    //     defHttp.get({ url: `${api.delCollectApi}${data}` }, { withToken: true }).then((res) => {
    //         resolve(res)
    //     }).catch((err => {
    //         resolve(null)
    //     }))
    // })
}
