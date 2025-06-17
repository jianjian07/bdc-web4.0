<template>
  <div class="db-permission-index">
    <permission-list type="db"></permission-list>
  </div>
</template>

<script setup lang="ts">
import PermissionList from "/@/views/system/permission/modules/PermissionList.vue"
</script>

<style scoped lang="less">
.db-permission-index {
  padding: 10px;
}
</style>