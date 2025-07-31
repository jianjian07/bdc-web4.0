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
        <a-space>
            <a @click="start">启动</a>
            <a @click="stop">停止</a>
            <a @click="() => { logs = [] }">清空日志</a>
        </a-space>
        <div>
        </div>
        <monaco-editor :modelValue="logs.join('\n')" :readOnly="true" theme="vs" language="sql"
            style="width: 100%;overflow: auto" height="800px">
        </monaco-editor>
        <!-- <div v-for="( msg, index ) in  logs " :key=" index " class="message">
            <span v-html=" msg "></span>

        </div> -->
    </div>

</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { reactive, ref } from 'vue';
import MonacoEditor from "/@/components/monaco/monacoEditor.vue"
const selectTags = ref([true, false]);
const tagsData = reactive(['zrzy-api', 'zrzy-cdc']);

let currentTag = ref("zrzy-api");
let logs: any = ref([]);
let socket: any = null;
// let logContent = ref("")
function start() {
    let a = currentTag.value
    let b = window.settingConfig.baseDomain + "/" + a + "/cdc/log"
    socket = new WebSocket(b);
    socket.onopen = function (event) {
        socket.send("---------------开启实时日志---------------");
    };
    message.success("启动成功!");
    // 接收服务器返回的消息
    socket.onmessage = (event) => {
        logs.value.push(event.data);
    };
}

function stop() {
    socket.send("---------------停止实时日志---------------");
    setTimeout(() => {
        socket.close();
        message.success("停止成功!");
    }, 3000);
}

const handleChange = (tag: string, checked: boolean) => {
    if (checked) {
        // 找到当前选中的tag的索引
        const currentIndex = tagsData.indexOf(tag);
        // 将所有selectTags设置为false
        selectTags.value.fill(false);
        // 只将当前选中的tag设置为true
        selectTags.value[currentIndex] = true;
        currentTag.value = tag;
    }
};
</script>

<style scoped lang="less"></style>