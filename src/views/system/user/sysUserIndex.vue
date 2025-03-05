<template>
  <div class="sys-user">
    <sys-user-dept @deptInfo="setDeptInfo"></sys-user-dept>
    <sys-user-table :deptInfo="deptInfo"></sys-user-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import SysUserDept from "/@/views/system/user/components/sysUserDept.vue"
import SysUserTable from "/@/views/system/user/components/sysUserTable.vue"

let deptInfo = ref({})

function setDeptInfo(data) {
  deptInfo.value = data
}
</script>

<style lang="less" scoped>
.sys-user {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
