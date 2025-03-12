<template>
  <div class="iframe-index">
    <iframe
        :src="src"
        width="100%"
        height="100%"
        frameborder="0"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useAppStore } from "/@/store/modules/app"
import { useRouter } from "vue-router"
const appStore = useAppStore()
const router = useRouter()
let src = computed(() => appStore.getIframeSrc)

onMounted(() => {
  if (router.currentRoute.value.meta.iframe && router.currentRoute.value.meta.iframeUrl) {
    appStore.setIframeSrc(router.currentRoute.value.meta.iframeUrl)
  }
})
</script>

<style lang="less" scoped>
.iframe-index {
  width: 100%;
  height: 100%;
}
</style>
