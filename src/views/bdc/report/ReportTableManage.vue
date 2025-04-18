<template>
  <div class="report-table-manage wonder-table-form">
    <a-form :label-col="{ style: { width: '150px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :offset="0" :span="8">
          <a-form-item label="上报视图/表名">
            <a-input v-model:value="formData.tableName" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :offset="0" :span="2">
          <a-form-item>
            <a-checkbox v-model:checked="checked">转小写</a-checkbox>
          </a-form-item>
        </a-col>
        <a-col :offset="0" :span="4">
          <a-form-item style="text-align: center;">
            <a-space>
              <a-button type="primary" @click="searchData">
                <template #icon>
                  <component :is="SearchOutlined"></component>
                </template>
                查询
              </a-button>
              <a-button @click="refreshData">
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
    <div class="wonder-table-toolbar">
      <a-space>
        <a-button type="primary" @click="addData">
          <template #icon>
            <plus-outlined/>
          </template>
          新增
        </a-button>
      </a-space>
    </div>
    <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
             rowKey="id" @change="onChange($event, loadData)">
      <template #bodyCell="{ column, record, index }">
        <div v-if="column.dataIndex == 'index'" style="text-align: center">
          {{ index + 1 }}
        </div>
        <template v-if="column.key == 'action'">
          <a-space>
            <template #split>
              <a-divider type="vertical" />
            </template>
             <a @click="editData(record)">编辑</a>
             <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消"
                @confirm="delData(record)">
                <a>删除</a>
             </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
  <a-drawer v-if="open" v-model:open="open" :footer-style="{ textAlign: 'right' }"
              :style="{ position: 'absolute' }" :title="title" :width="800" @close="onClose">
    <template #extra>
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
    <report-table-modal ref="reportRef" :title="title" :data="modalData" @ok="handOver"></report-table-modal>
  </a-drawer>
  
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue'
import { defHttp } from "/@/utils/http/axios"
import ReportTableModal from "/@/views/bdc/report/ReportTableModal.vue"
import { message } from "ant-design-vue"

let formData: any = ref([])
const columns = [
  { title: "序号", dataIndex: "index", width: 80 },
  { title: "上报视图/表名", dataIndex: "tableName", ellipsis: true },
  { title: "关键字段名", dataIndex: "keyValue", width: 200 },
  // { title: "上报字段", dataIndex: "reportValue", ellipsis: true },
  { title: "更新人", dataIndex: "updateBy", width: 120 },
  { title: "更新时间", dataIndex: "updateTime", width: 200 },
  { title: '操作', key: 'action', width: 150 }
]
let datalist: any = ref([])
let open = ref<any>(false)
let title = ref<any>('新增')
let modalData = ref<any>()
let reportRef = ref<any>()
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})
let checked = ref(true)
enum api {
  list = '/api/zrzy-report/bdc/report/config/getFieldList',
  save = '/api/zrzy-report/bdc/report/config/saveOrUpdateField',
  del = '/api/zrzy-report/bdc/report/config/deleteField'
}

onMounted(() => {
  loadData()
})

/**
 * 表格数据加载
 */
async function loadData() {
  let tableName = formData.value.tableName?.trim()
  if (tableName && checked.value) {
    tableName = tableName.toLowerCase()
  }
  defHttp.get({
    url: api.list,
    params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize, tableName: tableName }
  }, { withToken: true }).then((res) => {
    if (res && res.success) {
      const { records, total } = res.result
      datalist.value = records
      pagination.value.total = total
    }
  }).catch(err => {
      console.info(err)
  })
}

/**
 * 查询数据
 */
function searchData() {
  pagination.value.current = 1
  loadData()
}

/**
 * 重置
 */
function refreshData() {
  pagination.value.current = 1
  formData.value = {}
  loadData()
}

/**
 * 分页
 * @param pag
 * @param callback 回调函数
 */
function onChange(pag: any, callback: any) {
  pagination.value = pag
  callback()
}

/**
 * 添加
 */
function addData() {
  open.value = true
  title.value = '新增'
  modalData.value = {}
}

/**
 * 编辑
 * @param record
 */
function editData(record) {
  open.value = true
  title.value = '编辑'
  modalData.value = record
}

/**
 * 删除
 * @param record
 */
function delData(record) {
  defHttp.delete({ url: api.del, params: { id0: record.id0 } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      message.success('删除成功')
      loadData()
    } else {
      message.error('删除失败')
    }
  })
}

/**
 * 关闭弹窗
 */
function onClose() {
  open.value = false
}

/**
 * 确认
 */
function handleOk() {
  reportRef.value.handleOk()
}


function handOver(data) {
   defHttp.post({ url: api.save, data: data }, { withToken: true }).then((res) => {
     if (res && res.message) {
       message.success(title.value + '成功!')
       open.value = false
       loadData()
     } else {
       message.warning(title.value + '失败!')
     }
  }).catch(err => {
     message.warning(title.value + '失败!')
  })
}
</script>

<style lang="less" scoped>
@import url('/@/assets/less/table.less');

.report-table-manage {
  padding: 10px;
}
</style>