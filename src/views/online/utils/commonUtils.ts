import { useUserStore } from '/@/store/modules/user';
import { defineComponent } from "vue"
import { validateRequired } from "/@/views/online/utils/validateUtil"
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
 * @param record
 */
export function validateRules(rules, value, record?: any) {
  let msg = ''
  let findRequired = rules.find(rule => rule.required)
  if (findRequired) {
    if (validateRequired(value)) {
      msg = findRequired.message
      return msg
    }
  }

  let flag = !!value
  let findValidator = rules.find(rule => rule.validator)
  if (findValidator) {
    flag = true
  }

  if (flag) {
    for (let i = 0; i < rules.length; i++) {
      let pattern = rules[i].pattern
      if (pattern) {
        if (!pattern.test(value)) {
          msg = rules[i].message
          break;
        }
      }
      
      if (rules[i].validator) {
        msg = rules[i].validator(value, record)
        break
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
export async function setInputStatus(column, record) {
  let res = validateRules(column.rules, record[column.key], record)
  if (!!res) {
    record[column.key + 'Status'] = 'error'
  } else {
    record[column.key + 'Status'] = ''
  }
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

/**
 * 数据字典获取标题
 * @param dict
 * @param value
 */
export function getLabelByDictCode(dict: any, value: any) {
  return getDictItemsByCode(dict).filter((_v: any) => _v.dictCode == value)[0]?.dictName || ''
}

/**
 * 分类字典获取标题
 * @param dict
 * @param value
 */
export function getLabelByTreeDictCode(dict: any, value: any) {
  let find = findNode(getTreeDictItemsByCode(dict),value)
  return find?.dictName || find?.label || ''
}

/**
 * 行合并
 * @param data
 * @param rowIndex
 * @param key
 */
export function getRowSpan(data, rowIndex, key) {
  let rowSpan = 1;

  // 遍历后续行，检查当前列 key 是否值相同
  for (let i = rowIndex + 1; i < data.length; i++) {
    if (data[i][key] !== data[rowIndex][key]) {
      break;
    }
    rowSpan++;
  }

  // 如果前面的行存在相同的值，rowSpan 为 0（表示应跳过合并）
  for (let i = rowIndex - 1; i >= 0; i--) {
    if (data[i][key] === data[rowIndex][key]) {
      return 0; // 当前行不需要渲染
    }
  }

  return rowSpan;
}

/**对比属性**/
/**
 * 比较两个对象的属性值，返回变化的属性
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @returns 不同属性值组成的对象
 */
export function compareObjects(obj1: any, obj2: any) {
    // 定义一个空数组用于存储不同的属性值
    let diff: any = {}
    for (const key in obj1) {
        // 如果属性值不同，则将该属性和obj1和obj2的值存入diff对象
        if (obj1[key] !== obj2[key]) {
            diff[key] = obj2[key];
        }
    }
    return diff;
}
/**对比属性**/

/**
 * 增加样式表
 * @param css
 */
export function loadStyle(css) {
    let style = document.createElement('style')
    style.type = 'text/css'
    try {
        style.appendChild(document.createTextNode(css))
    } catch (e) {
        style.styleSheet.cssText = css
    }
    let head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
}