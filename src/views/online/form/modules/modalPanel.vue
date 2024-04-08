<template>
    <a-modal v-model:open="visible" :title="title">
        <slot name="content"></slot>
        <template #footer>
            <slot name="footer">
                <a-button key="back" @click="visible = false">{{ closeText }}</a-button>
                <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleModalOk">{{ okText }}
                </a-button>
            </slot>
        </template>
    </a-modal>
</template>
  
<script lang="ts" setup>
import { ref } from "vue"
const props = defineProps({
    closeText: {
        type: String,
        default: '关闭'
    },
    okText: {
        type: String,
        default: '确定'
    },
    title: {
        type: String,
        default: '标题'
    },
    visible: {
        type: Boolean,
        default: false
    }
})

// 弹窗是否显示
let visible = ref<boolean>(props.visible)
// 弹窗loading
let confirmLoading = ref<boolean>(false)

const emit = defineEmits(['handleModalOk'])
/**
 * 打开弹窗
*/
const openModal = () => {
    visible.value = true
}
/**
 * 弹窗确认
 */
function handleModalOk() {
    confirmLoading.value = true
    emit('handleModalOk', (res) => {
        if (res) {
            visible.value = false
        }
        confirmLoading.value = false
    })
}

defineExpose({
    openModal
})
</script>
  
<style lang="less" scoped></style>
  