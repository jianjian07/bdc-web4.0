<template>
  <CFViewer ref="fView" :id="id" :p-router="router" :p-route="route" :reload="reload" formType="form" :p-formData="{ bdc: bdc, ...formData }"></CFViewer>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router"
import { router } from "/@/router"
import * as bdc from '/@/views/bdc/public/bdc'
const route = useRoute();
const userStore = useUserStore();
const userInfo = userStore.getUserInfo
import { ref } from "vue"
import { useUserStore } from "/@/store/modules/user"
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

defineExpose({
  fView
})
</script>

<style scoped>

</style>