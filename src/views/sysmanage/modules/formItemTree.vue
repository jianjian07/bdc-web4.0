<template>
  <div class="form-item-tree">
    <div class="form-item-header">
      <span>事项配置管理</span>
    </div>
    <div class="form-item-content">
      <div v-if="catalog.length">
        <a-tree v-model:selectedKeys="selectedKeys" :tree-data="catalog" :fieldNames="fieldNames" :blockNode="true" @select="handleSelectTreeItem">
        </a-tree>
      </div>
      <a-result v-else title="请先配置事项">
        <template #extra>
          <a-button key="console" type="primary" @click="goToCategory">去配置</a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { getTreeDictItemsByCode } from "/@/utils/form/commonUtils"
import { router } from "/@/router"
// 事项分类
let catalog = ref<any[]>([])
// 选中项
let selectedKeys = ref([])
// 第一层的parentId
let fParentId = ref('')
// 替换字段
const fieldNames = {
  children:'children',
  title:'label',
  key:'id'
}

const emit = defineEmits(['update:selectItemCatalog'])

onMounted(() => {
  catalog.value = getTreeDictItemsByCode('SXLX')
  if (catalog.value[0]) {
    fParentId.value = catalog.value[0].parent_id
    selectedKeys.value = [catalog.value[0].id]
    let format = formatSelectItemCatalog(catalog.value[0])
    emit('update:selectItemCatalog',[format])
  } else {
    emit('update:selectItemCatalog',selectedKeys.value)
  }

})

/**
 * 处理选中的数据
 * @param value
 */
function formatSelectItemCatalog(item) {
  if (item.children && item.children.length > 0) {
    return item
  }
  if (item.parent_id) {
    // 事项
    let findItem = findNodeById(catalog.value, Number(item.parent_id))
    let findBusinessItem
    if (findItem && findItem.parent_id && findItem.parent_id !== fParentId.value) {
      findBusinessItem = findNodeById(catalog.value, Number(findItem.parent_id))
    } else if (findItem && findItem.parent_id && findItem.parent_id == fParentId.value) {
      // 只有两级 默认第一级和第二级一样
      findBusinessItem = findItem
    }
    if (findItem && findBusinessItem && findBusinessItem.parent_id == fParentId.value) {
      item.businessCode = findBusinessItem.value
      item.businessName = findBusinessItem.label
      item.itemCode = findItem.value
      item.itemName = findItem.label
    }
  }
  return item
}

/**
 * 根据id查找节点
 * @param arr
 * @param id
 */
function findNodeById(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i]
    if (node.id === id) return node
    if (node.children && node.children.length > 0) {
      let foundNode = findNodeById(node.children, id)
      if (foundNode) return foundNode
    }
  }
  return null
}

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
  let format = formatSelectItemCatalog(e.node.dataRef)
  emit('update:selectItemCatalog',selectedKey.length ? [format] : [])
}
</script>

<style lang="less" scoped>
.form-item-tree {
  width: 300px;
  height: 100%;
  padding: 10px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-flow: column;
  overflow: auto;

  .form-item-header {
    margin-bottom: 10px;

    span {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
