<template>
  <div class="sys-user-table">
    <div class="sys-user-table-header">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="部门名称">
          <a-input style="width: 400px" v-model:value="searchForm.name" placeholder="请输入部门名称" />
        </a-form-item>
        <a-space>
          <a-button type="primary" @click="initData(null, false)">查询</a-button>
          <a-button @click="reset">重置</a-button>
          <!-- <a-button>导出</a-button> -->
          <a-button @click="addDept
        ">
            <template #icon><plus-outlined /></template>新增
          </a-button>
        </a-space>
      </a-form>
    </div>
    <div class="sys-user-table-body">
      <a-table :columns="columns" :data-source="deptList" @expand="onExpand" rowKey="id">
        <template  #expandIcon="{ expanded, onExpand, record }">
          <span v-if="record.hasChildren && !expanded" @click="(e) => onExpand(record, e)">
            <CaretRightOutlined style="margin-right: 5px;" />
          </span>
          <span v-else-if="record.hasChildren && expanded" @click="(e) => onExpand(record, e)">
            <CaretDownOutlined style="margin-right: 5px;" />
          </span>
          <span v-else style="padding-left: 18px;"></span>
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex == 'enabled'">
            <a-switch v-model:checked="record.enabled" checked-children="启用" un-checked-children="禁用"
              @change="changeEnabled($event, record)"/>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm :disabled="record.username == 'admin'" cancel-text="否" ok-text="是"
              @confirm="handleDel(record, index)">
              <template #title>
                <span>确认<span style="color:red">删除</span>该部门?</span>
              </template>
              <a style="color:red">删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
    <dept-modal v-if="drawerOpen" :open="drawerOpen" :title="title" :dataInfo="dataInfo" :deptListOption="deptList" @ok="ok"></dept-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue"
import { PlusOutlined, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons-vue'
import { defHttp } from "/@/utils/http/axios"
import DeptModal from "/@/views/system/department/components/deptModal.vue"
import { message } from "ant-design-vue"
let drawerOpen = ref(false)
let title = ref('')
let dataInfo = ref({})
// 查询条件
let searchForm = ref({
  name: '',
})
// 列名
const columns = [
  {
    title: '部门名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '行政区划',
    dataIndex: 'areacode',
    key: 'areacode',
  },
  {
    title: '排序',
    dataIndex: 'sortid',
    key: 'sortid',
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    key: 'enabled',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 170
  },
]

// 部门列表
let deptList = ref<any>([])

enum api {
  list = '/api/zrzy-system/sys/dept/treeLazy',
  del = '/api/zrzy-system/sys/dept/delDept',
  add = '/api/zrzy-system/sys/dept/saveDept'
}

onMounted(() => {
  initData()
})

/**
 * 加载数据
 */
function initData(record? : any, isLazy = true) {
  let params = {
    name: searchForm.value.name,
    pid: record?.id || '',
    isLazy: isLazy,
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      if (params.pid == '') {
        deptList.value = res.result
      }  else {
        record.children = res.result
      }
    } else {
      deptList.value = []
    }
  }).catch(err => {
    deptList.value = []
  })
}

/**
 * 改变状态
 * @param e
 * @param record
 */
function changeEnabled(e, record) {
  record.enabled = e
  onOk(record)
}

/**
 * 保存
 */
 function onOk(data: any) {
    // 执行保存
    let url = api.add

    defHttp.post({ url: url, data: data }, { withToken: true }).then((res) => {
      if (res && res.code == 200) {
        message.success("保存成功！")
      }
    }).catch(err => {
        console.info(err)
    })
}

function addDept() {
  drawerOpen.value = true
  title.value = "新增部门"
  dataInfo.value = {}
}
/**
 * 编辑
 * @param record
 */
function handleEdit(record) {
  drawerOpen.value = true
  title.value = "编辑部门"
  dataInfo.value = record
}

/**
 * 删除
 * @param record
 */
function handleDel(record, index) {
  defHttp.delete({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      initData()
      message.success('删除成功!')
    } else {
      message.warning('删除失败!')
    }
  }).catch(err => {
     message.warning('删除失败!')
  })
}

function onExpand(expanded, record) {
  if (record.hasChildren && !searchForm.value.name) {
    initData(record)
  }
}

/**
 * 重置
 */
function reset() {
  searchForm.value = {
    name: '',
  }
  initData()
}

function ok() {
  drawerOpen.value = false
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

  :deep(.ant-table-wrapper) {
    .ant-table-row-indent+.ant-table-row-expand-icon {
      margin-top: 0px !important;
    }
  }
}
</style>
