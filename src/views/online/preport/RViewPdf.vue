<template>
  <CPViewPdf :id="id" :params="params"></CPViewPdf>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { currentRoute } from "/@/router"
const route = currentRoute;
let { id, ...rest } = route.query;
let params = rest;
let show = ref(false)
onMounted(() => {
  // 参数初始化完成后再加载设计器 解决切换报错问题
  show.value = true
})
</script>

<style scoped lang="less"></style>
