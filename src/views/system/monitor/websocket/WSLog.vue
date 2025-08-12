<template>
    <div style="padding: 10px;line-height: 28px;">
        <span style="margin-right: 8px">实时日志-当前服务:</span>
        <a-space :size="[0, 8]" wrap>
            <a-checkable-tag v-for="(tag, index) in tagsData" :key="tag" v-model:checked="selectTags[index]"
                @change="checked => handleChange(tag, checked)">
                {{ tag }}
            </a-checkable-tag>
        </a-space>
        <br />
        <a-space style="padding: 5px 0;">
            <a-button type="primary" @click="start" size="small" :disabled="open">
                <CaretRightOutlined />启动
            </a-button>
            <a-button type="primary" @click="stop" size="small" :disabled="!open">
                <MinusOutlined />停止
            </a-button>
            <a-button type="primary" @click="() => { logs = [] }" size="small">
                <ClearOutlined />清空日志
            </a-button>
        </a-space>
        <div>
        </div>
        <monaco-editor :modelValue="logs.join('\n')" :readOnly="true" theme="vs" language="sql"
            style="width: 100%;overflow: auto" height="800px">
        </monaco-editor>
    </div>

</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { reactive, ref } from 'vue';
import MonacoEditor from "/@/components/monaco/monacoEditor.vue"
import { CaretRightOutlined, MinusOutlined, ClearOutlined } from '@ant-design/icons-vue';
import { onUnmounted } from 'vue';
const selectTags = ref([true, false]);
const tagsData = reactive(['zrzy-api', 'zrzy-cdc', 'zrzy-bdc', 'zrzy-system']);

let currentTag = ref("zrzy-api");
let logs: any = ref([]);
let socket: any = null;
let open = ref(false)
let disabled = ref(false)
// let logContent = ref("")
function start() {
    let a = currentTag.value
    let b = window.settingConfig.wsbaseDomain + "/" + a + "/cdc/log"
    socket = new WebSocket(b);
    socket.onopen = function (event) {
        socket.send("---------------开启实时日志---------------");
    };
    message.success("启动成功!");
    open.value = true
    // 接收服务器返回的消息
    socket.onmessage = (event) => {
        logs.value.push(event.data);
    };
}

function stop() {
    socket.send("---------------停止实时日志---------------");
    setTimeout(() => {
        socket.close();
        open.value = false
        message.success("停止成功!");
    }, 3000);
}

const handleChange = (tag: string, checked: boolean) => {
    if (checked) {
        if (open.value) {
            stop()
        }
        logs.value = []
        // 找到当前选中的tag的索引
        const currentIndex = tagsData.indexOf(tag);
        // 将所有selectTags设置为false
        selectTags.value.fill(false);
        // 只将当前选中的tag设置为true
        selectTags.value[currentIndex] = true;
        currentTag.value = tag;
    }
};
onUnmounted(() => {
    if (socket) {
        socket.close();
    }
})
</script>

<style scoped lang="less"></style>