<template>
  <div class="user-chosen">
    <div class="user-chosen-dept">
      <a-input-search
          v-model:value="searchDept"
          allow-clear
          placeholder="请输入部门名称"
          style="margin-bottom: 10px"
      />
      <a-spin :spinning="deptLoading">
        <a-tree v-if="showTree" v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedDeptKeys" :auto-expand-parent="autoExpandParent" :defaultExpandAll="false"
                :fieldNames="deptFieldNames"
                :tree-data="treeData" blockNode
                showLine @select="onDeptSelect">
          <template #switcherIcon="{ switcherCls, data, expanded }">
            <template v-if="data.children && data.children.length">
              <PlusSquareOutlined v-if="!expanded" :class="switcherCls" style="font-size: 14px; margin: 5px;"/>
              <MinusSquareOutlined v-if="expanded" :class="switcherCls" style="font-size: 14px; margin: 5px;"/>
            </template>
            <FileOutlined v-else/>
          </template>
          <template #title="node">
            <span v-if="node.name.indexOf(searchDept) > -1" style="margin-left:5px">
              {{ node.name.substr(0, node.name.indexOf(searchDept)) }}
              <span style="color: #f50">{{ searchDept }}</span>
              {{ node.name.substr(node.name.indexOf(searchDept) + searchDept.length) }}
            </span>
            <span v-else style="margin-left:5px">{{ node.name }}</span>
          </template>
        </a-tree>
      </a-spin>
    </div>
    <div class="user-chosen-user">
      <div class="user-chosen-user-table-header">
        <a-form :model="searchForm" layout="inline">
          <a-form-item label="用户名">
            <a-input v-model:value="searchForm.name" placeholder="请输入用户名"/>
          </a-form-item>
          <a-space>
            <a-button type="primary" @click="searchData">查询</a-button>
            <a-button @click="reset">重置</a-button>
          </a-space>
        </a-form>
      </div>
       <div style="margin-bottom: 10px">
          <a-alert show-icon type="info">
            <template #message>
              <template v-if="showTenantSelectionSummary && !isSuperAdmin">
                已授权共 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a> 项（当前租户范围内
                <a style="font-weight: 600">{{ currentTenantSelectedCount }}</a> 项，其他租户保留
                <a style="font-weight: 600">{{ otherTenantSelectedCount }}</a> 项）
              </template>
              <template v-else-if="showTenantSelectionSummary">
                已授权共 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a> 项
              </template>
              <template v-else>
                已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}&nbsp;</a>项
              </template>
            </template>
          </a-alert>
       </div>
      <div class="user-chosen-user-table-body">
        <a-table :columns="columns" :data-source="userList" :pagination="pagination" :row-selection="rowSelection"
                 :scroll="{ y: 800 }" rowKey="id" @change="onTableChange" :customRow="customRow">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex === 'deptInfoList'">
              {{ record.deptInfoList?.length > 0 ? record.deptInfoList.map(info => info.name).join(',') : '' }}
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { PlusSquareOutlined, MinusSquareOutlined, FileOutlined } from '@ant-design/icons-vue'
import { getDeptOptions } from "/@/views/bdc/public/bdc"
import { getParentId } from "/@/utils"
import { useUserStore } from "/@/store/modules/user"

const userStore = useUserStore()
const isSuperAdmin = computed(() => {
  const permissions = (userStore.getUserInfo as any).permissions
  return Array.isArray(permissions) && permissions.includes('admin')
})
const tenantDeptId = computed(() => (userStore.getUserInfo as any).tenantDeptId)
// 搜索部门
let searchDept = ref<string>('')
// 部门loading
let deptLoading = ref<boolean>(false)
// 是否显示部门树
let showTree = ref(true)
// 部门树
let treeData: any = ref([])
// 用户搜索
let searchForm = ref<any>({
  name: '',
  deptId: ''
})
// 用于搜索
let dataList = ref<any>([])
// 是否自动展开父节点
let autoExpandParent = ref<boolean>(false)
// 展开
let expandedKeys = ref<any>([])
// 左侧当前选中的部门
let selectedDeptKeys = ref<any>([])

const deptFieldNames = { title: 'name', key: 'id', children: 'children' }

// 列名
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '姓名',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
  },
  {
    title: '手机',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '部门',
    dataIndex: 'deptInfoList',
    key: 'deptInfoList'
  }
]

let page = ref<any>({
  total: 0,
  current: 1
})
// 分页
const pagination = computed(() => ({
  total: page.value.total,
  current: page.value.current,
  pageSize: 10,
}))
// 用户列表
let userList = ref<any>([])
// 接口返回的完整用户集合；仅对该集合做前端部门范围过滤。
let allUserList = ref<any>([])
// 选中的部门数据
let deptInfo = ref<any>()
// 选中的用户key
let selectedRowKeys = ref<any>([])
// 选中的用户key
let selectedRow = ref<any>([])
// 初始选中项只恢复一次，后续切换部门时保留用户的选择。
let initialSelectionRestored = false
// 列表项是否可选择
const rowSelection = computed(() => {
  return {
    type: props.formData.modeType && props.formData.modeType == 'checkbox' ? 'checkbox' : 'radio',
    selectedRowKeys: selectedRowKeys.value,
    onSelect(record: any, selected: any) {
      if (props.formData.modeType && props.formData.modeType == 'checkbox') {
        selectRow(selected, record)
      } else {
        selectedRowKeys.value = [record['id']]
        selectedRow.value = [record]
      }
    },
    onSelectAll(selected: any, _selectionRows: any, changeRows: any) {
      if (selected) {
        selectedRow.value = selectedRow.value.concat(changeRows)
      }
      if (!selected) {
        let selectionRows = JSON.parse(JSON.stringify(selectedRow.value))
        const delIndex: any = []
        selectionRows.forEach((item: any, index: any) => {
          changeRows.forEach((val: any) => {
            if (item['id'] === val['id']) {
              delIndex.push(index)
            }
          })
        })
        delIndex.forEach((item: any) => {
          delete selectionRows[item]
        })
        selectionRows = selectionRows.filter((item: any) => {
          return item !== undefined
        })
        selectedRow.value = selectionRows
      }
      selectedRowKeys.value = selectedRow.value.map((m: any) => m['id'])
    }
  }
})

const customRow = (record) => {
  return {
    onClick: (event) => {
      if (props.formData.modeType && props.formData.modeType == 'checkbox') {
        let find =  selectedRowKeys.value?.find(f => f == record['id'])
        let check = !find
        selectRow(check, record)
      } else {
        selectedRowKeys.value = [record['id']]
        selectedRow.value = [record]
      }
    }
  }
}

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})
const showTenantSelectionSummary = computed(() => Boolean((props.formData as any).showTenantSelectionSummary))
const currentTenantSelectedCount = computed(() => {
  if (isSuperAdmin.value) {
    return selectedRow.value.length
  }

  const tenantDeptIds = collectDeptIds(treeData.value)
  return selectedRow.value.filter((user: any) => {
    return (user.deptInfoList || []).some((dept: any) => tenantDeptIds.has(String(dept.id)))
  }).length
})
const otherTenantSelectedCount = computed(() => selectedRow.value.length - currentTenantSelectedCount.value)

enum api {
  list = '/api/zrzy-system/sys/v1/user/page'
}

watch(() => searchDept.value, (newVal: any) => {
  if (searchDept.value !== '') {
    const expanded = dataList.value.map((item: any) => {
      if (item.title.indexOf(newVal) > -1) {
        return getParentId(item.id, treeData.value)
      }
      return null
    }).filter((item, i, self) => item && self.indexOf(item) === i)
    expandedKeys.value = expanded
    searchDept.value = newVal
    autoExpandParent.value = true
  } else {
    autoExpandParent.value = false
  }
})

defineExpose({
  selectedRow
})

watch(() => deptInfo.value, (newVal) => {
  if (newVal && newVal.id) {
    searchForm.value.deptId = newVal.id
  } else {
    searchForm.value.deptId = ''
  }
  page.value.current = 1
  refreshUserList()
})

onMounted(async () => {
  deptLoading.value = true
  await onLoadData()
  setDefaultDeptSelection()
  loadAllUsers()
})

function selectRow(selected: any, record: any) {
  if (selected) {
    selectedRow.value.push(record)
  } else {
    const delIndex = selectedRow.value.findIndex((val: any) => {
      return val['id'] === record['id']
    })
    selectedRow.value.splice(delIndex, 1)
  }
  selectedRowKeys.value = selectedRow.value.map(m => m['id'])
}

/**
 * 加载部门树
 */
async function onLoadData() {
  treeData.value = await getDeptOptions()
  generateList(treeData.value)
  deptLoading.value = false
  showTree.value = true
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
 * 非超级管理员默认选中当前租户关联机构
 */
function setDefaultDeptSelection() {
  if (isSuperAdmin.value || tenantDeptId.value == null || tenantDeptId.value === '') {
    return false
  }

  const defaultDept = findDeptNode(treeData.value, tenantDeptId.value)
  if (!defaultDept) {
    return false
  }

  selectedDeptKeys.value = [defaultDept.id]
  deptInfo.value = defaultDept
  return true
}

function findDeptNode(nodes: any[], deptId: string | number) {
  for (const node of nodes) {
    if (String(node.id) === String(deptId)) {
      return node
    }
    const target = findDeptNode(node.children || [], deptId)
    if (target) {
      return target
    }
  }
  return null
}


/**
 * 选中部门
 * @param selectedKeys
 * @param info
 */
function onDeptSelect(selectedKeys: any, info: any) {
  if (selectedKeys.length == 0) {
    if (!setDefaultDeptSelection()) {
      deptInfo.value = null
    }
  } else {
    deptInfo.value = info.node.dataRef || null
  }
}

/**
 * 获取完整用户集合部门范围及搜索条件均在前端处理
 */
function loadAllUsers() {
  defHttp.get({
    url: api.list,
    params: { pageNo: 1, pageSize: -1 }
  }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      allUserList.value = res.result.records.map((record) => {
        record.roleList = record.roleList || []
        return record
      })
      if (!initialSelectionRestored && props.formData.currentKeys && props.formData.currentKeys.length) {
        selectedRow.value = props.formData.currentKeys.map((key) => {
          let filterKeyName = props.formData.filterKeyName ? props.formData.filterKeyName : 'username'
          let find = allUserList.value.find(f => f[filterKeyName] == key)
          return find ? find : { id: key }
        })
        selectedRowKeys.value = selectedRow.value.map(s => s?.id)
        initialSelectionRestored = true
      }
      refreshUserList()
    } else {
      allUserList.value = []
      userList.value = []
    }
  }).catch(() => {
    allUserList.value = []
    userList.value = []
  })
}

/**
 * 根据当前租户部门树、左侧部门和搜索条件筛选后进行前端分页
 */
function refreshUserList() {
  let records = allUserList.value.filter((record: any) => {
    return !searchForm.value.name || record.username?.includes(searchForm.value.name)
  })

  const allowedDeptIds = getAllowedDeptIds()
  if (allowedDeptIds) {
    records = records.filter((record: any) => {
      return (record.deptInfoList || []).some((dept: any) => allowedDeptIds.has(String(dept.id)))
    })
  }

  page.value.total = records.length
  const maxPage = Math.max(1, Math.ceil(records.length / pagination.value.pageSize))
  if (page.value.current > maxPage) {
    page.value.current = maxPage
  }
  const start = (page.value.current - 1) * pagination.value.pageSize
  userList.value = records.slice(start, start + pagination.value.pageSize)
  updateSelectedRows(userList.value)
}

function getAllowedDeptIds(): Set<string> | null {
  const selectedDeptId = deptInfo.value?.id
  if (selectedDeptId) {
    const selectedDept = findDeptNode(treeData.value, selectedDeptId)
    return selectedDept ? collectDeptIds([selectedDept]) : new Set()
  }
  return isSuperAdmin.value ? null : collectDeptIds(treeData.value)
}

function collectDeptIds(nodes: any[], ids = new Set<string>()) {
  nodes.forEach((node) => {
    ids.add(String(node.id))
    collectDeptIds(node.children || [], ids)
  })
  return ids
}

/**
 * 当前页出现已选用户时
 * 用完整用户信息替换原有缓存项
 * 不清除其他部门已选用户
 */
function updateSelectedRows(records: any[]) {
  records.forEach((record) => {
    const selectedIndex = selectedRow.value.findIndex((item: any) => item.id === record.id)
    if (selectedIndex >= 0) {
      selectedRow.value.splice(selectedIndex, 1, record)
    }
  })
}

/**
 * 查询
 */
function searchData() {
  page.value.current = 1
  refreshUserList()
}


/**
 * 表格变化
 * @param pagination
 * @param filters
 * @param sorter
 * @param currentDataSource
 */
function onTableChange(pagination, filters, sorter, { currentDataSource }) {
  page.value.current = pagination.current
  page.value.total = pagination.total
  refreshUserList()
}

/**
 * 重置
 */
function reset() {
  searchForm.value = {
    name: '',
    state: '',
    deptId: deptInfo.value?.id || ''
  }
  page.value.current = 1
  refreshUserList()
}


</script>

<style lang="less" scoped>
.user-chosen {
  padding: 10px;
  display: flex;
  height: 100%;

  .user-chosen-dept {
    min-width: 250px;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }

  .user-chosen-user {
    width: calc(100% - 250px);
    height: 100%;
    padding: 10px;

    .user-chosen-user-table-header {
      margin-bottom: 10px;
      padding: 0 5px;
    }

    .user-chosen-user-table-body {
      height: calc(100% - 80px);

      :deep(.ant-table-wrapper) {
        height: 100%;

        .ant-table {
          height: calc(100% - 60px);

          .ant-table-container {
            height: 100%;


            .ant-table-body {
              height: calc(100% - 60px);
            }
          }
        }
      }

      :deep(.ant-spin-nested-loading) {
        height: 100%;
      }
      :deep(.ant-spin-container) {
        overflow: hidden !important;
        height: 100%;
      }
    }
  }
}
</style>
