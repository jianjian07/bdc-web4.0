<!-- 报表类在线预览，原则上该文件不允许修改 -->

<template>
    <generate-vue3 ref="generateRef"></generate-vue3>
</template>

<script lang="ts" setup>

import { computed, defineComponent, onBeforeUpdate, reactive, ref, useAttrs, watch } from 'vue'
import { generateFormHtml } from 'form-imagining'
import { defHttp } from "/@/utils/http/axios";
import { formatMultipleSelectValue, formatMultipleTreeSelectValue, getCasDictItemsByCode, getDictItemsByCode, getTreeDictItemsByCode, useVNodes } from '/@/utils/form/commonUtils'
import { initTable, edit, save, cancel } from "/@/utils/form/wonder-report";
import { getForm } from '.';
import { useRoute } from 'vue-router';
import { cModal } from "/@/components/cModal/index"
import { Modal, message } from 'ant-design-vue';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import {
    getData,
    getDataByApi,
    // getInheritData,
    onSubmitForm,
    validateInfos,
    validateFun,
    getAccount,
    syncChange,
    onTableSelectClear,
    onTableSelectRowChange,
    getSelectAllCheck,
    setSelectAllCheck,
    hideField
} from "/@/utils/form/wonder1.0.1"
// import tableSelectProps from "/@/components/form-widget/widget/tableSelectOptions"
const props = defineProps({
    id: {
        type: String,
        default: '1'
    },
    reload: {
        type: String,
        default: ""
    }
})
watch(() => props.reload, async (newVal) => {
    if (newVal != "") {
        debugger
        await getData(viewData, formId)
    }
})
const { isSaved, caseCode, disabled } = useAttrs()
const VNodes = useVNodes();
const route = useRoute();
const code = ref(props.id)
// const code = ref(route.params?.code.toString());
let dataSource = ref()
let paginations = ref()
let columns = ref<any>([])
// let viewData = ref<any>([])
let formInfo = reactive<any>({
    formId: '',
    tableName: '',
    title: "文件",
    keyCol: '',
    searchInfo: [],
})
let editableData: any = reactive({});
formInfo.formId = Number.parseInt(code.value)
let formId = Number.parseInt(code.value)
let formDisabled = ref(false)
// 如果有传值优先读取父组件传值
if (disabled != undefined && typeof disabled == 'Boolean') {
    formDisabled.value = disabled
}
let generateRef = ref()
const info1 = await getForm({ id: formInfo.formId })
const info = info1[0]
const data = JSON.parse(info.content)
const config = data.config
formInfo.tableName = info.table_name
const { eventScript, baseScript, cBasicInfo, ...restConfig } = config
const { formSetting } = restConfig
let vue3Script = ref({
    importScript: '',//import导入
    variableScript: '',//变量
    contentScript: ''//ts内容
})
const generateData = generateFormHtml(info, vue3Script)
// columns.value = []
let selectJsonSetting = ref<any>(generateData.selectJsonSetting)
// getSelectJsonSetting(selectJsonSetting)
columns.value = generateData.columns
// if (generateData.columns != '') {
//     columns.value = JSON.parse(generateData.columns)//拷贝
// }
formInfo.searchInfo = generateData.searchData
paginations.value = generateData.paginations;
let viewData = ref<any>({})
const _sourcedata: any = await loadSourceData(formId)
viewData.value = getViewDataByFormId(info.id)
// api接口数据
const apiArr = _sourcedata.filter((item: { cType: string; }) => item.cType == 'javascript')
let apiDataSource = apiArr
await getDataByApi(viewData, apiDataSource)

await getData(viewData, formId)

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
// 20240130验证：props表单上面定义
let _props: any = {};
const props1 = eventScript.filter(t => t.type == "Props")
if (props1.length == 1) {
    // _props = eval("(" + props1[0].func + ")")
}
//20240130验证：emit
const emit = defineEmits(['aa', 'rowChange'])
// 审批子页面地址
let spFilePath = ref('')
// 子页面dom
let childRef = ref()
let demoRefs: any = []
// 脚本
const events = <any>{}
const computedEvents = <any>{}
// let exposed = <any>[]
await generateTs();

const generateVue3 = defineComponent({
    template: generateData.html,
    props: [],
    components: {
        VNodes,
        InfoCircleOutlined
    },
    computed: {
        // ...events,
        ...computedEvents,
    },
    expose: ['multipleRef', 'onSubmit', 'formId'],
    methods: {
        hideFields(index: number) {
            return hideField(formSetting, viewData, index)
        }
    },
    setup() {
        let formRef = ref()
        if (paginations.value) {
            paginations.value.onChange = onChange
        }

        onBeforeUpdate(() => {
            // dom变化时清空 会重新设置
            demoRefs = []
        })

        return {
            formRef,
            basicInfo,
            spFilePath,
            childRef,
            viewData,
            formInfo,
            isSaved,
            caseCode,
            paginations,
            dataSource,
            columns,
            selectJsonSetting,
            ...events,
            computed,
            defHttp,
            editableData,
            search,
            onChange,
            initTable,
            edit,
            save,
            cancel,
            handleChangeTab,
            getDictItemsByCode,
            getTreeDictItemsByCode,
            getCasDictItemsByCode,
            formatMultipleSelectValue,
            formatMultipleTreeSelectValue,
            syncChange,
            onTableSelectClear,
            onTableSelectRowChange,
            getSelectAllCheck,
            setSelectAllCheck,
            validateFun,
            validateInfos,
            cModal,
            Modal,
            message,
            dayjs,
            watch,
            onSubmit,
            multipleRef,
            getAccount
        }

        function search() {
            paginations.value.current = 1
            initTable(viewData, dataSource, formInfo, paginations);
        }

        /**
         * 分页
         * @param pag
         * @param paginationName 分页对象
         */
        function onChange(pag: any) {
            paginations.value.current = pag
            initTable(viewData, dataSource, formInfo, paginations);
        }


        /**
         * 保存
         */
        function onSubmit() {
            return onSubmitForm(formRef.value, onBeforeValidate)
        }

        function onBeforeValidate() {
            if (events['onBeforeValidate']) {
                events['onBeforeValidate']()
            }
        }

        /**
         * 用于多表单
         * @returns {*[]|null}
         */
        function multipleRef() {
            let arr = []
            for (let i = 0; i < demoRefs.length; i++) {
                if (demoRefs[i].child) {
                    arr.push(demoRefs[i].child)
                }
            }
            return arr.length ? arr : null
        }

    },
    mounted() {
        // 固定了mounted的事件名
        const monunted = eventScript.filter(t => t.type == "Mounted")
        // console.log('monunted',monunted)
        if (monunted.length > 0) {
            events["initMount"]()
        }
    }
})
/**
        * 自动生成脚本
        */
function generateTs() {
    const _eventScript = eventScript.filter(t => (t.type == "Function" || t.type == "Mounted" || t.type == "Watch" || t.type == "Computed"));
    for (let i = 0; i < _eventScript.length; i++) {
        const _data = _eventScript[i];
        if (_data.type == "Computed") {
            // 需要与方法分开
            computedEvents[_data.name] = eval(`() => { ${_data.func} }`)
        } else {
            if (_data.param != "") {
                events[_data.name] = eval(`(${_data.param})=> { ${_data.func}}`)
            } else {
                events[_data.name] = eval(`()=> { ${_data.func}}`)
            }
            // events[_data.name] = newFunction(_data)
        }
    }
}
/**
 * 返回函数 带参数 | 不带参数
 * @param _data
 */
function newFunctionOld(_data: any) {
    // 这种return的方式多形参不好处理
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
function a() {
    alert(1)
}
// viewData获取对象
function getViewDataByFormId(formId: String) {
    let _viewData = {}
    for (let index = 0; index < _sourcedata.length; index++) {
        Reflect.set(_viewData, _sourcedata[index].name, {})
    }
    return _viewData;
}
/**
 * 根据加载数据源筛选接口查询
 * @param formId
 */
function loadSourceData(formId: any) {
    return new Promise((resolve, reject) => {
        const _url = "/magicapi/zrzy-form/magic/form/source/list"
        defHttp.post({ url: _url, params: { formId: formId, dType: 'select' } }, { withToken: true }).then((res) => {
            if (res.length > 0) {
                resolve(res)
            } else {
                resolve([])
            }
        }).catch(err => {
            resolve([])
        })
    })
}

/**
 * 保存
 */
function onSubmit() {
    return generateRef.value?.onSubmit()
}

/**
 * 用于多表单
 * @returns {*[]|null}
 */
function multipleRef() {
    return generateRef.value?.multipleRef()
}

function handleChangeTab(key, callback?: any) {
    demoRefs = []
    if (callback) {
        callback(key)
    }
}

defineExpose({
    onSubmit,
    multipleRef,
    formId
})
</script>

<style lang="less">
@import url('/@/assets/less/form.less');
</style>
