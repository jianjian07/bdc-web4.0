<template>
  <div class="api-data-source">
    <div class="api-data-source-list">
      <a-button @click="handleAdd" class="btn-add">
        新增
        <template #icon>
          <PlusOutlined style="font-size: 10px" />
        </template>
      </a-button>
      <div class="api-data-source-tree">
        <template v-if="apiData.apiDataSource.length">
          <a-tree :tree-data="apiData.apiDataSource" v-model:selectedKeys="selectedKeys" 
                  v-model:expandedKeys="expandedRowKeys" :fieldNames="{ children:'children', key: 'id' }"
            :blockNode="true" @select="handleSelectTreeItem">
            <template #title="node">
              <div class="api-row-content">
                <div class="left" :title="node.title" :id="`left-${node.id}`" :style="getFieldNameStyle(node)">
                  {{ node.title }}
                </div>
                <div v-if="selectedKeys[0] == node.id" class="right">
                  <a-button @click.stop="addChild(node)">
                    <template #icon>
                      <appstore-add-outlined style="font-size: 10px" />
                    </template>
                  </a-button>
                  <a-popconfirm title="你确定要删除该数据源吗?" @confirm.stop="del(node)">
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
        </template>
        <template v-else>
          <a-empty description="请先添加数据源" />
        </template>
      </div>

    </div>
    <div class="api-data-source-form">
      <div v-if="selectedKeys.length" class="data-source-form-body">
        <a-flex :vertical="aa === 'vertical'" gap="small">
          <a-form-item label="属性名称" :label-col="{ style: { width: '80px' } }">
            <a-input v-model:value="selectedNode.title"></a-input>
          </a-form-item>
          <a-form-item label="keyName" :label-col="{ style: { width: '80px' } }">
            <a-input v-model:value="selectedNode.keyName"></a-input>
          </a-form-item>
          <a-form-item label="类型" :label-col="{ style: { width: '80px' } }">
            <a-radio-group v-model:value="selectedNode.type">
              <a-radio value="sql">sql</a-radio>
              <a-radio value="mybatis">mybatis</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-flex>

        <CodeEditor :fullScreen="true" language="javascript" :value="selectedNode.content" @codeValue="getCodeValue"
          style="height: 300px;">
        </CodeEditor>
      </div>
      <a-empty v-else description="请先选择数据源" />

    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  PlusOutlined,
  MinusOutlined,
  AppstoreAddOutlined
} from '@ant-design/icons-vue'
import CodeEditor from '/@/components/common/CodeEditor.vue'
import { nextTick, onMounted, ref, watch } from "vue"
import { findNode } from "/@/views/online/utils/commonUtils"
let aa = ref('horizontal');
const props = defineProps({
  apiData: {
    type: Object,
    default: {}
  }
})

// 选中keys
let selectedKeys = ref<any>([])
// 选中node
let selectedNode = ref<any>()
// 展开keys
let expandedRowKeys = ref<any[]>([])

onMounted(() => {
  if (props.apiData.apiDataSource.length) {
    selectedNode.value = props.apiData.apiDataSource[0]
    selectedKeys.value = [props.apiData.apiDataSource[0].id]
  }
})

/**
 * 添加
 */
function handleAdd() {
  let timestamp = new Date().getTime()
  // let isMain = props.apiData.apiDataSource.find(f => f.isMain == '1')
  let id = '新增数据源' + timestamp
  let node = {
    id: id,
    pid: '-1',
    level: 0,
    title: id,
    // isMain: isMain ? '0' : '1',
    type: 'sql',
    content: '',
    children: []
  }
  props.apiData.apiDataSource.push(node)
  selectedKeys.value = [id]
  selectedNode.value = node
}

/**
 * 删除
 * @param node
 */
function del(node) {
  let currentSelect
  let findParent = findParentNode(props.apiData.apiDataSource,node.id)
  let arr = findParent.children || []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id == node.id) {
      if (arr[i + 1]) {
        currentSelect = arr[i + 1]
      } else if (arr[i - 1]) {
        currentSelect = arr[i - 1]
      } else {
        currentSelect = undefined
      }
      arr.splice(i, 1)
      selectedKeys.value = currentSelect ? [currentSelect.id] : []
      selectedNode.value = currentSelect ? currentSelect : null
      return
    }
  }
}


/**
 * 选中
 * @param selectedKey
 * @param e
 */
function handleSelectTreeItem(selectedKey, e) {
  selectedKeys.value = [e.node.dataRef.id]
  selectedNode.value = e.node.dataRef
}

/**
 * 主数据源切换
 * @param e
 */
function handleIsMain(e, node) {
  let check = e.target.checked
  if (check) {
    // 只允许有一个主数据源
    props.apiData.apiDataSource = props.apiData.apiDataSource.map((item) => {
      if (item.id !== node.id) {
        item.isMain = '0'
      }
      return item
    })
  }
}

function getCodeValue(value) {
  selectedNode.value.content = value
}

function addChild(node) {
  let find = findNode(props.apiData.apiDataSource, node.id,'id')
  if (find) {
    if (!find.children) {
      find.children = []
    }
    let timestamp = new Date().getTime()
    let id = '新增数据源' + timestamp
    let childNode = {
      id: id,
      pid: find.id,
      level: find.level ? find.level + 1 : undefined,
      title: id,
      type: 'sql',
      content: '',
      children: []
    }
    find.children.push(childNode)
    selectedKeys.value = [id]
    selectedNode.value = childNode
    let extend = JSON.parse(JSON.stringify(expandedRowKeys.value))
    extend.push(find.id)
    expandedRowKeys.value = Array.from(new Set(extend))
  }
}

/**
 * 设置标题长度
 * @param node
 */
function getFieldNameStyle(node) {
  let num: number | null = 0
  if (node.level) {
    num = node.level
  } else {
    num = findNodeLevel(props.apiData.apiDataSource, node.id)
  }
  if (num !== null || num !== undefined) {
    nextTick(() => {
    let dom = document.getElementById('left-' + node.id)
    if (dom) {
      let width = 95 - 24 * num
      dom.style.width = `${width}px`
    }
  })
  }
}

/**
 * 子节点是第几级
 * @param tree
 * @param targetId
 * @param currentLevel
 */
function findNodeLevel(tree: any[], targetId: string | number, currentLevel = 0): number | null {
  for (const node of tree) {
    if (node.id === targetId) {
      return currentLevel
    }
    if (node.children && node.children.length > 0) {
      const level = findNodeLevel(node.children, targetId, currentLevel + 1)
      if (level !== null) {
        return level
      }
    }
  }
  return null
}

/**
 * 找父节点
 * @param tree
 * @param targetId
 */
function findParentNode(tree: any[], targetId: string | number): any | null {
  for (const node of tree) {
    if (node.children && node.children.some((child) => child.id === targetId)) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const parent = findParentNode(node.children, targetId);
      if (parent) {
        return parent
      }
    }
  }
  return null
}
</script>

<style lang="less" scoped>
.api-data-source {
  height: 100%;
  display: flex;

  .api-data-source-list {
    width: 200px;
    height: 100%;
    border-right: 1px solid #f0f0f0;

    .btn-add {
      //width: 20px;
      height: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
    }

    .api-data-source-tree {
      //margin-right: 24px;
      //margin-left: -24px;
      height: calc(100% - 35px);
      overflow: auto;
    }

    .api-row-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        white-space: nowrap;
        text-overflow: ellipsis;
        //width: 100px;
        overflow: hidden;
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


  .api-data-source-form {
    width: calc(100% - 50px);
    height: 100%;
    display: flex;
    justify-content: center;
    overflow: auto;

    .data-source-form-body {
      width: 90%;
      margin: 5px auto;
    }
  }
}
</style>