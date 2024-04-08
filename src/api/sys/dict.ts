import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
enum api {
    getDictApi = '/magicapi/zrzy-form/magic/dict/tree',
    delUrl = '/magicapi/zrzy-form/magic/dict/delete',
    updateHasChildUrl = '/magicapi/zrzy-form/magic/dict/updateHasChild',
    getRuleListApi ='/magicapi/zrzy-form/magic/form/rule/list'
}
//***其它接口待重构，后续字典相关会统一提取到这个脚本文件  页面只保留业务逻辑处理
export function del(id: string) {
    return new Promise<any>((resolve) => {
        defHttp.post({ url: api.delUrl, params: { id: id } }, { withToken: true }).then((res) => {
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
    defHttp.post({ url: api.updateHasChildUrl, data: { id: parentId, hasChild: hasChild } }, { withToken: true }).then((res) => {
    }).catch(err => {
        console.info(err)
    })
}

// 数据字典
export function getDataDict() {
    return new Promise((resolve) => {
        defHttp.post({ url: api.getDictApi, params: { dict_type: '0'} }, { withToken: true }).then((res) => {
            if (res) {
                resolve(res)
            } else {
                resolve(false)
            }
        }).catch(err => {
            resolve(false)
        })
    })
}

// 分类字典
export function getCategoryDict() {
    return new Promise((resolve) => {
        defHttp.post({ url: api.getDictApi, params: { dict_type: '1'} }, { withToken: true }).then((res) => {
            if (res) {
                resolve(res)
            } else {
                resolve(false)
            }
        }).catch(err => {
            resolve(false)
        })
    })
}

// 规则列表 (校验规则)
export function getRuleListByValidate() {
    return new Promise((resolve) => {
        defHttp.post({ url: api.getRuleListApi, params: { ruleType: 'validate' } }, { withToken: true }).then((res) => {
            resolve(res && res.list ? res.list : [] )
        }).catch(err => {
            resolve(false)
        })
    })
}

/**
 * 规则列表
 * @param ruleType
 */
export function getRuleListByRuleType(ruleType) {
    return new Promise((resolve) => {
        defHttp.post({ url: api.getRuleListApi, params: { ruleType: ruleType } }, { withToken: true }).then((res) => {
            resolve(res && res.list ? res.list : [] )
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
