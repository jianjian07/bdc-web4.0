<template>
  <div class="wonder-table-form" v-if="header">
      <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
          <a-row :gutter="[0, 8]" tyle="flex">
              <a-col :span="8" :offset="0">
                  <a-form-item label="用户名">
                      <a-input v-model:value="formData.name" allowClear />
                  </a-form-item>
              </a-col>
              <a-col :span="4" :offset="0">
                  <a-form-item style="text-align: center;">
                      <a-space>
                          <a-button type="primary" @click="searchData">
                              <template #icon>
                                  <component :is="SearchOutlined"></component>
                              </template>查询</a-button>
                          <a-button @click="clear">
                              <template #icon>
                                  <component :is="RedoOutlined"></component>
                              </template>重置</a-button>
                      </a-space>
                  </a-form-item>
              </a-col>
          </a-row>
      </a-form>
  </div>
  <div class="wonder-table-css">
      <a-spin :spinning="spinning">
          <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
              @change="onChange($event, loadData)" :row-key="record => record.id" :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }">
          </a-table>
      </a-spin>
  </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref, reactive } from 'vue';

enum api {
  list = '/api/zrzy-system/sys/v1/user/page'
}

let datalist = ref([]);
let formData: any = ref({})
let spinning = ref<boolean>(true);
// 列名
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '姓名',
    dataIndex: 'realName',
    key: 'realName',
  }
]
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
      return `共 ${pagination.value.total} 条数据`
  }
})

const state = reactive({
  selectedRowKeys: [],
  selectedRowNames: []
})

loadData()

function loadData() {
  spinning.value = true
  let params = {
    userName: formData.name,
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      datalist.value = res.result.records
      pagination.value.current = res.result.current
      pagination.value.total = res.result.total
    } else {
      datalist.value = []
    }
    spinning.value = false
  }).catch(_err => {
    spinning.value = false
  })
}
/**
* 查询
*/
function searchData() {
  pagination.value.current = 1
  loadData()
}
/**
* 分页
* @param pag
* @param callback 回调函数
*/
function onChange(pag: any, callback: any) {
  pagination.value.current = pag.current
  callback()
}
/**
* 重置
*/
function clear() {
  formData.value = {}
  loadData()
}

function onSelectChange(selectedRowKeys: any, selectedRows: any) {
  console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows);
  state.selectedRowKeys = selectedRowKeys
  state.selectedRowNames = selectedRows.map(ele => {
    return ele.realName
  })
};

defineExpose({
  state
})

</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>