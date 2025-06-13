<template>
  <a-form :model="record" layout="vertical">
    <a-row :gutter="24" v-for="col in filteredColumns" :key="col.dataIndex">
      <a-col :span="24">
        <a-form-item :label="col.title" :name="col.dataIndex">
          <a-textarea
              :autoSize="{ minRows: 1, maxRows: 20 }"
              v-model:value="record[col.dataIndex]"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<script setup lang="ts">import { computed, toRefs } from "vue";

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
});
const { formData } = toRefs(props);
// 提取 column 和 record
const column = computed(() => formData.value?.column || []);
const record = computed(() => formData.value?.record || {});
// 过滤掉 action 列
const filteredColumns = computed(() =>
    column.value.filter(col => col.dataIndex !== 'action' && !col.options?.hidden)
);
</script>

<style scoped lang="less"></style>