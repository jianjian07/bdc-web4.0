<template>
    <a-form ref="formRef" :model="licenseData" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" autocomplete="off"
        style="padding-top: 20px;">
        <a-form-item label="CPU序列号" :rules="[{ required: true, message: 'Please input your username!' }]">
            <a-input v-model:value="licenseData.cpuSerial" />
        </a-form-item>
        <a-form-item label="硬盘序列号" :rules="[{ required: true, message: 'Please input your username!' }]">
            <a-input v-model:value="licenseData.diskSerial" />
        </a-form-item>
        <!-- <a-form-item label="MAC地址" :rules="[{ required: true, message: 'Please input your username!' }]">
            <a-input v-model:value="licenseData.macAddress" />
        </a-form-item> -->
        <a-form-item label="注册码" name="license" :rules="[{ required: true, message: '请输入授权码!' }]">
            <a-textarea v-model:value="licenseData.license" placeholder="请输入授权码" :rows="6" allow-clear />
        </a-form-item>
        <a-form-item label="授权日期" name="expiryDate" :rules="[{ required: true, message: '请输入授权期限!' }]">
            <a-date-picker v-model:value="licenseData.expiryDate" style="width: 250px;" format="YYYY-MM-DD"
                value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            <a-button v-if="showCreate" type="primary" @click="onLicense">生成授权</a-button>&nbsp;&nbsp;
            <a-button type="primary" @click="register">注册授权</a-button>&nbsp;&nbsp;
            <a-button type="primary" @click="verifyLicense">验证授权</a-button>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            <span class="text">授权码已保存</span>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { usePermissionStore } from "/@/store/modules/permission.ts"
const permissionStore = usePermissionStore()
const showCreate = computed(() => permissionStore.showCreateBtn)
enum api {
    getUrl = '/api/zrzy-system/sys/common/get',
    licenseUrl = '/api/zrzy-system/sys/common/generateLicense',
    registerUrl = '/api/zrzy-system/sys/common/registerLicense',
    verifyLicense = '/api/zrzy-system/sys/common/verifyLicense'
}
let licenseData: any = ref({})

let formRef = ref<any>();

/**
 * 生成授权
 */
const onLicense = async () => {
    await formRef.value.validateFields('expiryDate');
    defHttp.post({ url: api.licenseUrl, data: licenseData.value }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            licenseData.value.license = res.result
        } else {
            message.error("获取授权失败")
        }
    })
}
/**
 * 注册授权
 */
const register = async () => {
    await formRef.value.validateFields(["license"]);
    defHttp.post({ url: api.registerUrl, data: { license: licenseData.value.license } }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            message.info("注册授权成功")
        } else {
            message.error("注册授权失败")
        }
    })
}
/**
 * 验证授权
 */
const verifyLicense = () => {
    defHttp.post({ url: api.verifyLicense }, { withToken: true }).then((res) => {
        if (res && res.success) {
            if (res.result.success) {
                message.info(res.result.msg)
            } else {
                message.error(res.result.msg)
            }
        } else {
            message.error("授权验证失败")
        }
    })
}
onMounted(() => {
    defHttp.get({ url: api.getUrl }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            licenseData.value = res.result
        }
    })
})
</script>

<style scoped lang="less"></style>
