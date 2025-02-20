<template>
  <div class="changePassword">
    <!-- 新增目录 -->
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 10 }"
      :rules="formRules"
    >
      <a-form-item
        label="旧密码"
        ref="oldPassword"
        name="oldPassword"
      >
        <a-input-password v-model:value="formState.oldPassword" />
      </a-form-item>
      <a-form-item
        label="新密码"
        ref="newPassword"
        name="newPassword"
        :help="helpinfo"
      >
        <a-input-password v-model:value="formState.newPassword" />
      </a-form-item>
      <a-form-item
        label="确认新密码"
        ref="confirmPassword"
        name="confirmPassword"
      >
        <a-input-password v-model:value="formState.confirmPassword" />
      </a-form-item>
    </a-form>
    <a-space style="display: flex; align-items: center; justify-content: center; width: 100%;">
      <a-button type="primary" @click="onSubmit()">确认</a-button>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, h } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { encryptionAES } from '/@/utils/cipher';
import { useUserStoreWithOut } from "/@/store/modules/user";
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

const formRef = ref()

const formState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

let helpinfo = ref('新密码必须包含大小写字母和数字，且长度为8-16位！')

onMounted(() => {
  helpinfo.value = window?.settingConfig?.pwd_regexErrorMsg

  console.log('helpinfo.value', helpinfo.value, window?.settingConfig)
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formState.newPassword) {
    callback('两次输入的密码不一致');
  } else {
    callback();
  }
};

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
  oldPassword: [
    { required: true, message: '请输入旧密码' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { validator: validateNewPassword, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'change' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ]
}

const urlList = {
  update: '/api/zrzy-system/sys/v1/user/updatePassword'
}

// 添加区域
const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      // 新增
      defHttp.post(
        {
          url: urlList.update,
          params: {
            oldPassword: encryptionAES(formState.oldPassword),
            newPassword: encryptionAES(formState.newPassword),
            newRePassword: encryptionAES(formState.confirmPassword)
          }
        },
        { withToken: true }
      ).then((res: any) => {
        if(res?.success) {

          let secondsToGo = 2;
          const modal = Modal.success({
            title: `密码修改成功，${secondsToGo}秒后自动跳转登录！`,
          });
          const interval = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
              title: `密码修改成功，${secondsToGo}秒后自动跳转登录！`,
            });
          }, 1000);

          setTimeout(() => {
            clearInterval(interval);
            const userStore = useUserStoreWithOut();
            userStore.setToken(undefined)
            userStore.logout(true)
            modal.destroy();
          }, secondsToGo * 1000);
          
        } else {
          message.warning(res?.message || '密码修改失败！')
        }
      })
    }).catch((error:any) => {
      console.log('error', error);
    });
}

</script>

<style scoped lang="less">
.changePassword {
  padding: 20px;
}
</style>