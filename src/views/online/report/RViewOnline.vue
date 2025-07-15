<template>
  <Suspense>
    <template #default>
      <CRViewer ref="rView" :id="code" :p-router="router" :p-route="route" :p-formData="{ bdc: bdc, ...formData }" v-bind="attrs"></CRViewer>
    </template>
    <template #fallback>
      <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
        <a-spin size="large" />
      </div>
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router"
import { router } from "/@/router"
import * as bdc from '/@/views/bdc/public/bdc'
import { onMounted, provide, ref, useAttrs } from "vue"
import { createScopedBus } from "/@/views/online/utils/scopeEventBus.ts"
import { updateCModalScopeBus } from "/@/components/cModal/index.ts"
import { updateCDrawerScopeBus } from "/@/components/cDrawer/index.ts"
const eventBus = createScopedBus()
const attrs = useAttrs()
updateCModalScopeBus(eventBus)
updateCDrawerScopeBus(eventBus)
provide('scopedEventBus', eventBus)
let rView = ref()

const props = defineProps({
    id: {
        type: String,
        default: "-1"
    },
    formData: {
        type: Object,
        default: {}
    }
})

defineExpose({
  rView
})

const route = useRoute();
let code: string = props.formData.formId || props.id ; 
if (code == "-1") {
    if (route.params.code == undefined) {
        code = route.fullPath.split('/').pop() || '-1'
    } else {
        code = route?.params?.code.toString()
    }
}

onMounted(() => {
  
})

</script>

<style scoped>

</style>