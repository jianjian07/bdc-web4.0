<template>
  <div style="height: 100%">
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <component v-bind:is="generateForm" :id="formData.formId" formType="modal" :key="formData.formId"
        :formCode="formData.vfd" :formData="formData" :disabled="formData.iszd == '1'"
        :ref="(el) => setRef(el, formData.formId)">
      </component>
      <template v-if="showQlr">
        <qlr-list :qlr="qlr" :ywh="ywh" :bdcdyh="bdcdyh" :disabled="formData.iszd == '1'" formType="modal"
          :regType="regType"></qlr-list>
      </template>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, inject, nextTick, onMounted, ref, watch } from "vue"
import { sendSaveFun, getMultipleRef, sendQlrSaveFun, sendPlJcf } from "/@/views/bdc/public/bdc"
import QlrList from '/@/views/bdc/pages/qlr/QlrList.vue'
import { resetValidateInfos, getFormInfo } from "form-imagining"
import { defHttp } from "/@/utils/http/axios"
import { useRoute } from "vue-router"
import { message } from "ant-design-vue"
import { router } from "/@/router"
const route = useRoute();
const generateForm = computed(() => {
  return defineAsyncComponent(() => import("/@/views/online/form/FViewOnline.vue"))
})
let spinning = ref<boolean>(false)
// // 通用表单组件实例
// let demoRefs: any = []
// // 动态设置ref 在组件渲染后才能设置
// const setRef = (el: any) => {
//   if (el && el.fView) {
//     demoRefs.push(el.fView)
//   }
// }
const eventBus = inject('scopedEventBus', null)
// 创建响应式Map
let demoRefsMap = ref(new Map<string, any>())

const demoRefs = computed(() => {
  const all = Array.from(demoRefsMap.value.values())
  return getMultipleRef(all, [])
})

const setRef = (el: any, formId: string) => {
  const fView = el?.fView || el?.$?.exposed?.fView
  if (el && fView) {
    demoRefsMap.value.set(formId, fView)
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
  console.log('弹窗表单', props.formData)
  showQlr.value = !!(props.formData.sfybz == '0')
  if (showQlr.value) {
    initQlrXx()
  }
  // 外网转现提取弹窗用到 弹窗增加动态数据源参数
  if (props.formData.db && !route.query.db) {
    route.query.db = props.formData.db
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
  let slbh = route.query.slbh
  defHttp.get({ url: '/api/zrzy-bdc/flow/vue/getChildPageConfig', params: { slbh: slbh, ywh: ywh.value, bdcdyh: bdcdyh.value, taskId: taskId } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      qlr.value = res.result.qlrModelList || []
      regType.value = res.result.regType || ''
    } else {
      message.warning('获取权利人配置出错')
    }
  })
}


async function saveData(params?: any) {
  console.log('保存表单', demoRefs.value)
  if (params) {
    params['params'] = params?.params || props.formData
  } else {
    params = { params: props.formData }
  }

  // checkDemoRefs()
  // 这里如果是带.value的就需要拿到.value 因为保存的内部直接处理的formDoms[i].formId
  // eval那种形式是默认解包了 所以不需要再处理
  const refs = demoRefs.value.map(ref => ref?.value || ref)
  return await sendSaveFun('baseSave', refs, spinning, eventBus, params)
}

/**
 * 需要通过表单校验才能执行保存接口
 * @param params
 */
async function saveValidateData(params?: any) {
  // console.log('保存表单',demoRefs)
  if (params) {
    params['params'] = params?.params || props.formData
    params['validateSave'] = true
  } else {
    params = { params: props.formData, validateSave: true }
  }
  // checkDemoRefs()
  const refs = demoRefs.value.map(ref => ref?.value || ref)
  return await sendSaveFun('baseSave', refs, spinning, eventBus, params)
}

async function saveQlrData(type: any, params?: any) {
  if (params) {
    params = params?.params || props.formData
  } else {
    params = props.formData
  }

  // checkDemoRefs()
  const refs = demoRefs.value.map(ref => ref?.value || ref)
  return await sendQlrSaveFun(type, refs, spinning, params)
}

async function savePlJcf(params?: any) {
  if (params) {
    params = params?.params || props.formData
  } else {
    params = props.formData
  }

  // checkDemoRefs()
  const refs = demoRefs.value.map(ref => ref?.value || ref)
  return await sendPlJcf(refs, spinning, params)
}

async function getGenFormInfo() {
  const refs = demoRefs.value.map(ref => ref?.value || ref)
  let res = await getFormInfo(refs)
  return res
}
defineExpose({
  saveData,
  saveValidateData,
  saveQlrData,
  savePlJcf,
  getGenFormInfo
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