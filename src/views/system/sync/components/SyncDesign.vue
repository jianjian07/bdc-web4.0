<template>
  <div class="sync-design">
    <div class="sync-design-steps-tool">
      <a-steps class="sync-design-steps" :current="current" :items="items"></a-steps>
    </div>
    <div :class="`sync-steps-${current == 0 ? 'one' : 'two'}-content`">
      <div v-if="current == 0" class="sync-form">
        <a-form ref="formRef" :model="formState">
          <a-row>
            <a-col :md="12">
              <a-form-item label="同步名称" name="name" :rules="[{ required: true, message: '请填写同步名称!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-input v-model:value="formState.name" placeholder="请填写同步名称"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="12">
              <a-form-item label="同步code" name="code" :rules="[{ required: true, message: '请填写同步code!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-input v-model:value="formState.code" placeholder="请填写同步code"></a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="12">
              <a-form-item label="源数据源" name="sourceDb" :rules="[{ required: true, message: '请选择源数据源!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-select v-model:value="formState.sourceDb" :options="dataSourceOptions" allow-clear
                  placeholder="请选择源数据源" show-search :dropdownMatchSelectWidth="false"
                  @change="handleChangeDataSource('source')"></a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12">
              <a-form-item label="目标数据源" name="targetDb" :rules="[{ required: true, message: '请选择目标数据源!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-select v-model:value="formState.targetDb" :options="dataSourceOptions" allow-clear
                  placeholder="请选择目标数据源" show-search :dropdownMatchSelectWidth="false"
                  @change="handleChangeDataSource('target')"></a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="12">
              <a-form-item label="同步类型" name="tblx" :rules="[{ required: true, message: '请选择同步类型!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-select v-model:value="formState.tblx" allow-clear style="width: 100%" placeholder="请选择同步类型"
                  :options="getDictItemsByCode('tblx')" />
              </a-form-item>
            </a-col>
            <a-col :md="12">
              <a-form-item label="全量写入模式" name="qlxrms" :rules="[{ required: true, message: '请选择全量写入模式!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-select v-model:value="formState.qlxrms" allow-clear style="width: 100%" placeholder="请选择全量写入模式"
                  :options="getDictItemsByCode('qlxrms')" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="12">
              <a-form-item label="读取数据" name="dqsj" :rules="[{ required: true, message: '请输入每次读取数据!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-input-number v-model:value="formState.dqsj" style="width: 100%" placeholder="请输入每次读取数据" />
              </a-form-item>
            </a-col>
            <a-col :md="12">
              <a-form-item label="遇到错误停止" name="isStop" :rules="[{ required: true, message: '请选择遇到错误是否停止!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-select v-model:value="formState.isStop" allow-clear style="width: 100%" placeholder="请选择遇到错误是否停止"
                  :options="getDictItemsByCode('yn')" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :md="12">
              <a-form-item label="定时器表达式" name="corn" :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-input v-model:value="formState.corn" style="width: 100%"
                  :auto-size="{ minRows: 2, maxRows: 5 }"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="12">
              <a-form-item label="状态" name="status" :rules="[{ required: true, message: '请选择状态!' }]"
                :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-radio-group v-model:value="formState.status">
                  <a-radio value="1">待启动</a-radio>
                  <a-radio value="2">运行中</a-radio>
                  <a-radio value="3">执行完毕</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div v-if="current == 1" class="sync-panel">
        <div class="sync-panel-left">
          <a-card v-for="(title, type) in { view: '视图', table: '表' }" :key="type" :title="title" size="small"
            class="sync-panel-left-card">
            <template #extra>
              <a v-if="!isAllChecked(type)" @click="selectAll(type)">全选</a>
              <a v-else @click="cancelSelectAll(type)">取消全选</a>
            </template>
            <a-checkbox-group style="width: 100%" v-model:value="formState[`${type}Check`]"
              @change="handleChangeCheckBox(type)">
              <div style="display: flex; flex-direction: column; width: 60%; margin: auto">
                <a-checkbox v-for="(item, index) in viewTables.source[type]" :key="index" :value="item.tablename"
                  class="sync-panel-checkbox">
                  {{ item.tablename }}
                </a-checkbox>
              </div>
            </a-checkbox-group>
          </a-card>
        </div>
        <div class="sync-panel-right">
          <template
            v-if="(formState.viewCheck && formState.viewCheck.length) || (formState.tableCheck && formState.tableCheck.length)">
            <a-card v-for="(title, type) in { view: '视图 - 表', table: '表 - 表' }" :key="type" :title="title" size="small"
              class="sync-panel-right-card">
              <template v-if="formState[`${type}Check`]?.length">
                <div class="sync-panel-right-content">
                  <div class="sync-panel-right-row" v-for="(item, index) in formState[`${type}CheckRow`]" :key="index">
                    <a-input :value="item.sourceTable" readonly style="text-align: center" />
                    <SwapRightOutlined style="margin: 0px 10px;font-size: 16px" />
                    <a-select v-model:value="item.targetTable" :dropdownMatchSelectWidth="false" placeholder="请选择目标表"
                      style="width: 100%;" show-search>
                      <a-select-option v-for="(selectItem, selectIndex) in viewTables.target.table"
                        :value="selectItem.tablename">{{ selectItem.tablename }}</a-select-option>
                    </a-select>
                    <MinusOutlined style="margin: 0px 10px;font-size: 16px" />
                    <a-input v-model:value="item.identityColumn" placeholder="请输入目标表自增列"
                      style="width: 100%" />&nbsp;&nbsp;
                    <a-input v-model:value="item.businessKey" placeholder="请输入目标表标识列" style="width: 100%" />
                    <FormOutlined style="margin: 0 0 0 10px;font-size: 16px;color: #1890FF; cursor: pointer"
                      @click="handleEdit(type, item, index)" />
                    <MinusCircleOutlined style="margin: 0px 10px;font-size: 16px;color: red;cursor: pointer"
                      @click="handelDelRow(type, item, index)" />
                  </div>
                </div>
              </template>
              <a-empty v-else :description="`请选择源${type === 'view' ? '视图' : '表'}`" />
            </a-card>
          </template>
          <a-card v-else class="sync-panel-empty">
            <a-empty description="请先选择表或视图!" />
          </a-card>
        </div>
      </div>
    </div>
    <div class="sync-steps-action">
      <a-button v-if="current < steps.length - 1" type="primary" @click="next">下一步</a-button>
      <a-button v-if="current == steps.length - 1" type="primary" @click="handleComplete">
        完成
      </a-button>
      <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
    </div>
  </div>
  <sync-modal ref="refModal" @ok="handleModalOk"></sync-modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { router } from "/@/router"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { defHttp } from "/@/utils/http/axios"
import { SwapRightOutlined, MinusOutlined, MinusCircleOutlined, FormOutlined } from '@ant-design/icons-vue';
import SyncModal from "/@/views/system/sync/components/SyncModal.vue"
import { message } from "ant-design-vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
// 当前页
const current = ref<number>(0);
// 表单实例
let formRef = ref()
// 当前数据
let formState = ref<any>({})
// 数据源
let dataSourceOptions = ref<any>([])
// 标题占比
let labelCol = { style: { width: '150px' } }
// 内容占比
let wrapperCol = { span: 14 }
// 源数据源 
let sourceDbList = ref<any>([])
// 目标数据源
let targetDbList = ref<any>([])
// 视图及表
let viewTables = ref<any>({
  source: {
    view: [],
    table: []
  },
  target: {
    table: []
  }
})
// 视图全选
let viewAllCheck = ref<boolean>(false)
// 表全选
let tableAllCheck = ref<boolean>(false)
// 当前选中编辑的数据
let currentEdit = ref<any>()
// 弹窗
let refModal = ref()
const steps = [{ title: '填写同步基本信息' }, { title: '选择同步信息对应' }];
const items = steps.map(item => ({ key: item.title, title: item.title }));

enum api {
  options = '/api/zrzy-system/sys/datasource/options',
  getTables = '/api/zrzy-cdc/data/sync/getTables',
  add = '/api/zrzy-cdc/data/sync/add',
  update = '/api/zrzy-cdc/data/sync/update',
  info = '/api/zrzy-cdc/data/sync/getInfo'
}

onMounted(() => {
  getDataSourceOptions()
  initData()
})

async function initData() {
  console.log('router.currentRoute.value', router.currentRoute.value)
  let id = router.currentRoute.value.query.id
  console.log('idid', id)
  if (id) {
    let info = await getInfoById(id)
    if (info) {
      console.log('info')
      formState.value = JSON.parse(JSON.stringify(info))
      getTables(formState.value.sourceDb, 'source')
      getTables(formState.value.targetDb, 'target')
      let content = formState.value.content && typeof formState.value.content == 'string' ? JSON.parse(formState.value.content) : formState.value.content
      if (content) {
        formState.value.viewCheckRow = content.view || []
        formState.value.tableCheckRow = content.table || []
        formState.value.viewCheck = content.view.map(v => v.sourceTable)
        formState.value.tableCheck = content.table.map(v => v.sourceTable)
      }
      console.log('formState.value', formState.value)

    }

  }
}

/**
 * 通过id查找
 * @param id
 */
function getInfoById(id) {
  return new Promise((resolve) => {
    defHttp.get({ url: api.info, params: { id } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        resolve(null)
      }
    })
  })
}

/**
 * 获取数据源
 */
function getDataSourceOptions() {
  defHttp.get({ url: api.options }, { withToken: true }).then((res) => {
    if (res && res.success) {
      dataSourceOptions.value = res.result
    }
  })
}

/**
 * 源数据源改变
 */
function handleChangeDataSource(type) {
  resetRow()
  let dbKey = type == 'source' ? formState.value.sourceDb : formState.value.targetDb
  getTables(dbKey, type)
}

/**
 * 获取表和试图
 * @param dbKey
 * @param type
 */
function getTables(dbKey, type) {
  defHttp.get({ url: api.getTables, params: { dbKey: dbKey } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      if (type == 'source') {
        viewTables.value.source.view = res.result.view
        viewTables.value.source.table = res.result.table
      } else {
        viewTables.value.target.table = res.result.table
      }
    }
  })
}

/**
 * 源视图/表选中值改变
 * @param type
 */
function handleChangeCheckBox(type) {
  const isView = type === 'view';
  const checkList = isView ? formState.value.viewCheck : formState.value.tableCheck;
  const checkRowList = isView ? formState.value.viewCheckRow || [] : formState.value.tableCheckRow || [];

  const updatedRows = checkList.map(check => {
    const foundRow = checkRowList.find(rowCheck => rowCheck.sourceTable === check);
    return foundRow || {
      sourceTable: check,
      sourceDb: formState.value.sourceDb,
      targetDb: formState.value.targetDb
    };
  });

  if (isView) {
    formState.value.viewCheckRow = updatedRows;
  } else {
    formState.value.tableCheckRow = updatedRows;
  }
}

/**
 * 更换数据源后清除数据
 */
function resetRow() {
  formState.value.viewCheck = []
  formState.value.viewCheckRow = []
  formState.value.tableCheck = []
  formState.value.tableCheckRow = []
}

/**
 * 下一步
 */
function next() {
  formRef.value.validate().then(() => {
    current.value++
  })
}

/**
 * 上一步
 */
function prev() {
  current.value--
}

/**
 * 全选
 * @param type
 */
function selectAll(type) {
  formState.value[`${type}Check`] = viewTables.value.source[type].map(i => i.tablename)
  handleChangeCheckBox(type)
}

/**
 * 检查是否全选
 * @param type
 */
function isAllChecked(type) {
  const allItems = viewTables.value.source[type].map(i => i.tablename);
  const selectedItems = formState.value[`${type}Check`] || [];
  return allItems.length === selectedItems.length && allItems.every(item => selectedItems.includes(item));
}


/**
 * 取消全选
 * @param type
 */
function cancelSelectAll(type) {
  formState.value[`${type}Check`] = []
  handleChangeCheckBox(type)
}

/**
 * 编辑
 * @param type
 * @param item
 */
function handleEdit(type, item, index) {
  if (!item.targetTable) {
    message.warning('请先选择目标表!')
    return
  }
  currentEdit.value = {
    type: type,
    item: item,
    index: index
  }
  refModal.value.edit(item)
}

/**
 * 删除行
 * @param type
 * @param item
 * @param index
 */
function handelDelRow(type, item, index) {
  let findCheckIndex = formState.value[`${type}Check`].findIndex(f => f == item.sourceTable)
  if (findCheckIndex > -1) {
    formState.value[`${type}Check`].splice(findCheckIndex, 1)
    formState.value[`${type}CheckRow`].splice(index, 1)
  }
}

/**
 * 弹窗ok
 * @param value
 */
function handleModalOk(value) {
  currentEdit.value.item = value
  let type = currentEdit.value.type
  let index = currentEdit.value.index
  formState.value[`${type}CheckRow`][index] = value
}

/**
 * 完成
 */
function handleComplete() {
  let obj = JSON.parse(JSON.stringify(formState.value))
  obj.content = JSON.stringify({
    table: obj.tableCheckRow,
    view: obj.viewCheckRow
  })
  delete obj.tableCheckRow, obj.viewCheckRow, obj.tableCheck, obj.viewCheck
  let url = formState.value.id ? api.update : api.add
  defHttp.post({ url: url, data: obj }, { withToken: true }).then((res) => {
    if (res && res.success) {
      message.success('保存成功!')
      closeCurrentTab()
    } else {
      message.warning(res?.message)
    }
  })
}

/**
 * 关闭当前标签页
 */
function closeCurrentTab() {
  const tabStore = useTabsStore()
  const { getTabsShow } = useTabsSetting()
  if (getTabsShow.value) {
    const currentTab = computed(() => tabStore.getCurrentTab)
    tabStore.removeTab(currentTab.value)

    if (tabStore.getCurrentTab.meta.cache) {
      setTimeout(() => {
        if (tabStore.getCurrentTab.fullPath == '/system/sync') {
          const tabStore = useTabsStore()
          tabStore.refreshTab()
          // router.push('/refresh')
        }
      }, 300)
    }
  } else {
    router.push('/analysis')
  }
}
</script>

<style lang="less" scoped>
.sync-design {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .sync-design-steps-tool {
    padding: 24px;

    .sync-design-steps {
      width: 50%;
      margin: auto;

      :deep(.ant-steps-item-title) {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  .sync-steps-one-content {
    //height: calc(100% - 130px);
    //overflow: auto;
  }

  .sync-steps-two-content {
    height: calc(100% - 130px);
    overflow: auto;
  }

  .sync-form,
  .sync-panel {
    width: 80%;
    height: 100%;
    margin: auto;
    padding: 20px 0 0 0;
  }

  .sync-panel {
    display: flex;

    .sync-panel-left {
      width: 30%;
      height: 100%;
      padding-left: 12px;
      padding-right: 12px;

      .sync-panel-left-card {
        height: calc(50% - 10px);
        margin-bottom: 8px;
      }
    }

    .sync-panel-right {
      width: 70%;

      .sync-panel-empty {
        width: 100%;
        height: calc(100% - 12px);
      }

      :deep(.ant-empty) {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .sync-panel-right-card {
        height: calc(50% - 10px);
        margin-bottom: 8px;

        .sync-panel-right-content {
          width: 100%;
          display: flex;
          flex-direction: column;

          .sync-panel-right-row {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-bottom: 10px;
            height: 30px;
          }
        }
      }
    }

    :deep(.ant-card-body) {
      height: calc(100% - 50px);
      overflow: auto;
    }

    .sync-panel-checkbox {
      margin-left: 0px;
      margin-bottom: 10px;
      line-height: 30px;
      font-size: 16px;
    }
  }



  .sync-steps-action {
    padding: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>