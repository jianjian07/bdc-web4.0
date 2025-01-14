<template>
  <div class="spyj-list">
    <a-table :columns="columns" 
             :data-source="dataList" 
             :pagination="pagination"
             @change="onChange($event, loadData)" 
             :row-key="record => record.id"
             :row-selection="{ type: 'radio', selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex == 'index'">
          {{ index + 1 }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
// 数据源
let dataList = ref<any>([])
// 角色列表
let roleList = ref<any>([])

const state = reactive({
  selectedRowKeys: []
})

const columns = [
  { title: "序号", dataIndex: "index", width: '60px' },
  { title: "名称", dataIndex: "designName" },
  { title: "意见内容", dataIndex: "designContent" }
]

let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})

enum api {
  roleList = '/api/zrzy-system/UserRole/getUserRoleIdList',
  list = '/api/zrzy-bdc/bdc/bdcDesignText/list',
}

onMounted(async () => {
  await getUserRoleList()
  loadData()
})

/**
 * 获取用户的角色id列表
 */
function getUserRoleList() {
  return new Promise((resolve) => {
    defHttp.get({ url: api.roleList }, { withToken: true }).then((res) => {
      if (res && res.success) {
        roleList.value = res.result
        resolve(true)
      } else {
        resolve(false)
      }
    }).catch(err => {
      resolve(false)
    })
  })
}

/**
 * 加载数据
 */
function loadData() {
  let params = {
    roles: roleList.value.join(','),
    designType: 'spyj',
    zt: '1',
    pageNo: pagination.value.current, 
    pageSize: pagination.value.pageSize
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
      const { result } = res
      dataList.value = result.records
      pagination.value.total = result.total
  }).catch(err => {
      console.info(err)
  })
}


/**
* 分页
* @param pag
* @param callback 回调函数
*/
function onChange(pag: any, callback: any) {
    pagination.value = pag
    callback()
}

function onSelectChange(selectedRowKeys: any) {
  state.selectedRowKeys = selectedRowKeys
}

function getSelectRow() {
  return new Promise((resolve) => {
    resolve(state.selectedRowKeys.map((key) => {
      return dataList.value.find(f => f.id == key)
    }))
  })
}

defineExpose({
  getSelectRow
})
</script>

<style lang="less" scoped>

</style>