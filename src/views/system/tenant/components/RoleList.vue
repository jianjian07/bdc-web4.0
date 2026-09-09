<template>
  <div class="tenant-role-list">
    <div class="tenant-role-list-header">
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
      </a-form>
      <a-button v-if="!props.readonly" type="primary" @click="openRelateRoleModal">关联</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="filteredAssociatedRoleList"
      :loading="tableLoading"
      :pagination="tablePagination"
      row-key="id"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, index }">
        <template v-if="column.dataIndex === 'index'">
          {{ (tablePagination.current - 1) * tablePagination.pageSize + index + 1 }}
        </template>
      </template>
    </a-table>

    <relate-role-modal ref="relateRoleModalRef" :select-info="selectInfo" @saved="loadAssociatedRoleList" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import RelateRoleModal from './relateRoleModal.vue'

const props = defineProps({
  selectInfo: {
    type: Object,
    default: () => ({})
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

enum api {
  associatedRoleList = '/api/zrzy-system/sys/tenantRole/getAssociatedRoleList'
}

const searchFormState = ref({ name: '' })
const tableLoading = ref(false)
const associatedRoleList = ref<any[]>([])
const relateRoleModalRef = ref<any>()

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

const filteredAssociatedRoleList = computed(() => filterRoleList(associatedRoleList.value, searchFormState.value.name))
const tablePagination = computed(() => ({
  ...pagination.value,
  total: filteredAssociatedRoleList.value.length
}))

watch(() => props.selectInfo?.id, (tenantId) => {
  resetData()
  if (tenantId) {
    loadAssociatedRoleList()
  }
})

onMounted(() => {
  if (props.selectInfo?.id) {
    loadAssociatedRoleList()
  }
})

function filterRoleList(list: any[], name: string) {
  const keyword = name.trim().toLowerCase()
  return keyword
    ? list.filter((role) => String(role?.name || '').toLowerCase().includes(keyword))
    : list
}

function onTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

function searchData() {
  pagination.value.current = 1
}

function reset() {
  searchFormState.value.name = ''
  pagination.value.current = 1
}

function openRelateRoleModal() {
  relateRoleModalRef.value?.open()
}

/**
 * 加载当前租户已关联的角色
 */
function loadAssociatedRoleList() {
  const tenantId = props.selectInfo?.id
  if (!tenantId) return

  tableLoading.value = true
  defHttp.get({
    url: api.associatedRoleList,
    params: { tenantId }
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      associatedRoleList.value = Array.isArray(res.result) ? res.result : []
    } else {
      message.warning(res?.message || '获取已关联角色失败')
    }
  }).catch((err) => {
    console.info(err)
  }).finally(() => {
    tableLoading.value = false
  })
}

function resetData() {
  searchFormState.value.name = ''
  pagination.value.current = 1
  associatedRoleList.value = []
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
</style>
