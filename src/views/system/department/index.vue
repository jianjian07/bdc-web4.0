<template>
  <div class="sys-user-table">
    <div class="sys-user-table-header">
      <a-form :model="searchForm" layout="inline">
        <a-form-item label="部门名称">
          <a-input style="width: 400px" v-model:value="searchForm.name" placeholder="请输入部门名称" />
        </a-form-item>
        <a-space>
          <a-button type="primary" @click="onSearch">查询</a-button>
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
      <a-spin :spinning="loading">
        <a-table v-if="showTable" :columns="columns" :data-source="deptList" @expand="onExpand" :auto-expand-parent="false" rowKey="id" 
                 :pagination="false" :scroll="{ y: 300 }">
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
      </a-spin>
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
let loading = ref(false)
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
let showTable = ref(true)

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
  loading.value = true
  if(!record) {
    deptList.value = []
  }
  let params = {
    name: searchForm.value.name,
    pid: record?.id || '',
    isLazy: isLazy,
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
    if (res.code == 200) {
      if (params.pid == '') {
        deptList.value = res.result
      }  else if (isLazy) { // 只有懒加载时才更新子节点
        record.children = res.result
      }
    } else {
      deptList.value = []
    }
    loading.value = false
    showTable.value = true
  }).catch(err => {
    deptList.value = []
    loading.value = false
    showTable.value = true
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
  dataInfo.value = {
    pid: '',
    enabled: true,
    sortid: 99,
    children: [],
    hasChildren: false
  }
}
/**
 * 编辑
 * @param record
 */
function handleEdit(record) {
  drawerOpen.value = true
  title.value = "编辑部门"
  dataInfo.value = JSON.parse(JSON.stringify(record))
}

/**
 * 删除
 * @param record
 */
function handleDel(record, index) {
  defHttp.delete({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      // 递归找到该节点的父节点，并删除该节点
      const delChild = (node) => {
        if (record.pid == 0 || record.pid == '' || record.pid == undefined) {
          deptList.value = deptList.value.filter(child => child.id!== record.id)
          return true
        } else if (node.id === record.pid) {
          node.children = node.children.filter(child => child.id !== record.id)
          if(node.children.length == 0) {
            node.hasChildren = false
          }
          return true
        } else if (node.children) {
          node.children.forEach(child => delChild(child))
        }
      }

      for (let i = 0; i < deptList.value.length; i++) {
        let node = deptList.value[i]
        let find = delChild(node) 
        if(find) {
         break
        }
      }
      
      message.success('删除成功!')
    } else {
      message.warning('删除失败!')
    }
  }).catch(err => {
     message.warning('删除失败!')
  })
}

function onExpand(expanded, record) {
  if (record.hasChildren && !searchForm.value.name && expanded) {
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
  deptList.value = []
  showTable.value = false
  initData()
}

function onSearch() {
  if(searchForm.value.name == '') {
    deptList.value = []
    showTable.value = false
    initData(null, true)
  } else {
    deptList.value = []
    initData(null, false)
  }
}

function ok(data) {
  drawerOpen.value = false
  console.log(data.data)
  if(data.isAdd) { //新增
    // 根据data.data手动新增deptList数据
    if(data.data.pid == 0) {
      deptList.value.push(data.data)
    }else {
      // 递归找到父级节点，并添加子节点
      const addChild = (node) => {
        if (node.id === data.data.pid) {
          node.children.push(data.data)
          node.hasChildren = true
          return true
        } else if (node.children) {
          node.children.forEach(child => addChild(child))
        }
      }

      for(let i = 0; i < deptList.value.length; i++) {
        let node = deptList.value[i]
        let find = addChild(node) 
        if(find) {
          break
        }
      }
    }
  } else {
    if(data.data) { //编辑
      // 递归找到该节点，若节点修改了pid，则先添加到新pid下，再删除旧pid下的该节点
      if(data.data.pid != data.data.oldPid) {
        console.log('编辑 新增', data.data.pid)
        // 递归找到父级节点，并添加子节点
        const addChild = (node) => {
          if (data.data.pid == 0 || data.data.pid == '' || data.data.pid == undefined) {
            deptList.value.push(data.data)
            return true
          } else if (node.id === data.data.pid) {
            node.children.push(data.data)
            node.hasChildren = true
            return true
          } else if (node.children) {
            node.children.forEach(child => addChild(child))
          }  
        }
        for(let i = 0; i < deptList.value.length; i++) {
          let node = deptList.value[i]
          let find = addChild(node)
          if(find) {
            break
          }
        }
        // 递归找到该节点的父级节点，并删除该节点
        const delChild = (node) => {
          if (data.data.oldPid == 0 || data.data.oldPid == '' || data.data.oldPid == undefined) {
            deptList.value = deptList.value.filter(child => child.id!== data.data.id)
            return true
          } else if (node.id === data.data.oldPid) {
            node.children = node.children.filter(child => child.id !== data.data.id)
            if(node.children.length == 0) {
              node.hasChildren = false
            }
            return true
          } else if (node.children) {
            node.children.forEach(child => delChild(child))
          }
        } 
        for (let i = 0; i < deptList.value.length; i++) {
          let node = deptList.value[i]
          let find = delChild(node) 
          if(find) {
           break
          }
        }
      } else {
        // dataInfo直接修改，无需操作
        dataInfo.value = data.data
        deptList.value = setDeptList(deptList.value, data.data)
      }
    }

  }
}

function setDeptList(arr, node) {
  let newData = arr.map(item => {
    if (node.id == item.id) {
      item = node
    }
    if (item.children) {
      item.children = setDeptList(item.children, node)
    }
    return item
  })
  return newData
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
    
    :deep(.ant-table-body) {
      overflow-y: scroll;
      max-height: calc(100% - 50px) !important;
    }

    :deep(.ant-table-wrapper) {
      height: 100%;
    }

    :deep(.ant-table) {
      height: calc(100% - 20px);
    }

    :deep(.ant-table-container) {
      height: 100%;
    }

    :deep(.ant-spin-container) {
      height: 100%;
    }

    :deep(.ant-spin-nested-loading) {
      height: 100%;
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
