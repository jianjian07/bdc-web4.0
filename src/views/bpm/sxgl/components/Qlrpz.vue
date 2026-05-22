<template>
  <div class="qlrpz">
    <a-row>
      <a-col :span="12">
        <a-form-item label="权利类型">
          <a-select v-model:value="qllx" :options="getDictItemsByCode('qllx')" allowClear style="width: 98%;"
            show-search optionFilterProp="label" @change="loadData">
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12" class="oprBtns">
        <a-button type="primary" @click="onShowModal(null, 'new')">
          <template #icon>
            <PlusOutlined />
          </template>
          新增
        </a-button>
      </a-col>
    </a-row>
    <a-table bordered :data-source="dataList" :columns="columns" :row-key="record => record.id" size="small"
      class="userTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'qllx'">
          <a-input :value="getLabelByCode('qllx', record.qllx)" :bordered="false" readonly
            style="text-align: center;width: 100%" />
        </template>
        <template v-if="column.dataIndex === 'qlrlxmc'">
          <a-input :value="getLabelByCode('qlrlb', record.qlrlb)" :bordered="false" readonly
            style="text-align: center;width: 100%" />
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <a @click="onShowModal(record, 'view')">详情</a>
          <a-divider type="vertical" />
          <a @click="onShowModal(record, 'edit')">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除？" ok-text="确定" cancel-text="取消" @confirm="onDelete(record.id)">
            <a style="color:#ff4d4f">删除</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { PlusOutlined } from '@ant-design/icons-vue'
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { ref, watch } from "vue"
import { cModal } from "/@/components/cModal/index"

const props = defineProps({
  lcid: {
    type: String,
    default: ''
  },
  baseInfo: {
    type: Object,
    default: {}
  }
})

// 权利类型
let qllx = ref('')
// 登记类型
let djlx = ref([])
// 列表
let dataList = ref([])

const columns = [
  {
    title: '登记类型',
    dataIndex: 'djlx',
    align: 'center',
    width: 150
  },
  {
    title: '权利类型',
    dataIndex: 'qllx',
    align: 'center',
    width: 400,
    sorter: {
      compare: (a, b) => a.qllx - b.qllx,
    },
  },
  {
    title: '权利人名称',
    dataIndex: 'qlrlxmc',
    align: 'center',
    width: 150
  },
  {
    title: '权利人显示名称',
    dataIndex: 'qlrxsmc',
    align: 'center',
    width: 150
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    align: 'center',
    width: 150
  },
  {
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 200
  },
]
enum api {
  list = '/api/zrzy-bdc/flow/qlr/list',
  delete = '/api/zrzy-bdc/flow/qlr/delete'
}

watch(() => props.lcid, (val: any) => {
  if (val) {
    loadData()
  }
}, {
  immediate: true
})

watch(() => props.baseInfo, (val) => {
  djlx.value = []
  getDjlx()
}, {
  immediate: true
})

function loadData() {
  defHttp.post(
    {
      url: api.list,
      params: {
        lcid: props.lcid,
        qllx: qllx.value
      }
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      dataList.value = res.result
    } else {
      message.warning(res?.message)
    }
  })
}


function getLabelByCode(dict: any, value: any) {
  return getDictItemsByCode(dict).filter((_v: any) => _v.dictCode == value)[0]?.dictName || ''
}


function getDjlx() {
  if (props.baseInfo.regType) {
    djlx.value = props.baseInfo.regType.split(',')
  }
}

function onShowModal(data: any = null, type: String = 'new') {
  //新增 编辑 查看
  let title = type == 'new' ? '新增' : type == 'edit' ? '编辑' : '查看'
  let modal = cModal({
    title: `${title}权利人配置`,
    width: 800,
    filePath: 'views/bpm/sxgl/components/QlrpzModal',
    footerStyle: { 'text-align': 'center' },
    footer: type == 'view' ? false : true,
    formData: {
      type: type,
      lcid: props.lcid,
      itemData: data,
      djlx: djlx.value
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
  defHttp.post(
    {
      url: api.delete,
      params: { id: id }
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      message.success('删除成功！')
      loadData()
    } else {
      message.warning(res?.message)
    }
  })
}
</script>

<style lang="less" scoped></style>