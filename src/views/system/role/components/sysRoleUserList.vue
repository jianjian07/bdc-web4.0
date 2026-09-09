<template>
  <a-drawer
    v-model:open="open"
    title="角色用户"
    placement="right"
    width="45%"
  >
    <div class="sys-role-user-list-table">
      <div class="sys-role-user-list-header">
        <a-form :model="searchForm" layout="inline">
          <a-form-item label="用户名">
            <a-input v-model:value="searchForm.name" placeholder="请输入用户名" />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="searchForm.state" placeholder="请选择状态" style="width: 80px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">正常</a-select-option>
              <a-select-option value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
           <a-space>
            <a-button type="primary" @click="searchData">查询</a-button>
            <a-button @click="reset">重置</a-button>
          </a-space>
        </a-form>
      </div>
      <div class="sys-role-user-list-content">
        <a-button v-if="!readonly" type="primary" @click="handleUserPermission" style="margin-bottom: 10px">授权用户</a-button>
        <a-table :columns="columns" :data-source="userList" :pagination="pagination"
          @change="onTableChange" rowKey="id" bordered :loading="loading">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex == 'loginLocked'">
              <span v-if="!record.enabled" style="color:rgb(245,34,45)">已锁定</span>
              <span v-else>未锁定</span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { cModal } from "/@/components/cModal/index.ts"
import { message } from "ant-design-vue"

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false
  }
})

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '姓名',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
  },
  {
    title: '状态',
    dataIndex: 'loginLocked',
    key: 'loginLocked',
  }
]
let open = ref<boolean>(false)
let readonly = ref<boolean>(props.readonly)

// 查询条件
let searchForm = ref<any>({
  name: '',
  state: '',
})

// 当前角色id
let currentRoleId = ref<string>('')
// 当前角色用户列表
let userList = ref<any>([])
let loading = ref(false)

let page = ref<any>({
  total: 0,
  current: 1
})
// 分页
const pagination = computed(() => ({
  total: page.value.total,
  current: page.value.current,
  pageSize: 10,
}))

defineExpose({
  edit
})

enum api {
  list = '/api/zrzy-system/sys/v1/user/page',
  updateRole = '/api/zrzy-system/sys/v1/user/updateRoleByUserId'
}

function edit(record, readonlyMode = props.readonly) {
  readonly.value = readonlyMode
  currentRoleId.value = record.id
  open.value = true
  initData()
}

function searchData() {
  page.value.current = 1
  initData()
}

function reset() {
  searchForm.value = {
    name: '',
    state: '',
  }
  page.value.current = 1
  initData()
}

function initData() {
  loading.value = true
  let params = {
    userName: searchForm.value.name,
    enabled: searchForm.value.state,
    roleId: currentRoleId.value,
    pageNo: page.value.current,
    pageSize: pagination.value.pageSize
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      userList.value = res.result.records.map((record) => {
        record.roleList = record.roleList || []
        return record
      })
      page.value.current = res.result.current
      page.value.total = res.result.total
    } else {
      userList.value = []
    }
    loading.value = false
  }).catch(err => {
    userList.value = []
    loading.value = false
  })
}

function onTableChange(pagination) {
  page.value.current = pagination.current
  initData()
}

function handleUserPermission() {
  let modal = cModal({
    title: '选择用户',
    width: 1000,
    filePath: 'views/bdc/task/components/UserChosen',
    formData: {
      modeType: 'checkbox',
      filterKeyName: 'id',
      currentKeys: userList.value && userList.value.length ? userList.value.map(m => m.id) : [],
    },
    footerStyle: { 'text-align': 'center' },
    onOk: async (res: any) => {
      if (res && res.selectedRow) {
        let userList = res.selectedRow.map(m => m.id)
        let isSuccess = await updateRoleByUserId(userList)
        if (isSuccess) {
          initData()
          modal.destroy()
        }
      } else {
        message.warning('请先选择用户!')
      }
    },
    onCancel: () => {
      modal.destroy()
    }
  })
}

/**
 * 更新用户角色
 * @param userList
 */
function updateRoleByUserId(userList) {
  return new Promise((resolve, reject) => {
    defHttp.post({ url: api.updateRole, data: { userList: userList, roleId: currentRoleId.value } }, { withToken: true }).then((res) => {
      if (res.code == 200) {
        message.success('授权成功')
        resolve(true)
      } else {
        message.error(res.msg || '授权失败')
        resolve(false)
      }
    }).catch(err => {
      message.error(err.message || '授权失败')
      resolve(false)
    })
  })

}
</script>

<style scoped lang="less">
.sys-role-user-list-table {
  width: 100%;
  height: 100%;

  .sys-role-user-list-header {
    margin-bottom: 10px;
    padding: 0 5px;
  }
}
</style>
