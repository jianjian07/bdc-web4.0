<template>
  <div class="api-editor-tree">
    <div class="api-editor-search">
      <a-input-search
          v-model:value="searchValue"
          placeholder="搜索目录/接口"
          @search="onSearch"
      />
      <a-button style="margin-left: 8px" @click="handleExpand">
        <template #icon>
          <VerticalAlignMiddleOutlined v-if="isExpand"/>
          <ColumnHeightOutlined v-else/>
        </template>
      </a-button>
    </div>
    <div class="api-editor-tree-content">
      <a-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys"
              :auto-expand-parent="autoExpandParent" :fieldNames="fieldNames" :tree-data="apiTreeData" blockNode
              show-icon
              style="width: 100%;"
              @select="handleSelectTreeItem">
        <template #title="node">
          <div v-if="node.children" class="api-row-content">
            <div class="left">
              <folder-outlined/>
              <span v-if="node.apiGroupName.indexOf(searchValue) > -1" style="margin-left:5px">
                {{ node.apiGroupName.substr(0, node.apiGroupName.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ node.apiGroupName.substr(node.apiGroupName.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else style="margin-left:5px">{{ node.apiGroupName }}</span>
              <!--              <span style="margin-left:5px">{{ node.apiGroupName }}</span>-->
            </div>
            <div v-if="selectedKeys[0] == node.id" class="right">
              <a-button style="margin-left: 8px;" @click.stop="addApi(node)">
                <template #icon>
                  <plus-outlined style="font-size: 10px"/>
                </template>
              </a-button>
              <a-dropdown>
                <a-button style="margin-left: 8px">
                  <template #icon>
                    <ellipsis-outlined style="font-size: 10px"/>
                  </template>
                </a-button>
                <ellipsis-outlined/>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a-popconfirm title="你确定要删除该目录吗, 这会删除该目录下所有接口信息" @confirm="delDir(node)">删除</a-popconfirm>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
          <div v-else class="api-row-content">
            <div class="left">
              <span :class="['api-type', 'api-type-' + node.requestType]">{{ node.requestType }}</span>
              <span v-if="node.apiName.indexOf(searchValue) > -1" style="margin-left:10px">
                {{ node.apiName.substr(0, node.apiName.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ node.apiName.substr(node.apiName.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else style="margin-left:10px">{{ node.apiName }}</span>
              <!--              <span style="margin-left:10px">{{ node.apiName }}</span>-->
            </div>
            <div v-if="selectedKeys[0] == node.id" class="right">
              <a-popconfirm
                  title="你确定要删除该接口吗?"
                  @confirm.stop="delApi(node)"
              >
                <a-button style="margin-left: 8px;">
                  <template #icon>
                    <minus-outlined style="font-size: 10px"/>
                  </template>
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </template>
      </a-tree>
    </div>
    <div class="api-editor-dir-add">
      <a-button style="width: 100%" type="dashed" @click="addDir">
        <plus-outlined/>
        新建
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import {
  PlusOutlined,
  MinusOutlined,
  FolderOutlined,
  EllipsisOutlined,
  ColumnHeightOutlined,
  VerticalAlignMiddleOutlined
} from '@ant-design/icons-vue'
import { guid } from "/@/utils"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
// 搜索目录/接口
let searchValue = ref<string>('')
// 是否展开/收缩
let isExpand = ref<boolean>(false)
// 所有父节点
let allParentKeys = ref<any>([])
// 展开keys
let expandedKeys = ref<any>([])
// 选中keys
let selectedKeys = ref<any>([])
// 替换字段
const fieldNames = {
  key: 'id'
}
// 用于搜索
let dataList = ref<any>([])
// 是否自动展开父节点
let autoExpandParent = ref<boolean>(false)

const props = defineProps({
  apiTreeData: {
    type: Array,
    default: []
  },
  selectItem: {
    type: Object,
    default: {}
  }
})

const emit = defineEmits(['update:selectItem'])

enum api {
  getApiCode = '/api/zrzy-api/api/config/getNewApiCode',
  delConfig = '/api/zrzy-api/api/config/delConfig'
}

watch(() => props.apiTreeData, (newVal: any) => {
  init()
}, {
  immediate: true
})

watch(() => props.selectItem, (newVal: any) => {
  selectedKeys.value = newVal ? [newVal.id] : []
}, {
  immediate: true
})

watch(() => searchValue.value, (newVal: any) => {
  if (searchValue.value !== '') {
    const expanded = dataList.value.map((item: any) => {
      if (item.title.indexOf(newVal) > -1) {
        return getParentId(item.id, props.apiTreeData)
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
onMounted(() => {
  // init()
})


/**
 * 初始化数据
 */
function init() {
  allParentKeys.value = getAllParentKeys(props.apiTreeData, [])
  if (props.apiTreeData && props.apiTreeData.length > 0) {
    let find
    if (selectedKeys.value.length !== 0) {
      find = findNodeById(props.apiTreeData, selectedKeys.value[0])
      find = find ? find : props.apiTreeData[0]
    } else {
      find = props.apiTreeData[0]
    }
    selectedKeys.value = [find.id]
    emit('update:selectItem', find)
  }
  generateList(props.apiTreeData)
}

/**
 * 根据Id找节点
 * @param arr
 * @param id
 */
function findNodeById(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i]
    if (node.id === id) return node
    if (node.children && node.children.length > 0) {
      let foundNode = findNodeById(node.children, id)
      if (foundNode) return foundNode
    }
  }
  return null
}

/**
 * 初始化datalist
 * @param data
 */
function generateList(data: any) {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    const id = node.id
    let title = node.children ? node.apiGroupName : node.apiName
    dataList.value.push({ id, title: title })
    if (node.children) {
      generateList(node.children)
    }
  }
}

/**
 * 获取父级id
 * @param id
 * @param tree
 */
function getParentId(id: string | number, tree: any) {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.id === id)) {
        parentKey = node.id
      } else if (getParentId(id, node.children)) {
        parentKey = getParentId(id, node.children)
      }
    }
  }
  return parentKey
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
      arr.push(item.id)
      return getAllParentKeys(item.children, arr)
    }
  })
  return arr
}

/**
 * 搜索
 * @param value
 */
function onSearch(value) {

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
 * 选中树项
 * @param selectedKey
 * @param e
 */
function handleSelectTreeItem(selectedKey, e) {
  selectedKeys.value = [e.node.dataRef.id]
  emit('update:selectItem', e.node.dataRef)
}

/**
 * 添加目录
 */
function addDir() {
  let timestamp = new Date().getTime()
  let dir = {
    id: '新建目录' + timestamp,
    apiGroupName: '新建目录' + timestamp,
    publicKey: '',
    privateKey: '',
    children: []
  }
  props.apiTreeData?.push(dir)
  selectedKeys.value = [dir.id]
  emit('update:selectItem', dir)
}

/**
 * 删除目录
 * @param item
 */
async function delDir(item) {
  let promises = []
  if (props.apiTreeData) {
    let findDir = props.apiTreeData.find(_data => _data.id == item.id)
    if (findDir && findDir.children) {
      for (let i = 0; i < findDir.children.length ; i++) {
        let addType = typeof findDir.children[i].id == 'string' ? findDir.children[i].id.substr(0, 4) == '新增接口' : false
        let promise
        promise = addType ? removeApiByIdWithoutHttp() : removeApiById(findDir.children[i].id)
        promises.push(promise)
      }
    }
    let res = await Promise.all(promises)
    let flag = true
    for (let i = 0; i < res.length; i++) {
      if (!res[i]) {
        flag = false
        break
      }
    }
    if (flag) {
      removeById(props.apiTreeData, item.id)
      message.success('删除成功')
    }
  }
}

/**
 * 前端删除id 返回promise
 */
function removeApiByIdWithoutHttp() {
  return new Promise((resolve) => {
    resolve(true)
  })
}

function removeById(arr, id) {
  let currentSelect
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id == id) {
      if (arr[i + 1]) {
        currentSelect = arr[i + 1]
      } else if (arr[i - 1]) {
        currentSelect = arr[i - 1]
      } else {
        currentSelect = undefined
      }
      arr.splice(i, 1)
      selectedKeys.value = currentSelect ? [currentSelect.id] : []
      emit('update:selectItem', currentSelect)
      return
    }
  }
}

/**
 * 添加接口
 */
async function addApi(dir) {
  let apiCode = await getApiCode()
  if (apiCode) {
    let api = {
      id: '新增接口' + apiCode,
      pid: dir.id,
      apiCode: apiCode,
      apiName: '新增接口',
      apiGroupName: dir.apiGroupName,
      publicKey: dir.publicKey,
      privateKey: dir.privateKey,
      requestType: 'POST',
      versionCode: 'testEnv',
      apiHeaders: [],
      apiParameters: [],
      apiBody: {
        key: "1",
        parentKey: "-1",
        fieldName: "根节点",
        fieldValue: "",
        dataType: "Object",
        defaultValue: "",
        isMust: false,
        isEncrypt: false,
        encryptType: "",
        description: "根节点"
      }
    }
    if (props.apiTreeData) {
      let find = props.apiTreeData.find(f => f.id == dir.id)
      find.children.push(api)
      selectedKeys.value = [api.id]
      emit('update:selectItem', api)
      let expands = JSON.parse(JSON.stringify(expandedKeys.value))
      expands.push(dir.id)
      expandedKeys.value = Array.from(new Set(expands))
    }
  } else {
    message.warning('添加接口失败')
  }
}

/**
 * 获取接口code
 */
function getApiCode() {
  return new Promise((resolve) => {
    defHttp.get({ url: api.getApiCode }, { withToken: true }).then((res) => {
      if (res.code == 200) {
        resolve(res.result)
      } else {
        resolve(null)
      }
    }).catch(err => {
      resolve(null)
    })
  })
}

/**
 * 删除接口
 * @param item
 */
async function delApi(item) {
  let parent = props.apiTreeData.find(f => f.id == item.pid)
  let addType = typeof item.id == 'string' ? item.id.substr(0, 4) == '新增接口' : false
  let res
  if (addType) {
    res = true
  } else {
    res = await removeApiById(item.id)
  }
  if (res) {
    removeById(parent.children, item.id)
    message.success('删除成功')
  }
}

/**
 * 通过id删除接口
 * @param id
 */
function removeApiById(id) {
  return new Promise((resolve) => {
    defHttp.get({ url: api.delConfig + '/' + id }, { withToken: true }).then((res) => {
      if (res.code == 200) {
        resolve(true)
      } else {
        resolve(false)
      }
    }).catch(err => {
      resolve(false)
    })
  })
}
</script>

<style lang="less" scoped>
.api-editor-tree {
  width: 300px;
  height: 100%;
  padding: 10px;
  border-right: 1px solid #f9f9f9;

  .api-editor-search {
    display: flex;
    margin-bottom: 10px;
  }

  .api-editor-tree-content {
    max-height: calc(100% - 90px);
    overflow: auto;

    .api-row-content {
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

    .api-type {
      font-weight: bold;

      &.api-type-POST {
        color: #FF9900;
      }

      &.api-type-GET {
        color: #2BD56F;
      }

      &.api-type-PUT {
        color: #097BED;
      }
    }
  }

  .api-editor-dir-add {
    margin-top: 5px;
  }
}
</style>
