<template>
    <a-row class="content-css">
        <a-col :span="7"></a-col>
        <a-col :span="8" :offset="7">
            <div class="login-css">
                <h1
                    style="padding-bottom: 20px;letter-spacing: 0.1em;font-size: calc(0.5rem + 1.8vw);line-height: 1.25;font-weight: 600;">
                    不动产登记系统
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

                        <a @click="forgetPassword">忘记密码？</a>
                    </div>
                </a-form>
            </div>
        </a-col>
    </a-row>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { message, notification } from 'ant-design-vue';
import { useUserStore } from '/@/store/modules/user';
const userStore = useUserStore();
const formData = reactive({
    username: "admin",
    password: "123456",
});
const loading = ref<boolean>(false);
/**
 * 登录
 */
function handleLogin() {
    if (!loading.value) {
        loading.value = true
        const userinfo = userStore.login(formData);
        notification.success({
            message: "登录提示",
            description: "欢迎回来",
            duration: 3, //超时时间
        });
        // console.log("点击登录")
    }
}
/**
 * 忘记密码
 */
function forgetPassword() {
    message.warn("尚未开放")
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

.login-img {
    background-image: url('/@/assets/svg/logo-icon.svg');
    height: 50px;
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