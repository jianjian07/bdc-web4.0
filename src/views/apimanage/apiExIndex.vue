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
  defHttp.get({ url: api.list }, { withToken: true }).then((res) => {
    if (res && res.success) {
      apiTreeData.value = res.result.map((item) => {
        item.children = item.apiList
        item.isEncryptCheck = item.isEncrypt == '1'
        return item
      })
    } else {
      message.warning(res.message)
    }
    loading.value = false
  })
//   apiTreeData.value = [{
//     id: 'p1',
//     name: '不动产',
//     apiCode: 'wwsj',
//     publicKey: '',
//     privateKey: '',
//     isEncrypt: '',
//     encryptType: '',
//     apiType: '1',
//     bz: '',
//     children: [{ 
//       "id": "222",
//     "pid": "p1",
//     "apiCode": "cscs",
//     "apiName": "新增接口",
//     "apiType": "3",
//     "apiGroupName": "不动产",
//     "publicKey": "",
//     "privateKey": "",
//     "requestType": "POST",
//     "versionCode": "testEnv",
//     "apiHeaders": [],
//     "apiParameters": [],
//     "apiBody": {
//         "key": "1",
//         "parentKey": "-1",
//         "fieldName": "根节点",
//         "fieldValue": "",
//         "dataType": "Object",
//         "defaultValue": "",
//         "isMust": false,
//         "isEncrypt": false,
//         "encryptType": "",
//         "description": "根节点"
//     },
//     "apiDataSource": [
//         {
//             "id": "新增数据源1736404956475",
//             "title": "新增数据源1736404956475",
//             "isMain": "1",
//             "type": "sql",
//             "content": "-- SQL Mode for CodeMirror\nSELECT SQL_NO_CACHE DISTINCT\n\t\t@var1 AS `val1`, @'val2', @global.'sql_mode',\n\t\t1.1 AS `float_val`, .14 AS `another_float`, 0.09e3 AS `int_with_esp`,\n\t\t0xFA5 AS `hex`, x'fa5' AS `hex2`, 0b101 AS `bin`, b'101' AS `bin2`,\n\t\tDATE '1994-01-01' AS `sql_date`, { T \"1994-01-01\" } AS `odbc_date`,\n\t\t'my string', _utf8'your string', N'her string',\n        TRUE, FALSE, UNKNOWN\n\tFROM DUAL\n\t-- space needed after '--'\n\t# 1 line comment\n\t/* multiline\n\tcomment! */\n\tLIMIT 1 OFFSET 0;\n"
//         }
//     ],
//     "requestParam": "[]",
//     "requestHeader": "[]",
//     "requestBody": "{\"key\":\"1\",\"parentKey\":\"-1\",\"fieldName\":\"根节点\",\"fieldValue\":\"\",\"dataType\":\"Object\",\"defaultValue\":\"\",\"isMust\":false,\"isEncrypt\":false,\"encryptType\":\"\",\"description\":\"根节点\"}",
//     "isEncrypt": 0
// }]
//   }]
  
}
</script>

<style lang="less" scoped>
.api-ex-index {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>