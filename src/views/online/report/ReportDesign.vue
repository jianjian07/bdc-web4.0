<template>
    <CImaginReport v-if="show" :id="id"></CImaginReport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';

const route = useRoute();
const code = ref(route.params?.code.toString());
let id = code.value.toString()
let show  = ref(false)
onMounted(() => {
  // 参数初始化完成后再加载设计器 解决切换报错问题
  show.value= true
})
</script>

<style scoped lang="less"></style>
