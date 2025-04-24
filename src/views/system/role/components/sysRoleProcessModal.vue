<template>
  <div class="sys-role-process-modal">
    <a-modal v-model:open="modalVisible" :width="760" title="流程权限分配" :confirm-loading="confirmLoading"
      @ok="handleModalOk" @cancel="handleModalCancel"
      :body-style="{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }">
      <a-input-search style="margin-bottom: 10px" v-model:value="searchName" placeholder="请输入关键字搜索" enter-button
        @search="onSearch" />
      <a-tree v-model:checkedKeys="checkedKeys" v-model:expandedKeys="expandedKeys" :defaultExpandAll="false"
        :show-icon="true" :tree-data="treeData" checkable>
        <template #title="{ title }">
          <span v-if="title.indexOf(searchName) > -1">
            {{ title.substr(0, title.indexOf(searchName)) }}
            <span style="color: #f50">{{ searchName }}</span>
            {{ title.substr(title.indexOf(searchName) + searchName.length) }}
          </span>
          <span v-else>{{ title }}</span>
        </template>
      </a-tree>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { findNode, getTreeDictItemsByCode } from "/@/views/online/utils/commonUtils"
// 弹窗是否显示
let modalVisible = ref<boolean>(false)
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
// 当前编辑
let currentRecord = ref<any>()
// 当前案卷类型
let currentAjlx = ref<string>('')

enum api {
  processlist = '/api/zrzy-bdc/bdc/flow/flowList',
  save = '/api/zrzy-system/role/addRoleProcess',
  checkList = '/api/zrzy-system/role/roleProcessList'
}

watch(() => searchName.value, (newV) => {
  onSearch()
})

watch(() => currentAjlx.value, (newVal) => {
  if (newVal) {
    initData()
  }
}, {
  immediate: true
})

defineExpose({
  edit
})

// onMounted(() => {
//   initData()
// })  

/**
 * 加载流程列表
 */
function initData() {
  if (currentAjlx.value == '1') {
    defHttp.get({ url: api.processlist }, { withToken: true }).then((res) => {
      if (res && res.success) {
        treeData.value = setPidList(res.result)
      } else {
        message.warning(res?.message)
      }
    })
  } else {
    let arr = getTreeDictItemsByCode('bllc')
    treeData.value = setBlList(arr)
  }
}

function setBlList(newArr, parentId?: any) {
  let newData = newArr.map(item => {
    item.title = item.label
    if (parentId) {
      item.pid = parentId
    }
    let pid = item.value
    item.key = item.value

    if (item.children) {
      item.children = setBlList(item.children, pid)
    }
    return item
  })

  return newData
}

function setPidList(newArr, parentId?: any) {
  let newData = newArr.map(item => {
    if (parentId) {
      item.pid = parentId
    }
    let pid = item.value
    if (item.children) {
      item.children = setPidList(item.children, pid)
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
 * 搜索
 */
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
  tree.forEach((item, index) => {
    if (item.title.toUpperCase().indexOf(keyword.toUpperCase()) !== -1) {
      expandedKeys.value.push(item.key)
    }
    if (item.children && item.children.length > 0) {
      hasKeyWord(item.children, keyword)
    }
  })
}

/**
 * 确认弹窗
 */
function handleModalOk() {
  let keys = Array.isArray(checkedKeys.value) ? checkedKeys.value : checkedKeys.value.checked
  let nodes = keys.map((key) => {
    let node = findNode(treeData.value, key, 'key')
    return {
      roleId: currentRecord.value.id,
      lcid: key,
      lcmc: node.title,
      ajlx: currentAjlx.value,
      lclb: node.pid,
      orderNum: node.orderNum
    }
  })

  let data = {
    roleId: currentRecord.value.id,
    list: nodes,
    ajlx: currentAjlx.value
  }
  confirmLoading.value = true
  defHttp.post({ url: api.save, data: data }, { withToken: true }).then((res) => {
    if (res && res.success) {
      reset()
      message.success('保存成功!')
      modalVisible.value = false
    } else {
      message.warning(res?.message)
    }
    confirmLoading.value = false
  }).catch(err => {
    confirmLoading.value = false
  })
}

/**
 * 取消弹窗
 */
function handleModalCancel() {
  reset()
}

/**
 * 重置
 */
function reset() {
  checkedKeys.value = []
  expandedKeys.value = []
  searchName.value = ''
}

/**
 * 编辑
 * @param record
 */
function edit(record, ajlx) {
  currentAjlx.value = ajlx
  modalVisible.value = true
  currentRecord.value = record
  getCheckedList(record.id, ajlx)
}
/**
 * 获取角色流程列表
 */
function getCheckedList(roleId, ajlx) {
  confirmLoading.value = true
  defHttp.get({ url: api.checkList, params: { roleId, ajlx } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      checkedKeys.value = res.result.map(m => m.lcid)
    } else {
      message.warning(res?.message)
    }
    confirmLoading.value = false
  }).catch(err => {
    confirmLoading.value = false
  })
}
</script>

<style lang="less" scoped></style>