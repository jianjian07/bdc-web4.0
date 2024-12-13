<template>
  <div class="ssoFileContent">
    <div class="titleContent ">
      <span class="title">
        材料信息
      </span>
    </div>
    <div class="ssoFileList">
      <file-tree :formData="_formData"></file-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import fileTree from './components/fileTree.vue';
import { useRoute } from 'vue-router'

const route = useRoute();
const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

let _formData = reactive<any>({
  slbh: '',
  processId: '',
  nodeId: ''
})

onMounted(() => {
  _formData.slbh = props.formData?.ywh || route?.query?.slbh || 'CQSC202412090000534'
})

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
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;

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