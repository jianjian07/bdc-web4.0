import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

enum api {
  getMagicInfo = '/api/zrzy-form/magic/web/resource/file',
  delMagicApi = '/api/zrzy-form/magic/web/resource/delete'
}

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
    case 'Long':
    case 'Short':
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

/**
 * 获取父级id
 * @param id
 * @param tree
 */
export function getParentId(id: string | number, tree: any) {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.id === id)) {
        parentKey = node.id
      } else if (getParentId(id, node.children)) {
        parentKey = getParentId(id, node.children)
      }
    }
  }
  return parentKey
}

/**
 * 设置fPid 一级父节点id
 * @param newArr
 * @param parentId
 */
export function setParentId(newArr: any[], parentId?: any) {
  let newData = newArr.map((item: { pid: any; id: any; children: any; }) => {
    if (parentId) {
      item.pid = parentId
    }
    let pid = parentId ? parentId : item.id

    if (item.children) {
      item.children = setParentId(item.children, pid)
    }
    return item
  })
  return newData
}

/**
 * 获取所有的父节点数据
 * @param data 树形数组
 * @param arr 父节点数组
 * @returns
 */
export function getAllParentKeys(data: any = [], arr: any = []) {
  data.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      arr.push(item.id)
      return getAllParentKeys(item.children, arr)
    }
  })
  return arr
}

/**
 * 根据id获取magicApi接口数据
 * @param id
 */
export function getMagicApiInfo(id) {
  return new Promise((resolve, reject) => {
    defHttp.get({ url: api.getMagicInfo + '/' + id, }, { withToken: true }).then((res) => {
      if (res && !res.code) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * 通过id删除magicApi接口
 * @param id
 */
export function removeMagicApiById(id) {
  return new Promise((resolve) => {
    defHttp.post({ url: api.delMagicApi, params: { id: id } }, { withToken: true }).then((res) => {
      if (res && !res.code) {
        resolve(true)
      } else {
        resolve(false)
      }
    }).catch(err => {
      resolve(false)
    })
  })
}


/** 
 * 目录数据改变
 * 其子接口对应的数据也改变
 * @param e
 * @param dir
 */
export function dirDataChange(e, dir) {
  dir.isEncrypt = dir.isEncryptCheck == true ? '1' : '0'
  dir.encryptType = dir.isEncrypt ? dir.encryptType : ''
  if (dir.children && dir.children.length > 0) {
    dir.children = dir.children.map((child) => {
      child.dirName = dir.name
      child.publicKey = dir.publicKey
      child.privateKey = dir.privateKey
      child.apiKeys = dir.apiKeys
      child.apiPublicParams = dir.apiPublicParams
      // child.isResultDecrypt = dir.isEncrypt
      child.encryptType = dir.encryptType
      return child
    })
  }
}

/**
 * 处理magicApi保存数据
 * @param select
 */
export function getMagicApiBody(select) {
  let definition = mapToRequestFields([JSON.parse(select.requestBody)])
  let body = {
    id: select.id,
    name: select.name,
    path: select.url,
    groupId: "e34aa1d052c74c658d5c673e0ee52450", // 目录id 暂时先固定
    method: select.method,
    script: select.script,
    requestBody: select.jsonContent,
    requestBodyDefinition: definition.length ? definition[0] : [],
    parameters: mapToRequestFields(select.apiParameters),
    headers: mapToRequestFields(select.apiHeaders),
  }
  return body
}

// 提取公共处理逻辑，包含递归处理 children
function mapToRequestFields(fields) {
  return fields.map((field) => {
    const processedField = {
      dataType: field.dataType,
      defaultValue: field.defaultValue,
      name: field.fieldName,
      value: field.fieldValue,
      required: field.isMust,
      description: field.description,
    };

    if (field.children && Array.isArray(field.children)) {
      processedField.children = mapToRequestFields(field.children);
    }

    return processedField;
  });
}

/**
 * 执行magicApi
 */
export function sendMagicApi(sendParams) {
  return new Promise((resolve, reject) => {
    let path = ensureSingleSlashStart(sendParams.url)
    let fullPath = '/api/zrzy-form/' + ensureSingleSlashStart(sendParams.groupName) + path
    defHttp[sendParams.method.toLowerCase()]({
      url: fullPath,
      params: sendParams.params,
      data: JSON.parse(sendParams.body),
      headers: sendParams.headers
    }, { withToken: true }).then((res) => {
      // responseBody.value = JSON.stringify(res)
      message.success('请求成功')
      resolve(JSON.stringify(res))
    }).catch(err => {
      console.log('err', err)
      message.success('请求失败')
      // responseBody.value = err + ''
      resolve(err + '')
    })
  })
}

/**
 * 替换/
 * @param str
 */
function ensureSingleSlashStart(str) {
  return `/${str.replace(/^\/+/, '')}`;
}


/**
 * 通用接口发送
 * @param sendParams
 */
export function sendExCommonApi(sendParams) {
  return new Promise((resolve, reject) => {
    try {
      JSON.parse(sendParams.body);
    } catch (parseErr) {
      message.warning('body 参数格式错误：请检查 JSON 格式是否正确');
      resolve('body 参数格式错误：' + parseErr);
      return
    }
    defHttp.post({ url: '/api/zrzy-api/commonapi/' + sendParams.url, data: JSON.parse(sendParams.body) }, { withToken: true, isTransformResponse: false }).then((res) => {
      if (res.status == 200) {
        resolve(JSON.stringify(res.data))
        message.success('请求成功')
      } else {
        message.warning('请求失败')
        resolve(res?.message + '')
      }
    }).catch(err => {
      console.log('err', err)
      message.warning('err', err)
      // responseBody.value = err + ''
      resolve(err + '')
    })
  })
}

export function sendCommonApi(sendParams) {
  return new Promise((resolve, reject) => {
    if (!sendParams.dparams) {
      message.warning('动态参数不能为空!')
      resolve('动态参数不能为空');
      return;
    }
    try {
      JSON.parse(sendParams.body);
    } catch (err) {
      message.warning('body 参数格式错误：请检查 JSON 格式是否正确');
      resolve('body 参数格式错误：' + err);
      return;
    }

    try {
      JSON.parse(sendParams.dparams);
    } catch (err) {
      message.warning('dparams 参数格式错误：请检查 JSON 格式是否正确');
      resolve('dparams 参数格式错误：' + err);
      return;
    }
    let data = {
      apiCode: sendParams.code,
      requestType: sendParams.method,
      url: sendParams.url,
      headers: sendParams.headers,
      params: sendParams.params,
      body: JSON.parse(sendParams.body),
      dparams: sendParams.dparams ? JSON.parse(sendParams.dparams) : null
    }
    defHttp.post({ url: '/api/zrzy-api/api/execute/invokeByDir', data: data }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(JSON.stringify(res.result))
        message.success('请求成功')
      } else {
        message.warning('请求失败')
        resolve(res?.message + '')
      }
    }).catch(err => {
      console.log('err', err)
      // responseBody.value = err + ''
      resolve(err + '')
    })

  })
}

export function escapeJsonString(inputStr) {
  return inputStr
    .replace(/\\/g, "\\\\") // 先转义 `\`
    .replace(/"/g, '\\"'); // 再转义 `"`
}

/**
 * 获取字符串中的非法字符
 * @param str
 **/
function getIllegalChars(str) {
  const illegalPattern = /[\t\n\r\/\\#%&?=+$@^*~`|<>"';:,. ，。【】（）「」《》！·……￥　]/g;
  const matches = str.match(illegalPattern);
  return matches ? [...new Set(matches)] : [];
}

/**
 * 验证字符串中是否包含非法字符
 * @param str
 **/
export function validateNoIllegalChars(str) {
  const illegalChars = getIllegalChars(str);
  if (illegalChars.length > 0) {
    const visibleChars = illegalChars.map((ch) =>
      ch === '\t' ? '\\t' :
      ch === '\n' ? '\\n' :
      ch === '\r' ? '\\r' :
      ch === ' '  ? '[空格]' :
      ch === '　' ? '[全角空格]' :
      ch
    );
    return `不能包含非法字符：${visibleChars.join(' ')}`;
  }
  return '';
}