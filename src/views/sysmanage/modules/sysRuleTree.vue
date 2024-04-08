<template>
  <div class="sys-rule-tree">
    <div class="sys-rule-tree-header">
      <span>规则目录</span>
    </div>
    <div class="sys-rule-tree-content">
      <div v-if="catalog.length">
        <a-tree v-model:selectedKeys="selectedKeys" :tree-data="catalog" :fieldNames="fieldNames" :blockNode="true" @select="handleSelectTreeItem">
        </a-tree>
      </div>
      <a-result v-else title="请先配置业务类型">
        <template #extra>
          <a-button key="console" type="primary" @click="goToCategory">去配置</a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { router } from "/@/router"
import { getTreeDictItemsByCode } from "/@/utils/form/commonUtils"
// 规则目录
let catalog = ref([])
// 选中项
let selectedKeys = ref([])
// 替换字段
const fieldNames = {
  children:'children',
  title:'label',
  key:'id'
}

const emit = defineEmits(['update:selectRuleCatalog'])

onMounted(() => {
  catalog.value = getTreeDictItemsByCode('YWLX')
  emit('update:selectRuleCatalog',selectedKeys.value)
})
/**
 * 跳转分类字典
 */
function goToCategory() {
  router.push('/system/category')
}

/**
 * 选中某项
 * @param selectedKey
 * @param e
 */
function handleSelectTreeItem(selectedKey, e) {
  emit('update:selectRuleCatalog',selectedKey.length ? [e.node.dataRef] : [])
}
</script>

<style lang="less" scoped>
.sys-rule-tree {
  width: 300px;
  height: 100%;
  padding: 10px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-flow: column;
  overflow: auto;

  .sys-rule-tree-header {
    margin-bottom: 10px;

    span {
      font-size: 16px;
      font-weight: bold;
    }
  }
}

</style>
