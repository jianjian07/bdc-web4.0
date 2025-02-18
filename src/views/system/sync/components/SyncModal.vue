<template>
  <div class="sync-modal-index">
    <a-modal v-model:open="modalVisible" :title="modalTitle" :width="1000" centered class="sync-modal" @ok="handleModalOk" @cancel="handleCancel">
       <a-form
          ref="formRef"
          :model="formState"
          >
         <div class="sync-table">
           <div class="sync-table-header">
             <div class="left">
               <a-form-item label="源表" name="sourceTable" :label-col="labelCol">
                 <a-input readOnly v-model:value="formState.sourceTable"></a-input>
                </a-form-item>
             </div>
             <div class="right">
               <a-form-item label="目标表" name="targetTable" :rules="[{ required: true, message: '请选择目标表!' }]" :label-col="labelCol">
                 <a-input readOnly v-model:value="formState.targetTable"></a-input>
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
                   id="ant-sync-table"
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
                <a-select v-model:value="record[column.dataIndex]" :dropdownMatchSelectWidth="false" show-search allow-clear style="width: 100%" @change="(value, option) => handleChangeSelect(value, option, record, column.dataIndex)">
                  <a-select-option v-for="(item,index) in getSelectOptions('source', record)" :disabled="!!item['disabled']" :value="item.value" :label="item.label">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </template>
              <template v-else-if="column.dataIndex === 'targetValue'">
                <a-select v-model:value="record[column.dataIndex]" :dropdownMatchSelectWidth="false" show-search allow-clear style="width: 100%" @change="(value, option) => handleChangeSelect(value, option, record, column.dataIndex)">
                  <a-select-option v-for="(item,index) in getSelectOptions('target', record)" :disabled="!!item['disabled']" :value="item.value" :label="item.label">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </template>
            </template>
          </a-table>
         </div>
         <div class="sync-param">
            <a-form-item label="源表查询条件" name="sourceFilter" :rules="[{ required: true, message: '请填写源表查询条件!' }]" :label-col="labelCol" >
              <a-input v-model:value="formState.sourceFilter" prefix="where" style="width: 100%" :auto-size="{ minRows: 2, maxRows: 5 }"></a-input>
            </a-form-item>
         </div>
        <div class="sync-content">
          <a-form-item label=" " name="content" :rules="[{ required: true, message: '请勾选字段匹配!' }]" :label-col="labelCol">
            <a-select v-model:value="formState.content" :open="false" class="sync-select" mode="multiple"
                      style="width: 100%;" placeholder="请勾选字段匹配">
            </a-select>
          </a-form-item>
        </div>
       </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
// 弹窗是否显示
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { guid } from "/@/utils"
import { getDictItemsByCode } from '/@/utils/form/commonUtils';

let modalVisible = ref<boolean>(false)
// 弹窗标题
let modalTitle = ref<string>('新增')
// 表单实例
let formRef = ref()
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
// 标题占比
let labelCol = { style: { width: '100px' } }


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
  getColumName = '/api/zrzy-api/data/sync/getAllColumns',
  // save = '/api/zrzy-system/inheritData/saveData'
}

const emit = defineEmits(['ok'])

defineExpose({
  edit
})

onMounted(() => {
})


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
  let formStateCopy = JSON.parse(JSON.stringify(formState.value))
  formState.value = JSON.parse(JSON.stringify(record))
  if (!formState.value.content) {
    formState.value.content = '[]'
  }
  let contentStr = JSON.parse(JSON.stringify(formState.value.content))
  let content = JSON.parse(contentStr)
  content = content.map(c => {
    c.label = `原始表:${formState.value.sourceTable}.${c.sourceValue}----->关联表:${formState.value.targetTable}.${c.targetValue}`
    return c
  })
  formState.value.content = content
  
  // 跟之前打开一样的表就不再查询键名
  if (formStateCopy.sourceDb != formState.value.sourceDb || formStateCopy.sourceTable != formState.value.sourceTable) {
     sourceFields.value = await getFieldList(formState.value.sourceDb, formState.value.sourceTable)
  }
  if (formStateCopy.targetDb != formState.value.targetDb || formStateCopy.targetTable != formState.value.targetTable) {
    targetFields.value = await getFieldList(formState.value.targetDb, formState.value.targetTable)
  }
  
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
  if (record.sourceValue == record.targetValue) {
    record.guid = 'match-' + guid()
  } else {
    record.guid = guid()
  }
  selectedValue.value = selectedRow.value.map(m => m.guid)
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
  let dbKey
  if (type == 'sourceTable') {
    tableName = formState.value.sourceTable
    dbKey = formState.value.sourceDb
    if (tableName) {
      sourceFields.value = await getFieldList(dbKey, tableName)
    } else {
      sourceFields.value = []
    }
  } else {
    tableName = formState.value.targetTable
    dbKey = formState.value.targetDb
    if (tableName) {
      targetFields.value = await getFieldList(dbKey, tableName)
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
function getFieldList(dbKey, tableName) {
  return new Promise((resolve) => {
    defHttp.get({ url: api.getColumName, params: { dbKey: dbKey, tableName: tableName } }, { withToken: true }).then((res) => {
      if (res && res.code == 200) {
        let _result = res.result.map((item) => {
          item.label = item.description
          item.type = item.columntype
          item.value = item.columnname
          return item
        })
        resolve(_result)
      } else {
        resolve([])
      }
    }).catch(err => {
      resolve([])
    })
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
          sourceLabel: sL?.label || '',
          sourceValue: item.sourceValue,
          sourceType: sL?.type,
          targetLabel: tL?.label || '',
          targetValue: item.targetValue,
          targetType: tL?.type
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
 * 添加
 */
function handleAdd() {
  tableData.value.push({
    guid: guid()
  })
  nextTick(() => {
    // 滑动到最底部
    let div = document.getElementById('ant-sync-table');
    let body: any = div.childNodes[1].childNodes[2]
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  })
}


function handleModalOk() {
   formRef.value.validate().then(() => {
     // 去掉label属性 (不存储于数据库)
     let content = JSON.parse(JSON.stringify(formState.value.content))
     content = content.map(c => { delete c.label; return c })
     let param = JSON.parse(JSON.stringify(formState.value))
     param.content = JSON.stringify(content)
     modalVisible.value = false
     emit('ok', param)
  })
  .catch(error => {
    console.log('error', error);
  });
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

/**
 * 取消
 */
function handleCancel() {
  // formRef.value.resetFields()
}

</script>

<style lang="less" scoped>
.sync-modal {

  .sync-table, .sync-form {
    display: flex;
    flex-direction: column;
    width: 100%;

    .sync-table-header, .sync-row {
      display: flex;
      justify-content: space-between;
      width: 100%;

      .left {
        width: 48%;
      }

      .right {
        width: 48%;
      }

    }


  }
  
  .sync-form {
    margin-top: 20px;
  }

  .sync-param {
    margin-top: 20px;
  }

  .sync-content {
    margin-bottom: 20px;
  }

  .sync-select {
    .ant-select-selector {
      max-height: 250px;
      overflow: auto;
    }
  }

  .flex-param {
    display: flex;
  }
}
</style>