<template>
 <div style="flex: 1; overflow: auto;">
    <a-spin :spinning="spinning">
      <a-table :scroll="{y: `calc(100% - 75px)`}" :columns="columns" :data-source="scrollList" size="small" :pagination="pagination" @change="onChange($event, loadData)" class="userTable" style="height: 100%">
        <template #bodyCell="{ column, record }">
          <div style="cursor: pointer;">
            <template v-if="column.dataIndex === 'cfwh'">
              <a-tooltip :title="record.cfwh">
                <div style="width: 100%; text-align: left;" class="text-ellipsis">{{ record.cfwh }}</div>
              </a-tooltip>
            </template>
            <template v-else-if="column.dataIndex === 'qlrmc'">
              <a-tooltip :title="record.qlrmc">
                <div style="width: 100%;" class="text-ellipsis">{{ record.qlrmc }}</div>
              </a-tooltip>
            </template>
            <template v-else>
              <span>{{ record[column.dataIndex] }}</span>
            </template>
          </div>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { router } from "/@/router"

let scrollList = ref([])
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10
})
let spinning: any = ref(false)

const columns = [
  {
    dataIndex: 'cfwh',
    title: '查封文号',
    align: 'left',
    width: '35%',
    ellipsis: true
  },
  {
    dataIndex: 'cfqlrmc',
    title: '被查封人',
    align: 'center',
  },
  {
    dataIndex: 'djlb',
    title: '产权类别',
    align: 'center',
    ellipsis: true
  },
  {
    dataIndex: 'qlrmc',
    title: '权利人',
    align: 'center',
    width: '25%',
    ellipsis: true
  }
]

onMounted(() => {
  loadData()
})

function loadData() {
  spinning.value = true
  const url = '/imaginform/zrzy-form/form/report/list'
  let data = {
      id: '1947906380530249730',
      "isPage": true,
      "current": pagination.value.current,
      "size": pagination.value.pageSize,
      searchData: []
  }
  defHttp.post({
      url: url,
      data
  }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      const result = JSON.parse(res.result)
      scrollList.value = result.records
      pagination.value.total = result.total
    }
    spinning.value = false
  }).catch(() => {
    spinning.value = false
  })
}

function onChange(pag: any, callback: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  callback()
}

// function onClickItem(item) {
//   router.push('/task/hisTaskDeal?slbh=' + item.slbh)
// }
</script>

<style scoped lang="less">
.text-ellipsis {
  white-space: nowrap; /* 确保文本在一行内显示 */
  overflow: hidden; /* 隐藏超出容器的内容 */
  text-overflow: ellipsis; /* 使用省略号表示被截断的文本 */
}
</style>