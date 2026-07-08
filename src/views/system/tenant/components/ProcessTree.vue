<template>
  <div class="tenant-process-tree">
    <div class="tenant-process-tree-header">
      <a-input-search v-model:value="searchName" placeholder="请输入关键字搜索" enter-button @search="onSearch"/>
      <a-button type="primary" :loading="confirmLoading" @click="handleSave">保存</a-button>
    </div>
    <a-tree v-model:checkedKeys="checkedKeys" v-model:expandedKeys="expandedKeys" :defaultExpandAll="false"
            :show-icon="true" :tree-data="treeData" checkable>
      <template #title="{ title }">
                <span v-if="searchName && title.indexOf(searchName) > -1">
                    {{ title.substr(0, title.indexOf(searchName)) }}
                    <span style="color: #f50">{{ searchName }}</span>
                    {{ title.substr(title.indexOf(searchName) + searchName.length) }}
                </span>
        <span v-else>{{ title }}</span>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { message } from "ant-design-vue"
import { findNode } from "/@/views/online/utils/commonUtils"
import { getBpmList } from "/@/views/bdc/utils/case.ts"

const props = defineProps({
  selectInfo: {
    type: Object,
    default: () => ({})
  }
})

// 确认loading
let confirmLoading = ref<boolean>(false)
// 搜索名称
let searchName = ref<string>('')
// 搜索关键数组
let hasKeywordArr = ref<any>([])
// 上一次搜索
let lastSearchVal = ref<string>('')
// 搜索index
let searchIndex = ref<number>(0)
// 选中的值
let checkedKeys = ref<any>([])
// 展开的值
let expandedKeys = ref<any>([])
// 树
let treeData = ref<any>([])
// 当前案卷类型
let currentAjlx = ref<string>('1')
// 所有父节点
let allParentNodes = ref<any>([])

enum api {
  save = '',
  checkList = ''
}

watch(() => searchName.value, () => {
  onSearch()
})

watch(() => props.selectInfo?.id, async (newVal) => {
  reset()
  if (newVal) {
    await initData()
    getCheckedList(newVal)
  }
})

onMounted(async () => {
  if (props.selectInfo?.id) {
    await initData()
    getCheckedList(props.selectInfo.id)
  }
})

/**
 * 加载流程列表
 */
async function initData() {
  allParentNodes.value = []
  if (currentAjlx.value == '1') {
    let treeDict = await getBpmList()
    treeDict = filterTree(treeDict)
    treeData.value = setList(treeDict)
  }
}

function filterTree(nodes) {
  return (nodes || [])
      .filter(node => node.status == '1')
      .map(node => ({
        ...node,
        children: node.children
            ? filterTree(node.children)
            : []
      }))
}

function setList(newArr) {
  let newData = (newArr || []).map(item => {
    item.pid = item.parentId

    if (item.children) {
      allParentNodes.value.push(item)
      item.children = setList(item.children)
    }
    return item
  })

  return newData
}

/**
 * 获取所有包含关键字节点的父节点
 * @param tree
 */
function getAllKeys(tree) {
  const data: any = []
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      const arr = getAllKeys(node.children)
      if (node.children.some((item) => expandedKeys.value.includes(item.key) === true) || arr.length > 0) {
        expandedKeys.value.push(node.key)
        data.push(node.key)
      }
    }
  }
  return data
}

/**
 * 跳转到包含搜索关键字的节点处
 */
function setSearchIndex() {
  if (hasKeywordArr.value.length > 0) {
    if (searchIndex.value >= hasKeywordArr.value.length - 1) {
      searchIndex.value = 0
    } else {
      searchIndex.value++
    }

    const element = document.getElementById(`#tree_${hasKeywordArr.value[searchIndex.value]}`)
    if (element) {
      element.scrollIntoView()
    }
  }
}

function onSearch() {
  let value = searchName.value
  expandedKeys.value = []
  const keyword = value
  if (keyword !== '') {
    hasKeyWord(treeData.value, keyword)
    hasKeywordArr.value = JSON.parse(JSON.stringify(expandedKeys.value))
    getAllKeys(treeData.value)
  }
  if (lastSearchVal.value === value) {
    setSearchIndex()
  } else {
    searchIndex.value = -1
    setTimeout(() => {
      setSearchIndex()
    }, 700)
  }
  lastSearchVal.value = value
}

/**
 * 筛选所有包含搜索关键字的节点
 * @param tree
 * @param keyword
 */
function hasKeyWord(tree, keyword) {
  tree.forEach((item) => {
    if (item.title.toUpperCase().indexOf(keyword.toUpperCase()) !== -1) {
      expandedKeys.value.push(item.key)
    }
    if (item.children && item.children.length > 0) {
      hasKeyWord(item.children, keyword)
    }
  })
}

/**
 * 保存租户流程关联
 */
function handleSave() {
  let tenantId = props.selectInfo?.id
  let keys = Array.isArray(checkedKeys.value) ? checkedKeys.value : checkedKeys.value.checked
  let nodes = keys.map((key) => {
    let node = findNode(treeData.value, key, 'key')
    return {
      tenantId,
      lcid: key,
      lcmc: node?.title,
      ajlx: currentAjlx.value,
      lclb: node?.pid,
      orderNum: node?.orderNum
    }
  })

  let data = {
    tenantId,
    list: nodes,
    ajlx: currentAjlx.value
  }

  console.log('租户流程关联保存参数:', data, api.save)
  message.info('保存接口待接入')
}

/**
 * 获取租户流程列表
 */
function getCheckedList(tenantId) {
  console.log('租户流程关联选中keys接口待接入:', tenantId, api.checkList)
  checkedKeys.value = formatCheckedKeys([])
}

/**
 * 处理选中的节点，如果有父节点但与实际树不匹配则去掉
 * @param keys
 */
function formatCheckedKeys(keys) {
  const keySet = new Set(keys)

  allParentNodes.value.forEach(parentNode => {
    const children = parentNode.children || []
    const childKeys = children.map(child => child.key)

    if (
        keySet.has(parentNode.key) &&
        childKeys.length > 0 &&
        !childKeys.every(k => keySet.has(k))
    ) {
      keySet.delete(parentNode.key)
    }
  })

  return Array.from(keySet)
}

function reset() {
  checkedKeys.value = []
  expandedKeys.value = []
  searchName.value = ''
  hasKeywordArr.value = []
  lastSearchVal.value = ''
  searchIndex.value = 0
}

</script>

<style scoped lang="less">
.tenant-process-tree {
  height: 100%;
  padding: 12px;
  overflow: auto;
}

.tenant-process-tree-header {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tenant-process-tree-header .ant-input-search {
  //max-width: 420px;
}
</style>
