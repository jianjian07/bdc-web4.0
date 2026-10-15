<template>
    <a-tabs v-model:activeKey="activeKey" tab-position="left" style="width: 80%;margin:10px 10%;">
        <a-tab-pane key="1" tab="导出流程">
            <ExIndex />
        </a-tab-pane>
        <a-tab-pane key="2" tab="导入流程">
            <ImIndex />
        </a-tab-pane>
    </a-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ExIndex from '/@/views/bpm/sxgl/components/ExIndex.vue';
import ImIndex from '/@/views/bpm/sxgl/components/ImIndex.vue';



let activeKey = ref("1");



</script>

<style scoped lang="less"></style>