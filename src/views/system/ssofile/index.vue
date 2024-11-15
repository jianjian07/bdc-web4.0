<template>
  <div class="ssoFileContent">
    <div class="titleContent">
      <span class="title">
        材料信息
      </span>
      <a-button type="primary" size="middle" @click="isManage = !isManage">{{ isManage ? '返回' : '管理' }}</a-button>
    </div>
    <div class="ssoFileList">
      <file-tree :isManage="isManage" :formData="formData"></file-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import fileTree from './fileTree.vue';

let formData = {
  procInstId: 'ceshi001', // 受理编号
  processId: '', // 流程ID 不动产首次登记
  nodeId: '' // 节点为收件
}
let isManage: any = ref(false)

</script>

<style scoped lang="less">
.ssoFileContent {
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .titleContent {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      border-left: 4px #5094F9 solid;
      padding: 0px 5px;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .ssoFileList {
    padding: 10px 0;
    display: flex;
    flex: 1;
  }
}
</style>