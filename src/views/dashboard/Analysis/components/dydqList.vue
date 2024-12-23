<template>
  <div style="flex: 1; overflow: auto;">
    <a-spin :spinning="spinning">
      <a-list item-layout="horizontal" :data-source="scrollList">
        <template #renderItem="{ item }">
          <a-list-item  @click="onClickItem(item)">
            <a-list-item-meta
            >
              <template #description>
                <div style="display: flex; justify-content: space-between; color: #333; cursor: pointer">
                  <span style="width: 35%; font-weight: bold;" class="text-ellipsis">{{ item.bdcdjzmh }}</span>
                  <span><a-tag color="red">抵押结束时间</a-tag>{{ item.dyjssj || '-' }}</span>
                  <span style="width: 200px;"><a-tag color="blue">登记时间</a-tag>{{ item.djsj || '-'}}</span>
                </div>
              </template>
              <template #avatar>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-spin>
  </div>
  <a-pagination style="text-align: right; margin-top: 10px" v-model:current="pagination.current" :total="pagination.total" simple @change="onPageChange" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { defHttp } from "/@/utils/http/axios"
import { cModal } from "/@/components/cModal/index"

let scrollList = ref([])
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10
})
let spinning: any = ref(false)

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

function onPageChange(page, pageSize) {
  pagination.value.current = page
  pagination.value.pageSize = pageSize
  loadData()
}

function onClickItem(item) {
  let modal = cModal({
    title: `【${item.bdcdjzmh}】`,
    width: 1000,
    filePath: `views/bdc/task/HisTaskDeal`,
    footer: false,
    formData: {
      slbh: item.slbh
    },
    onOk: async () => {
      modal.destroy()
    },
    onCancel: () => {
      modal.close()
    }
  })
}
</script>

<style lang="less" scoped>
.text-ellipsis {
  white-space: nowrap; /* 确保文本在一行内显示 */
  overflow: hidden; /* 隐藏超出容器的内容 */
  text-overflow: ellipsis; /* 使用省略号表示被截断的文本 */
}
</style>