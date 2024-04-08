<template>
  <svg :class="svgClass" v-bind="$attrs" :style="{ color: color,width:width,height:height }">
    <title>{{ title }}</title>
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "16px",
  },
  height: {
    type: String,
    default: "16px",
  },
});
const iconName = computed(() => `#icon-${props.name}`);
const svgClass = computed(() => {
  if (props.name) return `svg-icon icon-${props.name}`;
  return "svg-icon";
});
</script>

<style scoped>
.svg-icon {
  /* width: 1em;
  height: 1em; */
  /* font-size: 26px; */
  fill: currentColor;
  vertical-align: middle;
  cursor: pointer;
}
</style>
