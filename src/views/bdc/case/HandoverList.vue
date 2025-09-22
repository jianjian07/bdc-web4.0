<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="6" :offset="0">
          <a-form-item label="受理编号">
            <a-input v-model:value="formData.slbh" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="流程类别">
            <a-select v-model:value="formData.lclx" :options="getDictItemsByCode('bpm_process_type')"
                      @change="onChangeLclx"/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="流程名称">
            <a-select v-model:value="formData.lcid" :options="lcmcList"/>
          </a-form-item>
        </a-col>
        <a-col :span="4" :offset="0">
          <a-form-item label="办理环节">
            <a-select ref="select" v-model:value="formData.taskName">
              <a-select-option value="收件">收件</a-select-option>
              <a-select-option value="缮证">缮证</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="6" :offset="0">
          <a-form-item label="不动产单元号">
            <a-input v-model:value="formData.bdcdyh" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="坐落">
            <a-input v-model:value="formData.zl" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="项目名称">
            <a-input v-model:value="formData.ajmc" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item style="text-align: center;">
            <a-space>
              <a-button type="primary" @click="searchData">
                <template #icon>
                  <component :is="SearchOutlined"></component>
                </template>
                查询
              </a-button>
              <a-button @click="clear">
                <template #icon>
                  <component :is="RedoOutlined"></component>
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="wonder-table-css">
    <!-- 添加批量操作按钮 -->
    <div style="margin-bottom: 5px;">
      <a-button type="primary" @click="batchHandover" :disabled="selectedRowKeys.length === 0">
        <template #icon>
          <component :is="SwapOutlined"></component>
        </template>
        批量移交 ({{ selectedRowKeys.length }})
      </a-button>
    </div>

    <a-spin :spinning="spinning">
      <a-table
          :columns="columns"
          :data-source="datalist"
          :pagination="pagination"
          @change="onChange($event, loadData)"
          :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onSelect: onSelectRow,
          onSelectAll: onSelectAll
          }"
          :row-key="record => record.taskId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ajmc'">
            <a @click="itemView(record)">{{ record.ajmc }}</a>
            <span v-if="record.taskSupervise" style="color: red;">【{{
                record.taskSuperviseUserRealName + "督办：" + record.taskSuperviseRemark
              }}】</span>
            <span v-if="record.taskUrgent"
                  style="color: red;">【{{ record.taskUrgentUserRealName + "加急：" + record.taskUrgentRemark }}】</span>
          </template>
          <template v-if="column.key === 'taskTimeStatus'">
            <span>
              <a-space>
                <a-tag color="orange" v-if="record.taskTimeStatus == 1">
                    <template #icon>
                        <RollbackOutlined/>
                    </template>
                    预警
                </a-tag>
                <a-tag color="red" v-if="record.taskTimeStatus == 2">
                    <template #icon>
                        <AlertOutlined/>
                    </template>
                    超时
                </a-tag>
                <a-tag color="green" v-if="record.taskTimeStatus == 0">正常</a-tag>
                <a-tooltip key="blue" :title="'委托人: ' + record.taskOwnerName">
                  <a-tag color="blue" v-if="record.taskDelegation" style="cursor: pointer">
                    <template #icon>
                      <SolutionOutlined/>
                    </template>
                    {{ record.taskOwnerName }}
                  </a-tag>
                </a-tooltip>
              </a-space>
            </span>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref, createVNode, onMounted } from 'vue'
import {
  SearchOutlined,
  RedoOutlined,
  RollbackOutlined,
  AlertOutlined,
  SolutionOutlined,
  SwapOutlined
} from '@ant-design/icons-vue';
import { router } from "/@/router";
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils.ts";
import { message, Modal } from "ant-design-vue";
import { cModal } from "/@/components/cModal/index.ts";

enum api {
  tasklist = '/api/zrzy-bdc/act/task/list',
  getLcListByLclx = '/api/zrzy-bdc/flow/flowConfig/getLcListByLclx'
}

// 流程名称下拉
let lcmcList = ref([])

let datalist = ref([]);
let formData: any = ref({
  lclx: "100",
  taskName: "收件"
})
let spinning = ref<boolean>(true);

// 当前页的选择状态
const currentPageSelectedRow = ref<string[]>([]);
// 选择状态
const selectedRowKeys = ref<string[]>([]);
// 受理编号集合
let slbhList = ref<string[]>([])

const columns = [
  { title: "任务id", dataIndex: "taskId", align: "center" },
  { title: "状态", dataIndex: "taskTimeStatus", align: "center", key: "taskTimeStatus", width: 100 },
  { title: "案卷名称", dataIndex: "ajmc", align: "center", key: "ajmc" },
  { title: "登记类别", dataIndex: "processDefinitionName", align: "center", key: "processDefinitionName" },
  { title: "受理编号", dataIndex: "slbh", align: "center" },
  { title: "当前节点", dataIndex: "taskName", align: "center" },
  { title: "时长", dataIndex: "durationStr", align: "center" },
  { title: "提交人", dataIndex: "processApplyUserName", align: "center" },
  { title: "提交时间", dataIndex: "taskBeginTime", align: "center" },
]

let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
    return `共 ${pagination.value.total} 条数据`
  },
  showSizeChanger: true,
  showQuickJumper: true
})

onMounted(async () => {
  await getLcmcByLclx(formData.value.lclx)
  loadData()
})

function loadData() {
  spinning.value = true
  let lcid = formData.value.lcid
  if (!lcid) {
    message.warning("流程id不允许为空，请选择流程名称!")
    spinning.value = false
    return
  }
  defHttp.post({
    url: api.tasklist,
    params: {
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize
    },
    data: {
      lcid: lcid,
      ajmc: formData.value.ajmc,
      slbh: formData.value.slbh,
      bdcdyh: formData.value.bdcdyh,
      zl: formData.value.zl,
      taskName: formData.value.taskName
    }
  }, { withToken: true }).then(res => {
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
 * 流程类型下拉
 */
function onChangeLclx(_value) {
  if (_value) {
    getLcmcByLclx(_value)
  }
}

/**
 * 流程名称下拉
 */
function getLcmcByLclx(lclx) {
  return new Promise((resolve, reject) => {
    defHttp.get({ url: api.getLcListByLclx, params: { lclx: lclx } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        lcmcList.value = res.result.map(item => {
          return {
            value: item.lcid,
            label: item.lcmc
          }
        })
        if (lcmcList.value.length > 0) {
          formData.value.lcid = lcmcList.value[0].value
        } else {
          formData.value.lcid = undefined
        }
        resolve(true)
      } else {
        reject(false)
      }
    }).catch(err => {
      reject(false)
    })
  })
}

/**
 * 查询
 */
function searchData() {
  pagination.value.current = 1
  // 清空已选中的行
  currentPageSelectedRow.value = []
  selectedRowKeys.value = []
  slbhList.value = []
  loadData()
}

/**
 * 分页
 * @param pag
 * @param callback 回调函数
 */
function onChange(pag: any, callback: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  callback()
}

/**
 * 重置
 */
async function clear() {
  formData.value = {
    lclx: "100",
    taskName: "收件"
  }
  // 清空已选中的行
  currentPageSelectedRow.value = []
  selectedRowKeys.value = []
  await getLcmcByLclx(formData.value.lclx)
  loadData()
}

/**
 * 查看项目信息
 */
function itemView(record: any) {
  router.push('/task/hisTaskDeal?slbh=' + record.slbh)
}

/**
 * 单个勾选操作
 */
function onSelectRow(record: any, selected: any) {
  if (selected) {
    currentPageSelectedRow.value.push(record)
  } else {
    const delIndex = currentPageSelectedRow.value.findIndex((val: any) => {
      return val['taskId'] === record['taskId']
    })
    currentPageSelectedRow.value.splice(delIndex, 1)
  }
  selectedRowKeys.value = currentPageSelectedRow.value.map(m => m['taskId'])
  slbhList.value = currentPageSelectedRow.value.map(m => m['slbh'])
}

/**
 * 全选操作
 */
function onSelectAll(selected: any, _selectionRows: any, changeRows: any) {
  if (selected) {
    currentPageSelectedRow.value = currentPageSelectedRow.value.concat(changeRows)
  } else {
    const changeRowIds = new Set(changeRows.map((row: any) => row['taskId']))
    currentPageSelectedRow.value = currentPageSelectedRow.value.filter((item: any) => {
      return !changeRowIds.has(item['taskId'])
    })
  }
  selectedRowKeys.value = currentPageSelectedRow.value.map((m: any) => m['taskId'])
  slbhList.value = currentPageSelectedRow.value.map(m => m['slbh'])
}

/**
 * 批量移交
 */
function batchHandover() {
  let firstRecord = datalist.value[0]
  let modal = cModal({
    title: '移交',
    width: '45vw',
    filePath: 'views/bdc/public/HandleModalPL',
    formData: {
      taskIdList: selectedRowKeys.value,
      nodeName: firstRecord.taskName,
      slbhList: slbhList.value,
      taskDefKey: firstRecord.taskDefKey,
    },
    onOk: async (res: any) => {
      if (res) {
        // 刷新列表
        loadData()
        modal.destroy()
      }
    }
  })
}
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
