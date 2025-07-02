<template>
  
</template>
<!-- <template>
  <div class="api-profile wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="8" :offset="0">
          <a-form-item label="配置名称">
            <a-input v-model:value="formData.apiName" />
          </a-form-item>
        </a-col>
        <a-col :span="8" :offset="0">
          <a-form-item label="配置编码">
            <a-input v-model:value="formData.apiCode" />
          </a-form-item>
        </a-col>
        <a-col :span="4" :offset="0">
          <a-form-item style="text-align: center;">
            <a-space>
              <a-button type="primary" @click="searchData">
                <template #icon>
                  <component :is="SearchOutlined"></component>
                </template>查询</a-button>
              <a-button @click="refreshData">
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
    <div class="wonder-table-toolbar">
      <a-space>
        <a-button type="primary" @click="add">
          <template #icon>
            <plus-outlined />
          </template>
          新增
        </a-button>
      </a-space>
    </div>
    <a-table :columns="columns" :data-source="datalist" :pagination="pagination" @change="onChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="edit(record)">编辑</a>
            <a-popconfirm title="是否确定删除该数据字典项？" ok-text="确定" cancel-text="取消" @confirm="del(record)">
              <a>删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
    <api-profile-modal ref="refModal" @ok="handleModalOk"></api-profile-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { defHttp } from "/@/utils/http/axios"
import ApiProfileModal from "/@/views/data/apimanage/modules/apiProfileModal.vue"
import { message } from "ant-design-vue"
const columns = [
  { title: "配置名称", dataIndex: "apiName" },
  { title: "接口编码", dataIndex: "apiCode" },
  { title: "版本", dataIndex: "versionCode" },
  { title: "配置项内容", dataIndex: "content", ellipsis: true },
  { title: "备注", dataIndex: "remark",  ellipsis: true },
  { title: '操作', key: 'action', width: 250 }
]
let datalist: any = ref([]);
let formData: any = ref([]);
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})
let refModal = ref()

enum api {
  list = '/api/zrzy-api/onlapiContent/getOnlApiContent',
  del = '/api/zrzy-api/onlapiContent/deleteOnlApiContent'
}

onMounted(() => {
  loadData() // 初始化加载数据
})

/**
 * 表格数据加载
 */
async function loadData() {
  let params = {
    apiCode: formData.value.apiCode,
    apiName: formData.value.apiName,
    page: pagination.value.current,
    size: pagination.value.pageSize
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      datalist.value = res.result.records
      pagination.value.total = res.result.total
      pagination.value.current = res.result.current
    }
  }).catch(err => {
    // console.info(err)
  })
}

/**
 * 添加
 */
function add() {
  refModal.value.add()
}

/**
 * 编辑
 */
function edit(record) {
  refModal.value.edit(record)
}

/**
 * 删除
 * @param record
 */
function del(record) {
  defHttp.delete({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      message.success('删除成功')
      loadData()
    } else {
      message.error('删除失败')
    }
  })
}

/**
 * 弹窗确认
 */
function handleModalOk() {
  loadData()
}

/**
 * 重置
 */
function refreshData() {
  formData.value = {}
  loadData()
}
/**
 * 查询
 */
function searchData() {
  pagination.value.current = 1
  loadData()
}

/**
 * 表格变化事件
 * @param e
 */
function onChange(pag) {
  pagination.value = pag
  loadData()
}
</script>

<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');

</style> -->
