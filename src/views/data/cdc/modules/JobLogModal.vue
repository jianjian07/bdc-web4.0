<template>
    <a-drawer :title="title" width="calc(50vw)" :open="open" :body-style="{ paddingBottom: '80px' }" @close="onClose"
        :footer-style="{ textAlign: 'right' }">
        <pre style="font-size:12px;">
        <div v-html="logContent" style="line-height: 30px;"></div></pre>
        <template #extra>
            <a-space>
                <a-button @click="onClose">取消</a-button>
                <!-- <a-button type="primary" @click="onOk">保存</a-button> -->
            </a-space>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { ref } from 'vue';
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
    lType: {
        type: String,
        default: "msg"
    },
    data: {
        type: Object
    },
    with: {
        type: String,
        default: "100%"
    }
})
let logInfo = ref<any>()

logInfo.value = props.data
let logContent;

if (props.lType == 'msg') {
    logContent = ref(logInfo.value.triggerMsg)
} else {
    const message = await getLog()
    logContent = ref(message)
}

debugger
function onClose() {
    emit('ok', { refresh: false })
}
const emit = defineEmits(['ok'])
enum Api {
    logUrl = '/api/zrzy-api/joblog/logDetailCat',
    updateUrl = '/api/zrzy-api/jobinfo/update'
}
function getLog() {
    return new Promise((resolve) => {
        defHttp.get({
            url: Api.logUrl, params: {
                logId: logInfo.value.id,
                fromLineNum: 1
            }
        }, { withToken: true }).then((res) => {
            if (res.code === 200) {
                resolve(res.content.logContent)
            } else {
                message.error(res.msg)
            }
        }).catch(err => {
            message.error(err.message)
        }).finally(() => {

        })
    })
}
</script>
<style scoped>
pre {
    height: 98%;
    display: block;
    padding: 9.5px;
    font-size: 13px;
    line-height: 1.42857143;
    color: #333;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 0px solid #ccc;
}
</style>