<template>
  <div class="form-item-table">
    <template v-if="selectItemCatalog.length == 0 || selectItemCatalog[0].children">
      <a-result title="请先选择具体事项">
      </a-result>
    </template>
    <template v-else>
      <div class="form-item-table-header">
        <a-button type="primary" @click="handleAddCase">
          <template #icon>
            <plus-outlined/>
          </template>
          新增表单
        </a-button>
      </div>
      <div class="form-item-table-body">
        <a-table :columns="columns" :data-source="caseList" :pagination="pagination" :scroll="{ y: 300 }" rowKey="id"
                 @change="onTableChange">
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'operate'">
              <a @click="handleEditCase(record)">编辑</a>
              <a-divider type="vertical"/>
              <a @click="handleConfig(record)">配置</a>
              <a-divider type="vertical"/>
              <a-popconfirm cancel-text="否" ok-text="是" title="确定要删除该配置吗?" @confirm="handleDelCase(record)">
                <a>删除</a>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </div>
    </template>
  </div>
  <a-drawer v-model:open="drawerShow" class="custom-class" root-class-name="root-class-name"
            :root-style="{ color: 'blue' }" :title="drawerTitle + '表单'" placement="right" width="500"
            :footer-style="{ textAlign: 'right' }">
      <form-item-form v-if="drawerShow" ref="caseForm" :type="drawerTitle" :catalog="selectItemCatalog"
                      :record="currentRecord" @formOk="getFormOk"></form-item-form>
    <template #footer>
      <a-button style="margin-right: 8px" @click="handleCloseDrawer">取消</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-drawer>
  <a-drawer v-model:open="configDrawerShow" class="custom-class" root-class-name="root-class-name"
            :root-style="{ color: 'blue' }" title="配置继承" placement="right" width="700"
            :footer-style="{ textAlign: 'right' }">
    <case-inherit-form v-if="configDrawerShow" :record="currentRecord"></case-inherit-form>
  </a-drawer>
</template>

<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { ref, watch } from "vue"
import FormItemForm from "/@/views/sysmanage/modules/formItemForm.vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import CaseInheritForm from "/@/views/sysmanage/modules/caseInheritForm.vue"

const props = defineProps({
  selectItemCatalog: {
    type: Array,
    default: []
  }
})

// 列名
const columns = [
  // {
  //   title: '事项名称',
  //   dataIndex: 'itemName',
  //   key: 'itemName'
  // },
  {
    title: '情形名称',
    dataIndex: 'caseName',
    key: 'caseName'
  },
  {
    title: '情形编码',
    dataIndex: 'caseCode',
    key: 'caseCode'
  },
  {
    title: '表单地址',
    dataIndex: 'filePath',
    key: 'filePath'
  },
  {
    title: '表单编码',
    dataIndex: 'formCode',
    key: 'formCode'
  },
  {
    title: '备注 ',
    dataIndex: 'remark',
    key: 'remark'
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    width: 200
  }
]

// 事项情形列表
let caseList = ref([])

// 分页
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})

// 表单
let caseForm = ref()
// 抽屉显示
let drawerShow = ref<boolean>(false)
// 抽屉标题
let drawerTitle = ref<string>('新增')
// 配置抽屉显示
let configDrawerShow = ref<boolean>(false)
// 当前选中行数据
let currentRecord = ref<any>({})

enum api {
  list = '/api/zrzy-dzzw/caseConfig/getFormListByCode',
  del = '/api/zrzy-dzzw/caseConfig/deleteById'
}

watch(() => props.selectItemCatalog, (newVal) => {
  if (newVal && newVal.length && !newVal[0].children) {
    initData()
  }
}, {
  deep: true,
  immediate: true
})

/**
 * 初始化数据
 */
function initData() {
  defHttp.get({ url: api.list, params: {
      page: pagination.value.current,
      size: pagination.value.pageSize,
      caseCode: props.selectItemCatalog ? props.selectItemCatalog[0].value : ''
    }}, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      caseList.value = res && res.result ? res.result.records : []
      pagination.value.total = res.result.total
    }
  }).catch(err => {
    caseList.value = []
    pagination.value.total = 0
    pagination.value.current = 1
  })
}

/**
 * 添加事项配置
 */
function handleAddCase() {
  drawerShow.value = true
  currentRecord.value = null
  drawerTitle.value = '新增'
}

/**
 * 编辑事项配置
 * @param record
 */
function handleEditCase(record) {
  drawerShow.value = true
  currentRecord.value = record
  drawerTitle.value = '编辑'
}

/**
 * 删除事项配置
 * @param record
 */
function handleDelCase(record) {
  defHttp.delete({ url: api.del, params: {
      id: record.id
    }}, { withToken: true }).then((res) => {
    if (res) {
      message.success('删除成功')
      initData()
    } else {
      message.warning('删除失败')
    }
  })
}

/**
 * 配置继承
 * @param record
 */
function handleConfig(record) {
  configDrawerShow.value = true
  currentRecord.value = record
}

/**
 * 表单确认
 * @param value
 */
function getFormOk(value) {
  drawerShow.value = false
  initData()
}

/**
 * 表格更改页数
 * @param pagination
 */
function onTableChange(pag) {
  pagination.value = pag
  initData()
}

/**
 * 关闭抽屉
 */
function handleCloseDrawer() {
  drawerShow.value = false
}

/**
 * 抽屉确认
 */
function handleOk() {
  if (caseForm.value) {
    caseForm.value.handleOk()
  }
}
</script>

<style lang="less" scoped>
.form-item-table {
  width: calc(100% - 300px);
  height: 100%;
  padding: 10px;

  .form-item-table-header {
    margin-bottom: 10px;
    height: 33px;
  }

  .form-item-table-body {
    height: calc(100% - 50px);
    // overflow: auto;

    :deep(.ant-table-body) {
      overflow-y: scroll;
      max-height: calc(100% - 50px) !important;
    }

    :deep(.ant-table-wrapper) {
      height: 100%;
    }

    :deep(.ant-table) {
      height: calc(100% - 50px);
    }

    :deep(.ant-table-container) {
      height: 100%;
    }

    :deep(.ant-spin-container) {
      height: 100%;
    }

    :deep(.ant-spin-nested-loading) {
      height: 100%;
    }
  }
}
</style>
