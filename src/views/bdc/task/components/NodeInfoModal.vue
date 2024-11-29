<template>
  <a-modal 
      title="任务审批详情"
      :width="280"
      :open="open"
      :mask="false"
      destroyOnClose
      :footer="null"
      @cancel="handleCancel"
      cancel-text="关闭"
  >
    <div style="height: 300px;overflow: hidden;overflow-y: auto;overflow-x: auto;">
        <template v-for="(item, key, index) in nodeInfos" :key="index">
          <table class="gridtable" :row-key="index">
            <tbody>
            <tr>
              <th width="90">任务名称</th>
              <td width="150">{{ item.taskName}}</td>
            </tr>
            <tr>
              <th width="90">执行人</th>
              <td width="150">{{ item.taskAssigneeId}}</td>
            </tr>
            <tr>
              <th width="90">开始时间</th>
              <td width="150">{{ item.taskBeginTime }}</td>
            </tr>
            <tr>
              <th width="90">结束时间</th>
              <td width="150">{{ item.taskEndTime }}</td>
            </tr>
            <tr>
              <th width="90">耗时</th>
              <td width="150">{{ item.durationStr }}</td>
            </tr>
            <tr>
              <th width="90">意见</th>
              <td width="150">{{ item.remarks }}</td>
            </tr>
            </tbody>
          </table>
        </template>
      </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue"
// 是否开启
let open = ref<boolean>(false)
let nodeInfos = ref<any>([])

/**
 * 显示信息
 * @param record
 * @param taskId
 */
function showInfo(record, taskId) {
  nodeInfos.value = []
  for (let item of record) {
    if (item.taskId = taskId) {
      nodeInfos.value.push(item)
    }
  }
  open.value = true
}

/**
 * 关闭
 */
function close() {
  handleCancel()
}

/**
 * 关闭
 */
function handleCancel() {
  nodeInfos.value = []
  open.value = false
}

defineExpose({
  showInfo,
  close
})
</script>

<style lang="less" scoped>
 table.gridtable {
    margin: 0 auto;
    margin-top: 10px;
    font-family: verdana,arial,sans-serif;
    font-size:12px;
    color:#333333;
    border-width: 1px;
    border-color: #ddd;
    border-collapse: collapse;
  }
  table.gridtable th {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #ddd;
    background-color: #eee;
  }
  table.gridtable td {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #ddd;
    background-color: #ffffff;
  }
</style>