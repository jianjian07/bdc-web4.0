<template>
  <div class="db-permission-index">
    <permission-list type="db"></permission-list>
  </div>
</template>

<script setup lang="ts">
import PermissionList from "/@/views/bpm/config/modules/PermissionList.vue"
</script>

<style scoped lang="less">
.db-permission-index {
  padding: 10px;
}
</style>