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
                   <a-form-item label="库房编号" name="code" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
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
                   <a-input style="width: 100%" v-model:value="formState.kfid" readOnly></a-input>
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
                     <a-select-option :value="1">是</a-select-option>
                     <a-select-option :value="0">否</a-select-option>
                   </a-select>
                 </a-form-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-item label="编号方式" name="bhfs" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-select v-model:value="formState.bhfs" allow-clear :options="getDictItemsByCode('bhfs')" style="width: 100%" />
                 </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :md="12" :sm="24">
                  <a-form-item label="预留排架" name="isyl" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                   <a-select v-model:value="formState.isyl">
                     <a-select-option :value="1">是</a-select-option>
                     <a-select-option :value="0">否</a-select-option>
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
                  <a-button v-if="formState.type == 'pj' && formState.id" @click="handleCreateKg">
                    生成库格
                  </a-button>
                  <a-button v-if="formState.type == 'pj' && formState.id" @click="handleLookKg">
                    查看库格
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
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { cModal } from "/@/components/cModal/index"
import { getDictItemsByCode } from "/@/utils/form/commonUtils"

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
let formState = ref<any>({})
// 是否是在修改名称
let isChangeName = false

// 校验规则
let rules = ref<any>({
  code: [{ required: true, message: '请输入库房编号' }],
  pjjs: [{ required: true, message: '请输入排架节数' }],
  pjzs: [{ required: true, message: '请输入排架组数' }],
  isspj: [{ required: true, message: '请选择是否双排架' }],
  pjc: [{ required: true, message: '请输入排架长' }],
  kgc: [{ required: true, message: '请输入库格长' }],
  bhfs: [{ required: true, message: '请选择编号方式' }],
  kgylc: [{ required: true, message: '请输入库格预留长度' }]
})

const emit = defineEmits(['update:selectItem'])

enum api {
  savePj = '/api/zrzy-bdc/arch/arch/savePjxx',
  saveKf = '/api/zrzy-bdc/arch/arch/saveArchive',
  getPj = '/api/zrzy-bdc/arch/arch/getPjxx',
  getKf = '/api/zrzy-bdc/arch/arch/getArchive',
  createKg = '/api/zrzy-bdc/arch/arch/generateKg'
}

watch(() => props.selectItem, (newVal: any) => {
  if (newVal) {
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

/**
 * 通过id获取属性
 */
function getInfoById() {
  let url = formState.value.type == 'kf' ? api.getKf : api.getPj
  defHttp.get({ url: url, params: { id: formState.value.id } }, { withToken: true }).then((res: any) => {
    if (res && res.success) {
      Object.assign(formState.value, res.result);
      formState.value.bhfs = (formState.value.bhfs !== undefined && formState.value.bhfs !== null) ? formState.value.bhfs + '' : ''
      // 查询完后变为false
      props.selectItem.isNeedGetInfo = false
    }
  })
}

/**
 * code变化
 */
function handleChangeCode() {
  formState.value.name = formState.value.code 
  props.selectItem.name = formState.value.name
  isChangeName = true
}

function handleSave(isNeedMsg = true) {
  return new Promise((resolve) => {
    formState.value.name = formState.value.code
    formSpinning.value = true
    formRef.value.validate().then(() => {
      let url = formState.value.type == 'kf' ? api.saveKf : api.savePj
      let oldKey = formState.value.key
      let select = JSON.parse(JSON.stringify(formState.value))
      defHttp.post({ url: url, data: select }, { withToken: true }).then((res: any) => {
        if (res && res.success) {
          select.id = res.result
          select.oldKey = oldKey
          select.key = `${select.type}-${select.id}`
          emit('update:selectItem',select)
          if (isNeedMsg) {
            message.success('保存成功')
          }
          resolve(true)
        } else {
          message.success('保存失败:' + res.message)
          resolve(false)
        }
        formSpinning.value = false
      }).catch(err => {
        resolve(false)
        formSpinning.value = false
      })
    }).catch(err => {
      resolve(false)
      formSpinning.value = false
    })
  })
}

/**
 * 生成库格
 */
async function handleCreateKg() {
  let saveRes = await handleSave(false)
  if (saveRes) {
    defHttp.post({ url: api.createKg, params: { pjid: formState.value.id } }, { withToken: true }).then((res: any) => {
      if (res && res.success) {
        message.success('生成成功!')
      } else {
        message.warning('生成失败!' + res.message)
      }
    })
  }
}

/**
 * 查看库格
 */
function handleLookKg() {
  let modal = cModal({
    title: '库格楼盘表',
    isFullScreen: true,
    filePath: 'views/system/filemanage/components/LookKgLpb',
    formData: {
      id: formState.value.id
    },
    footer: false
  })
}

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