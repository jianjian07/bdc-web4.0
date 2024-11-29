<template>
  <div class="look-public" style="height: 100%;">
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <template v-for="(form, index) in formList">
        <component v-bind:is="form.bdlb == '0' ? generateForm : component(form.vfd)" :id="form.formId"
          :formCode="form.vfd" :disabled="true" :ref="setRef">
        </component>
      </template>
       <template v-if="qlr">
         <qlr-list v-show="showQlr" :qlr="qlr" disabled></qlr-list>
       </template>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue"
import QlrList from '/@/views/bdc/pages/qlr/QlrList.vue'
import eventBus from "/@/views/bdc/djlc/eventBus"
const modules = import.meta.glob('/src/**/*.vue')
const generateForm = computed(() => {
  return defineAsyncComponent(() => import("/@/views/online/form/GenerateForm.vue"))
})


const props = defineProps({
  vueList: {
    type: Array,
    default: []
  },
  qlrxx: {
    type: Array,
    default: []
  }
})

let spinning = ref<boolean>(false)
let formList = ref<any>([])
// 权利人
let qlr = ref<any>()
// 是否显示权利人
let showQlr = ref<boolean>(true)
// 通用表单组件实例
let demoRefs: any = []
// 动态设置ref 在组件渲染后才能设置
const setRef = (el: any) => {
  if (el) {
    demoRefs.push(el)
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

onMounted(() => {
  initBusEvent()
  formList.value = props.vueList || []
  qlr.value = props.qlrxx ? Array.isArray(props.qlrxx) ? props.qlrxx : [props.qlrxx] : []
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
 * 表单权利人是否显示
 * @param value
 */
function onChangeQlrShow(value) {
  showQlr.value = value.show
}
</script>

<style lang="less" scoped>

</style>