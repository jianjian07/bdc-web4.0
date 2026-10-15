<template>
    <div class="oper-css">
        <BellOutlined @click="handleAll" />
    </div>
</template>

<script setup lang="ts">
import { BellOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

function handleAll() {
    message.error('抵押或查封到期功能，开发中...')
}
</script>

<style scoped lang="less">
@import url("./index.less");
</style>