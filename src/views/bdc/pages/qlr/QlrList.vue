<template>
    <div class="qlr-list">
      <template v-for="(item, index) in qlrList">
        <qlr :qlrxx="item" :jdmc="jdmc" :ywh="ywh" :disabled="disabled" :formType="formType"></qlr>
      </template>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import Qlr from "/@/views/bdc/pages/qlr/Qlr.vue"
import eventBus from "/@/views/bdc/djlc/eventBus"
// 权利人渲染列表
let qlrList = ref<any>([])

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
  }
})

onMounted(() => {
  qlrList.value = props.qlr
})

</script>

<style scoped lang="less">

</style>