<template>
  <div class="sys-menu-tree">
    <div class="sys-menu-tree-header">
      <!-- <div class="left">系统设置</div> -->
      <div class="right" style="width: 100%;text-align: right;">
        <a-space :size="4">
          <a-button type="primary" @click="addSysMenu">
            <template #icon><plus-outlined /></template>
            新增
          </a-button>
          <a-button @click="handleExportJson" :disabled="!selectedKeys?.length">
            <template #icon>
              <ExportOutlined />
            </template>
            导出
          </a-button>
          <a-upload v-model:file-list="fileList" :max-count="1" :showUploadList="false"
            :customRequest="handleImportJson" accept=".json" style="margin: auto 2px;">
            <a-button :disabled="!selectedKeys?.length">
              <template #icon>
                <UploadOutlined />
              </template>
              导入
            </a-button>
          </a-upload>
        </a-space>
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
            <a-input-number v-model:value="formState.sortid" :min="1" :step="1" />
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
import { PlusOutlined, ApartmentOutlined, EditOutlined, DeleteOutlined, ExportOutlined, UploadOutlined } from '@ant-design/icons-vue';
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
// 导入文件列表
let fileList = ref<any>([])

const emit = defineEmits(['update:currentSysKey'])

enum api {
  list = '/api/zrzy-system/sys/sysSubsystem/list',
  add = '/api/zrzy-system/sys/sysSubsystem/add',
  edit = '/api/zrzy-system/sys/sysSubsystem/edit',
  delete = '/api/zrzy-system/sys/sysSubsystem/delete',
  exportJson = '/api/zrzy-system/menu/exportJson',
  importJson = '/api/zrzy-system/menu/importJson'
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
      message.warning(res?.message)
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
  // 先查询该系统下是否有菜单
  defHttp.get(
    { url: '/api/zrzy-system/menu/tree', params: { systemId: node.id } },
    { withToken: true }
  ).then((res: any) => {
    if (res?.code == 200 && res.result && res.result.length > 0) {
      message.warning('该系统下存在菜单，不允许删除')
      return
    }
    // 无菜单，执行删除
    defHttp.post(
      { url: api.delete, params: { id: node.id } },
      { withToken: true }
    ).then((res: any) => {
      if (res?.success || res?.code == 200) {
        message.success('删除成功')
        initSysMenu()
      } else {
        message.error(res?.message || '删除失败')
      }
    }).catch((err: any) => {
      console.error(err)
      message.error('删除失败')
    })
  }).catch((err: any) => {
    console.error(err)
    message.error('删除失败')
  })
}

/**
 * 对话框确定
 */
function handleModalOk() {
  confirmLoading.value = true
  const url = modalTitle.value === '新增' ? api.add : api.edit
  defHttp.post(
    { url, data: formState.value },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success || res?.code == 200) {
      message.success(modalTitle.value + '成功')
      modalVisible.value = false
      initSysMenu()
    } else {
      message.error(res?.message || modalTitle.value + '失败')
    }
  }).catch((err: any) => {
    console.error(err)
    message.error(modalTitle.value + '失败')
  }).finally(() => {
    confirmLoading.value = false
  })
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

/**
 * 导出菜单JSON
 */
function handleExportJson() {
  if (!selectedKeys.value?.length) {
    message.warning('请先选择一个系统')
    return
  }
  const systemId = selectedKeys.value[0]
  defHttp.get(
    { url: api.exportJson, params: { systemId }, responseType: 'blob' },
    { withToken: true }
  ).then((res: any) => {
    const now = new Date()
    const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    const fileName = `菜单数据_${timeStr}.json`
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(res)
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(link.href)
    message.success('导出成功')
  }).catch((err: any) => {
    console.error(err)
    message.error('导出失败')
  })
}

/**
 * 导入菜单JSON
 */
function handleImportJson(options: any) {
  if (!selectedKeys.value?.length) {
    message.warning('请先选择一个系统')
    return
  }
  const { file } = options
  const systemId = selectedKeys.value[0]
  const fileData = new FormData()
  fileData.append('file', file)
  defHttp.post(
    {
      url: api.importJson,
      data: fileData,
      params: { systemId },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
    { withToken: true }
  ).then((res: any) => {
    if (res.success) {
      message.success('导入成功')
      emit('update:currentSysKey', systemId)
    } else {
      message.error(res.message || '导入失败')
    }
  }).catch((err: any) => {
    console.error(err)
    message.error('导入失败')
  }).finally(() => {
    fileList.value = []
  })
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
