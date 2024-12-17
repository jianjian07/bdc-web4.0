<template>
  <tableList v-if="type == 'table'" :header="header"></tableList>
  <contentList v-else></contentList>
</template>

<script setup lang="ts">
import contentList from './components/contentList.vue';
import tableList from './components/tableList.vue';
import { onMounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'table'
  },
  header: {
    type: Boolean,
    default: true
  }
})

onMounted(() => {
  
});

</script>

<style lang="less" scoped>

</style>