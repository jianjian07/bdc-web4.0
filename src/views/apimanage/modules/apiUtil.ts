/**
 * 根据id找节点
 * @param arr
 * @param id
 */
export function findNodeById(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i]
    if (node.id === id) return node
    if (node.children && node.children.length > 0) {
      let foundNode = findNodeById(node.children, id)
      if (foundNode) return foundNode
    }
  }
  return null
}

/**
 * 获取地址栏参数
 * @param url
 */
export function getUrl(url) {
  if (url.includes('?')) {
    let arr = url.split('?')
    let res = arr[1].split('&')
    let items = []
    for (let i = 0; i < res.length; i++) {
      let a = res[i].split('=')
      items.push({
        key: a[0],
        value: a[1]
      })
    }
    return items
  } else {
    return null
  }
}


/**
 * 获取参数值
 * @param dataType
 * @param value
 */
export function getFieldValue(dataType, value) {
  let fieldValue
  switch (dataType) {
    case 'String':
    case 'Date':
    case 'Byte':
    case 'MultipartFile':
    case 'MultipartFiles':
      fieldValue = value + ''
      break
    case 'Integer':
    case 'Double':
    case 'Float':
      fieldValue = isCanNumber(value) ? Number(value) : -1
      break
    case 'Boolean':
      fieldValue = value == 'true'
      break
    default:
      fieldValue = value ? value + '' : ''
      break
  }
  return fieldValue
}

/**
 * 是否可以转为number
 * @param number
 */
function isCanNumber(number) {
  if (typeof number == 'number') {
    return true
  } else {
    try {
      let obj = Number(number)
      if (obj && typeof obj === "number") {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}