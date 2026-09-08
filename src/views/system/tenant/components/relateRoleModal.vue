<template>
  <a-drawer
    v-model:open="visible"
    title="关联角色"
    placement="right"
    width="900"
    :body-style="{ paddingBottom: '80px' }"
  >
    <a-form :model="searchFormState" layout="inline" class="association-search-form">
      <a-form-item label="角色名称" name="name">
        <a-input v-model:value="searchFormState.name" placeholder="请输入角色名称" @pressEnter="searchData" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="searchData">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>

    <a-alert
      :message="selectedRoleKeys.length > 0 ? `已选中 ${selectedRoleKeys.length} 条` : '未选中'"
      class="selected-role-alert"
      show-icon
      type="info"
    />
    <a-table
      :columns="columns"
      :data-source="filteredRoleList"
      :loading="tableLoading"
      :pagination="tablePagination"
      :row-selection="rowSelection"
      :custom-row="customRow"
      row-key="id"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ (tablePagination.current - 1) * tablePagination.pageSize + index + 1 }}
        </template>
      </template>
    </a-table>

    <template #footer>
      <div class="drawer-footer">
        <a-button @click="visible = false">取消</a-button>
        <a-button type="primary" :loading="confirmLoading" @click="save">确定关联</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'

const props = defineProps({
  selectInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['saved'])

enum api {
  roleList = '/api/zrzy-system/sys/tenantRole/getRoleList',
  checkedRoleIds = '/api/zrzy-system/sys/tenantRole/getRoleIdsByTenantId',
  save = '/api/zrzy-system/sys/tenantRole/saveTenantRole'
}

const visible = ref(false)
const tableLoading = ref(false)
const confirmLoading = ref(false)
const roleList = ref<any[]>([])
const selectedRoleKeys = ref<Array<string | number>>([])
const searchFormState = ref({ name: '' })
const pagination = ref({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`
})

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 80,
  },
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
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
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRoleKeys.value,
  preserveSelectedRowKeys: true,
  onChange: (selectedRowKeys: Array<string | number>) => {
    selectedRoleKeys.value = selectedRowKeys
  }
}))

function open() {
  const tenantId = props.selectInfo?.id
  if (!tenantId) {
    message.warning('请先选择租户')
    return
  }

  visible.value = true
  searchFormState.value.name = ''
  pagination.value.current = 1
  selectedRoleKeys.value = []
  loadRoleList()
  loadSelectedRoleIds(tenantId)
}

function onTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

const customRow = (record: any) => ({
  onClick: () => {
    selectedRoleKeys.value = selectedRoleKeys.value.includes(record.id)
      ? selectedRoleKeys.value.filter((id) => id !== record.id)
      : [...selectedRoleKeys.value, record.id]
  }
})

function searchData() {
  pagination.value.current = 1
}

function reset() {
  searchFormState.value.name = ''
  pagination.value.current = 1
}

/**
 * 加载全部可关联角色
 */
function loadRoleList() {
  tableLoading.value = true
  defHttp.get({ url: api.roleList }, { withToken: true }).then((res) => {
    if (res?.success) {
      roleList.value = Array.isArray(res.result) ? res.result : []
    } else {
      message.warning(res?.message || '获取角色列表失败')
    }
  }).catch((err) => {
    console.info(err)
  }).finally(() => {
    tableLoading.value = false
  })
}

/**
 * 获取当前租户的已关联角色
 */
function loadSelectedRoleIds(tenantId: string | number) {
  defHttp.get({
    url: api.checkedRoleIds,
    params: { tenantId }
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      selectedRoleKeys.value = Array.isArray(res.result) ? res.result : []
    } else {
      message.warning(res?.message || '获取已关联角色失败')
    }
  }).catch((err) => {
    console.info(err)
  })
}

function save() {
  const tenantId = props.selectInfo?.id
  if (!tenantId) return

  confirmLoading.value = true
  defHttp.post({
    url: api.save,
    params: { tenantId },
    data: selectedRoleKeys.value
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      message.success(res?.message || '角色关联成功')
      visible.value = false
      emit('saved')
    } else {
      message.warning(res?.message || '角色关联失败')
    }
  }).catch((err) => {
    console.info(err)
  }).finally(() => {
    confirmLoading.value = false
  })
}

defineExpose({
  open
})
</script>

<style scoped lang="less">
.association-search-form,
.selected-role-alert {
  margin-bottom: 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
