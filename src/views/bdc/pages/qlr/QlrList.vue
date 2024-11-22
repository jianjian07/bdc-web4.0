<template>
    <div class="qlr-list" v-show="showQlr">
      <template v-for="(item, index) in qlrList">
        <qlr :qlrxx="item" :jdmc="jdmc"></qlr>
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
    type: String,
    default: ''
  },
  jdmc: {
    type: String,
    default: ''
  },
  // 可用来区分表单还是弹窗权利人
  type: {
    type: String,
    default: 'form'
  }
})
// 是否显示权利人列表
let showQlr = ref<boolean>(true)

onMounted(() => {
  let qlrmc = props.qlr
  let qlrxx = qlrmc.split(';')
  qlrList.value = qlrxx.map((qlr, index) => {
    return {
      qlrlb: qlr,
      djsxh: index
    }
  })
})

onBeforeUnmount(() => {
  eventBus.off('onChangeQlr', onChangeQlrShow)
})

/**
 * 监听权利人列表是否显示
 * @param value
 */
function onChangeQlrShow(value) {
  if (value) {
    value.type = value.type || 'form'
    if (value.type == props.type) {
       showQlr.value = value.show
    }
  }
}

</script>

<style scoped lang="less">

</style>