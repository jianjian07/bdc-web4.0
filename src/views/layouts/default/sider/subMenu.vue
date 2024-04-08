<template>
  <template v-for="(item, ind) in menu" :key="ind">
    <a-sub-menu :key="item.id" v-if="item.children && item.children.length">
      <template #title>
        <span>{{ item.name }}</span>
      </template>
      <subMenu :menu="item.children"></subMenu>
    </a-sub-menu>
    <a-menu-item :key="item.path" :role="JSON.stringify(item)" v-else>
      <span>{{ item.name }}</span>
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
