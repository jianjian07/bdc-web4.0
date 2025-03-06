<template>
  <div class="sys-user-table">
    <div class="sys-user-table-header">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="用户名">
          <a-input v-model:value="searchForm.name" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.state" placeholder="请选择状态" style="width: 180px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">正常</a-select-option>
            <a-select-option value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-space>
          <a-button type="primary" @click="initData">查询</a-button>
          <a-button @click="reset">重置</a-button>
          <!-- <a-button>导出</a-button> -->
          <a-button @click="addUser">
            <template #icon><plus-outlined /></template>新增
          </a-button>
        </a-space>
      </a-form>
    </div>
    <div class="sys-user-table-body">
      <a-table :columns="columns" :data-source="userList" :pagination="pagination" :scroll="{ y: 800 }"
        @change="onTableChange" rowKey="id">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex == 'enabled'">
            <a-switch v-model:checked="record.enabled" checked-children="启用" un-checked-children="禁用"
              @change="changeEnabled($event, record)" disabled/>
          </template>
          <template v-if="column.dataIndex == 'loginLocked'">
            <span v-if="!record.enabled" style="color:rgb(245,34,45)">已锁定</span>
            <span v-else>未锁定</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="changePSW(record)">修改密码</a>
            <a-divider type="vertical" />
            <a-popconfirm :disabled="record.username == 'admin'" cancel-text="否" ok-text="是"
              @confirm="handleDel(record, index)">
              <template #title>
                <span>确认<span style="color:red">删除</span>该用户?</span>
              </template>
              <a v-if="record.username == 'admin'" disabled>删除</a>
              <a v-else>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
    <user-modal v-if="drawerOpen" :open="drawerOpen" :title="title" :dataInfo="dataInfo" :roleListOption="roleList" @ok="ok"></user-modal>
    <change-password v-if="passwordOpen" :open="passwordOpen" :title="passwordTitle" :dataInfo="dataInfo" @ok="ok"></change-password>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { PlusOutlined } from '@ant-design/icons-vue'
import { defHttp } from "/@/utils/http/axios"
import UserModal from "/@/views/system/user/components/UserModal.vue"
import changePassword from "/@/views/system/user/components/changePassword.vue"
import { message } from "ant-design-vue"
let drawerOpen = ref(false)
let passwordOpen = ref(false)
let title = ref('')
let passwordTitle = ref('')
let dataInfo = ref({})
// 查询条件
let searchForm = ref({
  name: '',
  state: '',
  deptId: ''
})
// 列名
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
    dataIndex: 'enabled',
    key: 'enabled',
  },
  {
    title: '是否锁定',
    dataIndex: 'loginLocked',
    key: 'loginLocked',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 180
  },
]

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
// 用户列表
let userList = ref<any>([])
// 角色列表
let roleList = ref<any>([])

const props = defineProps({
  deptInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

watch(() => props.deptInfo, (newVal) => {
  console.log('props.deptInfo', newVal)
  if (newVal && newVal.id) {
    // 根据id查询
    console.log("根据id查询", newVal.id)
    searchForm.value.deptId = newVal.id
    initData()
  } else {
    // 查询所有
    console.log("查询所有")
    searchForm.value.deptId = ''
    initData()
  }
})

enum api {
  list = '/api/zrzy-system/sys/v1/user/page',
  del = '/api/zrzy-system/sys/v1/user/delete',
  roleList = '/api/zrzy-system/role/list'
}

onMounted(() => {
  initRoleList()
  initData()
})

/**
 * 加载数据
 */
function initData() {
  let params = {
    userName: searchForm.value.name,
    enabled: searchForm.value.state,
    deptId: searchForm.value.deptId,
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
  }).catch(err => {
    userList.value = []
  })
}

/**
 * 加载角色列表
 */
function initRoleList() {
  defHttp.get({ url: api.roleList, params: { pageNo: 1, pageSize: -1 } }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      roleList.value = res.result.records
    } else {
      message.warning('加载角色列表出错')
    }
  })
}

/**
 * 改变状态
 * @param e
 * @param record
 */
function changeEnabled(e, record) {

}
function addUser() {
  drawerOpen.value = true
  title.value = "新增用户"
  dataInfo.value = {
    deptList: props.deptInfo.id ? [props.deptInfo.id] : [],
  }
}
/**
 * 编辑
 * @param record
 */
function handleEdit(record) {
  drawerOpen.value = true
  title.value = "编辑用户"
  dataInfo.value = record
  console.log(dataInfo.value)
}

/**
 * 删除
 * @param record
 */
function handleDel(record, index) {
  defHttp.post({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      userList.value.splice(index, 1)
      message.success('删除成功!')
    } else {
      message.warning('删除失败!')
    }
  }).catch(err => {
     message.warning('删除失败!')
  })
}

function changePSW(record) {
  passwordOpen.value = true
  dataInfo.value = record
  console.log(record)
  passwordTitle.value = `用户【${record.realName}】修改密码`
}

/**
 * 表格变化
 * @param pagination
 * @param filters
 * @param sorter
 * @param currentDataSource
 */
function onTableChange(pagination, filters, sorter, { currentDataSource }) {
  page.value.current = pagination.current
  page.value.total = pagination.total
  initData()
}

/**
 * 重置
 */
function reset() {
  searchForm.value = {
    name: '',
    state: ''
  }
  page.value.current = 1
  initData()
}
function ok() {
  drawerOpen.value = false
  passwordOpen.value = false
  initData()
}
</script>

<style lang="less" scoped>
.sys-user-table {
  width: calc(100%);
  height: 100%;
  padding: 10px;

  .sys-user-table-header {
    margin-bottom: 10px;
    padding: 0 5px;
  }

  .sys-user-table-body {
    height: calc(100% - 50px);

    :deep(.ant-table-wrapper) {
      height: 100%;

      .ant-table {
        height: calc(100% - 60px);

        .ant-table-container {
          height: 100%;


          .ant-table-body {
            height: calc(100% - 60px);
          }
        }
      }
    }
    
    :deep(.ant-spin-container) {
      overflow: hidden!important;
    }
  }
}
</style>
