<template>
  <div class="case-inherit-modal">
    <a-modal v-model:open="modalVisible" :title="modalTitle" :width="1000" centered class="inherit-modal"
             @ok="handleModalOk">
      <div class="inherit-table">
        <div class="inherit-table-header">
          <div class="left">
            <a-form-item label="源表" name="sourceTable">
              <a-select v-model:value="formState.sourceTable" :options="sourceTableList" allow-clear
                        placeholder="请选择源表" show-search @change="getField('sourceTable')"></a-select>
            </a-form-item>
          </div>
            <div class="right">
              <a-form-item label="目标表" name="targetTable">
                <a-select v-model:value="formState.targetTable" :options="targetTableList" allow-clear
                          placeholder="请选择目标表" show-search @change="getField('targetTable')"></a-select>
              </a-form-item>
            </div>
        </div>
        <a-space style="margin-bottom: 10px">
          <a-button type="primary" :disabled="!(formState.sourceTable && formState.targetTable)" @click="handleAdd">添加</a-button>
          <a-button type="primary" :disabled="tableData.length == 0" @click="handleCheckAll">全选</a-button>
          <a-button type="primary" :disabled="tableData.length == 0" @click="handleCheckInvert">反选</a-button>
        </a-space>
        <a-table :columns="columns"
                 :data-source="tableData"
                 :loading="tableLoading"
                 :rowSelection="rowSelection"
                 row-key="guid"
                 size="small"
                 id="ant-inherit-table"
                 :pagination="false"
                 :animate-rows="false"
                 :scroll="{ y: 400 }">
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.dataIndex === 'operate'">
              <template v-if="!(record['guid'] && record['guid'].includes('match-'))">
                <CloseOutlined @click="handleDel(record)"/>
              </template>
            </template>
            <template v-else-if="column.dataIndex === 'sourceValue'">
              <a-select v-model:value="record[column.dataIndex]" show-search allow-clear style="width: 100%" @change="(value, option) => handleChangeSelect(value, option, record, column.dataIndex)">
                <a-select-option v-for="(item,index) in getSelectOptions('source', record)" :disabled="!!item['disabled']" :value="item.value" :label="item.label">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </template>
            <template v-else-if="column.dataIndex === 'targetValue'">
              <a-select v-model:value="record[column.dataIndex]" show-search allow-clear style="width: 100%" @change="(value, option) => handleChangeSelect(value, option, record, column.dataIndex)">
                <a-select-option v-for="(item,index) in getSelectOptions('target', record)" :disabled="!!item['disabled']" :value="item.value" :label="item.label">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </template>
          </template>
        </a-table>
      </div>
      <div class="inherit-param">
        <a-form-item label="源表查询条件" name="sourceFilter">
          <a-input v-model:value="formState.sourceFilter" prefix="where" style="width: 100%" :auto-size="{ minRows: 2, maxRows: 5 }"></a-input>
        </a-form-item>
      </div>
      <div class="inherit-content">
        <a-select v-model:value="formState.content" :open="false" class="inherit-select" mode="multiple"
                  style="width: 100%;">
        </a-select>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
// 弹窗是否显示
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { CloseOutlined } from '@ant-design/icons-vue';
import { guid } from "/@/utils"
// 最外层record
const props = defineProps({
  record: {
    type: Object,
    default: {}
  }
})
// 弹窗是否显示
let modalVisible = ref<boolean>(false)
// 弹窗标题
let modalTitle = ref<string>('新增')
// 当前数据
let formState = ref<any>({
  sourceTable: null,
  targetTable: null,
  content: []
})
// 源表选择集合
let sourceTableList = ref<any>([])
// 目标表选择集合
let targetTableList = ref<any>([])
// 源表字段集
let sourceFields = ref<any>([])
// 目标表字段集
let targetFields = ref<any>([])
// 表格数据
let tableData = ref<any>([])
// 表格loading
let tableLoading = ref<any>(false)
// 列名
const columns = [
  {
    title: '字段',
    dataIndex: 'sourceValue',
    key: 'sourceValue'
  },
  {
    title: '名称',
    dataIndex: 'sourceLabel',
    key: 'sourceLabel'
  },
  {
    title: '类型',
    dataIndex: 'sourceType',
    key: 'sourceType'
  },
  {
    title: '字段',
    dataIndex: 'targetValue',
    key: 'targetValue'
  },
  {
    title: '名称',
    dataIndex: 'targetLabel',
    key: 'targetLabel'
  },
  {
    title: '类型',
    dataIndex: 'targetType',
    key: 'targetType'
  },
  {
    title: '',
    dataIndex: 'operate',
    key: 'operate',
    width: '30px'
  },
]

// 表格选中
let selectedValue = ref<any>([])
// 表格行选择
let selectedRow = ref<any>([])

// 行选择
const rowSelection = computed(() =>{
  return {
    type: 'checkbox',
    selectedRowKeys: selectedValue.value,
    onChange: (selectedKeys, selectedRows) => {
      selectedRow.value = selectedRows
      selectedValue.value = selectedKeys
    },
  }
})

watch(() => selectedValue.value, (newVal, oldVal) => {
  if (selectedRow.value.length == selectedValue.value.length) {
    handleInheritData()
  }
}, {
  immediate: true
})

enum api {
  getTableName = '/api/zrzy-system/inheritData/getAllTableName',
  getColumName = '/api/zrzy-system/inheritData/getAllcolumName',
  save = '/api/zrzy-system/inheritData/saveData'
}

const emit = defineEmits(['ok'])

defineExpose({
  add,
  edit
})

onMounted(() => {
  initData()
})

function initData() {
  initTableList('sourceTable', true)
  initTableList('targetTable', false)
}

/**
 * 获取所有表、视图
 * @type 类型 sourceTable, targetTable
 * @containView 是否返回视图
 */
function initTableList(type, containView) {
  defHttp.get({ url: api.getTableName, params: { containView: containView } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      if (type == 'sourceTable') {
        sourceTableList.value = res.result.map((item) => {
          return { label: item, value: item }
        })
      } else {
        targetTableList.value = res.result.map((item) => {
          return { label: item, value: item }
        })
      }
    }
  })
}

/**
 * 自动匹配两表对应数据
 */
function autoMatchFields() {
  if (formState.value.sourceTable && formState.value.targetTable) {
    let matchKeys: any = []
    let matchFields: any = []
    sourceFields.value.forEach(sourceField => {
      let find = targetFields.value.find(targetField => targetField.value == sourceField.value)
      if (find) {
        matchKeys.push(find.value)
        matchFields.push({
          sourceLabel: sourceField.label || '',
          sourceValue: sourceField.value,
          sourceType: sourceField.type,
          targetLabel: find.label || '',
          targetValue: find.value,
          targetType: find.type
        })
        matchFields = matchFields.map(match => {
          let findGuid = formState.value.content.find(c => c.sourceValue == match.sourceValue && c.targetValue == match.targetValue)
          match.guid = findGuid ? findGuid.guid : 'match-' + guid();
          return match;
        })
      }
    })
    let commonFields = []
    if (formState.value.content.length) {
      // 编辑状态有数据需要设置 自动匹配数据在前, 若有选中自动匹配中的数据则勾选, 非自动匹配自己添加的在匹配数据后添加并选中
      commonFields = formState.value.content.filter(c => !c.guid.includes('match-')).map((item) => {
        let sL = sourceFields.value.find(sourceField => sourceField.value == item.sourceValue)
        let tL = targetFields.value.find(targetField => targetField.value == item.targetValue)
        return {
          guid: item.guid,
          sourceLabel: sL.label || '',
          sourceValue: item.sourceValue,
          sourceType: sL.type,
          targetLabel: tL.label || '',
          targetValue: item.targetValue,
          targetType: tL.type
        }
      })
    }
    tableData.value = [...matchFields, ...commonFields]
    selectedRow.value = tableData.value.filter(data => formState.value.content.find(contentItem => contentItem.guid == data.guid))
    selectedValue.value = selectedRow.value.map(m => m.guid)
  } else {
    // message.warning('必须选择两表')
    tableData.value = []
  }
}

/**
 * 下拉框
 * @param value
 * @param option
 * @param record
 */
function handleChangeSelect(value, option, record, type) {
  if (type == 'sourceValue') {
    let find = sourceFields.value.find(s => s.value == value)
    record.sourceLabel = find?.label
    record.sourceType = find?.type
  } else {
    let find =  targetFields.value.find(s => s.value == value)?.label
    record.targetLabel = find?.label
    record.targetType = find?.type
  }
  // let oGuid = JSON.parse(JSON.stringify(record.guid))
  // let oSRow = JSON.parse(JSON.stringify(selectedRow.value))
  if (record.sourceValue == record.targetValue) {
    record.guid = 'match-' + guid()
  } else {
    record.guid = guid()
  }
  // if (selectedValue.value.includes(oGuid)) {
  //   // 原先被选中过, 替换guid
  //   console.log('原先被选中过, 替换guid')
  //   let rows = oSRow.filter(row => row.guid !== oGuid)
  //   rows.push(record)
  //   selectedRow.value = rows
  //   selectedValue.value = selectedRow.value.map(m => m.guid)
  // }
  selectedValue.value = selectedRow.value.map(m => m.guid)
}

/**
 * 获取可选择的字段下拉框
 * @param type
 * @param record
 */
function getSelectOptions(type, record) {
  let base = []
  let selectedKeys = []
  if (type == 'source') {
    base = sourceFields.value.map(s => { return { label: s.value, value: s.value } })
    // 当前目标表key下已被选中的源keys
    selectedKeys = tableData.value.filter(data => data.targetValue == record.targetValue && data.sourceValue && data.guid != record.guid).map(data => data.sourceValue)
  } else {
    base = targetFields.value.map(s => { return { label: s.value, value: s.value } })
    // 当前源表key下已被选中的目标keys
    selectedKeys = tableData.value.filter(data => data.sourceValue == record.sourceValue && data.targetValue && data.guid != record.guid).map(data => data.targetValue)
  }
  base = base.map(b => {
    b.disabled = !!selectedKeys.includes(b.value)
    return b
  })
  return base
}


/**
 * 新增
 */
function add() {
  modalVisible.value = true
  modalTitle.value = '新增'
  reset()
}

/**
 * 编辑
 * @param record
 */
async function edit(record) {
  modalVisible.value = true
  modalTitle.value = '编辑'
  tableLoading.value = {
    spinning: true,
    tip: '正在匹配,请稍后...'
  }
  formState.value = JSON.parse(JSON.stringify(record))
  let contentStr = JSON.parse(JSON.stringify(formState.value.content))
  let content = JSON.parse(contentStr)
  content = content.map(c => {
    c.label = `原始表:${formState.value.sourceTable}.${c.sourceValue}----->关联表:${formState.value.targetTable}.${c.targetValue}`
    return c
  })
  formState.value.content = content
  sourceFields.value = await getFieldList(formState.value.sourceTable)
  targetFields.value = await getFieldList(formState.value.targetTable)
  autoMatchFields()
  tableLoading.value = false
}

/**
 * 清空数据
 */
function reset() {
  formState.value = {
    sourceTable: null,
    targetTable: null,
    content: []
  }
  selectedRow.value = []
  selectedValue.value = []
  sourceFields.value = []
  targetFields.value = []
  tableData.value = []
}

/**
 * 获取表的所有字段
 * @param tableName
 */
async function getField(type) {
  // 清空
  tableLoading.value = {
    spinning: true,
    tip: '正在匹配,请稍后...'
  }
  formState.value.content = []
  let tableName
  if (type == 'sourceTable') {
    tableName = formState.value.sourceTable
    if (tableName) {
      sourceFields.value = await getFieldList(tableName)
    } else {
      sourceFields.value = []
    }
  } else {
    tableName = formState.value.targetTable
    if (tableName) {
      targetFields.value = await getFieldList(tableName)
    } else {
      targetFields.value = []
    }
  }
  autoMatchFields()
  tableLoading.value = false
}

/**
 * 获取表下的所有字段
 * @param tableName
 */
function getFieldList(tableName) {
  return new Promise((resolve) => {
    defHttp.get({ url: api.getColumName, params: { tableName: tableName } }, { withToken: true }).then((res) => {
      resolve(res && res.code == 200 ? res.result : [])
    }).catch(err => {
      resolve([])
    })
  })
}

/**
 * 选中数据后添加结果
 */
function handleInheritData() {
  if (selectedRow.value.length && selectedValue.value.length) {
    let arr = selectedRow.value.map(row => {
      return {
        guid: row.guid,
        sourceValue: row.sourceValue,
        targetValue: row.targetValue,
        label: `原始表:${formState.value.sourceTable}.${row.sourceValue}----->关联表:${formState.value.targetTable}.${row.targetValue}`
      }
    })
    formState.value.content = removeDuplicate(arr, 'label')
  } else {
    formState.value.content = []
  }
}

/**
 * 去重
 * @param data
 * @param key
 */
function removeDuplicate(data: any[], key: any) {
  let nArr = data.filter((currentValue, currentIndex, selfArr) => {
    return selfArr.findIndex(x => x[key] === currentValue[key]) === currentIndex
  })
  return nArr
}

/**
 * 确认
 */
function handleModalOk() {
  let id
  if (formState.value.id) {
    id = { id: formState.value.id }
  }
  // 去掉label属性 (不存储于数据库)
  let content = JSON.parse(JSON.stringify(formState.value.content))
  content = content.map(c => { delete c.label; return c })
  let param = {
    caseName: props.record.caseName,
    caseCode: props.record.caseCode,
    sourceTable: formState.value.sourceTable,
    targetTable: formState.value.targetTable,
    content: JSON.stringify(content),
    sourceFilter: formState.value.sourceFilter,
    ...id
  }

  defHttp.post({ url: api.save, data: param }, { withToken: true }).then((res) => {
    message.success(modalTitle.value + '成功')
    modalVisible.value = false
    emit('ok')
  }).catch(err => {
    message.error(modalTitle.value + '失败')
  })
}

/**
 * 添加
 */
function handleAdd() {
  tableData.value.push({
    guid: guid()
  })
  nextTick(() => {
    // 滑动到最底部
    let div = document.getElementById('ant-inherit-table');
    let body: any = div.childNodes[1].childNodes[2]
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  })
}

/**
 * 删除
 * @param record
 */
function handleDel(record) {
  tableData.value = tableData.value.filter(data => data.guid != record.guid)
  selectedRow.value = selectedRow.value.filter(data => data.guid != record.guid)
  selectedValue.value = selectedRow.value.map(m => m.guid)
}

/**
 * 全选
 */
function handleCheckAll() {
  let all = tableData.value.filter(data => data.guid)
  selectedRow.value = selectedValue.value.length == all.length ? [] : all
  selectedValue.value = selectedRow.value.map(m => m.guid)
}

/**
 * 反选
 */
function handleCheckInvert() {
  let invert = tableData.value.filter((it, index) => {
    return !selectedRow.value.some((i) => i.guid === it.guid)
  }) as any
  selectedRow.value = invert
  selectedValue.value = selectedRow.value.map(m => m.guid)
}
</script>

<style lang="less">
.inherit-modal {

  .inherit-table {
    display: flex;
    flex-direction: column;
    width: 100%;

    .inherit-table-header {
      display: flex;
      justify-content: space-around;
      width: 100%;

      .left {
        width: 48%;
      }

      .right {
        width: 48%;
      }

    }


  }

  .inherit-param {
    margin-top: 20px;
  }

  .inherit-btn {
    margin: 10px 0 10px;
  }

  .inherit-select {
    .ant-select-selector {
      max-height: 250px;
      overflow: auto;
    }
  }
}

</style>
