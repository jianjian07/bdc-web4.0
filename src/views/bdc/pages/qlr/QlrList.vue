<template>
    <div class="qlr-list">
      <template v-for="(item, index) in qlrList">
        <qlr :ref="qlrRef(item.qlrxsmc)" :qlrxx="item" :jdmc="jdmc" :ywh="ywh" :bdcdyh="bdcdyh" :disabled="disabled" :formType="formType" :regType="regType" @getTbxx="getTbxx"></qlr>
      </template>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import Qlr from "/@/views/bdc/pages/qlr/Qlr.vue"
import eventBus from "/@/views/online/utils/eventBus"
// 权利人渲染列表
let qlrList = ref<any>([])
// 权利人实例
let qlrRefs:any = []

let props = defineProps({
  qlr: {
    type: Array,
    default: []
  },
  jdmc: {
    type: String,
    default: ''
  },
  ywh: {
    type: String,
    default: ''
  },
  bdcdyh: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // 用于区别是弹窗权利人还是表单权利人
  formType: {
    type: String,
    default: ''
  },
  regType: {
    type: String,
    default: ''
  }
})

onMounted(() => {
  qlrList.value = props.qlr
  eventBus.on('reloadQlrList', reloadQlr)
})

onBeforeUnmount(() => {
  eventBus.off('reloadQlrList')
})

const qlrRef = (qlrxsmc) => (el) => {
  if (el) {
    qlrRefs[qlrxsmc] = el
  } else {
    qlrRefs[qlrxsmc] = null
  }
}

/**
 * 获取同步信息
 * @param value
 */
function getTbxx(value) {
  if (value) {
    let arr = value.includes(',') ? value.split(',') : [value]
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i]
      if (qlrRefs[item] && qlrRefs[item].initData) {
        qlrRefs[item].initData()
      }
    }
  }
}

/**
 * 加载权利人
 * @param value
 */
function initQlrData(value) {
  if (value) {
    const arr = value.includes(',') ? value.split(',') : [value]
    arr.forEach(item => qlrRefs[item]?.initData?.())
  } else {
    qlrList.value.forEach(({ qlrxsmc: item }) => qlrRefs[item]?.initData?.())
  }
}

/**
 * 刷新权利人
 * @param qlrxsmc
 */
function reloadQlr(qlrxsmc?: string) {
  initQlrData(qlrxsmc)
}


</script>

<style scoped lang="less">

</style>