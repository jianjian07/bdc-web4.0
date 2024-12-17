<template>
  <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="stateRules">
    <a-form-item label="消息类型" ref="msg_category" name="msg_category">
      <a-radio-group v-model:value="formState.msg_category" @change="onCatelogChange">
        <a-radio value="2">系统消息</a-radio>
        <a-radio value="1">通知公告</a-radio>
        <a-radio value="3">公示公告</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="标题" name="title">
      <a-input v-model:value="formState.title" placeholder="请输入标题"/>
    </a-form-item>
    <a-form-item label="摘要" name="msg_abstract">
      <a-textarea v-model:value="formState.msg_abstract" placeholder="请输入摘要" />
    </a-form-item>
    <a-form-item label="接收用户" name="msg_type">
      <a-radio-group v-model:value="formState.msg_type" @change="onTypeChange">
        <a-radio value="ALL">全体用户</a-radio>
        <a-radio value="USER">指定用户</a-radio>
      </a-radio-group>
      <a-button v-show='chooseUser' type="primary" @click="showUserModal">选择用户</a-button>
      <div v-show="chooseUser" style="padding-top: 10px;">
        <a-alert :message="alertMessage" type="success"></a-alert>
      </div>
    </a-form-item>
    <a-form-item label="优先级" name="priority">
      <a-radio-group v-model:value="formState.priority">
        <a-radio value="H">高</a-radio>
        <a-radio value="M">中</a-radio>
        <a-radio value="L">低</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-show="showGSSJ" label="公示日期" required>
      <a-range-picker  v-model:value="gsrq" @change="onGSRQChange"/>
    </a-form-item>
    <a-form-item label="内容" name="msg_content">
      <WangEditor @editorValue="setContent" :content="formState.msg_content"></WangEditor>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import WangEditor from '/@/components/common/wangEditor.vue'
import { cModal } from "/@/components/cModal/index"

const formRef = ref()
let formState: any = reactive({
  id: '',
  title: '',
  msg_abstract: '',
  msg_content: '',
  msg_type: 'ALL',
  priority: 'H',
  send_status: '0', // '0'未发布 '1'已发布 '2'已撤销
  send_time: '',
  cancel_time: '',
  del_flag: '',
  msg_category: '1',
  user_ids: '',
  create_by: '',
  create_time: '',
  update_by: '',
  update_time: '',
  start_time: '',
  end_time: ''
});

const stateRules: any = {
  title: [
    { required: true, message: '请输入标题', trigger: 'change' },
  ],
  msg_abstract: [
    { required: true, message: '请输入摘要', trigger: 'change' },
  ],
  msg_type: [
    { required: true, message: '请选择通告对象类型', trigger: 'change' },
  ],
  msg_category: [
    { required: true, message: '请选择消息类型', trigger: 'change' },
  ],
  start_time: [
    { required: true, message: '请选择公示日期', trigger: 'change' },
  ],
  end_time: [
    { required: true, message: '请选择公示日期', trigger: 'change' },
  ]
}

const labelCol = { style: { width: '130px' } };
const wrapperCol = { span: 19 };
const api = {
  add: '',
  edit: ''
}

const chooseUser:any = ref(false)
const alertMessage: any = ref('已选择 0 人')
const showGSSJ: any = ref(false)
const gsrq: any = ref('')

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

watch(() => props.formData, (val) => {
  if(val.type != 'new') {
    Object.keys(formState).forEach(ele => {
      formState[ele] = val.record[ele]
    })
    if(formState.msg_type == 'USER' && val.type == 'edit') {
      chooseUser.value = true
    }
  }
}, {
  immediate: true
})

function setContent(val) {
  formState.msg_content = val
}

function onTypeChange(e) {
  if(e.target.value == 'USER') {
    chooseUser.value = true
  } else {
    chooseUser.value = false
    formState.user_ids = ''
  }
}

function onCatelogChange(e) {
  if (e.target.value == '3') {
    showGSSJ.value = true
  } else {
    showGSSJ.value = false
  }
}

function onGSRQChange() {
  formState.start_time = gsrq[0]
  formState.end_time = gsrq[1]
}

function showUserModal() {
  let modal = cModal({
    title: '选择用户',
    width: 1000,
    filePath: 'views/system/tzgg/components/userList',
    footerStyle: { 'text-align': 'center' },
    onOk: async (res: any) => {
      modal.setConfirmLoading(true)
      // res为弹窗内组件的dom
      formState.user_ids = res.state?.selectedRowKeys
      const names = res.state?.selectedRowNames
      alertMessage.value = '已选择 0 人'
      if(names.length) {
         alertMessage.value = '已选择'
        for(let i=0; i<names.length; i++) {
          if (i == 0) {
            alertMessage.value += ` ${names[i]}`
          } else if(i < 3) {
            alertMessage.value += `、${names[i]}`
          } else {
            break
          }
        }
        if(names.length > 3) {
          alertMessage.value += ` 等 ${names.length} 人` 
        }
      }
      modal.setConfirmLoading(false)
      modal.destroy()
    },
    onCancel: () => {
      modal.close()
    }
  })
}

const onSubmit = () => {
  return new Promise((resolve, reject) => {
    let url = props.formData.type == 'new' ? api.add : api.edit
    formRef.value
      .validate()
      .then(() => {
        console.log(formState)
        defHttp.post(
          {
            url: url,
            data: formState
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            message.success(res.message)
            return resolve(true)
          } else {
            message.warning(res?.message || '操作失败！')
            return reject()
          }
        })
      }).catch((error: any) => {
        console.log(error)
      });
  })
}

defineExpose({
  onSubmit
})

</script>

<style lang="less" scoped>

</style>