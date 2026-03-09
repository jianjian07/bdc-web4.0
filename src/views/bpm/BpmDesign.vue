<template>
    <CBpmDesign v-if="show" :id="id" @updateProcess="updateProcess"></CBpmDesign>

</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { currentRoute, router } from "/@/router"
import { useTabsStore } from "/@/store/modules/tabs"

const route = currentRoute;
const code = ref(route.params?.code.toString());
let id = code.value.toString()
let show = ref(false)
const tabStore = useTabsStore()
onMounted(() => {
    // 参数初始化完成后再加载设计器 解决切换报错问题
    show.value = true
})
function updateProcess(data) {
    if (data.id != id) {
        const newPath = `/bpm/design/${data.id}`
        // 更新当前标签页的fullPath
        const currentTab = tabStore.getCurrentTab
        if (currentTab) {
            currentTab.fullPath = newPath
            tabStore.setTabActiveKey(newPath)
            // 确保标签页状态更新后再执行路由替换
            nextTick(() => {
                router.replace(newPath);
            })
        } else {
            router.replace(newPath);
        }
    }
}
</script>

<style scoped lang="less"></style>
