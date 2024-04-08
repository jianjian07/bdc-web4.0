import { defHttp } from "/@/utils/http/axios/index";
import { getAuthCache } from "/@/utils/auth"
import { DB_DICT_DATA_KEY } from "/@/enums/cacheEnum"

// enum api {
//   queryDict = '/dzzzapi/zrzy-dz-dzzz/sysdict/querySysDictTree' // 查询数据字典
// }

// /**
//  * 根据dictCode查询数据字典
//  * @param code
//  */
// export function dictByCode(code) {
//   return new Promise((resolve, reject) => {
//     defHttp.get({ url: api.queryDict, params: { dictCode: code } }, { withToken: true }).then((res) => {
//       if (res.items && res.items.length) {
//         resolve(res.items)
//       } else {
//         resolve([])
//       }
//     })
//   })
// }

/**
 * 从缓存中根据dictCode获取数据字典
 * @param codeType
 */
export function getCacheDictItemsByCodeType(codeType) {
  if (getAuthCache(DB_DICT_DATA_KEY)) {
    let dictItems: any = getAuthCache(DB_DICT_DATA_KEY)
    let dictItemList: any = dictItems.filter(item => codeType == item.CODETYPE)
    if (dictItemList) {
      return dictItemList
    }
  }
}

/**
 * 从缓存中根据code获取数据字典名称
 * @param code 
 * @returns 
 */
export function getCachgetCacheDictItemNameByCode(code){
  if (getAuthCache(DB_DICT_DATA_KEY)) {
    let dictItems: any = getAuthCache(DB_DICT_DATA_KEY)
    let dictItem: any = dictItems.filter(item => code == item.CODE)
    if (dictItem) {
      return dictItem[0].CODENAME
    }
  }
}

/**
 * 获取数据字典选项
 * @param codeType
 */
export function dict(codeType) {
  let item = getCacheDictItemsByCodeType(codeType)
  return item ? item : []
}

/**
 * 获取数据字典名称
 * @param code 
 * @returns 
 */
export function dictName(code){
  let item = getCachgetCacheDictItemNameByCode(code)
  return item ? item : code
}

