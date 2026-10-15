<template>
  <div class="sync-design">
    <div class="sync-design-steps-tool" v-if="!isJustTb">
      <a-steps class="sync-design-steps" :current="current" :items="items"></a-steps>
    </div>
    <div :class="`sync-steps-${current == 0 ? 'one' : 'two'}-content${isJustTb ? '-sync' : ''}`">
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
                <a-select v-model:value="formState.sourceDb"
                  :options="dataSourceOptions.filter(t => t.dbTypeText != 'Oracle')" allow-clear placeholder="请选择源数据源"
                  show-search :dropdownMatchSelectWidth="false" @change="handleChangeDataSource('source')"></a-select>
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
            <!-- <a-col :md="12">
              <a-form-item label="定时器表达式" name="corn" :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-input v-model:value="formState.corn" style="width: 100%"
                  :auto-size="{ minRows: 2, maxRows: 5 }"></a-input>
              </a-form-item>
            </a-col> -->
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
          <a-card v-for="(title, type) in cdcTypeInfo.source" :key="type" :title="title" size="small"
            class="sync-panel-left-card">
            <template #extra>
              <a v-if="!isAllChecked(type)" @click="selectAll(type)">全选</a>
              <a v-else @click="cancelSelectAll(type)">取消全选</a>
            </template>
            <div class="search-tool">
              <a-input-search v-model:value="searchValue[type]" enter-button placeholder="请输入视图名或表名" style="width: 100%"
                @search="(value) => onSearch(value, type)" allowClear />
            </div>
            <div class="checkbox-content">
              <a-checkbox-group style="width: 100%" v-model:value="formState[`${type}Check`]"
                @change="handleChangeCheckBox(type)">
                <div style="display: flex; flex-direction: column; width: 90%; margin: auto">
                  <template v-for="(item, index) in viewTables.source[type]" :key="index">
                    <a-checkbox v-show="!item.hidden" :value="item.tablename" class="sync-panel-checkbox">
                      {{ item.tablename }}
                    </a-checkbox>
                  </template>

                </div>
              </a-checkbox-group>
            </div>
          </a-card>
        </div>
        <div class="sync-panel-right">
          <template
            v-if="(formState.viewCheck && formState.viewCheck.length) || (formState.tableCheck && formState.tableCheck.length)">
            <a-card v-for="(title, type) in cdcTypeInfo.target" :key="type" :title="title" size="small"
              class="sync-panel-right-card">
              <template v-if="formState[`${type}Check`]?.length">
                <div class="sync-panel-right-content">
                  <a-alert type="info" :showIcon="false">
                    <template #description>
                      <div :class="['sync-panel-right-row-header', `sync-panel-right-row-header-${type}`]">
                        <div style="text-align: center; min-width: 0;">
                          源表</div>
                        <div style="visibility: hidden;">
                          &nbsp;
                        </div>
                        <div style="text-align: center; min-width: 0;">
                          目标表
                        </div>
                        <div style="visibility: hidden;">
                          &nbsp;
                        </div>
                        <div style="text-align: center; min-width: 0;">
                          自增列
                        </div>
                        <div style="text-align: center; min-width: 0;">
                          标识列
                        </div>
                        <div v-if="type == 'view'" style="text-align: center; min-width: 0;">
                          视图主表
                        </div>
                        <div style="visibility: hidden;">
                          &nbsp; &nbsp;
                        </div>
                      </div>
                    </template>
                  </a-alert>

                  <div class="sync-panel-right-row-body">
                    <div class="sync-panel-right-row" v-for="(item, index) in formState[`${type}CheckRow`]"
                      :key="index">
                      <div :class="['sync-panel-right-row-parent', `sync-panel-right-row-parent-${type}`]">
                        <a-input :value="item.sourceTable" readonly style="text-align: center; min-width: 0;" />
                        <div>
                          <SwapRightOutlined style="margin: 0px 10px;font-size: 16px" />
                        </div>
                        <a-select v-model:value="item.targetTable" :dropdownMatchSelectWidth="false"
                          placeholder="请选择目标表" style="min-width: 0; text-align: center;" show-search
                          @change="(value) => handleChangeTargetTable(value, item)" allow-clear>
                          <a-select-option v-for="(selectItem, selectIndex) in viewTables.target.table"
                            :value="selectItem.tablename">{{
      selectItem.tablename }}</a-select-option>
                        </a-select>
                        <div>
                          <MinusOutlined style="margin: 0px 10px;font-size: 16px" />
                        </div>
                        <a-input v-model:value="item.identityColumn" placeholder="目标表自增列" readOnly
                          style="min-width: 0; text-align: center;" />
                        <a-select v-model:value="item.businessKeyArr" placeholder="请选择目标表标识列"
                          style="min-width: 0; text-align: center;" :options="item.notIdentityColumns"
                          @click="handleClickBusinessKey(item)" mode="multiple"></a-select>
                        <a-select v-if="type == 'view'" v-model:value="item.mainTable" :options="item.viewTables"
                          @click="handleClickViewTable(item)"></a-select>
                        <div style="display: flex; justify-content: end">
                          <!--                      <FormOutlined style="margin: 0 0 0 10px;font-size: 16px;color: #1890FF; cursor: pointer"-->
                          <!--                        @click="handleEdit(type, item, index)" />-->
                          <MinusCircleOutlined style="margin: 0px 10px;font-size: 16px;color: red;cursor: pointer"
                            @click="handelDelRow(type, item, index)" />
                        </div>

                      </div>
                    </div>
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
      <a-button v-if="current == steps.length - 1" type="primary" style="margin-left: 8px" @click="closeCurrentTab">
        关闭
      </a-button>
      <a-button v-if="!isJustTb && current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
    </div>
  </div>
  <sync-modal ref="refModal" @ok="handleModalOk"></sync-modal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { router } from "/@/router"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { defHttp } from "/@/utils/http/axios"
import { SwapRightOutlined, MinusOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
import SyncModal from "/@/views/system/sync/components/SyncModal.vue"
import { message } from "ant-design-vue"
import { closeCurrentTab } from "/@/utils/sysUtil"
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
let cdcTypeInfo = ref<any>({
  source: {
    view: '视图',
    table: '源表'
  },
  target: {
    view: '视图 - 目标表',
    table: '源表 - 目标表'
  }
})
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
let searchValue = ref<any>({
  view: '',
  table: ''
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
let isJustTb = ref<boolean>(false)

enum api {
  options = '/api/zrzy-system/sys/datasource/options',
  getTables = '/api/zrzy-cdc/data/sync/getTables',
  add = '/api/zrzy-cdc/data/sync/add',
  update = '/api/zrzy-cdc/data/sync/update',
  info = '/api/zrzy-cdc/data/sync/getInfo',
  getColumName = '/api/zrzy-cdc/data/sync/getAllColumns',
  getKeyColumn = '/api/zrzy-cdc/data/sync/getKeyColumns',
  getViewTables = '/api/zrzy-cdc/data/sync/getViewTables',
}

onMounted(() => {
  let sync = router.currentRoute.value.query.sync
  if (sync && sync == '1') {
    isJustTb.value = true
    current.value = 1
  }
  if (!isJustTb.value) {
    getDataSourceOptions()
  }
  initData()
})

async function initData(isSave?: boolean) {
  let id = router.currentRoute.value.query.id
  if (id) {
    let info = await getInfoById(id)
    if (info) {
      formState.value = JSON.parse(JSON.stringify(info))
      if (!isSave) {
        getTables(formState.value.sourceDb, 'source')
        getTables(formState.value.targetDb, 'target')
      }

      let tableList = formState.value.tableList
      const content: any = { table: [], view: [] };
      tableList.forEach((item: any) => {
        if (item.type === 'table') {
          content.table.push(item);
        } else if (item.type === 'view') {
          content.view.push(item);
        }
      });
      if (content) {
        let _viewRow = content.view || []
        let _tableRow = content.table || []
        formState.value.viewCheckRow = _viewRow.map((view) => {
          view.businessKeyArr = view.businessKey ? view.businessKey.split(',') : []
          return view
        })
        formState.value.tableCheckRow = _tableRow.map((table) => {
          table.businessKeyArr = table.businessKey ? table.businessKey.split(',') : []
          return table
        })
        formState.value.viewCheck = content.view.map(v => v.sourceTable)
        formState.value.tableCheck = content.table.map(v => v.sourceTable)
        formState.value.viewOriginalIds = JSON.parse(JSON.stringify(content.view.map(v => v.id)))
        formState.value.tableOriginalIds = JSON.parse(JSON.stringify(content.table.map(v => v.id)))
      }
      // console.log('formState.value', formState.value)
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
 * 获取表和视图
 * @param dbKey
 * @param type
 */
function getTables(dbKey, type) {
  if (dbKey) {
    defHttp.get({ url: api.getTables, params: { dbKey: dbKey } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        if (type == 'source') {
          viewTables.value.source.view = res.result.view || []
          viewTables.value.source.table = res.result.table || []
        } else {
          viewTables.value.target.table = res.result.table || []
        }
      }
    })
  } else {
    if (type == 'source') {
      viewTables.value.source.view = []
      viewTables.value.source.table = []
    } else {
      viewTables.value.target.table = []
    }
  }
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
  console.log('viewTables.value.source', viewTables.value.source)
  const allItems = viewTables.value.source[type].map(i => i.tablename);
  const selectedItems = formState.value[`${type}Check`] || [];
  if (allItems.length === 0) {
    return false;
  }
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
 * 点击视图关联表选项
 * @param item
 */
async function handleClickViewTable(item) {
  if (!item.viewTables) {
    item.viewTables = await getViewTables(item)
  }
}

/**
 * 获取视图下的所有表
 * @param item
 */
function getViewTables(item) {
  return new Promise((resolve) => {
    defHttp.get({ url: api.getViewTables, params: { dbKey: formState.value.sourceDb, tableName: item.sourceTable } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        let result = res.result.map((m) => {
          m.label = m.table_name
          m.value = m.table_name
          return m
        })
        resolve(result || [])
      } else {
        message.warning(res?.message)
        resolve([])
      }
    })
  })
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
  obj.tableCheckRow = obj.tableCheckRow.map((row) => {
    row.businessKey = row.businessKeyArr?.join(',') || ''
    row.type = 'table'
    row.syncId = router.currentRoute.value.query.id
    delete row.businessKeyArr
    delete row.notIdentityColumns
    return row
  })
  obj.viewCheckRow = obj.viewCheckRow.map((row) => {
    row.businessKey = row.businessKeyArr?.join(',') || ''
    row.type = 'view'
    row.syncId = router.currentRoute.value.query.id
    delete row.businessKeyArr
    delete row.notIdentityColumns
    delete row.viewTables
    return row
  })
  obj.viewNewIds = obj.viewCheckRow.map(v => v.id).filter(v => v)
  obj.tableNewIds = obj.tableCheckRow.map(v => v.id).filter(v => v)
  obj.tableList = [...obj.tableCheckRow, ...obj.viewCheckRow]
  obj.delIds = [...(obj.viewOriginalIds || []).filter(item => !obj.viewNewIds.includes(item)), ...(obj.tableOriginalIds || []).filter(item => !obj.tableNewIds.includes(item))]
  // 定义需要删除的临时属性数组
  const tempProps = [
    'tableCheckRow', 'viewCheckRow',
    'tableCheck', 'viewCheck',
    'viewNewIds', 'tableNewIds',
    'viewOriginalIds', 'tableOriginalIds'
  ]
  // 循环删除临时属性
  tempProps.forEach(prop => delete obj[prop])
  let url = formState.value.id ? api.update : api.add
  defHttp.post({ url: url, data: obj }, { withToken: true }).then((res) => {
    if (res && res.success) {
      message.success('保存成功!')
      initData(true)
    } else {
      message.warning(res?.message)
    }
  })
}

/**
 * 更改目标表
 * @param value
 */
function handleChangeTargetTable(value, item) {
  defHttp.get({ url: api.getColumName, params: { dbKey: formState.value.targetDb, tableName: value } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      item.identityColumn = res.result.find(r => r.isIdentity == 'YES')?.columnName || ''
    }
  })
}

/**
 * 点击目标表
 * @param item
 */
function handleClickBusinessKey(item) {
  if (!item.notIdentityColumns || item.notIdentityColumns.length === 0) {
    defHttp.get({ url: api.getColumName, params: { dbKey: formState.value.sourceDb, tableName: item.sourceTable } }, { withToken: true }).then((res) => {
      if (res && res.code == 200) {
        item.notIdentityColumns = res.result.map((m) => {
          m.label = m.columnName
          m.value = m.columnName
          return m
        })
        // item.notIdentityColumns = res.result.filter(r => r.isidentity != 'YES').map((m) => {
        //   m.label = m.columnname
        //   m.value = m.columnname
        //   return m
        // })
      }
    })
  }
}

/**
 * 搜索
 * @param value
 * @param type
 */
function onSearch(value, type) {
  viewTables.value.source[type] = viewTables.value.source[`${type}`].map((item) => {
    item.hidden = !item.tablename.includes(value)
    return item
  })
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

  .sync-steps-two-content-sync {
    height: calc(100% - 80px);
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

      .search-tool {
        height: 40px;
      }

      .checkbox-content {
        height: calc(100% - 40px);
        overflow: auto;
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
          height: 100%;
          display: flex;
          flex-direction: column;

          :deep(.ant-alert) {
            padding: 0;
            margin-bottom: 10px;
          }

          .sync-panel-right-row-header {
            display: grid;
            grid-template-columns: 1fr 30px 1fr 30px 1fr 1fr 1fr 30px;
            align-items: center;
            column-gap: 8px;
            //margin-bottom: 10px;
            height: 30px;
          }

          .sync-panel-right-row-header-table {
            grid-template-columns: 1fr 30px 1fr 30px 1fr 1fr 30px;
          }

          .sync-panel-right-row-body {
            width: 100%;
            height: calc(100% - 40px);
            display: flex;
            flex-direction: column;
            overflow: auto;
          }

          .sync-panel-right-row-parent {
            display: grid;
            grid-template-columns: 1fr 30px 1fr 30px 1fr 1fr 1fr 30px;
            align-items: center;
            column-gap: 8px;
            margin-bottom: 10px;
            height: 30px;
            //display: flex;
            //justify-content: center;
            //width: 100%;
            //margin-bottom: 10px;
            //height: 30px;
          }

          .sync-panel-right-row-parent-table {
            grid-template-columns: 1fr 30px 1fr 30px 1fr 1fr 30px;
          }

          .sync-panel-right-row-child {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-bottom: 10px;
            height: 30px;
            padding-left: 20px;
          }
        }
      }
    }

    :deep(.ant-card-body) {
      height: calc(100% - 40px);
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