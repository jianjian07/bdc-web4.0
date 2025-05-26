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
                <a-radio :value="1">向后</a-radio>
                <a-radio :value="2">平级</a-radio>
                <a-radio :value="3" v-if="formState?.taskData?.histListSize > 0">驳回</a-radio>
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
          <div v-if="(formState?.taskData?.histListSize > 0) && (handleDirection == 3)">
            <a-select v-model:value="rejectModelNode" style="margin-top: 10px" @change="onRejectModelChange"
                      :dropdownMatchSelectWidth="false">
              <template v-for="(item, index) in formState.taskData.histListNode">
                <a-select-option v-if="item.name_ != formState.taskData.taskName" :value="item.task_def_key_">{{
                    item.name_
                  }}
                </a-select-option>
              </template>
            </a-select>
          </div>
          <a-input-search v-if="handleDirection == 1 && treeData.length == 1 && roleNum == 0"
                          placeholder="请输入承办人员名称"
                          enterButton @search="onSearch" style="margin-bottom: 10px">
          </a-input-search>
          <a-spin :class="treeData.length ? 'tree-spin' : ''" :spinning="treeSpinning">
            <a-tree v-if="!treeSpinning && treeData.length" multiple :show-icon="true" :block-node="true"
                    :selected-keys="selectedKeys" :default-expand-all="true" :auto-expand-parent="true"
                    :tree-data="treeData"
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
              <span :title="item.title">{{ item.title }}</span>
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
import { TeamOutlined, UserOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue"
import { findNode } from "/@/views/online/utils/commonUtils"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { useRoute } from "vue-router"
import { closeCurrentTab } from "/@/views/bdc/public/bdc.ts";
const eventBus = inject('scopedEventBus', null)

const route = useRoute();
const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})
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
let searchKeys = []
// 回退节点
let rejectModelNode = ref<any>(null)

enum api {
  getTaskUserInfo = '/api/zrzy-bdc/act/process/extActProcess/getTaskUserInfo',
  extractUserRole = '/api/zrzy-system/UserRole/extractUserRole',
  processComplete = '/api/zrzy-bdc/act/task/processComplete',
  getTaskInfo = '/api/zrzy-bdc/act/task/getProcessTaskTransInfo',
  isRegister = '/api/zrzy-bdc/bdc/public/isRegistered',
  handOverMakeRight = '/api/zrzy-bdc/act/task/handOverMakeRight'
}

onMounted(() => {
  getTaskInfo()
})

onBeforeUnmount(() => {
  eventBus.off('setShjg')
})

/**
 * 获取页面上的审核结果
 * @param value
 */
function getShjg() {
  eventBus.emit('getShjg')
}

/**
 * 通过审核结果初始化移交方向
 * @param shjg
 */
function initHandleDirection(shjg) {
  let e 
  switch(shjg) {
    case '1':
      // 同意 -> 向后
        e = { target: { value: 1 } }
      break;
    case '2':
    case '3':
    case '5':
      // 回退/退件/补齐补正  -> 驳回
        e = { target: { value: 3 } }
      break;
    case '4':
      // 转件 -> 平级
      e = { target: { value: 2 } }
      break;
    default:
      break;
  }
  
  if (e) {
    handleDirection.value = e.target.value
    onChangeDirection(e)
  }
}

/**
 * 获取流程信息
 */
function getTaskInfo() {
  return new Promise((resolve) => {
    let taskId = route.query.taskId || props.formData.taskId
    let slbh = route.query.slbh
    defHttp.get({
      url: api.getTaskInfo,
      params: { taskId: taskId, slbh: slbh }
    }, { withToken: true }).then(async (res) => {
      if (res && res.success) {
        let taskData = res.result
        let limit = true
        if (window.settingConfig.removeRegisterLimit) {
          limit = false
        }
        if (limit) {
          let nodeArr: any = await getNodeList() || []
          if (!nodeArr.includes(taskData.taskName)) {
            let isRegister = await getIsRegister()
            if (isRegister) {
              let arr = [...taskData.histListNode]
              let hisNode = arr.filter(f => f.name_ !== taskData.taskName)
              taskData.histListNode = getHisListNode(hisNode)
            } else {
              if (taskData.taskName.includes('簿')) {
                taskData.transitionList = []
                // message.warning('请先记载登记簿!')
              }
            }
          }
        }
  
        let slbh = route.query.slbh || props.formData.slbh
        // let lcmc = formConfig.value.ajmc
        let cbsj, cbr
        if (taskData.bpmLogList.length) {
          cbsj = taskData.bpmLogList[0].opTime
          cbr = taskData.bpmLogList[0].opUserName
        } else {
          cbsj = taskData.taskNameStartTime
          cbr = taskData.taskAssigneeName
        }
  
        formState.value = {
          taskId: taskId,
          slbh: slbh,
          // lcmc: lcmc,
          jdmc: taskData.nodeName,
          cbr: cbr,
          cbsj: cbsj,
          taskData: taskData
        }
        if (!['初审','复审','核定','审核'].includes(taskData.taskName)) {
         setTransTree()
        } else {
          eventBus.on('setShjg', initHandleDirection)
          getShjg()
        }
        // setTransTree()
      } else {
        message.warning('获取流程数据失败:' + res?.message)
      }
      resolve(true)
    })
  })
}

function getHisListNode(nodes) {
  const list = [...nodes] || []
  let lastIndex = -1
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].name_?.includes('簿')) {
      lastIndex = i
      break
    }
  }

  const result = lastIndex !== -1 ? list.slice(lastIndex) : []
  return result
}

/**
 * 获取节点 (用来过滤登簿节点之前的节点 不做是否登簿接口判断)
 * @param processId
 */
function getNodeList(processId?: any) {
  return new Promise((resolve, reject) => {
    // todo 这里一开始拿不到processId 没有接口获取当前流程节点列表
    // 先写死
    resolve(['收件', '初审', '复审', '核定', '审核'])
  })
}

/**
 * 判断是否登簿
 */
function getIsRegister() {
  let slbh = route.query.slbh
  return new Promise((resolve, reject) => {
    defHttp.get({ url: api.isRegister, params: { slbh: slbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        reject(res?.message)
      }
    })
  })
}

/**
 * 设置默认向后移交的树
 */
function setTransTree() {
  let transitionList = formState.value?.taskData?.transitionList
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
  let taskData = formState.value?.taskData
  if (taskData) {
    let transitionList = [{ nextnode: taskData.nodeId, taskName: taskData.taskName, nodeId: taskData.nodeId }]
    let stringList = transitionList.map(item => item.nextnode) || []
    if (stringList.length) {
      getTaskUserInfo(stringList, transitionList, 2)
    }
  }
}

/**
 * 设置回退移交树
 * @param rejectObj
 */
function setRejectTransTree(rejectObj) {
  if (rejectObj) {
    let transitionList = [{
      nextnode: rejectObj.rejectNode,
      rejectNodeName: rejectObj.rejectNodeName,
      rejectNode: rejectObj.rejectNode
    }]
    let stringList = transitionList.map(item => item.nextnode) || []
    getTaskUserInfo(stringList, transitionList, 3)
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


function resetData() {
  selectedKeys.value = []
  selectedNodes.value = []
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
          iconName: 'user'
        })
      }
      roleNode.push({
        title: roleListI[value][j].roleName,
        key: value + ',' + roleListI[value][j].roleId,
        value: roleListI[value][j].roleId,
        iconName: 'team',
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
            iconName: 'user'
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
        iconName: 'team'
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
        yjFx: handleDirection.value
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
  return new Promise((resolve, reject) => {
    let nextnode = obj.nextnode
    let yjfx = obj.yjfx
    let model = {
      slbh: route.query.slbh,
      taskId: formState.value.taskId || route.query.taskId,
      nextnode: obj.nextnode,
      nextCodeCount: '',
      reason: '',
      processModel: yjfx == 3 ? 3 : 1,
      yjfx: yjfx,
      rejectModelNode: yjfx == 3 ? nextnode : '',
      nextUserName: obj.nextnodeUserNameList,
      nextUserId: obj.nextnodeUserIdList,
      ccUserIds: '',
      ccUserRealNames: '',
      fileList: ''
    }
    spinning.value = true
    defHttp.post({ url: api.processComplete, data: model }, { withToken: true }).then((res) => {
      spinning.value = false
      if (res && res.success) {
        message.success('移交成功!')
        resolve(true)
      } else {
        let msg = res?.message || ''
        message.error('移交失败!' + msg)
        resolve(false)
      }
    }).catch(err => {
      message.error(err)
      resolve(false)
    })

  })
}

/**
 * 回退节点
 */
function onRejectModelChange(value) {
  rejectModelNode.value = value
  let obj: any = {}
  obj.rejectNode = rejectModelNode.value
  for (let i = 0; i < formState.value.taskData.histListNode.length; i++) {
    if (rejectModelNode.value === formState.value.taskData.histListNode[i].task_def_key_) {
      obj.rejectNodeName = formState.value.taskData.histListNode[i].name_
    }
  }
  setTransData(3, obj)
}

/**
 * 移交方向改变
 */
function onChangeDirection(e) {
  let obj: any = {}
  // 重新初始化用户树
  if (e.target.value == 3) {
    let nodeName
    rejectModelNode.value = formState.value.taskData.histListNode?.length ? formState.value.taskData.histListNode[0].task_def_key_ : null
    nodeName = formState.value.taskData.histListNode?.length ? formState.value.taskData.histListNode[0].name_ : null
    if (rejectModelNode.value === formState.value.taskData.nodeId) {
      if (formState.value.taskData.histListNode[1].task_def_key_) {
        rejectModelNode.value = formState.value.taskData.histListNode[1].task_def_key_
        nodeName = formState.value.taskData.histListNode[1].name_
      } else {
        rejectModelNode.value = null
      }
    }
    obj.rejectNode = rejectModelNode.value
    obj.rejectNodeName = nodeName
  }
  handleDirection.value = e.target.value
  setTransData(handleDirection.value, obj)
}

/**
 * 根据移交方向设置
 */
function setTransData(yjfx, rejectObj) {
  if (yjfx == 1) {
    // 默认向后移交
    setTransTree()
  } else if (yjfx == 2) {
    // 平级移交
    setPjTransTree()
  } else {
    // 回退移交
    setRejectTransTree(rejectObj)
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
  } else {
    treeData.value = treeDataCopy.value
  }
}

/**
 * 搜索
 */
function onSearch(value) {
  if (value) {
    searchKeys = []
    likeSearch(treeData.value, value)
    for (let i = 0; i < searchKeys.length; i++) {
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
 * 设置移交对象
 */
function setSelectNode() {
  let nodes: any = []
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
        getSelectedNodes(arr, key, newArr)
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
  selectedKeys.value = []
  selectedNodes.value = []
}

/**
 * 窗口补正
 */
function markRight() {
  const procInstId = formState.value.taskData.procInstId
  const taskId = formState.value.taskId || route.query.taskId
  if (!procInstId) {
    message.warning('流程实例ID不能为空，请刷新重试!')
    return
  }
  if (!taskId) {
    message.warning('流程任务ID不能为空，请刷新重试!')
    return
  }
  const params = {
    procInstId: procInstId,
    taskId: taskId,
    slbh: route.query.slbh,
    nodeName: formState.value.jdmc
  }
  return new Promise((resolve) => {
    defHttp.post({ url: api.handOverMakeRight, params: params }, { withToken: true }).then((res) => {
      spinning.value = false
      if (res && res.success) {
        message.success(res.message)
        resolve(true)
      } else {
        let msg = res?.message || ''
        message.error('移交失败!' + msg)
        resolve(false)
      }
    }).catch(err => {
      message.error(err)
      resolve(false)
    })
  })
}

defineExpose({
  handleOk,
  markRight
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
