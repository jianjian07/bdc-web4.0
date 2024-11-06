<template>
    <a-drawer :title="title" :width="720" :open="open" :body-style="{ paddingBottom: '80px' }" @close="onClose"
        :footer-style="{ textAlign: 'right' }">
        <a-form :model="reportData" :label-col="{ style: { width: '150px' } }" layout="vertical" autocomplete="off">
            <a-form-item label="报表编号" name="code" :rules="[{ required: true, message: '报表编号' }]">
                <a-input v-model:value="reportData.code" prefix="" suffix="" />
            </a-form-item>
            <a-form-item label="报表名称" name="title" :rules="[{ required: true, message: '报表名称' }]">
                <a-input v-model:value="reportData.title" prefix="" suffix="" />
            </a-form-item>
            <a-form-item label="数据源类型" name="cType" :rules="[{ required: true, message: '数据源类型' }]">
                <a-select v-model:value="reportData.cType">
                    <a-select-option value="sql">SQL</a-select-option>
                    <a-select-option value="javascript">API</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="动态数据源" name="cType">
                <a-select v-model:value="reportData.dbKey" :options="dataSources" />
            </a-form-item>
            <a-form-item label="修改/删除表" name="tableName" :rules="[{ required: true, message: '数据表名称' }]">
                <a-input v-model:value="reportData.tableName" prefix="" suffix="" />
            </a-form-item>
            <!-- <a-form-item label="数据源" name="dbType" :rules="[{ required: true }]">
                <a-select v-model:value="reportData.dbType" mode="tags" placeholder="请选择" style='width:100%' />
            </a-form-item> -->
            <a-form-item label="是否初屏加载" name="isLoad">
                <a-switch v-model:checked="reportData.isLoad" checked-children="是" un-checked-children="否" />
            </a-form-item>
            <a-form-item label="MyBatis语法" name="isMybatis">
                <a-switch v-model:checked="reportData.isMybatis" checked-children="是" un-checked-children="否" />
            </a-form-item>
            <a-form-item label="SQL/API" id="content" :rules="[{ required: true }]">
                <monaco-editor v-model="reportData.dataSource" :language="reportData.cType"
                    style="width: 100%;border: 1px solid #e5e7eb;" height="250px"
                    update:modelValue="reportData.dataSource">
                </monaco-editor>
            </a-form-item>
            <a-form-item style="float: right;">
                <a-button type="dashed" danger>在线解析</a-button>
            </a-form-item>
        </a-form>
        <template #extra>
            <a-space>
                <a-button @click="onClose">取消</a-button>
                <a-button type="primary" @click="onOk">保存</a-button>
            </a-space>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import monacoEditor from '/@/components/monaco/monacoEditor.vue'
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "报表属性"
    },
    data: {
        type: Object,
        default: () => {
            return {
                isLoad: false,
                isMybatis: false
            }
        }
    }
})
let reportData = ref<any>(JSON.parse(JSON.stringify(props.data)))
reportData.value.isLoad = reportData.value.isLoad == 1 ? true : false
reportData.value.isMybatis = reportData.value.isMybatis == 1 ? true : false
let dataSources = ref([])
getDataSources()
async function getDataSources() {
    const res = await defHttp.get({ url: '/api/zrzy-system/sys/datasource/options' }, { withToken: true })
    dataSources.value = res.result
}
function onClose() {
    emit('ok', { refresh: false })
}
const emit = defineEmits(['ok'])
function onOk() {
    let url = ''
    if (reportData.value.id) {
        url = '/api/zrzy-form/form/report/edit' // 编辑
    } else {
        const _value =
        {
            "list": [],
            "config": {
                "layout": "horizontal",
                "baseScript": "",
                "dataSource": [],
                "eventScript": [
                    {
                        "key": "base",
                        "name": "全局变量定义",
                        "func": "// const a=1",
                        "param": ""
                    },
                    {
                        "key": "mounted002",
                        "name": "mounted",
                        "func": "console.info('new fun')",
                        "param": ""
                    }
                ]
            }
        }
        reportData.value.content = JSON.stringify(_value)
        url = '/api/zrzy-form/form/report/add' // 新增
    }
    reportData.value.isLoad = reportData.value.isLoad ? 1 : 0
    reportData.value.isMybatis = reportData.value.isMybatis ? 1 : 0
    //reportData.value.isLoad = isLoad.value
    defHttp.post({ url: url, data: reportData.value }, { withToken: true }).then((res) => {
        if (res.success) {
            message.success('保存成功')
        } else {
            message.error(res.message)
        }
    }).catch(err => {
        message.error(err.message)
    }).finally(() => {
        emit('ok', { refresh: true })
    })
}
</script>
