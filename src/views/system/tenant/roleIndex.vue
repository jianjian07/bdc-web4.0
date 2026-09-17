<template>
  <div v-if="tenantId" class="sys-role">
    <div class="sys-role-header">
      <div class="left-content">
        <a-form :model="searchFormState" layout="inline">
          <a-form-item label="角色名称" name="name">
            <a-input v-model:value="searchFormState.name" placeholder="请输入角色名称" @pressEnter="searchData" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="searchData">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="reset">重置</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleAddRole">
              <template #icon>
                <plus-outlined />
              </template>
              新增
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="right-content">
        <a-button type="primary" :disabled="!canManageCurrentRole" @click="handleSave">保存</a-button>
      </div>
    </div>

    <div class="sys-role-content">
      <div class="left-content">
        <a-alert :message="currentRole.length ? '已选中' : '未选中'" class="sys-role-table-header" show-icon type="info" />
        <div class="sys-role-table-body">
          <a-table
            :columns="columns"
            :data-source="filteredRoleList"
            :loading="tableLoading"
            :pagination="tablePagination"
            :row-selection="rowSelection"
            :scroll="{ y: 300 }"
            :custom-row="customRow"
            row-key="id"
            @change="onTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'index'">
                {{ (tablePagination.current - 1) * tablePagination.pageSize + index + 1 }}
              </template>
              <template v-else-if="column.dataIndex === 'operation'">
                <a @click.stop="handleUser(record)">用户</a>
                <template v-if="canManageRole(record)">
                  <a-divider type="vertical" />
                  <a @click.stop="handleProcessPermission(record)">流程权限</a>
                  <a-divider type="vertical" />
                  <a @click="handleEditRole(record)">编辑</a>
                  <a-divider type="vertical" />
                  <a-popconfirm cancel-text="否" ok-text="是" title="确定要删除该用户吗?"
                    @confirm="handleDelRole(record.id, index)">
                    <a>删除</a>
                  </a-popconfirm>
                </template>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <div class="right-content">
        <a-collapse v-model:activeKey="activeCollapseKey">
          <a-collapse-panel v-for="item in sysMenuList" :key="item.id" :header="item.title">
            <a-tree
              :checked-keys="getCheckedKeys(item.id)"
              :field-names="{ children: 'list' }"
              :default-expand-all="false"
              :show-line="true"
              :tree-data="item.list"
              checkable
              :disabled="!canManageCurrentRole"
              @check="(keys) => handleTreeCheck(item.id, keys)"
            />
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>

    <sys-role-modal ref="roleModal" :tenant-id="tenantId" @ok="loadRoleList" />
    <sys-role-process-modal ref="roleProcessModal" :tenant-id="tenantId" />
    <sys-role-user-list ref="roleUserListDrawer" />
  </div>
  <a-empty v-else description="当前用户非租户" />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'
import { useUserStore } from '/@/store/modules/user'
import SysRoleModal from '/@/views/system/role/components/sysRoleModal.vue'
import SysRoleProcessModal from '/@/views/system/role/components/sysRoleProcessModal.vue'
import SysRoleUserList from '/@/views/system/role/components/sysRoleUserList.vue'
import { PlusOutlined } from "@ant-design/icons-vue"

enum api {
  tenantRoleList = '/api/zrzy-system/sys/tenantRole/getTenantRoleList',
  tenantAdminMenu = '/api/zrzy-system/menu/getTenantAdminMenu',
  getMenusByRoleId = '/api/zrzy-system/role/getMenusByRoleId',
  saveRoleMenu = '/api/zrzy-system/role/saveRoleMenu',
  deleteRoleApi = '/api/zrzy-system/role/removeById'
}

const userStore = useUserStore()
const tenantId = computed(() => userStore.getTenant)
const sysMenuList = ref<any[]>([])
const roleList = ref<any[]>([])
const tableLoading = ref(false)
const searchFormState = ref({ name: '' })
const currentRole = ref<any[]>([])
const selectedKeys = ref<Array<string | number>>([])
const roleMenuList = ref<any[]>([])
const checkedKeysMap = ref<Record<string | number, any[]>>({})
const activeCollapseKey = ref<any>()
const roleProcessModal = ref<any>()
const roleUserListDrawer = ref<any>()
const roleModal = ref<any>()
const pagination = ref({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 60 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '角色权限', dataIndex: 'permission', key: 'permission' },
  { title: '说明', dataIndex: 'remark', key: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', dataIndex: 'operation', key: 'operation', fixed: 'right', width: 200 }
]

const filteredRoleList = computed(() => {
  const keyword = searchFormState.value.name.trim().toLowerCase()
  return keyword
    ? roleList.value.filter((role) => String(role?.name || '').toLowerCase().includes(keyword))
    : roleList.value
})
const tablePagination = computed(() => ({
  ...pagination.value,
  total: filteredRoleList.value.length
}))
const canManageCurrentRole = computed(() => canManageRole(currentRole.value[0]))
const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  type: 'radio' as const,
  onChange: (selectedRowKeys: Array<string | number>, selectedRows: any[]) => {
    selectedKeys.value = selectedRowKeys
    currentRole.value = selectedRows
    getRoleSysMenuKeys(selectedRowKeys[0])
  }
}))

watch(tenantId, (value) => {
  resetRoleSelection()
  roleList.value = []
  if (value) {
    loadRoleList()
    loadMenu()
  }
}, { immediate: true })

function onTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

function customRow(record: any) {
  return {
    style: { cursor: 'pointer' },
    onClick: () => selectRole(record)
  }
}

function selectRole(record: any) {
  selectedKeys.value = [record.id]
  currentRole.value = [record]
  getRoleSysMenuKeys(record.id)
}

/**
 * 当前租户仅可管理自己创建的角色
 */
function canManageRole(record: any) {
  return Boolean(tenantId.value) && String(record?.tenantId) === String(tenantId.value)
}

function searchData() {
  pagination.value.current = 1
  loadRoleList()
}

function reset() {
  searchFormState.value.name = ''
  pagination.value.current = 1
  loadRoleList()
}

function handleAddRole() {
  roleModal.value?.add()
}

function loadRoleList() {
  if (!tenantId.value) return

  tableLoading.value = true
  defHttp.get({
    url: api.tenantRoleList,
    params: { tenantId: tenantId.value }
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      roleList.value = Array.isArray(res.result?.allRoles) ? res.result.allRoles : []
    } else {
      message.warning(res?.message || '获取租户角色失败')
    }
  }).catch((err) => {
    console.info(err)
  }).finally(() => {
    tableLoading.value = false
  })
}

function loadMenu() {
  if (!tenantId.value) return

  defHttp.get({ url: api.tenantAdminMenu }, { withToken: true }).then((res) => {
    if (res?.success) {
      sysMenuList.value = (Array.isArray(res.result) ? res.result : []).map((item: any) => ({
        ...item,
        id: Number(item.id)
      }))
      initCheckedKeysMap(sysMenuList.value)
      applyRoleMenuList(roleMenuList.value)
      activeCollapseKey.value = sysMenuList.value.length ? sysMenuList.value[0].id : undefined
    } else {
      message.warning(res?.message || '获取租户菜单失败')
    }
  }).catch((err) => {
    console.info(err)
  })
}

function handleUser(record: any) {
  roleUserListDrawer.value?.edit(record)
}

function handleProcessPermission(record: any) {
  roleProcessModal.value?.edit(record, '1', !canManageRole(record))
}

/**
 * 编辑角色
 * @param record
 */
function handleEditRole(record) {
  roleModal.value.edit(record)
}

/**
 * 删除角色
 * @param record
 */
function handleDelRole(id: number, index: number) {
  defHttp.post({ url: api.deleteRoleApi, params: { id: id } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      roleList.value.splice(index, 1)
      message.success('删除成功')
    } else {
      message.warning('删除失败')
    }
  }).catch(err => {
    console.info(err)
  })
}

function getRawCheckedKeys(keys: any) {
  return Array.isArray(keys) ? keys : (keys?.checked || [])
}

function getCheckedKeys(systemId: string | number) {
  return checkedKeysMap.value[systemId] || []
}

function handleTreeCheck(systemId: string | number, keys: any) {
  if (!canManageCurrentRole.value) return
  checkedKeysMap.value[systemId] = getRawCheckedKeys(keys)
}

function buildSubmitMenuIds(group: any) {
  const rawCheckedKeys = getCheckedKeys(group?.id)
  const selectedSet = new Set(rawCheckedKeys)
  const resultSet = new Set(rawCheckedKeys)

  function walk(nodes: any[] = [], ancestors: any[] = []) {
    nodes.forEach((node) => {
      const nodeId = node?.id
      const nextAncestors = nodeId !== undefined ? [...ancestors, nodeId] : ancestors
      const children = Array.isArray(node?.list) ? node.list : []

      if (selectedSet.has(nodeId)) {
        ancestors.forEach((ancestorId) => resultSet.add(ancestorId))
      }
      if (children.length) {
        walk(children, nextAncestors)
      }
    })
  }

  walk(group?.list || [])
  return Array.from(resultSet)
}

function buildSubmitMenuList() {
  return sysMenuList.value.map((group: any) => ({
    systemId: group.id,
    menuIds: buildSubmitMenuIds(group)
  }))
}

function normalizeCheckedKeysForTree(group: any, rawKeys: any[] = []) {
  const parentNodeIdSet = new Set<any>()

  function walk(nodes: any[] = []) {
    nodes.forEach((node) => {
      const children = Array.isArray(node?.list) ? node.list : []
      if (children.length) {
        parentNodeIdSet.add(node?.id)
        walk(children)
      }
    })
  }

  walk(group?.list || [])
  return rawKeys.filter((id) => !parentNodeIdSet.has(id))
}

function initCheckedKeysMap(menuList: any[] = []) {
  const nextCheckedKeysMap: Record<string | number, any[]> = {}
  menuList.forEach((group: any) => {
    nextCheckedKeysMap[group.id] = checkedKeysMap.value[group.id] || []
  })
  checkedKeysMap.value = nextCheckedKeysMap
}

function applyRoleMenuList(menuList: any[] = []) {
  const roleMenuMap = new Map(menuList.map((item: any) => [item.systemId, item.menuIds || []]))
  const nextCheckedKeysMap: Record<string | number, any[]> = {}

  sysMenuList.value.forEach((group: any) => {
    nextCheckedKeysMap[group.id] = normalizeCheckedKeysForTree(group, roleMenuMap.get(group.id) || [])
  })
  checkedKeysMap.value = nextCheckedKeysMap
}

function getRoleSysMenuKeys(roleId: string | number) {
  if (!roleId) return

  defHttp.get({
    url: api.getMenusByRoleId,
    params: { roleId }
  }, { withToken: true }).then((res) => {
    roleMenuList.value = res?.result || []
    applyRoleMenuList(roleMenuList.value)
  }).catch((err) => {
    console.info(err)
  })
}

/**
 * 保存
 */
function handleSave() {
  if (!canManageCurrentRole.value) {
    message.error('请选择角色')
    return
  }

  defHttp.post({
    url: api.saveRoleMenu,
    data: {
      roleId: currentRole.value[0].id,
      menuList: buildSubmitMenuList()
    }
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      message.success('保存成功')
    } else {
      message.warning(res?.message || '保存失败')
    }
  }).catch((err) => {
    console.info(err)
  })
}

function resetRoleSelection() {
  searchFormState.value.name = ''
  pagination.value.current = 1
  currentRole.value = []
  selectedKeys.value = []
  roleMenuList.value = []
  checkedKeysMap.value = {}
}
</script>

<style lang="less" scoped>
.sys-role {
  width: 100%;
  height: 100%;
  padding: 10px;

  .sys-role-header {
    display: flex;
    height: 32px;
    margin-bottom: 10px;

    .left-content {
      width: 60%;
    }

    .right-content {
      width: 40%;
      padding-left: 10px;
    }
  }

  .sys-role-content {
    display: flex;
    height: calc(100% - 42px);
    overflow: auto;

    .left-content {
      width: 60%;
      height: 100%;

      .sys-role-table-header {
        height: 39px;
        margin-bottom: 10px;
      }

      .sys-role-table-body {
        height: calc(100% - 49px);

        :deep(.ant-table-body) {
          overflow-y: scroll;
          max-height: calc(100% - 50px) !important;
        }

        :deep(.ant-table-wrapper),
        :deep(.ant-table-container),
        :deep(.ant-spin-nested-loading) {
          height: 100%;
        }

        :deep(.ant-table) {
          height: calc(100% - 50px);
        }

        :deep(.ant-spin-container) {
          height: 100%;
          overflow: hidden;
        }
      }
    }

    .right-content {
      width: 40%;
      height: 100%;
      padding-left: 10px;
      overflow: auto;
    }
  }
}
</style>
