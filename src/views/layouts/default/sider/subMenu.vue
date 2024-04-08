<template>
  <template v-for="(item) in menu">
    <a-sub-menu :key="item.id" v-if="item.children && item.children.length">
      <template #title>
        <span class="anticon">
          <svg-icon :name="item.icon" width="14px" height="14px" color="#fff" style="margin-right: 10px;"></svg-icon>
        </span>
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
