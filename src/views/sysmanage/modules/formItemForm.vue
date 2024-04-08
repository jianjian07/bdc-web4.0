<template>
  <div class="form-item-form">
    <a-form
        ref="formRef"
        :label-col="{ span: 5 }"
        :model="formState"
        :rules="rules"
        :wrapper-col="{ span: 18 }">
      <a-form-item label="事项名称" name="itemName">
        <a-input v-model:value="formState.itemName" disabled placeholder="事项名称"></a-input>
      </a-form-item>
      <a-form-item label="情形名称" name="caseName">
        <a-input v-model:value="formState.caseName" disabled placeholder="情形名称"></a-input>
      </a-form-item>
      <a-form-item label="情形编码" name="caseCode">
        <a-input v-model:value="formState.caseCode" disabled placeholder="情形编码"></a-input>
      </a-form-item>
      <a-form-item label="表单地址" name="filePath">
        <a-input v-model:value="formState.filePath" placeholder="表单地址"></a-input>
      </a-form-item>
      <a-form-item label="表单编码" name="formCode">
        <a-input v-model:value="formState.formCode" placeholder="表单编码"></a-input>
      </a-form-item>
      <a-form-item label="保存前方法" name="beforeFun">
        <a-select v-model:value="formState.beforeFun" :options="beforeFunOptions" allow-clear placeholder="保存前方法">
        </a-select>
      </a-form-item>
      <a-form-item label="保存前函数">
        <a-input :value="beforeFunCode" disabled placeholder="保存前函数"></a-input>
      </a-form-item>
      <a-form-item label="保存前参数" name="beforeParam">
        <a-input v-model:value="formState.beforeParam" placeholder="保存前参数(逗号分隔)"></a-input>
      </a-form-item>
      <a-form-item label="保存后方法" name="afterFun">
        <a-select v-model:value="formState.afterFun" :options="afterFunOptions" allow-clear placeholder="保存后方法">
        </a-select>
      </a-form-item>
      <a-form-item label="保存后函数">
        <a-input :value="afterFunCode" disabled placeholder="保存后函数"></a-input>
      </a-form-item>
      <a-form-item label="保存后参数" name="afterParam">
        <a-input v-model:value="formState.afterParam" placeholder="保存后参数(逗号分隔)"></a-input>
      </a-form-item>
      <a-form-item label="主表" name="baseTable">
        <a-select v-model:value="formState.baseTable" :options="tableList" allow-clear placeholder="主表" show-search>
        </a-select>
      </a-form-item>
      <a-form-item label="主表查询条件" name="baseFilter">
        <a-input v-model:value="formState.baseFilter" placeholder="主表查询条件"></a-input>
      </a-form-item>
      <a-form-item label="上线批次" name="onlineTime">
        <a-date-picker v-model:value="formState.onlineTime" placeholder="上线批次" show-time
                       style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss"/>
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="formState.remark" placeholder="备注"/>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { getDictItemsByCode } from "/@/utils/form/commonUtils"
import { computed, onMounted, ref, watch } from "vue"
import { useUserStore } from "/@/store/modules/user"
import dayjs from "dayjs"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const userStore = useUserStore()
const userInfo = userStore.getUserInfo
const props = defineProps({
  type: {
    type: String,
    default: '新增'
  },
  record: {
    type: Object,
    default: {}
  },
  catalog: {
    type: Array,
    default: []
  }
})

let formRef = ref()
let formState = ref<any>({
  itemName: '',
  itemCode: '',
  caseName: '',
  caseCode: '',
  onlineTime: '',
  remark: '',
  filePath: '',
  beforeFun: null,
  beforeParam: '',
  afterFun: null,
  afterParam: '',
  baseTable: '',
  baseFilter: '',
  businessCode: '',
  formCode: '',
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
})
// 表单校验规则
const rules = ref<any>({
  // caseName: [{ required: true, message: '请输入情形名称!' }],
  // caseCode: [{ required: true, validator: checkCaseCode }],
  filePath: [{ required: true, validator: checkFilePath }],
  formCode: [{ required: true, message: '请输入表单编码!' }]
})
// 表列表
let tableList = ref<any[]>([])
// 保存前方法下拉选项
let beforeFunOptions = getDictItemsByCode('beforeFun')
// 保存后方法下拉选项
let afterFunOptions = getDictItemsByCode('afterFun')

const emit = defineEmits(['formOk'])

const beforeFunCode = computed(() => {
  let find = beforeFunOptions.find(f => f.value == formState.value.beforeFun)
  return find ? find.value : ''
})

const afterFunCode = computed(() => {
  let find = afterFunOptions.find(f => f.value == formState.value.afterFun)
  return find ? find.value : ''
})

enum api {
  save = '/api/zrzy-dzzw/caseConfig/saveOrUpdateCaseInfo',
  // 添加事项配置
  add = '/magicapi/zrzy-form/magic/form/itemCase/add',
  // 编辑事项配置
  edit = '/magicapi/zrzy-form/magic/form/itemCase/edit',
  // 检查情形编码是否重复
  check = '/magicapi/zrzy-form/magic/form/itemCase/check',
  // 获取所有表
  tableList = '/api/zrzy-system/inheritData/getAllTableName'
}

defineExpose({
  formState,
  handleOk
})

watch(() => props.record, () => {
  initFields()
}, {
  deep: true
})

onMounted(() => {
  initTableList()
  initFields()
})

/**
 * 获取所有表、视图
 */
function initTableList() {
  defHttp.get({ url: api.tableList, params: { containView: false } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      tableList.value = res.result.map((item) => {
        return { label: item, value: item }
      })
    }
  })
}

/**
 * 初始表单
 */
function initFields() {
  if (props.record) {
    setFields(props.record)
  } else {
    resetFields()
  }
}

/**
 * 重置表单
 */
function resetFields() {
  formRef.value.resetFields()
  formState.value = {
    itemName: props.catalog && props.catalog.length ? props.catalog[0].itemName : null,
    itemCode: props.catalog && props.catalog.length ? props.catalog[0].itemCode : null,
    caseName: props.catalog && props.catalog.length ? props.catalog[0].label : null,
    caseCode: props.catalog && props.catalog.length ? props.catalog[0].value : null,
    onlineTime: "",
    remark: "",
    filePath: "",
    beforeFun: "",
    beforeParam: "",
    afterFun: "",
    afterParam: "",
    baseTable: "",
    baseFilter: "",
    businessCode: props.catalog && props.catalog.length ? props.catalog[0].businessCode : null,
    formCode: "",
    createBy: "",
    createTime: "",
    updateBy: "",
    updateTime: "",
  }
}

/**
 * 设置表单
 * @param record
 */
function setFields(record) {
  formState.value = JSON.parse(JSON.stringify(record))
}

/**
 * 情形编码校验
 * @param _rule
 * @param value
 */
async function checkCaseCode(_rule: any, value: string) {
  if (value === '') {
    return Promise.reject('请输入情形编码!')
  } else {
    if (!value.match(/^[A-Za-z0-9_]*$/)) {
      return Promise.reject('请输入字母数字或下划线!')
    } else {
      if (props.record && (value == props.record.caseCode)) {
        return Promise.resolve()
      } else {
        await defHttp.post({ url: api.check, params: { caseCode: value } }, { withToken: true }).then((res) => {
          if (res && res.code == 200) {
            return Promise.resolve()
          } else {
            return Promise.reject(res.message)
          }
        }).catch(err => {
          return Promise.reject(err)
        })
      }
    }
  }
}

/**
 * 表单地址校验
 * @param _rule
 * @param value
 */
function checkFilePath(_rule: any, value: string) {
  if (value === '') {
    return Promise.reject('请输入表单!')
  } else {
    if (!value.match(/^[A-Za-z0-9_\/]*$/)) {
      return Promise.reject('请输入正确的表单地址!')
    } else {
      return Promise.resolve()
    }
  }
}

/**
 * 提交
 */
function handleOk() {
  formRef.value.validate().then(() => {
    let apiUrl = api.save
    let params = JSON.parse(JSON.stringify(formState.value))
    params = formatParams(params)

    defHttp.post({ url: apiUrl, data: params }, { withToken: true }).then((res) => {
      if (res && res.code == 200) {
        message.success(props.type + '成功')
        emit('formOk')
      } else {
        message.error(res.message)
      }
    }).catch(err => {
      message.error(props.type + '失败')
    })
  }).catch(err => {
    console.log('error', err)
  })
}

/**
 * 处理传参数据(历史数据等)
 * @param params
 */
function formatParams(params) {
  params.beforeFun = params.beforeFun == undefined ? null : params.beforeFun
  params.afterFun = params.afterFun == undefined ? null : params.afterFun
  params.itemName = params.itemName ? params.itemName : (props.catalog && props.catalog.length ? props.catalog[0].itemName : null)
  params.itemCode = params.itemCode ? params.itemCode : (props.catalog && props.catalog.length ? props.catalog[0].itemCode : null)
  params.caseName = params.caseName ? params.caseName : (props.catalog && props.catalog.length ? props.catalog[0].label : null)
  params.caseCode = params.caseCode ? params.caseCode : (props.catalog && props.catalog.length ? props.catalog[0].value : null)
  params.businessCode = params.businessCode ? params.businessCode : (props.catalog && props.catalog.length ? props.catalog[0].businessCode : null)
  params.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  params.updateBy = userInfo.username
  if (props.type == '新增') {
    params.createTime = params.updateTime
    params.createBy = params.updateBy
  }
  return params
}
</script>

<style lang="less" scoped>

</style>
