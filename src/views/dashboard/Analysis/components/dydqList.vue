<template>
  <a-list item-layout="horizontal" :data-source="scrollList">
      <template #renderItem="{ item }">
        <a-list-item style="height: 40px">
          <a-list-item-meta
          >
            <template #description>
              <div style="display: flex; justify-content: space-between; color: #333;">
                <span style="width: 40%;">{{ item.title }}</span>
                <span>{{ item.zt }}</span>
                <span>{{ item.time }}</span>
              </div>
            </template>
            <template #avatar>
              <span style="color: #666">
                {{ item.index }}
              </span>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const scrollList = ref([
  {
    index: 1,
    title: '2016鄂9005执707号',
    zt: '状态',
    time: '2024-07-06'
  },
  {
    index: 2,
    title: '2016鄂9005执707号****',
    zt: '状态111',
    time: '2024-07-06'
  },
  {
    index: 3,
    title: '2016鄂9005执707号',
    zt: '状态2',
    time: '2024-07-06'
  },
  {
    index: 4,
    title: '2016鄂9005执707号',
    zt: '状态',
    time: '2024-07-06'
  }
])
</script>

<style lang="less" scoped>

</style>