<template>
  <div style="height: 100%">
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <component v-bind:is="generateForm" :id="formData.formId" formType="modal"
                :formCode="formData.vfd" :formData="formData" :disabled="formData.iszd == '1'" :ref="setRef">
     </component>
      <template v-if="showQlr">
         <qlr-list :qlr="qlr" :ywh="ywh" :bdcdyh="bdcdyh" :disabled="formData.iszd == '1'" formType="modal" :regType="regType"></qlr-list>
      </template>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue"
import { sendSaveFun, getMultipleRef, sendQlrSaveFun } from "/@/views/bdc/public/bdc"
import QlrList from '/@/views/bdc/pages/qlr/QlrList.vue'
import { resetValidateInfos } from "/@/utils/form/wonder1.0.1"
import { defHttp } from "/@/utils/http/axios"
import { useRoute } from "vue-router"
import { message } from "ant-design-vue"
const route = useRoute();
const generateForm = computed(() => {
  return defineAsyncComponent(() => import("/@/views/online/form/GenerateForm.vue"))
})
let spinning = ref<boolean>(false)
// 通用表单组件实例
let demoRefs: any = []
// 动态设置ref 在组件渲染后才能设置
const setRef = (el: any) => {
  if (el) {
    demoRefs.push(el)
  }
}
// 是否显示权利人
let showQlr = ref<boolean>(true)
// 权利人信息
let qlr = ref<any>()
// 业务号
let ywh = ref<any>('')
// regType
let regType = ref<string>('')
// 不动产单元号
let bdcdyh = ref<string>('')

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

watch(() => props.formData.sfybz, (newVal, oldVal) => {
  console.log('弹窗表单',props.formData)
  showQlr.value = !! (props.formData.sfybz == '0')
  if (showQlr.value) {
     initQlrXx()
  }
  resetValidateInfos()
}, {
  immediate: true
})

onMounted(() => {
  
})

/**
 * 初始化权利人配置
 */
function initQlrXx() {
  ywh.value = props.formData.ywh
  bdcdyh.value = props.formData.bdcdyh
  
  let taskId = route.query.taskId || props.formData.taskId
  defHttp.get({ url: '/api/zrzy-bdc/flow/vue/getChildPageConfig', params: { ywh: ywh.value, bdcdyh: bdcdyh.value, taskId: taskId } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      qlr.value = res.result.qlrModelList || []
      regType.value = res.result.regType || ''
    } else {
      message.warning('获取权利人配置出错')
    }
  })
}


/**
 * 获取dom
 */
function checkDemoRefs() {
  if (demoRefs) {
    let el = [...demoRefs]
    if (el) {
      let mulArr = getMultipleRef([el], [])
      demoRefs = mulArr
      demoRefs = Array.from(new Set(demoRefs))
      // console.log('msarr', mulArr)
    }
  }
}


async function saveData(params?: any) {
  console.log('保存表单',demoRefs)
  if (params) {
    params['params']  = params?.params || props.formData
  } else {
    params = { params: props.formData }
  }
  
  checkDemoRefs()
  return await sendSaveFun('baseSave', demoRefs, spinning, params)
}

async function saveQlrData(type: any, params?: any) {
  if (params) {
    params = params?.params || props.formData
  } else {
    params = props.formData
  }
  
  checkDemoRefs()
  return await sendQlrSaveFun(type, demoRefs, spinning, params)
}

defineExpose({
  saveData,
  saveQlrData
})
</script>

<style lang="less" scoped>
:deep(.ant-input-disabled) {
    background-color: rgba(0, 0, 0, 0.02)
}

:deep(.ant-input[disabled]) {
    background-color: rgba(0, 0, 0, 0.02)
}

:deep(.ant-select-disabled.ant-select:not(.ant-select-customize-input)) {
  .ant-select-selector {
    background-color: rgba(0, 0, 0, 0.02)
  }
}

:deep(.ant-picker.ant-picker-disabled) {
    background-color: rgba(0, 0, 0, 0.02)
}

:deep(.ant-input-number-disabled) {
  background-color: rgba(0, 0, 0, 0.02)
}
</style>