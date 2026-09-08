<template>
  <div class="my-tenant-page">
    <a-tabs v-if="tenantId" v-model:activeKey="activeKey" class="my-tenant-tabs">
      <a-tab-pane key="basic" tab="基本信息">
        <tenant-info :select-info="{ id: tenantId }" readonly />
      </a-tab-pane>
      <a-tab-pane key="process" tab="流程关联" force-render>
        <process-tree :select-info="{ id: tenantId }" />
      </a-tab-pane>
      <a-tab-pane key="role" tab="角色关联" force-render>
        <role-list :select-info="{ id: tenantId }" />
      </a-tab-pane>
    </a-tabs>
    <a-empty v-else description="当前用户非租户" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useUserStore } from '/@/store/modules/user'
import TenantInfo from './components/tenantInfo.vue'
import ProcessTree from './components/ProcessTree.vue'
import RoleList from './components/RoleList.vue'

const userStore = useUserStore()
const tenantId = computed(() => userStore.getTenant)
const activeKey = ref('basic')
</script>

<style lang="less" scoped>
.my-tenant-page {
  height: 100%;
  padding: 10px;
  background: #fff;
}

.my-tenant-tabs {
  height: 100%;
}
</style>
