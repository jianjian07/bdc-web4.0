import { useUserStore } from '/@/store/modules/user';
// import { casDicts } from "/@/mock/casDict"
// import { tableDicts } from "/@/mock/tableDict"
import { defineComponent } from "vue"
import { validateRequired } from "/@/utils/form/validateUtil"
import { defHttp } from '/@/utils/http/axios';

export const getDictItemsByCode = (dictCode: string) => {
    const userStore = useUserStore();
    let dicts = userStore.getAllDicts
    let find = dicts.find((t: { value: string; }) => t.value == dictCode)
    return find ? find.children : [];
};

export const getTreeDictItemsByCode = (dictCode: string) => {
    const userStore = useUserStore();
    let treeDicts = userStore.getAllCategory
    let find = treeDicts.find((t: { value: string }) => t.value == dictCode)
    return find ? find.children : []
}

// 处理多选下拉框数据
export function formatMultipleSelectValue(value) {
    if (typeof value == "string") {
        return value ? (value.includes(',') ? value.split(',') : [value]) : undefined
    }
    return undefined
}

// 处理多选树下拉框数据
export function formatMultipleTreeSelectValue(value, code, punctuation?: any) {
    if (typeof value == "string") {
        punctuation = punctuation ? punctuation : ','
        let dicts = getTreeDictItemsByCode(code)
        let baseValue = value ? (value.includes(punctuation) ? value.split(punctuation) : [value]) : undefined
        if (baseValue) {
            return baseValue.map((base) => {
                return {
                    label: findNode(dicts, base)?.label,
                    value: base
                }
            })
        }
    }
    return undefined
}

// 根据规则编码获取规则
export const getValidateRuleByCode = (ruleCode: string) => {
    const userStore = useUserStore();
    let ruleList = userStore.getValidateRuleList
    let find = ruleList.find((t: { ruleCode: string }) => t.ruleCode == ruleCode)
    return find ? find : null
}

// 根据规则编码获取api规则
export const getApiRuleByCode = (ruleCode: string) => {
    const userStore = useUserStore();
    let ruleList = userStore.getApiRuleList
    let find = ruleList.find((t: { ruleCode: string }) => t.ruleCode == ruleCode)
    return find ? find : null
}

export function findNode(arr, key, valueName = 'value') {
    for (let i = 0; i < arr.length; i++) {
        let node = arr[i];
        if (node[valueName] === key) return node;
        if (node.children && node.children.length > 0) {
            let foundNode = findNode(node.children, key, valueName);
            if (foundNode) return foundNode;
        }
    }
    return null;
}

export const getCasDictItemsByCode = (dictCode: string) => {
    // let find = casDicts.find((t: { value: string }) => t.value == dictCode)
    // return find ? find.children : []
}

export const getTableDictItemByPath = (filePath: string) => {
    // let find = tableDicts.find((t: { filePath: string }) => t.filePath == filePath)
    // return find ? find.options : []
}

// vnode
export function useVNodes() {
    const VNodes = defineComponent({
        props: {
            vnodes: {
                type: Object,
                required: true,
            },
        },
        render() {
            return this.vnodes;
        },
    });
    return VNodes
}

/**
 * 判断是否是json数据
 * @param str
 */
export function isJsonData(str) {
    if (typeof str === "string") {
        try {
            var obj = JSON.parse(str)
            if (obj && typeof obj === "object") {
                return true
            } else {
                return false
            }
        } catch (e) {
            // console.log("$isJSON error：", e)
            return false
        }
    } else {
        return false
    }
}

/**
 * 校验规则(表格)
 * @param key
 * @param value
 */
export function validateRules(rules, value) {
  let msg = ''
  let findRequired = rules.find(rule => rule.required)
  if (findRequired) {
    if (validateRequired(value)) {
      msg = findRequired.message
      return msg
    } 
  }
  
  if (value) {
    for (let i = 0; i < rules.length; i++) {
      let pattern = rules[i].pattern
      if (pattern) {
        if (!pattern.test(value)) {
          msg = rules[i].message
          break;
        }
      }
    }
  }
  return msg
}

/**
 * 设置input的status
 * @param column
 * @param record
 */
export function setInputStatus(column, record) {
  if (validateRules(column.rules, record[column.key])){
    record[column.key + 'Status'] = 'error'
  } else {
    record[column.key + 'Status'] = ''
  }
}

/**
 * 根据受理编号获取权利其他配置
 * @param slbh
 */
export function getQlqtqkBySLBH(slbh: any, viewData: any) {
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/getConfigQlqtBySlbh',
      params: { slbh: slbh },
      data: {}
    },{ withToken: true }
    ).then((res: any) => {
      if(res && res.success) {
        let result = manageQLQT(res.result, viewData)
        resolve(result)
      } else {
        reject()
      }
    }).catch((error: any) => {
      console.log(error)
      reject()
    })
  })
}

/**
 * 根据业务号获取权利其他配置
 * @param slbh
 * @param ywh
 */
export function getQlqtqkByMap(slbh: any, ywh: any, viewData: any) {
  const quickParam = { ywh: ywh, slbh: slbh }
  const xmlParam = { ywh: ywh, slbh: slbh }
  const param = { quickParam: quickParam, xmlParam: xmlParam }
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/getConfigQlqtByMap',
      data: param
    },{
      withToken: true
    }).then((res: any) => {
      if(res && res.success) {
        let result = manageQLQT(res.result, viewData)
        resolve(result)
      } else {
        reject()
      }
    }).catch(err => {
      console.log(err)
      reject()
    })
  })
}

/**
 * 替换获取到的权利其他配置值中的占位符为实际值
 * 规则为获取所有匹配 viewData.value. 形式的占位符并替换成实际值
 * @param qlqtConfig
 * @param viewData
 */
function manageQLQT(qlqtConfig: any, viewData: any) {
  // 获取未赋值的占位符，从表单数据中赋值
  let reg = /viewData\.value\.[^;；"”\s\u4e00-\u9fa5]*;?/gm //匹配以viewData.value.开头并以分号/反引号/中文/空格结尾的
  // let reg = /(?<=\[)\S+(?=\])/gm //匹配中括号，返回结果不包括中括号
  let qlqtmatch = qlqtConfig.match(reg)
  if (qlqtmatch) {
    qlqtConfig = qlqtConfig.replace('[', '')
    qlqtConfig = qlqtConfig.replace(']', '')
    qlqtmatch.forEach((value) => {
      // 获取表名及字段名
      let arr = value.split('.')
      if (arr && arr.length == 4 && viewData.value[arr[2]]) {
        let realValue = viewData.value[arr[2]][arr[3]] ? viewData.value[arr[2]][arr[3]] : ''
        qlqtConfig = qlqtConfig.replace(value, realValue)
      } else {
        console.log('占位符格式不正确！应为viewData.value.[表名].[字段名]，如有单位，中间请空格')
      }
      
    })
  }
  return qlqtConfig
}

/**
 * 获取证件种类字典值对应的规则code
 * @param dictCode
 */
export function getZjzlRuleCode(dictCode) {
  let rule 
  switch (dictCode) {
    case '1':
      // 身份证
      rule = 'idCard'
      break;
    case '2':
      // 港澳台身份证
      rule = 'HMTIdCard'
      break;
    case '3':
      // 护照
      rule = 'passport'
      break;
    case '4':
      // 户口簿
      rule = 'householdRegister'
      break;
    case '5':
      // 军官证（士兵证）
      rule = 'officerCertificate'
      break;
    case '6':
      // 组织机构代码
      rule = 'organizationCode'
      break;
    case '7':
      // 营业执照
      rule = 'businessLicense'
      break;
    case '8':
      // 统一社会信用代码
      rule = 'socialCode'
      break;
    case '9':
      // 外国人永久居留证
      rule = 'foreignerIdCard'
      break;
    case '99':
      // 其他
      rule = 'otherId'
      break;
  }
  return rule
}