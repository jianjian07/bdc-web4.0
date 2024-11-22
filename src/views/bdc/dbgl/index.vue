<template>
  <div class="wonder-table-form">
      <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
          <a-row :gutter="[0, 8]" tyle="flex">
              <a-col :span="8" :offset="0">
                  <a-form-item label="案卷名称">
                      <a-input v-model:value="formData.processDefinitionName" />
                  </a-form-item>
              </a-col>
              <a-col :span="8" :offset="0">
                  <a-form-item label="案卷编号">
                      <a-input v-model:value="formData.id" />
                  </a-form-item>
              </a-col>
              <a-col :span="4" :offset="0">
                  <a-form-item style="text-align: center;">
                      <a-space>
                          <a-button type="primary" @click="searchData">
                              <template #icon>
                                  <component :is="SearchOutlined"></component>
                              </template>查询</a-button>
                          <a-button @click="clear">
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
      <a-spin :spinning="spinning">
          <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
              @change="onChange($event, loadData)">
              <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'action'">
                      <a-space>
                        <template #split>
                          <a-divider type="vertical" />
                        </template>
                        <a-popconfirm
                          v-if="record.isSupervise!=''&& record.isSupervise==='1'"
                          title="确定取消督办吗?"
                          @confirm="() => handleRestart(record.id)"
                        >
                          <a>取消</a>
                        </a-popconfirm>
                        <a v-if="record.isSupervise!=''&& record.isSupervise==='0'"
                          @click="handleOper(record)">督办</a>
                      </a-space>
                  </template>
              </template>
          </a-table>
      </a-spin>
  </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref } from 'vue';
import { SearchOutlined, RedoOutlined, RollbackOutlined, AlertOutlined } from '@ant-design/icons-vue';
import { router } from "/@/router";
import { message } from 'ant-design-vue';
import { cModal } from "/@/components/cModal/index"
import { getQlqtqkBySLBH, getQlqtqkByMap } from "/@/utils/form/commonUtils"

enum api {
  tasklist = '/api/zrzy-bdc/act/processInstance/susperviselist',
  restart = '/api/'
}
let datalist = ref([]);
let formData: any = ref({})
let spinning = ref<boolean>(true);
const columns = [
  {
    title: '案卷编号',
    align: 'center',
    width: 120,
    dataIndex: 'processInstanceId'
  },
  {
    title: '案卷名称',
    dataIndex: 'bpmBizTitle',
    width: 200,
    align: "center",
  },
  {
    title: '流程名称',
    align: 'center',
    width: 200,
    dataIndex: 'prcocessDefinitionName'
  },
  {
    title: '当前任务',
    align: 'center',
    width: 150,
    dataIndex: 'name'
  },
  {
    title: '办理人',
    align: 'center',
    width: 120,
    dataIndex: 'assigneeName'
  },
  {
    title: '状态',
    align: 'center',
    dataIndex: 'isSupervise',
    width: 100,
    customRender: function(t) {
      if (t === '1') {
        return '已督办'
      } else {
        return '未督办'
      }
    }
  },
  {
    title: '操作',
    dataIndex: 'action',
    align: 'center',
    width: 100,
  }
]

let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
      return `共 ${pagination.value.total} 条数据`
  }
})
loadData()
function loadData() {
  spinning.value = true
  defHttp.get({ url: api.tasklist, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then(res => {
      if (res.success) {
          const result = res.result
          datalist.value = result.records
          pagination.value.total = result.total
      }
      spinning.value = false
  }).catch(_err => {
      spinning.value = false
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
* 分页
* @param pag
* @param callback 回调函数
*/
function onChange(pag: any, callback: any) {
  pagination.value.current = pag.current
  callback()
}
/**
* 重置
*/
function clear() {
  formData.value = {}
  loadData()
}
/**
* 取消督办
* @param id 
*/
function handleRestart(id) {
  let params = {
    processInstanceId: id
  }
  defHttp.get({
    url: api.restart,
    params: params
  },{ withToken: true }).then((res: any) => {
      if (res.success) {
        message.success(res.message)
        loadData()
    } else {
        message.warn(res.message)
    }
  })
}

/**
* 督办
* @param record 
*/
function handleOper(record: any) {
  let modal = cModal({
    title: '督办',
    width: 600,
    filePath: 'views/bdc/dbgl/dbModal',
    footerStyle: {'text-align': 'center'},
    formData: {
      record: record
    },
    onOk: async (res: any) => {
      modal.setConfirmLoading(true)
      // res为弹窗内组件的dom
      let validator = await res.onSubmit()
      if (validator) {
        modal.destroy()
        loadData()
      }
      modal.setConfirmLoading(false)
    },
    onCancel: () => {
      modal.close()
    }
  })
}

async function handleTest() {
  let viewData:any = ref({bdc_djzb: {
    zcs: '5'
  }})
  let result1 = await getQlqtqkByMap('FWSCDJ19980040240002', '19980040240001', viewData)
  let result2 = await getQlqtqkBySLBH('FWSCDJ19980040240002', viewData)

  console.log('result', result1, result2)
}
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>