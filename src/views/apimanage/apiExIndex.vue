<template>
  <div class="api-ex-index">
    <a-spin tip="加载中..." :spinning="loading">
      <api-ex-tree :apiTreeData="apiTreeData" v-model:selectItem="currentSelectItem"></api-ex-tree>
    </a-spin>
    <api-ex-manage :apiTreeData="apiTreeData" v-model:selectItem="currentSelectItem" @load="initData"></api-ex-manage>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import ApiExTree from "/@/views/apimanage/modules/apiExTree.vue"
import ApiExManage from "/@/views/apimanage/modules/apiExManage.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { setParentId } from "/@/views/apimanage/modules/apiUtil"

let loading = ref<boolean>(false)
// 树
let apiTreeData = ref<any>([])
// 当前选中数据
let currentSelectItem = ref<any>()

enum api {
  list = '/api/zrzy-api/inner/dir/list'
}

onMounted(() => {
  initData()
})
/**
 * 初始化加载数据
 */
function initData() {
  loading.value = true
  defHttp.get({ url: api.list, params: { apiType: '1' } }, { withToken: true }).then((res) => {
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
        item.isEncryptCheck = item.isEncrypt == '1'
        return item
      })
      tree = setParentId(tree)
      apiTreeData.value = tree
    } else {
      message.warning(res.message)
    }
    loading.value = false
  })
}

</script>

<style lang="less" scoped>
.api-ex-index {
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