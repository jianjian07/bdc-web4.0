<template>
  <template v-for="(item) in menu">
    <a-sub-menu :key="item.id" v-if="item.children && item.children.length">
      <template #title>
        <span class="anticon">
          <svg-icon :name="item.icon" width="14px" height="14px" color="#fff"></svg-icon>
        </span>
        <span style="margin-left:0.5rem">{{ item.name }}</span>
      </template>
      <subMenu :menu="item.children"></subMenu>
    </a-sub-menu>
    <a-menu-item :title="item.name" :key="item.path" :role="JSON.stringify(item)" v-else>
      <a-tooltip placement="right" :title="item.name">
        <div style="margin-right: -16px">
          <span class="anticon" v-if="item.icon">
            <svg-icon :name="item.icon" width="14px" height="14px" color="#fff"></svg-icon>
          </span>
          <span :style="item.icon ? 'margin-left:0.5rem' : ''">{{ item.name }}</span>
        </div>
      </a-tooltip>
    </a-menu-item>
  </template>
</template>

<script lang="ts" setup name="subMenu">
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
const props = defineProps({
  menu: {
    type: Object,
    default: []
  }
})
// 收缩状态
const { getCollapsed } = useMenuSetting();
</script>

<style scoped></style>
