<template>
  <div class="qlr">
    <c-collapse-panel :defaultCollapse="false" :header="qlrxx.qlrxsmc +'信息'" :showArrow="true" :classname="titleClassName"
                      collapseType="row" style='width:100%'>
      <div v-if="qlrxx?.btnId?.includes('1') && !disabled" class="qlr-add">
        <a-button @click="handleAdd">新增</a-button>
      </div>
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" rowKey="zjh"
               @change="onTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div v-if="actionBtnList.length" class="qlr-btns">
              <template v-for="(item,index) in actionBtnList">
                <template v-if="item.name == '删除'">
                  <a-popconfirm title="是否确定删除该数据？" :disabled="disabled" ok-text="确定" cancel-text="取消" @confirm="handleFun(item.funcName,record)">
                    <a-button type="link" :disabled="disabled">{{ item.name }}</a-button>
                  </a-popconfirm>
                </template>
                <a-button v-else type="link" :disabled="(item.name == '查看' || item.name == '家庭成员') ? false : disabled" @click="handleFun(item.funcName,record)">{{ item.name }}</a-button>
                <a-divider v-if="index !== actionBtnList.length - 1" type="vertical"/>
              </template>
            </div>
          </template>
          <template v-else-if="column.dict">
            {{ getDictItemsByCode(column.dict).find(f => f.value == record[column.key])?.label }}
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
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils";

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
  },
  disabled: {
    type: Boolean,
    default: false
  },
  formType: {
    type: String,
    default: ''
  },
  regType: {
    type: String,
    default: ''
  },
  bdcdyh: {
    type: String,
    default: ''
  }
})

let columns = ref<any>([
  {
    title: '姓名',
    dataIndex: 'qlrmc',
    key: 'qlrmc',
    width: 250
  },
  {
    title: '证件号',
    dataIndex: 'zjh',
    key: 'zjh',
    width: 200
  },
  {
    title: '证件种类',
    dataIndex: 'zjzl',
    key: 'zjzl',
    dict: 'zjzl',
    width: 150
  },
  {
    title: '联系电话',
    dataIndex: 'dh',
    key: 'dh',
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 150
  }
])

let tableData = ref<any[]>([])
let qlrlxmc = props.qlrxx?.qlrlxmc
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})
let titleClassName = 'title-css' + (window?.settingConfig?.qlrTitleClassNum || 8)

enum api {
  list = '/api/zrzy-bdc/bdc/qlr/list',
}

const emit = defineEmits(['getTbxx', 'getList'])

// 操作栏按钮
let actionBtnList = ref<any>([])

const fun = {
  handleJtcy,
  handleDel,
  handleLook,
  handleEdit
}

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
  let _list = list.filter(item => btnIdArr.includes(item.value))
  let filterList = _list.filter(item => {
    const alwaysKeep = item.name === '查看' || item.name === '家庭成员';
    return alwaysKeep || !props.disabled;
  });
  actionBtnList.value = filterList
}

/**
 * 加载数据
 */
function initData() {
  let query = route.query
  let ywh = props.ywh ? { ywh: props.ywh } : {}
  let bdcdyh = props.bdcdyh ? { bdcdyh: props.bdcdyh }: {}
  let sxh = getSxhParam()
  defHttp.post({
    url: api.list,
    params: {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
      db: query.db
    },
    data: {
      slbh: query.slbh,
      qlrlb: props.qlrxx.qlrlxmc,
      ...ywh,
      ...bdcdyh,
      ...sxh
    }
  }, { withToken: true }).then((res) => {
    if (res && res.success) {
      tableData.value = res.result.records
      pagination.value.total = res.result.total
      emit('getList')
    }
  })
}

/**
 * 是否要传sxh参数
 */
function getSxhParam() {
  let sxh = {}
  let item = props.qlrxx
  // let regtype = props.regType
  // switch (regtype) {
  //   case '0102,0102':
  //   case '0204,0102,0201':
  //   case '0103,0102':
  //     sxh = { sxh: item.sxh }
  //     break;
  //   default:
  //     break;
  // }
  // 临时都传
  return { sxh: item.sxh }
  // return sxh
}

/**
 * 操作按钮
 * @param name
 * @param record
 */
function handleFun(name, record) {
  console.log('fun',fun) // 防止打包被移除
  eval(`fun['${name}'](record)`)
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
  let formId = (['查封机关','查封申请人','居住权人','债务人','权利人代理人','义务人代理人','申请执行人'].includes(props.qlrxx.qlrlxmc)) 
      ? ( props.formType == 'modal' ? '117' : '109' )
      : ( props.formType == 'modal' ? '116' : '55' )
  if (tableData.value.length > 0 && tableData.value[0].gyfs == '0') {
    message.warning('该权利人共有方式为单独所有,不允许再添加')
  } else if (tableData.value.length == 2 && tableData.value[0].gyfs == '1') {
    message.warning('该权利人共有方式为共同所有,只允许添加两个权利人!') 
  } else {
    let modal = cModal({
      title: '新增' + props.qlrxx.qlrxsmc,
      width: '70vw',
      filePath: 'views/bdc/public/GenPublic',
      formData: {
        formId: formId,
        ywh: props.ywh,
        bdcdyh: props.bdcdyh,
        slbh: query.slbh,
        qlrlb: props.qlrxx.qlrlxmc,
        qlrList: tableData.value,
        sxh: props.qlrxx.sxh,
        type: 'add'
      },
      onOk: async (res) => {
        if (res && res.saveQlrData) {
          let _result = await res.saveQlrData('add')
          if (_result) {
            modal.destroy()
            initData()
            emit('getTbxx', props.qlrxx.tbxx)
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
  let formId = (['查封机关','查封申请人','居住权人','债务人','权利人代理人','义务人代理人','申请执行人'].includes(props.qlrxx.qlrlxmc))
      ? ( props.formType == 'modal' ? '117' : '109' )
      : ( props.formType == 'modal' ? '116' : '55' )
  let qlrid = props.formType == 'modal' ? { qlrid: record.qlrid } : {}
  cModal({
    title: '查看' + props.qlrxx.qlrxsmc,
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: formId,
      iszd: '1',
      ywh: record.ywh,
      qlrmc: record.qlrmc,
      zjh: record.zjh,
      type: 'look',
      ...qlrid
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
  let formId = (['查封机关','查封申请人','居住权人','债务人','权利人代理人','义务人代理人','申请执行人'].includes(props.qlrxx.qlrlxmc)) 
      ? ( props.formType == 'modal' ? '117' : '109' )
      : ( props.formType == 'modal' ? '116' : '55' )
  let qlrid = props.formType == 'modal' ? { qlrid: record.qlrid } : {}
  let modal = cModal({
    title: '编辑' + props.qlrxx.qlrxsmc,
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: formId,
      slbh: query.slbh,
      ywh: record.ywh,
      bdcdyh: record.bdcdyh || props.bdcdyh,
      qlrlb: props.qlrxx.qlrlxmc,
      qlrList: tableData.value,
      qlrmc: record.qlrmc,
      zjh: record.zjh,
      type: 'edit',
      ...qlrid
    },
    onOk: async (res) => {
      if (res && res.saveQlrData) {
        let _result = await res.saveQlrData('edit')
        if (_result) {
          modal.destroy()
          initData()
          emit('getTbxx', props.qlrxx.tbxx)
        }
      }
    }
  })
}

function handleJtcy(record) {
  let formId = 177
  cModal({
    title: '家庭成员',
    width: '70vw',
    filePath: 'views/bdc/public/GenPublic',
    formData: {
      formId: formId,
      cbfbm: record.zjh,
      iszd: props.disabled ? '1' : '0'
    },
    footer: false
  })
}

/**
 * 删除
 * @param record
 */
function handleDel(record) {
  let qlrid = props.formType == 'modal' ? { qlrid: record.qlrid } : {}
  defHttp.post({
        url: '/api/zrzy-bdc/bdc/qlr/deleteQlr',
        data: {
          qlrmc: record.qlrmc, 
          zjh: record.zjh, 
          slbh: route.query.slbh,
          qlrlb: props.qlrxx.qlrlxmc,
          sxh: props.qlrxx.sxh,
          ...qlrid
        }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        initData()
        message.success('删除成功')
        emit('getTbxx', props.qlrxx.tbxx)
      } else {
        message.warning('删除失败')
      }
  })
}

defineExpose({
  initData,
  tableData,
  qlrlxmc
})
</script>

<style lang="less" scoped>
.qlr {
  margin-bottom: 10px;
}

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