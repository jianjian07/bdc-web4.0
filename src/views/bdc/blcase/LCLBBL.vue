<template>
  <div style="width: 280px;padding: 10px 8px;">
    <a-directory-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys"
      :fieldNames="{ children: 'children', title: 'lcmc', key: 'lcid' }" :tree-data="treeData" multiple
      @select="onSelect">
      <template #icon="">
      </template>
    </a-directory-tree>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
enum api {
  processlist = '/api/zrzy-bdc/flow/public/getRoleProcessList'
}
const expandedKeys = ref<string[]>(['100']);
const selectedKeys = ref<string[]>([]);
let treeData = ref([])
onMounted(() => {
  loadTreeData()
})
function loadTreeData() {
  defHttp.get({ url: api.processlist, params: { ajlx: '2' } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      let arr = res.result
      treeData.value = arr
      if (arr.length) {
        if (arr.length > 0) {
          let firstProcess = arr[0]
          if (firstProcess.children != null) {
            firstProcess = firstProcess.children[0]
          }
          selectedKeys.value.push(firstProcess.lcid)
          emit('select', firstProcess)
        }
      }
    } else {
      message.warning('请求发生错误')
    }
  })

}
const emit = defineEmits(['select', 'setTreeData'])
/**
 * 选中工作流
 * @param _selectedKeys 
 * @param e 
 */
function onSelect(_selectedKeys: any, e: any) {

  const process = e.node
  if (e.node.lclb != "0") {
    if (!process.children) {
      emit('select', process)
    }
  }
}
</script>

<style scoped lang="less"></style>