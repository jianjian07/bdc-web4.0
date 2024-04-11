<template>
  <div class="spin-mask">
    <a-spin :tip="maskText"></a-spin>
  </div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from "vue"

const props = defineProps({
  maskText: {
    type: String,
    default: "蒙版默认文字"
  }
});

onMounted(() => {
  // 禁止右键默认菜单事件
  document.oncontextmenu = function () {
    return false
  }
})

onBeforeUnmount(() => {
  document.oncontextmenu = function () {
    return true
  }
})

</script>
<style>
.spin-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  background: rgba(255,255,255,0.3);
}
</style>
