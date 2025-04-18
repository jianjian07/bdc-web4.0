<template>
  <div class="gd-list">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :offset="0" :span="8">
          <a-form-item label="案卷名称">
            <a-input v-model:value="formData.ajmc" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :offset="0" :span="8">
          <a-form-item label="受理编号">
            <a-input v-model:value="formData.slbh" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item style="margin-left: 20px">
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
    <div class="wonder-table-header">
      <a-space>
        <a-button type="primary" @click="batchGd">批量归档</a-button>
        <a-button v-if="selectedValue.length" @click="clearSelected">清空</a-button>
      </a-space>
    </div>
    <div style="margin-bottom: 10px">
      <a-alert show-icon type="info">
        <template #message>
          已选择 <a style="font-weight: 600">{{ selectedValue.length }}&nbsp;</a>项
        </template>
      </a-alert>
    </div>
    <div class="wonder-table-css">
      <a-spin :spinning="spinning">
        <a-table :columns="columns" :data-source="datalist" :pagination="pagination" :row-selection="rowSelection"
                 row-key="slbh" @change="onChange($event, loadData)">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'ajmc'">
              <a-space :size="2">
                <template #split>
                  <a-divider type="vertical"/>
                </template>
                <a @click="itemView(record)">{{ record.ajmc }}</a>
              </a-space>
            </template>
            <template v-if="column.key === 'taskTimeStatus'">
                <span>
                  <a-space>
                    <a-tag v-if="record.taskTimeStatus == 1" color="orange">
                        <template #icon>
                            <RollbackOutlined/>
                        </template>
                        预警
                    </a-tag>
                    <a-tag v-if="record.taskTimeStatus == 2" color="red">
                        <template #icon>
                            <AlertOutlined/>
                        </template>
                        超时
                    </a-tag>
                    <a-tag v-if="record.taskTimeStatus == 0" color="green">正常</a-tag>
                    <a-tooltip key="blue" :color="color" :title="'委托人: ' + record.taskOwnerName">
                      <a-tag v-if="record.taskDelegation" color="blue" style="cursor: pointer">
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
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { router } from "/@/router"
import { defHttp } from "/@/utils/http/axios"
import { message, Modal } from "ant-design-vue"
import {
  SearchOutlined,
  RedoOutlined,
  RollbackOutlined,
  AlertOutlined,
  ExclamationCircleOutlined,
  SolutionOutlined
} from '@ant-design/icons-vue'

let spinning = ref<boolean>(false)
let datalist = ref<any>([])
let formData = ref<any>({})
let pagination = ref<any>({
  total: 0,
  current: 1,
  pageSize: 10,
})
const columns = [
  { title: "任务id", dataIndex: "taskId", align: "center" },
  { title: "状态", dataIndex: "taskTimeStatus", align: "center", key: "taskTimeStatus", width: 100 },
  { title: "案卷名称", dataIndex: "ajmc", align: "center", key: 'ajmc' },
  { title: "受理编号", dataIndex: "slbh", align: "center" },
  { title: "办理时间", dataIndex: "taskBeginTime", align: "center" },
  { title: "办理节点", dataIndex: "taskName", align: "center" },
  // { title: '操作', key: 'action', width: 100, align: "center" }
]

let selectedValue = ref<any>([])
let selectedRow = ref<any>([])
const rowSelection = computed(() => {
  return {
    type: 'checkbox',
    selectedRowKeys: selectedValue.value,
    onSelect(record: any, selected: any) {
      selectRow(selected, record)
    },
    onSelectAll(selected: any, _selectionRows: any, changeRows: any) {
      if (selected) {
        selectedRow.value = selectedRow.value.concat(changeRows)
      }
      if (!selected) {
        let selectionRows = JSON.parse(JSON.stringify(selectedRow.value))
        const delIndex: any = []
        selectionRows.forEach((item: any, index: any) => {
          changeRows.forEach((val: any) => {
            if (item['slbh'] === val['slbh']) {
              delIndex.push(index)
            }
          })
        })
        delIndex.forEach((item: any) => {
          delete selectionRows[item]
        })
        selectionRows = selectionRows.filter((item: any) => {
          return item !== undefined
        })
        selectedRow.value = selectionRows
      }
      selectedValue.value = selectedRow.value.map((m: any) => m['slbh'])
    }
  }
})

enum api {
  list = '/api/zrzy-bdc/act/task/list',
  gd = '/api/zrzy-bdc/bdc/process/completeBatch'
}

onMounted(() => {
  loadData()
})

function selectRow(selected: any, record: any) {
  if (selected) {
    selectedRow.value.push(record)
  } else {
    const delIndex = selectedRow.value.findIndex((val: any) => {
      return val['slbh'] === record['slbh']
    })
    selectedRow.value.splice(delIndex, 1)
  }
  selectedValue.value = selectedRow.value.map(m => m['slbh'])
}

function loadData() {
  spinning.value = true
  defHttp.post({
    url: api.list,
    params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize },
    data: { ajmc: formData.value.ajmc, slbh: formData.value.slbh, taskName: '归档', isAll: true }
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
 * 查询
 */
function searchData() {
  pagination.value.current = 1
  loadData()
}

/**
 * 重置
 */
function clear() {
  formData.value = {}
  loadData()
}

/**
 * 查看历史
 * @param record
 */
function itemView(record) {
  router.push('/task/hisTaskDeal?slbh=' + record.slbh)
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
 * 批量归档
 */
function batchGd() {
  if (selectedValue.value.length) {
    let data = selectedRow.value.map((row) => {
      return {
        slbh: row.slbh,
        taskId: row.taskId
      }
    })
    Modal.confirm({
        title: "确定要进行归档吗？",
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          defHttp.post({ url: api.gd, data: data }, { withToken: true }).then((res) => {
            if (res && res.success) {
              message.success(res?.message || '归档成功!')
              clearSelected()
              loadData()
            } else {
              message.warning(res?.message || '归档失败!')
            }
          })
        }
    })
    
  } else {
    message.warning('请先选择一条数据再进行归档!')
  }
}

/**
 * 清空选中的数据
 */
function clearSelected() {
  selectedValue.value = []
  selectedRow.value = []
}
</script>

<style lang="less" scoped>
.gd-list {
  padding: 10px;
}

.wonder-table-header {
  margin-bottom: 10px;
}
</style>