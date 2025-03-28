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
    <a-menu-item :key="item.path" :role="JSON.stringify(item)" v-else>
      <span class="anticon" v-if="item.icon">
        <svg-icon :name="item.icon" width="14px" height="14px" color="#fff"></svg-icon>
      </span>
      <span :style="item.icon ? 'margin-left:0.5rem' : ''">{{ item.name }}</span>
    </a-menu-item>
  </template>
</template>

<script lang="ts" setup name="subMenu">

const props = defineProps({
  menu: {
    type: Object,
    default: []
  }
})
</script>

<style scoped></style>
