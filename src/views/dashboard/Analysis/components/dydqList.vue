<template>
  <div style="flex: 1; overflow: auto;">
    <a-spin :spinning="spinning">
      <a-table :scroll="{y: `calc(100% - 75px)`}" :columns="columns" :data-source="scrollList" size="small" :pagination="pagination" @change="onChange($event, loadData)" class="userTable" style="height: 100%">
        <template #bodyCell="{ column, record }">
          <div style="cursor: pointer;" @click="onClickItem(record)">
            <template v-if="column.dataIndex === 'bdcdjzmh'">
              <a-tooltip :title="record.bdcdjzmh">
                <div style="width: 100%; text-align: left;" class="text-ellipsis">{{ record.bdcdjzmh }}</div>
              </a-tooltip>
            </template>
            <template v-if="column.dataIndex === 'expireday'">
              <span>{{ record.expireday }}</span>
            </template>
            <template v-if="column.dataIndex === 'qlrmc'">
              <a-tooltip :title="record.qlrmc">
                <div style="width: 100%;" class="text-ellipsis">{{ record.qlrmc }}</div>
              </a-tooltip>
            </template>
          </div>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { defHttp } from "/@/utils/http/axios"
import { cModal } from "/@/components/cModal/index"
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
    dataIndex: 'bdcdjzmh',
    title: '不动产权登记证明号',
    align: 'left',
    width: '35%',
    ellipsis: true
  },
  {
    dataIndex: 'expireday',
    title: '超期天数(天)',
    align: 'center',
  },
  {
    dataIndex: 'qlrmc',
    title: '权利人',
    align: 'center',
    width: '40%',
    ellipsis: true
  }
]

loadData()

function loadData() {
  spinning.value = true
  const url = '/imaginform/zrzy-form/form/report/list'
  let data = {
      id: 27,
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

function onClickItem(item) {
  router.push('/task/hisTaskDeal?slbh=' + item.slbh)
}
</script>

<style lang="less" scoped>
.text-ellipsis {
  white-space: nowrap; /* 确保文本在一行内显示 */
  overflow: hidden; /* 隐藏超出容器的内容 */
  text-overflow: ellipsis; /* 使用省略号表示被截断的文本 */
}
</style>