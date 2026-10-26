<script setup lang="ts">
import type { Component } from 'vue'
/** 通用页头: 标题 + 描述 + 右侧操作区,统一各页面视觉基线 */
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: Component
  }>(),
  { description: '', icon: undefined }
)
</script>

<template>
  <div class="page-header-wrap">
    <div class="title-block">
      <div v-if="icon" class="title-icon">
        <component :is="icon" />
      </div>
      <div class="title-text">
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
    </div>
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.title-block {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.title-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  color: var(--brand);
  background: linear-gradient(135deg, #eef2ff, #e0f2fe);
  border: 1px solid rgba(79, 70, 229, 0.12);
  flex-shrink: 0;
}

.title-text h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 650;
  color: var(--text-1);
  letter-spacing: -0.2px;
  line-height: 1.3;
}

.title-text p {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--text-3);
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
