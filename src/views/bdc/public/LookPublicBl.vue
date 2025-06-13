<template>
  <div class="look-public-bl" style="height: 100%;">
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <template v-for="(form, index) in formList">
        <component v-bind:is="form.bdlb == '0' ? generateForm : component(form.vfd)" :id="form.formId"
          :formCode="form.vfd" :disabled="true" :ref="(el) => setRef(el, form.formId)">
        </component>
      </template>
      <template v-if="qlr && isAllFinished">
        <qlr-list v-show="showQlr" :qlr="qlr" disabled></qlr-list>
      </template>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onActivated, onBeforeUnmount, onMounted, provide, ref } from "vue"
import QlrList from '/@/views/bdc/pages/qlr/QlrList.vue'
import { resetValidateInfos, eventBus } from "form-imagining"
import { defHttp } from "/@/utils/http/axios"
const modules = import.meta.glob('/src/**/*.vue')
import { useRoute } from "vue-router"
import { message } from "ant-design-vue"
import { updateCModalScopeBus } from "/@/components/cModal/index"
import { createScopedBus } from "/@/views/online/utils/scopeEventBus"
import { updateCDrawerScopeBus } from "/@/components/cDrawer/index.ts"
import { getMultipleRef } from "/@/views/bdc/public/bdc.ts"
const eventBus = createScopedBus()
updateCModalScopeBus(eventBus)
updateCDrawerScopeBus(eventBus)
provide('scopedEventBus', eventBus)
const route = useRoute();
const generateForm = computed(() => {
  return defineAsyncComponent(() => import("/@/views/online/form/FViewOnline.vue"))
})


let spinning = ref<boolean>(false)
let formList = ref<any>([])
// 权利人
let qlr = ref<any>()
// 是否显示权利人
let showQlr = ref<boolean>(true)
// 创建响应式Map
let demoRefsMap = ref(new Map<string, any>())

const demoRefs = computed(() => {
  const all = Array.from(demoRefsMap.value.values())
  return getMultipleRef(all, [])
})

// 动态设置ref 在组件渲染后才能设置
const setRef = (el: any, formId: string) => {
  const fView = el?.fView || el?.$?.exposed?.fView
  if (el && fView) {
    demoRefsMap.value.set(formId, fView)
  }
}

// 动态组件是否全部加载
const isAllFinished = computed(() => {
  return demoRefs.value.length === formList.value.length
})

const component = (path: string) => {
  let _com = `/src/views/${path}.vue`
  let isCorrect = Object.keys(modules).includes(_com)
  if (isCorrect) {
    return defineAsyncComponent(modules[`/src/views/${path}.vue`])
  } else {
    return null
  }
}


enum api {
  getFlowConfig = '/api/zrzy-bdc/flow/vue/getFlowConfigNoActiviti'
}

onMounted(() => {
  initBusEvent()
  getFormConfig()
  resetValidateInfos()
})

onActivated(() => {
  updateCModalScopeBus(eventBus)
})

onBeforeUnmount(() => {
  removeBusEvent()
})

function initBusEvent() {
  eventBus.on('onChangeQlr', onChangeQlrShow)
}

function removeBusEvent() {
  eventBus.off('onChangeQlr', onChangeQlrShow)
}

/**
 * 获取表单配置
 */
function getFormConfig() {
  spinning.value = true
  let slbh = route.query.slbh
  let db = route.query.db
  defHttp.get({ url: api.getFlowConfig, params: { slbh: slbh, db: db } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      let formConfig = res.result
      formList.value = formConfig?.vueList || []
      let qlrList = Array.isArray(formConfig.qlrList) ? formConfig.qlrList : [formConfig.qlrList]
      qlr.value = formConfig.qlrList ? qlrList : []
    } else {
      message.warning('获取表单配置出错')
    }
    spinning.value = false
  })
}

/**
 * 表单权利人是否显示
 * @param value
 */
function onChangeQlrShow(value) {
  showQlr.value = value.show
}
</script>

<style lang="less" scoped>
.look-public-bl {
  :deep(.ant-spin-container) {
    padding: 10px;
  }
}
</style>