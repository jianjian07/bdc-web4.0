<template>
  <div class="sys-menu-table">
    <div class="sys-menu-no-data" v-if="!currentSysKey">
      <a-empty description="请先选择一个系统" />
    </div>
    <template v-else>
      <div class="sys-menu-table-header">
        <a-form layout="inline" :model="searchFormState">
          <a-form-item label="菜单名称" name="name">
            <a-input v-model:value="searchFormState.name" placeholder="请输入菜单名称" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="initData">
              <template #icon><search-outlined /></template>查询
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="reset">
              <template #icon><redo-outlined /></template>重置
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="sys-menu-table-content">
        <div class="sys-menu-table-title">
          <a-space>
            <a-button type="primary" @click="handleAddMenu(1)">
              <template #icon><plus-outlined /></template>新增菜单
            </a-button>
            <a-button type="primary" @click="handleAddMenu(2)">
              <template #icon><plus-outlined /></template>新增权限点
            </a-button>
            <a-button type="primary" @click="handleExpandTable">
              <template #icon><column-height-outlined /></template>展开全部
            </a-button>
            <a-button type="primary" @click="handleCollapseTable">
              <template #icon><vertical-align-middle-outlined /></template>收缩全部
            </a-button>
            <a-dropdown v-if="showMultiply">
              <template #overlay>
                <a-menu @click="handleBatchDelete">
                  <a-menu-item key="1">
                    <delete-outlined /> 删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>
                批量操作
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-space>
        </div>
        <div class="sys-menu-table-body">
          <a-table rowKey="id" :pagination="false" v-model:expandedRowKeys="expandedRowKeys" :columns="columns"
            :data-source="menuList" :row-selection="rowSelection" :scroll="{ y: 300 }" :loading="loading">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'type'">
                <a-tag color="orange" v-if="record.type == 0">
                  目录
                </a-tag>
                <a-tag color="blue" v-if="record.type == 1">
                  子菜单
                </a-tag>
                <a-tag color="red" v-if="record.type == 2">
                  权限点
                </a-tag>
                <!-- {{ record.type == 0 ? '目录' : record.type == 1 ? '菜单' : '权限点' }} -->
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a @click="handleEditMenu(record)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm title="确定要删除该菜单吗?" ok-text="是" cancel-text="否" @confirm="handleDelMenu(record)">
                  <a>删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </template>
  </div>
  <a-drawer v-model:open="drawerShow" class="custom-class" root-class-name="root-class-name"
    :root-style="{ color: 'blue' }" :title="drawerTitle + '菜单'" placement="right" width="500"
    :footer-style="{ textAlign: 'right' }" @after-open-change="afterOpenChange">
    <sys-menu-form v-if="drawerShow" ref="menuForm" :type="drawerTitle" :powerType="powerType" :tree-root="rootMenu"
      :sysId="currentSysKey" :record="currentRecord" @formOk="getFormOk">
    </sys-menu-form>
    <template #footer>
      <a-button style="margin-right: 8px" @click="handleCloseDrawer">取消</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { SearchOutlined, PlusOutlined, ColumnHeightOutlined, VerticalAlignMiddleOutlined, DownOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons-vue';
import SysMenuForm from "/@/views/system/menu/components/sysMenuForm.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
const props = defineProps({
  currentSysKey: {
    type: [String, Number],
    default: ''
  }
})

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '菜单类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    ellipsis: true
  },
  {
    title: '组件',
    dataIndex: 'component',
    key: 'component',
    ellipsis: true
  },
  {
    title: '权限标识',
    dataIndex: 'permission',
    key: 'permission',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    ellipsis: true
  },
  // {
  //   title: '排序',
  //   dataIndex: 'sortid',
  //   key: 'sortid',
  //   sorter: {
  //     compare: (a, b) => a.sortid - b.sortid,
  //   },
  // },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    fixed: 'right',
    width: 120,
  },
]
// ref实例
let menuForm = ref()
// 查询表单
let searchFormState = ref<any>({})
// 菜单
let menuList = ref<any>([])
// 上级类目
let rootMenu = ref<any>([])
// 列表项是否可选择
const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys, selectedRows) => {
    showMultiply.value = selectedRows.length > 0
    selectedKeys.value = selectedRowKeys
  }
});
// 选中的列表项
let selectedKeys = ref<any>([])

// 是否显示抽屉
let drawerShow = ref<boolean>(false)
// 抽屉标题
let drawerTitle = ref<string>('新增')
// 当前选中行数据
let currentRecord = ref<any>({})
// 表格展开项
let expandedRowKeys = ref<any>([])
// 所有父节点
let allParentKeys = ref<any>([])
// 是否显示批量操作
let showMultiply = ref<boolean>(false)
// 加载状态
let loading = ref<boolean>(false)

enum api {
  // 菜单树
  getMenuTree = '/api/zrzy-system/menu/tree',
  // 上级类目树
  getRootMenu = '/api/zrzy-system/menu/selectTreeMenuRoot',
  // 删除
  del = '/api/zrzy-system/menu/del',
  // 删除
  batchDel = '/api/zrzy-system/menu/batchRemove'
}

watch(() => props.currentSysKey, (newVal) => {
  if (newVal) {
    initData()
  }
}, {
  deep: true,
  immediate: true
})


/**
 * 获取菜单
 */
function getMenuData() {
  return new Promise((resolve) => {
    loading.value = true
    let params = {
      subsystemId: props.currentSysKey,
      name: searchFormState.value.name
    }
    defHttp.get({ url: api.getMenuTree, params: params }, { withToken: true }).then((res) => {
      if (res.code == 200) {
        resolve(res.result)
      } else {
        resolve([])
      }
      loading.value = false
    }).catch(err => {
      loading.value = false
      resolve([])
    })
  })
}

/**
 * 获取上级类目
 */
function getRootMenuData() {
  return new Promise((resolve) => {
    let sysId = props.currentSysKey
    defHttp.get({ url: api.getRootMenu, params: { subsystemId: sysId } }, { withToken: true }).then((res) => {
      if (res.code == 200) {
        resolve(res.result)
      } else {
        resolve([])
      }
    }).catch(err => {
      resolve([])
    })
  })
}

/**
 * 获取数据
 */
async function initData() {
  let menuRes = await getMenuData()
  rootMenu.value = await getRootMenuData()
  menuList.value = setMenuList(menuRes)
  allParentKeys.value = getAllParentKeys(menuList.value, [])
  // handleExpandTable()
}

/**
 * 设置children(用于展开样式)
 * @param newArr
 */
function setMenuList(newArr) {
  let newData = newArr.map(item => {
    if (item.children) {
      if (item.children.length == 0) {
        item.children = null
      } else {
        item.children = setMenuList(item.children)
      }
    }
    return item
  })
  return newData
}

/**
 * 获取所有的父节点数据
 * @param data 树形数组
 * @param arr 父节点数组
 * @returns
 */
function getAllParentKeys(data: any = [], arr: any = []) {
  data.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      arr.push(item.id)
      return getAllParentKeys(item.children, arr)
    }
  })
  return arr
}
let powerType = ref(1)
/**
 * 新增菜单
 */
function handleAddMenu(vType) {
  powerType.value = vType
  drawerShow.value = true
  currentRecord.value = null
  drawerTitle.value = '新增'
}

/**
 * 编辑菜单
 * @param record
 */
function handleEditMenu(record) {
  drawerShow.value = true
  currentRecord.value = record
  drawerTitle.value = '编辑'
}

/**
 * 删除菜单
 * @param record
 */
function handleDelMenu(record) {
  if (record.children && record.children.length > 0) {
    message.warning('删除失败,菜单含有下级不能删除')
  } else if ((record.children && record.children.length == 0) || !record.children) {
    let delUrl = api.del + '/' + record.id
    defHttp.post({ url: delUrl }, { withToken: true }).then((res) => {
      if (res.code == 200) {
        message.success('删除成功')
        initData()
      } else {
        message.error('删除失败')
      }
    })
  }
}

/**
 * 关闭抽屉
 */
function handleCloseDrawer() {
  drawerShow.value = false
}

/**
 * 抽屉确认
 */
function handleOk() {
  if (menuForm.value) {
    menuForm.value.handleOk()
  }
}

/**
 * 表单确认
 * @param value
 */
function getFormOk(value) {
  drawerShow.value = false
  initData()
}

/**
 * 切换抽屉时动画结束后的回调
 * @param bool
 */
function afterOpenChange(bool: boolean) {

}


/**
 * 展开全部
 */
function handleExpandTable() {
  expandedRowKeys.value = allParentKeys.value
}

/**
 * 收缩全部
 */
function handleCollapseTable() {
  expandedRowKeys.value = []
}

/**
 * 批量删除
 */
function handleBatchDelete() {
  let ids = selectedKeys.value.join(',')
  defHttp.post({ url: api.batchDel, data: { ids: ids } }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      message.success('删除成功')
      initData()
    } else {
      message.error('删除失败')
    }
  })
}

/**
 * 重置搜索
 */
function reset() {
  searchFormState.value.name = ''
  initData()
}


</script>

<style lang="less" scoped>
.sys-menu-table {
  width: calc(100% - 300px);
  height: 100%;
  padding: 10px;

  .sys-menu-no-data {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sys-menu-table-header {
    margin-bottom: 10px;
    height: 33px;
  }

  .sys-menu-table-content {
    height: calc(100% - 33px);

    .sys-menu-table-title {
      margin-bottom: 10px;
      height: 32px;
    }

    .sys-menu-table-body {
      height: calc(100% - 50px);
      // overflow: auto;

      :deep(.ant-table-body) {
        overflow-y: scroll;
        max-height: calc(100% - 50px) !important;
      }

      :deep(.ant-table-wrapper) {
        height: 100%;
      }

      :deep(.ant-table) {
        height: calc(100% - 70px);
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


}
</style>
