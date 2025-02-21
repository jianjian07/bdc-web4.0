<template>
    <a-drawer :title="title" :width="720" :open="open" :body-style="{ paddingBottom: '80px' }"
        :footer-style="{ textAlign: 'right' }" @close="onClose">
        <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
            <a-button type="primary" @click="onOk">确定</a-button>
        </template>
        <a-form :model="dataInfo" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
            <a-form-item label="用户账号" name="username" :rules="[{ required: true, message: '请输入用户账号' }]">
                <a-input v-model:value="dataInfo.username" />
            </a-form-item>
            <a-form-item label="用户姓名" name="realName" :rules="[{ required: true, message: '请输入用户姓名' }]">
                <a-input v-model:value="dataInfo.realName" />
            </a-form-item>
            <!-- <a-form-item v-if="isAdd" label="密码" name="password" :rules="[{ required: true, message: '请输入用户密码' }]">
                <a-input-password v-model:value="dataInfo.password" />
            </a-form-item> -->
            <a-form-item label="性别" name="sex" :rules="[{ required: true, message: '请选择性别' }]">
                <a-select v-model:value="dataInfo.sex" allowClear
                    :options="getDictItemsByCode('sex').map((a: any) => ({ value: a.label }))" style="width: 100%;">
                </a-select>
            </a-form-item>
            <a-form-item label="生日" name="brithDay">
                <a-date-picker v-model:value="dataInfo.brithDay" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
            <a-form-item label="邮箱" name="email" :rules="[{ message: '请输入邮箱' }]">
                <a-input v-model:value="dataInfo.email" />
            </a-form-item>
            <a-form-item label="手机号码" name="phone" :rules="[{ message: '请输入手机号码' }]">
                <a-input v-model:value="dataInfo.phone" />
            </a-form-item>
            <a-form-item label="联系地址" name="address" :rules="[{ message: '请输入联系地址' }]">
                <a-input v-model:value="dataInfo.address" />
            </a-form-item>
            <a-form-item label="排序" name="sortid">
                <a-input-number v-model:value="dataInfo.sortid" defaultValue="0" />
            </a-form-item>
        </a-form>
    </a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { ref } from 'vue';
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils";
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "用户"
    },
    dataInfo: {
        type: Object,
        default: {}
    }
})
let isAdd = ref(false)
if (props.dataInfo.id == undefined) {
    isAdd.value = true
}
console.log(JSON.stringify(props.dataInfo))
let open = ref(props.open)
const emit = defineEmits(["ok"])

enum api {
    add = '/api/zrzy-system/sys/v1/user/add',
    update = '/api/zrzy-system/sys/v1/user/update'
}
/**
 * 保存
 */
function onOk() {
    console.log(JSON.stringify(props.dataInfo))
    // 执行保存
    let url = api.update
    if (isAdd.value) {
        url = api.add
    }
    defHttp.post({ url: url, data: props.dataInfo }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            if (res.result == '已存在同名用户！') {
                message.error(res.result)
            } else {
                message.success("保存成功")
                emit("ok", { isAdd: true, refreshParentPage: true })
            }
        }


    }).catch(err => {
        console.info(err)
    })
}
function onClose() {
    // 执行取消
    emit("ok", { isAdd: false, refreshParentPage: true })
}
</script>

<style scoped lang="less"></style>