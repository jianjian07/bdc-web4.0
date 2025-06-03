<template>
  <div class="api-ex-tree">
    <div class="api-editor-search">
      <a-input-search v-model:value="searchValue" placeholder="搜索目录/接口" @search="onSearch" />
      <a-button style="margin-left: 8px" @click="handleExpand">
        <template #icon>
          <VerticalAlignMiddleOutlined v-if="isExpand" />
          <ColumnHeightOutlined v-else />
        </template>
      </a-button>
    </div>
    <div class="api-editor-tree-content">
      <a-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys"
        :auto-expand-parent="autoExpandParent" :fieldNames="fieldNames" :tree-data="apiTreeData" blockNode show-icon
        style="width: 100%;" @select="handleSelectTreeItem" draggable @drop="onDrop">
        <template #title="node">
          <div v-if="node.children" class="api-row-content" @dblclick="onDoubleClick(node)">
            <div class="left">
              <folder-outlined style="color: #5094f9"/>
              <span v-if="node.name.indexOf(searchValue) > -1" style="margin-left:5px">
                {{ node.name.substr(0, node.name.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ node.name.substr(node.name.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else style="margin-left:5px">{{ node.name }}</span>
            </div>
            <div v-if="selectedKeys[0] == node.id" class="right">
              <a-button style="margin-left: 8px;" @click.stop="addApi(node)">
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
                      <a-popconfirm title="你确定要删除该目录吗?" @confirm="delDir(node)">删除</a-popconfirm>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
          <div v-else class="api-row-content">
            <div class="left">
              <span :class="['api-type', 'api-type-' + node.method]">{{ node.method }}</span>
              <a-tooltip placement="rightBottom" color="#108ee9">
                <template #title>
                  {{ node.name }}
                </template>
                <span v-if="node.name.indexOf(searchValue) > -1" style="margin-left:4px">
                  {{ node.name.substr(0, node.name.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{ node.name.substr(node.name.indexOf(searchValue) + searchValue.length) }}
                </span>
                <span v-else style="margin-left:4px">{{ node.name }}</span>
              </a-tooltip>
              <!--              <span style="margin-left:10px">{{ node.name }}</span>-->
            </div>
            <div v-if="selectedKeys[0] == node.id" class="right">
              <a-popconfirm title="你确定要删除该接口吗?" @confirm.stop="delApi(node)">
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
    <div class="api-editor-dir-add">
      <a-button style="width: 100%" type="dashed" @click="addDir">
        <plus-outlined />
        新建
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  PlusOutlined,
  MinusOutlined,
  FolderOutlined,
  EllipsisOutlined,
  ColumnHeightOutlined,
  VerticalAlignMiddleOutlined
} from '@ant-design/icons-vue'
import { nextTick, ref, watch } from "vue"
import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import { guid } from "/@/utils"
import {
  findNodeById,
  getAllParentKeys,
  getMagicApiInfo,
  getParentId,
  removeMagicApiById
} from "/@/views/data/apimanage/modules/apiUtil"
// 搜索
let searchValue = ref<string>('')
// 是否展开
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

const emit = defineEmits(['update:selectItem', 'setSaveFun'])

enum api {
  delDir = '/api/zrzy-api/inner/dir/delete',
  delApi = '/api/zrzy-api/inner/api/delete'
}

watch(() => props.apiTreeData, (newVal: any) => {
  init()
}, {
  immediate: true
})

watch(() => props.selectItem, (newVal: any) => {
  selectedKeys.value = newVal ? [newVal.id] : []
  // 新增目录/接口后替换id
  if (newVal && newVal.oldId) {
    let find = findNodeById(props.apiTreeData, newVal.oldId)
    if (find) {
      find.id = newVal.id
      delete newVal.oldId
    }
  }

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
 * 搜索
 */
function onSearch() {

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
    name: '新建目录' + timestamp,
    code: '',
    publicKey: '',
    privateKey: '',
    apiKeys: [],
    isEncrypt: '0',
    encryptType: '',
    apiType: '1',
    bz: '',
    children: [],
    orderNum: props.apiTreeData.length + 1
  }
  props.apiTreeData?.push(dir)
  selectedKeys.value = [dir.id]
  emit('update:selectItem', dir)
}


/**
 * 删除目录
 * @param item
 */
async function delDirOld(item) {
  let promises = []
  if (props.apiTreeData) {
    let findDir = props.apiTreeData.find(_data => _data.id == item.id)
    if (findDir && findDir.children) {
      for (let i = 0; i < findDir.children.length; i++) {
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
 * 删除目录
 * @param item
 */
function delDir(item) {
  if (props.apiTreeData) {
    if (item.children.length) {
      message.warning('存在接口不允许直接删除目录!')
      return
    }
    let addType = typeof item.id == 'string' ? item.id.substr(0, 4) == '新建目录' : false
    if (addType) {
      removeById(props.apiTreeData, item.id)
      message.success('删除成功')
    } else {
      defHttp.delete({ url: api.delDir, params: { id: item.id } }, { withToken: true }).then((res) => {
        if (res && res.success) {
          removeById(props.apiTreeData, item.id)
          message.success('删除成功')
        } else {
          message.warning('删除失败')
        }
      })
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
  let dirType = typeof dir.id == 'string' ? dir.id.substr(0, 4) == '新建目录' : false
  if (dirType) {
    // 需要先保存目录
    message.warning('需先保存目录后再添加接口')
    return
  }
  let apiCode = guid()
  if (apiCode) {
    let api = {
      id: '新增接口' + apiCode,
      pid: dir.id,
      code: '',
      name: '新增接口',
      apiType: 1,
      dirId: dir.id,
      dirName: dir.name,
      dirCode: dir.code,
      publicKey: dir.publicKey,
      privateKey: dir.privateKey,
      apiKeys: dir.apiKeys,
      method: 'POST',
      version: 'testEnv',
      isResultDecrypt: 0,
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
      },
      apiDataSource: [],
      script: ''
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
    if (item.apiType == 2) {
      let _res = await getMagicApiInfo(item.id)
      if (_res) {
        res = await removeMagicApiById(item.id)
      }
    }
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
    defHttp.delete({ url: api.delApi, params: { id: id } }, { withToken: true }).then((res) => {
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

function onDoubleClick(node) {
  let findIndex = expandedKeys.value.findIndex(f => f == node.id)
  if (findIndex > -1) {
    expandedKeys.value.splice(findIndex, 1)
  } else {
    expandedKeys.value.push(node.id)
  }
  expandedKeys.value = Array.from(new Set(expandedKeys.value))
}

function onDrop(info) {
  
  if (info.dragNode.children && info.dragNode.children.length) {
    // 只允许子节点拖拽
    return
  }
  
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
  
  const loop = (data: any, key: string | number, callback: any) => {
    data.forEach((item: any, index: any) => {
      if (item.id === key) {
        return callback(item, index, data);
      }
      if (item.children) {
        return loop(item.children, key, callback);
      }
    });
  };
  const data = [...props.apiTreeData];
  
  // 拖动节点对象
  let dragObj: any;
 
  // 移除原位置的节点
  loop(data, dragKey, (item: any, index: number, arr: any) => {
    arr.splice(index, 1);
    dragObj = item;
  });

  let ar: any = [];
  let i = 0;
  let targetNode: any
  loop(data, dropKey, (_item: any, index: number, arr: any) => {
    ar = arr;
    i = index;
    targetNode = _item
  });
  
  // 目标节点是父节点（有子节点）作为子节点插入
  if (targetNode.children) {
    dragObj.dirId = targetNode.id
    dragObj.dirName = targetNode.name
    dragObj.dirCode = targetNode.code
    dragObj.pid = targetNode.id
   
    targetNode.children.push(dragObj)
    
  } else {
    // 目标节点是叶子节点 作为同级节点插入
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj);
    } else {
      ar.splice(i + 1, 0, dragObj);
    }
  }
  
  // 拖拽的即为选中的节点
  selectedKeys.value = [dragObj.id]
  emit('update:selectItem', dragObj)
  
  props.apiTreeData = data;
  
  if (targetNode.children) {
    // 执行保存
    nextTick(() => {
      emit('setSaveFun')
    })
  }
}

</script>

<style lang="less" scoped>
@media (max-width: 1520px) {
  .api-ex-tree {
    width: 300px!important;
  }
  
  .api-row-content {
    .left {
      width: 190px!important;
    }
  }
}

.api-ex-tree {
  width: 350px;
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

    :deep(.ant-tree-node-content-wrapper) {
      padding: 0;
    }

    .api-row-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        width: 240px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
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