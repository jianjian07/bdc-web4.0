<template>
  <tableList v-if="type == 'table'" :operable="operable"></tableList>
  <contentList v-else ></contentList>
</template>

<script setup lang="ts">
import contentList from './components/contentList.vue';
import tableList from './components/tableList.vue';

const props = defineProps({
  type: {
    type: String,
    default: 'table'
  },
  operable: {
    type: Boolean,
    default: true
  }
})

</script>

<style lang="less" scoped>

</style>