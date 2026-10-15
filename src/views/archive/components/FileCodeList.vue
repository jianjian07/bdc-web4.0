<template>
  <div class="file-code-list">
    <div style="display: flex; flex-direction: column; height: 100%">
      <div style="line-height: 3em; background-color: #fff;">
          <a-alert type="info" :show-icon="true" style="margin-bottom: 10px">
            <template #message>
              当前选择：<span>{{ selectedItem.ruleName }}</span>
            </template>
          </a-alert>
          <a-button @click="handleAdd">新增</a-button>
      </div>
      <div style="margin-top: 8px;line-height: 3em; background-color: #fff; flex: 1;height: calc(100% - 50px); overflow: auto">
        <template v-if="treeData.length > 0">
          <a-directory-tree multiple :tree-data="treeData" @select="onSelect" v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys" :fieldNames="{ title: 'ruleName' }">
            <template #icon="">
            </template>
          </a-directory-tree>
        </template>
        <template v-else>
          <a-empty />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { findNode } from "/@/views/online/utils/commonUtils"
import { guid } from "/@/utils"

const props = defineProps({
  treeData: {
    type: Array,
    default: []
  },
  selectItem: {
    type: Object,
    default: {}
  }
})

let expandedKeys = ref<any>([])
let selectedKeys = ref<any>([])
let selectedItem = ref<any>({})

const emit = defineEmits(['update:selectItem'])

watch(() => props.treeData, (newVal: any) => {
  init()
}, {
  immediate: true
})

watch(() => props.selectItem, (newVal: any) => {
  selectedKeys.value = newVal ? [newVal.key] : []
  // 新增后替换
  if (newVal && newVal.oldCode) {
    let find = findNode(props.treeData, newVal.oldCode, 'key')
    if (find) {
      find.key = newVal.key
      delete newVal.oldCode
    }
  }
}, {
  immediate: true
})

/**
 * 初始化
 */
function init() {
  if (props.treeData.length) {
    let item = props.treeData[0]
    selectedKeys.value = [item.key]
    selectedItem.value = item
    emit('update:selectItem', item)
  }
    
}

/**
 * 选中
 * @param selectedKey
 * @param e
 */
function onSelect(selectedKey, e) {
  selectedKeys.value = [e.node.dataRef.key]
  selectedItem.value = e.node.dataRef
  emit('update:selectItem', e.node.dataRef)
}

/**
 * 新增
 */
function handleAdd() {
  let obj = {
    key: '新增-' + guid(),
    ruleName: '新增编码规则',
    ruleCode: ''
  }
  props.treeData.push(obj)
  emit('update:selectItem', obj)
}
</script>

<style lang="less" scoped>
.file-code-list {
  width: 300px;
  height: 100%;
  padding: 10px;
  border-right: 1px solid #f9f9f9;
}
</style>