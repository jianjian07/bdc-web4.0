<template>
    <div style="width: 280px;padding: 10px 8px;">
        <a-directory-tree multiple :tree-data="treeData"
            :fieldNames="props.isRoleProcess ? { children: 'children', title: 'lcmc', key: 'lcid' } : null"
            @select="onSelect" v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys">
            <template #icon="">
            </template>
        </a-directory-tree>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
const props = defineProps({
    isRoleProcess: {
        type: Boolean,
        default: false
    }
})
enum api {
    processlist = '/api/zrzy-bdc/act/process/extActProcess/list',
    roleProcesslist = '/api/zrzy-bdc/flow/public/getRoleProcessList',
}
const expandedKeys = ref<string[]>(['100']);
const selectedKeys = ref<string[]>([]);
let treeData = ref([])
onMounted(() => {
    loadTreeData()
})
function loadTreeData() {
    let url = props.isRoleProcess ? api.roleProcesslist : api.processlist
    defHttp.get({ url: url, params: { ajlx: '1' } }, { withToken: true }).then((res) => {
        treeData.value = res.result
        emit('setTreeData', treeData.value)
        if (res.result.length > 0) {
            const firstProcess = res.result[0].children[0]
            selectedKeys.value.push(props.isRoleProcess ? firstProcess.lcid : firstProcess.key)
            emit('select', firstProcess)
        }
    })
}
const emit = defineEmits(['select', 'setTreeData'])
/**
 * 选中工作流
 * @param _selectedKeys 
 * @param e 
 */
function onSelect(_selectedKeys: any, e: any) {
    const process = e.node
    if (!process.children) {
        emit('select', process)
    }
}
/**
 * 加载节点
 * @param process 选中的流程
 */
// function loadNode(process: any) {
//     flowName.value = '';
//     if (process.type == '1') {
//         defHttp.get({ url: api.nodelist, params: { processId: process.key } }, { withToken: true }).then((res) => {
//             nodeList.value = res.result;
//         });
//         flowName.value = '流程[' + process.title + ']';
//         nodeInfo.value.tiguid = process.key;
//     } else {
//         nodeList.value = [];
//     }
// }
</script>

<style scoped lang="less"></style>