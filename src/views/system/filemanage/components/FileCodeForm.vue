<template>
  <div class="file-code-form">
    <div v-if="!selectItem" class="file-code-empty">
       <a-empty description="请先添加或选中档案编码规则"></a-empty>
    </div>
    <template v-else>
      <div class="file-code-form-title title-css1 title-left" >
        <span>档案编码规则配置</span>
      </div>
      <div class="file-code-form-content">
        <a-spin :spinning="formSpinning" class="file-form-spin">
          <a-form ref="formRef" :model="formState" :rules="rules">
            <a-row>
              <a-col :md="24">
                <a-form-item label="规则名称" name="ruleName" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                  <a-input style="width: 100%" v-model:value="formState.ruleName"></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :md="24">
                <a-form-item label="规则code" name="ruleCode" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                  <a-input style="width: 100%" v-model:value="formState.ruleCode"></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :md="24">
                <a-form-item label="规则实现类" name="ruleClass" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                  <a-input style="width: 100%" v-model:value="formState.ruleClass"></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :md="24">
                <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
                  <template #label>
                    <span class="required-text">编码规则</span>
                  </template>
                  <a-button @click="handleAddRule" style="margin-bottom: 10px; float: right">新增</a-button>
                  <a-table :columns="columns" sticky :data-source="ruleList" size="small" :loading="tableLoading">
                    <template #headerCell="{ title, column }">
                      <template v-if="column.rules?.find(r => r.required)">
                        <span class="required-text">{{ title }}</span>
                      </template>
                      <template v-else-if="column.optional">
                        <span class="optional-text">{{ title }}</span>
                      </template>
                      <span v-else>{{ title }}</span>
                    </template>
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.key === 'xh'">
                        {{ index + 1 }}
                      </template>
                      <template v-else-if="column.key === 'action'">
                        <a-popconfirm :disabled="column.disabled" cancel-text="取消" ok-text="确定" title="是否确定删除该项？"
                                      @confirm="handleDelRule(record, index)">
                          <a-button type="link">删除</a-button>
                        </a-popconfirm>
                      </template>
                      <template v-else-if="!column?.rules && column?.dict">
                        <a-select v-model:value="record[column.key]" style="width: 100%;" :disabled="column.disabled || getDisabled(column, record)" 
                                  :placeholder="column.placeholder"  allow-clear :dropdownMatchSelectWidth="false">
                          <a-select-option v-for="(item,index) in getDict(column.dict)" :label="item.label" :value="item.value">
                            {{ item.label }}
                          </a-select-option>
                        </a-select>
                      </template>
                      <template v-else-if="column?.rules">
                        <a-tooltip :trigger="['focus','contextmenu']" placement="top" :arrow="false" color="red">
                          <template v-if="validateRules(column.rules, record[column.key], record)" #title>
                            <span>{{ validateRules(column.rules, record[column.key], record) }}</span>
                          </template>
                          <template v-if="column?.key == 'ruleValue' && record['ruleParam'] == 'serial_num'">
                            <a-select v-model:value="record[column.key]" style="width: 100%;" :disabled="column.disabled || getDisabled(column, record)" :status="record[column.key + 'Status']"
                                  :placeholder="column.placeholder"  allow-clear :dropdownMatchSelectWidth="false" @focus="setInputStatus(column, record)" @change="(value, option) => handleChangeValue(value, option, column, record)">
                              <a-select-option v-for="(item,index) in getDict('serial_num_code')" :label="item.label" :value="item.value">
                                {{ item.label }}
                              </a-select-option>
                            </a-select>
                          </template>
                          <template v-else-if="column?.dict">
                            <a-select v-model:value="record[column.key]" style="width: 100%;" :disabled="column.disabled || getDisabled(column, record)"  :status="record[column.key + 'Status']"
                                  :placeholder="column.placeholder"  allow-clear :dropdownMatchSelectWidth="false" @focus="setInputStatus(column, record)" @change="(value, option) => handleChangeValue(value, option, column, record)" >
                              <a-select-option v-for="(item,index) in getDict(column.dict)" :label="item.label" :value="item.value">
                                {{ item.label }}
                              </a-select-option>
                            </a-select>
                          </template>
                          <template v-else-if="column?.key == 'orderId'">
                            <a-input-number v-model:value="record[column.key]" style="width: 100%;" :disabled="column.disabled || getDisabled(column, record)" :status="record[column.key + 'Status']" :placeholder="column.placeholder"
                                            @focus="setInputStatus(column, record)" @change="(value) => handleChangeValue(value, null, column, record)">
                            </a-input-number>
                          </template>
                          <template v-else>
                            <a-input v-model:value="record[column.key]" :status="record[column.key + 'Status']" style="width: 100%;" :disabled="column.disabled || getDisabled(column, record)" 
                                    :placeholder="column.placeholder" @focus="setInputStatus(column, record)" @change="(value, option) => handleChangeValue(value, option, column, record)">
                            </a-input>
                          </template>
                        </a-tooltip>
                      </template>
                      <template v-else>
                        <a-input-number v-model:value="record[column.key]" style="width: 100%;" :disabled="column.disabled || getDisabled(column, record)" :placeholder="column.placeholder">
                        </a-input-number>
                      </template>
                    </template>
                  </a-table>
                </a-form-item>
              </a-col>
            </a-row>
            
             <div style="text-align: center;margin-top: 10px">
                <a-space>
                  <a-button type="primary" @click="handleSubmit">
                    保存
                  </a-button>
                  <a-popconfirm cancel-text="取消" ok-text="确定" title="是否确定删除？"
                                      @confirm="handleDel">
                    <a-button >删除</a-button>
                  </a-popconfirm>
                </a-space>
             </div>
          </a-form>
        </a-spin>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { getDictItemsByCode, validateRules, setInputStatus } from '/@/views/online/utils/commonUtils'
import { ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import dayjs from "dayjs"
import { useUserStore } from "/@/store/modules/user"
import { validateRequired } from "/@/views/online/utils/validateUtil"
import { guid } from "/@/utils"

const props = defineProps({
  selectItem: {
    type: Object,
    default: {}
  },
  treeData: {
    type: Array,
    default: []
  }
})

// 表单加载状态
let formSpinning = ref<boolean>(false)
// 表单实例
let formRef = ref();
// 详细信息
let formState = ref<any>({})
// 校验规则
let rules = ref<any>({
  ruleName: [{ required: true, message: '请输入规则名称' }],
  ruleCode: [{ required: true, message: '请输入规则code' }]
})
// 规则集合
let ruleList = ref<any>([])
// 表格加载loading
let tableLoading = ref<boolean>(false)

watch(() => props.selectItem, (newVal: any) => {
  if (newVal) {
    formState.value = JSON.parse(JSON.stringify(newVal))
    if (formState.value.key?.includes('新增')) {
      ruleList.value = []
    }
    if (newVal.isNeedGetInfo) {
      formRef.value?.resetFields()
      getInfoByCode()
    }
  }
}, {
  deep: true,
  immediate: true
})

const columns = [
  {
    title: '序号',
    dataIndex: 'xh',
    key: 'xh',
    width: 60
  },
  {
    title: '规则参数',
    dataIndex: 'ruleParam',
    key: 'ruleParam',
    placeholder: '请选择规则参数',
    dict: 'code_rule_param',
    rules: [{ required: true, message: '请选择规则参数' }]
  },
  {
    title: '规则参数值',
    dataIndex: 'ruleValue',
    key: 'ruleValue',
    placeholder: '请输入规则参数值',
    rules: [{ validator: validateRuleValue }],
    optional: true
  },
  {
    title: '流水号类型',
    dataIndex: 'serialType',
    key: 'serialType',
    dict: [{ label: '年', value: 'year' }, { label: '月', value: 'month' }],
    placeholder: '请选择流水号类型',
    optional: true
  },
  {
    title: '流水号长度',
    dataIndex: 'serialLength',
    key: 'serialLength',
    placeholder: '请输入流水号长度',
    optional: true
  },
  {
    title: '排序',
    dataIndex: 'orderId',
    key: 'orderId',
    placeholder: '请输入排序',
    rules: [{ required: true, message: '请输入排序' }, { validator: validateOrderId }],
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 80,
    align: 'center'
  }
]

enum api {
  delRuleItem = '/api/zrzy-system/sys/coderule/deleteRule',
  delRule = '/api/zrzy-system/sys/coderule/deleteAll',
  info = '/api/zrzy-system/sys/coderule/rulesByCode',
  save = '/api/zrzy-system/sys/coderule/saveRules'
}

const emit = defineEmits(['update:selectItem'])

function getDict(dict) {
  if (typeof dict == 'string') {
    return getDictItemsByCode(dict)
  } else {
    return dict || []
  }
}

/**
 * 通过编码code查询数据
 */
function getInfoByCode() {
  defHttp.get({ url: api.info, params: { ruleCode: formState.value.ruleCode } }, { withToken: true }).then((res: any) => {
    if (res && res.success) {
      let row = res.result[0]
      formState.value.ruleName = row.ruleName
      formState.value.ruleCode = row.ruleCode
      formState.value.ruleClass = row.ruleClass
      ruleList.value = res.result.map((item) => {
        item.key = item.id
        return item
      })
      formState.value.isNeedGetInfo = false
    }
  })
}

/**
 * 添加规则
 */
function handleAddRule() {
  ruleList.value.push({
    key: '新增' + guid()
  })
}

/**
 * 值规则校验
 * @param value
 * @param record
 */
function validateRuleValue(value, record) {
  let msg = ''
  if (record?.ruleParam == 'fixed_char' || record?.ruleParam == 'serial_num') {
    if (validateRequired(value)) {
      msg =  record.ruleParam == 'fixed_char' ? '请输入规则参数值' : '请选择规则参数值'
    }
  }
  return msg
}

/**
 * 排序校验
 * @param value
 * @param record
 */
function validateOrderId(value, record) {
  let msg = ''
  if (value === undefined || value === null || value === '') {
    msg = '请输入排序'
  } else {
    if (record) {
      let list = JSON.parse(JSON.stringify(ruleList.value)).filter(f => f.key != record.key)
      let find = list.find(f => f.orderId == value)
      if (find) {
        msg = '排序不能重复'
      }
    }
  }
  return msg
}

/**
 * 获取禁用状态
 * @param column
 * @param record
 */
function getDisabled(column, record) {
  let status = false
  switch (column.key) {
    // case 'ruleParam':
    //   if (record.id) {
    //     // 保存过只能删除再修改类型
    //     status = true
    //   }
    //   break;
    case 'ruleValue':
      if (record?.ruleParam == 'current_year' || record?.ruleParam == 'current_month' || record?.ruleParam == 'current_day') {
        record.ruleValue = ''
        status = true
      }
      break;
    case 'serialLength':
    case 'serialType': {
      if (record?.ruleParam != 'serial_num') {
        record.serialType = ''
        record.serialLength = ''
        status = true
      }
      break;
    }
  }
  return status
}

/**
 * 删除单条规则
 * @param record
 * @param index
 */
function handleDelRule(record, index) {
   if (record.id) {
    defHttp.delete({ url: api.delRuleItem, params: { id: record.id } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('删除成功')
        ruleList.value.splice(index, 1)
      } else {
        message.warning('删除失败')
      }
    })
  } else {
     ruleList.value.splice(index, 1)
     message.success('删除成功')
  }
}

/**
 * 删除
 */
function handleDel() {
  let select = props.selectItem
  let addType = !!select.key.includes('新增')
  if (addType) {
    removeByKey(props.treeData, select.key)
    message.success('删除成功')
  } else {
    defHttp.delete({ url: api.delRule, params: { ruleCode: select.ruleCode } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        removeByKey(props.treeData, select.key)
        message.success('删除成功')
      } else {
        message.warning('删除失败')
      }
    })
  }
}

/**
 * 删除
 * @param arr
 * @param key
 */
function removeByKey(arr, key) {
  let currentSelect
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].key == key) {
      if (arr[i + 1]) {
        currentSelect = arr[i + 1]
      } else if (arr[i - 1]) {
        currentSelect = arr[i - 1]
      } else {
        currentSelect = undefined
      }
      arr.splice(i, 1)
      currentSelect.isNeedGetInfo = true
      emit('update:selectItem', currentSelect)
      return
    }
  }
}

/**
 * 数据变化
 * @param value
 * @param callback
 */
function handleChangeValue(value, option, column, record) {
  if (column.key == 'ruleParam') {
    record.ruleValue = ''
  }
  setInputStatus(column, record)
}

/**
 * 保存
 */
function handleSubmit() {
  formRef.value
    .validate()
    .then(() => {
      if (validateTable()) {
        ruleList.value = ruleList.value.map((rule) => {
          rule.createTime = rule.createTime || dayjs().format("YYYY-MM-DD HH:mm:ss")
          rule.createBy = rule.createBy || useUserStore().getUserInfo.username
          rule.updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
          rule.updateBy = useUserStore().getUserInfo.username
          rule.ruleName = formState.value.ruleName
          rule.ruleCode = formState.value.ruleCode
          rule.ruleClass = formState.value.ruleClass
          rule.serialLength = rule.serialLength || ''
          rule.serialType = rule.serialType || ''
          rule.ruleValue = rule.ruleValue || ''
          return rule
        })
        
        defHttp.post({ url: api.save, data: ruleList.value }, { withToken: true }).then((res) => {
          if (res && res.success) {
            for (let i = 0; i < res.result.length; i++) {
              ruleList.value[i].key = res.result[i]
              ruleList.value[i].id = res.result[i]
            }
            if (formState.value.key != formState.value.ruleCode) {
              formState.value.oldCode = formState.value.key
              formState.value.key = formState.value.ruleCode
              emit('update:selectItem', formState.value)
            }
            message.success('保存成功')
          } else {
            message.warning(res.message)
          }
        })
      }
    })
}

/**
 * 表格校验
 */
function validateTable() {
  if (ruleList.value.length == 0) {
    message.warning('请添加编码规则')
    return false
  } else {
    for (let i = 0; i < ruleList.value.length; i++) {
      let record = ruleList.value[i]
      let ruleColumn = columns.filter((column: any) => column.rules)
      for (let j = 0; j < ruleColumn.length; j++) {
        setInputStatus(ruleColumn[j], record)
        if (record[ruleColumn[j].key+ 'Status'] && record[ruleColumn[j].key+ 'Status'] == 'error') {
          message.warning('请检查'+ ruleColumn[j].title + '填写')
          return false
        }
      }
    }
  }
  return true
}
</script>

<style lang="less" scoped>
@import url('/@/assets/less/form.less');
.file-code-form {
  width: calc(100% - 300px);
  padding: 10px;
  height: 100%;
  
  .file-code-empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .file-code-form-content {
    height: calc(100% - 60px);
    overflow: auto;
  }
  
  .file-form-spin {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  :deep(.ant-select-disabled) {
    
    .ant-select-selector {
      background-color: rgba(0, 0, 0, 0.02) !important;
    }
    
  }
  
  :deep(.ant-input-number-disabled) {
    input {
      color: rgba(0, 0, 0, 0.25) !important
    }
  }
}
</style>