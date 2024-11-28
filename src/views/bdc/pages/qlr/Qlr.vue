<template>
  <div class="qlr">
    <c-collapse-panel :defaultCollapse="false" :header="qlrxx.qlrxsmc +'信息'" :showArrow="true" classname="title-css8"
                      collapseType="row" style='width:100%'>
      <div v-if="qlrxx?.btnId?.includes('1')" class="qlr-add">
        <a-button @click="handleAdd">新增</a-button>
      </div>
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" rowKey="qlrid"
               @change="onTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div v-if="actionBtnList.length" class="qlr-btns">
              <template v-for="(item,index) in actionBtnList">
                <template v-if="item.name == '删除'">
                  <a-popconfirm title="是否确定删除该数据？" ok-text="确定" cancel-text="取消" @confirm="handleFun(item.funcName,record)">
                    <a-button type="link">{{ item.name }}</a-button>
                  </a-popconfirm>
                </template>
                <a-button v-else type="link" @click="handleFun(item.funcName,record)">{{ item.name }}</a-button>
                <a-divider v-if="index !== actionBtnList.length - 1" type="vertical"/>
              </template>
            </div>
          </template>
          <template v-else-if="column.dict">
            {{ getDictItemsByCode(column.dict).find(f => f.value == record[column.key]).label }}
          </template>
        </template>
      </a-table>
    </c-collapse-panel>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { cModal } from "/@/components/cModal/index"
import { defHttp } from "/@/utils/http/axios"
import { useRoute } from "vue-router"
import { message } from "ant-design-vue"
import { getDictItemsByCode } from "/@/utils/form/commonUtils";

const route = useRoute()

const props = defineProps({
  qlrxx: {
    type: Object,
    default: {}
  },
  jdmc: {
    type: String,
    default: '收件'
  },
  ywh: {
    type: String,
    default: ''
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
    key: 'zjzl',
    dict: 'zjzl'
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
  pageSize: 10,
})

enum api {
  list = '/api/zrzy-bdc/bdc/qlr/list'
}

// 操作栏按钮
let actionBtnList = ref<any>([])

onMounted(() => {
  initData()
  initBtnList()
})

/**
 * 初始化操作栏按钮
 */
function initBtnList() {
  let btnId = props.qlrxx.btnId || ''
  let btnIdArr = btnId ? btnId.split(',') : []
  const list = [{
    name: '查看',
    value: '3',
    funcName: 'handleLook'
  }, {
    name: '编辑',
    value: '2',
    funcName: 'handleEdit'
  }, {
    name: '家庭成员',
    value: '5',
    funcName: 'handleJtcy'
  }, {
    name: '删除',
    value: '4',
    funcName: 'handleDel'
  }]
  actionBtnList.value = list.filter(item => btnIdArr.includes(item.value))
}

/**
 * 加载数据
 */
function initData() {
  let query = route.query
  defHttp.get({
    url: api.list,
    params: {
      slbh: query.slbh,
      qlrlb: props.qlrxx.qlrlxmc,
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize
    }
  }, { withToken: true }).then((res) => {
    if (res && res.success) {
      tableData.value = res.result.records
      pagination.value.total = res.result.total
    }
  })
}

/**
 * 操作按钮
 * @param name
 * @param record
 */
function handleFun(name, record) {
  eval(`${name}(record)`)
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
  let query = route.query
  let formId = (props.qlrxx.qlrlxmc == '查封机关' || props.qlrxx.qlrlxmc == '查封申请人' || props.qlrxx.qlrlxmc == '居住权人') ? 109 : 55
  if (tableData.value.length > 0 && tableData.value[0].gyfs == '0') {
    message.warning('该权利人共有方式为单独所有,不允许再添加')
  } else {
    let modal = cModal({
      title: '新增',
      width: '70vw',
      filePath: 'views/bdc/public/GenPublic',
      formData: {
        formId: formId,
        ywh: props.ywh,
        slbh: query.slbh,
        qlrlb: props.qlrxx.qlrlxmc,
        qlrList: tableData.value
      },
      onOk: async (res) => {
        if (res && res.saveQlrData) {
          let _result = await res.saveQlrData('add')
          if (_result) {
            modal.destroy()
            initData()
          }
        }
      }
    })
  }
}

/**
 * 查看
 * @param record
 */
function handleLook(record) {
  let formId = (props.qlrxx.qlrlxmc == '查封机关' || props.qlrxx.qlrlxmc == '查封申请人' || props.qlrxx.qlrlxmc == '居住权人') ? 109 : 55
  cModal({
    title: '查看',
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: formId,
      iszd: '1',
      qlrid: record.qlrid,
      ywh: record.ywh
    },
    footer: false
  })
}

/*
 * 编辑
 * @param record
 */
function handleEdit(record) {
  let query = route.query
  let formId = (props.qlrxx.qlrlxmc == '查封机关' || props.qlrxx.qlrlxmc == '查封申请人' || props.qlrxx.qlrlxmc == '居住权人') ? 109 : 55
  let modal = cModal({
    title: '编辑',
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: formId,
      qlrid: record.qlrid,
      slbh: query.slbh,
      ywh: record.ywh,
      qlrlb: props.qlrxx.qlrlxmc,
      qlrList: tableData.value
    },
    onOk: async (res) => {
      if (res && res.saveQlrData) {
        let _result = await res.saveQlrData('edit')
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
  defHttp.post({
        url: '/api/zrzy-bdc/bdc/qlr/delete',
        params: { id: record.qlrid }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        initData()
        message.success('删除成功')
      } else {
        message.warning('删除失败')
      }
  })
}
</script>

<style lang="less" scoped>
.qlr-add {
  margin-bottom: 10px;
  display: flex;
  justify-content: end;
  align-items: center;
}

.qlr-btns {
  display: flex;
  align-items: center;

  :deep(.ant-btn-link) {
    padding: 0px;
  }
}
</style>