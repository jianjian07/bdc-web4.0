<template>
  <div class="ClmlList">
    <div class="oprBtns">
      <a-dropdown v-if="state.selectedRowKeys?.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchDelete">
              <DeleteOutlined style="margin-right: 8px" />
              删除
            </a-menu-item>
          </a-menu>
        </template>

        <a-button style="margin-right: 8px"> 批量操作
          <DownOutlined />
        </a-button>
      </a-dropdown>
      <a-button type="primary" @click="onShowModal(null, 'new')">
        <template #icon>
          <PlusOutlined />
        </template>
        新增
      </a-button>
    </div>
    <a-table bordered :data-source="dataList" :columns="columns" :pagination="pagination" @change="handleTableChange"
      :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
      :row-key="record => record.id" size="small">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a @click="onShowModal(record, 'edit')">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除？" ok-text="确定" cancel-text="取消" @confirm="onDelete(record.id)">
            <a style="color:#ff4d4f">删除</a>
          </a-popconfirm>
        </template>
        <template v-if="column.dataIndex === 'xzcz'">
          <StopOutlined v-if="record.xzcz === -1" :style="{ fontSize: '16px', color: '#FF4500' }" />
          <WarningOutlined v-else :style="{ fontSize: '18px', color: '#FFCC22' }" />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { PlusOutlined, StopOutlined, WarningOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { ref, watch, reactive } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { cModal } from "/@/components/cModal/index"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';

let dataList: any = ref([])
const state = reactive({
  selectedRowKeys: []
})

const props = defineProps({
  lcid: {
    type: String,
    default: ''
  },
  baseInfo: {
    type: Object,
    default: null
  },
  isBl: {
    type: Boolean,
    default: false
  }
})

const columns = ref<any>([])
const defaultColumns = [{
  title: '权利类型',
  align: 'center',
  dataIndex: 'subType',
  customRender: ({ text }) => {
    return getDictItemsByCode('qllx').filter((_v: any) => _v.dictCode == text)[0]?.dictName || text
  }
},
{
  title: '目录名称',
  align: 'center',
  dataIndex: 'folderName',
},
{
  title: '必须',
  align: 'center',
  dataIndex: 'must',
  customRender: ({ text }) => {
    return text === '1' ? '是' : '否'
  }
},
{
  title: '需要原件',
  align: 'center',
  dataIndex: 'original',
  customRender: ({ text }) => {
    return text === '1' ? '是' : '否'
  }
},
{
  title: '操作',
  dataIndex: 'operation',
  align: 'center',
  width: 200
},]
// 分页
const pagination = ref<any>({
  total: 0,
  current: 1,
  pageSize: 100,
  showSizeChanger: false,
  showTotal: (total: Number) => `共 ${total} 条数据`
})

const urlList = {
  queryList: '/api/zrzy-bdc/sys/folder/config/list', // 分页列表查询
  delete: '/api/zrzy-bdc/sys/folder/config/delete', // 通过id删除
  deleteBatch: '/api/zrzy-bdc/sys/folder/config/deleteBatch' // 批量删除
}

watch(() => props.isBl, (val) => {
  columns.value = val ? defaultColumns : [{
    title: '节点名称',
    align: 'center',
    dataIndex: 'nodeName',
  }, ...defaultColumns]
}, {
  immediate: true
})

watch(() => props.lcid, (val: any) => {
  if (val) {
    pagination.value.current = 1
    loadData()
  }
}, {
  immediate: true
})


function loadData() {
  var params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    processId: props.lcid,
    order: 'desc,asc',
    column: 'subType,orderNum',
  }
  // 获取业务约束配置列表
  defHttp.get(
    {
      url: urlList.queryList,
      params: params
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
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
    title: `${title}【${props.baseInfo.lcmc}】材料目录`,
    width: 1000,
    filePath: 'views/bpm/sxgl/components/ClmlModal',
    footerStyle: { 'text-align': 'center' },
    footer: type == 'view' ? false : true,
    formData: {
      type: type, // 新增/编辑
      lcid: props.lcid,
      itemData: data, //当前操作的数据行
      dataSource: dataList.value,  //列表数据，用于新增/编辑时查找是否存在数据
      baseInfo: props.baseInfo,
      isBl: props.isBl
    },
    onOk: async (res: any) => {
      if (type == 'view') {
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
      modal.destroy()
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
    if (res && res.success) {
      message.success('删除成功！')
      loadData()
    } else {
      message.warning('删除失败！')
    }
  })
}

function batchDelete() {
  defHttp.delete({
    url: urlList.deleteBatch,
    params: {
      ids: state.selectedRowKeys.join(',')
    }
  }, {
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

function onSelectChange(selectedRowKeys: any) {
  state.selectedRowKeys = selectedRowKeys
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}


</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.ClmlList {
  padding: 0 10px;

  .oprBtns {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 10px;
    text-align: right;
  }

  .icons-list :deep(.anticon) {
    margin-right: 6px;
    font-size: 24px;
  }
}
</style>
