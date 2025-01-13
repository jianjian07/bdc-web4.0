<template>
 <div class="api-editor">
   <a-spin tip="加载中..." :spinning="loading">
     <api-tree :apiTreeData="apiTreeData" v-model:selectItem="currentSelectItem"></api-tree>
   </a-spin>
    <api-manage :apiTreeData="apiTreeData" v-model:selectItem="currentSelectItem" @load="initData"></api-manage>
 </div>
</template>

<script lang="ts" setup>
import ApiTree from "/@/views/apimanage/modules/apiTree.vue"
import { onMounted, ref } from "vue"
import ApiManage from "/@/views/apimanage/modules/apiManage.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { setParentId } from "/@/views/apimanage/modules/apiUtil"
// 接口列表
let apiList = ref<any>([])
// 树
let apiTreeData = ref<any>([])
// 当前选中数据
let currentSelectItem = ref<any>()
//
let loading = ref<boolean>(false)

enum api {
  list = '/api/zrzy-api/api/config/pages'
}

onMounted(() => {
  initData()
})

/**
 * 初始化数据
 */
function initData() {
  loading.value = true
  defHttp.get({ url: api.list, params: { pageNo: 1, pageSize: 9999 } }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      apiList.value = res.result.records.map((item: any) => {
        item.apiHeaders = JSON.parse(item.requestHeader)
        item.apiParameters = JSON.parse(item.requestParam)
        item.apiBody = JSON.parse(item.requestBody)
        return item
      })
    } else {
      apiList.value = []
    }
    initTree()
  }).catch(err => {
    loading.value = false
    message.warning('发生错误')
  })
}

/**
 * 初始化树结构
 */
function initTree() {
  let tree = setTree(apiList.value, 'apiGroupName')
  tree = setParentId(tree)
  apiTreeData.value = tree
  loading.value = false
}

/**
 * 创建树结构
 */
function setTree(list, dirName) {
  let obj = {}
  for (let i = 0; i < list.length; i++) {
    for (let item in list[i]) {
      let timestamp = new Date().getTime()
      if (item == dirName) {
        obj[list[i][item]] = {
          id: list[i].apiGroupName + (timestamp + i),
          apiGroupName: list[i].apiGroupName,
          publicKey: list[i].publicKey,
          privateKey: list[i].privateKey,
          children: obj[list[i][dirName]] ? obj[list[i][dirName]].children : []
        }
      }
    }
    obj[list[i][dirName]].children.push(list[i])
  }
  let att = []
  for (let item in obj) {
    att.push({
      id: obj[item].id,
      apiGroupName: obj[item].apiGroupName,
      publicKey: obj[item].publicKey,
      privateKey: obj[item].privateKey,
      children: obj[item].children
    })
  }
  return att
}

</script>

<style lang="less" scoped>
.api-editor {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
