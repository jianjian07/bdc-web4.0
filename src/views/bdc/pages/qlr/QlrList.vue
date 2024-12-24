<template>
    <div class="qlr-list">
      <template v-for="(item, index) in qlrList">
        <qlr :ref="qlrRef(item.qlrxsmc)" :qlrxx="item" :jdmc="jdmc" :ywh="ywh" :disabled="disabled" :formType="formType" :regType="regType" @getTbxx="getTbxx"></qlr>
      </template>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import Qlr from "/@/views/bdc/pages/qlr/Qlr.vue"
import eventBus from "/@/views/bdc/djlc/eventBus"
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
  if (value && qlrRefs[value] && qlrRefs[value].initData) {
    qlrRefs[value].initData()
  }
}

</script>

<style scoped lang="less">

</style>