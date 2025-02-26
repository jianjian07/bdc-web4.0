<template>
  <div class="sys-user">
    <hall-info @hallInfo="setHallInfo"></hall-info>
    <order-info :hallInfo="hallInfo"></order-info>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import HallInfo from "/@/views/wwsjxt/hallConfig/components/hallInfo.vue"
import OrderInfo from "/@/views/wwsjxt/hallConfig/components/orderInfo.vue"

let hallInfo = ref({})

function setHallInfo(val: any) {
  hallInfo.value = val
}
</script>

<style lang="less" scoped>
.sys-user {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
