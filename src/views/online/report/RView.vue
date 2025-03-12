<!-- 报表类在线预览，原则上该文件不允许修改 -->
<template>
    <generate-vue3></generate-vue3>
</template>

<script lang="ts" setup>

import { defineComponent, reactive, ref } from 'vue'
import { generateReportHtml } from 'form-imagining'
import { defHttp } from "/@/utils/http/axios";
import { getDictItemsByCode, getTreeDictItemsByCode, formatMultipleSelectValue, useVNodes, getLabelByDictCode, getLabelByTreeDictCode } from '/@/views/online/utils/commonUtils';
import {
    initTableV2, onExportExcel, initApiTable, onExportExcelApi, edit, save, cancel
} from "/@/views/online/utils/wonder-report"
import { getSelectAllCheck, setSelectAllCheck, syncChange } from "/@/views/online/utils/wonder1.0.1"
import { getReport } from '.';
import { useRoute } from 'vue-router';
import { cModal } from "/@/components/cModal/index"
import { message, Modal } from 'ant-design-vue';
import { router } from "/@/router";
import * as bdc from '/@/views/bdc/public/bdc'
const VNodes = useVNodes();
const props = defineProps({
    id: {
        type: String,
        default: "-1"
    }
})
const route = useRoute();
let code: string = props.id;
if (code == "-1") {
    if (route.params.code == undefined) {
        code = route.fullPath.split('/').pop() || '-1'
    } else {
        code = route?.params?.code.toString()
    }
}
let dataSource = ref()
let paginations = ref()
let columns = ref<any>([])
let viewData = ref<any>({})
let loading = ref<boolean>(false)
let reportInfo = reactive<any>({
    formId: '',
    tableName: '',
    title: "文件",
    keyCol: '',
    searchInfo: [],
})
let options = {
    viewData: viewData,
    dataSource: dataSource,
    reportInfo: reportInfo,
    paginations: paginations,
    loading: loading,
    sortField: "",
    sortOrder: ""
}
let eLoading = ref<boolean>(false)
let editableData: any = reactive({});
reportInfo.formId = Number.parseInt(code)
const info = await getReport({ id: reportInfo.formId })
const data = JSON.parse(info.content)
const config = data.config
reportInfo.tableName = info.tableName
reportInfo.title = info.title
const { eventScript, baseScript, cBasicInfo, ...restConfig } = config
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
let reportApiSource = info.dataSource
reportInfo.searchInfo = generateData.searchData
paginations.value = generateData.paginations;
viewData.value = {}
// 用于报表选择
let selectedValue = ref<any>([])
let events: any = {}
let event1: any = ref({})
const computedEvents = <any>{}
// 20240130验证：变量定义 名称固定formProps
let basicInfo = ref<any>({})
if (cBasicInfo) {
    for (let index = 0; index < cBasicInfo.length; index++) {
        const name = cBasicInfo[index].name
        const type = cBasicInfo[index].type
        const value = cBasicInfo[index].default
        basicInfo.value[name] = transformValueByType(value, type)
    }
}

function transformValueByType(value: any, type: string): any {
    switch (type) {
        case 'string':
            return value;
        case 'number':
            return Number(value);
        case 'boolean':
            return Boolean(value);
        case 'object':
        case 'array':
            try {
                return JSON.parse(value);
            } catch (error) {
                console.error(`转换失败: ${value}`, error);
                return null; // 或者返回一个默认的对象 {}
            }
        default:
            return value;
    }
}
const exposeds = eventScript.filter(t => t.type == "Exposed")
let arrExposed = [];
if (exposeds.length > 0) {
    arrExposed = exposeds[0].name.split(',')
}
const emit = defineEmits(['ok', 'rowChange'])
const generateVue3 = defineComponent({
    template: generateData.html,
    components: {
        VNodes
    },
    props: {
        message: String,
    },
    computed: {
        ...computedEvents,
    },
    setup() {
        // 脚本
        // const events = <any>{}
        generateTs();
        if (paginations.value) {
            // paginations.value.onChange = handleTableChange
        }
        return {
            emit,
            viewData,
            basicInfo,
            reportInfo,
            paginations,
            dataSource,
            columns,
            loading,
            ...events,
            ...bdc,
            defHttp,
            router,
            editableData,
            selectedValue,
            search,
            reset,
            handleTableChange,
            syncChange,
            getSelectAllCheck,
            setSelectAllCheck,
            initTableV2,
            execInitFun,
            edit,
            save,
            cancel,
            getDictItemsByCode,
            getTreeDictItemsByCode,
            getLabelByDictCode,
            getLabelByTreeDictCode,
            getSelectAllCheck,
            setSelectAllCheck,
            onExportExcel,
            onExportExcelApi,
            onCExport,
            formatMultipleSelectValue,
            onSelectChange,
            cModal,
            reloadTable,
            Modal
        }
        function search() {
            paginations.value.current = 1
            execInitFun()
        }
        
        function reset() {
            viewData.value = {}
            paginations.value.current = 1
            execInitFun()
        }
        
        function onCExport(_data: any) {
            let exportColumns = ref(_data)
            if (exportColumns.value.length == 0) {
                message.warning('请选择要导出的列')
                return
            } else {
                if (info.cType == 'sql') {
                    onExportExcel(exportColumns, viewData, reportInfo, eLoading);
                } else {
                    onExportExcelApi({ reportInfo: reportInfo, viewData: viewData, paginations: paginations, reportApiSource: reportApiSource, bLoading: eLoading, exportColumns: exportColumns });
                }
            }
        }
        /**
         * 分页
         * @param pag
         * @param paginationName 分页对象
        */
        function onChange(pag: any) {
            paginations.value.current = pag
            execInitFun()
        }
        /**
         * table的change事件
         * @param data 
         */
        function handleTableChange(data: any) {
            const { sorter, pagination } = data
            const { field, order } = sorter
            options.sortField = field;
            options.sortOrder = order
            paginations.value.current = pagination.current
            initTableV2(options);
        }
        function onSelectChange(selectedRowKeys, selectedRows) {
            basicInfo.value.state.selectedRowKeys = selectedRowKeys;
          
        }
        /**
         * 自动生成脚本
         */
        function generateTs() {
             const _eventScript = eventScript.filter(t => (t.type == "Function" || t.type == "Mounted" || t.type == "Watch" || t.type == "Computed" || t.type == "BeforeValidate"));
            for (let i = 0; i < _eventScript.length; i++) {
                const _data = _eventScript[i];
                if (_data.type == "Computed") {
                    // 需要与方法分开
                    computedEvents[_data.name] = eval(`() => { ${_data.func} }`)
                } else {
                    if (_data.param != "") {
                        if (_data.isasync) {
                            events[_data.name] = eval(`async (${_data.param})=> { ${_data.func}}`)
                            if (arrExposed.includes(_data.name)) {
                              event1.value[_data.name] = eval(`async (${_data.param})=> { ${_data.func}}`)
                            }
                        } else {
                            try {
                                eval(`(${_data.param})=> { ${_data.func}}`)
                                events[_data.name] = eval(`(${_data.param})=> { ${_data.func}}`)
                                if (arrExposed.includes(_data.name)) {
                                   event1.value[_data.name] = eval(`(${_data.param})=> { ${_data.func}}`)
                                }
                            } catch (error) {
        
                            }
                        }
                    } else {
                        if (_data.isasync) {
                            events[_data.name] = eval(`async ()=> { ${_data.func}}`)
                            if (arrExposed.includes(_data.name)) {
                               event1.value[_data.name] = eval(`async ()=> { ${_data.func}}`)
                            }
                        } else {
                            events[_data.name] = eval(`()=> { ${_data.func}}`)
                            if (arrExposed.includes(_data.name)) {
                              event1.value[_data.name] = eval(`()=> { ${_data.func}}`)
                            }
                        }
                    }
                }
            }
          
          
            // for (let i = 0; i < eventScript.length; i++) {
            //     const _data = eventScript[i];
            //     events[_data.name] = newFunction(_data)
            //     if (arrExposed.includes(_data.name)) {
            //         event1.value[_data.name] = newFunction(_data)
            //     }
            // }
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
         // 固定了mounted的事件名
        const monunted = eventScript.filter(t => t.type == "Mounted")
        // console.log('monunted',monunted)
        if (monunted.length > 0) {
            events["initMount"]()
        }
        if (info.isLoad == 1) {
            execInitFun()
        }
    }
})

function execInitFun() {
    if (info.cType == 'sql') {
        initTableV2(options)
    } else {
        initApiTable(viewData, dataSource, reportApiSource, paginations, loading)
    }
}
function createCase() {
    if (basicInfo.value.state.selectedRowKeys.length == 0) {
        message.warning('请选择要提取的数据')
    } else {
        emit('ok', { reload: true, data: basicInfo.value.state.selectedRowKeys })
    }
}


/**
 * 刷新表格
 */
function reloadTable() {
  execInitFun()
}
defineExpose({
    createCase,
    event1
})
</script>
<style lang="less">
@import url('/@/assets/less/form.less');
</style>
