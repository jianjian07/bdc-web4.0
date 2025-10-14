<template>
  <div class="public-form">
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <template v-for="(form, index) in formList">
        <template v-if="form.bdlb == '0'">
          <component v-bind:is="generateForm" :id="form.formId" :key="form.formId" :formCode="form.vfd"
            :disabled="form.iszd == '1'" :formData="{ }" :ref="(el) => setRef(el, form.formId)">
          </component>
        </template>
        <template v-else>
          <component v-bind:is="component(form.vfd)" :id="form.formId" :key="form.formId" :formCode="form.vfd"
            :disabled="form.iszd == '1'" :formData="{ }" :ref="(el) => setCRef(el, form.formId)">
          </component>
        </template>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  provide,
  ref
} from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { getMultipleRef, sendSaveFun } from "/@/views/bdc/public/bdc"
import { createScopedBus } from "/@/views/online/utils/scopeEventBus"
import { resetValidateInfos } from "form-imagining"
import { message } from "ant-design-vue"
import { updateCModalScopeBus } from "/@/components/cModal/index"
import { updateCDrawerScopeBus } from "/@/components/cDrawer/index.ts"
import { currentRoute } from "/@/router"
const eventBus = createScopedBus()
updateCModalScopeBus(eventBus)
updateCDrawerScopeBus(eventBus)
provide('scopedEventBus', eventBus)
const modules = import.meta.glob('/src/**/*.vue')
const generateForm = computed(() => {
  return defineAsyncComponent(() => import("/@/views/online/form/FViewOnline.vue"))
})
const route = currentRoute;
// 是否有权限进入此页面
let hasPermission = ref<boolean>(false)
// 表单列表
let formList = ref<any>([])
// 表单loading
let spinning = ref<boolean>(false)
// 创建响应式Map
let demoRefsMap = ref(new Map<string, any>())

const demoRefs = computed(() => {
  const all = Array.from(demoRefsMap.value.values())
  return getMultipleRef(all, [])
})

// 动态组件是否全部加载
const isAllFinished = computed(() => {
  return demoRefs.value.length === formList.value.length
})

const setRef = (el: any, formId: string) => {
  const fView = el?.fView || el?.$?.exposed?.fView
  if (el && fView) {
    demoRefsMap.value.set(formId, fView)
  }
}

const removeRef = (formId: string) => {
  demoRefsMap.value.delete(formId)
}

const setCRef = (el: any, formId: string) => {
  if (el) {
    demoRefsMap.value.set(formId, el)
  }
}

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
  getFlowConfig = '/api/zrzy-kyq/kyq/flow/flowList',
}

onMounted(() => {
  window.addEventListener('message', eventLister, false)
  getFormConfig()
  initBusEvent()
  resetValidateInfos()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', eventLister, false)
  removeBusEvent()
  resetValidateInfos()
})

onActivated(() => {
  updateCModalScopeBus(eventBus)
})

onDeactivated(() => {
  // 缓存页面离开时清除校验效果
  resetValidateInfos()
})

function initBusEvent() {
}

function removeBusEvent() {
}

/**
 * 获取表单配置
 */
function getFormConfig() {
  let lcid = route.query.procDefid
  let jdid = route.query.actDefid
  defHttp.get({ url: api.getFlowConfig, params: { lcid: lcid, jdid: jdid } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      formList.value = res.result || []
    }
  })
}

/**
 * 监听事件
 * @param e
 */
async function eventLister(e: { data: string; }) {
  // 接收来自框架的数据
  let data = Object.prototype.toString.call(e.data) === '[object String]' ? JSON.parse(e.data) : e.data
  // 执行保存方法标识
  switch (data.method) {
    case 'saveForm':
      if (!isAllFinished.value) {
        message.warning('表单还未加载完毕!')
        return
      }
      let dData = Object.prototype.toString.call(data.data) === '[object String]' ? JSON.parse(data.data) : data.data
      // saveType为保存类型 true为仅保存 false为移交
      if (dData && dData.saveType) {
        let res = await sendSaveFun('baseSave', demoRefs.value, null, spinning, eventBus)
        sendSaveResult(res)
        // console.log('res', res)
      } else if (data && !data.saveType) {

      }
  }
}

/** 发送保存结果回框架 */
function sendSaveResult(res) {
    window.top?.postMessage(JSON.stringify({
        method: 'getSaveFormResult',
        data: JSON.stringify(res)
    }), '*')
}

</script>

<style scoped lang="less">
.public-form {
  height: 100%;
  overflow: auto;
  padding: 0 5px;

   :deep(.ant-spin-container) {
      height: 100%;
   }

   :deep(.ant-spin-nested-loading) {
      height: 100%;
   }
}

.form-content-spin {
  height: 100% !important;
}

:deep(.ant-input-disabled) {
  background-color: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.88);
}

:deep(.ant-input[disabled]) {
  background-color: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.88);
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
