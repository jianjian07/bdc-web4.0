<template>
  <div class="form-item-manage">
    <form-item-tree v-model:selectItemCatalog="selectItemCatalog"></form-item-tree>
    <form-item-table :selectItemCatalog="selectItemCatalog"></form-item-table>
  </div>
</template>

<script lang="ts" setup>
// 表单事项管理
import FormItemTree from "/@/views/sysmanage/modules/formItemTree.vue"
import FormItemTable from "/@/views/sysmanage/modules/formItemTable.vue"
import { ref } from "vue"
// 当前选中的事项
let selectItemCatalog = ref([])
</script>

<style lang="less" scoped>
.form-item-manage {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
