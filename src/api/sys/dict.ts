import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import { useUserStore } from "/@/store/modules/user"
enum api {
    getDictApi = '/api/zrzy-system/sys/dict/tree',
    delUrl = '/api/zrzy-system/sys/dict/deleteByIdList',//'/magicapi/zrzy-form/magic/dict/delete',//
    updateHasChildUrl = '/api/zrzy-system/sys/dict/updateHasChild',
    getRuleListApi = '/api/zrzy-form/onlWonderRule/getRuleList'
}

//***其它接口待重构，后续字典相关会统一提取到这个脚本文件  页面只保留业务逻辑处理
export function del(id: string) {
    return new Promise<any>((resolve) => {
        const strings = [id];
        defHttp.post({ url: api.delUrl, data: strings }, { withToken: true }).then((res) => {
            resolve(res)
        }).catch(err => {
            message.error('删除失败')
        })
    })
}
/**
 * 更新是否存在子项-hasChild字段状态
 * @param parentId
 * @param hasChild
 */
export function updateHasChild(parentId: string, hasChild: string) {
    defHttp.post({ url: api.updateHasChildUrl, params: { id: parentId, hasChild: hasChild } }, { withToken: true }).then((res) => {
    }).catch(err => {
        console.info(err)
    })
}
/**
 * 数据字典/分类字典整合
 * @returns 
 */
export function getDict() {
    const userStore = useUserStore();
    return new Promise((resolve, reject) => {
        defHttp.get({ url: api.getDictApi }, { withToken: true }).then((res) => {
            if (res) {
                let dictList = res.result.filter((f: { dictType: string; }) => f.dictType == '0')
                let categoryDictList = res.result.filter((f: { dictType: string; }) => f.dictType == '1')
                let dicts = userStore.formatDictList(dictList)
                userStore.setAllDicts(dicts)
                let categorydicts = userStore.formatDictList(categoryDictList)
                userStore.setAllCategory(categorydicts)
                resolve(true);
            }
            else {
                reject(false);
            }
        })
    })
}
// // 数据字典
// export function getDataDict() {
//     const userStore = useUserStore();
//     return new Promise((resolve, reject) => {
//         defHttp.get({ url: api.getDictApi, params: { dictType: '0' } }, { withToken: true }).then((res) => {
//             if (res) {
//                 let dicts = userStore.formatDictList(res.result)
//                 userStore.setAllDicts(dicts)
//                 resolve(true);
//             }
//             else {
//                 reject(false);
//             }
//         })
//     })

// }

// // 分类字典
// export function getCategoryDict() {
//     const userStore = useUserStore();
//     defHttp.get({ url: api.getDictApi, params: { dictType: '1' } }, { withToken: true }).then((res) => {
//         if (res) {
//             let dicts = userStore.formatDictList(res.result)
//             userStore.setAllCategory(dicts)
//         }
//     })
// }

// 规则
export function getRuleList() {
    const userStore = useUserStore();

    defHttp.get({ url: api.getRuleListApi }, { withToken: true }).then((res) => {
        res.list = res.result.records;
        if (res && res.list) {
            let sysValidateRuleList = res.list.filter(f => f.ruleType == 'validate')
            if (sysValidateRuleList) {
                userStore.setValidateRuleList(sysValidateRuleList)
            }
            let sysCodeRuleList = res.list.filter(f => f.ruleType == 'code')
            if (sysCodeRuleList) {
                userStore.setCodeRuleList(sysCodeRuleList)
            }
            let sysDataRuleList = res.list.filter(f => f.ruleType == 'data')
            if (sysDataRuleList) {
                userStore.setDataRuleList(sysDataRuleList)
            }
            let sysApiRuleList = res.list.filter(f => f.ruleType == 'api')
            if (sysApiRuleList) {
                userStore.setApiRuleList(sysApiRuleList)
            }
            let sysTransferRuleList = res.list.filter(f => f.ywlx == 'transfer')
            if (sysTransferRuleList) {
                userStore.setTransferRuleList(sysTransferRuleList)
            }
            let sysLineRuleList = res.list.filter(f => f.ywlx == 'line')
            if (sysLineRuleList) {
                userStore.setLineRuleList(sysLineRuleList)
            }
        }
    })
}

/**
 * 规则列表
 * @param ruleType
 */
export function getRuleListByRuleType(ruleType) {
    return new Promise((resolve) => {
        defHttp.post({ url: api.getRuleListApi, params: { ruleType: ruleType } }, { withToken: true }).then((res) => {
            resolve(res && res.list ? res.list : [])
        }).catch(err => {
            resolve(false)
        })
    })
}

export interface dictProps extends baseProps {
    children: baseProps[]
}
interface baseProps {
    value: string,
    label: string,
}
