<template>
  <Suspense>
    <template #default>
      <CFViewer :style="isRouterPage ? 'padding: 20px' : ''" ref="fView" :id="formId" :p-router="router" :p-route="route" :reload="reload" :disabled="_disabled" formType="form" :p-formData="{ bdc: bdc, ...formData }" v-bind="attrs"></CFViewer>
    </template>
    <template #fallback>
      <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
        <a-spin size="large" />
      </div>
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
import { currentRoute, router } from "/@/router"
import * as bdc from '/@/views/bdc/public/bdc'
const route = currentRoute;
const userStore = useUserStore();
const userInfo = userStore.getUserInfo
const attrs = useAttrs()
import { onBeforeUnmount, onMounted, ref, useAttrs } from "vue"
import { resetValidateInfos } from "form-imagining"
import { useUserStore } from "/@/store/modules/user"
const { disabled } = useAttrs()
const props = defineProps({
    id: {
        type: String,
        default: "-1"
    },
    formData: {
        type: Object,
        default: {}
    },
    reload: {
        type: String,
        default: ''
    },
    formType: {
        type: String,
        default: 'form'
    }
})

let fView = ref()
// 页面单独表单预览 则增加padding
let isRouterPage = ref<boolean>(false)
let _disabled: any
_disabled = disabled == undefined ? route.query.iszd == '1' : disabled
let formId: string = props.formData.formId || props.id
if (formId == "-1") {
    if (route.params.code == undefined) {
        const pathSegments = route.path.split('/')
        formId = pathSegments[pathSegments.length - 1] || '-1'
    } else {
        formId = route?.params?.code.toString()
    }
    isRouterPage.value = true
}

onMounted(() => {
  resetValidateInfos()
})

onBeforeUnmount(() => {
  resetValidateInfos()
})

defineExpose({
  fView
})
</script>

<style scoped>

</style>