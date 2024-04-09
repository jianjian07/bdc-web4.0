<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="{
    token: {
      colorPrimary: '#00b96b',
      fontSize: 14
    },
  }">
    <RouterView />
  </a-config-provider>
</template>
<script lang="ts">
</script>
<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
