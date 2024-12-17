<template>
  <div class="wonder-table-form" v-if="header">
      <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
          <a-row :gutter="[0, 8]" tyle="flex">
              <a-col :span="8" :offset="0">
                  <a-form-item label="标题">
                      <a-input v-model:value="formData.title" allowClear />
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
    <div class="wonder-table-toolbar" v-if="header">
        <a-button type="primary" @click="handleModal('new')">
            <template #icon>
                <plus-outlined />
            </template>
            新增
        </a-button>
    </div>
      <a-spin :spinning="spinning">
          <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
              @change="onChange($event, loadData)">
              <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'priority'">
                      <span>
                          <a-tag color="red" v-if="record.priority == 'H'">
                              高
                          </a-tag>
                          <a-tag color="yellow" v-else-if="record.priority == 'M'">
                              中
                          </a-tag>
                          <a-tag color="green" v-else-if="record.priority == 'L'">
                              低
                          </a-tag>
                      </span>
                  </template>
                  <template v-if="column.dataIndex === 'send_status'">
                      <span>
                          <a-tag color="green" v-if="record.send_status == '1'">
                              已发布
                          </a-tag>
                          <a-tag color="red" v-else-if="record.send_status == '0'">
                              未发布
                          </a-tag>
                      </span>
                  </template>
                  <template v-if="column.key === 'action'">
                      <a-space>
                          <template #split>
                              <a-divider type="vertical" />
                          </template>
                          <a @click="handleModal('edit', record)">编辑</a>
                          <a-dropdown>
                            <a class="ant-dropdown-link" @click.prevent>
                                更多
                                <DownOutlined />
                            </a>
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item>
                                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消"
                                            @confirm="handleDelete(record)">
                                            <a>删除</a>
                                        </a-popconfirm>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a @click="handlePublish(record)">发布</a>
                                    </a-menu-item>
                                    <a-menu-item>
                                        <a @click="handleModal('view', record)">查看</a>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown> 
                      </a-space>
                  </template>
              </template>
          </a-table>
      </a-spin>
  </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref, createVNode } from 'vue';
import { SearchOutlined, RedoOutlined, DownOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { Modal, message } from "ant-design-vue";
import { cModal } from "/@/components/cModal/index"

enum api {
  tasklist = '/api/zrzy-bdc/act/task/list',
  delUrl = "/api/zrzy-bdc/bdcdj/lcsc/deleteWfAndBusinessData"
}
let datalist = ref([]);
let formData: any = ref({})
let spinning = ref<boolean>(true);
const columns = [
  { title: "标题", dataIndex: "title", align: "center", width: 300 },
  { 
    title: "消息类型", 
    dataIndex: "msg_category", 
    align: "center", 
    customRender: ({text}) => {
      return Number(text) === 1 ? '通知公告' : Number(text) === 2 ? '系统消息' : '公示公告'
    } 
  },
  { title: "发布人", dataIndex: "create_by", align: "center", key: "create_by" },
  { 
    title: "优先级", dataIndex: "priority", align: "center" },
  { 
    title: "通告对象", 
    dataIndex: "msg_type", 
    align: "center",
    customRender: ({text}) => {
      return text === 'USER' ? '指定用户' : '全体用户'
    } 
  },
  { 
    title: "发布状态", dataIndex: "send_status", align: "center"},
  { title: "发布时间", dataIndex: "send_time", align: "center" },
  { title: "撤销时间", dataIndex: "cancel_time", align: "center" },
  { title: "公示开始时间", dataIndex: "start_time", align: "center" },
  { title: "公示结束时间", dataIndex: "end_time", align: "center" },
  { title: '操作', key: 'action', width: 200, align: "center" }
]
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
      return `共 ${pagination.value.total} 条数据`
  }
})

const props = defineProps({
  header: {
    type: Boolean,
    default: true
  }
})

loadData()

function loadData() {
  spinning.value = true
  defHttp.post({ 
    url: api.tasklist, 
    params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }, 
    data: { title: formData.value.title } 
  }, { withToken: true }).then(res => {
      if (res.success) {
          const result: any = {
            records: [{
              id: 1,
              title: '测试1',
              msg_content: '测试1',
              priority: 'H',
              send_status: '0',
              msg_category: "2",
              msg_type: 'USER'
            },
            {
              id: 2,
              title: '测试2',
              msg_content: '测试2',
              priority: 'M',
              send_status: '1',
              msg_category: '1',
              msg_type: 'ALL'
            }],
            total: 2
          }
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
* 编辑
* @param record 
*/
function handleModal(type: any, record: any = null) {
  let modal = cModal({
    title: type == 'new' ? '新增' : type == 'edit' ? `编辑【${record.title}】` : `查看【${record.title}】`,
    width: 1000,
    filePath: 'views/system/tzgg/components/tzggModal',
    footerStyle: { 'text-align': 'center' },
    footer: type == 'view' ? false : true,
    formData: {
      type: type,
      record: record
    },
    onOk: async (res: any) => {
      modal.setConfirmLoading(true)
      // res为弹窗内组件的dom
      let validator = await res.onSubmit()
      if (validator) {
        modal.destroy()
      }
      modal.setConfirmLoading(false)
    },
    onCancel: () => {
      modal.close()
    }
  })
}
/**
* 删除
* @param id 
*/
function handleDelete(id: string) {
  defHttp.delete(
      { url: api.delUrl, params: { id: id } }, { withToken: true }
  ).then((res: any) => {
      if (res?.success) {
          message.success('删除成功！')
          loadData()
      } else {
          message.warning(res?.message)
      }
  })
}
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>