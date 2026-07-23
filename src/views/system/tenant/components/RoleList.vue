<template>
  <div class="tenant-role-list">
    <div class="tenant-role-list-header">
      <a-form :model="searchFormState" layout="inline">
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="searchFormState.name" placeholder="请输入角色名称" @pressEnter="searchData"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="searchData">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
      <a-button type="primary" :loading="confirmLoading" @click="handleSave">保存</a-button>
    </div>
    <a-alert :message="selectedRoleKeys.length > 0 ? `已选中 ${selectedRoleKeys.length} 条` : '未选中'"
             class="tenant-role-list-alert" show-icon type="info"/>
    <a-table :columns="columns" :data-source="roleList" :loading="tableLoading" :pagination="pagination"
             :row-selection="rowSelection" rowKey="id" @change="onTableChange">
      <template #bodyCell="{ column, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const props = defineProps({
  selectInfo: {
    type: Object,
    default: () => ({})
  }
})

enum api {
  listRoleApi = '/api/zrzy-system/role/getByTenantId',
  save = '',
  checkList = ''
}

// 查询内容
let searchFormState = ref<any>({
  name: ''
})
// 表格loading
let tableLoading = ref<boolean>(false)
// 确认loading
let confirmLoading = ref<boolean>(false)
// 角色列表
let roleList = ref<any>([])
// 跨页选中的角色id
let selectedRoleKeys = ref<any>([])
// 分页
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
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

const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRoleKeys.value,
    preserveSelectedRowKeys: true,
    onChange: (selectedRowKeys) => {
      selectedRoleKeys.value = selectedRowKeys
    }
  }
})

watch(() => props.selectInfo?.id, (newVal) => {
  resetData()
  if (newVal) {
    loadRole()
    getCheckedList(newVal)
  }
})

onMounted(() => {
  if (props.selectInfo?.id) {
    loadRole()
    getCheckedList(props.selectInfo.id)
  }
})

/**
 * 表格分页
 * @param pag 分页参数
 */
function onTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadRole()
}

/**
 * 查询
 */
function searchData() {
  pagination.value.current = 1
  loadRole()
}

/**
 * 重置
 */
function reset() {
  pagination.value.current = 1
  searchFormState.value.name = ''
  loadRole()
}

/**
 * 加载角色列表
 */
function loadRole() {
  console.log('pppp',props.selectInfo)
  tableLoading.value = true
  defHttp.get({
    url: api.listRoleApi,
    params: {
      tenantId: props.selectInfo.id,
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
    }
  }, { withToken: true }).then((res) => {
    if (res && res.success) {
      roleList.value = res.result?.records || []
      pagination.value.total = res.result?.total || 0
    } else {
      message.warning(res?.message)
    }
    tableLoading.value = false
  }).catch(err => {
    console.info(err)
    tableLoading.value = false
  })
}

/**
 * 保存租户角色关联
 */
function handleSave() {
  let tenantId = props.selectInfo?.id
  let data = {
    tenantId,
    roleIds: selectedRoleKeys.value
  }

  console.log('租户角色关联保存参数:', data, api.save)
  message.info('保存接口待接入')
}

/**
 * 获取租户角色列表
 */
function getCheckedList(tenantId) {
  console.log('租户角色关联选中keys接口待接入:', tenantId, api.checkList)
  selectedRoleKeys.value = []
}

/**
 * 重置租户角色关联数据
 */
function resetData() {
  searchFormState.value.name = ''
  pagination.value.current = 1
  pagination.value.pageSize = 10
  pagination.value.total = 0
  selectedRoleKeys.value = []
  roleList.value = []
}

</script>

<style scoped lang="less">
.tenant-role-list {
  height: 100%;
  padding: 12px;
  overflow: auto;
}

.tenant-role-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.tenant-role-list-alert {
  margin-bottom: 10px;
}
</style>
