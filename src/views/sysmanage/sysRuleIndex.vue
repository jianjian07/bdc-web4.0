<template>
  <div class="sys-rule">
    <sys-rule-tree v-model:selectRuleCatalog="selectRuleCatalog"></sys-rule-tree>
    <sys-rule-table :selectRuleCatalog="selectRuleCatalog"></sys-rule-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import SysRuleTree from "/@/views/sysmanage/modules/sysRuleTree.vue"
import SysRuleTable from "/@/views/sysmanage/modules/sysRuleTable.vue"
// 当前选中的规则目录
let selectRuleCatalog = ref([])
</script>

<style lang="less" scoped>
.sys-rule {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
