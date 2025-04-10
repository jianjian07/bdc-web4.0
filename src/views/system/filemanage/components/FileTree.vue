<template>
  <div class="file-tree-index">
    <div class="file-tree-search">
      <a-input-search
          v-model:value="searchValue"
          placeholder="搜索"
      />
      <a-button style="margin-left: 8px" @click="handleExpand">
        <template #icon>
          <VerticalAlignMiddleOutlined v-if="isExpand"/>
          <ColumnHeightOutlined v-else/>
        </template>
      </a-button>
    </div>
    <div class="file-tree-content">
      <a-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys"
              :auto-expand-parent="autoExpandParent" :fieldNames="fieldNames" :tree-data="fileTree" blockNode
              show-icon
              style="width: 100%;"
              @select="handleSelectTreeItem">
        <template #switcherIcon="{ switcherCls }">
          <DownOutlined :class="switcherCls" />
        </template>
        <template #title="node">
          <div class="file-row-content">
            <div class="left">
              <HomeOutlined v-if="node.type == 'dag'"/>
              <FolderOutlined v-else-if="node.type == 'kf'"/>
              <FileOutlined v-else/>
              <span v-if="node.name.indexOf(searchValue) > -1" style="margin-left:5px">
                {{ node.name.substr(0, node.name.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ node.name.substr(node.name.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else style="margin-left:5px">{{ node.name }}</span>
            </div>
            <div class="right" v-if="selectedKeys[0] == node.key">
              <a-button v-if="node.type != 'pj'" style="margin-left: 8px;" @click.stop="add(node)">
                <template #icon>
                  <plus-outlined style="font-size: 10px"/>
                </template>
              </a-button>
              <a-popconfirm v-if="node.type != 'dag'" title="你确定要删除该数据吗" @confirm="del(node)">
                <a-button style="margin-left: 8px">
                  <template #icon>
                    <MinusOutlined style="font-size: 10px"/>
                  </template>
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import {
  PlusOutlined,
  MinusOutlined,
  FolderOutlined,
  EllipsisOutlined,
  HomeOutlined,
  ColumnHeightOutlined,
  VerticalAlignMiddleOutlined,
  DownOutlined,
  FileOutlined
} from '@ant-design/icons-vue'
import { findNode } from "/@/views/online/utils/commonUtils"
import { guid } from "/@/utils"
import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"

const props = defineProps({
  fileTree: {
    type: Array,
    default: []
  },
  selectItem: {
    type: Object,
    default: {}
  }
})
// 搜索值
let searchValue = ref<string>('')
// 是否展开
let isExpand = ref<boolean>(false)
// 展开keys
let expandedKeys = ref<any>([])
// 所有父节点keys
let allParentKeys = ref<any>([])
// 选中keys
let selectedKeys = ref<any>([])
// 替换字段
const fieldNames = {
  title: 'name'
}
// 用于搜索
let dataList = ref<any>([])
// 是否自动展开父节点
let autoExpandParent = ref<boolean>(true)

const emit = defineEmits(['update:selectItem'])

enum api {
  delKf = '/api/zrzy-bdc/arch/arch/deleteArchive',
  delPj = '/api/zrzy-bdc/arch/arch/deletePjxx'
}

watch(() => props.fileTree, (newVal: any) => {
  init()
}, {
  immediate: true
})

watch(() => searchValue.value, (newVal: any) => {
  if (searchValue.value !== '') {
    const expanded = dataList.value.map((item: any) => {
      if (item.name.indexOf(newVal) > -1) {
        return getParentKey(item.key, props.fileTree)
      }
      return null
    }).filter((item, i, self) => item && self.indexOf(item) === i)
    expandedKeys.value = expanded
    searchValue.value = newVal
    autoExpandParent.value = true
  } else {
    autoExpandParent.value = false
  }
})

watch(() => props.selectItem, (newVal: any) => {
  selectedKeys.value = newVal ? [newVal.key] : []
  // 新增目录/接口后替换key
  if (newVal && newVal.oldKey) {
    let find = findNode(props.fileTree, newVal.oldKey, 'key')
    if (find) {
      find.key = newVal.key
      find.id = newVal.id
      delete newVal.oldKey
    }
  }
}, {
  immediate: true
})

/**
 * 初始化
 */
function init() {
  allParentKeys.value = getAllParentKeys(props.fileTree, [])
  if (props.fileTree && props.fileTree.length > 0) {
    let find
    if (selectedKeys.value.length !== 0) {
      find = findNode(props.fileTree, selectedKeys.value[0],'key')
      find = find ? find : props.fileTree[0]
    } else {
      find = props.fileTree[0]
    }
    selectedKeys.value = [find.key]
    expandedKeys.value = [props.fileTree[0].key]
    emit('update:selectItem', find)
  }
  generateList(props.fileTree)
}

/**
 * 初始化datalist
 * @param data
 */
function generateList(data: any) {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    const key = node.key
    const name = node.name
    dataList.value.push({ key, name })
    if (node.children) {
      generateList(node.children)
    }
  }
}

/**
 * 获取所有的父节点数据
 * @param data 树形数组
 * @param arr 父节点数组
 * @returns
 */
function getAllParentKeys(data: any = [], arr: any = []) {
  data.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      arr.push(item.key)
      return getAllParentKeys(item.children, arr)
    }
  })
  return arr
}

/**
 * 收缩/展开
 */
function handleExpand() {
  if (isExpand.value) {
    expandedKeys.value = []
  } else {
    expandedKeys.value = allParentKeys.value
  }
  isExpand.value = !isExpand.value
}

/**
 * 获取父级key
 * @param key
 * @param tree
 */
function getParentKey(key: string | number, tree: any) {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

/**
 * 选中树项
 * @param selectedKey
 * @param e
 */
function handleSelectTreeItem(selectedKey, e) {
  selectedKeys.value = [e.node.dataRef.key]
  let key = e.node.dataRef.key
  e.node.dataRef.isNeedGetInfo = !key.includes('新增')
  emit('update:selectItem', e.node.dataRef)
}

/**
 * 新增
 * @param node
 */
function add(node) {
  let data = node.dataRef
  if (data.key.includes('新增') && data.type === 'kf') {
    message.warning('请先保存库房')
    return
  }
  let obj:any = {
    key: `新增${guid()}`,
    pkey: data.key,
    pid: data.id,
    name: data.type === 'dag' ? '新增库房' : '新增排架',
    code: data.type === 'dag' ? '新增库房' : '新增排架',
    type: data.type === 'dag' ? 'kf' : 'pj',
    isNeedGetInfo: false
  };
  
  if (obj.type == 'pj') {
    obj.kfid = data.id
  }
  
  if (!data.children) {
    data.children = []
  }
  
  data.children.push(obj)
  emit('update:selectItem', obj)
  let expands = JSON.parse(JSON.stringify(expandedKeys.value))
  expands.push(data.key)
  expandedKeys.value = Array.from(new Set(expands))
}

/**
 * 删除
 * @param node
 */
function del(node) {
  let select = node.dataRef
  let url = select.type == 'kf' ? api.delKf : api.delPj
  if (select.children && select.children.length) {
    message.warning('存在排架不允许直接删除库房!')
    return
  }
  let addType = !select.id
  let parent = findNode(props.fileTree, select.pid, 'id')
  if (addType) {
    removeByKey(parent.children, select.key)
    message.success('删除成功')
  } else {
    defHttp.delete({ url: url, params: { id: select.id } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        removeByKey(parent.children, select.key)
        message.success('删除成功')
      } else {
        message.warning('删除失败:' + res?.message)
      }
    })
  }
}

function removeByKey(arr, key) {
  let currentSelect
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].key == key) {
      if (arr[i + 1]) {
        currentSelect = arr[i + 1]
      } else if (arr[i - 1]) {
        currentSelect = arr[i - 1]
      } else {
        currentSelect = undefined
      }
      arr.splice(i, 1)
      selectedKeys.value = currentSelect ? [currentSelect.key] : []
      currentSelect.isNeedGetInfo = true
      emit('update:selectItem', currentSelect)
      return
    }
  }
}
</script>

<style lang="less" scoped>
.file-tree-index {
  width: 400px;
  height: 100%;
  padding: 10px;
  border-right: 1px solid #f9f9f9;

  .file-tree-search {
    display: flex;
    margin-bottom: 10px;
  }
  
  .file-tree-content {
    max-height: calc(100% - 90px);
    overflow: auto;

    .file-row-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .right {
        display: flex;

        button {
          width: 20px;
          height: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        svg {
          width: 14px;
          height: 14px;
        }

      }
    }
  }
}
</style>