<template>
  <div class="sys-menu-tree">
    <div class="sys-menu-tree-header">
      <div class="left">系统设置</div>
      <div class="right">
        <a-button type="primary" @click="addSysMenu">
          <template #icon><plus-outlined /></template>
          新增
        </a-button>
      </div>
    </div>
    <div class="sys-menu-tree-content">
      <a-tree v-model:selectedKeys="selectedKeys" :tree-data="sysMenu" :blockNode="true" @select="handleSelectTreeItem"
        :fieldNames="{ key: 'id' }">
        <template #title="node">
          <div class="sys-menu-tree-title">
            <div class="title">{{ node.name }}</div>
            <div v-if="selectedKeys?.includes(node.id)" class="tool">
              <a-space :size="4">
                <a-button type="primary" shape="circle" size="small" @click="handleDept(node)">
                  <template #icon><apartment-outlined /></template>
                </a-button>
                <a-button type="primary" shape="circle" size="small" @click="editSysMenu(node)">
                  <template #icon><edit-outlined /></template>
                </a-button>
                <a-popconfirm title="确定要删除该系统吗?" ok-text="是" cancel-text="否" @confirm="delSysMenu(node)">
                  <a-button type="primary" shape="circle" size="small">
                    <template #icon><delete-outlined /></template>
                  </a-button>
                </a-popconfirm>
              </a-space>
            </div>
            <div v-else style="width: 110px"></div>
          </div>
        </template>
      </a-tree>
    </div>
    <a-modal v-model:open="modalVisible" :title="modalTitle" :confirm-loading="confirmLoading" @ok="handleModalOk">
      <template v-if="modalTitle !== '部门管理'">
        <a-form :model="formState" name="basic" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" autocomplete="off">
          <a-form-item label="系统名称" name="title" :rules="[{ required: true, message: '请输入系统名称!' }]">
            <a-input v-model:value="formState.name" />
          </a-form-item>
          <a-form-item label="排序" name="sortid" :rules="[{ required: true, message: '请输入排序!' }]">
            <a-input v-model:value="formState.sortid" />
          </a-form-item>
        </a-form>
      </template>
      <template v-else>
        <a-tree v-model:checkedKeys="deptCheckedKeys" checkable check-strictly :tree-data="dept" :show-line="true"
          :defaultExpandAll="false">
        </a-tree>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { PlusOutlined, ApartmentOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { onMounted, ref } from "vue"
import dept from '/@/mock/test/department.json'
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
let sysMenu = ref<any>([])

// 选中的keys
let selectedKeys = ref<any>()
// 部门选中
let deptCheckedKeys = ref<any>()
// 对话框是否可见
let modalVisible = ref<boolean>(false)
// 对话框标题
let modalTitle = ref<string>('新增')
// 对话框缓冲
let confirmLoading = ref<boolean>(false)
// 表单数据
let formState = ref<any>({})

const emit = defineEmits(['update:currentSysKey'])

enum api {
  list = '/api/zrzy-system/sys/sysSubsystem/list'
}

onMounted(() => {
  initSysMenu()
})

/**
 * 初始化加载系统菜单
 */
function initSysMenu() {
  defHttp.get(
    {
      url: api.list,
      params: { pageSize: 1000, pageNo: 1, column: 'sortid', order: 'asc' }
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      sysMenu.value = res.result.records
    } else {
      message.warning(res.message)
    }
    if (sysMenu.value && sysMenu.value.length > 0) {
      selectedKeys.value = [sysMenu.value[0].id]
      emit('update:currentSysKey', selectedKeys.value[0])
    }
  })
}

/**
 * 添加系统菜单
 */
function addSysMenu() {
  modalVisible.value = true
  modalTitle.value = '新增'
  formState.value = {}
}

/**
 * 点击树节点触发
 * @param selectedKeys
 * @param e
 */
function handleSelectTreeItem(selectedKey, e) {
  selectedKeys.value = [e.node.dataRef.id]
  emit('update:currentSysKey', e.node.dataRef.id)
}

/**
 * 编辑系统
 * @param item
 */
function editSysMenu(item) {
  modalVisible.value = true
  modalTitle.value = '编辑'
  formState.value = item.dataRef
}

/**
 * 删除系统
 * @param node
 */
function delSysMenu(node) {

}

/**
 * 对话框确定
 */
function handleModalOk() {
  modalVisible.value = false
}

/**
 * 部门管理
 */
function handleDept() {
  //menu/deptTree
  modalVisible.value = true
  modalTitle.value = '部门管理'
  deptCheckedKeys.value = ['24']
}

</script>

<style lang="less" scoped>
.sys-menu-tree {
  width: 300px;
  height: 100%;
  padding: 10px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-flow: column;
  overflow: auto;

  .sys-menu-tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .left {
      // font-size: 16px;
      font-weight: bold;
    }
  }

  .sys-menu-tree-content {

    .sys-menu-tree-title {
      // font-size: 14px;
      padding: 5px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

  }

  :deep(.ant-btn-circle) {
    border-radius: 50%;
  }
}
</style>
