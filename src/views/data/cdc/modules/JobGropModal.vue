<template>
    <a-drawer :title="title" width="calc(50vw)" :open="open" :body-style="{ paddingBottom: '80px' }" @close="onClose"
        :footer-style="{ textAlign: 'right' }">
        <a-form :model="jobInfo" ref="ruleForm" :label-col="{ style: { width: '150px' } }" layout="horizontal"
            autocomplete="off">
            <a-divider orientation="left">执行器基础配置</a-divider>
            <a-row :gutter="24">
                <a-col :span="24">
                    <a-form-item label="AppName" name="appname" :rules="[{ required: true, message: '执行器' }]">
                        <a-input v-model:value="jobInfo.appname" prefix="" suffix="" />
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="名称" name="title" :rules="[{ required: true, message: '任务描述' }]">
                        <a-input v-model:value="jobInfo.title" prefix="" suffix="" />
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="注册方式" name="addressType" :rules="[{ required: true, message: '负责人' }]">
                        <a-radio-group v-model:value="jobInfo.addressType" name="addressType">
                            <a-radio value="0">自动注册</a-radio>
                            <a-radio value="1">手动注册</a-radio>
                        </a-radio-group>
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="机器地址" name="addressList" :rules="[{ required: true, message: '报表编号' }]">
                        <a-textarea v-model:value="jobInfo.addressList" />
                    </a-form-item>
                </a-col>

            </a-row>
        </a-form>
        <template #extra>
            <a-space>
                <a-button @click="onClose">取消</a-button>
                <a-button type="primary" @click="onOk">保存</a-button>
            </a-space>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "任务属性"
    },
    data: {
        type: Object
    }
})
let jobInfo = ref<any>()
let ruleForm = ref<any>()
jobInfo.value = props.data
jobInfo.value.addressType = props.data!.addressType == 1 ? "1" : "0"
function onClose() {
    emit('ok', { refresh: false })
}
const emit = defineEmits(['ok'])
function onOk() {
    ruleForm.value.validate().then(() => {
        let url = '/api/zrzy-api/xxljob/jobinfo/addOrUpdate' // 新增
        defHttp.post({ url: url, data: jobInfo.value }, { withToken: true }).then((res) => {
            if (res.success) {
                message.success('保存成功')
            } else {
                message.error(res.message)
            }
        }).catch(err => {
            message.error(err.message)
        }).finally(() => {
            // emit('ok', { refresh: true })
        })
    })
}
function onChange(value: any) {
    jobInfo.value.scheduleType = value
}
</script>
