<template>
  <div style="height: 100%">
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <component v-bind:is="generateForm" :id="formData.formId"
                :formCode="formData.vfd" :formData="formData" :disabled="formData.iszd == '1'" :ref="setRef">
     </component>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref } from "vue"
import { sendSaveFun } from "/@/views/bdc/public/bdc"

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

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})


onMounted(() => {
  
})

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

function getMultipleRef(list: any[], arr: any[]) {
  list.forEach((item: any) => {
    if (Array.isArray(item)) {
      let _list = getMultipleRef(item, [])
      arr = [...arr, ..._list]
    } else {
      arr.push(item)
      if ((item && item.multipleRef && item.multipleRef())) {
        return getMultipleRef(item.multipleRef(), arr)
      } else if (item && item.$ && item.$.exposed && item.$.exposed.multipleRef && item.$.exposed.multipleRef()) {
        return getMultipleRef(item.$.exposed.multipleRef(), arr)
      } else if (item && item._ && item._.exposed && item._.exposed.multipleRef && item._.exposed.multipleRef()) {
        return getMultipleRef(item._.exposed.multipleRef(), arr)
      }
    }
  })
  console.log('arr', arr)
  return arr
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

defineExpose({
  saveData
})
</script>

<style lang="less" scoped>

</style>