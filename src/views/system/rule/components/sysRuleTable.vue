<template>
  <div class="sys-rule-table">
    <div class="sys-rule-table-header">
      <a-button type="primary" @click="handleAddRule">
        <template #icon>
          <plus-outlined />
        </template>
        新增规则
      </a-button>
    </div>
    <div class="sys-rule-table-body">
      <a-table :columns="columns" :data-source="ruleList" :pagination="pagination" :scroll="{ y: 300 }" rowKey="id"
        @change="onTableChange">
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'ywlx'">
            <span>{{ getYwlxName(record[column.dataIndex]) }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a @click="handleEditRule(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm cancel-text="否" ok-text="是" title="确定要删除该规则吗?" @confirm="handleDelRule(record)">
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <a-drawer v-model:open="drawerShow" class="custom-class" root-class-name="root-class-name" :title="drawerTitle + '规则'"
    placement="right" :width="isFullScreen ? '100vw' : 700" :footer-style="{ textAlign: 'right' }">
    <sys-rule-form v-if="drawerShow" ref="ruleForm" :type="drawerTitle" :catalog="selectRuleCatalog"
      :record="currentRecord" @formOk="getFormOk">
    </sys-rule-form>
    <template #extra>
      <FullscreenExitOutlined v-if="isFullScreen" @click="toggleFullscreen" />
      <FullscreenOutlined v-else @click="toggleFullscreen" />
    </template>
    <template #footer>
      <a-button style="margin-right: 8px" @click="handleCloseDrawer">取消</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-drawer>

</template>

<script lang="ts" setup>
import { PlusOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue'
import { onMounted, ref, watch } from "vue"
import SysRuleForm from "/@/views/system/rule/components/sysRuleForm.vue"
import { defHttp } from "/@/utils/http/axios"
import { getTreeDictItemsByCode } from "/@/views/online/utils/commonUtils"
import { message } from "ant-design-vue"

const props = defineProps({
  selectRuleCatalog: {
    type: Array,
    default: []
  }
})

// 列名
const columns = [
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    key: 'ruleName'
  },
  {
    title: '规则编号',
    dataIndex: 'ruleCode',
    key: 'ruleCode'
  },
  {
    title: '规则类型名称',
    dataIndex: 'ruleTypeName',
    key: 'ruleTypeName'
  },
  {
    title: '规则描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '业务类型',
    dataIndex: 'ywlx',
    key: 'ywlx'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation'
  }
]

// 规则列表
let ruleList = ref([])

// 分页
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})
// 规则表单
let ruleForm = ref()
// 抽屉显示
let drawerShow = ref<boolean>(false)
// 抽屉标题
let drawerTitle = ref<string>('新增')
// 当前选中行数据
let currentRecord = ref<any>({})
// 是否全屏显示
let isFullScreen = ref<boolean>(false)

enum api {
  list = '/api/zrzy-form/form/rule/getRuleList',
  del = '/api/zrzy-form/form/rule/deleteRule'
}

watch(() => props.selectRuleCatalog, (newVal) => {
  ruleList.value = []
  pagination.value.total = 0
  pagination.value.current = 1
  initData()
}, {
  deep: true
})

onMounted(() => {
  initData()
})

/**
 * 初始化数据
 */
function initData() {
  let arr = getChildrenYwlx(props.selectRuleCatalog, [])
  let ywlxArr = []
  // arr.forEach((item: any) => {
  //   ywlxArr.push("'" + item + "'")
  // });
  arr.forEach((item: any) => {
    ywlxArr.push(item)
  });
  defHttp.get({
    url: api.list, params: {
      page: pagination.value.current,
      size: pagination.value.pageSize,
      ywlx: ywlxArr.join(',')
    }
  }, { withToken: true }).then((res) => {
    res.list = res?.result?.records ? res.result.records : [];
    ruleList.value = res && res.list ? res.list : []
    pagination.value.total = res.result.total
  }).catch(err => {
    ruleList.value = []
    pagination.value.total = 0
    pagination.value.current = 1
  })
}

/**
 * 获取分类下所有业务类型
 * @param data
 * @param arr
 */
function getChildrenYwlx(data: any = [], arr: any = []) {
  data.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      arr.push(item.value)
      return getChildrenYwlx(item.children, arr)
    } else {
      arr.push(item.value)
    }
  })
  return arr
}
/**
 * 新增规则
 */
function handleAddRule() {
  drawerShow.value = true
  currentRecord.value = null
  drawerTitle.value = '新增'
}

/**
 * 编辑规则
 * @param record
 */
function handleEditRule(record) {
  drawerShow.value = true
  currentRecord.value = record
  drawerTitle.value = '编辑'
}

/**
 * 删除规则
 * @param record
 */
function handleDelRule(record) {
  defHttp.post({
    url: api.del, params: {
      id: record.id
    }
  }, { withToken: true }).then((res) => {
    if (res) {
      message.success('删除成功')
      initData()
    } else {
      message.warning('删除失败')
    }
  })
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
  if (ruleForm.value) {
    ruleForm.value.handleOk()
  }
}

/**
 * 获取业务类型名称
 * @param ywlx
 */
function getYwlxName(ywlx) {
  let arr = getTreeDictItemsByCode('ywgzlx')
  let find = findNode(arr, ywlx)
  return find ? find.label : ''
}

/**
 * 循环遍历
 * @param arr
 * @param key
 */
function findNode(arr, key) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i];
    if (node.value === key) return node;
    if (node.children && node.children.length > 0) {
      let foundNode = findNode(node.children, key);
      if (foundNode) return foundNode;
    }
  }
  return null;
}

/**
 * 全屏切换
 */
function toggleFullscreen() {
  isFullScreen.value = !isFullScreen.value
}
</script>

<style lang="less" scoped>
.sys-rule-table {
  width: calc(100% - 300px);
  height: 100%;
  padding: 10px;

  .sys-rule-table-header {
    margin-bottom: 10px;
    height: 33px;
  }

  .sys-rule-table-body {
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
      overflow: hidden !important;
    }

    :deep(.ant-spin-nested-loading) {
      height: 100%;
    }
  }
}
</style>
