<template>
  <tableList v-if="type == 'table'" :operable="operable" :category="cate"></tableList>
  <contentList v-else :category="cate"></contentList>
</template>

<script setup lang="ts">
import contentList from './components/contentList.vue';
import tableList from './components/tableList.vue';
import { currentRoute } from "/@/router"

const route = currentRoute;

const props = defineProps({
  type: {
    type: String,
    default: 'table'
  },
  operable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    default: null
  }
})

const cate:any = props.category || route?.query?.category

</script>

<style lang="less" scoped>

</style>