<template>
  <div class="sys-role-dept-modal">
    <a-modal v-model:open="modalVisible" :width="760" title="部门人员" :confirm-loading="confirmLoading" @ok="handleModalOk">
      <a-input-search style="margin-bottom: 10px" v-model:value="searchName" placeholder="请输入关键字搜索" enter-button
        @search="onSearch" />
      <div class="sys-role-dept-tree">
        <div class="left-tree">
          <a-tree v-model:checkedKeys="leftTreeCheckedKeys" v-model:expandedKeys="leftTreeExpandedKeys"
            :defaultExpandAll="false" :show-icon="true" :tree-data="departList" @check="handleClickLeftTree" checkable>
            <template #icon="{ children, selected }">
              <template v-if="children && children.length > 0">
                <gold-outlined />
              </template>
              <template v-else>
                <user-outlined />
              </template>
            </template>
            <template #title="{ title }">
              <span v-if="title.indexOf(searchName) > -1">
                {{ title.substr(0, title.indexOf(searchName)) }}
                <span style="color: #05a045">{{ searchName }}</span>
                {{ title.substr(title.indexOf(searchName) + searchName.length) }}
              </span>
              <span v-else>{{ title }}</span>
            </template>
          </a-tree>
        </div>
        <div class="right-tree">
          <a-tree v-if="selectedDeptList.length > 0" :defaultExpandAll="true" :show-icon="true"
            :tree-data="selectedDeptList">
            <template #icon="{ children, selected }">
              <template v-if="children && children.length > 0">
                <gold-outlined />
              </template>
              <template v-else>
                <user-outlined />
              </template>
            </template>
          </a-tree>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from "vue"
import deptList from '/@/mock/test/departUser.json'
import userList from '/@/mock/test/searchUser.json'
import { GoldOutlined, UserOutlined } from '@ant-design/icons-vue';
// 弹窗是否显示
let modalVisible = ref<boolean>(false)
// 弹窗loading
let confirmLoading = ref<boolean>(false)
// 搜索项
let searchName = ref<string>('')
// 搜索关键数组
let hasKeywordArr = ref<any>([])
// 上一次搜索
let lastSearchVal = ref<string>('')
// 搜索index
let searchIndex = ref<number>(0)
// 左侧树选择keys
let leftTreeCheckedKeys = ref<any>([])
// 右侧树
let selectedDeptList = ref<any>([])
// 部门列表
let departList = ref<any>([])
// 所有部门子节点列表
let allChildNodeList = ref<any>([])
// 展开key
const leftTreeExpandedKeys = ref<string[]>([]);



defineExpose({
  open
})

onMounted(() => {
  departList.value = setDeptList(deptList)
  allChildNodeList.value = getAllChildNodeList(departList.value, [])
})

watch(() => modalVisible.value, () => {
  initData()
})


function initData() {
  departList.value = setDeptList(deptList)
  allChildNodeList.value = getAllChildNodeList(departList.value, [])
  selectedDeptList.value = []
  leftTreeCheckedKeys.value = []
}

/**
 * 设置部门列表(设置pid 去掉slots)
 * @param newArr
 * @param parentId
 */
function setDeptList(newArr, parentId?: any) {
  let newData = newArr.map(item => {
    delete item.slots
    if (parentId) {
      item.pid = parentId
    }
    let pid = item.key
    if (item.children) {
      item.children = setDeptList(item.children, pid)
    }
    return item
  })
  return newData
}

/**
 * 获取所有的子节点数据
 * @param data 树形数组
 * @param arr 子节点数组
 * @returns
 */
function getAllChildNodeList(data: any = [], arr: any = []) {
  data.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      return getAllChildNodeList(item.children, arr)
    } else {
      arr.push(item)
    }
  })
  return arr
}

function open(record) {
  modalVisible.value = true
}

/**
 * 搜索
 */
function onSearch() {
  let value = searchName.value
  leftTreeExpandedKeys.value = []
  const keyword = value
  if (keyword !== '') {
    hasKeyWord(departList.value, keyword)
    hasKeywordArr.value = JSON.parse(JSON.stringify(leftTreeExpandedKeys.value))
    getAllKeys(departList.value)
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
  tree.forEach((item, index) => {
    if (item.title.toUpperCase().indexOf(keyword.toUpperCase()) !== -1) {
      leftTreeExpandedKeys.value.push(item.key)
    }
    if (item.children && item.children.length > 0) {
      hasKeyWord(item.children, keyword)
    }
  })
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
      if (node.children.some((item) => leftTreeExpandedKeys.value.includes(item.key) === true) || arr.length > 0) {
        leftTreeExpandedKeys.value.push(node.key)
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

function getParentKey(key, tree) {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
}


/**
 * 弹窗确认
 */
function handleModalOk() {

}

/**
 * 选中左侧树
 * @param checkedKeys
 * @param e
 */
function handleClickLeftTree(checkedKeys, e) {
  selectedDeptList.value = []
  nextTick(() => {

    let checkedNodes = JSON.parse(JSON.stringify(e.checkedNodes))
    let deptListCopy = JSON.parse(JSON.stringify(departList.value))

    let allList: any = [...checkedNodes]
    for (let i = 0; i < checkedNodes.length; i++) {
      let find = findNodeByKey(deptListCopy, checkedNodes[i].pid)
      if (find) {
        allList.push(find)
      }
    }

    allList = removeDuplicate(allList, 'key').map((item) => {
      if (item.pid == null) {
        item.pid = -1
      }
      if (item.children) {
        delete item.children
      }
      return item
    })

    let newTree = setTree(allList, -1)
    selectedDeptList.value = newTree
  })
}

/**
 * 生成树结构
 * @param arr
 * @param pid
 */
function setTree(arr, pid) {
  let tree = []
  arr.forEach(item => {
    if (item.pid === pid) {
      item.children = setTree(arr, item.key);
      tree.push(item)
    }
  })
  return tree;
}

/**
 * 去重
 * @param data
 * @param key
 */
function removeDuplicate(data: any[], key: any) {
  let nArr = data.filter((currentValue, currentIndex, selfArr) => {
    return selfArr.findIndex(x => x[key] === currentValue[key]) === currentIndex
  })
  return nArr
}

/**
 * 根据key找节点
 * @param arr
 * @param key
 */
function findNodeByKey(arr, key) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i];
    if (node.key === key) return node;
    if (node.children && node.children.length > 0) {
      let foundNode = findNodeByKey(node.children, key);
      if (foundNode) return foundNode;
    }
  }
  return null;
}
</script>

<style lang="less">
.sys-role-dept-tree {
  display: flex;

  .left-tree {
    width: 50%;
    padding: 0 20px;
  }

  .right-tree {
    width: 50%;
    padding: 0 20px;
  }
}
</style>

