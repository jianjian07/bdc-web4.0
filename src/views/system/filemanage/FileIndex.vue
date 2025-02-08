<template>
  <div class="file-manage-index">
    <file-tree :fileTree="treeData" v-model:selectItem="currentSelectItem"></file-tree>
    <file-form v-model:selectItem="currentSelectItem"></file-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import FileTree from "/@/views/system/filemanage/components/FileTree.vue"
import FileForm from "/@/views/system/filemanage/components/FileForm.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
// 树
let treeData = ref<any>([])
// 当前选中数据
let currentSelectItem = ref<any>()
// 加载状态
let loading = ref<boolean>(false)

enum api {
  tree = '/api/zrzy-bdc/arch/arch/getArchiveTree'
}

onMounted(() => {
  initData()
})

function initData() {
  defHttp.get({ url: api.tree }, { withToken: true }).then((res) => {
    if (res && res.success) {
      let result = res.result ? [res.result] : []
      initTree(result)
    } else {
      message.warning('加载失败')
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
function addKeys(node, parentKey = '-1') {
    node.key = `${node.type}-${node.id}`;
    node.pkey = parentKey;
    node.isNeedGetInfo = true;

    if (node.children && node.children.length > 0) {
        node.children.forEach(child => addKeys(child, node.key));
    }
}
</script>

<style lang="less" scoped>
.file-manage-index {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>