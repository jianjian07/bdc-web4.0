<template>
  <div class="file-code-index">
    <file-code-list :treeData="treeData" v-model:selectItem="currentSelectItem"></file-code-list>
    <file-code-form :treeData="treeData" v-model:selectItem="currentSelectItem"></file-code-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import FileCodeList from "/@/views/tools/code/FileCodeList.vue"
import FileCodeForm from "/@/views/tools/code/FileCodeForm.vue"
import { defHttp } from "/@/utils/http/axios"
// 树
let treeData = ref<any>([])
// 当前选中数据
let currentSelectItem = ref<any>()

enum api {
  list = '/api/zrzy-system/sys/coderule/ruleTree'
}

onMounted(() => {
  initData()
})

function initData() {
  defHttp.get({ url: api.list }, { withToken: true }).then((res) => {
    if (res && res.success) {
      let tree = res.result
      initTree(tree)
    }
  })
}

/**
 * 获取树结构
 * @param tree
 */
function initTree(tree) {
  tree.forEach(rootNode => addKeys(rootNode))
  treeData.value = tree
}

/**
 * 增加树属性
 * @param node
 * @param parentKey
 */
function addKeys(node) {
  node.isNeedGetInfo = true
  node.key = node.ruleCode

  if (node.children && node.children.length > 0) {
    node.children.forEach(child => addKeys(child));
  }
}
</script>

<style lang="less" scoped>
.file-code-index {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>