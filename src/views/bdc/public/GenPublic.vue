<template>
  <div style="height: 100%">
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <component v-bind:is="generateForm" :id="formData.formId"
                :formCode="formData.vfd" :formData="formData" :disabled="formData.iszd == '1'" :ref="setRef">
     </component>
      <template v-if="qlr">
         <qlr-list v-show="showQlr" :qlr="qlr" :ywh="ywh" type="modal"></qlr-list>
      </template>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref } from "vue"
import { sendSaveFun, getMultipleRef, sendQlrSaveFun } from "/@/views/bdc/public/bdc"
import QlrList from '/@/views/bdc/pages/qlr/QlrList.vue'
import { resetValidateInfos } from "/@/utils/form/wonder1.0.1"

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

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

onMounted(() => {
  // console.log('弹窗表单',props.formData)
  showQlr.value = !! (props.formData.sfybz == '0')
  resetValidateInfos()
  initQlrXx()
})

function initQlrXx() {
  // todo
  qlr.value = [{
  "lcid": "1780060462306840577",
  "djlx": "0101",
  "qllx": "3",
  "qlrlx": "12",
  "qlrlxmc": "权利人",
  "qlrxsmc": "权利人",
  "btnId": "3,1,2,4",
  "sxh": 1
}]
  ywh.value = props.formData.ywh
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

</style>