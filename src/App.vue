<script setup lang="ts">
import { useUserStoreWithOut } from "/@/store/modules/user"
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import LockScreen from "/@/views/sys/lock/LockScreen.vue"
import { onMounted, onBeforeUnmount } from "vue"
import { router } from "/@/router"
const userStore = useUserStoreWithOut()

// 页面加载时的逻辑
onMounted(() => {
  let isPageReloaded = sessionStorage.getItem('isPageReloaded')
  if (!isPageReloaded) {
    // 第一次加载
    sessionStorage.setItem('isPageReloaded', 'true')
  }
  if (!userStore.getToken) {
    userStore.resetLockState()
    router.replace('/login');
  } else if (userStore.getIsLocked == 'true') {
    if (!isPageReloaded) {
      // 第一次加载或是新标签页打开 如果已经是被锁状态，直接跳转登录
      userStore.resetLockState()
      userStore.setToken('')
      router.replace('/login');
    } else {
      // 刷新当前标签页时
      userStore.lockScreen();
    }
  }
});

</script>

<template>
  <a-config-provider :locale="zhCN" :theme="{
    token: {
      colorPrimary: '#5094F9',
      fontSize: 13
    },
  }">
    <lock-screen v-if="userStore.getIsLocked == 'true'"></lock-screen>
    <RouterView v-else/>
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


/**修改滚动条样式（仅Google有效） */
::-webkit-scrollbar {
  width: 7px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background-color: #b6b7b9;
}

input[aria-hidden=true]{
    display: none !important;
}
</style>
