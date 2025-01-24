<template>
  <div class="file-form">
    <div v-if="!selectItem || (selectItem && selectItem.type == 'dag')" class="file-empty">
       <a-empty description="请先添加或选中库房或排架数据"></a-empty>
    </div>
    <template v-else>
      <div class="file-form-title title-css1 title-left" >
        <span>{{ selectItem.type == 'kf' ? '库房配置' : '排架配置'}}</span>
      </div>
      <div class="file-form-content">
        <a-spin :spinning="formSpinning" class="file-form-spin">
          <a-form ref="formRef" :model="formState" :rules="rules">
            <template v-if="selectItem.type == 'kf'">
              <a-row>
                <a-col :md="24">
                   <a-form-item label="库房编号" name="code1" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
                    <a-input v-model:value="formState.code" @change="handleChangeCode"/>
                  </a-form-item>
                </a-col>
               <a-col :md="24">
                 <a-form-item label="库房说明" name="bz" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
                   <a-input v-model:value="formState.bz"/>
                 </a-form-item>
               </a-col>
              </a-row>
            </template>
            <template v-else>
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="库房号" name="kfid" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input style="width: 100%" v-model:value="formState.kfid"></a-input>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="排架编号" name="code" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input style="width: 100%" v-model:value="formState.code" @change="handleChangeCode"></a-input>
                 </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="排架节数" name="pjjs" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.pjjs"></a-input-number>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="排架组数" name="pjzs" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.pjzs"></a-input-number>
                 </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="排架长" name="pjc" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.pjc" addonAfter="CM"></a-input-number>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="库格长" name="kgc" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.kgc" addonAfter="CM"></a-input-number>
                 </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="双排架" name="isspj" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-select  v-model:value="formState.isspj">
                     <a-select-option value="1">是</a-select-option>
                     <a-select-option value="0">否</a-select-option>
                   </a-select>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="编号方式" name="bhfs" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.bhfs"></a-input-number>
                 </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="预留排架" name="isyl" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-select v-model:value="formState.isyl">
                     <a-select-option value="1">是</a-select-option>
                     <a-select-option value="0">否</a-select-option>
                   </a-select>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="库格预留长度" name="kgylc" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-input-number style="width: 100%" v-model:value="formState.kgylc" addonAfter="CM"></a-input-number>
                 </a-form-item>
                </a-col>
              </a-row>
            </template>
             <div style="text-align: center;margin-top: 10px">
                <a-space>
                  <a-button type="primary" @click="handleSave">
                    保存
                  </a-button>
                </a-space>
             </div>
          </a-form>
        </a-spin>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref,watch } from "vue"

const props = defineProps({
  selectItem: {
    type: Object,
    default: {}
  }
})
// 表单加载状态
let formSpinning = ref<boolean>(false)
// 表单实例
let formRef = ref();
// 详细信息
let formState = ref<any>({
  
})

let isChangeName = false

// 校验规则
let rules = ref<any>({
  code1: [{ required: true, message: '请输入库房编号' }],
})

watch(() => props.selectItem, (newVal: any) => {
  if (newVal) {
    // formRef.value?.resetFields()
    formState.value = newVal
    if (newVal.isNeedGetInfo && !isChangeName) {
      getInfoById()
    }
    isChangeName = false
  }
}, {
  deep: true,
  immediate: true
})

function getInfoById() {
  // 查询完后变为false
  props.selectItem.isNeedGetInfo = false
}

function handleChangeCode() {
  formState.value.name = formState.value.code 
  props.selectItem.name = formState.value.name
  isChangeName = true
}

function handleSave() {
  formState.value.name = formState.value.code 
}

// 


</script>

<style lang="less" scoped>
.file-form {
  width: calc(100% - 400px);
  padding: 10px;
  height: 100%;
  
  .file-empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .file-form-content {
    height: calc(100% - 60px);
    overflow: auto;
  }
  
  .file-form-spin {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>