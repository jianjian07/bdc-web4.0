<template>
    <img v-if="imageUrl" :src="imageUrl" alt="流程图" class="diagram-img" />
    <div v-else>加载流程图中...</div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { defHttp } from '/@/utils/http/axios';
const props = defineProps({
    formData: {
        type: Object,
        default: {
        }
    }
})
debugger
let imageData = ref('')
const imageUrl = ref<string>('');
let objectUrl: string | null = null; // 用于保存生成的临时 URL，方便后续销毁
onMounted(() => {
    getImage()
})
async function getImage() {
    const res = await defHttp.get({
        url: '/api/zrzy-bdc/bpm/design/resource',
        params: {
            deploymentId: props.formData.deploymentid,
            resourceName: props.formData.resourcename
        },
        responseType: 'blob',
    }, { withToken: true, isTransformResponse: false });
    // isTransformResponse: false 跳过响应转换，res 是原始 AxiosResponse，res.data 才是 Blob
    const blob = res?.data
    if (blob && blob instanceof Blob) {
        // 如果之前有生成过 URL，先释放掉
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
        // 将 Blob 转换为本地可访问的 URL
        objectUrl = URL.createObjectURL(blob);
        imageUrl.value = objectUrl;
    }
}


</script>

<style scoped lang="less"></style>