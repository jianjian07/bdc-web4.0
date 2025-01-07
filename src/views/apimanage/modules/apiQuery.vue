<template>
  <div class="api-query">
    <a-table :columns="columns" :customRow="customRow" :data-source="apiData.apiParameters" :pagination="false"
             :scroll="{ y: 300 }" bordered size="small">
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="['isMust'].includes(column.dataIndex)">
          <a-checkbox v-model:checked="record[column.dataIndex]"></a-checkbox>
        </template>
        <template v-else-if="['dataType'].includes(column.dataIndex)">
          <a-select v-model:value="record[column.dataIndex]" :options="dicts.find(t => t.key == column.dataIndex)!.data"
                    style="width: 120px;">
          </a-select>
        </template>
        <template v-else-if="['fieldName','fieldValue'].includes(column.dataIndex)">
          <a-input v-model:value="record[column.dataIndex]"/>
        </template>
        <template v-else-if="column.dataIndex == 'description'">
          <div class="flex-content">
            <a-input v-model:value="record[column.dataIndex]" style="width: 80%"/>
            <close-outlined v-if="hoverRowIndex == index && hoverRowIndex !== apiData.apiParameters.length - 1"
                            style="margin-right: 5px" @click="delRow(record, index)"/>
          </div>
        </template>
        <template v-else-if="column.dataIndex == 'encryptType'">
          <a-input v-model:value="record[column.dataIndex]" @change="encryptTypeChange($event, record)"/>
        </template>
        <template v-else>
          <a-input v-model:value="record[column.dataIndex]"/>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { CloseOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  apiData: {
    type: Object,
    default: {}
  }
})

const columns = [
  {
    title: '必填',
    dataIndex: 'isMust',
    key: 'isMust',
    width: 50
  },
  {
    title: '参数名',
    dataIndex: 'fieldName',
    key: 'fieldName'
  },
  {
    title: '参数类型',
    dataIndex: 'dataType',
    key: 'dataType'
  },
  {
    title: '参数值',
    dataIndex: 'fieldValue',
    key: 'fieldValue'
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue',
    key: 'defaultValue'
  },
  {
    title: '加密方式',
    dataIndex: 'encryptType',
    key: 'encryptType'
  },
  {
    title: '参数描述',
    dataIndex: 'description',
    key: 'description'
  }
]

const dicts = [
  {
    key: 'dataType', data: [
      { value: 'String', label: 'String' },
      { value: 'Boolean', label: 'Boolean' },
      { value: 'Integer', label: 'Integer' },
      { value: 'Date', label: 'Date' },
      { value: 'Double', label: 'Double' },
      { value: 'Float', label: 'Float' },
      { value: 'Byte', label: 'Byte' },
      { value: 'MultipartFile', label: 'MultipartFile' },
      { value: 'MultipartFiles', label: 'MultipartFiles' }
    ]
  }
]
// 悬浮行index
let hoverRowIndex = ref<number>(-1)

const customRow = (record, index) => {
  return {
    onMouseenter: (event) => {
      hoverRowIndex.value = index
    }
  }
}

watch(() => props.apiData.apiParameters, (newVal: any) => {
  // setApiUrl()
  addRow(newVal)
}, {
  deep: true,
  immediate: true
})

/**
 * 通过param设置url
 */
function setApiUrl() {
  let originParam = JSON.parse(JSON.stringify(props.apiData.apiParameters))
  originParam = originParam.filter(item => {
    return Object.keys(item).length !== 0
  })
  let params = originParam.map((_param) => {
    return {
      key: _param.fieldName,
      value: _param.fieldValue
    }
  })
  let baseUrl = ''
  if (props.apiData.url) {
    if (props.apiData.url.includes('?')) {
      baseUrl = props.apiData.url.split('?')[0]
    } else {
      baseUrl = props.apiData.url
    }
    for (let i = 0; i < params.length; i++) {
      if (i == 0) {
        baseUrl += `?${params[i].key}=${params[i].value == undefined ? '' : params[i].value}`
      } else {
        baseUrl += `&${params[i].key}=${params[i].value == undefined ? '' : params[i].value}`
      }
    }
    props.apiData.url = baseUrl
  }
}

/**
 * 默认自动添加下一行数据
 * @param newVal
 */
function addRow(newVal) {
  if (newVal && newVal.length > 0) {
    let length = newVal.length
    let last = newVal[length - 1]
    let isValue = false
    for (const lastKey in last) {
      if (last[lastKey] !== undefined || last[lastKey] !== '') {
        isValue = true
      }
    }
    if (isValue) {
      props.apiData.apiParameters.push({})
    }
  } else {
    props.apiData.apiParameters.push({})
  }
}

/**
 * 删除行
 * @param record
 * @param recordIndex
 */
function delRow(record, recordIndex) {
  props.apiData.apiParameters.splice(recordIndex, 1)
  setApiUrl()
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
</script>

<style lang="less" scoped>
.api-query {
  height: 100%;

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

  .flex-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
