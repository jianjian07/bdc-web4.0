<template>
  <div class="sys-user-dept">
    <a-input-search v-model:value="searchDept" placeholder="请输入部门名称" style="margin-bottom: 10px" allow-clear />
    <a-spin :spinning="loading">
      <a-tree v-if="showTree" :defaultExpandAll="false" :fieldNames="deptFieldNames" :load-data="onLoadData"
        :tree-data="treeData" @select="onDeptSelect" v-model:expandedKeys="expandedKeys"
        :auto-expand-parent="autoExpandParent" blockNode>
        <template #switcherIcon="{ switcherCls, data, expanded }">
          <template v-if="data.children && data.children.length">
            <CaretRightOutlined v-if="!expanded" style="font-size: 13px; margin-right: -10px;" />
            <CaretDownOutlined v-if="expanded" style="font-size: 13px; margin-right: -10px;" />
          </template>
          <!-- <ApartmentOutlined v-else /> -->
          <!-- <svg-icon v-else name="dept" width="28px" height="28px" color="rgb(255, 148, 33)"></svg-icon> -->
        </template>
        <template #title="node">
          <svg-icon name="dept" width="28px" height="28px" color="rgb(255, 148, 33)"></svg-icon>
          <span v-if="node.name.indexOf(searchDept) > -1" style="margin-left:5px">
            {{ node.name.substr(0, node.name.indexOf(searchDept)) }}
            <span style="color: #f50">{{ searchDept }}</span>
            {{ node.name.substr(node.name.indexOf(searchDept) + searchDept.length) }}
          </span>
          <span v-else style="margin-left:5px">{{ node.name }}</span>
        </template>
      </a-tree>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { defHttp } from '/@/utils/http/axios';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons-vue';
import { getDeptOptions } from "/@/views/bdc/public/bdc"
import { getParentId } from "/@/utils"
import { useUserStore } from "/@/store/modules/user";
const userStore = useUserStore();
const userInfo = userStore.getUserInfo
// 搜索部门
let searchDept = ref<string>('')
let treeData: any = ref([])
let loading = ref(false)
let showTree = ref(true)

// 用于搜索
let dataList = ref<any>([])
// 是否自动展开父节点
let autoExpandParent = ref<boolean>(false)
// 展开
let expandedKeys = ref<any>([])

const deptFieldNames = { title: 'name', key: 'id' }

const emit = defineEmits(['deptInfo'])

enum api {
  deptList = '/api/zrzy-system/sys/dept/treeLazyForUser'
}

watch(() => searchDept.value, (newVal: any) => {
  if (searchDept.value !== '') {
    const expanded = dataList.value.map((item: any) => {
      if (item.title.indexOf(newVal) > -1) {
        return getParentId(item.id, treeData.value)
      }
      return null
    }).filter((item, i, self) => item && self.indexOf(item) === i)
    expandedKeys.value = expanded
    searchDept.value = newVal
    autoExpandParent.value = true
  } else {
    autoExpandParent.value = false
  }
})

onMounted(() => {
  loading.value = true
  onLoadData()
})

/**
 * 初始化datalist
 * @param data
 */
function generateList(data: any) {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    const id = node.id
    let title = node.name
    dataList.value.push({ id, title: title })
    if (node.children) {
      generateList(node.children)
    }
  }
}

/**
 * 加载部门树
 */
async function onLoadData() {
  treeData.value = await getDeptOptions()
  generateList(treeData.value)
  loading.value = false
  showTree.value = true
  if (userInfo.tenantId != null) {
    emit("deptInfo", treeData.value[0] || null)
  }
}
/**
 * 搜索部门
 * @param value
 */
function onSearchDept() {
  if (searchDept.value == '') {
    treeData.value = []
    showTree.value = false
    onLoadData({ dataRef: { id: 0 } }, true)
  } else {
    treeData.value = []
    showTree.value = false
    onLoadData({ dataRef: { id: 0 } }, false)
  }
}

function onDeptSelect(selectedKeys: any, info: any) {
  debugger
  if (selectedKeys.length == 0) {
    emit("deptInfo", null)
  } else {
    emit("deptInfo", info.node.dataRef || null)
  }
}

</script>

<style lang="less" scoped>
.sys-user-dept {
  min-width: 350px;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
</style>
