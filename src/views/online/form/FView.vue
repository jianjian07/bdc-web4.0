<!-- 报表类在线预览，原则上该文件不允许修改 -->

<template>
    <div style="padding: 10px 50px;">
        <generate-vue3 ref="generateRef"></generate-vue3>
    </div>
</template>

<script lang="ts" setup>

import { defineComponent, onBeforeUpdate, reactive, ref, useAttrs, watch } from 'vue'
import { generateFormHtml } from 'form-imagining'
import { defHttp } from "/@/utils/http/axios";
import { formatMultipleSelectValue, formatMultipleTreeSelectValue, getCasDictItemsByCode, getDictItemsByCode, getTreeDictItemsByCode, useVNodes } from '/@/views/online/utils/commonUtils'
import { initTable, edit, save, cancel } from "/@/views/online/utils/wonder-report";
import { getForm } from '.';
import { cModal } from "/@/components/cModal/index"
import { Modal, message } from 'ant-design-vue';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

import {
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
} from "/@/views/online/utils/wonder1.0.1"
// import tableSelectProps from "/@/components/form-widget/widget/tableSelectOptions"
const props = defineProps({
    id: {
        type: String,
        default: '1'
    },
})
const { isSaved, caseCode, disabled } = useAttrs()
const VNodes = useVNodes();
const code = ref(props.id)
// const code = ref(route.params?.code.toString());
let dataSource = ref()
let paginations = ref()
let columns = ref<any>([])
let formDisabled = ref(false)
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

let selectJsonSetting = ref<any>(generateData.selectJsonSetting)

columns.value = generateData.columns

formInfo.searchInfo = generateData.searchData
paginations.value = generateData.paginations;
let viewData = ref<any>({})
const _sourcedata: any = await loadSourceData(formId)
viewData.value = getViewDataByFormId(info.id)


const generateVue3 = defineComponent({
    template: generateData.html,
    props: [],
    components: {
        VNodes,
        InfoCircleOutlined
    },
    computed: {
        // ...events,
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

        })

        return {
            formRef,

            viewData,
            formInfo,
            isSaved,
            caseCode,
            paginations,
            dataSource,
            columns,
            selectJsonSetting,
            formDisabled,

            defHttp,
            editableData,
            // tableSelectProps,
            reset,
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
        
        function reset() {
            viewData.value = {}
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

        }


    },
    mounted() {
        // 固定了mounted的事件名
        const monunted = eventScript.filter(t => t.type == "Mounted")
        // console.log('monunted',monunted)
        if (monunted.length > 0) {

        }
    }
})

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
        const _url = "/api/zrzy-form/data/list"
        defHttp.post({ url: _url, params: { formId: formId, dType: 'select' } }, { withToken: true }).then((res) => {
            if (res) {
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
