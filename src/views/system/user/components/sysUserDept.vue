<template>
  <div class="sys-user-dept">
    <a-input-search
        v-model:value="searchDept"
        placeholder="请输入部门名称"
        @search="onSearchDept"
        style="margin-bottom: 10px"
        allow-clear
    />
    <a-spin :spinning="loading">
      <a-tree v-if="showTree" :load-data="onLoadData" :tree-data="treeData" :fieldNames="deptFieldNames" showLine :defaultExpandAll="false" @select="onDeptSelect">
        <template #switcherIcon="{ switcherCls, data, expanded }">
          <template v-if="data.hasChildren">
            <PlusSquareOutlined v-if="!expanded" :class="switcherCls" style="font-size: 14px; margin: 5px;"/>
            <MinusSquareOutlined v-if="expanded" :class="switcherCls" style="font-size: 14px; margin: 5px;"/>
          </template>
          <FileOutlined v-else />
        </template>
      </a-tree>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { defHttp } from '/@/utils/http/axios';
import { PlusSquareOutlined, MinusSquareOutlined, FileOutlined } from '@ant-design/icons-vue';

// 搜索部门
let searchDept  = ref<string>('')
let treeData: any = ref([])
let loading = ref(false)
let showTree = ref(true)

const deptFieldNames = { title: 'name', key: 'id'}

const emit = defineEmits(['deptInfo'])

enum api {
  deptList = '/api/zrzy-system/sys/dept/treeLazyForUser'
}

onMounted(() => {
  loading.value = true
  onLoadData({ dataRef: { id: 0 } })
})

function onLoadData(treeNode: any, isLazy = true) {
  if(searchDept.value) { // 查询参数不为空时，不使用懒加载，此时会返回所有符合条件的结果
    isLazy = false
  }
  return new Promise(resolve => {
    defHttp.get({
      url: api.deptList,
      params: {
        name: searchDept.value,
        deptPid: treeNode?.dataRef?.id || '',
        isLazy: isLazy
      }
    }, {
      withToken: true
    }).then((res: any) => {
      if (res?.success) {
        if(treeNode && treeNode?.dataRef?.id == 0) {
          treeData.value = res.result
        } else if(isLazy) { // 只有懒加载时才更新子节点
          treeNode.dataRef.children = res.result
        }
        resolve(res.result)
        loading.value = false
        showTree.value = true
      }
    })
  });
}
/**
 * 搜索部门
 * @param value
 */
function onSearchDept() {
  if(searchDept.value == '') {
    treeData.value = []
    showTree.value = false
    onLoadData({ dataRef: { id: 0 }}, true)
  } else {
    treeData.value = []
    showTree.value = false
    onLoadData({ dataRef: { id: 0 }}, false)
  }
}

function onDeptSelect(selectedKeys: any, info: any) {
  if(selectedKeys.length == 0) {
    emit("deptInfo", null)
  } else {
    emit("deptInfo", info.node.dataRef || null)
  }
}

</script>

<style lang="less" scoped>
.sys-user-dept {
  min-width: 250px;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
</style>
