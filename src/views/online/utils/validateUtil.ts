import { getValidateRuleByCode } from "/@/views/online/utils/commonUtils"

/**
 * 必填校验
 * @param value
 * @param msg
 */
export function validateRequired(value: any) {
  let msg = '不能为空'
  if (value !== undefined && value !== null) {
    if (typeof value == 'string') {
      if (value.match(/^\s*$/)) {
        return msg
      }
    } else if (Array.isArray(value)) {
      // 时间范围或单选多选组件
      let newArr = value.filter((item) => {
        if (item) {
          if (typeof item == "string" && item.trim()) {
            return item
          } else if (typeof item == "object") {
            return item
          }
        }
      })
      return newArr.length ? '' : msg
    }
    return ''
  } else {
    return msg
  }
}

/**
 * 根据正则进行校验
 * @param type
 * @param msg
 * @param value
 */
export function validateRegOld(type: string, msg: string, value: string) {
  let reg
  let regResult = true
  switch (type) {
    case 'number':
      reg = /^-?\d+(\.?\d+|\d?)$/
      break;
    case 'email':
      reg = /^([\w]+\.*)([\w]+)@[\w]+\.\w{3}(\.\w{2}|)$/
      break;
    case 'lxdh':
      reg = /^1(3|4|5|7|8)\d{9}$|^(0\d{2}-\d{8}(-\d{1,4})?)|(0\d{3}-\d{7,8}(-\d{1,4})?)$/
      break;
    case 'letter':
      reg = /^[A-Za-z]*$/
      break;
    default:
      break;
  }
  if (reg && !value.match(reg)) {
    regResult = false
  }
  return regResult ? '' : msg
}

/**
 * 根据正则进行校验
 * @param type
 * @param msg
 * @param value
 */
export function validateReg(type: string, value: string) {
  let msg = ''
  let find = getValidateRuleByCode(type)
  if (find) {
    switch (find.ruleType) {
      case 'validate':
        let reg = eval(find.content)
        let regResult = true
        if (reg && !value.match(reg)) {
          regResult = false
        }
        msg = regResult ? '' : find.message
        break
      default:
        break
    }
  }
  return msg
}
