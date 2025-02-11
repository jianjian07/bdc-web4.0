<template>
  <div class="sfbzpz">
    <a-row :gutter="10" style="height: 100%;width: 100%">
      <a-col class="left" :md="7" :sm="24" style="padding:10px;border-right: 1px solid rgba(5, 5, 5, 0.06);height: 100%; overflow: auto">
        <a-alert type="info" :show-icon="true" style="margin-bottom: 10px">
          <template #message>
            当前选择：<span>{{ selectedNode.title }}</span> 
            <a v-if="selectedNode.title" style="margin-left: 10px" @click="onClearSelected">取消选择</a>
            <a @click="reloadData"> 刷新</a>
          </template>
        </a-alert>
        <a-spin class="sfbzpz-tree-spin" :spinning="spinning">
          <a-tree 
              v-if="!spinning"
              :show-icon="true"
              :tree-data="treeData"
              :selected-keys="selectedKeys"
              :default-expand-all="true"
              :auto-expand-parent="true"
              block-node
              @select="onSelectTreeNode"
          >
            <template #icon="{ dataRef }">
              <AuditOutlined v-if="dataRef.iconName == 'audit'" />
              <BookOutlined v-else-if="dataRef.iconName == 'book'"/>
              <FileOutlined v-else-if="dataRef.iconName == 'file'"/>
            </template>
          </a-tree>
        </a-spin>
      </a-col>
      <a-col :md="17" :sm="24" style="padding: 10px;height: 100%; overflow: auto">
        <div class="sfbzpz-detail" v-if="selectedNode.id">
          <div class="title-css1 title-left" >
            <span>详细信息</span>
          </div>
          <a-spin :spinning="formSpinning" class="sfbzpz-form-spin">
            <a-form ref="formRef" :model="formState" :rules="rules">
              <a-row>
                <a-col :md="12" :sm="24">
                   <a-form-item label="收费条目名称" name="sfxmc" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                     <a-input v-model:value="formState.sfxmc" placeholder="请输入收费条目名称" style="width: 100%"></a-input>
                   </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="费用类型" name="sflx" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-select v-model:value="formState.sflx" :options="getDictItemsByCode('fylx')" placeholder="请选择费用类型">
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="收费说明" name="sfsm" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                     <a-input v-model:value="formState.sfsm" placeholder="请输入收费说明"></a-input>
                   </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="收费方式" name="sffs" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-select v-model:value="formState.sffs" :options="getDictItemsByCode('sffs')" placeholder="请选择收费方式">
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="收费相关域" name="sfxgy" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-select v-model:value="formState.sfxgy" placeholder="请选择收费相关域">
                      <a-select-option v-for="(item, index) in getDictItemsByCode('sfxgy')" :label="item.label" :value="item.description">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                   </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="费用参数(元)" name="sffy" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.sffy" placeholder="请输入费用参数(元)"></a-input-number>
                 </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="收费上限" name="sfsx" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.sfsx" placeholder="请输入收费上限"></a-input-number>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="序号" name="sxh" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.sxh" placeholder="请输入序号"></a-input-number>
                 </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :md="24">
                  <a-form-item label="收费依据" name="sfyj" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                   <a-textarea v-model:value="formState.sfyj"  
                               :auto-size="{ minRows: 3, maxRows: 5 }" 
                               placeholder="请输入收费依据"></a-textarea>
                 </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="是否减免" name="sfjm" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-select v-model:value="formState.sfjm" :options="getDictItemsByCode('sfjm')" placeholder="请选择是否减免" @change="onChangeSfjm">
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="减免方式" name="jmfs" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-select :disabled="formState.sfjm == '0'" v-model:value="formState.jmfs" :options="getDictItemsByCode('jmfs')" allow-clear placeholder="请选择是否减免">
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :md="24">
                  <a-form-item label="优惠政策说明" name="yhzc" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                   <a-textarea v-model:value="formState.yhzc"  
                               :auto-size="{ minRows: 3, maxRows: 5 }" 
                               placeholder="请输入优惠政策说明">
                   </a-textarea>
                 </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :md="24">
                  <a-form-item :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                    <template #label>
                      <span class="required-text">筛选条件</span>
                    </template>
                    <a-button @click="handleAddSxtj" style="margin-bottom: 10px; float: right">新增</a-button>
                    <a-table :columns="columns" sticky :data-source="sxtjxx" size="small" :loading="tableLoading">
                      <template #headerCell="{ title, column }">
                        <template v-if="column.rules?.find(r => r.required)">
                          <span class="required-text">{{ title }}</span>
                        </template>
                        <span v-else>{{ title }}</span>
                      </template>
                      <template #bodyCell="{ column, record, index }">
                        <template v-if="column.key === 'xh'">
                          {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'action'">
                          <a-popconfirm :disabled="column.disabled" cancel-text="取消" ok-text="确定" title="是否确定删除该项？"
                                        @confirm="handleDelSxtj(record, index)">
                            <a-button type="link">删除</a-button>
                          </a-popconfirm>
                        </template>
                        <template v-else-if="['sxy','sxfs','sxtj'].includes(column?.key)">
                          <a-tooltip :trigger="['focus','contextmenu']" placement="bottom" :arrow="false" color="red">
                            <template v-if="validateRules(column.rules, record[column.key])" #title>
                              <span>{{ validateRules(column.rules, record[column.key]) }}</span>
                            </template>
                            <a-select v-model:value="record[column.key]" :status="record[column.key + 'Status']" style="width: 100%;" :disabled="column.disabled" 
                                      :placeholder="column.placeholder" @focus="setInputStatus(column, record)" allow-clear @change="(value, option) => handleChangeValue(value, option, column, record)">
                              <a-select-option v-for="(item,index) in getDictItemsByCode(column.dict)" :label="item.label" :value="column.bz ? item.description : item.value">
                                {{ item.label }}
                              </a-select-option>
                            </a-select>
                          </a-tooltip>
                        </template>
                      </template>
                    </a-table>
                  </a-form-item>
                </a-col>
              </a-row>
              
              
              <a-row>
                <a-col :md="24">
                  <a-form-item label="收费登记类型" name="djlx" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                    <a-checkbox-group v-model:value="formState.djlx">
                      <a-row>
                        <a-col :span="8" v-for="(item, index) in getDictItemsByCode('sfdjlx')">
                          <a-checkbox :value="item.value" class="cbx-css">
                            <span :title="item.label">{{ item.label }}</span>
                          </a-checkbox>
                        </a-col>
                      </a-row>
                    </a-checkbox-group>
                  </a-form-item>
                </a-col>
              </a-row>
              
              <div style="text-align: center;margin-top: 10px">
                <a-space>
                  <a-button type="primary" @click="handleSubmit">
                    保存
                  </a-button>
                  <a-button type="primary" @click="handleDel">
                    删除
                  </a-button>
                </a-space>
              </div>
            </a-form>
          </a-spin>
        </div>
        <a-empty v-else>
          <template #description>
            请先选择一个收费标准
          </template>
        </a-empty>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { AuditOutlined,BookOutlined,FileOutlined } from '@ant-design/icons-vue';
import { cModal } from "/@/components/cModal/index"
import { getDictItemsByCode,validateRules, setInputStatus } from '/@/utils/form/commonUtils';
import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"

// loading
let spinning = ref<boolean>(false)
// 表单loading
let formSpinning = ref<boolean>(false)
// 收费标准
let treeData = ref<any>([])
// 当前选中的节点
let selectedNode = ref<any>({})
// 选中的keys
let selectedKeys = ref<any>([])
// 表单实例
let formRef = ref();
// 详细信息
let formState = ref<any>({
  sftmmc: ''
})
// 校验规则
let rules = ref<any>({
  sfxmc: [{ required: true, message: '请输入收费条目名称' }],
  sffy: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }],
  sfsx: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }],
  djlx: [{ required: true, message: '请选择收费登记类型!' }]
})

const columns = [
  {
    title: '序号',
    dataIndex: 'xh',
    key: 'xh',
    width: 60
  },
  {
    title: '筛选域',
    dataIndex: 'sxy',
    key: 'sxy',
    dict: 'sxy',
    bz: 1,
    placeholder: '请选择筛选域',
    rules: [{ required: true, message: '请选择筛选域' }]
  },
  {
    title: '筛选方式',
    dataIndex: 'sxfs',
    key: 'sxfs',
    dict: 'sxfs',
    bz: 1,
    placeholder: '请选择筛选方式',
    rules: [{ required: true, message: '请选择筛选方式' }]
  },
  {
    title: '筛选条件',
    dataIndex: 'sxtj',
    key: 'sxtj',
    dict: 'sxtj',
    bz: 0,
    placeholder: '请选择筛选条件',
    rules: [{ required: true, message: '请选择筛选条件' }]
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 80,
    align: 'center'
  }
]
// 筛选条件信息
let sxtjxx = ref<any>([])
// 表格加载loading
let tableLoading = ref<boolean>(false)

enum api {
  tree = '/api/zrzy-bdc/bdc/sfconfig/treeList',
  queryBySfxbh = '/api/zrzy-bdc/bdc/sfconfig/queryBySfxbh',
  delete = '/api/zrzy-bdc/bdc/sfconfig/delete',
  update = '/api/zrzy-bdc/bdc/sfconfig/update',
  delSxtj = '/api/zrzy-bdc/bdc/sfconfigsx/delete'
}

onMounted(() => {
  initData()
})

/**
 * 树数据初始化
 */
function initData() {
  spinning.value = true
  defHttp.get({ url: api.tree }, { withToken: true }).then((res) => {
    if (res && res.success) {
      treeData.value = addIconName(JSON.parse(JSON.stringify(res.result)) || [])
    } else {
      message.warning(res.message)
    }
    spinning.value = false
  })
}

/**
 * 刷新
 */
function reloadData() {
  onClearSelected()
  initData()
}

/**
 * 取消选择
 */
function onClearSelected() {
  selectedNode.value = {}
  selectedKeys.value = []
  if (formRef.value) {
    formRef.value.resetFields()
    sxtjxx.value = []
  }
}

/**
 * 添加图标
 * @param data
 * @param level
 */
function addIconName(data, level = 1) {
  const iconNames = {
    1: 'audit',
    2: 'book',
    3: 'file'
  };

  return data.map(item => {
    const updatedItem = { ...item, iconName: iconNames[level], key: item.id };

    if (item.children && Array.isArray(item.children)) {
      updatedItem.children = addIconName(item.children, level + 1); // 递归处理子节点
    }

    return updatedItem;
  });
}

/**
 * 选中树节点
 * @param keys
 * @param e
 */
function onSelectTreeNode(keys, e) {
  selectedKeys.value = []
  selectedNode.value = {}
  let record = e.node.dataRef
  let firstLevel = treeData.value[0].key
  if (record.key !== firstLevel && record.parentId == firstLevel) {
    let modal = cModal({
      title: '添加收费条目',
      width: 600,
      filePath: 'views/system/case/SfbzpzModal',
      formData: record,
      onOk: async (res: any) => {
        if (res && res.handleOk) {
          let _result = await res.handleOk()
          if (_result) {
            modal.destroy()
            initData()
          }
        }
      }
    })
  } else if (record.key !== firstLevel && !record.children) {
    selectedKeys.value = [record.key]
    selectedNode.value = record
    loadSfxxx(record.value)
  }
}

/**
 * 加载详细信息
 * @param sfxbh
 */
function loadSfxxx(sfxbh: string) {
  return new Promise((resolve) => {
    formSpinning.value = true
    let url = api.queryBySfxbh
    if (formRef.value) {
      formRef.value.resetFields()
    }
    defHttp.get({ url: url, params: { sfxbh: sfxbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        let rec = JSON.parse(JSON.stringify(res.result.bdcSfConfig))
        rec.sfjm = rec.sfjm ? rec.sfjm + '' : null
        rec.jmfs = rec.jmfs ? rec.jmfs + '' : null
        sxtjxx.value = res.result.bdcSfConfigsxList
        if (rec.djlx) {
          rec.djlx = rec.djlx.split('|')
        }
        formState.value = rec
      } else {
        message.warning(res.message)
      }
      formSpinning.value = false
    })
  })
}

/**
 * 数据变化
 * @param value
 * @param option
 * @param column
 * @param record
 */
function handleChangeValue(value, option, column, record) {
  setInputStatus(column, record)
}

/**
 * 是否减免
 * @param value
 */
function onChangeSfjm(value) {
  formState.value.jmfs = value == '1' ? formState.value.jmfs : null
}

/**
 * 添加筛选条件
 */
function handleAddSxtj() {
  sxtjxx.value.push({})
}

/**
 * 保存
 */
function handleSubmit() {
  return new Promise((resolve, reject) => {
    formRef.value
    .validate()
    .then(() => {
      if (validateTable()) {
        let _formState = JSON.parse(JSON.stringify(formState.value))
        _formState.djlx = _formState.djlx.join('|')
        _formState.sfxbh = selectedNode.value.value
        let sfxgy = getDictItemsByCode('sfxgy')
        _formState.sfxgyname = sfxgy.find(item => item.description == _formState.sfxgy)?.label
        let _sxtjxx = sxtjxx.value.map((item) => {
          item.sfxbh = selectedNode.value.value
          return item
        })
        let params = {
          bdcSfConfig: _formState,
          bdcSfConfigsxList: _sxtjxx
        }
        defHttp.put({ url: api.update, data: params }, { withToken: true }).then((res) => {
          if (res && res.success) {
            message.success('保存成功')
            initData()
            loadSfxxx(selectedNode.value.value)
          } else {
            message.warning(res.message)
          }
        })
      }
    })
  })
}

function validateTable() {
  if (sxtjxx.value.length == 0) {
    message.warning('请添加筛选条件')
    return false
  } else {
    for (let i = 0; i < sxtjxx.value.length; i++) {
      let record = sxtjxx.value[i]
      let ruleColumn = columns.filter((column: any) => column.rules)
      for (let j = 0; j < ruleColumn.length; j++) {
        setInputStatus(ruleColumn[j], record)
        if (record[ruleColumn[j].key+ 'Status'] && record[ruleColumn[j].key+ 'Status'] == 'error') {
          message.warning('请检查'+ ruleColumn[j].title + '填写')
          return false
        }
      }
    }
  }
  return true
}

/**
 * 删除
 */
function handleDel() {
  let id = selectedNode.value.id
  defHttp.delete({ url: api.delete, params: { id: id } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      message.success(res.message)
      reloadData()
    } else {
      message.warning(res.message)
    }
  })
}

/**
 * 删除筛选条件
 * @param record
 * @param index
 */
function handleDelSxtj(record, index) {
  if (record.id) {
    defHttp.delete({ url: api.delSxtj, params: { id: record.id } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success(res.message)
        sxtjxx.value.splice(index, 1)
      } else {
        message.warning(res.message)
      }
    })
  } else {
     sxtjxx.value.splice(index, 1)
  }
}

</script>

<style lang="less" scoped>
@import url('/@/assets/less/form.less');
.sfbzpz {
  height: 100%;
  
  .left {
    :deep(.ant-spin-nested-loading) {
      height: calc(100% - 50px);
    }
  }
  
  .sfbzpz-detail {
    height: 100%;
    
    :deep(.ant-spin-nested-loading) {
      height: calc(100% - 60px);
    }
  }
}

.sfbzpz-form-spin {
  height: calc(100% - 60px);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sfbzpz-tree-spin {
  height: calc(100% - 50px);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cbx-css {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

</style>