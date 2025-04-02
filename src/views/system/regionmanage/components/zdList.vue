<template>
  <div style="padding: 0 10px;">
    <a-space style="padding-bottom: 10px;">
      <a-button type="primary" @click="onShowModal()">
        <template #icon><PlusOutlined /></template>
        新增
      </a-button>
      <a-button type="primary" @click="loadData()">
        <template #icon><RedoOutlined /></template>
        刷新
      </a-button>
    </a-space>
    <a-table 
      bordered 
      :data-source="dataList"
      :columns="columns"
      :pagination="pagination"
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
</template>

<script setup lang="ts">
import { PlusOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { onMounted, reactive, ref, watch } from 'vue';
import { cModal } from "/@/components/cModal/index"
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';

const props = defineProps({
  selectInfo: {
    type: Object,
    default: null
  }
})

let dataList: any = ref([])

const columns = [
  {
    title: '名称',
    align: 'center',
    dataIndex: 'dictName',
  },
  {
    title: '代码',
    align: 'center',
    dataIndex: 'dictCode',
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
  queryList: '/api/zrzy-system/sys/areacode/getZdgsByArea',
  delete: '/api/zrzy-system/sys/dict/deleteByIdList'
}

const emit = defineEmits(['refreshList'])

watch(() => props.selectInfo, val => {
  if(val) {
    loadData()
  }
}, {
  immediate: true
})

function loadData() {
  var params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    areaCode: props.selectInfo.areaCode,
    order: 'desc',
    column: 'createTime'
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
      dataList.value = res.result
      pagination.value.total = res.result.length
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
    filePath: 'views/system/regionmanage/components/addZD',
    footerStyle: {'text-align': 'center'},
    footer: type == 'view' ? false : true,
    formData: {
      type: type, // 新增/编辑
      itemData: data || props.selectInfo, //当前操作的数据行
    },
    onOk: async (res: any) => {
      if(type == 'view') {
        modal.destroy()
      } else {
        modal.setConfirmLoading(true)
        // res为弹窗内组件的dom
        let validator = await res.addZDGS()
        if (validator) {
          modal.destroy()
          loadData()
          emit('refreshList')
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
  defHttp.post(
    {
      url: urlList.delete,
      data: [id]
    },
    { withToken: true }
  ).then((res: any) => {
    if(res && res.success) {
      message.success('删除成功！')
      loadData()
      emit('refreshList')
    } else {
      message.warning('删除失败！')
    }
  })
}

</script>

<style scoped lang="less">

</style>