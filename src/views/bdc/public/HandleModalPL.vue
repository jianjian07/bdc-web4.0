<template>
  <div class="handle-modal">
    <a-spin :spinning="spinning">
      <a-row style="display:flex; height: 100%; border-left: 1px solid #e8e8e8; border-right: 1px solid #e8e8e8">
        <a-col :md="12" class="mid-col"
               style="padding: 20px; height: 100%; min-height: 500px;overflow-y: auto;border-right: 1px solid #e8e8e8; flex: auto">
          <a-row style="align-items: center;">
            <a-col :span="10">
              <svg-icon name="移交" width="20px" height="20px" color="#5094F9"></svg-icon>
              移交方向：
            </a-col>
            <a-col :span="14">
              <a-radio-group v-model:value="handleDirection" @change="onChangeDirection">
                <a-radio v-show="!hidenBackRadio" :value="1">向后</a-radio>
                <a-radio :value="2">平级</a-radio>
              </a-radio-group>
            </a-col>
          </a-row>
          <a-row style="padding: 10px 0;align-items: center;">
            <a-col :span="10">
              <svg-icon name="people" width="20px" height="20px" color="#5094F9"></svg-icon>
              承办人员：
            </a-col>
            <a-col :span="14">
              <a-radio-group v-model:value="handleUserType" @change="onChangeUserType">
                <a-radio :value="1">移交到人</a-radio>
                <a-radio :value="2">移交到角色</a-radio>
              </a-radio-group>
            </a-col>
          </a-row>
          <a-divider orientation="left">承办人员</a-divider>
          <a-input-search v-if="handleUserType == 1"
                          placeholder="请输入承办人员名称" v-model:value="searchValue"
                          enterButton @search="onSearch" style="margin-bottom: 10px">
          </a-input-search>
          <a-spin :class="treeData.length ? 'tree-spin' : ''" :spinning="treeSpinning">
            <a-tree v-if="!treeSpinning && treeData.length" multiple :show-icon="true" :block-node="true"
                    :selected-keys="selectedKeys" :default-expand-all="false" :auto-expand-parent="false"
                    :tree-data="treeData" v-model:expandedKeys="expandedKeys"
                    @select="onSelectTreeNode">
              <template #icon="{ dataRef }">
                <TeamOutlined v-if="dataRef.iconName == 'team'"/>
                <UserOutlined v-else-if="dataRef.iconName == 'user'"/>
              </template>
            </a-tree>
          </a-spin>
        </a-col>
        <a-col :md="12" style="padding: 20px;height: 100%;min-height: 500px;overflow-y: auto">
          <h3 style="text-align: left;letter-spacing: 0.1em;font-size: 20px;">
            <svg-icon name="people" width="35px" height="35px" color="#5094F9"></svg-icon>
            移交对象
            <a-popconfirm title="确定要清空移交对象吗?" @confirm="onClearNode">
              <DeleteOutlined :style="{ fontSize: '16px', color: '#555' }"/>
            </a-popconfirm>
          </h3>
          <div style="color: #838E95 !important;">请选择需要移交的对象</div>
          <div v-if="selectedNodes.length" class="selected-nodes-content">
            <div v-for="(item, index) in selectedNodes" class="selected-nodes-node" @mousemove="hoverNodeIndex = index"
                 @mouseleave="hoverNodeIndex = -1">
              <span :title="item.title">{{ item.roleName ? item.roleName + ' - ' : '' }}{{ item.title }}</span>
              <CloseCircleOutlined v-show="hoverNodeIndex == index" style="position: absolute; right: 0; top: 15px;"
                                   @click="onClickNode(item.key)"/>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import {
  TeamOutlined,
  UserOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { computed, createVNode, nextTick, onMounted, ref, watch } from "vue"
import { findNode, getTransferRuleByCode } from "/@/views/online/utils/commonUtils"
import { defHttp } from "/@/utils/http/axios"
import { Modal, message } from "ant-design-vue"

const props = defineProps({
  formData: {
    type: Object,
    default: {
      taskIdList: [],
      nodeName: '',
      slbhList: [],
      taskDefKey: ''
    }
  }
})
// 加载状态
let spinning = ref<boolean>(false)
// 移交方向
let handleDirection = ref<number>(1)
// 移交人员
let handleUserType = ref<number>(1)
// 表单
let formState = ref<any>({})
// 用户树
let treeData = ref<any>([])
// 用户数copy
let treeDataCopy = ref<any>([])
// 角色数量
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
let searchValue = ref('')
// 展开节点
let expandedKeys = ref<any>([])
// 是否隐藏向后移交按钮
let hidenBackRadio = ref<boolean>(false)

enum api {
  getTaskUserInfo = '/api/zrzy-bdc/act/process/extActProcess/getTaskUserInfo',
  extractUserRole = '/api/zrzy-system/UserRole/extractUserRole',
  processCompletePl = '/api/zrzy-bdc/act/task/processCompletePl',
  getTaskTransitionList = '/api/zrzy-bdc/act/task/getTaskTransitionList',
  insertMqMessageForHandOverPl = '/api/zrzy-bdc/bdc/publiccommon/insertMqMessageForHandOverPl',
  getApiTransferRule = '/api/zrzy-bdc/act/task/getTaskHandoverRule'
}

watch(() => props.formData.taskIdList, (val: any) => {
  if (val) {
    if (props.formData.nodeName == '初审' || props.formData.nodeName == '核定') {
      // 当 nodeName 为 "初审" 或 "核定" 时，自动设置为平级移交
      handleDirection.value = 2
      hidenBackRadio.value = true
    }
    getTaskInfo()
  }
}, {
  immediate: true
})


/**
 * 获取流程信息
 */
function getTaskInfo() {
  return new Promise((resolve) => {
    let taskIdList = props.formData.taskIdList
    if (!taskIdList || taskIdList.length == 0) {
      message.warning("请勾选待移交任务!")
      return;
    }
    let nodeName = props.formData.nodeName
    if (!nodeName) {
      message.warning("请选择当前任务节点!")
      return;
    }
    let taskDefKey = props.formData.taskDefKey
    // 批量移交只会是同一个流程，取其中一个taskId查询流转信息
    let taskId = taskIdList[0]
    defHttp.post({
      url: api.getTaskTransitionList,
      data: { taskId: taskId, taskDefinitionKey: taskDefKey },
    }, { withToken: true }).then(async (res) => {
      if (res && res.success) {
        formState.value = res.result
        if (handleDirection.value == 2) {
          setPjTransTree()
        } else {
          setTransTree()
        }
        resolve(true)
      } else {
        message.warning('获取流程数据失败:' + res?.message)
        resolve(false)
      }
    })
  })
}

/**
 * 设置默认向后移交的树
 */
function setTransTree() {
  let transitionList = formState.value?.transitionList
  let stringList = transitionList.map(item => item.nextnode) || []
  if (stringList.length) {
    getTaskUserInfo(stringList, transitionList, 1)
  } else {
    resetData()
  }
}

/**
 * 设置平级移交树
 */
function setPjTransTree() {
  let taskData = formState.value
  let nodeName = props.formData.nodeName
  if (taskData) {
    let transitionList = [{ nextnode: taskData.nodeId, taskName: nodeName, nodeId: taskData.nodeId }]
    let stringList = transitionList.map(item => item.nextnode) || []
    if (stringList.length) {
      getTaskUserInfo(stringList, transitionList, 2)
    }
  }
}

/**
 * 获取用户信息
 * @param stringList
 */
function getTaskUserInfo(stringList, transitionList, yjfx) {
  resetData()
  treeSpinning.value = true
  defHttp.post({ url: api.getTaskUserInfo, data: { stringList: stringList } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      defHttp.post({ url: api.extractUserRole, data: res.result }, { withToken: true }).then((res) => {
        if (res && res.success) {
          let transTree = []
          let roleList = res.result
          let roleNumber = 0
          if (roleList && roleList.length) {
            transitionList.forEach(function (trans) {
              let nextUserName = []
              for (let i = 0; i < roleList.length; i++) {
                let keyNameList = Object.keys(roleList[i])
                keyNameList.forEach(item => {
                  if (item == trans.nextnode) {
                    let roleFlag = false
                    let obj: any = transUserList(roleList[i], item, roleFlag, roleNumber, nextUserName)
                    roleList[i] = obj.roleListI
                    roleFlag = obj.roleFlag
                    roleNumber = obj.roleNumber
                    nextUserName = obj.nextUserName
                    let tree = setTreePush(trans, roleFlag, nextUserName, yjfx)
                    transTree.push(tree)
                  }
                })
              }
            })
            treeData.value = transTree
            treeDataCopy.value = JSON.parse(JSON.stringify(treeData.value))
            roleNum.value = roleNumber
            // 取第一个第一级父节点
            const firstRootNode = transTree[0] || []
            expandedKeys.value = firstRootNode.children ? collectParentKeys(firstRootNode) : []
            treeSpinning.value = false
          }
        }
        treeSpinning.value = false
      })
    } else {
      message.warning(res?.message)
    }
  }).catch(err => {
    message.warning('请检查配置人员')
  })
}

const collectParentKeys = (node) => {
  const keys = []
  if (node.children && node.children.length > 0) {
    keys.push(node.key) // 当前节点是父节点，加入key
    node.children.forEach(child => keys.push(...collectParentKeys(child)))
  }
  return keys
}

function resetData() {
  selectedKeys.value = []
  selectedNodes.value = []
  searchValue.value = ''
  expandedKeys.value = []
  treeData.value = []
}

/**
 * 转换子节点
 * @param roleListI
 * @param value
 * @param roleFlag
 * @param roleNumber
 * @param nextUserName
 */
function transUserList(roleListI, value, roleFlag, roleNumber, nextUserName) {
  if (roleListI[value].length > 1) {
    let roleNode = []
    for (let j = 0; j < roleListI[value].length; j++) {
      let child = []
      for (let k = 0; k < roleListI[value][j].userList.length; k++) {
        child.push({
          title: roleListI[value][j].userList[k].realname,
          key: value + ',' + roleListI[value][j].roleId + ',' + roleListI[value][j].userList[k].username,
          value: roleListI[value][j].userList[k].username,
          roleName: roleListI[value][j].roleName,
          iconName: 'user'
        })
      }
      roleNode.push({
        title: roleListI[value][j].roleName,
        key: value + ',' + roleListI[value][j].roleId,
        value: roleListI[value][j].roleId,
        iconName: 'team',
        roleName: roleListI[value][j].roleName,
        children: child
      })
      roleFlag = true
      roleNumber += 1
      nextUserName = roleNode
    }
  } else {
    let role = roleListI[value][0]
    let userList = []
    if (role && role.userList) {
      role.userList.forEach(function (userListItem) {
        if (role.roleId || role.roleName) {
          userList.push({
            title: userListItem.realname,
            key: value + ',' + role.roleId + ',' + userListItem.username,
            value: userListItem.username,
            iconName: 'user',
            roleName: role.roleName,
          })
        } else {
          userList.push({
            title: userListItem.realname,
            key: value + ',' + userListItem.username,
            value: userListItem.username,
            iconName: 'team'
          })
        }
      })
    }
    if ((role && role.roleId) || (role && role.roleName)) {
      let children = []
      children.push({
        title: role.roleName,
        key: value + ',' + role.roleId,
        value: role.roleId,
        children: userList,
        iconName: 'team',
        roleName: role.roleName,
      })
      roleFlag = true
      roleNumber += 1
      nextUserName = children
    } else {
      roleFlag = false
      let children = []
      children = userList
      nextUserName = children
    }
  }
  // nextUserName , roleNum , roleList , roleFlag
  let obj = {
    nextUserName: nextUserName,
    roleNumber: roleNumber,
    roleListI: roleListI,
    roleFlag: roleFlag
  }
  return obj
}

function setTreePush(item, roleFlag, nextUserName, yjfx) {
  // 1 向后 2 平级 3 回退
  const mapping = {
    1: { title: item.nextnodeName, key: item.nextnode, value: item.nextnode },
    2: { title: item.taskName, key: item.nodeId, value: item.nodeId },
    3: { title: item.rejectNodeName, key: item.rejectNode, value: item.rejectNode }
  };

  const { title, key, value } = mapping[yjfx] || {};

  return {
    title: title,
    key: key,
    value: value,
    role: roleFlag,
    children: nextUserName
  };
}

/**
 * 确认
 */
async function handleOk() {
  let nextnodeUserNameList: any = []
  let nextnodeUserIdList: any = []
  let nextnode = ''

  const roleNames = selectedNodes.value
      .map(n => n.roleName)
      .filter(Boolean)

  const uniqueRoles = [...new Set(roleNames)]

  if (uniqueRoles.length > 1) {
    message.warning(`请选择同一角色的人员，当前包含多个角色：${uniqueRoles.join('、')}`)
    return
  }
  if (selectedNodes.value.length) {
    if (handleUserType.value == 1) {
      nextnodeUserNameList = []
      nextnodeUserIdList = []
      nextnode = selectedNodes.value[0].key.split(',')[0]
      selectedNodes.value.forEach(item => {
        let arr = item.key.split(',')
        nextnodeUserIdList.push(arr[arr.length - 1])
        nextnodeUserNameList.push(item.title)
      })
      let obj = {
        nextnode: nextnode,
        nextnodeUserNameList: nextnodeUserNameList.toString(),
        nextnodeUserIdList: nextnodeUserIdList.toString(),
        yjfx: handleDirection.value
      }
      return await handleProcessOver(obj)
    } else {
      nextnodeUserNameList = []
      nextnodeUserIdList = []
      let nextnode = selectedNodes.value[0].key.split(',')[0]
      selectedNodes.value.forEach(function (val) {
        treeData.value.forEach(function (node) {
          if (node.children) {
            node.children.forEach(function (childNode) {
              if (childNode.key === val.key) {
                if (childNode.childrenCopy) {
                  childNode.childrenCopy.forEach(function (childCopyItem) {
                    let arr = childCopyItem.key.split(',')
                    nextnodeUserNameList.push(childCopyItem.title)
                    nextnodeUserIdList.push(arr[arr.length - 1])
                  })
                }
              }
            })
          }
        })
      })
      // 去重
      let nameItems = [...new Set(nextnodeUserNameList)];
      let idItems = [...new Set(nextnodeUserIdList)];
      let obj = {
        nextnode: nextnode,
        nextnodeUserNameList: nameItems.toString(),
        nextnodeUserIdList: idItems.toString(),
        yjfx: handleDirection.value
      }
      return await handleProcessOver(obj)
    }
  } else {
    message.warning('请选择移交的对象!')
  }
  return false
}

/**
 * 调用移交接口
 * @param obj
 */
function handleProcessOver(obj) {
  return new Promise(async (resolve, reject) => {
    let yjfx = obj.yjfx
    let nodeName = props.formData.nodeName
    let model = {
      slbhList: props.formData.slbhList,
      taskIdList: props.formData.taskIdList,
      nextnode: obj.nextnode,
      yjfx: yjfx,
      nextUserId: obj.nextnodeUserIdList,
      taskDefinitionKey: props.formData.taskDefKey,
      nodeName: nodeName
    }
    spinning.value = true
    let apiStatus = await validateApiTransfer(model)
    spinning.value = false
    if (apiStatus) {
      spinning.value = true
      defHttp.post({ url: api.processCompletePl, data: model }, { withToken: true }).then(async (res) => {
        if (res && res.success) {
          message.success('移交成功!')
          let _mq = await insertMqMessageForHandOver()
          if (_mq) {
            resolve(true)
          } else {
            resolve(false)
          }
        } else {
          let msg = res?.message || ''
          message.error(msg, 10)
          resolve(false)
        }
        spinning.value = false
      }).catch(err => {
        message.error(err)
        resolve(false)
      })
    } else {
      resolve(false)
    }
  })
}

/**
 * 校验api移交规则
 */
function validateApiTransfer(obj) {
  return new Promise(async (resolve, reject) => {
    let slbhList = obj.slbhList
    // 同流程同节点移交规则一样
    let taskId = obj.taskIdList[0]
    let str = await getCurrentApiTransferRule(taskId)
    if (str === false) {
      resolve(false)
      return
    }
    let arr = str ? str.split(',') : []
    for (let i = 0; i < arr.length; i++) {
      let find: any = getTransferRuleByCode(arr[i])
      if (find && find.ywlx == 'transfer' && find.ruleType == 'api') {
        let content = find.content
        const scope: any = { defHttp, Modal, createVNode, ExclamationCircleOutlined }; // 显式用一下，保证vite不会剔除
        let fn = eval(`async (slbh) => {
          ${content}
        }`)
        for (let s = 0; s < slbhList.length; s++) {
          let transferRes = await fn(slbhList[s])
          if (!transferRes) {
            resolve(false)
            return
          }
        }
      } else {
        message.warning('移交规则查找失败!')
        resolve(false)
        return
      }
    }
    resolve(true)
  })
}

/**
 * 获取当前流程配置的api移交规则
 * @param slbh
 */
function getCurrentApiTransferRule(taskId) {
  return new Promise((resolve, reject) => {
    defHttp.post({ url: api.getApiTransferRule, params: { taskId: taskId } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result || '')
      } else {
        message.warning(res?.message)
        resolve(false)
      }
    })
  })
}

/**
 * 移交方向改变
 */
function onChangeDirection(e) {
  expandedKeys.value = []
  searchValue.value = ''
  handleUserType.value = 1
  handleDirection.value = e.target.value
  setTransData(handleDirection.value)
}

/**
 * 根据移交方向设置
 */
function setTransData(yjfx) {
  if (yjfx == 1) {
    // 默认向后移交
    setTransTree()
  } else if (yjfx == 2) {
    // 平级移交
    setPjTransTree()
  }
}

/**
 * 移交人员改变
 */
function onChangeUserType(e) {
  resetData()
  let value = e.target.value
  if (value == 2) {
    let tree = JSON.parse(JSON.stringify(treeDataCopy.value))
    tree = tree.filter(item => item.role === true)
    for (let i = 0; i < tree.length; i++) {
      for (let j = 0; j < tree[i].children.length; j++) {
        tree[i].children[j].childrenCopy = tree[i].children[j].children
        delete tree[i].children[j].children
      }
    }
    treeData.value = tree
    const firstRootNode = tree[0] || []
    nextTick(() => {
      expandedKeys.value = firstRootNode.children ? collectParentKeys(firstRootNode) : []
    })
  } else {
    treeData.value = treeDataCopy.value
    const firstRootNode = treeDataCopy.value[0] || []
    nextTick(() => {
      expandedKeys.value = firstRootNode.children ? collectParentKeys(firstRootNode) : []
    })
  }
}

/**
 * 选择树节点
 */
function onSelectTreeNode(keys, info) {
  const currentNode = info.node.dataRef
  const currentNodeKey = currentNode.key

  // 判断是否是叶子节点
  if (!currentNode.children) {
    // 获取当前节点的兄弟节点（包括自己）
    const currentGroupKeys = getBroNodes(treeData.value, currentNodeKey, [])

    // 判断当前选中的 keys 中是否有不在同一组（兄弟节点）的
    const hasOtherGroup = selectedKeys.value.some(k => !currentGroupKeys.includes(k))

    if (hasOtherGroup) {
      // 清除其他组，只保留当前组中选中的
      selectedKeys.value = keys.filter(k => currentGroupKeys.includes(k))
    } else {
      const idx = selectedKeys.value.indexOf(currentNodeKey)
      if (idx > -1) {
        // 取消选中
        selectedKeys.value.splice(idx, 1)
      } else {
        selectedKeys.value.push(currentNodeKey)
      }
    }

    selectedUsefulKeys.value = currentGroupKeys
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
  let broNodes: any = []
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
 * 搜索
 * @param value
 */
function onSearch(value) {
  if (!value) return

  if (treeData.value.length > 0) {
    const matchedKeys = []
    const newExpandedKeys = []

    for (let i = 0; i < treeData.value.length; i++) {
      likeSearch(treeData.value[i], value, matchedKeys, newExpandedKeys)
    }

    // 选中匹配的叶子节点
    matchedKeys.forEach(k => {
      if (!selectedKeys.value.includes(k)) {
        selectedKeys.value.push(k)
      }
    })

    // 展开所有相关父节点
    expandedKeys.value = Array.from(new Set([...expandedKeys.value, ...newExpandedKeys]))

    setSelectNode()
  }
}

/**
 * 查找节点  纯粹查找，收集匹配的叶子节点key和需要展开的父节点key，放到传入的两个数组里
 * @param node
 * @param value
 * @param matchedKeys
 * @param expandedKeys
 * @param path
 */
function likeSearch(node, value, resultKeys, expandedCollect, path = []) {
  let found = false
  const keyword = value.toLowerCase()

  function dfs(n, curPath) {
    if (!n) return

    const currentPath = [...curPath, n.key]

    const isLeaf = !n.children || n.children.length === 0

    if (isLeaf && n.title?.toLowerCase().includes(keyword)) {
      resultKeys.push(n.key)

      const parentKeys = currentPath.slice(0, -1)
      parentKeys.forEach(k => {
        if (!expandedCollect.includes(k)) {
          expandedCollect.push(k)
        }
      })

      found = true
    }

    // 继续遍历子节点
    if (n.children && n.children.length > 0) {
      for (const child of n.children) {
        dfs(child, currentPath)
      }
    }
  }

  dfs(node, path)
  return found
}

/**
 * 设置移交对象
 */
function setSelectNode() {
  const nodes: any[] = []

  selectedKeys.value.forEach(key => {
    const find = findNode(treeData.value, key, 'key')
    if (find && !nodes.some(n => n.key === key)) {
      nodes.push(find)
    }
  })
  selectedNodes.value = nodes
}

function onClickNode(value) {
  selectedKeys.value = selectedKeys.value.filter(item => item != value)
  selectedNodes.value = selectedNodes.value.filter(item => item.key != value)
}

/**
 * 清空移交对象
 */
function onClearNode() {
  selectedKeys.value = []
  selectedNodes.value = []
}

/**
 * 一窗办理进度推送
 */
function insertMqMessageForHandOver() {
  let nodeName = props.formData.nodeName
  let slbhList = props.formData.slbhList
  return new Promise((resolve) => {
    defHttp.post({
      url: api.insertMqMessageForHandOverPl,
      data: {
        slbhList: slbhList,
        yjfx: handleDirection.value,
        jdmc: nodeName
      }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve({ success: true })
      } else {
        resolve({
          success: false,
          message: res?.message || '推送失败'
        })
      }
    }).catch(error => {
      resolve({
        success: false,
        message: error.message || '网络请求异常'
      })
    })
  })
}

defineExpose({
  handleOk
})
</script>

<style lang="less" scoped>
.handle-modal {
  height: 100%;
  min-height: 500px;

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
    height: calc(100% - 130px);
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
  // align-items: center;

  .selected-nodes-node {
    display: flex;
    // justify-content: center;
    width: 200px;
    padding: 5px;
    text-align: left;
    position: relative;

  }
}

.tree-spin {
  width: 100%;
  height: calc(100% - 50px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
