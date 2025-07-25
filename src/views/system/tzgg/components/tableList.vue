<template>
  <div class="wonder-table-form" v-if="operable">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="6" :offset="0">
          <a-form-item label="标题">
            <a-input v-model:value="formData.title" allowClear/>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="消息类型">
            <a-select v-model:value="formData.category" style="width: 100%" :options="getDictItemsByCode('tzggxxlx')"
                      allowClear></a-select>
          </a-form-item>
        </a-col>
        <a-col :span="4" :offset="0">
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
    <div class="wonder-table-toolbar" v-if="operable">
      <a-button type="primary" @click="handleModal('new')" style="margin-right: 8px">
        <template #icon>
          <plus-outlined/>
        </template>
        新增
      </a-button>
      <a-dropdown v-if="state.selectedRowKeys?.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchDelete">
              <DeleteOutlined/>
              删除
            </a-menu-item>
          </a-menu>
        </template>

        <a-button style="margin-right: 8px"> 批量操作
          <DownOutlined/>
        </a-button>
      </a-dropdown>
    </div>
    <a-spin :spinning="spinning">
      <a-table
          :columns="columns"
          :data-source="datalist"
          :pagination="pagination"
          @change="onChange($event, loadData)"
          :row-selection="operable ? rowSelection : false"
          :row-key="record => record.id">
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
          <template v-if="column.dataIndex === 'sendStatus'">
                    <span>
                        <a-tag color="green" v-if="record.sendStatus == '1'">
                            已发布
                        </a-tag>
                        <a-tag color="red" v-else-if="record.sendStatus == '0'">
                            未发布
                        </a-tag>
                        <a-tag color="orange" v-else-if="record.sendStatus == '2'">
                            已撤销
                        </a-tag>
                    </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <template #split>
                <a-divider type="vertical"/>
              </template>
              <a v-if="operable" @click="handleModal('edit', record)">编辑</a>
              <a v-else @click="handleModal('view', record)">查看</a>
              <a-dropdown v-if="operable">
                <a class="ant-dropdown-link" @click.prevent>
                  更多
                  <DownOutlined/>
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消"
                                    @confirm="handleDelete(record.id)">
                        <a>删除</a>
                      </a-popconfirm>
                    </a-menu-item>
                    <a-menu-item v-if="record.sendStatus != '1'">
                      <a @click="handlePublish(record, '1')">发布</a>
                    </a-menu-item>
                    <a-menu-item v-else>
                      <a @click="handlePublish(record, '2')">撤销</a>
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
import { ref, createVNode, reactive, watch, computed } from 'vue'
import {
  SearchOutlined,
  RedoOutlined,
  DownOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from "ant-design-vue"
import { cModal } from "/@/components/cModal/index"
import dayjs from 'dayjs'
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'

enum api {
  tasklist = '/api/zrzy-system/sys/sysTzgg/list',
  delUrl = "/api/zrzy-system/sys/sysTzgg/delete",
  deleteBatch = "/api/zrzy-system/sys/sysTzgg/deleteBatch",
  pubUrl = '/api/zrzy-system/sys/sysTzgg/updateStatusById'
}

let datalist = ref([])
let formData: any = ref({})
let spinning = ref<boolean>(true)
const state = reactive({
  selectedRowKeys: [] as any[]
})

const props = defineProps({
  operable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    default: null
  }
})

const columns = [
  {
    title: "标题",
    dataIndex: "title",
    align: "center",
    width: 300,
    show: true
  },
  {
    title: "消息类型",
    dataIndex: "msgCategory",
    align: "center",
    customRender: ({ text }) => {
      return getDictItemsByCode('tzggxxlx').find(f => f.value == text)?.label
    },
    show: true
  },
  {
    title: "发布人",
    dataIndex: "createBy",
    align: "center",
    key: "createBy",
    show: props.operable
  },
  {
    title: "优先级",
    dataIndex: "priority",
    align: "center",
    show: props.operable,
    sorter: {
      compare: (a, b) => a.priority - b.priority,
    },
  },
  {
    title: "通告对象",
    dataIndex: "msgType",
    align: "center",
    customRender: ({ text }) => {
      return text === 'USER' ? '指定用户' : '全体用户'
    },
    show: true
  },
  {
    title: "发布状态",
    dataIndex: "sendStatus",
    align: "center",
    show: true,
    sorter: {
      compare: (a, b) => a.sendStatus - b.sendStatus,
    },
  },
  {
    title: "发布时间",
    dataIndex: "sendTime",
    align: "center",
    show: props.operable,
    sorter: {
      compare: (a, b) => (new Date(a.sendTime)).getTime() - (new Date(b.sendTime)).getTime()
    },
  },
  {
    title: "撤销时间",
    dataIndex: "cancelTime",
    align: "center",
    show: props.operable,
    sorter: {
      compare: (a, b) => (new Date(a.cancelTime)).getTime() - (new Date(b.cancelTime)).getTime()
    },
  },
  {
    title: "公示开始时间",
    dataIndex: "startTime",
    align: "center",
    show: props.operable,
    sorter: {
      compare: (a, b) => (new Date(a.startTime)).getTime() - (new Date(b.startTime)).getTime()
    },
  },
  {
    title: "公示结束时间",
    dataIndex: "endTime",
    align: "center",
    show: props.operable,
    sorter: {
      compare: (a, b) => (new Date(a.endTime)).getTime() - (new Date(b.endTime)).getTime()
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    align: "center",
    show: true
  }
].filter(v => v.show)

let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
    return `共 ${pagination.value.total} 条数据`
  }
})

const rowSelection = computed(() => {
  return {
    selectedRowKeys: state.selectedRowKeys,
    onSelect(record: any, selected: boolean) {
      const id = record.id
      const keys = new Set(state.selectedRowKeys)
    
      if (selected) {
        keys.add(id)
      } else {
        keys.delete(id)
      }
    
      state.selectedRowKeys = Array.from(keys)
    },
    onSelectAll(selected: boolean, _selectionRows: any, changeRows: any[]) {
      const changeIds = changeRows.map((item: any) => item.id)
      const currentIds = new Set(state.selectedRowKeys)
    
      if (selected) {
        changeIds.forEach(id => currentIds.add(id))
      } else {
        changeIds.forEach(id => currentIds.delete(id))
      }
    
      state.selectedRowKeys = Array.from(currentIds)
    }
  }
})

watch(() => props.category, (val) => {
  if (val) {
    formData.value.category = val
  }
  loadData()
}, {
  immediate: true
})

function loadData() {
  spinning.value = true
  defHttp.get({
    url: api.tasklist,
    params: {
      title: formData.value.title,
      msgCategory: formData.value.category,
      issy: 0,
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize
    },
  }, { withToken: true }).then(res => {
    if (res.success) {
      const result: any = res.result
      datalist.value = result.records
      pagination.value.total = result.total
    }
    spinning.value = false
  }).catch(() => {
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
  state.selectedRowKeys = []
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
    footer: type != 'view',
    formData: {
      type: type,
      record: record
    },
    onOk: async (res: any) => {
      if (type != 'view') {
        modal.setConfirmLoading(true)
        // res为弹窗内组件的dom
        let validator = await res.onSubmit()
        if (validator) {
          loadData()
        }
        modal.setConfirmLoading(false)
      }
      modal.destroy()
    },
    onCancel: () => {
      modal.destroy()
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
      state.selectedRowKeys = state.selectedRowKeys.filter(v => v !== id)
      loadData()
    } else {
      message.warning(res?.message)
    }
  })
}

function batchDelete() {
  defHttp.delete({
    url: api.deleteBatch,
    params: {
      ids: state.selectedRowKeys.join(',')
    }
  }, {
    withToken: true
  }).then(res => {
    if (res && res.success) {
      message.warning('删除成功！')
      state.selectedRowKeys = []
      loadData()
    } else {
      message.warning('删除失败！')
    }
  })
}

/**
 * 发布
 * @param id
 */
function handlePublish(record: any, type: any) {
  defHttp.put(
      { url: api.pubUrl, params: { id: record.id, sendStatus: type } }, { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      message.success(type == '1' ? '发布成功！' : '撤销成功！')
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