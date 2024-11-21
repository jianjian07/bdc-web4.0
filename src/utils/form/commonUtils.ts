import { useUserStore } from '/@/store/modules/user';
// import { casDicts } from "/@/mock/casDict"
// import { tableDicts } from "/@/mock/tableDict"
import { defineComponent } from "vue"
import { validateRequired } from "/@/utils/form/validateUtil"

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
    record[column.key + 'status'] = 'error'
  } else {
    record[column.key + 'status'] = ''
  }
}