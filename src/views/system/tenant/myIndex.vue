<template>
  <div class="my-tenant-page">
    <tenant-info v-if="tenantId" :select-info="{ id: tenantId }" readonly />
    <a-empty v-else description="当前用户非租户" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '/@/store/modules/user'
import TenantInfo from './components/tenantInfo.vue'

const userStore = useUserStore()
const tenantId = computed(() => userStore.getTenant)
</script>

<style lang="less" scoped>
.my-tenant-page {
  height: 100%;
  padding: 10px;
  background: #fff;
}
</style>
