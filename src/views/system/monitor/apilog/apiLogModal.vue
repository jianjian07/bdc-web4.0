<template>
    <a-drawer title="接口日志详情" :width="1200" :open="open" :closable="false" @close="onClose">
        <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
        </template>
        <h1>{{ data.remark }}</h1>
        <p style="color: #6c727f !important;"><a-tag :color="data.requestType == 'POST' ? 'orange' : 'green'">
                {{ data.requestType }}</a-tag>{{ data.url }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ data.createBy }}
            <a-divider type="vertical" />{{
        data.createTime }}
        </p>

        <a-form :model="data" layout="vertical">
            <a-row :gutter="24">
                <a-col :span="24">
                    <a-form-item label="请求头">
                        <monaco-editor v-model="data.headers" height="100px" language="json"
                            style="width: 100%;overflow: auto" theme="vs">
                        </monaco-editor>
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="请求参数">
                        <monaco-editor v-model="data.params" height="300px" language="json"
                            style="width: 100%;overflow: auto" theme="vs">
                        </monaco-editor>
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="异常信息">
                        <a-textarea v-model:value="data.errorMessage" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-divider orientation="left">请求结果</a-divider>
            <monaco-editor v-model="data.result" height="300px" language="json" style="width: 100%;overflow: auto"
                theme="vs">
            </monaco-editor>
            <!-- { title: "地址", dataIndex: "url", ellipsis: true },
    { title: '请求类型', dataIndex: "requestType", ellipsis: true, width: 80 },
    { title: "参数", dataIndex: "params", ellipsis: true },
    { title: '请求头', dataIndex: "headers", ellipsis: true },
    { title: '标志', dataIndex: "flag", ellipsis: true, width: 80 },
    { title: '异常信息', dataIndex: "errorMessage", ellipsis: true },
    { title: '返回结果', dataIndex: "result", ellipsis: true },
    { title: '请求人', dataIndex: "createBy", ellipsis: true },
    { title: '请求时间', dataIndex: "createTime", ellipsis: true }, -->
        </a-form>

    </a-drawer>
</template>

<script setup lang="ts">
import MonacoEditor from "/@/components/monaco/monacoEditor.vue"
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    data: {
        type: Object,
        default: []
    }
})
let ss = JSON.parse(props.data.headers)

const emit = defineEmits(["ok"])
const onClose = () => {
    emit("ok")
};
</script>

<style scoped lang="less"></style>