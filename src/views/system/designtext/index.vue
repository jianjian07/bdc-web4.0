<template>
   <div class="design-text-index wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="名称">
                        <a-input v-model:value="formData.designName" />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="设计类型">
                        <a-select v-model:value="formData.designType" :options="getDictItemsByCode('design_text')"/>
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="searchData">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询
                            </a-button>
                            <a-button @click="refreshData">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置
                            </a-button>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
     
        
    </div>
    <div class="wonder-table-css">
        <div class="wonder-table-toolbar">
            <a-space>
                <a-button type="primary" @click="add">
                    <template #icon>
                        <plus-outlined />
                    </template>
                    新增
                </a-button>
              
                 <a-dropdown v-if="state.selectedRowKeys?.length > 0">
                    <template #overlay>
                        <a-menu>
                            <a-menu-item key="1" @click="batchDelete">
                               <DeleteOutlined />删除
                            </a-menu-item>
                        </a-menu>
                    </template>
                  
                    <a-button style="margin-right: 8px"> 批量操作
                       <DownOutlined />
                    </a-button>
                </a-dropdown>
            </a-space>
        </div>
        <a-table :columns="columns" 
                 :data-source="dataList" 
                 :pagination="pagination"
                  @change="onChange($event, loadData)" 
                 :row-key="record => record.id"
                 :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
        >
          <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex == 'designType'">
                  {{ getLabelByDictCode('design_text', record[column.dataIndex]) }}
                </template>
                <template v-if="column.dataIndex == 'zt'">
                  {{ getLabelByDictCode('sfys', record[column.dataIndex]) }}
                </template>
                <template v-if="column.dataIndex == 'roles'">
                  {{ getRoleLabel(record[column.dataIndex]) }}
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="edit(record)">编辑</a>
                        <a-popconfirm title="是否确定删除该数据？" ok-text="确定" cancel-text="取消" @confirm="del(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue"
import { PlusOutlined, SearchOutlined, RedoOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { getDictItemsByCode,getLabelByDictCode } from '/@/views/online/utils/commonUtils';
import { defHttp } from "/@/utils/http/axios"
import { cModal } from "/@/components/cModal/index"
import { message } from "ant-design-vue"

let formData = ref<any>({})
let dataList = ref<any>([])
let roleList = ref<any>([])
const state = reactive({
  selectedRowKeys: []
})

const columns = [
    { title: "名称", dataIndex: "designName" },
    { title: "设计类型", dataIndex: "designType" },
    { title: "设计内容", dataIndex: "designContent" },
    { title: "角色", dataIndex: "roles", width: 250 },
    { title: "状态", dataIndex: "zt", width: 100 },
    { title: "创建人", dataIndex: "realName", width: 100 },
    { title: '操作', key: 'action', width: 150 }
]

let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})

enum api {
  list = '/api/zrzy-bdc/bdc/bdcDesignText/list',
  roleList = '/api/zrzy-system/role/list',
  del = '/api/zrzy-bdc/bdc/bdcDesignText/delete',
  batchDel = '/api/zrzy-bdc/bdc/bdcDesignText/deleteBatch'
}


onMounted(() => {
  getRoleList()
  loadData()
})

/**
 * 加载数据
 */
function loadData() {
  let params = {
    designName: formData.value.designName,
    designType: formData.value.designType,
    pageNo: pagination.value.current, 
    pageSize: pagination.value.pageSize
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
      const { result } = res
      dataList.value = result.records
      pagination.value.total = result.total
  }).catch(err => {
      console.info(err)
  })
}

/**
* 分页
* @param pag
* @param callback 回调函数
*/
function onChange(pag: any, callback: any) {
    pagination.value = pag
    callback()
}

/**
 * 获取角色列表
 */
function getRoleList() {
  defHttp.get({ url: api.roleList, params: { pageNo: 1, pageSize: 999 } }, { withToken: true }).then((res) => {
    if (res && res.success) {
       roleList.value = res.result.records
    }
  })
}

/**
 * 查询
 */
function searchData() {
  pagination.value.current = 1
  loadData()
}

/**
 * 重置
 */
function refreshData() {
  formData.value = {}
  loadData()
}

/**
* 编辑
* @param record 
*/
function handleModal(type: any, record: any = null) {
  let modal = cModal({
    title: type == 'add' ? '新增' : '编辑',
    width: 600,
    filePath: 'views/system/designtext/components/designTextModal',
    footer: true,
    formData: {
      type: type,
      record: record,
      roleList: roleList.value
    },
    onOk: async (res: any) => {
      modal.setConfirmLoading(true)
      // res为弹窗内组件的dom
      let validator = await res.onSubmit()
      if (validator) {
        loadData()
      }
      modal.setConfirmLoading(false)
      modal.destroy()
    },
    onCancel: () => {
      modal.destroy()
    }
  })
}

/**
 * 添加
 */
function add() {
  handleModal('add')
}

/**
 * 编辑
 * @param record
 */
function edit(record) {
  handleModal('edit', record)
}

/**
 * 删除
 * @param record
 */
function del(record) {
  defHttp.delete({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res: any) => {
      if (res?.success) {
          message.success('删除成功！')
          loadData()
      } else {
          message.warning(res?.message)
      }
  })
}

/**
 * 批量删除
 */
function batchDelete() {
  defHttp.delete({ url: api.batchDel, params: { ids: state.selectedRowKeys.join(',') } }, {
    withToken: true
  }).then(res => {
    if (res && res.success) {
      message.success('删除成功！')
      state.selectedRowKeys = []
      loadData()
    } else {
      message.warning('删除失败！')
    }
  })
}

/**
 * 获取角色名称
 * @param value
 */
function getRoleLabel(value) {
  let arr = value.includes(',') ? value.split(',') : [value]
  let strArr = []
  for (let i = 0; i < arr.length; i++) {
    let find =  roleList.value.filter((_v: any) => _v.id == arr[i])[0]?.name || ''
    strArr.push(find)
  }
  return strArr.join(',')
}

function onSelectChange(selectedRowKeys: any) {
  state.selectedRowKeys = selectedRowKeys
}

</script>

<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>