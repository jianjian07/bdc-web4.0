<template>
  <div class="sfbzpz">
    <a-row :gutter="10" style="height: 100%">
      <a-col class="left" :md="7" :sm="24" style="padding:10px;border-right: 1px solid rgba(5, 5, 5, 0.06);height: 100%; overflow: auto">
        <a-alert type="info" :show-icon="true" style="margin-bottom: 10px">
          <template #message>
            当前选择：<span>{{ selectedNode.title }}</span> 
            <a v-if="selectedNode.title" style="margin-left: 10px">取消选择</a>
            <a> 刷新</a>
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
            <a-form :model="formState" :rules="rules">
              <a-row>
                <a-col :md="12" :sm="24">
                   <a-form-item label="收费条目名称" name="sfxmc" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                     <a-input v-model:value="formState.sfxmc" placeholder="请输入收费条目名称"></a-input>
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
                    <a-select v-model:value="formState.sfxgy" :options="getDictItemsByCode('sfxgy')" placeholder="请选择收费相关域">
                    </a-select>
                   </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="费用参数(元)" name="sffy" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input v-model:value="formState.sffy" placeholder="请输入费用参数(元)"></a-input>
                 </a-form-item>
                </a-col>
              </a-row>
              
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="收费上限" name="sfsx" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input v-model:value="formState.sfsx" placeholder="请输入收费上限"></a-input>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="序号" name="sxh" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input v-model:value="formState.sxh" placeholder="请输入序号"></a-input>
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
                    <a-select v-model:value="formState.sfjm" :options="getDictItemsByCode('sfjm')" placeholder="请选择是否减免">
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="减免方式" name="jmfs" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-select v-model:value="formState.jmfs" :options="getDictItemsByCode('jmfs')" placeholder="请选择是否减免">
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
                  <a-form-item label="筛选条件" name="sxtj" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
                    // todo 
                  </a-form-item>
                </a-col>
              </a-row>
              
              
<!--              <a-row>-->
<!--                <a-col :md="24">-->
<!--                  <a-form-item label="收费登记类型" name="sxtj" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">-->
<!--                    // todo -->
<!--                  </a-form-item>-->
<!--                </a-col>-->
<!--              </a-row>-->
              
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
import { getDictItemsByCode } from '/@/utils/form/commonUtils';

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
// 详细信息
let formState = ref<any>({
  sftmmc: ''
})
// 校验规则
let rules = ref<any>({
  sfxmc: [{ required: true, message: '请输入收费条目名称' }],
  sffy: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }],
  sfsx: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }],
  // sfdjlx: [{ required: true, message: '请选择收费登记类型!' }]
})

onMounted(() => {
  initData()
})

function initData() {
  spinning.value = true
  let res = [{
    id: '1',
    title: '收费标准',
    children: [{
      id: '1.1',
      title: '登记费',
      children: [{
        id: '1.1.1',
        title: '住宅、车位、仓库用房登记费'
      },{
        id: '1.1.2',
        title: '非住宅登记费'
      },{
        id: '1.1.3',
        title: '土地交易服务费(个人)'
      },{
        id: '1.1.4',
        title: '土地交易服务费(单位)'
      },{
        id: '1.1.5',
        title: '住宅抵押登记费'
      },{
        id: '1.1.6',
        title: '经济适用房'
      },{
        id: '1.1.7',
        title: '非住宅抵押登记费'
      },{
        id: '1.1.8',
        title: '住宅登记费(减免)'
      },{
        id: '1.1.9',
        title: '非住宅登记费(减免)'
      },{
        id: '1.1.10',
        title: '住宅、车位、仓库用房登记费(小微企业减免)'
      },{
        id: '1.1.11',
        title: '非住宅登记费(小微企业减免)'
      }]
    },{
      id: '1.2',
      title: '工本费',
      children: [{
        id: '1.2.1',
        title: '档案利用服务费(私产)'
      },{
        id: '1.2.2',
        title: '档案利用服务费(其他)'
      },{
        id: '1.2.3',
        title: '证书费'
      }]
    }]
  }]
  
  treeData.value = addIconName(res)
  setTimeout(() => {
    spinning.value = false
  },500)
  
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
  // console.log('rere',record)
  let firstLevel = treeData.value[0].key
  if (record.key !== firstLevel && record.children) {
    console.log('11')
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
          }
        }
      }
    })
  } else if (record.key !== firstLevel && !record.children) {
    selectedKeys.value = [record.key]
    selectedNode.value = record
    // todo 查询
    
  }
}

function handleSubmit() {
  
}

function handleDel() {
  
}

</script>

<style lang="less" scoped>
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

</style>