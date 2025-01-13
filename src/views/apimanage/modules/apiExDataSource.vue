<template>
  <div class="api-ex-data-source">
    <div class="api-ex-data-source-list">
      <a-button @click="handleAdd" class="btn-add">
        新增
        <template #icon>
          <PlusOutlined style="font-size: 10px" />
        </template>
      </a-button>
      <div class="api-ex-data-source-tree">
        <template v-if="apiData.apiDataSource.length">
          <a-tree :tree-data="apiData.apiDataSource" v-model:selectedKeys="selectedKeys" :fieldNames="{ key: 'id' }"
            :blockNode="true" @select="handleSelectTreeItem">
            <template #title="node">
              <div class="api-row-content">
                <div class="left" :title="node.title">
                  {{ node.title }}
                </div>
                <div v-if="selectedKeys[0] == node.id" class="right">
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
    <div class="api-ex-data-source-form">
      <div v-if="selectedKeys.length" class="data-source-form-body">
        <a-flex :vertical="aa === 'vertical'" gap="small">
          <a-form-item label="属性名称" :label-col="{ style: { width: '80px' } }">
            <a-input v-model:value="selectedNode.title"></a-input>
          </a-form-item>
          <a-form-item label="keyName" :label-col="{ style: { width: '80px' } }">
            <a-input v-model:value="selectedNode.keyName"></a-input>
          </a-form-item>
          <a-form-item label="主数据源" :label-col="{ style: { width: '80px' } }">
            <a-radio-group v-model:value="selectedNode.isMain" @change="(e) => handleIsMain(e, selectedNode)">
              <a-radio value="1">是</a-radio>
              <a-radio value="0">否</a-radio>
            </a-radio-group>
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
} from '@ant-design/icons-vue'
import CodeEditor from '/@/components/common/CodeEditor.vue'
import { onMounted, ref, watch } from "vue"
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
  let isMain = props.apiData.apiDataSource.find(f => f.isMain == '1')
  let id = '新增数据源' + timestamp
  let node = {
    id: id,
    title: id,
    isMain: isMain ? '0' : '1',
    type: 'sql',
    content: ''
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
  let arr = props.apiData.apiDataSource
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
</script>

<style lang="less" scoped>
.api-ex-data-source {
  height: 100%;
  display: flex;

  .api-ex-data-source-list {
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

    .api-ex-data-source-tree {
      margin-right: 24px;
      margin-left: -24px;
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
        width: 130px;
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


  .api-ex-data-source-form {
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