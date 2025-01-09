<template>
    <span contenteditable="true" @focusout="handleFocusout">{{ localValue }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})
const emit = defineEmits(['update:modelValue'])
// let div = null
let localValue = ref(props.modelValue)   // 直接使用 props.modelValue
function handleFocusout(e) {
    // 输出span的内容
    localValue.value = e.target.innerText
}
watch(localValue, (newValue) => {
    emit('update:modelValue', newValue)  // 向父组件发出更新
})
</script>

<style scoped lang="less"></style>