<template>
  <div class="api-editor-manage">
    <div class="api-editor-manage-tabs">
      <a-tabs v-model:activeKey="activeKey" class="api-editor-manage-tabs-card" hide-add type="editable-card"
        @change="tabChange" @edit="onEdit">
        <a-tab-pane v-for="(pane) in tabList" :key="pane.id" :tab="pane.name" class="api-editor-manage-pane">
          <div v-if="pane.children" class="api-editor-manage-dir">
            <a-form-item class="flex-form-item" label="目录名称">
              <a-input v-model:value="pane.name" @change="dirDataChange($event, pane)" />
              <a-button style="margin-left: 10px" type="primary" @click="saveDir">保存目录</a-button>
            </a-form-item>
            <a-divider />
            <a-form-item label="接口标识">
              <a-input v-model:value="pane.code" @change="dirDataChange($event, pane)" />
            </a-form-item>
            <a-form-item label="目录公钥">
              <a-input v-model:value="pane.publicKey" @change="dirDataChange($event, pane)" />
            </a-form-item>
            <a-form-item label="目录私钥">
              <a-input v-model:value="pane.privateKey" @change="dirDataChange($event, pane)" />
            </a-form-item>
            <div style="display: flex">
              <div>
                <a-form-item label="是否加密">
                  <a-checkbox v-model:checked="pane.isEncryptCheck" @change="dirDataChange($event, pane)" />
                </a-form-item>
              </div>
              <div style="margin-left: 20px; flex: 1" v-if="pane.isEncryptCheck">
                <a-form-item label="加密方式">
                  <a-select v-model:value="pane.encryptType" allow-clear :options="getDictItemsByCode('encryptType')"
                    @change="dirDataChange($event, pane)" style="width: 100%" />
                </a-form-item>
              </div>
            </div>
            <a-form-item label="接口类型">
              <a-radio-group v-model:value="pane.apiType" @change="dirDataChange($event, pane)">
                <a-radio value="1">输出</a-radio>
                <a-radio value="0">接入</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="目录排序">
              <a-input-number v-model:value="pane.orderNum" />
            </a-form-item>
            <a-form-item label="目录备注">
              <a-textarea v-model:value="pane.bz" :auto-size="{ minRows: 5 }" />
            </a-form-item>
          </div>
          <div v-else class="api-editor-manage-interface">
            <div class="top">
              <a-breadcrumb class="api-editor-manage-interface-breadcrumb">
                <a-breadcrumb-item>{{ pane.dirName }}</a-breadcrumb-item>
                <a-breadcrumb-item>
                  <a-input v-model:value="pane.name" style="width: 400px;border: 0px;padding:0px 4px" />
                </a-breadcrumb-item>
              </a-breadcrumb>
              <div class="api-editor-manage-interface-options">
                <div class="api-editor-manage-interface-header">
                  <a-form-item label="接口类型" style="flex: 1; margin-right: 20px; margin-bottom: 0px">
                    <a-radio-group v-model:value="pane.apiType" @change="(event) => handleChangeApiType(pane, event)">
                      <a-radio-button :value="1">自定义</a-radio-button>
                      <a-radio-button :value="2">magicapi</a-radio-button>
                      <a-radio-button :value="3">通用接口</a-radio-button>
                    </a-radio-group>
                  </a-form-item>
                  <!-- <a-form-item label="接口名称" style="margin-right: 10px">
                    <a-input v-model:value="pane.name" style="width: 250px" />
                  </a-form-item>
                  <a-form-item label="接口编号" style="flex: 1; margin-left: 10px; margin-right: 10px; margin-bottom: 10px">
                    <a-input v-model:value="pane.code" style="width: 100px" />
                  </a-form-item> -->
                  <a-form-item label="版本">
                    <a-select :options="getDictItemsByCode('version_code')" v-model:value="pane.version"></a-select>
                  </a-form-item>
                </div>
              </div>

              <div class="api-editor-manage-interface-url">
                <a-input v-model:value="pane.url" @change="onChangeUrl">
                  <template #addonBefore>
                    <a-select v-model:value="pane.method" style="width: 100px">
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
              </div>
            </div>
            <div class="bottom">
              <div class="api-editor-manage-interface-param">
                <api-ex-param :apiData="pane" v-model:activePane="pane.activeParamPane"
                  :apiType="pane.apiType"></api-ex-param>
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
import { ref, watch } from "vue"
import {
  findNodeById,
  getFieldValue,
  getMagicApiInfo,
  getUrl,
  removeMagicApiById
} from "/@/views/apimanage/modules/apiUtil"
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
import ApiExParam from "/@/views/apimanage/modules/apiExParam.vue"
import ApiResult from "/@/views/apimanage/modules/apiResult.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

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

const emit = defineEmits(['update:selectItem', 'load'])

enum api {
  addDir = '/api/zrzy-api/inner/dir/add',
  editDir = '/api/zrzy-api/inner/dir/update',
  saveMagicApi = '/api/zrzy-form/magic/web/resource/file/api/save?auto=1',
  addApi = '/api/zrzy-api/inner/api/add',
  editApi = '/api/zrzy-api/inner/api/update'
}

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
 * 目录数据改变
 * 其子接口对应的数据也改变
 * @param e
 * @param dir
 */
function dirDataChange(e, dir) {
  dir.isEncrypt = dir.isEncryptCheck == true ? '1' : '0'
  dir.encryptType = dir.isEncrypt ? dir.encryptType : ''
  if (dir.children && dir.children.length > 0) {
    dir.children = dir.children.map((child) => {
      child.dirName = dir.name
      child.publicKey = dir.publicKey
      child.privateKey = dir.privateKey
      child.isResultDecrypt = dir.isEncrypt
      child.encryptType = dir.encryptType
      return child
    })
  }
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
      props.selectItem.activeParamPane = 'query'
    }
  }
}


/**
 * 保存目录
 */
function saveDir() {
  return new Promise((resolve, reject) => {
    let select = JSON.parse(JSON.stringify(props.selectItem))
    let addType = typeof select.id == 'string' ? select.id.substr(0, 4) == '新建目录' : false
    let oldId = select.id
    if (addType) {
      delete select.id
    }
    defHttp.post({ url: addType ? api.addDir : api.editDir, data: select }, { withToken: true }).then((res) => {
      if (res && res.success) {
        if (addType) {
          select.id = res.result.id
          select.oldId = oldId
          tabList.value = tabList.value.filter(pane => pane.id !== oldId)
          tabList.value.push(select)
          emit('update:selectItem', select)
        }
        message.success('保存成功')
      } else {
        message.warning('保存失败')
      }
    })
  })

}

/**
 * 发送api
 */
async function sendApi() {
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
  let body = JSON.parse(JSON.stringify(select.jsonContent))
  let sendParams = {
    groupName: '/testapi', //暂时固定
    method: select.method,
    code: select.code,
    url: select.url,
    headers: headers,
    params: params,
    body: body,
  }
  if (select.jsonContent) {
    delete select.jsonContent
  }
  let saveRes = await saveApi(true)
  if (saveRes) {
    let response: any = ''
    if (select.apiType == 2) {
      // 调用magicApi的请求接口
      response = await sendMagicApi(sendParams)
    } else {
      // 调用通用的接口请求接口
    }
    props.selectItem.responseBody = response
  } else {
    props.selectItem.responseBody = '请求失败'
    message.warning('请求失败')
  }
}

/**
 * 保存接口
 * @param isSend
 */
function saveApi(isSend?: any) {
  return new Promise(async (resolve, reject) => {
    let select = JSON.parse(JSON.stringify(props.selectItem))
    select = formatSelectItem(select)
    let saveRes
    if (select.apiType == 2) {
      saveRes = await saveCommonApi(select, true)
      select.id = saveRes
      let body = getMagicApiBody(JSON.parse(JSON.stringify(select)))
      saveRes = await saveMagicApi(body, isSend)
    } else {
      let addType = !select.id
      if (!addType) {
        // 当前更新切换了接口类型, 查询是否已经保存过magicApi接口, 若保存过则删除
        let _res = await getMagicApiInfo(select.id)
        if (_res) {
          await removeMagicApiById(select.id)
        }
      }
      saveRes = await saveCommonApi(select, isSend)
    }
    if (select.jsonContent) {
      delete select.jsonContent
    }
    resolve(saveRes)
  })
}

/**
 * 通用接口保存
 * @param isSend
 */
function saveCommonApi(data, isSend?: any) {
  return new Promise((resolve, reject) => {
    let url = data.id ? api.editApi : api.addApi
    defHttp.post({ url: url, data: data }, { withToken: true }).then((res) => {
      if (res && res.code == 200) {
        if (!isSend) {
          message.success('保存成功')
        }
        if (!data.id) {
          let select = JSON.parse(JSON.stringify(props.selectItem))
          let oldId = select.id
          select.id = res.result.id
          select.oldId = oldId
          tabList.value = tabList.value.filter(pane => pane.id !== oldId)
          tabList.value.push(select)
          emit('update:selectItem', select)
          select.activeParamPane = select.activeParamPane
          resolve(select.id)
        } else {
          resolve(data.id)
        }
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
 * 处理magicApi保存数据
 * @param select
 */
function getMagicApiBody(select) {
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

/**
 * 保存magicApi
 * @param select
 * @param isSend
 */
function saveMagicApi(body, isSend?: any) {
  return new Promise((resolve, reject) => {
    defHttp.post({ url: api.saveMagicApi, data: body }, { withToken: true }).then((res) => {
      if (res) {
        if (!res.code) {
          if (!isSend) {
            message.success('保存成功')
          }
          resolve(true)
        } else {
          message.warning(res.message)
          resolve(false)
        }
      } else {
        message.warning('保存失败')
        resolve(false)
      }
    })
  })
}

/**
 * 执行magicApi
 */
function sendMagicApi(sendParams) {
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
      resolve(JSON.stringify(res))
    }).catch(err => {
      console.log('err', err)
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
  select.apiSql = JSON.stringify(select.apiDataSource)
  select.isResultDecrypt = select.isResultDecrypt == undefined ? '0' : select.isResultDecrypt
  let addType = typeof select.id == 'string' ? select.id.substr(0, 4) == '新增接口' : false
  if (addType) {
    delete select.id
  }
  if (select.responseBody) {
    delete select.responseBody
  }
  if (select.url && select.url.indexOf("?") > -1) {
    // url不拼接参数保存
    select.url = select.url.substring(0, select.url.indexOf("?"));
  }
  return select
}

function handleChangeApiType(pane, e) {
  let value = e.target.value
  pane.activeParamPane = value == '2' ? 'script' : 'header'
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
    display: flex;
    flex-direction: column;

    .top {
      //height: 125px;

      .api-editor-manage-interface-breadcrumb {
        margin-bottom: 10px;
      }

      .api-editor-manage-interface-header {
        display: flex;
      }

      .api-editor-manage-interface-options {
        :deep(.ant-form-item) {
          margin-bottom: 10px;
        }
      }

      .api-editor-manage-interface-url {
        display: flex;
        margin-bottom: 15px;
      }
    }

    .bottom {
      //height: calc(100% - 125px);
      flex: auto;
      overflow: auto;

      .api-editor-manage-interface-param {
        height: 60%;
      }

      .api-editor-manage-interface-result {
        height: 40%;
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