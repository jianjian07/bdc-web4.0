<template>
  <div class="sys-role">
    <div class="sys-role-header">
      <div class="left-content">
        <a-form
            :model="searchFormState"
            layout="inline"
        >
          <a-form-item label="角色名称" name="name">
            <a-input v-model:value="searchFormState.name" placeholder="请输入角色名称"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary">
              <template #icon></template>
              查询
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button>
              <template #icon></template>
              重置
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleAddRole">
              <template #icon>
                <plus-outlined/>
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
        <a-alert :message="currentRole.length > 0 ? '已选中' : '未选中'" class="sys-role-table-header" show-icon type="info"/>
        <div class="sys-role-table-body">
          <a-table
              :columns="columns"
              :data-source="currentRoleList"
              :pagination="pagination"
              :row-selection="rowSelection"
              :scroll="{ y: 300 }"
              rowKey="id">
            <template #bodyCell="{ column, text, record, index }">
              <template v-if="column.dataIndex === 'index'">
                {{ index + 1 }}
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a @click="handleDept(record)">分配</a>
                <a-divider type="vertical"/>
                <a @click="handleEditRole(record)">编辑</a>
                <a-divider type="vertical"/>
                <a-popconfirm
                    cancel-text="否"
                    ok-text="是"
                    title="确定要删除该用户吗?"
                    @confirm="handleDelRole(record)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>
      </div>
      <div class="right-content">
        <a-collapse v-model:activeKey="activeCollapseKey">
          <a-collapse-panel v-for="(item,index) in sysMenuList" :key="item.id" :header="item.title">
            <a-tree
                v-model:checkedKeys="checkedKeys"
                :defaultExpandAll="false"
                :show-line="true"
                :tree-data="item.list"
                check-strictly
                checkable
            >
            </a-tree>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
    <sys-role-modal ref="roleModal"></sys-role-modal>
    <sys-role-dept-modal ref="roleDeptModal"></sys-role-dept-modal>
  </div>
</template>

<script lang="ts" setup>
import { SearchOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, ref } from "vue"
import roleList from '/@/mock/test/roleList.json'
import sysMenuList from '/@/mock/test/sysMenuDemo.json'
import SysRoleModal from "/@/views/sysmanage/modules/sysRoleModal.vue"
import SysRoleDeptModal from "/@/views/sysmanage/modules/sysRoleDeptModal.vue"


// 查询内容
let searchFormState = ref<any>({})
// 角色列表
let currentRoleList = ref<any>([])
// 当前选中的角色
let currentRole = ref<any>([])
// 角色弹窗
let roleModal = ref()
// 部门弹窗
let roleDeptModal = ref()
// 当前选中的折叠面板
let activeCollapseKey = ref<any>()
// 选中的系统菜单
let checkedKeys = ref<any>([])

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
    width: 150,
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

let page = ref<any>({
  total: 0,
  current: 1
})

const pagination = computed(() => ({
  total: page.value.total,
  current: page.value.current,
  pageSize: 10,
}))

onMounted(() => {
  initData()
})

function initData() {
  currentRoleList.value = roleList.records
  page.value.total = roleList.total
  page.value.current = roleList.current
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
function handleDelRole(record) {

}

/**
 * 部门分配
 * @param record
 */
function handleDept(record) {
  roleDeptModal.value.open(record)
}

/**
 * 根据角色获取并设置菜单权限
 * @param role
 */
function getRoleSysMenuKeys(roleId) {
  let keys = ["427", "441", "547", "568", "442", "466", "426", "420", "421", "544", "424", "418",
    "557", "423", "422", "415", "565", "567", "632", "633", "636"]
  checkedKeys.value = keys
}

/**
 * 保存
 */
function handleSave() {
  let params = {
    id: currentRole.value[0].id,
    name: currentRole.value[0].name,
    menuIds: checkedKeys.value
  }
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
