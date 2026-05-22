<template>
  <div class="QlqtpzList">
    <a-row>
      <a-col :span="12">
        <a-form-item label="权利类型">
          <a-select v-model:value="qllx" :options="getDictItemsByCode('qllx')" allowClear style="width: 98%;"
            @change="loadData" show-search optionFilterProp="label">
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
    <a-table bordered :data-source="dataList" :columns="columns" :row-key="record => record.id" :pagination="pagination"
      @change="handleTableChange" size="small" class="userTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'qllx'">
          {{ getLabelByCode('qllx', record.qllx) }}
        </template>
        <template v-if="column.dataIndex === 'sfybz'">
          {{ getLabelByCode('sfybz', record.sfybz) }}
        </template>
        <template v-if="column.dataIndex === 'sfpl'">
          {{ getLabelByCode('ispl', record.sfpl) }}
        </template>
        <template v-if="column.dataIndex === 'jzlx'">
          {{ getLabelByCode('jzlx', record.jzlx) }}
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

<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { cModal } from "/@/components/cModal/index"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';

let dataList: any = ref([])
let djlxOptions: any = ref([])
let djlx: any = ref([])
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
    width: 350,
    sorter: {
      compare: (a, b) => a.qllx - b.qllx,
    },
  },
  {
    title: '一本证',
    dataIndex: 'sfybz',
    align: 'center',
    width: 220
  },
  {
    title: '批量',
    dataIndex: 'sfpl',
    align: 'center',
    width: 200
  },
  {
    title: '介质类型',
    dataIndex: 'jzlx',
    align: 'center',
    width: 200
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
  pageSize: 20,
  showSizeChanger: false,
  showTotal: (total: Number) => `共 ${total} 条数据`
})
let qllx = ref('')

const urlList = {
  queryList: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/list', // 分页列表查询
  delete: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/delete' //通过id删除
}

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
watch(() => props.lcid, (val: any) => {
  if (val) {
    pagination.value.current = 1
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
  // 获取权利其他配置列表
  defHttp.get(
    {
      url: urlList.queryList,
      params: {
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        lcid: props.lcid,
        qllx: qllx.value
      }
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
    title: `${title}业务权利其他配置`,
    width: 1000,
    filePath: 'views/bpm/sxgl/components/QlqtpzModal',
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
  defHttp.delete(
    {
      url: urlList.delete,
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

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function getLabelByCode(dict: any, value: any) {
  return getDictItemsByCode(dict).filter((_v: any) => _v.dictCode == value)[0]?.dictName || ''
}

function getDjlx() {
  if (props.baseInfo.regType) {
    djlx.value = props.baseInfo.regType.split(',')
  }
}

// 转换成下拉选项
function transformOptions(data: any) {
  let options: any = []
  for (let i = 0; i < data.length; i++) {
    var children: any = []
    for (let j = 0; j < data[i].children.length; j++) {
      var child = {
        value: data[i].children[j].value,
        label: data[i].children[j].title,
        regtype: data[i].children[j].type
      }
      children.push(child)
    }
  }
  djlxOptions.value = options
}
</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.QlqtpzList {
  padding: 0 10px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .oprBtns {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 10px;
    text-align: right;
    width: 100%;
  }

  .userTable {
    flex: 1;
    overflow-y: hidden;
  }
}
</style>
