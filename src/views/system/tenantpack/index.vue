<template>
  <div class="tenant-pack">
    <div class="tenant-pack-header">
      <div class="left-content">
        <a-form :model="searchFormState" layout="inline">
          <a-form-item label="默认套餐名" name="packName">
            <a-input v-model:value="searchFormState.packName" placeholder="请输入默认套餐名"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="searchData">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="reset">重置</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="handleAdd">
              <template #icon>
                <plus-outlined/>
              </template>
              新增
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="right-content">
        <a-button type="primary" :disabled="!currentTenantPack || !canEditTenantPack(currentTenantPack)"
                  @click="handleSaveMenu">保存
        </a-button>
      </div>
    </div>

    <div class="tenant-pack-content">
      <div class="left-content">
        <a-alert :message="currentTenantPack ? '已选中' : '未选中'" class="tenant-pack-table-header" show-icon
                 type="info"/>
        <div class="tenant-pack-table-body">
          <a-table
              :columns="columns"
              :data-source="tenantPackList"
              :pagination="pagination"
              :row-selection="rowSelection"
              :scroll="{ y: 300 }"
              row-key="id"
              @change="onTableChange"
              :custom-row="customRow"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'packName'">
                {{ record.packName }}
                <span v-if="tenantScoped && isDefaultAutoPack(record)" class="default-pack-label">（默认产品包）</span>
              </template>
              <template v-if="column.dataIndex === 'status'">
                {{ record.status === '1' || record.status === 1 ? '开启' : '关闭' }}
              </template>
              <template v-else-if="column.dataIndex === 'operation'">
                <template v-if="canEditTenantPack(record)">
                  <a @click="handleEdit(record)">编辑</a>
                  <a-divider type="vertical"/>
                  <a-popconfirm title="确定要删除该租户套餐吗？" ok-text="确定" cancel-text="取消"
                                @confirm="handleDelete(record)">
                    <a>删除</a>
                  </a-popconfirm>
                </template>
                <a v-else @click="handleView(record)">查看</a>
              </template>
              <template v-else-if="column.dataIndex === 'index'">
                {{ index + 1 }}
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
                :disabled="!currentTenantPack || !canEditTenantPack(currentTenantPack)"
                @check="(keys) => handleTreeCheck(item.id, keys)"
            />
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>

    <tenant-pack-modal ref="tenantPackModal" @ok="handleModalOk"/>
  </div>
</template>

<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'
import TenantPackModal from './components/TenantPackModal.vue'

enum api {
  list = '/api/zrzy-system/sys/tenantPack/list',
  remove = '/api/zrzy-system/sys/tenantPack/delete',
  getAllMenu = '/api/zrzy-system/menu/getAllMenu',
  getPackMenuByPackId = '/api/zrzy-system/sys/tenantPack/getPackMenuByPackId',
  savePackMenu = '/api/zrzy-system/sys/tenantPack/savePackMenu',
}

const props = defineProps({
  tenantId: {
    type: [String, Number],
    default: undefined,
  },
  tenantScoped: {
    type: Boolean,
    default: false,
  },
})

const searchFormState = ref({ packName: '' })
const tenantPackList = ref<any[]>([])
const pagination = ref({ total: 0, current: 1, pageSize: 10 })
const selectedKeys = ref<any[]>([])
const currentTenantPack = ref<any>()
const tenantPackModal = ref()
const sysMenuList = ref<any[]>([])
const activeCollapseKey = ref<any>()
const checkedKeysMap = ref<Record<string | number, any[]>>({})
const tenantPackMenuIds = ref<any[]>([])

const columns = [
  { title: '序号', dataIndex: 'index', key: 'index', width: 80 },
  { title: '默认套餐名称', dataIndex: 'packName', key: 'packName' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '备注说明', dataIndex: 'remarks', key: 'remarks' },
  { title: '操作', dataIndex: 'operation', key: 'operation', width: 150, fixed: 'right' },
]

const rowSelection = computed(() => ({
  type: 'radio' as const,
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: any[], rows: any[]) => selectTenantPack(rows[0]),
}))

const customRow = (record: any) => ({
  onClick: () => selectTenantPack(record),
})

watch(() => props.tenantId, () => {
  if (!props.tenantScoped) return
  pagination.value.current = 1
  clearSelection()
  loadTenantPacks()
})

onMounted(() => {
  loadTenantPacks()
  loadMenu()
})

function onTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  if (!props.tenantScoped) loadTenantPacks()
}

function loadTenantPacks() {
  if (props.tenantScoped && !props.tenantId) {
    tenantPackList.value = []
    pagination.value.total = 0
    return
  }
  defHttp.get({
    url: api.list,
    params: {
      pageNo: props.tenantScoped ? 1 : pagination.value.current,
      pageSize: props.tenantScoped ? -1 : pagination.value.pageSize,
      // packName: searchFormState.value.packName,
    },
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      const records = res.result?.records || []
      tenantPackList.value = props.tenantScoped
          ? records.filter((item: any) => isVisibleForTenant(item))
          : records
      pagination.value.total = props.tenantScoped ? tenantPackList.value.length : (res.result?.total || 0)
    } else {
      message.warning(res?.message || '租户套餐查询失败')
    }
  }).catch((err) => console.info(err))
}

function isVisibleForTenant(record: any) {
  return isDefaultAutoPack(record) || String(record.tenantId) === String(props.tenantId)
}

function isDefaultAutoPack(record: any) {
  return (record.tenantId === undefined || record.tenantId === null || record.tenantId === '')
      && String(record.izSysn) === '1'
}

function canEditTenantPack(record: any) {
  return !props.tenantScoped || String(record?.tenantId) === String(props.tenantId)
}

function loadMenu() {
  defHttp.get({ url: api.getAllMenu }, { withToken: true }).then((res) => {
    if (res?.success) {
      sysMenuList.value = (res.result || []).map((item: any) => ({ ...item, id: Number(item.id) }))
      applyTenantPackMenuIds(tenantPackMenuIds.value)
      activeCollapseKey.value = sysMenuList.value.length ? sysMenuList.value[0].id : undefined
    } else {
      message.warning(res?.message || '菜单加载失败')
    }
  }).catch((err) => console.info(err))
}

function resetCheckedKeys() {
  checkedKeysMap.value = sysMenuList.value.reduce((result: Record<string | number, any[]>, item: any) => {
    result[item.id] = []
    return result
  }, {})
}

function normalizeCheckedKeysForTree(group: any, rawMenuIds: any[] = []) {
  const selectedMenuIdSet = new Set(rawMenuIds.map((id) => String(id)))
  const parentMenuIdSet = new Set<string>()
  const menuIdMap = new Map<string, any>()

  function walk(nodes: any[] = []) {
    nodes.forEach((node) => {
      const nodeId = node?.id
      const nodeKey = String(nodeId)
      const children = Array.isArray(node?.list) ? node.list : []

      if (nodeId !== undefined && nodeId !== null) {
        menuIdMap.set(nodeKey, nodeId)
      }
      if (children.length) {
        parentMenuIdSet.add(nodeKey)
        walk(children)
      }
    })
  }

  walk(group?.list || [])
  return Array.from(menuIdMap.entries())
      .filter(([menuId]) => selectedMenuIdSet.has(menuId) && !parentMenuIdSet.has(menuId))
      .map(([, menuId]) => menuId)
}

function applyTenantPackMenuIds(menuIds: any[] = []) {
  tenantPackMenuIds.value = menuIds
  checkedKeysMap.value = sysMenuList.value.reduce((result: Record<string | number, any[]>, item: any) => {
    result[item.id] = normalizeCheckedKeysForTree(item, menuIds)
    return result
  }, {})
}

function selectTenantPack(record: any) {
  if (!record) return
  selectedKeys.value = [record.id]
  currentTenantPack.value = record
  loadTenantPackMenu(record.id)
}

function getCheckedKeys(systemId: string | number) {
  return checkedKeysMap.value[systemId] || []
}

function handleTreeCheck(systemId: string | number, keys: any) {
  checkedKeysMap.value[systemId] = Array.isArray(keys) ? keys : (keys?.checked || [])
}

function loadTenantPackMenu(packId: string | number) {
  tenantPackMenuIds.value = []
  resetCheckedKeys()
  defHttp.get({ url: api.getPackMenuByPackId, params: { packId } }, { withToken: true }).then((res) => {
    if (currentTenantPack.value?.id !== packId) return
    if (res?.success) {
      const menuIds = (res.result || []).map((item: any) => item.menuId)
      applyTenantPackMenuIds(menuIds)
    } else {
      message.warning(res?.message || '套餐菜单查询失败')
    }
  }).catch((err) => console.info(err))
}

function buildSubmitMenuIds(group: any) {
  const selectedMenuIdSet = new Set(getCheckedKeys(group?.id))
  const submitMenuIdSet = new Set(getCheckedKeys(group?.id))

  function walk(nodes: any[] = [], ancestors: any[] = []) {
    nodes.forEach((node) => {
      const nodeId = node?.id
      const nextAncestors = nodeId !== undefined && nodeId !== null ? [...ancestors, nodeId] : ancestors
      const children = Array.isArray(node?.list) ? node.list : []

      if (selectedMenuIdSet.has(nodeId)) {
        ancestors.forEach((ancestorId) => submitMenuIdSet.add(ancestorId))
      }
      if (children.length) walk(children, nextAncestors)
    })
  }

  walk(group?.list || [])
  return Array.from(submitMenuIdSet).map((id) => String(id))
}

function searchData() {
  pagination.value.current = 1
  clearSelection()
  loadTenantPacks()
}

function reset() {
  searchFormState.value.packName = ''
  searchData()
}

function clearSelection() {
  selectedKeys.value = []
  currentTenantPack.value = undefined
  tenantPackMenuIds.value = []
  resetCheckedKeys()
}

function handleAdd() {
  tenantPackModal.value.add(props.tenantScoped ? props.tenantId : undefined, props.tenantScoped)
}

function handleEdit(record: any) {
  tenantPackModal.value.edit(record.id, props.tenantScoped)
}

function handleView(record: any) {
  tenantPackModal.value.view(record.id)
}

function handleDelete(record: any) {
  if (!canEditTenantPack(record)) return
  defHttp.post({ url: api.remove, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (res?.success) {
      if (currentTenantPack.value?.id === record.id) clearSelection()
      message.success('删除成功')
      loadTenantPacks()
    } else {
      message.warning(res?.message || '删除失败')
    }
  }).catch((err) => console.info(err))
}

function handleModalOk() {
  clearSelection()
  loadTenantPacks()
}

/**
 * 保存菜单
 */
function handleSaveMenu() {
  if (!currentTenantPack.value || !canEditTenantPack(currentTenantPack.value)) return
  const menuIds = Array.from(new Set(sysMenuList.value.flatMap((group: any) => buildSubmitMenuIds(group))))
  defHttp.post({
    url: api.savePackMenu,
    params: { packId: currentTenantPack.value.id },
    data: menuIds,
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      message.success('保存成功')
      tenantPackMenuIds.value = menuIds
    } else {
      message.warning(res?.message || '保存失败')
    }
  }).catch((err) => console.info(err))
}
</script>

<style lang="less" scoped>
.tenant-pack {
  width: 100%;
  height: 100%;
  padding: 10px;

  .tenant-pack-header {
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

  .tenant-pack-content {
    display: flex;
    height: calc(100% - 42px);
    overflow: auto;

    .left-content {
      width: 60%;
      height: 100%;

      .tenant-pack-table-header {
        height: 39px;
        margin-bottom: 10px;
      }

      .tenant-pack-table-body {
        height: calc(100% - 49px);

        :deep(.ant-table-body) {
          overflow-y: scroll;
          max-height: calc(100% - 50px) !important;
        }

        :deep(.ant-table-wrapper), :deep(.ant-table-container), :deep(.ant-spin-container), :deep(.ant-spin-nested-loading) {
          height: 100%;
        }

        :deep(.ant-table) {
          height: calc(100% - 50px);
        }

        :deep(.ant-spin-container) {
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

  .default-pack-label {
    color: #999;
  }
}
</style>
