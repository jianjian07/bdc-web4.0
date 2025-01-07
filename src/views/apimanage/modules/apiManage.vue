<template>
  <div class="api-editor-manage">
    <div class="api-editor-manage-tabs">
      <a-tabs v-model:activeKey="activeKey" class="api-editor-manage-tabs-card" hide-add type="editable-card"
              @change="tabChange" @edit="onEdit">
        <a-tab-pane v-for="(pane) in tabList" :key="pane.id" :tab="pane.children ? pane.apiGroupName : pane.apiName"
                    class="api-editor-manage-pane">
          <div v-if="pane.children" class="api-editor-manage-dir">
            <a-form-item class="flex-form-item" label="目录名称">
              <a-input v-model:value="pane.apiGroupName" @change="dirDataChange($event, pane)"/>
              <a-button style="margin-left: 10px" type="primary">保存目录</a-button>
            </a-form-item>
            <a-divider/>
            <a-form-item label="目录公钥">
              <a-input v-model:value="pane.publicKey" @change="dirDataChange($event, pane)"/>
            </a-form-item>
            <a-form-item label="目录私钥">
              <a-input v-model:value="pane.privateKey" @change="dirDataChange($event, pane)"/>
            </a-form-item>
            <a-form-item label="是否返回解密">
              <a-checkbox v-model:checked="pane.isResultDecryptCheck" @change="dirDataChange($event, pane)"></a-checkbox>
            </a-form-item>
          </div>
          <div v-else class="api-editor-manage-interface">
            <div class="top">
              <a-breadcrumb class="api-editor-manage-interface-breadcrumb">
                <a-breadcrumb-item>{{ pane.apiGroupName }}</a-breadcrumb-item>
                <a-breadcrumb-item>{{ pane.apiName }}</a-breadcrumb-item>
              </a-breadcrumb>
              <div class="api-editor-manage-interface-url">
                <a-input v-model:value="pane.url" @change="onChangeUrl">
                  <template #addonBefore>
                    <a-select v-model:value="pane.requestType" style="width: 100px">
                      <a-select-option value="POST">
                        <span class="api-type api-type-POST">POST</span>
                      </a-select-option>
                      <a-select-option value="GET">
                        <span class="api-type api-type-GET">GET</span>
                      </a-select-option>
                      <a-select-option value="PUT">
                        <span class="api-type api-type-PUT">PUT</span>
                      </a-select-option>
                    </a-select>
                  </template>
                </a-input>
                <a-button style="margin-left:10px" type="primary" @click="sendApi">发送</a-button>
                <a-button style="margin-left:10px" @click="saveApi(false)">保存</a-button>
                <a-button style="margin-left:10px" @click="sendApi('test')">测试</a-button>
              </div>
              <div class="api-editor-manage-interface-header">
                <a-form-item label="接口名称" style="flex: 1; margin-right: 10px; margin-bottom: 10px">
                  <a-input v-model:value="pane.apiName"/>
                </a-form-item>
                <a-form-item label="接口编号"
                             style="flex: 1; margin-left: 10px; margin-right: 10px; margin-bottom: 10px">
                  <a-input v-model:value="pane.apiCode"/>
                </a-form-item>
                <a-form-item label="版本" style="flex: 1; margin-left: 10px; margin-bottom: 10px">
                  <a-select :options="getDictItemsByCode('version_code')" v-model:value="pane.versionCode"
                            style="width: 170px"></a-select>
                </a-form-item>
              </div>
            </div>
            <div class="bottom">
              <div class="api-editor-manage-interface-param">
                <api-param :apiData="pane" v-model:activePane="activeParamPane"></api-param>
              </div>
              <div class="api-editor-manage-interface-result">
                <api-result :response-body="pane.responseBody" @clearResponseBody="clearResponseBody"></api-result>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import ApiParam from "/@/views/apimanage/modules/apiParam.vue"
import ApiResult from "/@/views/apimanage/modules/apiResult.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { getDictItemsByCode } from '/@/utils/form/commonUtils';

const props = defineProps({
  apiTreeData: {
    type: Array,
    default: []
  },
  selectItem: {
    type: Object,
    default: {}
  }
})

// tab列表
let tabList = ref<any>([])
// 当前选中tab
let activeKey = ref<any>()
// 实时响应
let responseBody = ref<string>('')
// 当前选中参数pane
let activeParamPane = ref<string>('')

const emit = defineEmits(['update:selectItem', 'load'])

enum api {
  save = '/api/zrzy-api/api/config/save',
  invoke = '/api/zrzy-api/api/execute/invoke',
  testInvoke = '/api/zrzy-api/api/execute/simpleInvoke'
}

onMounted(() => {
})

watch(() => props.selectItem, (newVal: any) => {
  if (newVal.id == undefined) {
    activeKey.value = ''
  } else {
    activeKey.value = newVal.id
    let find = tabList.value.find(f => f.id == newVal.id)
    if (!find && newVal.id) {
      tabList.value.push(newVal)
    }
  }
}, {
  deep: true,
  immediate: true
})

watch(() => props.apiTreeData, (newVal: any) => {
  tabList.value = tabList.value.filter((tab) => {
    let find = findNodeById(props.apiTreeData, tab.id)
    if (find) {
      return tab
    }
  })
}, {
  deep: true
})

function onEdit(targetKey: string | MouseEvent, action: string) {
  if (action === 'remove') {
    remove(targetKey as string)
  }
}

function clearResponseBody() {
  let find = tabList.value.findIndex(f => f.id == activeKey.value)
  if (find) {
    tabList.value[find].responseBody = ''
  }
}

/**
 * 选中tab变化
 * @param key
 */
function tabChange(key) {
  let find = tabList.value.find(f => f.id == key)
  emit('update:selectItem', find)
}

/**
 * 删除tab
 * @param targetKey
 */
function remove(targetKey: string) {
  let lastIndex = 0
  tabList.value.forEach((pane, i) => {
    if (pane.id === targetKey) {
      lastIndex = i - 1
    }
  })
  tabList.value = tabList.value.filter(pane => pane.id !== targetKey)
  if (tabList.value.length && activeKey.value === targetKey) {
    if (lastIndex >= 0) {
      activeKey.value = tabList.value[lastIndex].id
    } else {
      activeKey.value = tabList.value[0].id
    }
  }

  tabChange(activeKey.value)
}

/**
 * 保存api
 * @isSend 是否是发送请求
 */
function saveApi(isSend?: any) {
  return new Promise((resolve, reject) => {
    let select = JSON.parse(JSON.stringify(props.selectItem))
    console.log('se',select)
    select = formatSelectItem(select)
    if (select.jsonContent) {
      delete select.jsonContent
    }
    defHttp.post({ url: api.save, data: select }, { withToken: true }).then((res) => {
      if (res.code == 200 && res.message == '成功') {
        if (!isSend) {
          message.success('保存成功')
        }
        props.selectItem.id = res.result
        // emit('load')
        resolve(true)
      } else {
        if (!isSend) {
          message.warning(res.message)
        }
        resolve(false)
      }
    }).catch(err => {
      if (!isSend) {
        message.warning('保存失败')
      }
      resolve(false)
    })
  })
}

/**
 * 处理当前选中的接口参数
 * @param select
 */
function formatSelectItem(select) {
  select.apiHeaders = select.apiHeaders.filter(item => {
    return Object.keys(item).length !== 0
  })
  select.apiHeaders = select.apiHeaders.map(item => {
    item.isMust = item.isMust == undefined ? false : item.isMust
    item.isEncrypt = item.isEncrypt == undefined ? ((item.encryptType == undefined || item.encryptType == '') ? false : item.encryptType) : item.isEncrypt
    return item
  })
  select.apiParameters = select.apiParameters.filter(item => {
    return Object.keys(item).length !== 0
  })
  select.apiParameters = select.apiParameters.map(item => {
    item.isMust = item.isMust == undefined ? false : item.isMust
    item.isEncrypt = item.isEncrypt == undefined ? ((item.encryptType == undefined || item.encryptType == '') ? false : item.encryptType) : item.isEncrypt
    return item
  })
  select.requestParam = JSON.stringify(select.apiParameters)
  select.requestHeader = JSON.stringify(select.apiHeaders)
  select.requestBody = JSON.stringify(select.apiBody)
  console.log('select.isResultDecryptCheck',select.isResultDecrypt)
  select.isResultDecrypt = select.isResultDecrypt == undefined ? 0 : select.isResultDecrypt
  console.log('select.isResultDecrypt',select.isResultDecrypt)
  let addType = typeof select.id == 'string' ? select.id.substr(0, 4) == '新增接口' : false
  if (addType) {
    delete select.id
  }
  if (select.responseBody) {
    delete select.responseBody
  }
  debugger
  if (select.url && select.url.indexOf("?") > -1) {
    // url不拼接参数保存
    select.url = select.url.substring(0, select.url.indexOf("?"));
  }
  return select
}

/**
 * url改变
 */
function onChangeUrl() {
  setApiParameters()
}

/**
 * 根据url设置param
 */
function setApiParameters() {
  if (props.selectItem && props.selectItem.url) {
    let url = props.selectItem.url
    let param = getUrl(url)
    if (param && param.length > 0) {
      let originParam = JSON.parse(JSON.stringify(props.selectItem.apiParameters))
      originParam = originParam.filter(item => {
        return Object.keys(item).length !== 0
      })
      let copy = param.map((_param, index) => {
        let cParam = originParam[index]
        if (cParam) {
          cParam.fieldName = _param.key
          cParam.fieldValue = _param.value
        } else {
          cParam = {
            fieldName: _param.key,
            fieldValue: _param.value
          }
        }
        return cParam
      })
      props.selectItem.apiParameters = copy
      activeParamPane.value = 'query'
    }
  }
}

/**
 * 获取地址栏参数
 * @param url
 */
function getUrl(url) {
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
 * 发送api
 */
async function sendApi(type?: string) {
  let select = JSON.parse(JSON.stringify(props.selectItem))
  select = formatSelectItem(select)
  let headers = {}
  let params = {}
  select.apiHeaders.forEach((header) => {
    headers[header.fieldName] = getFieldValue(header.dataType, header.fieldValue)
  })
  select.apiParameters.forEach((param) => {
    params[param.fieldName] = getFieldValue(param.dataType, param.fieldValue)
  })
  let body = select.jsonContent
  if (select.jsonContent) {
    delete select.jsonContent
  }
  let saveRes = await saveApi(true)
  if (saveRes) {
    let sendParams
    let extend = type == 'test' ? {
      requestType: select.requestType,
      url: select.url
    } : {}
    sendParams = {
      apiCode: select.apiCode,
      headers: headers,
      params: params,
      body: body,
      ...extend
    }
    defHttp.post({
      url: type == 'test' ? api.testInvoke : api.invoke, data: sendParams
    }, { withToken: true }).then((res) => {
      // responseBody.value = JSON.stringify(res)
      props.selectItem.responseBody = JSON.stringify(res)
    }).catch(err => {
      console.log('err', err)
      // responseBody.value = err + ''
      props.selectItem.responseBody = err + ''
    })
  } else {
    // responseBody.value = '请求失败'
    props.selectItem.responseBody = '请求失败'
    message.warning('请求失败')
  }
  // if (select.id) {
  //   // 已经保存过,调用中转接口
  //   defHttp.post({
  //     url: api.invoke, data: {
  //       apiCode: select.apiCode,
  //       headers: headers,
  //       params: params,
  //       body: body
  //     }
  //   }, { withToken: true }).then((res) => {
  //     responseBody.value = JSON.stringify(res)
  //   }).catch(err => {
  //     responseBody.value = err + ''
  //   })
  // }
  // else {
  //   // 直接前端进行接口请求
  //   defHttp[select.requestType.toLowerCase()]({
  //     url: select.url,
  //     headers: headers,
  //     params: params,
  //     data: typeof body == "string" ? JSON.parse(body) : ''
  //   }, { withToken: true }).then((res) => {
  //     responseBody.value = JSON.stringify(res)
  //   }).catch(err => {
  //     responseBody.value = err + ''
  //   })
  // }
}

/**
 * 获取参数值
 * @param dataType
 * @param value
 */
function getFieldValue(dataType, value) {
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

/**
 * 目录数据改变
 * 其子接口对应的数据也改变
 * @param e
 * @param dir
 */
function dirDataChange(e, dir) {
  dir.isResultDecrypt = dir.isResultDecryptCheck == true ? 1 : 0
  if (dir.children && dir.children.length > 0) {
    dir.children = dir.children.map((child) => {
      child.apiGroupName = dir.apiGroupName
      child.publicKey = dir.publicKey
      child.privateKey = dir.privateKey
      console.log('dir.isResultDecryptCheck',dir.isResultDecryptCheck)
      child.isResultDecrypt = dir.isResultDecrypt
      return child
    })
  }
}

/**
 * 根据id找节点
 * @param arr
 * @param id
 */
function findNodeById(arr, id) {
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
</script>

<style lang="less" scoped>
.api-editor-manage {
  width: calc(100% - 300px);
  height: 100%;
  padding: 10px;

  .api-editor-manage-tabs {
    height: 100%;

    .api-editor-manage-tabs-card {
      height: 100%;

      :deep(.ant-tabs-content-holder) {
        height: 100%;

        .ant-tabs-content {
          height: 100%;

          .api-editor-manage-pane {
            height: 100%;
          }
        }
      }
    }
  }

  .flex-form-item {

    :deep(.ant-form-item-control-input-content) {
      display: flex;
    }
  }


  .api-editor-manage-interface {
    height: 100%;

    .top {
      height: 125px;

      .api-editor-manage-interface-breadcrumb {
        margin-bottom: 10px;
      }

      .api-editor-manage-interface-header {
        display: flex;
      }

      .api-editor-manage-interface-url {
        display: flex;
        margin-bottom: 15px;
      }
    }

    .bottom {
      height: calc(100% - 125px);

      .api-editor-manage-interface-param {
        height: 50%;
      }

      .api-editor-manage-interface-result {
        height: 50%;
      }
    }
  }


  .api-type {
    font-weight: bold;

    &.api-type-POST {
      color: #FF9900;
    }

    &.api-type-GET {
      color: #2BD56F;
    }

    &.api-type-PUT {
      color: #097BED;
    }
  }

}
</style>
