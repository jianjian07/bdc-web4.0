<template>
    <div class="qlr-list">
      <template v-for="(item, index) in qlrList">
        <qlr :qlrxx="item" :jdmc="jdmc"></qlr>
      </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import Qlr from "/@/views/bdc/pages/qlr/Qlr.vue"
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
  }
})

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
</script>

<style scoped lang="less">

</style>