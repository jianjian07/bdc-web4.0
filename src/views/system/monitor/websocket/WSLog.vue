<template>
    <div style="padding: 10px;line-height: 28px;">
        <h1>实时日志</h1>
        <a-space>
            <a @click="start">启动</a>
            <a @click="stop">停止</a></a-space>
        <div>
        </div>
        <div v-for="(msg, index) in logs" :key="index" class="message">
            <span v-html="msg"></span>
        </div>
    </div>

</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref } from 'vue';

let logs: any = ref([]);
let socket: any = null;
// let logContent = ref("")
function start() {
    socket = new WebSocket(window.settingConfig.proxyBaseDomain + "/zrzy-api/cdc/log");
    socket.onopen = function (event) {
        socket.send("<a>--------开启实时日志--------</a>");
    };
    message.success("启动成功!");
    // 接收服务器返回的消息
    socket.onmessage = (event) => {
        logs.value.push(event.data);
    };
}

function stop() {
    socket.send("<a>--------停止实时日志--------</a>");
    setTimeout(() => {
        socket.close();
        message.success("停止成功!");
    }, 3000);
}
</script>

<style scoped lang="less"></style>