<template>
  <div class="lock-screen">
    <div class="lock-form">
      <a-form layout="vertical">
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center">
          <img style="border-radius: 50%;width: 55px;height: 55px;margin-top: -5px;"
                            :src="getAvatarUrl" />
          <div style="font-size: 16px; padding: 10px 0">{{ hello() }}{{ userInfo.realname }}</div>
        </div>
        
        <a-form-item v-if="false" name="username" :rules="[{ message: '请输入用户名' }]">
            <a-input v-model:value="userInfo.username">
                <template #prefix>
                    <UserOutlined class="site-form-item-icon" />
                </template>
            </a-input>
        </a-form-item>
        
        <a-form-item name="password" :rules="[{ message: '请输入密码' }]">
            <a-input-password v-model:value="_password">
                <template #prefix>
                    <LockOutlined class="site-form-item-icon" />
                </template>
            </a-input-password>
        </a-form-item>

        <a-form-item>
            <a-button type="primary" block @click="unlock" class="login-button-css"
                style="letter-spacing: 0.5px;height: 40px;" :loading="loading">解锁</a-button>
        </a-form-item>
    </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 登录参数加密
import { encryptionAES } from "/@/utils/cipher"
import { useUserStoreWithOut } from "/@/store/modules/user"
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue';
import { computed, ref } from "vue"
import { getUrl } from "/@/utils"
import { notification } from "ant-design-vue"

const userStore = useUserStoreWithOut()
const userInfo = userStore.getUserInfo
let _password = ref<string>('')
let loading = ref<boolean>(false)

/**
 * 头像  临时固定
 */
const getAvatarUrl = computed(() => {
    return getUrl('images/user/photo.png')
});

/**
 * 解锁
 */
function unlock() {
  if (_password.value) {
    let pwd = encryptionAES(_password.value)
    let status = userStore.unLockScreen(pwd)
    if (status) {
      notification.success({
        message: "登录提示",
        description: "欢迎回来",
        duration: 3, //超时时间
      });
    } else {
      notification.error({
        message: "登录失败",
        description: "密码不正确!",
        duration: 3, //超时时间
      });
    }
  } else {
    notification.warning({
      message: "登陆失败",
      description: "请输入密码",
      duration: 3, //超时时间
    })
  }
   
}

// 头部问候语
function hello() {
  let today = new Date();
  let hour = today.getHours();
  let hello;

  if (hour < 6) {
      hello = '凌晨好，';
  } else if (hour < 9) {
      hello = '早上好，';
  } else if (hour < 12) {
      hello = '上午好，';
  } else if (hour < 14) {
      hello = '中午好，';
  } else if (hour < 17) {
      hello = '下午好，';
  } else if (hour < 19) {
      hello = '傍晚好，';
  } else if (hour < 22) {
      hello = '晚上好，';
  } else {
      hello = '夜深了，';
  }
  return hello
}
</script>

<style lang="less" scoped>
.lock-screen {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-image: url('/@/assets/images/login/bg.jpg');
  
  .lock-form {
    width: 350px;
    background-color: white;
    padding: 40px 48px 26px;
    font-size: 14px;
    border-radius: 4px;
  }
}
</style>