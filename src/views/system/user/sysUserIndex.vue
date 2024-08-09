<template>
  <div class="sys-user">
    <sys-user-dept></sys-user-dept>
    <sys-user-table></sys-user-table>
  </div>
</template>

<script lang="ts" setup>
import SysUserDept from "/@/views/system/user/components/sysUserDept.vue"
import SysUserTable from "/@/views/system/user/components/sysUserTable.vue"

</script>

<style lang="less" scoped>
.sys-user {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
