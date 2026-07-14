<template>
    <a-form ref="formRef" :model="processModel" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }"
        autocomplete="off" style="margin-top: 20px;">
        <a-form-item label="流程" name="lcid" :rules="[{ required: true, message: '请选择需要导出的流程' }]">
            <a-tree-select v-model:value="processModel.lcid" show-search style="width:500px"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请输入流程名称" allow-clear
                :tree-data="treeData" :field-names="{
        children: 'children',
        label: 'title',
        value: 'key',
    }" tree-node-filter-prop="title" @select="selectProcess"></a-tree-select>
        </a-form-item>
        <!-- <a-form-item label="权利类型">
            <a-select v-model:value="processModel.qllx" mode="multiple" :options="getDictItemsByCode('qllx')" allowClear
                style="width:500px;" show-search optionFilterProp="label">
            </a-select>
        </a-form-item> -->
        <a-form-item label="矿业权类型">

            <a-select v-model:value="processModel.qllx" mode="multiple" :options="getDictItemsByCode('qllx')" allowClear
                style="width:500px;" show-search optionFilterProp="label">
            </a-select>
        </a-form-item>
        <a-form-item label="导出项">
            <a-checkbox-group v-model:value="processModel.pzx" style="width: 100%;display: grid;">
                <div v-for="(item, index) in pzxList" :key="index" style="padding: 5px;">
                    <a-checkbox :value="item.key">{{ item.title }}</a-checkbox>
                </div>
            </a-checkbox-group>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
            <a-space>
                <a-button type="primary" @click="exportProcess">
                    <ExportOutlined />导出流程信息
                </a-button>


            </a-space>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { ExportOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { exprotJson_post } from "/@/views/online/utils/file"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
enum api {
    processlist = '/api/zrzy-bdc/flow/sxml/treeList',
    roleProcesslist = '/api/zrzy-system/role/getRoleProcessList',
    exportUrl = '/api/zrzy-bdc/flow/public/exportProcessAll',
    importUrl = '/api/zrzy-bdc/process/config/importProcessAll'
}
const formRef = ref();
let processModel: any = ref({})
let treeData = ref([])
const pzxList = [
    // { title: '流程设计信息', key: 'process' },
    // { title: '流程基础配置', key: 'flow' },
    { title: '节点表单和按钮配置', key: 'form' },
    { title: '权利其它配置', key: 'qlqt' },
    { title: '权利人配置', key: 'qlr' },
    { title: '附件材料配置', key: 'fjcl' },
    // { title: '审查要点配置', key: 'scyd' },
]

onMounted(() => {
    loadTreeData()
})
function loadTreeData() {
    let url = api.processlist
    defHttp.get({ url: url, params: {} }, { withToken: true }).then((res) => {
        treeData.value = res.result
    })
}
let name = ref('流程信息')
function selectProcess(value, node, extra) {
    name.value = node.title
}
/**
 * 导出接口
 * @param item
 */
function exportProcess() {
    formRef.value
        .validate()
        .then(() => {
            if (processModel.value.pzx == undefined || processModel.value.pzx == '') {
                message.error('请先选择需要导出的配置项')
            } else {
                const params = processModel.value
                exprotJson_post(params, name.value, api.exportUrl)
            }
        })
        .catch(error => {

        });

}

</script>

<style scoped lang="less"></style>