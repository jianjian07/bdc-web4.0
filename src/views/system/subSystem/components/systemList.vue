<template>
      <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="子系统名称">
                        <a-select v-model:value="formData.subsystemid" :fieldNames="systemFieldNames" :options="systemOptions" allowClear/>
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="searchData">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询</a-button>
                            <a-button @click="refreshData">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置</a-button>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </div>
    <div class="wonder-table-css">
      <div class="wonder-table-toolbar">
        <a-space style="padding-bottom: 10px;">
          <a-button type="primary" @click="onShowModal()">
            <template #icon><PlusOutlined /></template>
            新增
          </a-button>
          <a-button :disabled="!state.selectedRowKeys.length" @click="showDeleteConfirm">
            <template #icon><DeleteOutlined /></template>
            批量删除
          </a-button>
        </a-space>
        <a-table 
          bordered 
          :data-source="dataList"
          :columns="columns"
          :pagination="pagination"
          @change="handleTableChange"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
          :row-key="record => record.id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a @click="onShowModal(record, 'edit')">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定删除？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="onDelete(record.id)"
              >
              <a style="color:#ff4d4f">删除</a>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </div>
    </div>
</template>

<script setup lang="ts">
import { SearchOutlined, RedoOutlined, PlusOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { reactive, ref, h, onMounted } from 'vue';
import { cModal } from "/@/components/cModal/index"
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { Modal } from 'ant-design-vue';


let dataList: any = ref([])

const state = reactive({
  selectedRowKeys: []
})

let formData:any = ref({
  subsystemid: ''
})

const systemFieldNames = { label: 'name', value: 'id', }

const columns = [
  {
    title: '子系统名称',
    align: 'center',
    dataIndex: 'subsystemname',
  },
  {
    title: '子系统id',
    align: 'center',
    dataIndex: 'subsystemid',
  },
  {
    title: '区划名称',
    align: 'center',
    dataIndex: 'areaName',
  },
  {
    title: '区划代码',
    align: 'center',
    dataIndex: 'areaCode',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 200
  },
]

// 分页
const pagination = ref<any>({ 
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: false, 
  showTotal: (total: Number) => `共 ${total} 条数据` 
})

const systemOptions = ref([])

const urlList = {
  queryList: '/api/zrzy-bdc/sys/sysSubArea/list',
  delete: '/api/zrzy-bdc/sys/sysSubArea/delete/',
  deleteBatch: '/api/zrzy-bdc/sys/sysSubArea/deleteBatch',
  systemList: '/api/zrzy-bdc/sys/sysSubsystem/list'
}

onMounted(() => {
  loadData()
  loadSystemList()
})

function loadSystemList() {
  systemOptions.value = []
  defHttp.get(
    {
      url: urlList.systemList,
      params: { pageSize: 1000, pageNo: 1}
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      systemOptions.value = res.result.records
    } else {
      message.warning(res?.message || '未查询到行政区数据！')
    }
  })
}

function loadData() {
  var params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    order: 'desc,asc',
    column: 'id,areaCode',
    subsystemid: formData.value.subsystemid
  }
  // 获取宗地归属
  defHttp.get(
    {
      url: urlList.queryList,
      params: params
    },
    { withToken: true }
  ).then((res: any) => {
    if(res?.success) {
      dataList.value = res.result.records
      pagination.value.total = res.result.total
    } else {
      message.warning(res?.message)
    }
  })
}


function onShowModal(data: any = null, type: String = 'new') {
  //新增 编辑 查看
  let title = type == 'new' ? '新增' : type == 'edit' ? '编辑' : '查看'
  let modal = cModal({
    title: `${title}`,
    width: 600,
    filePath: 'views/system/subSystem/components/addNew',
    footerStyle: {'text-align': 'center'},
    footer: type == 'view' ? false : true,
    formData: {
      type: type, // 新增/编辑
      itemData: data, //当前操作的数据行
    },
    onOk: async (res: any) => {
      if(type == 'view') {
        modal.destroy()
      } else {
        modal.setConfirmLoading(true)
        // res为弹窗内组件的dom
        let validator = await res.onSubmit()
        if (validator) {
          modal.destroy()
          loadData()
        }
        modal.setConfirmLoading(false)
      }
      
    },
    onCancel: () => {
      modal.close()
    }
  })
}

function onDelete(id: any) {
  defHttp.delete(
    {
      url: urlList.delete,
      params: { id: id }
    },
    { withToken: true }
  ).then((res: any) => {
    if(res && res.success) {
      message.success('删除成功！')
      loadData()
    } else {
      message.warning('删除失败！')
    }
  })
}

function onSelectChange(selectedRowKeys: any) {
  state.selectedRowKeys = selectedRowKeys
}

function handleTableChange(pag:any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

const showDeleteConfirm = () => {
  Modal.confirm({
    title: `确定要删除所选中的 ${state.selectedRowKeys.length} 条数据吗?`,
    icon: h(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      onDeleteBatch()
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

/**
* 批量删除勾选的行政区 checkedInfo
*/
function onDeleteBatch() {
  defHttp.delete(
    {
      url: urlList.deleteBatch,
      params: { ids: state.selectedRowKeys.join(',') }
    },
    { withToken: true }
  ).then((res: any) => {
    if(res && res.success) {
      message.success('删除成功！')
      loadData()
    } else {
      message.warning('删除失败！')
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

</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>