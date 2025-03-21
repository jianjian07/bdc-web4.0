<template>
  <div class="user-chosen">
    <div class="user-chosen-dept">
      <a-input-search
          v-model:value="searchDept"
          allow-clear
          placeholder="请输入部门名称"
          style="margin-bottom: 10px"
      />
      <a-spin :spinning="deptLoading">
        <a-tree v-if="showTree" :defaultExpandAll="false" :fieldNames="deptFieldNames" :load-data="onLoadData" :tree-data="treeData"
                showLine @select="onDeptSelect" v-model:expandedKeys="expandedKeys" :auto-expand-parent="autoExpandParent" blockNode>
          <template #switcherIcon="{ switcherCls, data, expanded }">
            <template v-if="data.children && data.children.length">
              <PlusSquareOutlined v-if="!expanded" :class="switcherCls" style="font-size: 14px; margin: 5px;"/>
              <MinusSquareOutlined v-if="expanded" :class="switcherCls" style="font-size: 14px; margin: 5px;"/>
            </template>
            <FileOutlined v-else/>
          </template>
          <template #title="node">
            <span v-if="node.name.indexOf(searchDept) > -1" style="margin-left:5px">
              {{ node.name.substr(0, node.name.indexOf(searchDept)) }}
              <span style="color: #f50">{{ searchDept }}</span>
              {{ node.name.substr(node.name.indexOf(searchDept) + searchDept.length) }}
            </span>
            <span v-else style="margin-left:5px">{{ node.name }}</span>
          </template>
        </a-tree>
      </a-spin>
    </div>
    <div class="user-chosen-user">
      <div class="user-chosen-user-table-header">
        <a-form :model="searchForm" layout="inline">
          <a-form-item label="用户名">
            <a-input v-model:value="searchForm.name" placeholder="请输入用户名"/>
          </a-form-item>
          <a-space>
            <a-button type="primary" @click="searchData">查询</a-button>
            <a-button @click="reset">重置</a-button>
          </a-space>
        </a-form>
      </div>
      <div class="user-chosen-user-table-body">
        <a-table :columns="columns" :data-source="userList" :pagination="pagination" :row-selection="rowSelection"
                 :scroll="{ y: 800 }" rowKey="id" @change="onTableChange">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex === 'deptInfoList'">
              {{ record.deptInfoList?.length > 0 ? record.deptInfoList.map(info => info.name).join(',') : '' }}
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { PlusSquareOutlined, MinusSquareOutlined, FileOutlined } from '@ant-design/icons-vue'
import { getDeptOptions } from "/@/views/bdc/public/bdc"
import { getParentId } from "/@/utils"
// 搜索部门
let searchDept = ref<string>('')
// 部门loading
let deptLoading = ref<boolean>(false)
// 是否显示部门树
let showTree = ref(true)
// 部门树
let treeData: any = ref([])
// 用户搜索
let searchForm = ref<any>({
  name: '',
  deptId: ''
})
// 用于搜索
let dataList = ref<any>([])
// 是否自动展开父节点
let autoExpandParent = ref<boolean>(false)
// 展开
let expandedKeys = ref<any>([])

const deptFieldNames = { title: 'name', key: 'id', children: 'children' }

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
    title: '手机',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '部门',
    dataIndex: 'deptInfoList',
    key: 'deptInfoList'
  }
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
// 选中的部门数据
let deptInfo = ref<any>()
// 选中的用户key
let selectedRowKeys = ref<any>([])
// 选中的用户key
let selectedRow = ref<any>()
// 列表项是否可选择
const rowSelection = computed(() => {
  return {
    type: 'radio',
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys, rows) => {
      selectedRow.value = rows
      selectedRowKeys.value = keys
    }
  }
})

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

enum api {
  list = '/api/zrzy-system/sys/v1/user/page'
}

watch(() => searchDept.value, (newVal: any) => {
  if (searchDept.value !== '') {
    const expanded = dataList.value.map((item: any) => {
      if (item.title.indexOf(newVal) > -1) {
        return getParentId(item.id, treeData.value)
      }
      return null
    }).filter((item, i, self) => item && self.indexOf(item) === i)
    expandedKeys.value = expanded
    searchDept.value = newVal
    autoExpandParent.value = true
  } else {
    autoExpandParent.value = false
  }
})

defineExpose({
  selectedRow
})

watch(() => deptInfo.value, (newVal) => {
  if (newVal && newVal.id) {
    // 根据id查询
    searchForm.value.deptId = newVal.id
    initData()
  } else {
    // 查询所有
    searchForm.value.deptId = ''
    initData()
  }
})

onMounted(() => {
  deptLoading.value = true
  onLoadData()
  initData()
})

/**
 * 加载部门树
 */
async function onLoadData() {
  treeData.value = await getDeptOptions()
  generateList(treeData.value)
  deptLoading.value = false
  showTree.value = true
}

/**
 * 初始化datalist
 * @param data
 */
function generateList(data: any) {
  for (let i = 0; i < data.length; i++) {
    const node = data[i]
    const id = node.id
    let title = node.name
    dataList.value.push({ id, title: title })
    if (node.children) {
      generateList(node.children)
    }
  }
}


/**
 * 选中部门
 * @param selectedKeys
 * @param info
 */
function onDeptSelect(selectedKeys: any, info: any) {
  if (selectedKeys.length == 0) {
    deptInfo.value = null
  } else {
    deptInfo.value = info.node.dataRef || null
  }
}

/**
 * 加载用户数据
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
      if (props.formData.currentKeys && props.formData.currentKeys.length) {
        selectedRow.value = props.formData.currentKeys.map((key) => {
          let find = userList.value.find(f => f.username == key)
          return find
        })
        selectedRowKeys.value = selectedRow.value.map(s => s?.id)
      }
    } else {
      userList.value = []
    }
  }).catch(err => {
    userList.value = []
  })
}

/**
 * 查询
 */
function searchData() {
  page.value.current = 1
  initData()
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


</script>

<style lang="less" scoped>
.user-chosen {
  padding: 10px;
  display: flex;
  height: 100%;

  .user-chosen-dept {
    min-width: 250px;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }

  .user-chosen-user {
    width: calc(100%);
    height: 100%;
    padding: 10px;

    .user-chosen-user-table-header {
      margin-bottom: 10px;
      padding: 0 5px;
    }

    .user-chosen-user-table-body {
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
        overflow: hidden !important;
      }
    }
  }
}
</style>