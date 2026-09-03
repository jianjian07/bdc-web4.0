<template>
  <div class="my-tenant-pack-page">
    <tenant-pack-manager v-if="tenantId" :tenant-id="tenantId" tenant-scoped />
    <a-empty v-else description="当前用户非租户" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useUserStore } from '/@/store/modules/user'
import TenantPackManager from './index.vue'

const userStore = useUserStore()
const tenantId = computed(() => userStore.getTenant)
</script>

<style lang="less" scoped>
.my-tenant-pack-page {
  height: 100%;
  background: #fff;
}
</style>
