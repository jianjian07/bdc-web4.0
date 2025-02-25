<template>
  <div class="YwysList">
    <div class="oprBtns">
      <a-dropdown v-if="state.selectedRowKeys?.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchDelete">
              <DeleteOutlined />
              删除
            </a-menu-item>
          </a-menu>
        </template>

        <a-button style="margin-right: 8px"> 批量操作
          <DownOutlined />
        </a-button>
      </a-dropdown>
      <a-button type="primary" @click="onShowModal(null, 'new')">
        <template #icon><PlusOutlined /></template>
        新增
      </a-button>
    </div>
    <a-table
      bordered
      :data-source="dataList"
      :columns="columns"
      :pagination="pagination"
      @change="handleTableChange"
      :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
      :row-key="record => record.id"
      size="small"
      class="userTable"
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
        <template v-if="column.dataIndex === 'xzcz'">
          <StopOutlined v-if="record.xzcz === -1" :style="{fontSize: '16px', color: '#FF4500'}" />
          <WarningOutlined v-else :style="{fontSize: '18px', color: '#FFCC22'}" />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { PlusOutlined, StopOutlined, WarningOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { ref, defineProps, watch, reactive } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { cModal } from "/@/components/cModal/index"

let dataList: any = ref([])
const state = reactive({
  selectedRowKeys: []
})
const columns = [
  {
    title: '已发生的登记',
    align: 'center',
    dataIndex: 'yblcmc',
    sorter: true,
    customCell: (record, index) => {
      const obj:any = {
        rowSpan: 0
      }
      obj.rowSpan = getRowSpanCount(record.yblcmc, dataList.value, 'yblcmc', index)
      return obj
    }
  },
  {
    title: '登记状态',
    align: 'center',
    dataIndex: 'yblczt',
    customRender: ({text}) => {
      return text === 1 ? '已办' : '在办'
    }
  },
  {
    title: '限制办理情况',
    align: 'center',
    dataIndex: 'xzcz',
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
  pageSize: 100,
  showSizeChanger: false,
  showTotal: (total: Number) => `共 ${total} 条数据`
})

const urlList = {
  queryList: '/api/zrzy-bdc/bdcdj/ywys/list', // 分页列表查询
  delete: '/api/zrzy-bdc/bdcdj/ywys/delete', // 通过id删除
  deleteBatch: '/api/zrzy-bdc/bdcdj/ywys/deleteBatch' // 批量删除
}

const props = defineProps({
  lcid: {
    type: String,
    default: ''
  },
  baseInfo: {
    type: Object,
    default: null
  },
  treeData: {
    type: Object,
    default: null
  }
})

watch(() => props.lcid, (val:any) => {
  if(val) {
    pagination.value.current = 1
  }
}, {
  immediate: true
})

watch(() => props.baseInfo, (val: any) => {
  // 重置数据
  dataList.value = []
  pagination.value.total = 0
  if(val && val.regType) {
    pagination.value.current = 1
    loadData()
  }
}, {
  immediate: true
})


function loadData() {
  if(!props.baseInfo?.regType) {
    return
  }
  var params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    xzlcbm: "eq "+props.baseInfo?.regType
  }
  // 获取业务约束配置列表
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

function getRowSpanCount(text, data, key, index) {
  if (!Array.isArray(data)) return 1
  //上一行该列数据是否相同
  if (index !== 0 && text === data[index - 1][key]) {
    return 0
  }
  let rowSpan = 1
  //判断下一行是否相等
  for (let i = index + 1; i < data.length; i++) {
    if (text !== data[i][key]) {
      break
    }
    rowSpan++
  }
  return rowSpan
}

function onShowModal(data: any = null, type: String = 'new') {
  //新增 编辑 查看
  let title = type == 'new' ? '新增' : type == 'edit' ? '编辑' : '查看'
  let modal = cModal({
    title: `${title}业务约束配置`,
    width: 1000,
    filePath: 'views/system/case/components/YwysModal',
    footerStyle: {'text-align': 'center'},
    footer: type == 'view' ? false : true,
    formData: {
      type: type, //新增/编辑
      itemData: data, //当前操作的数据行
      xzlcbm: props.baseInfo?.regType, //限制流程编码，即当前流程 （使用regType关联）
      xzlcmc: props.baseInfo?.title, //限制流程编码，即当前流程
      treeData: props.treeData, //左侧目录树
      dataSource: dataList.value  //列表数据，用于新增/编辑时查找是否存在数据
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
      message.warning('删除成功！')
      state.selectedRowKeys = []
      loadData()
    } else {
      message.warning('删除失败！')
    }
  })
}

function onSelectChange(selectedRowKeys: any) {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys

};

function handleTableChange(pagination, filters, sorter) {
  if (sorter.order) {
    dataList.value = dataList.value.sort((a, b) => {
      if (sorter.order === 'ascend') {
        return a.yblcmc.localeCompare(b.yblcmc)
      } else {
        return b.yblcmc.localeCompare(a.yblcmc)
      }
    });
  }
}

</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');
.YwysList {
  padding: 0 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  .oprBtns {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 10px;
    text-align: right;
  }

  .userTable {
    flex: 1;
    overflow-y: hidden;
  }

  .icons-list :deep(.anticon) {
    margin-right: 6px;
    font-size: 24px;
  }
}
</style>
