<template>
  <div class="sys-user-dept">
    <a-input-search
        v-model:value="searchDept"
        placeholder="请输入部门名称"
        @search="onSearchDept"
        style="margin-bottom: 10px"
    />
    <a-tree :tree-data="dept" showLine :defaultExpandAll="true">
    </a-tree>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import dept from '/@/mock/test/department.json'
// 搜索部门
let searchDept  = ref<string>('')

/**
 * 搜索部门
 * @param value
 */
function onSearchDept(value) {

}
</script>

<style lang="less" scoped>
.sys-user-dept {
  width: 250px;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
</style>
