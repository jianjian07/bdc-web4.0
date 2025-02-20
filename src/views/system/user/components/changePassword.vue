<template>
  <a-drawer :title="title" :width="720" :open="open" :body-style="{ paddingBottom: '80px' }"
      :footer-style="{ textAlign: 'right' }" @close="onClose">
      <template #extra>
          <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
          <a-button type="primary" @click="onOk">确定</a-button>
      </template>
      <a-form ref="formRef" :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" :rules="formRules" autocomplete="off">
        <a-form-item label="用户账号" name="username" >
            <a-input disabled v-model:value="dataInfo.username" />
        </a-form-item>
        <a-form-item label="用户姓名" name="realName" >
            <a-input disabled v-model:value="dataInfo.realName" />
        </a-form-item>  
        <a-form-item ref="newPassword" label="新密码" name="newPassword" :help="helpinfo">
              <a-input-password v-model:value="formState.newPassword" />
          </a-form-item>
      </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { onMounted, reactive, ref } from 'vue';
import { encryptionAES } from '/@/utils/cipher';

const props = defineProps({
  open: {
      type: Boolean,
      default: false
  },
  title: {
      type: String,
      default: "修改密码"
  },
  dataInfo: {
      type: Object,
      default: {}
  }
})

const formRef = ref()
let open = ref(props.open)
const emit = defineEmits(["ok"])
let helpinfo = ref('')

const formState = reactive({
  newPassword: ''
});

enum api {
  update = '/api/zrzy-system/sys/v1/user/updatePasswordForAdmin'
}

onMounted(() => {
  helpinfo.value = window?.settingConfig?.pwd_regexErrorMsg

  console.log('helpinfo.value', helpinfo.value, window?.settingConfig)
})

const validateNewPassword = (rule, value, callback) => {
  const psw_regex = window?.settingConfig?.pwd_regex;
  let regex = new RegExp(psw_regex);

  if(psw_regex && !regex.test(value)) {
    callback(helpinfo)
  } else {
    callback()
  }
}

const formRules: any = {
  newPassword: [
    { required: true, message: '请输入新密码' },
    { validator: validateNewPassword, trigger: 'blur' },
  ]
}

/**
* 保存
*/
function onOk() {
  console.log(formState.newPassword,encryptionAES(formState.newPassword))
  formRef.value
    .validate()
    .then(() => {
      // 执行保存
      defHttp.post({ 
        url: api.update,
        params: {
          id: props.dataInfo.id,
          newPassword: encryptionAES(formState.newPassword)
        }
      }, { withToken: true }).then((res) => {
          if (res && res.code == 200) {
            message.success("密码修改成功！")
            emit("ok")
          } else {
            message.warning(res?.message || "密码修改失败！")
          }
      }).catch(err => {
          console.info(err)
      })
    }).catch((error:any) => {
      console.log('error', error);
    });
}
function onClose() {
  // 执行取消
  emit("ok")
}
</script>

<style scoped lang="less"></style>