<!-- 报表类在线预览，原则上该文件不允许修改 -->
<template>
    <generate-vue3></generate-vue3>
</template>

<script lang="ts" setup>

import { defineComponent, reactive, ref } from 'vue'
import { generateReportHtml } from 'form-imagining'
import { defHttp } from "/@/utils/http/axios";
import { getDictItemsByCode, getTreeDictItemsByCode } from '/@/utils/form/commonUtils';
import { initTable, edit, save, cancel } from "/@/utils/form/wonder-report";
import { getReport } from '.';
import { useRoute } from 'vue-router';
const route = useRoute();
const code = ref(route.params?.code.toString());
let dataSource = ref()
let paginations = ref()
let columns = ref<any>([])
let viewData = ref<any>({})
let reportInfo = reactive<any>({
    formId: '',
    tableName: '',
    title: "文件",
    keyCol: '',
    searchInfo: [],
})
let editableData: any = reactive({});
reportInfo.formId = Number.parseInt(code.value)

const info = await getReport({ id: reportInfo.formId })
const data = JSON.parse(info.content)
const config = data.config
reportInfo.tableName = info.table_name
const { eventScript, baseScript, ...restConfig } = config
let vue3Script = ref({
    importScript: '',//import导入
    variableScript: '',//变量
    contentScript: ''//ts内容
})
const generateData = generateReportHtml(data.list, restConfig, vue3Script, info)
columns.value = []
if (generateData.columns != '') {
    columns.value = JSON.parse(generateData.columns)//拷贝
}
reportInfo.searchInfo = generateData.searchData
paginations.value = generateData.paginations;
viewData.value = {}
const generateVue3 = defineComponent({
    template: generateData.html,
    props: {
        message: String,
    },
    setup() {
        // 脚本
        const events = <any>{}
        generateTs();
        if (paginations.value) {
            paginations.value.onChange = onChange
        }
        return {
            viewData,
            reportInfo,
            paginations,
            dataSource,
            columns,
            ...events,
            defHttp,
            editableData,
            search,
            onChange,
            initTable,
            edit,
            save,
            cancel,
            getDictItemsByCode,
            getTreeDictItemsByCode
        }
        function search() {
            paginations.value.current = 1
            initTable(viewData, dataSource, reportInfo, paginations);
        }
        /**
         * 分页
         * @param pag
         * @param paginationName 分页对象
        */
        function onChange(pag: any) {
            paginations.value.current = pag
            initTable(viewData, dataSource, reportInfo, paginations);
        }

        /**
         * 自动生成脚本
         */
        function generateTs() {
            for (let i = 0; i < eventScript.length; i++) {
                const _data = eventScript[i];
                events[_data.name] = newFunction(_data)
            }
        }
        /**
         * 返回函数 带参数 | 不带参数
         * @param _data
         */
        function newFunction(_data: any) {
            if (_data.param != "") {
                return (_params: any) => {
                    eval(`(${_data.param})=> { ${_data.func}}`)(_params)
                };
            } else {
                return () => {
                    eval(_data.func);
                };
            }
        }
    },
    mounted() {
        if (info.is_load == 1) {
            initTable(viewData, dataSource, reportInfo, paginations);
        }
    }
})
</script>
<style lang="less">
@import url('/@/assets/less/form.less');
</style>
