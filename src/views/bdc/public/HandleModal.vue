<template>
  <div class="handle-modal">
    <a-spin :spinning="spinning">
      <a-row style="display:flex; height: 100%">
        <a-col :md="8" style="padding: 20px;height: 100%;overflow-y: auto">
          <h3 style="text-align: center">移交方向</h3>
          <div style="text-align: center">
            <a-radio-group v-model:value="handleDirection" @change="onChangeDirection">
              <a-radio :value="1">向后</a-radio>
              <a-radio :value="2">平级</a-radio>
<!--              <a-radio :value="3" v-if="formState.taskData.histListSize>0">驳回</a-radio>-->
            </a-radio-group>
          </div>
          <a-form :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item class="form-item" label="受理编号">
                  <span>&nbsp;{{ formState.slbh }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="业务名称">
                  <span>&nbsp;{{ formState.lcmc }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="业务类型">
                  <span>&nbsp;{{ formState.ywlx }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="当前节点">
                  <span>&nbsp;{{ formState.jdmc }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="承办时间">
                  <span>&nbsp;{{ formState.cbsj }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="剩余时限">
                  <span>&nbsp;{{ formState.sysx }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="承办人">
                  <span>&nbsp;{{ formState.cbr }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="收件人">
                  <span>&nbsp;{{ formState.cbr }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="初审人">
                  <span>&nbsp;{{ formState.csr }}</span>
                </a-form-item>
                <a-form-item class="form-item" label="备注">
                  <a-textarea
                    v-model="formState.bz"
                    placeholder="请输入备注"
                    :auto-size="{ minRows: 3, maxRows: 8 }"
                  />
                </a-form-item>
              </a-form>
        </a-col>
        <a-col :md="8" class="mid-col" style="padding: 20px; height: 100%;overflow-y: auto; border-left: 1px solid #e8e8e8;border-right: 1px solid #e8e8e8; flex: auto">
          <h3 style="text-align: center">承办人员</h3>
          <div style="text-align: center; margin-bottom: 10px">
            <a-radio-group v-model:value="handleUserType" @change="onChangeUserType">
              <a-radio :value="1">移交到人</a-radio>
              <a-radio :value="2">移交到角色</a-radio>
            </a-radio-group>
          </div>
          <!-- todo 驳回 -->
<!--          <div v-if="(formState.taskData.histListSize > 0) && (handleDirection == 3)">-->
<!--            -->
<!--          </div>-->
           <a-input-search  v-if="handleDirection == 1 && treeData.length == 1 && roleNum == 0"
                          placeholder="请输入承办人员名称" enterButton @search="onSearch" style="margin-bottom: 10px">
           </a-input-search>
          <a-spin class="tree-spin" :spinning="treeSpinning">
            <a-tree 
                v-if="!treeSpinning"
                multiple 
                :show-icon="true"
                :block-node="true"
                :selected-keys="selectedKeys"
                :default-expand-all="true"
                :auto-expand-parent="true"
                :tree-data="treeData"
                @select="onSelectTreeNode"
            >
               <template #icon="{ dataRef }">
                 <TeamOutlined v-if="dataRef.iconName == 'team'" />
                 <UserOutlined v-else-if="dataRef.iconName == 'user'"/>
               </template>
            </a-tree>
          </a-spin>
        </a-col>
        <a-col :md="8" style="padding: 20px;height: 100%;overflow-y: auto">
          <h3 style="text-align: center">
            移交对象
            <a-popconfirm
              title="确定要清空移交对象吗?"
              @confirm="onClearNode"
            >
              <a-button type="link" >
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </a-popconfirm>
          </h3>
          <div v-if="selectedNodes.length" class="selected-nodes-content">
            <div v-for="(item,index) in selectedNodes" class="selected-nodes-node" @mousemove="hoverNodeIndex = index" @mouseleave="hoverNodeIndex = -1">
              <span :title="item.title">{{ item.title }}</span>
              <CloseCircleOutlined v-show="hoverNodeIndex == index" style="position: absolute; right: 0; top: 14px; color: red" @click="onClickNode(item.key)"/>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { TeamOutlined,UserOutlined,DeleteOutlined,CloseCircleOutlined } from '@ant-design/icons-vue';
import { ref } from "vue"
import { findNode } from "/@/utils/form/commonUtils"
// 开启弹窗
let open = ref<boolean>(false)
// 加载状态
let spinning = ref<boolean>(false)
// 移交方向
let handleDirection = ref<number>(1)
// 移交人员
let handleUserType = ref<number>(1)
// 表单
let formState = ref<any>({
  slbh: '',
  lcmc: '',
  ywlx: '',
  jdmc: '',
  cbsj: '',
  sysx: '',
  cbr: '',
  csr: '',
  bz: ''
})
// 用户树
let treeData = ref<any>([{
  title: '审核',
  key: 'xx-1',
  class: 'first-tree-node',
  children: [{
    title: '首次审核',
    key: 'xx-1-1',
    iconName: 'team',
    children: [{
      title: '张三三',
      key: 'xx-1-1-1',
      iconName: 'user'
    },{
      title: '李四',
      key: 'xx-1-1-2',
      iconName: 'user'
    }]
  },{
    title: '二次审核',
    key: 'xx-2-1',
    iconName: 'team',
    children: [{
      title: '王五',
      key: 'xx-1-2-1',
      iconName: 'user'
    },{
      title: '李四',
      key: 'xx-1-2-2',
      iconName: 'user'
    }]
  }]
},{
  title: '审批',
  key: 'xx-2',
  class: 'first-tree-node',
  children: [{
    title: '首次审核',
    key: 'xx-2-1',
    iconName: 'team',
    children: [{
      title: '张三',
      key: 'xx-2-1-1',
      iconName: 'user'
    }]
  }]
}])
// todo 这个属性目前还不知道是什么
let roleNum = ref<number>(0)
// 树加载状态
let treeSpinning = ref<boolean>(false)
// 选中keys
let selectedKeys = ref<any>([])
// 选中可用keys(兄弟和自己)
let selectedUsefulKeys = ref<any>([])
// 选中节点
let selectedNodes = ref<any>([])
// 悬浮节点
let hoverNodeIndex = ref<number>(-1)
// 搜索词
let searchKeys = []

/**
 * 确认
 */
function handleOk() {
  
}

/**
 * 移交方向改变
 */
function onChangeDirection() {
  // 重新初始化用户树
  
}

/**
 * 移交人员改变
 */
function onChangeUserType() {
  
}

/**
 * 搜索
 */
function onSearch(value) {
  if (value) {
    searchKeys = []
    likeSearch(treeData.value, value)
    for (let i = 0; i < searchKeys.length ; i++) {
      selectedKeys.value.push(searchKeys[i])
    }
    setSelectNode()
  }
}

/**
 * 模糊查询
 * @param arr
 * @param value
 */
function likeSearch(arr, value) {
  let n = value.toLowerCase()
  arr.forEach(item => {
    if (item.children) {
      likeSearch(item.children, value)
    } else {
      if (item.title.toLowerCase().indexOf(n) !== -1) {
        searchKeys.push(item.key)
      }
    }
  })
}


/**
 * 选择树节点
 */
function onSelectTreeNode(keys, info) {
  let currentNode = info.node.dataRef
  let currentNodeKey = currentNode.key
  if (!currentNode.children) {
    if (selectedUsefulKeys.value.length > 0) {
      let find = selectedUsefulKeys.value.find(item => item == currentNodeKey)
      if (find) {
        selectedKeys.value = keys
      } else {
        selectedKeys.value = [currentNodeKey]
      }
    } else {
      selectedKeys.value = keys
    }
    // 不允许跨节点选择 其兄弟节点和自己可选择
    selectedUsefulKeys.value = getBroNodes(treeData.value, currentNodeKey, [])
    setSelectNode()
  }
}

/**
 * 获取兄弟节点
 * @param arr
 * @param key
 * @param addNodes
 */
function getBroNodes(arr, key, addNodes) {
  let flag = false
  let broNodes:any = []
  arr.forEach((item) => {
    broNodes.push(item.key)
    if (item.key == key) {
      flag = true
    } else {
      if (item.children) {
        getBroNodes(item.children, key, addNodes)
      }
    }
  })
  if (flag) {
    broNodes.forEach((item) => {
      addNodes.push(item)
    })
  }
  return addNodes
}

/**
 * 设置移交对象
 */
function setSelectNode() {
  let nodes:any = []
  selectedKeys.value.forEach(key => {
    let find = findNode(treeData.value, key, 'key')
    if (find) {
      nodes.push(find)
    }
  })
  selectedNodes.value = nodes
}

/**
 * 获取选中的节点数据
 * @param arr
 * @param key
 * @param newArr
 */
function getSelectedNodes(arr, key, newArr) {
  arr.forEach(item => {
    if (item.key == key) {
      newArr.push({
        title: item.title,
        key: item.key
      })
    } else {
      if (item.children) {
        getSelectedNodes(arr, key , newArr)
      }
    }
  })
  return newArr
}

function onClickNode(value) {
  selectedKeys.value = selectedKeys.value.filter(item => item != value)
  selectedNodes.value = selectedNodes.value.filter(item => item.key != value)
}

/**
 * 清空移交对象
 */
function onClearNode() {
  
}

defineExpose({
  handleOk
})
</script>

<style lang="less" scoped>
.handle-modal {
  height: 100%;
  
  :deep(.ant-spin-nested-loading) {
    height: 100%;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    
    .ant-spin-container {
      height: 100%;
    }
  }
}

.full-modal {
  :deep(.ant-modal) {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  :deep(.ant-modal-content) {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  :deep(.ant-modal-body) {
    flex: 1;
  }
}

.mid-col {
  :deep(.ant-spin-nested-loading) {
    height: calc(100% - 120px);
    overflow-y: auto;
    border: none;
  }
}

.tree-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  vertical-align: top;
}

.selected-nodes-content {
  display: flex; 
  justify-content: center; 
  flex-direction: column;
  align-items: center;
  
  .selected-nodes-node {
    display: flex;
    justify-content: center;
    width: 200px; 
    padding: 10px;
    text-align: center;
    position: relative;
    
  }
}

</style>