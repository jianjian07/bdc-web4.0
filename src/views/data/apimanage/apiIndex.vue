<template>
  <div class="api-editor">
    <a-spin tip="加载中..." :spinning="loading">
      <api-tree :apiTreeData="apiTreeData" v-model:selectItem="currentSelectItem"></api-tree>
    </a-spin>
    <api-manage :apiTreeData="apiTreeData" v-model:selectItem="currentSelectItem" @load="initData"></api-manage>
  </div>
</template>

<script lang="ts" setup>
import ApiTree from "/@/views/data/apimanage/modules/apiTree.vue"
import { onMounted, ref } from "vue"
import ApiManage from "/@/views/data/apimanage/modules/apiManage.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { setParentId } from "/@/views/data/apimanage/modules/apiUtil"
// 树
let apiTreeData = ref<any>([])
// 当前选中数据
let currentSelectItem = ref<any>()
//
let loading = ref<boolean>(false)

enum api {
  list = '/api/zrzy-api/inner/dir/list'
}

onMounted(() => {
  initData()
})

/**
 * 初始化数据
 */
function initData() {
  loading.value = true
  defHttp.get({ url: api.list, params: { apiType: '2' } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      let tree = res.result.map((item) => {
        item.apiList = item.apiList.map((apiItem) => {
          apiItem.apiHeaders = JSON.parse(apiItem.requestHeader)
          apiItem.apiParameters = JSON.parse(apiItem.requestParam)
          apiItem.apiBody = JSON.parse(apiItem.requestBody)
          apiItem.apiDataSource = JSON.parse(apiItem.apiSql)
          return apiItem
        })
        item.children = item.apiList
        item.apiKeys = JSON.parse(item.encryptKey || '[]')
        item.apiPublicParams = JSON.parse(item.publicParam || '[]')
        item.isEncryptCheck = item.isEncrypt == '1'
        return item
      })
      tree = setParentId(tree)
      apiTreeData.value = tree
    } else {
      message.warning(res?.message)
    }
    loading.value = false
  }).catch(err => {
    message.error(err)
    loading.value = false
  })
}

</script>

<style lang="less" scoped>
.api-editor {
  width: 100%;
  height: 100%;
  display: flex;

  :deep(.ant-table.ant-table-small) {
    .ant-table-tbody>tr>td {
      padding: 2px;
    }
  }
}
</style>
