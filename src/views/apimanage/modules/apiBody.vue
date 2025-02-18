<template>
  <div class="api-body">
    <a-tabs v-model:activeKey="activeKey" class="api-body-tabs" size="small" tab-position="left">
      <a-tab-pane key="view" class="api-body-pane" tab="配置">
        <a-table :columns="columns" :data-source="[apiData.apiBody]" :pagination="false" :scroll="{ y: 300 }" bordered
          size="small" v-model:expandedRowKeys="expandedRowKeys">
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="['isMust'].includes(column.dataIndex)">
              <div style="display: flex;justify-content: center">
                <a-checkbox v-model:checked="record[column.dataIndex]"></a-checkbox>
              </div>
            </template>
            <template v-else-if="column.dataIndex == 'fieldName'">
              <span v-if="record.parentKey == '-1'">{{ record[column.dataIndex] }}</span>
              <a-input v-else v-show="filedShows[`field-name-${record.key}`]" :id="`field-name-${record.key}`"
                v-model:value="record[column.dataIndex]" :style="getFieldNameStyle(`field-name-${record.key}`)" />
            </template>
            <template v-else-if="['dataType'].includes(column.dataIndex)">
              <a-select v-model:value="record[column.dataIndex]"
                :options="dicts.find(t => t.key == column.dataIndex)!.data" style="width: 100%">
              </a-select>
            </template>
            <template v-else-if="['fieldValue'].includes(column.dataIndex)">
              <a-input v-model:value="record[column.dataIndex]" />
            </template>
            <template v-else-if="column.dataIndex == 'encryptType'">
              <a-input v-model:value="record[column.dataIndex]" @change="encryptTypeChange($event, record)" />
            </template>
            <template v-else-if="column.dataIndex == 'operate'">
              <div class="operate-btn">
                <a-tooltip>
                  <template #title>添加同级</template>
                  <a-button :disabled="record.parentKey == '-1'" style="margin-right: 8px"
                    @click="handleAddRow(record)">
                    <template #icon>
                      <PlusOutlined />
                    </template>
                  </a-button>
                </a-tooltip>

                <a-tooltip>
                  <template #title>添加子级</template>
                  <a-button
                    :disabled="record['dataType'].toLowerCase() !== 'object' && record['dataType'].toLowerCase() !== 'array'"
                    style="margin-right: 8px" @click="handleAddChildRow(record)">
                    <template #icon>
                      <AppstoreAddOutlined />
                    </template>
                  </a-button>
                </a-tooltip>

                <a-tooltip>
                  <template #title>删除</template>
                  <a-button :disabled="record.parentKey == '-1'" @click="handleDelRow(record)">
                    <template #icon>
                      <CloseOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
              </div>
            </template>
            <template v-else>
              <a-input v-model:value="record[column.dataIndex]" />
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="json" class="api-body-pane" tab="json">
        <monaco-editor v-model="jsonContent" height="100%" language="json" style="width: 100%;overflow: auto"
          theme="vs">
        </monaco-editor>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch, h, onMounted } from "vue"
import { AppstoreAddOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons-vue'
import MonacoEditor from "/@/components/monaco/monacoEditor.vue"
import { notification, Button } from 'ant-design-vue'
import { guid } from "/@/utils"

const props = defineProps({
  apiData: {
    type: Object,
    default: {}
  }
})

// 当前选中的面板key
let activeKey = ref<string>('view')
// json
let jsonContent = ref<string>('')
// 行展开
let expandedRowKeys = ref<any[]>([])
// 参数名是否显示 这里是为了等待input样式设置完后再显示
let filedShows = ref<any[]>([])

const columns = [
  {
    title: '参数名',
    dataIndex: 'fieldName',
    key: 'fieldName'
  },
  {
    title: '必填',
    dataIndex: 'isMust',
    key: 'isMust',
    width: 45
  },
  {
    title: '参数类型',
    dataIndex: 'dataType',
    key: 'dataType',
    width: 100
  },
  {
    title: '参数值',
    dataIndex: 'fieldValue',
    key: 'fieldValue',
    width: 100
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue',
    key: 'defaultValue'
  },
  {
    title: '加密方式',
    dataIndex: 'encryptType',
    key: 'encryptType',
    width: 100
  },
  {
    title: '参数描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    width: 130
  }
]

const dicts = [
  {
    key: 'dataType', data: [
      { value: 'Array', label: 'Array' },
      { value: 'Object', label: 'Object' },
      { value: 'Any', label: 'Any' },
      { value: 'String', label: 'String' },
      { value: 'Boolean', label: 'Boolean' },
      { value: 'Integer', label: 'Integer' },
      { value: 'Long', label: 'Long' },
      { value: 'Short', label: 'Short' },
      { value: 'Date', label: 'Date' },
      { value: 'Double', label: 'Double' },
      { value: 'Float', label: 'Float' },
      { value: 'Byte', label: 'Byte' }
    ]
  }
]


watch(() => jsonContent.value, (newVal: string) => {
  if (isJsonData(newVal)) {
    props.apiData.apiBody = jsonToView(newVal, props.apiData.apiBody)
  }
}, {
  deep: true
})

watch(() => props.apiData.apiBody, (newVal) => {
  let str = parseObj(JSON.parse(JSON.stringify(newVal)))
  let _str = JSON.parse(JSON.stringify(str))
  let _js = JSON.parse(JSON.stringify(jsonContent.value))
  if (!areJsonStringsEqual(_str, _js)) {
    nextTick(() => {
      jsonContent.value = str;
      props.apiData.jsonContent = jsonContent.value;
    });
  }
}, {
  deep: true,
  immediate: true
})

onMounted(() => {
})

/**
 * 两个字符串是否一致
 * @param jsonStr1
 * @param jsonStr2
 */
function areJsonStringsEqual(jsonStr1, jsonStr2) {
  try {
    const obj1 = JSON.parse(jsonStr1);
    const obj2 = JSON.parse(jsonStr2);

    return JSON.stringify(obj1) === JSON.stringify(obj2);
  } catch (e) {
    return false;
  }
}

/**
 * 加密方式改变 设置是否加密字段
 * @param e
 * @param record
 */
function encryptTypeChange(e, record) {
  if (e.target.value) {
    record.isEncrypt = true
  } else {
    record.isEncrypt = false
  }
}

/**
 * 添加同级数据
 * @param record
 */
function handleAddRow(record) {
  let parent = findNodeByKey([props.apiData.apiBody], record.parentKey)
  if (parent) {
    let defaultObj = {
      key: guid(),
      parentKey: record.parentKey,
      fieldName: "",
      fieldValue: "",
      dataType: "Object",
      defaultValue: "",
      isMust: false,
      isEncrypt: false,
      encryptType: "",
      description: ""
    }
    let findIndex = parent.children.findIndex(f => f.key == record.key)
    if (findIndex > -1) {
      parent.children.splice(findIndex + 1, 0, defaultObj)
    }
  }
}

/**
 * 添加下级数据
 * @param record
 */
function handleAddChildRow(record) {
  let defaultObj = {
    key: guid(),
    parentKey: record.key,
    fieldName: "",
    fieldValue: "",
    dataType: "Object",
    defaultValue: "",
    isMust: false,
    isEncrypt: false,
    encryptType: "",
    description: "-"
  }
  let extend = JSON.parse(JSON.stringify(expandedRowKeys.value))
  extend.push(record.key)
  expandedRowKeys.value = Array.from(new Set(extend))
  if (record.children) {
    record.children.push(defaultObj)
  } else {
    record.children = [defaultObj]
  }
}

/**
 * 删除行
 * @param record
 */
function handleDelRow(record) {
  let parent = findNodeByKey([props.apiData.apiBody], record.parentKey)
  if (parent) {
    parent.children = parent.children.filter(_child => _child.key !== record.key)
    if (parent.children.length == 0) {
      delete parent.children
    }
  }
}


/**
 * 根据Key找节点
 * @param arr
 * @param id
 */
function findNodeByKey(arr, key) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i]
    if (node.key === key) return node
    if (node.children && node.children.length > 0) {
      let foundNode = findNodeByKey(node.children, key)
      if (foundNode) return foundNode
    }
  }
  return null
}

/**
 * 设置参数名列的input样式
 * @param id
 */
function getFieldNameStyle(id) {
  nextTick(() => {
    let dom = document.getElementById(id)
    if (dom) {
      let previous = dom.previousSibling.previousSibling.previousSibling
      if (previous) {
        let paddingLeft = previous.style.paddingLeft
        let width = Number(paddingLeft.substring(0, paddingLeft.length - 2))
        dom.style.width = `calc(100% - ${width + 25}px)`
        filedShows.value[id] = true
      }
    }
  })
}
/**
 * 解析table对象为在json中显示的字符串
 * @param item
 */
function parseObj(item, parent?: any) {
  if (!item) {
    return ''
  }
  if (!item.dataType) {
    return ''
  }
  let str = ''
  let start = ''
  let end = ''
  switch (item.dataType) {
    case 'Object':
      if (item.fieldName !== '' && item.parentKey !== "-1") {
        start = `"${item.fieldName}":{`
      } else {
        start = '{'
      }
      end = '}'
      break
    case 'Array':
      if (item.fieldName !== '' && item.parentKey !== "-1") {
        start = `"${item.fieldName}":[`
      } else {
        start = '['
      }
      end = ']'
      break
    case 'Integer':
    case 'Long':
    case 'Short':
    case 'Double':
    case 'Float':
      let fieldValue = isCanNumber(item.fieldValue) ? Number(item.fieldValue) : -1
      start = (parent && parent.dataType == 'Array') 
          ? item.fieldName ? `"${item.fieldName}": ${fieldValue}` : `${fieldValue}` 
          :`"${item.fieldName}": ${fieldValue}` 
      break
    case 'String':
    case 'Any':
    case 'Byte':
    case 'Date':
      if (item.parentKey == "-1" && item.dataType == 'String') {
        start = `"`
        end = `"`
      } else {
        start = (parent && parent.dataType == 'Array') 
          ? item.fieldName ? `"${item.fieldName}":"${item.fieldValue}"` : `"${item.fieldValue}"` 
          :`"${item.fieldName}":"${item.fieldValue}"` 
        // start = `"${item.fieldName}":"${item.fieldValue}"`
      }
      break
    case 'Boolean':
      let boolean = item.fieldValue == 'true'
        start = (parent && parent.dataType == 'Array') 
          ? item.fieldName ? `"${item.fieldName}": ${boolean}` : `${boolean}` 
          :`"${item.fieldName}": ${boolean}` 
      // start = `"${item.fieldName}": ${boolean}`
      break
  }
  if (item.children && item.children.length > 0) {
    str += start
    for (let i = 0; i < item.children.length; i++) {
      str += parseObj(item.children[i], item)
      if (i !== item.children.length - 1) {
        str += ','
      }
    }

    str += end
  } else {
    str += start + end
  }
  return str
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

//

/**
 * 判断是否是json数据
 * @param str
 */
function isJsonData(str) {
  if (typeof str === "string") {
    try {
      var obj = JSON.parse(str)
      if (obj && typeof obj === "object") {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log("$isJSON error：", e)
      return false
    }
  } else {
    return false
  }
}

function getType(object) {
  if (Array.isArray(object)) {
    return "Array"
  }
  const typeStr = typeof object
  if (typeStr === 'object') {
    return "Object"
  }
  if (typeStr === 'number') {
    if (object > 0x7fffffff || object < -0x80000000) {
      return 'Long'
    }
    return 'Integer'
  }

  return typeStr === 'boolean' ? 'Boolean' : 'String'
}

function jsonToView(bodyStr, srcObj) {
  srcObj = srcObj || {}
  try {
    const obj = JSON.parse(bodyStr)
    return {
      key: '1',
      parentKey: '-1',
      fieldName: '根节点',
      fieldValue: '-',
      dataType: getType(obj),
      defaultValue: srcObj.defaultValue || '',
      isMust: srcObj.isMust || false,
      isEncrypt: srcObj.isEncrypt || false,
      encryptType: srcObj.encryptType || '',
      description: srcObj.description || '',
      children: processBody(obj, objToMap(srcObj))
    }
  } catch (e) {
    console.error(e)
  }
}

function processBody(content, srcObj) {
  let arr = []
  let defaultParam = {
    fieldName: '',
    fieldValue: '-',
    // dataType: getType(obj),
    defaultValue: '',
    isMust: false,
    isEncrypt: false,
    encryptType: '',
    description: '',
    children: []
  }

  if (Array.isArray(content)) {
    if (content[0] !== undefined) {
      Object.keys(content).forEach((name, index) => {
        const value = content[name]
        const simpleObject = isSimpleObject(value)
        let param = {
          ...defaultParam,
          parentKey: srcObj[0]?.parentKey || '1',
          key: srcObj[index]?.key || guid(),
          defaultValue: srcObj[index]?.defaultValue || '',
          isMust: srcObj[index]?.isMust === true,
          isEncrypt: srcObj[index]?.isEncrypt === true,
          encryptType: srcObj[index]?.encryptType || '',
          description: srcObj[index]?.description || (Array.isArray(value) || typeof value === 'object' ? '' : value),
          fieldValue: simpleObject ? value + '' : '-',
          dataType: getType(value),
        }
        if (!simpleObject) {
          param.children = processBody(value, objToMap(srcObj[index]))
        }
        if (param.children && param.children.length == 0) {
          delete param.children
        }
        arr.push(param)
      })
      
      // let value = content[0]
      // const simpleObject = isSimpleObject(value)
      // let param = {
      //   ...defaultParam,
      //   key: srcObj['']?.key || guid(),
      //   fieldValue: simpleObject ? value + '' : '-',
      //   dataType: srcObj['']?.dataType || getType(value),
      // }
      // if (!simpleObject) {
      //   param.children = processBody(value, objToMap(srcObj['']))
      // }
      // if (param.children && param.children.length == 0) {
      //   delete param.children
      // }
      // arr.push(param)

    }
  } else {
    Object.keys(content).forEach(name => {
      const value = content[name]
      const simpleObject = isSimpleObject(value)
      let param = {
        ...defaultParam,
        parentKey: srcObj[name]?.parentKey || '1',
        key: srcObj[name]?.key || guid(),
        fieldName: srcObj[name]?.fieldName || name,
        defaultValue: srcObj[name]?.defaultValue || '',
        isMust: srcObj[name]?.isMust === true,
        isEncrypt: srcObj[name]?.isEncrypt === true,
        encryptType: srcObj[name]?.encryptType || '',
        description: srcObj[name]?.description || ((Array.isArray(value) || typeof value === 'object') ? '' : value),
        fieldValue: simpleObject ? value + '' : '-',
        dataType: getType(value),
      }
      if (!simpleObject) {
        param.children = processBody(value, objToMap(srcObj[name]))
      }
      if (param.children && param.children.length == 0) {
        delete param.children
      }
      arr.push(param)
    })
  }
  return arr
}

const objToMap = obj => {
  const map = {}
  obj?.children?.forEach((it,index) => {
    it.parentKey = obj.key
    if (obj.dataType !== 'Array') {
      map[it.fieldName] = it
    } else {
      map[index] = it
    }
  })
  return map
}

/**
 * 是否普通对象
 * @param object
 */
function isSimpleObject(object) {
  return !(object != null && typeof object === 'object')
}
</script>

<style lang="less" scoped>
.api-body {
  height: 100%;

  .api-body-tabs {
    height: 100%;

    :deep(.ant-tabs-nav) {
      min-width: 30px;

      .ant-tabs-tab {
        padding: 8px 8px 8px 0;
      }
    }

    :deep(.ant-tabs-content-holder) {
      height: 100%;

      .ant-tabs-content {
        height: 100%;

        .api-body-pane {
          height: 100%;
        }
      }
    }
  }

  :deep(.ant-table-body) {
    overflow-y: scroll;
    max-height: 100% !important;
  }

  :deep(.ant-table-wrapper) {
    height: 100%;
  }

  :deep(.ant-table) {
    height: calc(100% - 40px);
  }

  :deep(.ant-table-container) {
    height: 100%;
    border-left: none !important;
  }

  :deep(.ant-spin-container) {
    height: 100%;
  }

  :deep(.ant-spin-nested-loading) {
    height: 100%;
  }

  :deep(.ant-table-row .ant-table-cell:first-child) {
    border-left: 1px solid #f0f0f0;
  }

  :deep(tr th:first-child) {
    border-left: 1px solid #f0f0f0;
  }

  .filed-value-type {

    &.string {
      color: #008000;
    }

    &.integer,
    &.double,
    &.float,
    &.byte {
      color: #0000ff;
    }

    &.boolean {
      color: #000080;
    }
  }

  .operate-btn {
    display: flex;
    justify-content: center;
    align-items: center;

    //button {
    //  width: 20px;
    //  height: 20px;
    //  display: flex;
    //  justify-content: center;
    //  align-items: center;
    //
    //  :deep(svg) {
    //    font-size: 10px;
    //  }
    //}
  }
}
</style>
