<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :offset="0" :span="6">
          <a-form-item label="报表名称">
            <a-input v-model:value="formData.name" allowClear />
          </a-form-item>
        </a-col>
        <a-col :offset="0" :span="4">
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
      <a-space>
        <a-button type="primary" @click="addData">
          <template #icon>
            <plus-outlined />
          </template>
          新建报表
        </a-button>
        <a-upload v-model:file-list="fileList" :customRequest="importData" :maxCount="1"
          :headers="{ authorization: 'authorization-text' }" :showUploadList="false" accept=".json" name="file"
          style="margin: auto 2px;">
          <a-button type="primary">
            <UploadOutlined />
            导入
          </a-button>
        </a-upload>
        <a-dropdown v-if="selectedValue.length">
          <template #overlay>
            <a-menu @click="handleBatchExport">
              <a-menu-item key="1">
                <ExportOutlined />
                导出
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            批量操作
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </a-space>
    </div>
    <div style="margin-bottom: 10px">
      <a-alert show-icon type="info">
        <template #message>
          已选择 <a style="font-weight: 600">{{ selectedValue.length }}&nbsp;</a>项
        </template>
      </a-alert>
    </div>
    <a-table :columns="columns" :data-source="datalist" :pagination="pagination" :row-selection="rowSelection"
      row-key="id" @change="onChange($event, loadData)">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <template #split>
              <a-divider type="vertical" />
            </template>
            <a @click="editData(record)">编辑</a>
            <a @click="copyData(record)">复制</a>
            <a @click="preview(record)">预览</a>
            <a @click="exportData(record)">导出</a>
            <a-popconfirm cancel-text="取消" ok-text="确定" title="是否确定删除该项？" @confirm="deleteData(record)">
              <a>删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios"
import { ref, onMounted, computed } from "vue"
import {
  PlusOutlined,
  SearchOutlined,
  RedoOutlined,
  DownOutlined,
  ExportOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { exprotJson } from "/@/views/online/utils/file"
import { cModal } from "/@/components/cModal/index"
import { useUserStoreWithOut } from "/@/store/modules/user"
import { Http2ServerRequest } from "http2"


enum Api {
  copyUrl = '/api/zrzy-form/wform/copyData',
}
const userStore = useUserStoreWithOut();
const token = userStore.getToken
const columns = [
  { title: "id", dataIndex: "id", width: 150 },
  { title: "报表名称", dataIndex: "name", width: 320, ellipsis: true },
  // { title: "表单编码", dataIndex: "code", width: 150 },
  { title: "报表分类", dataIndex: "typeName", width: 220 },
  { title: "创建时间", dataIndex: "createTime", width: 140 },
  { title: '操作', key: 'action', width: 280, fixed: 'right', }
]
let datalist: any = ref([])
let formData: any = ref({ name: '', code: '', formType: '' })
let selectedValue = ref<any>([])
let selectedRow = ref<any>([])
const rowSelection = computed(() => {
  return {
    type: 'checkbox',
    selectedRowKeys: selectedValue.value,
    onSelect(record: any, selected: any) {
      selectRow(selected, record)
    },
    onSelectAll(selected: any, _selectionRows: any, changeRows: any) {
      if (selected) {
        selectedRow.value = selectedRow.value.concat(changeRows)
      }
      if (!selected) {
        let selectionRows = JSON.parse(JSON.stringify(selectedRow.value))
        const delIndex: any = []
        selectionRows.forEach((item: any, index: any) => {
          changeRows.forEach((val: any) => {
            if (item['id'] === val['id']) {
              delIndex.push(index)
            }
          })
        })
        delIndex.forEach((item: any) => {
          delete selectionRows[item]
        })
        selectionRows = selectionRows.filter((item: any) => {
          return item !== undefined
        })
        selectedRow.value = selectionRows
      }
      selectedValue.value = selectedRow.value.map((m: any) => m['id'])

    },
  }
})

let formTypeValue = ref('')
let fileList = ref<any>([])
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})

enum api {
  exportApi = '/api/zrzy-form/jimu/jimuReport/exportReport',
  importValidate = '/api/zrzy-form/jimu/jimuReport/importReportValidate',
  importApi = '/api/zrzy-form/jimu/jimuReport/importReport'
}

onMounted(() => {
  loadData() // 初始化加载数据
})

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
  let url = '/api/zrzy-form/jmreport/query/report/folder'
  let name = formData.value.name
  name = name ? name.trim() : name
  defHttp.get({
    url: url,
    params: { name: name, pageNo: pagination.value.current, pageSize: pagination.value.pageSize }
  }, { withToken: true }).then((res) => {
    if (res.success) {
      datalist.value = res.result.records
      pagination.value.total = res.result.total
    }

  }).catch(err => {
    console.info(err)
  })
}

/**
 * 表单分类改变
 */
function onSelect(_value: any, node: any, _extra: any) {
  if (_value == undefined) {
    formTypeValue.value = ''
  } else {
    const array: any = node.children
    let arrType: any = []
    if (node.children != undefined && array.length > 0) {
      array.forEach((item: any) => {
        arrType.push("'" + item.dict_code + "'")
      })
    }
    const selectValue = "'" + _value + "'"
    if (arrType.length == 0) {
      formTypeValue.value = selectValue
    } else {
      arrType.push(selectValue)
      formTypeValue.value = arrType.join(',')
    }
  }
  pagination.value.current = 1
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
 * 复制表单
 */
function copyData(record: any) {
  defHttp.get({
    url: '/api/zrzy-form/jmreport/reportCopy',
    params: { id: record.id }
  }, { withToken: true }).then((res) => {
    if (res.success) {
      message.success('复制成功')
      loadData()
    } else {
      message.error('复制失败')
    }
  }).catch(err => {
    console.info(err)
  })
}

/**
 * 导出
 * @param record
 */
function exportData(record: any) {
  exprotJson({ idList: record.id }, record.name, api.exportApi)
}

/**
 * 批量导出
 */
function handleBatchExport() {
  let ids = selectedValue.value.join(',')
  exprotJson({ idList: ids }, '批量积木报表导出', api.exportApi)
}

function selectRow(selected: any, record: any) {
  if (selected) {
    selectedRow.value.push(record)
  } else {
    const delIndex = selectedRow.value.findIndex((val: any) => {
      return val['id'] === record['id']
    })
    selectedRow.value.splice(delIndex, 1)
  }
  selectedValue.value = selectedRow.value.map(m => m['id'])
}

/**
 * 导入前验证
 */
function importData() {
  if (fileList.value.length == 0) {
    message.error('请选择文件')
    return
  }
  const fileData = new FormData()
  fileList.value.forEach((ele: any) => {
    fileData.append(`files`, ele.originFileObj)
  })
  fileList.value = []
  defHttp.post({
    url: api.importValidate,
    data: fileData,
    headers: { "Content-Type": "multipart/form-data" }
  }, { withToken: true }
  ).then((res: any) => {
    if (res && res.success) {
      let modal = cModal({
        title: '选择上传文件',
        width: 1200,
        filePath: 'views/jmreport/ImportList',
        formData: {
          validateList: res.result
        },
        onOk: async (_res: any) => {
          if (_res && _res.selectedRows) {
            let status = validateSelected(_res.selectedRows)
            if (status) {
              let importStatus = await importFileData(_res.selectedRows, fileData)
              if (importStatus) {
                message.success('导入成功')
                modal.destroy()
                loadData()
              }
            }
          }
        }
      })
    } else {
      message.warning(res?.message || '导入失败')
    }
  })
}

/**
 * 校验
 */
function validateSelected(selectedRows) {
  if (selectedRows.length) {
    for (let i = 0; i < selectedRows.length; i++) {
      let item = selectedRows[i]
      if (!item.importType) {
        message.warning('请检查导入类型必填！')
        return false
      }
    }
  } else {
    message.warning('请先选择一条数据')
    return false
  }
  return true
}

function importFileData(selectedRows, fileData) {
  return new Promise((resolve, reject) => {
    fileData.delete('validateList')
    fileData.append('validateList', JSON.stringify(selectedRows))
    defHttp.post({
      url: api.importApi,
      data: fileData,
      headers: { "Content-Type": "multipart/form-data" }
    }, { withToken: true }).then((res: any) => {
      if (res && res.success) {
        resolve(true)
      } else {
        message.warning(res?.message)
        resolve(false)
      }
    })
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

/**
 * 添加表单
 */
function addData() {
  let url = '/api/zrzy-form/jmreport/save'
  defHttp.post({ url: url }, { withToken: true }).then((res) => {
    if (res.success) {
      window.open(`${window.settingConfig.jmreportDomain}/zrzy-form/jmreport/index/` + res.result.id + '?token=' + token, '_blank')
    }
  }).catch(err => {
    console.info(err)
  })
}

/**
 * 编辑表单
 */
function editData(record) {

  window.open(`${window.settingConfig.jmreportDomain}/zrzy-form/jmreport/index/` + record.id + '?token=' + token, '_blank')
}

/**
 * 在线预览
 * @param record
 */
function preview(record: any) {
  window.open(`${window.settingConfig.jmreportDomain}/zrzy-form/jmreport/view/` + record.id + '?token=' + token, '_blank')
}

/**
 * 删除表单
 */
function deleteData(record) {
  // http://192.168.27.87:1004/zrzy-form/jmreport/delete?id=949203339267919872&token=null
  if (!record.id) return
  let url = '/api/zrzy-form/jmreport/deleteReportById' // 删除
  defHttp.delete({ url: url, params: { id: record.id } }, { withToken: true }).then((res) => {
    if (res.success) {
      message.success('删除成功')
      selectedRow.value = selectedRow.value.filter(f => f.id != record.id)
      selectedValue.value = selectedValue.value.filter(f => f != record.id)
      loadData()
    } else {
      message.error('删除失败' + res?.message)
    }
  }).catch(err => {
    message.error('删除失败')
  })
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
