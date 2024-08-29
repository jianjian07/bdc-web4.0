<template>
    <div class="cc-container">
        <div style="width: 280px;padding: 10px 8px;">
            <a-directory-tree multiple :tree-data="treeData" @select="onSelect" v-model:expandedKeys="expandedKeys"
                v-model:selectedKeys="selectedKeys">
                <template #icon="">
                </template>
            </a-directory-tree>
        </div>
        <div class="line"></div>
        <div style="min-width: 700px;max-width:calc(100% - 300px);border:0px solid yellowgreen;padding-left: 20px;">
            <div style="float: right;padding: 10px;">
                <a-button size="small" type="primary" :icon="h(CopyrightCircleOutlined)">
                    根据已配置权利类型统赋
                </a-button>
            </div>
            <div style="padding-top:45px;">
                <a-list item-layout="horizontal" :data-source="nodeList">
                    <template #renderItem="{ item, index }">
                        <a-list-item :class="selectIndex === index ? 'active' : ''">
                            <template #actions>
                                <a-tag color="blue" @click="onConfig(item, index)" style="cursor:pointer;">
                                    配置
                                </a-tag>
                            </template>
                            <a-list-item-meta :description="item.id">
                                <template #title>
                                    <a>{{ item.processNodeName }}</a>
                                </template>
                                <template #avatar>
                                    <a-avatar :src="item.id">{{ index + 1 }}</a-avatar>
                                </template>
                            </a-list-item-meta>
                        </a-list-item>
                    </template>
                </a-list>
            </div>
        </div>
    </div>
    <BdpzDrawer v-if="open" :open="open" :title="title" :nodeData="nodeInfo" @ok="handOk" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BdpzDrawer from '/@/views/system/case/components/BdpzDrawer.vue';
import { h } from 'vue';
import { CopyrightCircleOutlined } from '@ant-design/icons-vue';
import { defHttp } from '/@/utils/http/axios';
enum api {
    processlist = '/api/zrzy-bdc/act/process/extActProcess/list',
    nodelist = '/api/zrzy-bdc/act/process/extActProcessNode/list'
}
const expandedKeys = ref<string[]>(['100']);
const selectedKeys = ref<string[]>([]);
let open = ref(false)
let selectIndex = ref(0)
let treeData = ref([])
let nodeList = ref([])
let title = ref("");
let flowName = ref('')
let nodeInfo: any = ref({})
onMounted(() => {
    loadTreeData()
})
function loadTreeData() {
    defHttp.get({ url: api.processlist }, { withToken: true }).then((res) => {
        treeData.value = res.result
        debugger
        if (res.result.length > 0) {
            const firstProcess = res.result[0].children[0]
            selectedKeys.value.push(firstProcess.key)
            loadNode(firstProcess)
        }
    })
}
/**
 * 选中工作流
 * @param _selectedKeys 
 * @param e 
 */
function onSelect(_selectedKeys: any, e: any) {
    const selectProcess = e.node
    loadNode(selectProcess);
}
/**
 * 加载节点
 * @param process 选中的流程
 */
function loadNode(process: any) {
    flowName.value = '';
    if (process.type == '1') {
        defHttp.get({ url: api.nodelist, params: { processId: process.key } }, { withToken: true }).then((res) => {
            nodeList.value = res.result;
        });
        flowName.value = '流程[' + process.title + ']';
        nodeInfo.value.tiguid = process.key;
    } else {
        nodeList.value = [];
    }
}

function onConfig(item: any, index: number) {
    const name = '-节点[' + item.processNodeName + "]表单配置";
    title.value = flowName.value + name;
    nodeInfo.value.aid = item.id;
    nodeInfo.value.atext = item.processNodeName;
    open.value = true
    selectIndex.value = index
}
function handOk() {
    open.value = false
}
</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.ant-list-item:hover,
.active {
    background-color: #e6f4ff;
}

.line {
    width: 1px;
    height: 650px;
    background: linear-gradient(244deg, rgba(255, 255, 255, 0) 0%, rgba(24, 144, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
}
</style>