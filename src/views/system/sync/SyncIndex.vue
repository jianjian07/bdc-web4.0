<template>
  <div class="data-sync-index wonder-table-form">
      <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="源表">
                        <a-input v-model:value="formData.sourceTable" />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="目标表">
                        <a-input v-model:value="formData.targetTable" />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="searchData">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询
                            </a-button>
                            <a-button @click="refreshData">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置
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
                <a-button type="primary" @click="add">
                    <template #icon>
                        <plus-outlined />
                    </template>
                    新增
                </a-button>
            </a-space>
        </div>
        <a-table :columns="columns" 
                 :data-source="dataList" 
                 :pagination="pagination"
                 @change="onChange($event, loadData)" 
                 :row-key="record => record.id">
            <template #bodyCell="{ column, record, index }">
               <template v-if="column.dataIndex == 'index'">
                  {{ index + 1 }}
               </template>
               <template v-else-if="column.dataIndex == 'operate'">
                  <a @click="edit(record)">编辑</a>
                  <a-divider type="vertical"/>
                  <a-popconfirm title="确定要删除这条记录吗?" @confirm="del(record)">
                    <a>删除</a>
                  </a-popconfirm>
                  
               </template>
            </template>
        </a-table>
<!--    <sync-modal ref="refModal" @ok="handleModalOk"></sync-modal>-->
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { PlusOutlined, SearchOutlined, RedoOutlined, DownOutlined } from '@ant-design/icons-vue';
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
// import SyncModal from "/@/views/system/sync/components/SyncModal.vue"
import { router } from "/@/router"
let formData = ref<any>({})
let dataList = ref<any>([])
let refModal = ref()
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60
  },
  {
    title: '同步名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '同步code',
    dataIndex: 'code',
    key: 'code'
  },
  {
    title: '源表',
    dataIndex: 'sourceDb',
    key: 'sourceDb'
  },
  {
    title: '目标表',
    dataIndex: 'targetDb',
    key: 'targetDb'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    width: 110
  },
]

let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})

enum api {
  list = '/api/zrzy-api/data/sync/list',
  del = '/api/zrzy-api/data/sync/delete'
}

onMounted(() => {
  loadData()
})

/**
 * 加载数据
 */
function loadData() {
  defHttp.get({ url: api.list, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      dataList.value = res.result.records
      pagination.value.total = res.result.total
      pagination.value.current = res.result.current
    } else {
      message.warning(res.message)
    }
  })
}

function searchData() {
  
}

function refreshData() {
  
}

function add() {
  router.push({ path: '/system/syncdesign' })
}

function edit(record) {
  router.push({ path: '/system/syncdesign', query: { id: record.id }  })
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
      message.warning('删除失败')
    }
  })
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

function handleModalOk() {
  loadData()
}
</script>

<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
.data-sync-index {
}
</style>