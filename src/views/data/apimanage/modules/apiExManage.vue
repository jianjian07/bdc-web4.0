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
            <!--            <a-form-item label="目录公钥">-->
            <!--              <a-input v-model:value="pane.publicKey" @change="dirDataChange($event, pane)" />-->
            <!--            </a-form-item>-->
            <!--            <a-form-item label="目录私钥">-->
            <!--              <a-input v-model:value="pane.privateKey" @change="dirDataChange($event, pane)" />-->
            <!--            </a-form-item>-->
            <a-form-item label="公钥私钥">
              <div>
                <a-button size="small" style="margin-bottom: 10px" @click="handleAddApiKeys(pane)">
                  <template #icon>
                    <plus-outlined style="font-size: 12px" />
                  </template>
                </a-button>
                <a-table :columns="columns" :data-source="pane.apiKeys" size="small" :pagination="false" bordered>
                  <template #bodyCell="{ column, record, index }">
                    <div v-if="column.dataIndex == 'index'" style="text-align: center">
                      {{ index + 1 }}
                    </div>
                    <div v-else-if="column.dataIndex == 'operate'" style="display: flex; justify-content: center">
                      <a @click="del(pane, record, index)">删除</a>
                    </div>
                    <template v-else-if="column.dataIndex == 'privateKey' || column.dataIndex == 'publicKey'">
                      <a-textarea v-model:value="record[column.dataIndex]" :rows="1"></a-textarea>
                    </template>
                    <template v-else-if="column.dataIndex == 'status'">
                      <a-checkbox v-model:checked="record[column.dataIndex]"
                        @change="(e) => handleRadioChange(e, pane.apiKeys, record, index)"
                        style="display: flex; justify-content: center" :options="column.options"></a-checkbox>
                    </template>
                    <template v-else>
                      <a-input v-model:value="record[column.dataIndex]"></a-input>
                    </template>
                  </template>
                </a-table>
              </div>
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
              </a-radio-group>
            </a-form-item>
            <a-form-item label="返回值序列化">
              <a-checkbox v-model:checked="pane.isResultJson" />
            </a-form-item>
            <a-form-item label="返回值结构">
              <a-textarea v-model:value="pane.apiResponse" :auto-size="{ minRows: 5 }" />
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
                <a-breadcrumb-item class="breadcrumb-input-name">
                  <a-input v-model:value="pane.name" style="border: 0px;padding:0px 4px" />
                </a-breadcrumb-item>
              </a-breadcrumb>
              <div class="api-editor-manage-interface-options">
                <div class="api-editor-manage-interface-header">
                  <a-form-item label="接口类型" style="flex: 1; margin-right: 20px; margin-bottom: 0px">
                    <a-radio-group :value="pane.apiType" @change="(event) => handleChangeApiType(pane, event)">
                      <a-radio-button :value="3">通用接口</a-radio-button>
                      <a-radio-button :value="2">magicapi</a-radio-button>
                      <a-radio-button :value="1">自定义</a-radio-button>
                    </a-radio-group>
                  </a-form-item>
                  <!--                  <a-form-item label="版本" style="margin-right: 20px;">-->
                  <!--                    <a-select :options="getDictItemsByCode('version_code')" v-model:value="pane.version"></a-select>-->
                  <!--                  </a-form-item>-->
                  <a-form-item label="接口标识" style="margin-right: 20px;">
                    <a-input v-model:value="pane.code" style="width: 100px" placeholder="接口标识"
                      @click="onClickCode(pane)"></a-input>
                  </a-form-item>
                  <a-form-item label="排序" style="margin-right: 20px;">
                    <a-input v-model:value="pane.orderNum" style="width: 50px" placeholder="排序"></a-input>
                  </a-form-item>
                  <a-form-item label="是否返回值解密">
                    <a-radio-group v-model:value="pane.isResultDecrypt">
                      <a-radio :value="1">是</a-radio>
                      <a-radio :value="0">否</a-radio>
                    </a-radio-group>
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
                <a-button style="margin-left:10px" :loading="saveLoading" @click="saveApi(false)">保存</a-button>
                <a-button style="margin-left:10px" type="primary" :loading="loading" @click="sendApi">发送</a-button>

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
  removeMagicApiById,
  dirDataChange,
  getMagicApiBody,
  sendExCommonApi,
  sendMagicApi,
  validateNoIllegalChars
} from "/@/views/data/apimanage/modules/apiUtil"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import ApiExParam from "/@/views/data/apimanage/modules/apiExParam.vue"
import ApiResult from "/@/views/data/apimanage/modules/apiResult.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { PlusOutlined } from '@ant-design/icons-vue'

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
// 发送loading
let loading = ref<boolean>(false)
// 保存loading
let saveLoading = ref<boolean>(false)
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 50,
    align: 'center'
  },
  {
    title: 'keyName',
    dataIndex: 'keyName',
    key: 'keyName',
    width: 150
  },
  {
    title: '公钥',
    dataIndex: 'publicKey',
    key: 'publicKey'
  },
  {
    title: '私钥',
    dataIndex: 'privateKey',
    key: 'privateKey'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 50,
    options: [
      {
        label: '有效',
        value: true
      },
      {
        label: '无效',
        value: false
      }
    ]
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    align: 'center',
    width: 60
  }
]

const emit = defineEmits(['update:selectItem', 'load'])

enum api {
  addDir = '/api/zrzy-api/api/dir/add',
  editDir = '/api/zrzy-api/api/dir/update',
  saveMagicApi = '/api/zrzy-form/magic/web/resource/file/api/save?auto=1',
  addApi = '/api/zrzy-api/api/inner/add',
  editApi = '/api/zrzy-api/api/inner/update'
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
    select.encryptKey = JSON.stringify(select.apiKeys)
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
  loading.value = true
  let select = JSON.parse(JSON.stringify(props.selectItem))
  select = formatSelectItem(select)
  let headers = {}
  let params = {}
  select.apiHeaders.forEach((header) => {
    headers[header.fieldName] = getFieldValue(header.dataType, header.fieldValue || header.defaultValue)
  })
  select.apiParameters.forEach((param) => {
    params[param.fieldName] = getFieldValue(param.dataType, param.fieldValue || param.fieldValue)
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
  // let saveRes = await saveApi(true)
  // let saveRes = true
  // if (saveRes) {
  let response: any = ''
  if (select.apiType == 2) {
    // 调用magicApi的请求接口
    response = await sendMagicApi(sendParams)
  } else {
    // 调用通用的接口请求接口
    response = await sendExCommonApi(sendParams)
  }
  props.selectItem.responseBody = response
  // } else {
  //   props.selectItem.responseBody = '请求失败'
  //   message.warning('请求失败')
  // }
  loading.value = false
}

/**
 * 保存接口
 * @param isSend
 */
function saveApi(isSend?: any) {
  return new Promise(async (resolve, reject) => {
    if (!isSend) {
      saveLoading.value = true
    }
    let select = JSON.parse(JSON.stringify(props.selectItem))
    select = formatSelectItem(select)
    let saveRes
    if (select.apiType == 2) {
      saveRes = await saveCommonApi(select, true)
      if (saveRes) {
        select.id = saveRes
        let body = getMagicApiBody(JSON.parse(JSON.stringify(select)))
        saveRes = await saveMagicApi(body, isSend)
      }
    } else {
      saveRes = await saveCommonApi(select, isSend)
    }
    if (select.jsonContent) {
      delete select.jsonContent
    }
    if (!isSend) {
      saveLoading.value = false
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
    let validateMsg = validateNoIllegalChars(data.code)
    if (validateMsg) {
      message.warning('接口标识' + validateMsg)
      resolve(false)
      return
    }
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
        message.warning(res?.message)
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
          message.warning(res?.message)
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
  select.isResultDecrypt = select.isResultDecrypt == undefined ? 0 : select.isResultDecrypt
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

async function handleChangeApiType(pane, e) {
  let oldApiType = JSON.parse(JSON.stringify(pane.apiType))
  let addType = typeof pane.id == 'string' ? pane.id.substr(0, 4) == '新增接口' : false
  if (oldApiType == 2 && !addType) {
    // 当前更新切换了接口类型, 查询是否已经保存过magicApi接口, 若保存过则删除
    let _res = await getMagicApiInfo(pane.id)
    if (_res) {
      await removeMagicApiById(pane.id)
    }
  }
  let value = e.target.value
  pane.activeParamPane = value == '2' ? 'script' : 'header'
  pane.apiType = value
}

/**
 * 添加公钥私钥
 * @param pane
 */
function handleAddApiKeys(pane) {
  if (!pane.apiKeys) {
    pane.apiKeys = []
  }
  pane.apiKeys.push({})
}

/**
 * 单选发生变化
 * @param e
 * @param apiKeys
 * @param record
 */
function handleRadioChange(e, apiKeys, record, index) {
  if (record.status) {
    apiKeys = apiKeys.map((m, _i) => {
      m.status = _i == index ? m.status : (m.status !== undefined ? false : undefined)
      return m
    })
  }
}

/**
 * 删除公钥私钥
 * @param record
 * @param index
 */
function del(pane, record, index) {
  pane.apiKeys.splice(index, 1)
}

/**
 * 点击接口标识
 * @param pane
 */
function onClickCode(pane) {
  if (!pane.code) {
    let url = pane.url
    if (url) {
      let _arr = url.split('/')
      pane.code = _arr[_arr.length - 1]
    }
  }
}

defineExpose({
  saveApi
})
</script>

<style lang="less" scoped>
@media (max-width: 1520px) {
  .api-editor-manage {
    width: calc(100% - 300px) !important;
  }
}

.api-editor-manage {
  width: calc(100% - 350px);
  height: 100%;
  padding: 10px;

  .api-editor-manage-tabs {
    height: 100%;

    .api-editor-manage-tabs-card {
      height: 100%;

      :deep(.ant-tabs-content-holder) {
        height: 100%;
        overflow: auto;

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

        .breadcrumb-input-name {
          flex: auto;
          padding: 0 4px;
        }
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