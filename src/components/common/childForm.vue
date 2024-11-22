<template>
  <!-- 这里增加一行解决传值报错问题 -->
    <component v-bind:is="component" ref="child" v-if="isCorrect" v-bind="useAttrs">
    </component>
    <a-card v-else>
      <a-empty/>
    </a-card>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, useAttrs, watch, watchEffect } from "vue"

let isCorrect = ref(false)
let component:any = ref(null)
const modules = import.meta.glob('/src/**/*.vue')
const props = defineProps({
  filePath: {
    type: String,
    default: ''
  }
})
let child = ref()

watch(() => props.filePath, (val) => {
  isCorrect.value = false
  component.value = null
  // console.log('chilForm监听子页面变化', val)
  if(val) {
    let componentPath = `/src/${val}.vue`
    let loaded = val ? Object.keys(modules).includes(componentPath) : false
    if(loaded) {
      component.value = defineAsyncComponent(modules[(`/src/${val}.vue`)])
      // console.log('component.value 已动态注册', component.value.name)
    } else {
      // import在框架报错
      // component.value = defineAsyncComponent(() => import(`/src/${val}.vue`))
      // console.log('页面找不到')
    }
  }
},{
  immediate: true,
  deep: true
})

watch(() => component.value, (val) => {
  if(val) {
    isCorrect.value = true
    // console.log('开始加载子页面')
  } else {
    // console.log('不加载子页面')
  }
}, {
  immediate: true
})


defineExpose({
  child
})

</script>

<style lang="less" scoped>

</style>
