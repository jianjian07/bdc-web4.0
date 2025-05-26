<template>
  <div class="bdc-dycx">
    <div class="bdc-dycx-search" v-if="isShowSearch">
      <a-form layout="inline">
        <a-form-item :model="formState" label="不动产单元号">
          <a-input v-model:value="formState.bdcdyh" placeholder="请输入不动产单元号" style="width: 300px;"></a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="onSearchData">查询</a-button>
        </a-form-item>
      </a-form>
    </div>
    <a-divider style="height: 2px;" />
    <div :class="isShowSearch ? 'bdc-dycx-main' : 'bdc-dycx-main-no-search'">
      <h2 style="text-align: center;margin-bottom: 20px">不动产单元查询</h2>
      <a-spin :spinning="spinning">
        <a-timeline class="time-line" mode="left" style="margin-left: 50%; margin-top: 50px">
          <a-timeline-item class="time-line-start" position="right">
            <template #dot>
              <div class="slot-dot-start">登记情况</div>
            </template>
            <span style="font-weight: bold;position: absolute;left: -340px;font-size: 14px">{{ bdcdyh }}</span>
          </a-timeline-item>
          <a-timeline-item style="height: 50px">
            <template #dot><span style="font-weight: bold">至今</span></template>
          </a-timeline-item>
          <a-timeline-item v-for="(item, index) in hisData" :color="index == 0 ? 'green' : 'blue'">
            <template #dot><ClockCircleOutlined style="font-size: 16px" /></template>
            <span style="position: absolute;left: -165px;top: 1px;">{{ item.djsj }}</span>
            <div style="padding-bottom: 10px">
              <span @click="handleView(item)" :class="index == 0 ? 'his-title-first' : 'his-title-other'"
                  :style="{ color: index == 0 ? 'green' : '', fontSize: '20px', lineHeight: '20px', textDecoration: 'underline', cursor: 'pointer' }">
                {{ item.djlb }}{{ item.qszt == 0 ? '（在办）' : '' }}</span>
              <br/>
              <span>{{ item.qszt == 0 ? '' : '证号：' }}{{ item.bdcqzh }}</span><span
                :style="{margin: item.qszt == 0?'0px 0px':'0px 10px'}">业务号：{{ item.ywh }}</span>
            </div>

          </a-timeline-item>
        </a-timeline>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { router } from "/@/router"
import { ClockCircleOutlined } from '@ant-design/icons-vue'
const route = useRoute();
// 是否显示查询框
let isShowSearch = ref<boolean>(true)
// 查询栏
let formState = ref<any>({
  bdcdyh: ''
})
// 不动产单元号
let bdcdyh = ref<any>('')
// 历史回溯数据
let hisData = ref<any>()
// loading
let spinning = ref<boolean>(false)

enum api {
  list = '/api/zrzy-bdc/bdc/query/getListByBdcdyh'
}

onMounted(() => {
  let query = route.query
  if (query.bdcdyh) {
    isShowSearch.value = false
    bdcdyh.value = query.bdcdyh
    initData()
  }
})

/**
 * 初始化
 */
function initData() {
  spinning.value = true
  defHttp.get({ url: api.list, params: { bdcdyh: bdcdyh.value } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      hisData.value = res.result
      sortByTime(hisData.value, 'djsj')
    } else {
      message.warning(res?.message)
    }
    spinning.value = false
  })
}

function onSearchData() {
  bdcdyh.value = formState.value.bdcdyh
  initData()
}

/**
 * 根据时间排序
 * @param arr
 * @param key
 */
function sortByTime(arr, key) {
  arr.sort(function (a, b) {
    let x = a[key]
    let y = b[key]
    return ((x > y) ? -1 : ((x < y) ? 1 : 0))
  })
}

/**
 * 进入详情
 * @param item
 */
function handleView(item) {
  router.push('/task/hisTaskDeal?slbh=' + item.slbh)
}

</script>

<style lang="less" scoped>
.bdc-dycx {
  padding: 20px;
  // height: 100%;

  .bdc-dycx-search {
    margin-bottom: 20px;
    padding-bottom: 20px;
    display: flex;
    justify-content: center;
    // border-bottom: 2px solid #e8e8e8;
  }

  .bdc-dycx-main {
    height: calc(100% - 80px);
    overflow: auto;

    :deep(.ant-spin-nested-loading) {
      height: calc(100% - 50px);
    }
  }

  .bdc-dycx-main-no-search {
    height: 100%;
    overflow: auto;

    :deep(.ant-spin-nested-loading) {
      height: calc(100% - 50px);
    }
  }

  .time-line-start {
    height: 75px;
    padding-right: 60px;
    margin-top: 40px;
  }

  .slot-dot-start {
    width: 100px;
    height: 100px;
    border: 2px solid #e8e8e8;
    border-radius: 50%;
    line-height: 95px;
    font-weight: bold;
    font-size: 16px;
  }
}

.his-title-first {
  &:hover {
    color: #7bb372!important;
    transition: opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),margin 0.3s,color 0.3s;
  }
}

.his-title-other {
  &:hover {
    color: #7bb372!important;
    transition: opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),margin 0.3s,color 0.3s;
  }
}
</style>