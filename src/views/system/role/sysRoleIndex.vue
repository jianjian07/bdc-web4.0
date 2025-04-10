<template>
  <div class="sys-role">
    <div class="sys-role-header">
      <div class="left-content">
        <a-form :model="searchFormState" layout="inline">
          <a-form-item label="角色名称" name="name">
            <a-input v-model:value="searchFormState.name" placeholder="请输入角色名称" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="searchData">
              <template #icon></template>
              查询
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="reset">
              <template #icon></template>
              重置
            </a-button>
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
        <a-button type="primary" @click="handleSave">
          <template #icon></template>
          保存
        </a-button>
      </div>
    </div>
    <div class="sys-role-content">
      <div class="left-content">
        <a-alert :message="currentRole.length > 0 ? '已选中' : '未选中'" class="sys-role-table-header" show-icon
          type="info" />
        <div class="sys-role-table-body">
          <a-table :columns="columns" :data-source="roleList" :pagination="pagination" :row-selection="rowSelection"
            :scroll="{ y: 300 }" rowKey="id" @change="onChange($event, loadRole)">
            <template #bodyCell="{ column, text, record, index }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a @click="handleLcqx(record)" v-permission="'system:role:workflow'">流程权限</a>
                <!-- <a-divider type="vertical" />
                <a @click="handleDept(record)">分配</a> -->
                <a-divider type="vertical" />
                <a @click="handleFlcqx(record)">非流程权限</a>
                <a-divider type="vertical" />
                <a @click="handleEditRole(record)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm cancel-text="否" ok-text="是" title="确定要删除该用户吗?" @confirm="handleDelRole(record.id, index)">
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div class="right-content">
        <a-collapse v-model:activeKey="activeCollapseKey">
          <a-collapse-panel v-for="(item, index) in sysMenuList" :key="index" :header="item.title">
            <a-tree v-model:checkedKeys="checkedKeys" :fieldNames="{ children: 'list' }" :defaultExpandAll="false"
              :show-line="true" :tree-data="item.list" check-strictly checkable>
            </a-tree>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
    <sys-role-modal ref="roleModal" @ok="handleOk"></sys-role-modal>
    <sys-role-dept-modal ref="roleDeptModal"></sys-role-dept-modal>
    <sys-role-process-modal ref="roleProcessModal"></sys-role-process-modal>
  </div>
</template>

<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, ref } from "vue"
import SysRoleModal from "/@/views/system/role/components/sysRoleModal.vue"
import SysRoleDeptModal from "/@/views/system/role/components/sysRoleDeptModal.vue"
import SysRoleProcessModal from "/@/views/system/role/components/sysRoleProcessModal.vue"
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue'

enum api {
  getAllMenu = '/api/zrzy-system/menu/getAllMenu',
  getMenusByRoleId = '/api/zrzy-system/role/getMenusByRoleId',//根据角色得到配置的菜单
  saveRoleMenu = '/api/zrzy-system/role/saveRoleMenu',
  listRoleApi = '/api/zrzy-system/role/list',//角色列表
  deleteRoleApi = '/api/zrzy-system/role/removeById',//删除角色
}
let sysMenuList = ref([])
let roleList = ref([])
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})

// 查询内容
let searchFormState = ref<any>({})

// 当前选中的角色
let currentRole = ref<any>([])
// 角色弹窗
let roleModal = ref()
// 部门弹窗
let roleDeptModal = ref()
// 当前选中的折叠面板
let activeCollapseKey = ref<any>()
// 流程弹窗
let roleProcessModal = ref()

const checkedKeys = ref<any>([]);
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '角色权限',
    dataIndex: 'permission',
    key: 'permission',
  },
  {
    title: '说明',
    dataIndex: 'remark',
    key: 'remark',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    fixed: 'right',
    width: 260,
  },

]
// 列表项是否可选择
const rowSelection = ref({
  checkStrictly: false,
  type: 'radio',
  onChange: (selectedRowKeys, selectedRows) => {
    currentRole.value = selectedRows
    getRoleSysMenuKeys(selectedRowKeys[0])
  }
})

onMounted(() => {
  loadRole()
  loadMenu()
})

/**
* 分页
* @param pag
* @param callback 回调函数
*/
function onChange(pag: any, callback: any) {
  pagination.value = pag
  callback()
}

function loadMenu() {
  defHttp.get({ url: api.getAllMenu }, { withToken: true }).then((res) => {
    if (res && res.success) {
      sysMenuList.value = res.result
      activeCollapseKey.value = sysMenuList.value.length ? 0 : -1
    } else {
      message.warning(res?.message)
    }
  }).catch(err => {
    console.info(err)
  })
}

function reset() {
  pagination.value.current = 1
  searchFormState.value.name = ''
  loadRole()
}

function searchData() {
  pagination.value.current = 1
  loadRole()
}

function loadRole() {
  defHttp.get({ url: api.listRoleApi, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize, name: searchFormState.value.name } }, { withToken: true }).then((res) => {
    roleList.value = res.result.records
    pagination.value.total = res.result.total
  }).catch(err => {
    console.info(err)
  })
}

/**
 * 添加角色
 */
function handleAddRole() {
  roleModal.value.add()
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

/**
 * 部门分配
 * @param record
 */
function handleDept(record) {
  roleDeptModal.value.open(record)
}

/**
 * 流程权限
 * @param record
 */
function handleLcqx(record) {
  // 案卷类型 1登记 2补录
  roleProcessModal.value.edit(record, '1')
}

/**
 * 非流程权限
 * @param record
 */
function handleFlcqx(record) {
  // 案卷类型 1登记 2补录
  roleProcessModal.value.edit(record, '2')
}

/**
 * 根据角色获取并设置菜单权限
 * @param role
 */
function getRoleSysMenuKeys(roleId) {
  defHttp.get({ url: api.getMenusByRoleId, params: { roleId: roleId } }, { withToken: true }).then((res) => {
    checkedKeys.value = res.result
  }).catch(err => {
    console.info(err)
  })
}

/**
 * 保存
 */
function handleSave() {
  if (currentRole.value.length == 0) {
    message.error("请选择角色")
  }
  else if (checkedKeys.value.length == 0) {
    message.error("请选择菜单")
  }
  else {
    let params = {
      roleId: currentRole.value[0].id,
      // name: currentRole.value[0].name,
      menuIds: Array.isArray(checkedKeys.value) ? checkedKeys.value : checkedKeys.value.checked
    }
    defHttp.post({ url: api.saveRoleMenu, data: params }, { withToken: true }).then((res) => {
      if (res.result) {
        message.success("保存成功")
      }
    }).catch(err => {
      console.info(err)
    })
  }
}

function handleOk() {
  loadRole()
}
</script>

<style lang="less" scoped>
.sys-role {
  width: 100%;
  height: 100%;
  padding: 10px;

  .sys-role-header {
    margin-bottom: 10px;
    height: 32px;
    display: flex;

    .left-content {
      width: 60%;
    }

    .right-content {
      width: 40%;
      padding-left: 10px;
    }
  }

  .sys-role-content {
    height: calc(100% - 42px);
    overflow: auto;
    display: flex;

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

        :deep(.ant-table-wrapper) {
          height: 100%;
        }

        :deep(.ant-table) {
          height: calc(100% - 50px);
        }

        :deep(.ant-table-container) {
          height: 100%;
        }

        :deep(.ant-spin-container) {
          height: 100%;
          overflow: hidden;
        }

        :deep(.ant-spin-nested-loading) {
          height: 100%;
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
