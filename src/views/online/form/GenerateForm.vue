<!-- 报表类在线预览，原则上该文件不允许修改 -->

<template>
    <generate-vue3 ref="generateRef"></generate-vue3>
</template>

<script lang="ts" setup>

import { computed, defineComponent, onBeforeUpdate, reactive, ref, useAttrs, watch } from 'vue'
import { generateFormHtml } from 'form-imagining'
import { defHttp } from "/@/utils/http/axios";
import {
  formatMultipleSelectValue,
  formatMultipleTreeSelectValue,
  getCasDictItemsByCode,
  getDictItemsByCode,
  getTreeDictItemsByCode,
  useVNodes,
  getZjzlRuleCode,
  getLabelByDictCode,
  getLabelByTreeDictCode,
  getRowSpan,
  loadStyle
} from '/@/views/online/utils/commonUtils'
import { initTable, edit, save, cancel } from "/@/views/online/utils/wonder-report";
import { getForm } from '.';
import { useRoute } from 'vue-router';
import { cModal } from "/@/components/cModal/index"
import { Modal, message } from 'ant-design-vue';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import eventBus from "/@/views/online/utils/eventBus"
import dayjs from 'dayjs';
import * as bdc from '/@/views/bdc/public/bdc'
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
  hideField,
  initCTableV2,
  initAllCTableV2,
  editRow,
  saveRow,
  cancelRow,
  evaluateTagCondition,
  getMatchTag, 
  getFormInfo
} from "/@/views/online/utils/wonder1.0.1"
import { useUserStore } from "/@/store/modules/user"
// import tableSelectProps from "/@/components/form-widget/widget/tableSelectOptions"
const props: any = defineProps({
    id: {
        type: String,
        default: '34'
    },
    reload: {
        type: String,
        default: ""
    },
    readOnly: {
        type: Boolean,
        default: false
    },
    // 后续表单id改为用表单编码读取
    formCode: {
        type: String,
        default: ''
    },
    formData: {
        type: Object,
        default: {}
    },
    formType: {
        type: String,
        default: 'form'
    }
})
/**
 * 监听reload 重新加载数据
 */
watch(() => props.reload, async (newVal) => {
    if (newVal != "") {
        await getData(viewData, formId, props.formData)
    }
})
const { isSaved, caseCode, disabled } = useAttrs()
const VNodes = useVNodes();
const route = useRoute();
const userStore = useUserStore();
// const userInfo = computed(() => userStore.getUserInfo)
const userInfo = userStore.getUserInfo
const code = ref(props.id)
// const code = ref(route.params?.code.toString());
let dataSource = ref()
let paginations: any = ref()
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
let isSubmit = ref(true)
// 所有校验是否通过
let validateFlag = true
// 如果有传值优先读取父组件传值
if (disabled != undefined && typeof disabled == 'boolean') {
    formDisabled.value = disabled
    // 默认只读时不保存表单
    isSubmit.value = !formDisabled.value
}
let generateRef = ref()
const info = await getForm({ id: formInfo.formId })
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
// debugger
// columns.value = []
let selectJsonSetting = ref<any>(generateData.selectJsonSetting)
// getSelectJsonSetting(selectJsonSetting)
// columns.value = generateData.columns
// 合并行
columns.value = generateData.columns
if (columns.value && columns.value.length) {
  columns.value = columns.value.map((column) => {
  if (column.options && column.options.isRowSpan) {
    column.customCell = (_, index) => {
      return { rowSpan: getRowSpan(dataSource.value, index, column.dataIndex)}
    }
  }
  return column
})
}
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
// await getDataByApi(viewData, apiDataSource)
await getData(viewData, formId, props.formData)

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
    props: props,
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
        // if (paginations.value) {
        //     paginations.value.onChange = onChange
        // }
        initAllCTableV2({ viewData: viewData, formId: formId, paginations: paginations.value }, props.formData)

        onBeforeUpdate(() => {
            // dom变化时清空 会重新设置
            demoRefs = []
        })

        function search() {
            paginations.value.current = 1
            initTable(viewData, dataSource, formInfo, paginations);
        }

        /**
         * 分页 (报表)
         * @param pag
         * @param paginationName 分页对象
         */
        function onChange(pag: any) {
            paginations.value.current = pag
            initTable(viewData, dataSource, formInfo, paginations);
        }

        /**
         * 分页 (表单)
         * @param pag 
         * @param paginationName 分页对象
         */
        function onChange1(pag: any, paginationName: string) {
            paginations.value[paginationName] = pag
            initCTableV2({ viewData: viewData, formId: formId, pagination: paginations.value[paginationName] }, props.formData);
        }

        /**
         * 保存
         */
        async function onSubmit() {
            return isSubmit.value ? await onSubmitForm(formRef.value, onBeforeValidate) : null
        }

        async function onBeforeValidate() {
            if (events['onBeforeValidate']) {
                return await events['onBeforeValidate']()
            } else {
                return true
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

        return {
            userInfo,
            isSubmit,
            validateFlag,
            formDisabled,
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
            ...bdc,
            route,
            eventBus,
            computed,
            defHttp,
            editableData,
            search,
            onChange,
            onChange1,
            initCTableV2,
            initTable,
            edit,
            save,
            cancel,
            saveRow,
            editRow,
            cancelRow,
            reloadTable,
            handleChangeTab,
            getDictItemsByCode,
            getTreeDictItemsByCode,
            getCasDictItemsByCode,
            getLabelByDictCode,
            getLabelByTreeDictCode,
            formatMultipleSelectValue,
            formatMultipleTreeSelectValue,
            getZjzlRuleCode,
            syncChange,
            onTableSelectClear,
            onTableSelectRowChange,
            getSelectAllCheck,
            setSelectAllCheck,
            validateFun,
            getFormInfo,
            getImgUrl,
            validateInfos,
            cModal,
            Modal,
            message,
            dayjs,
            watch,
            onSubmit,
            multipleRef,
            getAccount,
            getMatchTag,
            excuteHrefFun,
            loadStyle
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
                } else {
                    try {
                        eval(`(${_data.param})=> { ${_data.func}}`)
                        events[_data.name] = eval(`(${_data.param})=> { ${_data.func}}`)
                    } catch (error) {

                    }
                }
            } else {
                if (_data.isasync) {
                    events[_data.name] = eval(`async ()=> { ${_data.func}}`)
                } else {
                    events[_data.name] = eval(`()=> { ${_data.func}}`)
                }
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
        if (_sourcedata[index].isList) {
            Reflect.set(_viewData, _sourcedata[index].name, [])
        } else {
            Reflect.set(_viewData, _sourcedata[index].name, {})
        }
    }
    return _viewData;
}
/**
 * 根据加载数据源筛选接口查询
 * @param formId
 */
function loadSourceData(formId: any) {
    return new Promise((resolve) => {
        const _url = "/api/zrzy-form/data/getNameList"
        defHttp.get({ url: _url, params: { formId: formId } }, { withToken: true }).then((res) => {
            if (res.success) {
                resolve(res.result)
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
async function onSubmit() {
    return await generateRef.value?.onSubmit()
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

/**
 * 刷新表格
 */
function reloadTable() {
  initAllCTableV2({ viewData: viewData, formId: formId, paginations: paginations.value }, props.formData);
}

/**
 * 获取图片
 * @param name
 */
function getImgUrl(name) {
  return new URL(`/src/assets/images/${name}`, import.meta.url).href
}

/**
 * 执行列配置超链接方法
 * @param funName
 */
function excuteHrefFun(funName, record) {
  if (events[funName]) {
    events[funName](record)
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
