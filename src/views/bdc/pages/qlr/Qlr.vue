<template>
  <div class="qlr">
    <div class="title-css1 title-left" >
      <span>{{ qlrxx.qlrlb }}信息</span>
    </div>
    <div class="qlr-add">
      <a-button @click="handleAdd">添加</a-button>
    </div>
    <a-table :columns="columns" :data-source="tableData" :pagination="pagination" @change="onTableChange" rowKey="qlrid">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <div class="qlr-btns">
            <a-button type="link" @click="handleLook(record)">查看</a-button>
            <a-divider v-if="jdmc == '收件'" type="vertical" />
            <a-button v-if="jdmc == '收件'" type="link" @click="handleEdit(record)">编辑</a-button>
            <a-divider v-if="jdmc == '收件'" type="vertical" />
            <a-button v-if="jdmc == '收件'" type="link" @click="handleDel(record)">删除</a-button>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { cModal } from "/@/components/cModal/index"
import { defHttp } from "/@/utils/http/axios"
import { useRoute } from "vue-router"
const route = useRoute();

const props = defineProps({
  qlrxx: {
    type: Object,
    default: {}
  },
  jdmc: {
    type: String,
    default: '收件'
  }
})

let columns = ref<any>([
  {
    title: '姓名',
    dataIndex: 'qlrmc',
    key: 'qlrmc'
  },
  {
    title: '证件号',
    dataIndex: 'zjh',
    key: 'zjh'
  },
  {
    title: '证件种类',
    dataIndex: 'zjzl',
    key: 'zjzl'
  },
  {
    title: '联系电话',
    dataIndex: 'dh',
    key: 'dh'
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 150
  }
])

let tableData = ref<any[]>([])

let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 5,
})

enum api {
  list = '/api/zrzy-bdc/bdc/qlr/list'
}

onMounted(() => {
  initData()
})

function initData() {
  let query = route.query
  defHttp.get({ url: api.list, params: { slbh: query.slbh, qlrlb: props.qlrxx.qlrlb, pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      tableData.value = res.result.records
      pagination.value.total = res.result.total
    }
  })
}

/**
 * 分页变化
 * @param pag
 */
function onTableChange(pag) {
  pagination.value = pag
  initData()
}

/**
 * 添加
 */
function handleAdd() {
  let modal = cModal({
    title: '新增',
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: 55
    },
    onOk: async (res) => {
      if (res && res.saveData) {
        let _result = await res.saveData()
        if (_result) {
            modal.destroy()
            initData()
        }
      }
    }
  })
}

/**
 * 查看
 * @param record
 */
function handleLook(record) {
  cModal({
    title: '查看',
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: 55,
      iszd: '1',
      qlrid: record.qlrid
    },
    footer: false
  })
}

/**
 * 编辑
 * @param record
 */
function handleEdit(record) {
  let modal = cModal({
    title: '编辑',
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: 55,
      qlrid: record.qlrid
    },
    onOk: async (res) => {
      if (res && res.saveData) {
        let _result = await res.saveData()
        if (_result) {
          modal.destroy()
          initData()
        }
      }
    }
  })
}

/**
 * 删除
 * @param record
 */
function handleDel(record) {
  
}
</script>

<style lang="less" scoped>
.qlr-add {
  margin-bottom: 10px;
}

.qlr-btns {
  display: flex;
  align-items: center;
  
  :deep(.ant-btn-link) {
    padding: 0px;
  }
}
</style>