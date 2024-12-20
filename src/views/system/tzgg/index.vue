<template>
  <tableList v-if="type == 'table'" :operable="operable" :category="cate"></tableList>
  <contentList v-else :category="cate"></contentList>
</template>

<script setup lang="ts">
import contentList from './components/contentList.vue';
import tableList from './components/tableList.vue';
import { useRoute } from "vue-router"

const route = useRoute()

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

console.log(route.query)

const cate:any = props.category || route?.query?.category

</script>

<style lang="less" scoped>

</style>