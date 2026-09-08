<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="8" :offset="0">
          <a-form-item label="表名">
            <a-input v-model:value="formData.tblName" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="8" :offset="0">
          <a-form-item label="字段名">
            <a-input v-model:value="formData.colName" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="4" :offset="0">
          <a-form-item style="text-align: center;">
            <a-space>
              <a-button type="primary" @click="loadData('query')">
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
      <a-button v-permission="'online:report:view'" type="primary" @click="addData">
        <template #icon>
          <plus-outlined/>
        </template>
        新增
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="datalist" :pagination="pagination" :loading="loading"
             @change="onChange($event, loadData)">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'isEncode'">
                    <span>
                        <a-tag v-if="record.isEncode === 1" color="green"
                               style="padding-left:15px;padding-right:15px;">是</a-tag>
                        <a-tag v-else color="red" style="padding-left:15px;padding-right:15px;">否</a-tag>
                    </span>
        </template>
        <template v-if="column.key === 'action'">
                    <span>
                        <a @click="editData(record)">编辑</a><a-divider type="vertical"/>
                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消"
                                      @confirm="deleteData(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </span>
        </template>
      </template>
    </a-table>
  </div>
  <data-modal v-if="open" :open="open" :data="data" :title="title" @ok="handOver"></data-modal>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios"
import { ref, onMounted, defineAsyncComponent } from "vue"
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

enum api {
  list = '/api/zrzy-form/metadata/list',
  del = '/api/zrzy-form/metadata/del',
}

const DataModal = defineAsyncComponent(() => import("/@/views/system/metadata/components/DataModal.vue"))
const columns = [
  { title: "ID", dataIndex: "id", width: 80 },
  { title: "表名", dataIndex: "tblName", width: 180 },
  { title: "字段名", dataIndex: "colName", width: 200 },
  { title: "加密", dataIndex: "isEncode", width: 150 },
  { title: "字段描述", dataIndex: "colComment" },
  { title: '操作', key: 'action', width: 150 }
]
let datalist: any = ref([])
let formData: any = ref([])
let data = ref({})
let title = ref('')
let open = ref(false)
onMounted(() => {
  loadData() // 初始化加载数据
})
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})
let loading = ref(false)

/**
 * 表格数据加载
 */
async function loadData(type?: string | undefined) {
  // 解决翻页后查询不到的问题
  if (type == 'query') {
    pagination.value = {
      total: 0,
      current: 1,
      pageSize: 10,
    }
  }
  loading.value = true
  defHttp.post({
    url: api.list,
    data: { tblName: formData.value.tblName || '', colName: formData.value.colName || '' },
    params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }
  }, { withToken: true }).then((res) => {
    if (res.success) {
      const { records, total } = res.result
      datalist.value = records
      pagination.value.total = total
    }

    loading.value = false
  }).catch(err => {
    console.info(err)
    loading.value = false
  })
}

/**
 * 重置
 */
function refreshData() {
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
 * 添加表单
 */
function addData() {
  title.value = "新增"
  data.value = {}
  open.value = true
}

/**
 * 编辑表单
 */
function editData(record: any) {
  title.value = '编辑'
  data.value = record
  open.value = true
}

/**
 * 删除表单
 */
function deleteData(record) {
  if (!record.id) return
  defHttp.post({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (!res.message) {
      message.success('删除成功')
      loadData()
    } else {
      message.error('删除失败' + res.message)
    }
  }).catch(err => {
    message.error('删除失败')
  })
}

/**
 * 表单创建后回调
 * @param val { refresh: boolean}
 */
function handOver(val: any) {
  if (val.refresh) {
    loadData()
  }
  open.value = false
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
