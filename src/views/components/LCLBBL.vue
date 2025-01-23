<template>
    <div style="width: 280px;padding: 10px 8px;">
        <a-directory-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys"
            :fieldNames="{ children: 'children', title: 'label', key: 'value' }" :tree-data="treeData" multiple
            @select="onSelect">
            <template #icon="">
            </template>
        </a-directory-tree>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getDictItemsByCode } from "/@/utils/form/commonUtils"
enum api {
    processlist = '/api/zrzy-bdc/act/process/extActProcess/list'
}
const expandedKeys = ref<string[]>(['100']);
const selectedKeys = ref<string[]>([]);
let treeData = ref([])
onMounted(() => {
    loadTreeData()
})
function loadTreeData() {
    let arr = getDictItemsByCode('bllc')
    treeData.value = arr
    if (arr.length) {
        // selectedKeys.value.push(arr[0].value)
        if (arr.length > 0) {
            const firstProcess = arr[0]
            selectedKeys.value.push(firstProcess.key)
            emit('select', firstProcess)
        }
    }
}
const emit = defineEmits(['select', 'setTreeData'])
/**
 * 选中工作流
 * @param _selectedKeys 
 * @param e 
 */
function onSelect(_selectedKeys: any, e: any) {
    debugger
    const process = e.node
    emit('select', process)
}
</script>

<style scoped lang="less"></style>