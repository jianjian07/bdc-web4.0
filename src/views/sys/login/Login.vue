<template>
  <template v-if="showLogin">
    <a-row class="content-css">
        <a-col :span="7"></a-col>
        <a-col :span="8" :offset="7">
            <div class="login-css">
                <h1
                    style="padding-bottom: 20px;letter-spacing: 0.1em;font-size: calc(0.4rem + 1.8vw);line-height: 1.25;font-weight: 600;">
                    {{ title }}
                </h1>
                <a-form :model="formData" layout="vertical">
                    <a-form-item label="用户名" name="username" :rules="[{ message: '请输入用户名' }]">
                        <a-input v-model:value="formData.username">
                            <template #prefix>
                                <UserOutlined class="site-form-item-icon" />
                            </template>
                        </a-input>
                    </a-form-item>

                    <a-form-item label="密码" name="password" :rules="[{ message: '请输入密码' }]">
                        <a-input-password v-model:value="formData.password">
                            <template #prefix>
                                <LockOutlined class="site-form-item-icon" />
                            </template>
                        </a-input-password>
                    </a-form-item>

                    <a-form-item>
                        <a-button type="primary" block @click="handleLogin" class="login-button-css"
                            style="letter-spacing: 0.5px;height: 40px;" :loading="loading">登录</a-button>
                    </a-form-item>
                    <div style="font-size: 12px;float: right;">
                        <a-space>
                            <template #split>
                                <a-divider type="vertical" />
                            </template>
                            <a @click="forgetPassword">忘记密码？</a> <a @click="initProject">系统初始化</a></a-space>
                    </div>
                </a-form>
            </div>
        </a-col>
    </a-row>
  </template>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { useUserStore } from '/@/store/modules/user';
import { message, notification } from 'ant-design-vue';
import { encryptionAES } from '/@/utils/cipher';
import { router } from '/@/router';
import { getToken } from '/@/utils/auth';
import { defHttp } from "/@/utils/http/axios"
const userStore = useUserStore();
const formData = reactive({
    username: "",
    password: "",
});
const loading = ref<boolean>(false);
let showLogin = ref<boolean>(false)
let title = window?.settingConfig?.appTitle || '不动产登记信息管理系统'
/**
 * 登录
 */
function handleLogin() {
    if (!formData.username || !formData.password) {
        notification.warning({
            message: "登录失败",
            description: "请输入账号密码",
            duration: 3, //超时时间
        });
        return
    }
    loading.value = true
    // 登录参数加密
    let loginParam = {
        username: encryptionAES(formData.username),
        password: encryptionAES(formData.password)
    }
    //审计提示中危，不能log账号密码，注释掉
    // console.log("loginParam", loginParam)
    userStore.login(loginParam).then((res) => {
        loading.value = false
        if (res) {
            notification.success({
                message: "登录提示",
                description: "欢迎回来",
                duration: 3, //超时时间
            });
        } else {
            notification.error({
                message: "登录失败",
                duration: 3, //超时时间
            });
        }
    }).catch(err => {
        loading.value = false
        notification.error({
            message: "登录失败",
            description: err.message,
            duration: 3, //超时时间
        });
    });
}
/**
 * 忘记密码
 */
function forgetPassword() {
    message.warn("尚未开放")
}
function initProject() {
    router.push('/init')
}

onMounted(async () => {
    let status = await getLicenseStatus()
    //let status = true
    if (!status) {
        showLogin.value = false
        router.push('/init')
    } else {
        showLogin.value = true
        const token = getToken()
        if (token) {
            router.push('/analysis')
        }
    }
})

/**
 * 获取License状态
 */
function getLicenseStatus() {
  return new Promise((resolve) => {
    let url = '/api/zrzy-system/sys/common/verifyLicense'
    defHttp.post({ url: url }, { withToken: true }).then((res) => {
       if (res && res.success) {
         if (res.result.success) {
            resolve(true)
         } else {
           message.error(res.result.msg)
           resolve(false)
         }
       } else {
         message.error("授权验证失败")
         resolve(false)
       }
    })
  })
}

</script>
<style scoped>
.content-css {
    background-size: cover;
    background-image: url('/@/assets/images/login/bg.jpg');

    height: 100vh !important
}

.vh-100 {
    height: 100vh !important
}

.w-100 {
    width: 100% !important
}

.d-flex {
    display: flex !important;
}

.m-auto {
    margin: auto !important;
}

.my-5 {
    margin-top: 2.5rem !important;
    margin-bottom: 2.5rem !important;
    margin-top: 2.5rem !important;
    margin-bottom: 2.5rem !important;
}

::v-deep(.ant-input) {
    padding: 4px 11px !important;
}

.left-css {
    background-image: url('/@/assets/images/login/bg.jpg');
}

.login-button-css:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}

.login-css {
    transform: translateY(30%);
    background-color: #fff;
    width: 100%;
    height: 538px;
    padding: 40px 48px 26px;
    font-size: 14px;
    margin-right: 100px;
    border-radius: 4px;
}
</style>
