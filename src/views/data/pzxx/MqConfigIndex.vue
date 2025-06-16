<template>
  <div class="mq-config">
    <a-spin :spinning="loading" tip="加载中...">
      <div class="mq-config-tree">
        <div class="mq-config-search">
          <a-input-search v-model:value="searchValue" placeholder="搜索Topic/Tag" />
          <a-button style="margin-left: 8px" @click="handleExpand">
            <template #icon>
              <VerticalAlignMiddleOutlined v-if="isExpand" />
              <ColumnHeightOutlined v-else />
            </template>
          </a-button>
        </div>
        <div class="mq-config-tree-content">
          <a-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys"
            :auto-expand-parent="autoExpandParent" :tree-data="treeData" blockNode show-icon style="width: 100%;"
            @select="handleSelectTreeItem" :fieldNames="{ key: 'id' }">
            <template #title="node">
              <div v-if="node.children" class="tree-row-content" @dblclick="onDoubleClick(node)">
                <div class="left">
                  <div>
                    <svg-icon name="topic" width="18px" height="18px" color="#389e0d"></svg-icon>
                  </div>
                  <span class="left-name" v-if="node.title.indexOf(searchValue) > -1" style="margin-left:5px">
                    {{ node.title.substr(0, node.title.indexOf(searchValue)) }}
                    <span style="color: #f50">{{ searchValue }}</span>
                    {{ node.title.substr(node.title.indexOf(searchValue) + searchValue.length) }}
                  </span>
                  <span class="left-name" v-else style="margin-left:5px">{{ node.title }}</span>
                </div>
                <div v-if="selectedKeys[0] == node.id" class="right">
                  <a-button style="margin-left: 8px;" @click.stop="addTag(node)">
                    <template #icon>
                      <plus-outlined style="font-size: 10px" />
                    </template>
                  </a-button>
                  <a-dropdown>
                    <a-button style="margin-left: 8px">
                      <template #icon>
                        <ellipsis-outlined style="font-size: 10px" />
                      </template>
                    </a-button>
                    <ellipsis-outlined />
                    <template #overlay>
                      <a-menu>
                        <a-menu-item>
                          <a-popconfirm title="你确定要删除该主题吗?" @confirm="delTopic(node)">删除</a-popconfirm>
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </div>
              <div v-else class="tree-row-content">
                <div class="left">
                  <div>
                    <svg-icon name="tag" width="18px" height="18px" color="rgb(255 107 77)"></svg-icon>
                  </div>
                  <a-tooltip placement="rightBottom" color="#108ee9">
                    <template #title>
                      {{ node.title }}
                    </template>
                    <span class="left-name" v-if="node.title.indexOf(searchValue) > -1" style="margin-left:4px">
                      {{ node.title.substr(0, node.title.indexOf(searchValue)) }}
                      <span style="color: #f50">{{ searchValue }}</span>
                      {{ node.title.substr(node.title.indexOf(searchValue) + searchValue.length) }}
                    </span>
                    <span class="left-name" v-else style="margin-left:4px">{{ node.title }}</span>
                  </a-tooltip>
                </div>
                <div v-if="selectedKeys[0] == node.id" class="right">
                  <a-popconfirm title="你确定要删除该Tag吗?" @confirm.stop="delTag(node)">
                    <a-button style="margin-left: 8px;">
                      <template #icon>
                        <minus-outlined style="font-size: 10px" />
                      </template>
                    </a-button>
                  </a-popconfirm>
                </div>
              </div>
            </template>
          </a-tree>
        </div>
        <div class="mq-config-topic-add">
          <a-button style="width: 100%" type="dashed" @click="addTopic">
            <plus-outlined />
            新建Topic
          </a-button>
        </div>
      </div>
    </a-spin>
    <div class="mq-config-form-body">
      <mq-config-form :selectItem="selectItem" @getSelectItem="getSelectItem" :apiData="apiData"></mq-config-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PlusOutlined, CheckOutlined, MinusOutlined, FolderOutlined, EllipsisOutlined, ColumnHeightOutlined, VerticalAlignMiddleOutlined } from '@ant-design/icons-vue'
import { onMounted, ref, watch } from 'vue'
import { findNode, getDictItemsByCode } from '/@/views/online/utils/commonUtils'
import MqConfigForm from "/@/views/data/pzxx/modules/MqConfigForm.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { findNodeById } from "/@/views/data/apimanage/modules/apiUtil"
// 加载
let loading = ref<boolean>(false)
// 搜索值
let searchValue = ref<string>('')
// 是否展开
let isExpand = ref<boolean>(false)
// 展开keys
let expandedKeys = ref<any>([])
// 所有父节点
let allParentKeys = ref<any>([])
// 选中的值
let selectedKeys = ref<any>([])
// 选中项
let selectItem = ref<any>(null)
// 是否默认展开
let autoExpandParent = ref<boolean>(false)
// 用于搜索
let dataList = ref<any>([])
// 树
let treeData = ref<any>([])
// 接口数据
let apiData: any = ref([])
const targetKeys = ref<string[]>([])

const mockData: any = []
for (let i = 0; i < 20; i++) {
  mockData.push({
    key: i.toString(),
    title: `queryunit(查询登记信息)${i + 1}`,
    disabled: i % 3 < 1,
  })
}

watch(() => searchValue.value, (newVal: any) => {
  if (searchValue.value !== '') {
    const expanded = dataList.value.map((item: any) => {
      if (item.title.indexOf(newVal) > -1) {
        return getParentKey(item.id, treeData.value)
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

enum api {
  list = '/api/zrzy-api/api/mq/config/list',
  del = '/api/zrzy-api/api/mq/config/delete',
  apiList = '/api/zrzy-api/api/dir/list?apiType=2'
}

onMounted(() => {
  initData()
  getApiList()
})

/**
 * 初始化
 */
function initData() {
  defHttp.get({ url: api.list }, { withToken: true }).then((res) => {
    if (res && res.success) {
      let data: any = res.result || []
      let tree = setTree(data, 'topic')
      treeData.value = setParentKey(tree)
      init()
    } else {
      message.warning(res?.message || '加载数据失败!')
    }
  })
}

function getSelectItem(value) {
  selectedKeys.value = value?.id ? [value.id] : [];

  if (value) {
    const nodeId = value.oid || value.id;
    const node = findNodeById(treeData.value, nodeId);

    if (node) {
      Object.assign(node, value);
      if (value.oid) {
        delete node.oid;
      }
    }

    selectItem.value = value;
  }
}

/**
 * 初始化数据
 */
function init() {
  allParentKeys.value = getAllParentKeys(treeData.value, [])
  if (treeData.value && treeData.value.length > 0) {
    let find
    if (selectedKeys.value.length !== 0) {
      find = findNode(treeData.value, selectedKeys.value[0], 'key')
      find = find ? find : treeData.value[0]
    } else {
      find = treeData.value[0]
    }
    selectedKeys.value = [find.id]
    selectItem.value = find
  }
  generateList(treeData.value)
}

/**
 * 获取接口列表
 */
function getApiList() {
  defHttp.get({ url: api.apiList }, { withToken: true }).then((res) => {
    if (res && res.success) {
      apiData.value = res.result
    } else {
      apiData.value = []
    }
  })
}

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
 * 创建树结构
 */
function setTree(list, groupName) {
  const obj = {};
  const timestamp = Date.now();

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const groupKey = item[groupName];

    if (!obj[groupKey]) {
      obj[groupKey] = {
        id: item.topic + '-' + (timestamp + i),
        topic: item.topic,
        type: 'topic',
        title: item.topic,
        mqlx: item.mqlx,
        children: []
      };
    }

    obj[groupKey].children.push({
      ...item,
      type: 'tag',
      title: item.tag
    });
  }

  return Object.values(obj);
}

function setParentKey(newArr: any[], parentId?: any) {
  let newData = newArr.map((item: { pid: any; id: any; children: any; }) => {
    if (parentId) {
      item.pid = parentId
    }
    let pid = parentId ? parentId : item.id

    if (item.children) {
      item.children = setParentKey(item.children, pid)
    }
    return item
  })
  return newData
}

function getParentKey(key, tree) {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.id === key)) {
        parentKey = node.id
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

/**
 * 初始化datalist
 * @param data
 */
function generateList(data: any) {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    const id = node.id
    let title = node.title
    dataList.value.push({ id, title: title })
    if (node.children) {
      generateList(node.children)
    }
  }
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
  selectItem.value = e.node.dataRef
}

/**
 * 双击展开/收缩
 * @param node
 */
function onDoubleClick(node) {
  let findIndex = expandedKeys.value.findIndex(f => f == node.id)
  if (findIndex > -1) {
    expandedKeys.value.splice(findIndex, 1)
  } else {
    expandedKeys.value.push(node.id)
  }
  expandedKeys.value = Array.from(new Set(expandedKeys.value))
}

/**
 * 添加tag
 * @param node
 */
function addTag(node: any) {
  if (!node.topic || !node.mqlx) {
    message.warning('请先将信息填写完整!')
  } else {
    let timestamp = new Date().getTime()
    let tag = {
      id: 'tag_新增tag-' + timestamp,
      title: 'tag_新增tag-' + timestamp,
      tag: 'tag_新增tag-' + timestamp,
      topic: node.topic,
      mqlx: node.mqlx,
      type: 'tag',
      pid: node.id
    }
    node.children.push(tag)
    selectedKeys.value = [tag.id]
    selectItem.value = tag

    let expands = JSON.parse(JSON.stringify(expandedKeys.value))
    expands.push(node.id)
    expandedKeys.value = Array.from(new Set(expands))
  }
}

/**
 * 删除tag
 * @param node
 */
async function delTag(node: any) {
  let parent = treeData.value.find(f => f.id == node.pid)
  let addType = typeof node.id == 'string' ? node.id.substr(0, 4) == 'tag_新增tag-' : false
  let res
  if (addType) {
    res = true
  } else {
    res = await removeTagById(node.id)
  }
  if (res) {
    removeById(parent.children, node.id)
    message.success('删除成功')
  }
}

/**
 * 通过id删除
 * @param id
 */
function removeTagById(id) {
  return new Promise((resolve) => {
    defHttp.post({ url: api.del, params: { id: id } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    }).catch(err => {
      resolve(false)
    })
  })
}

/**
 * 新增主题
 */
function addTopic() {
  let timestamp = new Date().getTime()
  let topic = {
    id: 'tp_新建topic-' + timestamp,
    title: 'tp_新建topic-' + timestamp,
    topic: 'tp_新建topic-' + timestamp,
    children: [],
    type: 'topic',
  }
  treeData.value.push(topic)
  selectedKeys.value = [topic.id]
  selectItem.value = topic
}

/**
 * 删除主题
 * @param node
 */
function delTopic(node: any) {
  if (node.children && node.children.length > 0) {
    message.warning('该topic下存在数据，不允许直接删除!')
  } else {
    removeById(treeData.value, node.id)
    message.success('删除成功')
  }
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
      selectItem.value = currentSelect
      return
    }
  }
}
</script>

<style lang="less" scoped>
.mq-config {
  width: 100%;
  height: 100%;
  display: flex;

  .mq-config-tree {
    width: 350px;
    height: 100%;
    padding: 10px;
    border-right: 1px solid #f9f9f9;
  }

  .mq-config-search {
    display: flex;
    margin-bottom: 10px;
  }

  .mq-config-tree-content {
    max-height: calc(100% - 90px);
    overflow: auto;

    :deep(.ant-tree-node-content-wrapper) {
      padding: 0;
    }


    .tree-row-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        width: 240px;
        display: flex;

        .left-name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }


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

  .mq-config-topic-add {
    margin-top: 5px;
  }

  .mq-config-form-body {
    width: calc(100% - 350px);
    height: 100%;
    padding: 10px;
  }
}
</style>