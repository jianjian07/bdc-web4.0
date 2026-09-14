<template>
  <a-drawer
    v-model:open="open"
    title="角色用户"
    placement="right"
    width="45%"
  >
    <div class="sys-role-user-list-table">
      <div class="sys-role-user-list-header">
        <a-form :model="searchForm" layout="inline">
          <a-form-item label="用户名">
            <a-input v-model:value="searchForm.name" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="searchForm.state" placeholder="请选择状态" style="width: 80px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">正常</a-select-option>
              <a-select-option value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
           <a-space>
            <a-button type="primary" @click="searchData">查询</a-button>
            <a-button @click="reset">重置</a-button>
          </a-space>
        </a-form>
      </div>
      <div class="sys-role-user-list-content">
        <a-button type="primary" @click="handleUserPermission" style="margin-bottom: 10px">授权用户</a-button>
        <a-table :columns="columns" :data-source="userList" :pagination="pagination"
          @change="onTableChange" rowKey="id" bordered :loading="loading">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex == 'loginLocked'">
              <span v-if="!record.enabled" style="color:rgb(245,34,45)">已锁定</span>
              <span v-else>未锁定</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { cModal } from "/@/components/cModal/index.ts"
import { message } from "ant-design-vue"
import { getDeptOptions } from "/@/views/bdc/public/bdc"
import { useUserStore } from "/@/store/modules/user"

const userStore = useUserStore()
const isSuperAdmin = computed(() => {
  const permissions = (userStore.getUserInfo as any).permissions
  return Array.isArray(permissions) && permissions.includes('admin')
})

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
    title: '状态',
    dataIndex: 'loginLocked',
    key: 'loginLocked',
  }
]
let open = ref<boolean>(false)

// 查询条件
let searchForm = ref<any>({
  name: '',
  state: '',
})

// 当前角色id
let currentRoleId = ref<string>('')
// 当前角色用户列表
let userList = ref<any>([])
// 当前角色完整授权集合，保存时必须保留其中的跨租户用户。
let allRoleUsers = ref<any>([])
let currentTenantDeptIds = ref<Set<string>>(new Set())
let loading = ref(false)

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

defineExpose({
  edit
})

enum api {
  list = '/api/zrzy-system/sys/v1/user/page',
  updateRole = '/api/zrzy-system/sys/v1/user/updateRoleByUserId'
}

async function edit(record) {
  currentRoleId.value = record.id
  open.value = true
  page.value.current = 1
  loading.value = true
  await loadCurrentTenantDeptIds()
  await loadAllRoleUsers()
  loading.value = false
}

function searchData() {
  page.value.current = 1
  initData()
}

function reset() {
  searchForm.value = {
    name: '',
    state: '',
  }
  page.value.current = 1
  initData()
}

function initData() {
  page.value.current = 1
  refreshUserList()
}

function onTableChange(pagination) {
  page.value.current = pagination.current
  refreshUserList()
}

async function handleUserPermission() {
  await loadAllRoleUsers()
  let modal = cModal({
    title: '选择用户',
    width: 1000,
    filePath: 'views/bdc/task/components/UserChosen',
    formData: {
      modeType: 'checkbox',
      filterKeyName: 'id',
      showTenantSelectionSummary: true,
      currentKeys: allRoleUsers.value.map(m => m.id),
    },
    footerStyle: { 'text-align': 'center' },
    onOk: async (res: any) => {
      if (res && res.selectedRow) {
        let userList = res.selectedRow.map(m => m.id)
        let isSuccess = await updateRoleByUserId(userList)
        if (isSuccess) {
          await loadAllRoleUsers()
          modal.destroy()
        }
      } else {
        message.warning('请先选择用户!')
      }
    },
    onCancel: () => {
      modal.destroy()
    }
  })
}

/**
 *  按 roleId 获取完整授权用户；
 *  目前接口不支持 不能使用当前分页数据作为保存依据
 */
function loadAllRoleUsers() {
  return new Promise<void>((resolve) => {
    defHttp.get({
      url: api.list,
      params: { roleId: currentRoleId.value, pageNo: 1, pageSize: -1 }
    }, { withToken: true }).then((res: any) => {
      allRoleUsers.value = res?.code === 200 ? (res.result?.records || []) : []
      refreshUserList()
      resolve()
    }).catch(() => {
      allRoleUsers.value = []
      refreshUserList()
      resolve()
    })
  })
}

/**
 * 获取后端已按当前登录租户过滤的部门树
 * 构造当前租户部门范围
 */
async function loadCurrentTenantDeptIds() {
  const deptTree: any = await getDeptOptions()
  currentTenantDeptIds.value = collectDeptIds(deptTree)
}

function collectDeptIds(nodes: any[], ids = new Set<string>()) {
  nodes.forEach((node) => {
    ids.add(String(node.id))
    collectDeptIds(node.children || [], ids)
  })
  return ids
}

/**
 * 从完整授权集合中仅展示当前租户范围的用户
 * 再进行前端搜索和分页
 */
function refreshUserList() {
  let records = allRoleUsers.value.filter((record: any) => {
    if (isSuperAdmin.value) return true
    return (record.deptInfoList || []).some((dept: any) => currentTenantDeptIds.value.has(String(dept.id)))
  })

  records = records.filter((record: any) => {
    const matchesName = !searchForm.value.name || record.username?.includes(searchForm.value.name)
    const enabled = record.enabled === true || record.enabled === 1 || record.enabled === '1'
    const matchesState = !searchForm.value.state || (searchForm.value.state === '1' ? enabled : !enabled)
    return matchesName && matchesState
  })

  page.value.total = records.length
  const maxPage = Math.max(1, Math.ceil(records.length / pagination.value.pageSize))
  if (page.value.current > maxPage) page.value.current = maxPage
  const start = (page.value.current - 1) * pagination.value.pageSize
  userList.value = records.slice(start, start + pagination.value.pageSize)
}

/**
 * 更新用户角色
 * @param userList
 */
function updateRoleByUserId(userList) {
  return new Promise((resolve, reject) => {
    defHttp.post({ url: api.updateRole, data: { userList: userList, roleId: currentRoleId.value } }, { withToken: true }).then((res) => {
      if (res.code == 200) {
        message.success('授权成功')
        resolve(true)
      } else {
        message.error(res.msg || '授权失败')
        resolve(false)
      }
    }).catch(err => {
      message.error(err.message || '授权失败')
      resolve(false)
    })
  })

}
</script>

<style scoped lang="less">
.sys-role-user-list-table {
  width: 100%;
  height: 100%;

  .sys-role-user-list-header {
    margin-bottom: 10px;
    padding: 0 5px;
  }
}
</style>
