<template>
  <div class="sys-menu">
    <sys-menu-tree v-model:currentSysKey="currentSysKey"></sys-menu-tree>
    <sys-menu-table :currentSysKey="currentSysKey"></sys-menu-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import SysMenuTree from "/@/views/system/menu/components/sysMenuTree.vue"
import SysMenuTable from "/@/views/system/menu/components/sysMenuTable.vue"
// 当前选择的系统
let currentSysKey = ref<any>('')

</script>

<style lang="less" scoped>
.sys-menu {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
