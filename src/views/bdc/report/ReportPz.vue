<template>
  <div class="report-pz">
    <div style="display: flex; flex-direction: column; height: 100%">
      <div style="line-height: 3em; background-color: #fff;padding: 10px 0px;">
        <div style="text-align: right;padding-right: 20px;">
          当前选中流程
          【<span style="color:#1890ff;font-weight: 600;">
                  {{ processInfo.title }}
              </span>】
        </div>
      </div>
      <div
          style="margin-top: 8px;line-height: 3em; background-color: #fff; flex: 1;height: calc(100% - 60px); overflow: auto">
        <CLCLB @select="onSelect" @setTreeData="setTreeData"></CLCLB>
      </div>
    </div>
    <div class="reportTabContent" style="height: 100%;padding: 10px;overflow: auto">
      <a-row>
        <a-col :span="12">
            <a-form-item label="权利类型">
                <a-select v-model:value="searchQllx" mode="multiple" :options="selectQllxOptions" allowClear style="width: 98%;" show-search optionFilterProp="label"  @change="initData">
                </a-select>
            </a-form-item>
        </a-col>
        <a-col :span="12" class="oprBtns">
          <a-button style="margin-bottom: 10px" type="primary" @click="handleAdd">新增</a-button>
        </a-col>
      </a-row>
        
      <a-table :columns="columns" :data-source="dataSource" :pagination="false" bordered size="small">
        <template #bodyCell="{ column, record, index }">
          <div v-if="column.dataIndex == 'index'" style="text-align: center">
            {{ index + 1 }}
          </div>
          <div v-if="column.dataIndex == 'action'" style="text-align: center">
            <a-space>
              <template #split>
                <a-divider type="vertical"/>
              </template>
              <a @click="handleEdit(record)">编辑</a>
              <a-popconfirm title="确定删除?" @confirm="handleDel(record)">
                <a>删除</a>
              </a-popconfirm>
            </a-space>
          </div>
        </template>
      </a-table>
      <a-modal v-model:open="modalVisible" :title="modalTitle" :width="800" @ok="handleModalOk">
        <a-form :label-col="{ span: 6 }" :model="currentRecord" :wrapper-col="{ span: 18 }" autocomplete="off"
                name="basic"
                style="padding: 10px">
          <a-form-item label="权利类型">
            <a-select v-model:value="currentRecord.qllxArr" :options="selectQllxOptions" allowClear show-search optionFilterProp="label"
                      mode="multiple"
                      style="width: 100%;">
            </a-select>
          </a-form-item>
          <a-form-item label="接入业务名称">
            <a-input v-model:value="currentRecord.jrywmc"></a-input>
          </a-form-item>
          <a-form-item label="接入业务编码">
            <a-input v-model:value="currentRecord.jrywbm"></a-input>
          </a-form-item>
          <a-form-item label="接入数据表">
            <a-select v-model:value="currentRecord.jrsjbArr" :options="reportTableOptions" allow-clear
                      mode="multiple"></a-select>
          </a-form-item>
          <a-form-item label="登记类型">
            <a-input v-model:value="currentRecord.djlx" readOnly></a-input>
          </a-form-item>
          <a-form-item label="权利表">
            <a-input v-model:value="currentRecord.qlb"></a-input>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'
import CLCLB from "/@/views/components/LCLB.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const activeKey = ref('1')
let processInfo: any = ref('')
let baseInfo: any = ref({})
let treeData: any = ref(null)
let dataSource: any = ref([])
let reportTableOptions = ref<any>([])
let modalVisible = ref<boolean>(false)
let modalTitle = ref<string>('新增')
let currentRecord = ref<any>({})
const columns = [
  {
    title: '序号',
    key: 'index',
    dataIndex: 'index',
    width: 60
  },
  {
    title: '接入业务名称',
    key: 'jrywmc',
    dataIndex: 'jrywmc',
    width: 250
  },
  {
    title: '接入业务编码',
    key: 'jrywbm',
    dataIndex: 'jrywbm',
    width: 100
  },
  {
    title: '权利类型',
    key: 'qllx',
    dataIndex: 'qllx',
    customRender: ({ text }) => {
      let arr = text ? (text.includes(',') ? text.split(',') : [text]) : []
      let _arr = arr.map(item => getDictItemsByCode('qllx').find(f => f.value == item)?.label)
      return _arr.join(',')
    }
  },
  {
    title: '操作',
    key: 'action',
    dataIndex: 'action',
    width: 120
  }
]

const qllxMap = {
  '100': ['9', '31', '35', '44', '33', '34', '41', '42'], // 排除
  '102': ['9', '31', '35', '44'],                        // 保留
  '103': ['33', '34', '41', '42'],                       // 保留
}
// 权利类型下拉框
let selectQllxOptions = ref<any>([])
// 权利类型查询条件
let searchQllx = ref<any>([])

enum api {
  list = '/api/zrzy-report/bdc/report/config/getConfigList',
  save = '/api/zrzy-report/bdc/report/config/saveOrUpdateConfig',
  options = '/api/zrzy-report/bdc/report/config/getAllFiledTable',
  del = '/api/zrzy-report/bdc/report/config/deleteConfig'
}

onMounted(() => {
  initOptions()
})

function initOptions() {
  defHttp.get({ url: api.options }, { withToken: true }).then((res) => {
    if (res && res.success) {
      reportTableOptions.value = res.result.map((m) => {
        return {
          title: m,
          value: m,
          key: m
        }
      })
    }
  })
}

function initData() {
  defHttp.get({ url: api.list, params: { djlx: processInfo.value.regType, qllx: searchQllx.value.join(',') } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      const pid = processInfo.value.pid
      const qllxFilter = qllxMap[pid]
      
      dataSource.value = res.result.filter((_r) => {
        if (!qllxFilter) return true 
      
        const qllxArr = _r.qllx.split(',')
        const hasAny = qllxFilter.some(item => qllxArr.includes(item))
        return pid === '100' ? !hasAny : hasAny
      })
      
      let qllxOptions: any = getDictItemsByCode('qllx') || []
      if (qllxFilter) {
        selectQllxOptions.value = pid === '100'
          ? qllxOptions.filter(opt => !qllxFilter.includes(opt.value))
          : qllxOptions.filter(opt => qllxFilter.includes(opt.value))
      } else {
        selectQllxOptions.value = [...qllxOptions]
      }
    }
  }).catch(err => {
    console.info(err)
  })
}

/**
 * 新增
 */
function handleAdd() {
  modalVisible.value = true
  modalTitle.value = '新增'
  currentRecord.value = {
    jrywmc: processInfo.value.title,
    djlx: processInfo.value.regType,
  }
}

/**
 * 编辑
 * @param record
 */
function handleEdit(record) {
  modalVisible.value = true
  modalTitle.value = '编辑'
  currentRecord.value = JSON.parse(JSON.stringify(record))
  currentRecord.value.qllxArr = currentRecord.value.qllx ? (currentRecord.value.qllx.includes(',') ? currentRecord.value.qllx.split(',') : [currentRecord.value.qllx]) : []
  currentRecord.value.jrsjbArr = currentRecord.value.jrsjb ? (currentRecord.value.jrsjb.includes(',') ? currentRecord.value.jrsjb.split(',') : [currentRecord.value.jrsjb]) : []
}

/**
 * 删除
 * @param record
 */
function handleDel(record) {
  defHttp.delete({ url: api.del, params: { id0: record.id0 } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      message.success('删除成功')
      initData()
    } else {
      message.error('删除失败')
    }
  })
}

/**
 * 选中流程事件
 * @param process 选中的流程
 */
function onSelect(process: any) {
  processInfo.value = process
  searchQllx.value = []
  initData()
}

/**
 * 目录树
 * @param process 选中的流程
 */
function setTreeData(data: any) {
  treeData.value = setTreeList(data)
}

function setTreeList(newArr, parentId?: any, parentName?: any) {
  let newData = newArr.map(item => {
    if (parentId) {
      item.pid = parentId
    }
    if (parentName) {
      item.pname = parentName
    }
    let pid = item.value
    let pname = item.title
    if (item.children) {
      item.children = setTreeList(item.children, pid, pname)
    }
    return item
  })
  return newData
}

function handleModalOk() {
  currentRecord.value.qllx = currentRecord.value.qllxArr?.join(',')
  currentRecord.value.jrsjb = currentRecord.value.jrsjbArr?.join(',')
  defHttp.post({ url: api.save, data: currentRecord.value }, { withToken: true }).then((res) => {
    if (res && res.message) {
      message.success(modalTitle.value + '成功!')
      modalVisible.value = false
      initData()
    } else {
      message.warning(modalTitle.value + '失败!')
    }
  }).catch(err => {
    message.warning(modalTitle.value + '失败!')
  })
}
</script>

<style lang="less" scoped>
.report-pz {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f5f5f5;
}

.reportTabContent {
  width: 100%;
  background-color: #fff;
  margin-left: 8px;
}
</style>