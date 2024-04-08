<template>
  <div class="case-inherit-modal">
    <a-modal v-model:open="modalVisible" :title="modalTitle" :width="800" centered class="inherit-modal"
             @ok="handleModalOk">
      <div class="inherit-table">
        <div class="left">
          <a-form-item label="源表" name="sourceTable">
            <a-select v-model:value="formState.sourceTable" :options="sourceTableList" allow-clear
                      placeholder="请选择源表" show-search @change="getField('sourceTable')"></a-select>
          </a-form-item>
          <a-table :columns="columns" :customRow="(record) => customRow(record, 'sourceField')"
                   :data-source="sourceFields"
                   :pagination="false"
                   :row-class-name="(_record, index) =>  (_record == select.sourceField ? 'select-source-field' : 'table-field')"
                   :scroll="{ y: 300 }"></a-table>
        </div>
        <div class="right">
          <a-form-item label="目标表" name="targetTable">
            <a-select v-model:value="formState.targetTable" :options="targetTableList" allow-clear
                      placeholder="请选择目标表" show-search @change="getField('targetTable')"></a-select>
          </a-form-item>
          <a-table :columns="columns" :customRow="(record) => customRow(record, 'targetField')"
                   :data-source="targetFields"
                   :pagination="false"
                   :row-class-name="(_record, index) =>  (_record == select.targetField ? 'select-target-field' : 'table-field')"
                   :scroll="{ y: 300 }"></a-table>
        </div>
      </div>
      <div class="inherit-btn">
        <a-button :disabled="!(select.sourceField && select.targetField)" style="margin-right: 10px" type="primary"
                  @click="handleCombo">对应
        </a-button>
      </div>
      <div class="inherit-param">
        <a-form-item label="源表查询条件" name="sourceFilter">
          <a-textarea v-model:value="formState.sourceFilter" prefix="where" style="width: 100%" :auto-size="{ minRows: 2, maxRows: 5 }"></a-textarea>
        </a-form-item>
      </div>
      <div class="inherit-content">
        <a-select v-model:value="formState.content" :open="false" class="inherit-select" mode="multiple"
                  style="width: 100%;"></a-select>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
// 弹窗是否显示
import { onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
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
// 列名
const columns = [
  {
    title: '字段',
    dataIndex: 'value',
    key: 'value'
  },
  {
    title: '名称',
    dataIndex: 'label',
    key: 'label'
  },
]
// 当前选中
let select = ref<any>({
  sourceField: '',
  targetField: '',
})

const customRow = (record, type) => {
  return {
    onClick: (event) => {
      if (type == 'sourceField') {
        select.value.sourceField = select.value.sourceField == record ? null : record
        let find = targetFields.value ? targetFields.value.find(target => target.value == select.value.sourceField.value) : null
        if (find) {
          select.value.targetField = find
        }
      } else {
        select.value.targetField = select.value.targetField == record ? null : record
      }
    }
  }
}

enum api {
  getTableName = '/api/zrzy-dzzw/inheritData/getAllTableName',
  getColumName = '/api/zrzy-dzzw/inheritData/getAllcolumName',
  save = '/api/zrzy-dzzw/inheritData/saveData'
}

const emit = defineEmits(['ok'])

defineExpose({
  add,
  edit
})

onMounted(() => {
  initTableList('sourceTable', true)
  initTableList('targetTable', false)
})

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
  formState.value = JSON.parse(JSON.stringify(record))
  let content = JSON.parse(JSON.stringify(formState.value.content))
  formState.value.content = JSON.parse(content)
  sourceFields.value = await getFieldList(formState.value.sourceTable)
  targetFields.value = await getFieldList(formState.value.targetTable)
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
  select.value = {
    sourceField: '',
    targetField: '',
  }
  sourceFields.value = []
  targetFields.value = []
}

/**
 * 获取表的所有字段
 * @param tableName
 */
async function getField(type) {
  // 清空
  formState.value.content = []
  let tableName
  if (type == 'sourceTable') {
    tableName = formState.value.sourceTable
    select.value.sourceField = null
    if (tableName) {
      sourceFields.value = await getFieldList(tableName)
    } else {
      sourceFields.value = []
    }
  } else {
    tableName = formState.value.targetTable
    select.value.targetField = null
    if (tableName) {
      targetFields.value = await getFieldList(tableName)
    } else {
      targetFields.value = []
    }
  }
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
 * 对应字段
 */
function handleCombo() {
  let data = {
    sourceField: select.value.sourceField,
    targetField: select.value.targetField,
    label: `原始表:${formState.value.sourceTable}.${select.value.sourceField.value}----->关联表:${formState.value.targetTable}.${select.value.targetField.value}`
  }
  let arr: any = []
  if (formState.value.content) {
    arr = JSON.parse(JSON.stringify(formState.value.content))
  }
  arr.push(data)
  formState.value.content = removeDuplicate(arr, 'label')
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
  let param = {
    caseName: props.record.caseName,
    caseCode: props.record.caseCode,
    sourceTable: formState.value.sourceTable,
    targetTable: formState.value.targetTable,
    content: JSON.stringify(formState.value.content),
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
</script>

<style lang="less">
.inherit-modal {
  .inherit-table {
    display: flex;
    justify-content: space-around;
    width: 100%;

    .left {
      width: 48%;
    }

    .right {
      width: 48%;
    }

    .table-field {
      cursor: pointer;
    }

    .select-source-field {
      background-color: #fa8f8f;

      &:hover {
        background-color: #fa8f8f;

        td {
          background: #fa8f8f !important;
          transition: none !important;
        }
      }

      .ant-table-cell-row-hover {
        background-color: #fa8f8f !important;
        transition: none !important;
      }
    }

    .select-target-field {
      background-color: skyblue;

      &:hover {
        background-color: skyblue;

        td {
          background: skyblue !important;
          transition: none !important;
        }
      }

      .ant-table-cell-row-hover {
        background-color: skyblue !important;
        transition: none !important;
      }
    }

  }

  .inherit-btn {
    margin: 10px 0 10px;
  }

  .inherit-select {
    .ant-select-selector {
      height: 250px;
      overflow: auto;
    }
  }
}

</style>
