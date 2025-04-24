<template>
  <div class="approval-process">
    <div class="title-content">
      <span class="title">审批过程</span>
    </div>
    <div class="process-list">
      <template v-if="list.length">
        <a-timeline>
          <a-timeline-item v-for="(item, index) in list">
            <template #dot>
              <ExclamationCircleFilled v-if="index == list.length -1" style="font-size: 16px; color: #efb041" />
              <CheckCircleFilled v-else style="font-size: 16px; color: #72c240"/>
            </template>
            <div class="process-item">
              <span class="title">{{ item.jdmc }} （{{ item.blr }}）</span>
              <span class="time">{{ item.bljssj }}</span>
              <a-tooltip v-if="item.shyj">
                <template #title>
                  {{ item.shyj }}
                </template>
                <span class="result">意见：{{ item.shyj }}</span>
              </a-tooltip>
            </div>
          </a-timeline-item>
        </a-timeline>
      </template>
      <a-empty v-else/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons-vue"
import { useRoute } from "vue-router"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
const route = useRoute()
// 列表
let list = ref<any>([])

enum api {
  list = '/api/zrzy-bdc/bdc/public/getYwShBySlbh'
}

onMounted(() => {
  initData()
})

/**
 * 初始化
 */
function initData() {
  let slbh = route.query.slbh
  defHttp.get({ url: api.list, params: { slbh: slbh } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      list.value = res.result
    } else {
      message.warning('加载数据失败!')
    }
  })
}
</script>

<style lang="less" scoped>
.approval-process {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  
  .title-content {  
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;
    
    .title {
      border-left: 4px #5094F9 solid;
      padding: 0px 5px;
      font-size: 18px;
      font-weight: bold;
    }
  }
  
  .process-list {
    padding: 25px 10px;
    height: calc(100% - 50px);
    overflow: auto;
    
    .process-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      
      .result {
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 100%;
        overflow: hidden;
        text-decoration: underline;
        color: #7b9bde;
        cursor: pointer;
      }
      
      .time {
        color: #9b9d99;
      }
    }
  }
}
</style>