<template>
  <div class="sys-rule-form">
    <a-form
        ref="formRef"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        :rules="rules"
        :model="formState">
      <a-form-item label="业务类型" name="ywlx">
        <a-tree-select
            v-model:value="formState.ywlx"
            show-search
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择业务类型"
            allow-clear
            :tree-data="getTreeDictItemsByCode('ywgzlx')"
            @change="handleChangeYwlx"
        >
        </a-tree-select>
      </a-form-item>
      <a-form-item label="规则名称" name="ruleName">
        <a-input v-model:value="formState.ruleName" placeholder="规则名称"></a-input>
      </a-form-item>
      <a-form-item label="规则编号" name="ruleCode">
        <a-input v-model:value="formState.ruleCode" placeholder="规则编号"></a-input>
      </a-form-item>
      <a-form-item label="规则类型" name="ruleType">
        <a-select v-model:value="formState.ruleType" :options="getDictItemsByCode('ruleType')"
                  placeholder="规则类型" @change="handleChangeRuleType">
        </a-select>
      </a-form-item>
      <a-form-item label="规则内容" name="content">
        <template v-if="formState.ruleType == 'sql' || formState.ruleType == 'api'">
          <monaco-editor v-model="formState.content" :language="formState.ruleType == 'sql' ? 'sql' : 'javascript'" height="300px">
          </monaco-editor>
        </template>
        <template v-else>
          <a-input v-model:value="formState.content" placeholder="规则内容"></a-input>
        </template>
      </a-form-item>
      <a-form-item label="提示信息" name="message">
        <a-input v-model:value="formState.message" placeholder="提示信息"></a-input>
      </a-form-item>
      <a-form-item label="规则描述">
        <a-input v-model:value="formState.description" placeholder="规则描述"></a-input>
      </a-form-item>
      <a-form-item label="规则状态">
        <a-switch v-model:checked="formState.status" checkedValue="1" unCheckedValue="0"></a-switch>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { getDictItemsByCode, getTreeDictItemsByCode } from "/@/views/online/utils/commonUtils"
import MonacoEditor from "/@/components/monaco/monacoEditor.vue"
import { onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { useUserStore } from "/@/store/modules/user"
import dayjs from "dayjs"
const userStore = useUserStore();
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
  ruleName: '',
  ruleCode: '',
  ruleType: 'validate',
  ruleTypeName: '校验规则',
  content: '',
  message: '',
  description: '',
  status: '1',
  ywlx: '',
  ywlxName: ''
})
// 表单校验规则
const rules = ref<any>({
  ywlx: [{ required: true, message: '请选择业务类型!' }],
  ruleName: [{ required: true, message: '请输入规则名称!' }],
  ruleCode: [{ required: true, validator: checkRuleCode }],
  // ruleCode: [{ required: true,  message: '请输入规则编码!' }, { pattern: /^[A-Za-z0-9]*$/, message: '请输入字母或数字' }],
  ruleType: [{ required: true, message: '请选择规则类型!' }],
  content: [{ required: true, validator: checkContent }, ],
  message: [{ required: true, message: '请输入提示信息!' }],
})

const emit = defineEmits(['formOk'])
enum api {
  // 添加规则
  add = '/magicapi/zrzy-form/magic/form/rule/add',
  // 编辑规则
  edit = '/magicapi/zrzy-form/magic/form/rule/edit',
  // 检查规则编码是否重复
  check = '/magicapi/zrzy-form/magic/form/rule/check'
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
  initFields()
})

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
    ruleName: '',
    ruleCode: '',
    ruleType: 'validate',
    ruleTypeName: '校验规则',
    content: '',
    message: '',
    description: '',
    status: '1',
    ywlx: props.catalog && props.catalog.length ? props.catalog[0].value : null,
    ywlxName: props.catalog && props.catalog.length ?  props.catalog[0].label : null
  }
}

/**
 * 设置表单
 * @param record
 */
function setFields(record) {
  formState.value = JSON.parse(JSON.stringify(record))
  formState.value.ywlxName = getYwlxName(record.ywlx)
}

/**
 * 改变业务类型
 * @param value
 * @param option
 */
function handleChangeYwlx(value, option) {
  formState.value.ywlxName = option[0]
}

/**
 * 获取业务类型名称
 * @param ywlx
 */
function getYwlxName(ywlx) {
  let arr = getTreeDictItemsByCode('ywgzlx')
  let find = findNode(arr, ywlx)
  return find ? find.label : ''
}

/**
 * 循环遍历
 * @param arr
 * @param key
 */
function findNode(arr, key) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i];
    if (node.value === key) return node;
    if (node.children && node.children.length > 0) {
      let foundNode = findNode(node.children, key);
      if (foundNode) return foundNode;
    }
  }
  return null;
}

/**
 * 选择规则类型
 * @param value
 * @param options
 */
function handleChangeRuleType(value, options) {
  formState.value.ruleTypeName = options.label
}

/**
 * 检查规则编码是否重复
 * @param _rule
 * @param value
 */
async function checkRuleCode(_rule: any, value: string) {
  if (value === '') {
    return Promise.reject('请输入规则编码!');
  } else {
    if (!value.match(/^[A-Za-z0-9]*$/)) {
      return Promise.reject('请输入字母或数字!')
    } else {
      if (props.record && (value == props.record.ruleCode)) {
        return Promise.resolve()
      } else {
        await defHttp.post({ url: api.check, params: { ruleCode: value } }, { withToken: true }).then((res) => {
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
 * 校验规则内容
 * @param _rule
 * @param value
 */
function checkContent(_rule: any, value: string) {
  if (value === '') {
    return Promise.reject('请输入规则内容!');
  } else {
    if (formState.value.ruleType == 'validate') {
      let isReg = true
      try {
        isReg = eval(value) instanceof RegExp
      } catch (e) {
        isReg = false
      }
      if (isReg) {
        return Promise.resolve()
      } else {
        return Promise.reject('请输入正确的正则表达式');
      }
    } else {
      return Promise.resolve();
    }
  }
}

/**
 * 提交
 */
function handleOk() {
  formRef.value.validate().then(() => {
    let apiUrl
    let params = JSON.parse(JSON.stringify(formState.value))
    delete params.ywlxName
    params.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    params.updateBy =  userInfo.username
    if (props.type == '新增') {
      apiUrl = api.add
      params.createTime = params.updateTime
      params.createBy = params.updateBy
    } else {
      apiUrl = api.edit
    }
    defHttp.post({ url: apiUrl, data: params }, { withToken: true }).then((res) => {
      if (!res.message) { 
        message.success(props.type + '成功')
        emit('formOk')
      } else {
        message.error(props.type + '失败')
      }
    }).catch(err => {
      message.error(props.type + '失败')
    })
  }).catch(error => {
        console.log('error', error);
  })
}

</script>

<style lang="less" scoped>

</style>
