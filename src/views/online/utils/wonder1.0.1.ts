/**
 * 加载表单数据
 */
import { validateReg, validateRequired } from "/@/views/online/utils/validateUtil"
import { nextTick, reactive, ref, watch } from "vue"
import { message, Modal } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import { router } from "/@/router"
import { isJsonData,compareObjects } from "/@/views/online/utils/commonUtils"
import { cloneDeep } from "lodash-es"
import { isEmpty } from "/@/utils/is"
export let validateInfos: any = reactive({})

export async function getData(object1: { value: object }, formId?: number, params?: any) {
    if (Object.keys(object1.value).length == 0) {
        return
    }
    const query = router.currentRoute.value.query
    const url = '/api/zrzy-form/generate/select'
    // formId: 14, param: { DOC_NO: 'QG1-20221434' } }
    //formId: 1, param: { code: 'demo1' }
    let _param = { ...query, ...params }
    if (_param.slbh && _param.ywh) {
        _param.slbh = ''
    }
    await defHttp.post({
        url: url,
        data: {
            formId: formId ? formId : 14,
            param: _param
        }
    },
        { withToken: true }).then((res) => {
            if (res) {
                if (res.code == 200) {
                    let result = JSON.parse(res.result)
                    for (const resKey in result) {
                        object1.value[resKey] = result[resKey]
                    }
                    // console.log('res.result',JSON.parse(res.result))
                    // object.value = JSON.parse(res.result)
                } else {
                    message.error(res.result)
                }
            } else {
                message.error('接口发生错误')
            }
        })
}

export async function getDataByApi(object: { value: object }, apiDataSource: any) {
    for (let i = 0; i < apiDataSource.length; i++) {
        let res = await eval(apiDataSource[i].content)
        if (res) {
            if (apiDataSource[i].isList) {
                object.value[apiDataSource[i].name] = Array.isArray(res) ? res : [res]
            } else {
                object.value[apiDataSource[i].name] = !Array.isArray(res) && typeof res == 'object' ? res : {}
            }
        }
    }
}

export async function getInheritData(object: { value: object }, caseCode: string | any) {
    if (Object.keys(object.value).length == 0) {
        return
    }
    const query = router.currentRoute.value.query
    const url = '/api/zrzy-system/sys/tableExtend/getExtendData'
    await defHttp.post({
        url: url,
        data: {
            caseCode: caseCode,
            param: {
                doc_no: query.doc_no ? query.doc_no : 'QG1-20221434',
                old_doc_no: query.old_doc_no
            },
        }
    }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            let result = JSON.parse(res.result)
            for (const resKey in result) {
                object.value[resKey] = result[resKey]
            }
        } else {
            message.error(res?.result || '接口错误')
        }
    })
}

/**
 * table 数据源方法
 * @param options
 */
export function initTable(options: { dataSourceObj: { value: object }, bindName: string, pagination?: any, formId: number }, params?: any) {
    const query = router.currentRoute.value.query
    const url = '/api/zrzy-form/generate/getGridModels'
    let obj = {
        isPage: false
    }
    if (options.pagination != false) {
        obj.isPage = true
        obj["current"] = options.pagination.current
        obj["size"] = options.pagination.pageSize
    }
    let _param = { ...query, ...params }
    if (_param.slbh && _param.ywh) {
        _param.slbh = ''
    }
    defHttp.post({
        url: url,
        data: {
            formId: options.formId ? options.formId : 14,
            readName: options.bindName,
            param: _param,
            ...params
        }
    }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            if (obj.isPage) {
                options.dataSourceObj.value = res.result.records
                options.pagination.total = res.result.total
            } else {
                options.dataSourceObj.value = res.result
            }

        }
    })
}

/**
 * 查询所有表单表格
 * @param options
 */
export function initAllCTableV2(options: { viewData: { value: object }, paginations?: any, formId: number }, params?: any) {
    let paginations = options.paginations
    for (const key in paginations) {
        let pagination = paginations[key]
        if (pagination.bindName) {
            initCTableV2({ viewData: options.viewData, formId: options.formId, pagination: pagination }, params);
        }
    }
}

/**
 * table 数据源方法 (新)
 * @param options
 */
export function initCTableV2(options: { viewData: { value: object }, pagination?: any, formId: number }, params?: any) {
    const query = router.currentRoute.value.query
    const url = '/api/zrzy-form/generate/getGridModels'
    let obj = {
        isPage: false,
    }
    if (options.pagination.pageSize) {
        obj.isPage = true
        obj["current"] = options.pagination.current
        obj["size"] = options.pagination.pageSize
    }
    let _param = { ...query, ...params }
    if (_param.slbh && _param.ywh) {
        _param.slbh = ''
    }
    defHttp.post({
        url: url,
        data: {
            formId: options.formId ? options.formId : 14,
            readName: options.pagination.bindName,
            param: _param,
            ...obj
        }
    }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            if (obj.isPage) {
                options.viewData.value[options.pagination.bindName] = res.result.records
                options.pagination.total = res.result.total
            } else {
                options.viewData.value[options.pagination.bindName] = res.result
            }
        }
    })
}

// export function saveData() {
//
//     let updateData = <any>{};
//     const all = document.getElementsByTagName('input')
//     for (let index = 0; index < all.length; index++) {
//         const node = all[index]
//         const attribute = (node as any).attributes["write-field"];
//         const _value = node.value
//         if (attribute != undefined) {
//             const writeField = attribute.nodeValue
//             const fields = writeField.split(';')
//             // 开始给更新的字段绑定值
//             for (let i = 0; i < fields.length; i++) {
//                 const data = fields[i].split('.')
//                 const tableName = data[0]
//                 updateData[tableName] = updateData[tableName] ? updateData[tableName] : {}
//                 updateData[tableName][data[1]] = _value
//             }
//         }
//     }
//     console.log(JSON.stringify(updateData))
// }

/**
 * 通用表单校验保存
 * 基础保存(校验不通过也可以进行数据保存)
 * @param formDoms
 */
export function saveFormData(formDoms: any, params?: any) {
    return new Promise(async (resolve) => {
        let _result: any = await getFormInfo(formDoms)
        let allRes: any = []
        for (let i = 0; i < _result.length; i++) {
            const promiseRes = await updateFormDatas(_result[i], params)
            allRes.push(promiseRes)
        }
        let status = allRes ? allRes.filter(r => r).length == _result.length : false
        if (status) {
            resolve(_result)
        } else {
            resolve(null)
        }
    })
}

/**
 * 表单移交保存
 * 不通过校验不进行保存
 * @param formDoms
 */
export function saveHandleData(formDoms: any, params?: any) {
    return new Promise(async (resolve) => {
        let _result: any = await getFormInfo(formDoms)
        let find = _result.find(r => r.validate == false)
        let validateFlag = !find
        if (!validateFlag) {
            // message.warning('请检查表单填写')
            resolve(null)
        } else {
            let allRes: any = []
            for (let i = 0; i < _result.length; i++) {
                const promiseRes = await updateFormDatas(_result[i])
                allRes.push(promiseRes)
            }
            let status = allRes ? allRes.filter(r => r).length == _result.length : false
            if (status) {
                resolve(_result)
            } else {
                resolve(null)
            }
        }
    })
}

/**
 * 获取表单校验及更新数据信息
 * @param formDoms
 */
export async function getFormInfo(formDoms) {
    let res: any = []
    if (formDoms) {
        for (let i = 0; i < formDoms.length; i++) {
            let d
            let formId
            if (formDoms[i].onSubmit) {
                d = await formDoms[i].onSubmit()
                formId = formDoms[i].formId
            } else if (formDoms[i].$ && formDoms[i].$.exposed && formDoms[i].$.exposed.onSubmit) {
                // 组件同步请求数据后 无法用上方代码直接获取到暴露到子组件方法
                d = await formDoms[i].$.exposed.onSubmit()
                formId = formDoms[i].$.exposed.formId
            }
            // console.log('ddd', d)
            if (d) {
                res.push({
                    data: [d.updateData],
                    validate: d.validate,
                    formId: formId
                })
            }
        }
    }
    return res
}

export function updateFormDatas(formRes, params?: any) {
    return new Promise((resolve) => {
        const url = "/api/zrzy-form/generate/update"
        const query = router.currentRoute.value.query
        let param = { ...query, ...params }
        if (param.ywh && param.slbh) {
            param.slbh = ''
        }
        // code: 'demo1'
        defHttp.post({
            url: url,
            data: {
                formId: formRes.formId ? formRes.formId : 14,
                param: param,
                // param: { slbh: query.slbh ? query.slbh : 'QG1-20221434' },
                formData: formRes.data,
            }
        },
            { withToken: true }).then((res) => {
                if (res.code == 200) {
                    resolve(true)
                } else {
                    if (res.code == 500) {
                        Modal.error({
                            title: '报错错误',
                            content: res.message,
                            bodyStyle: {
                                height: '250px', overflowY: 'auto'
                            }
                        });
                    }
                    resolve(false)
                }
            }).catch((err => {
                resolve(false)
            }))
    })
}
/**
 * 单文件表单保存
 */
export async function onSubmitForm(dom: any, callback?: any) {

    let success
    let formDom = dom.querySelectorAll('[write-field]')
    // console.log('formDom', formDom)
    for (let i = 0; i < formDom.length; i++) {
        validateFun(formDom[i])
    }

    let callbackRes = true
    if (callback) {
        callbackRes = await callback()
    }
    // console.log('callbackRes', callbackRes)
    // console.log('validateInfos', validateInfos)
    success = isValidateSuccess() && callbackRes
    // console.log('validateInfos', validateInfos)
    // console.log('callbackRessuccess', success)
    console.log('sosososso', success)
    return {
        validate: success,
        updateData: getUpdateData(formDom)
    }
    // if (success) {
    //     console.log('onSubmitForm校验成功')
    //     // 获取表单需要更新的表单字段及数据值
    //     let updateData = <any>{}
    //     updateData = getUpdateData(formDom)
    //     return updateData
    // } else {
    //     return false
    // }
}

/**
 * 获取绑定更新数据值
 * @param dom
 */
function getUpdateData(dom: any[]) {
    let updateData = <any>{}
    for (let i = 0; i < dom.length; i++) {
        let value = getDomValue(dom[i])
        let updateFields = getDomAttribute(dom[i], 'write-field')
        const fields = updateFields.split(',')
        // 开始给更新的字段绑定值
        for (let i = 0; i < fields.length; i++) {
            const data = fields[i].split('.')
            const tableName = data[0]
            updateData[tableName] = updateData[tableName] ? updateData[tableName] : {}
            updateData[tableName][data[1]] = value
        }
    }
    return updateData
}


/**
 * 获取控件表单值
 * @param event
 * @param eventType
 */
function getDomValue(event: any, eventType?: string, _value?: any) {
    let value
    if (_value) {
        value = _value
    } else {
        if (eventType && event.target) {
            // 表下拉
            let tableSelect = event.target?.parentNode?.parentNode?.parentNode?.classList
            let mulTableSelect = event.target?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.classList
            if (tableSelect && tableSelect.contains('table-select-selected')) {
                eventType = undefined
                event = event.target.parentNode.parentNode.parentNode
            } else if (mulTableSelect && mulTableSelect.contains('table-select-selected')) {
                eventType = undefined
                event = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
            }
        }
        if (eventType) {
            // 控件本身校验
            value = event.target.value
        } else {
            // 通过外部dom
            let domClassList = event.classList
            if (domClassList.contains('ant-select')) {
                // select控件
                let _dataSet = event.getAttribute('data-value')
                let _arr = _dataSet ? JSON.parse(_dataSet) : ''
                // let _arr = isJsonData(_dataSet) ? JSON.parse(_dataSet) : _dataSet
                let _punctuation = event.getAttribute('punctuation')
                if (Array.isArray(_arr)) {
                    _arr = _arr.map((v) => {
                        return v.value ? v.value : v
                    }).filter(v => v)
                    value = _arr.length ? _arr.join(_punctuation || ',') : ''
                } else {
                    value = _arr
                }
            } else if (domClassList.contains('ant-checkbox-group') || domClassList.contains('ant-radio-group')) {
                // 单选多选
                let _dataSet = event.getAttribute('data-value')
                let _arr = _dataSet ? JSON.parse(_dataSet) : ''
                // let _arr = isJsonData(_dataSet) ? JSON.parse(_dataSet) : _dataSet
                value = Array.isArray(_arr) ? (_arr.length ? _arr.join(',') : '') : _arr
            } else if (domClassList.contains('ant-picker-range-custom')) {
                // 日期范围
                let antPicker: any = Array.from(event.childNodes).find((node: any) => node.classList && node.classList.contains('ant-picker-range'))
                let antPickerInput: any = Array.from(antPicker.childNodes).filter((node: any) => node.classList && node.classList.contains('ant-picker-input'))
                value = antPickerInput.map((pickerInput: any) => pickerInput.childNodes[0].value)
            } else if (domClassList.contains('ant-picker-custom')) {
                // 单日期
                let antPicker: any = Array.from(event.childNodes).find((node: any) => node.classList && node.classList.contains('ant-picker'))
                let antPickerInput: any = Array.from(antPicker.childNodes).find((node: any) => node.classList && node.classList.contains('ant-picker-input'))
                value = antPickerInput.childNodes[0].value
            } else {
                value = event.value
            }
        }
    }

    return value || ''
}

/**
 * 获取控件dom绑定的自定义属性值
 * @param event
 * @param eventType
 */
function getDomAttribute(event: any, attributeKey: string, eventType?: string) {
    let result
    let _attr
    if (eventType) {
        // 组件自身 (单选和多选目前自身没法触发blur获取值)
        let target = event.target.classList ? event.target : event.nativeEvent.target
        let domClassList = target.classList
        let domParentNodeClassList = target.parentNode.classList
        if (domClassList.contains('ant-select-selection-search-input') || domParentNodeClassList.contains('ant-picker-input')) {
            // select 控件 || 日期及范围
            let _pNode = target.parentNode.parentNode.parentNode
            if (target.parentNode.parentNode.classList.contains('ant-select-selection-overflow-item')) {
                _pNode = target.parentNode.parentNode.parentNode.parentNode.parentNode
            }
            _attr = _pNode.getAttribute(attributeKey)
        } else if (domClassList.contains('ant-radio-input')) {
            let _pNode = target.parentNode.parentNode.parentNode
            _attr = _pNode.getAttribute(attributeKey)
        } else {
            // 测试读取props方式获取不到 最新绑定里动态参数的rule里的值
            // 打包后无法读取__vnode属性 且attribute需要是字符串
            // _ctx = event.target.__vnode.ctx.attrs[attributeKey]
            // _props = event.target.__vnode.props[attributeKey]
            _attr = target.getAttribute(attributeKey)
        }
    } else {
        // 外部通过指定属性找到的dom
        if (event.target) {
            _attr = event.target.getAttribute(attributeKey)
        } else {
            _attr = event.getAttribute(attributeKey)
        }
    }
    result = isJsonData(_attr) ? JSON.parse(_attr) : _attr
    return result
}

/**
 * 控件规则自定义校验
 * @param event
 * @param eventType 事件类型
 * @param _value select等特殊拿不到值
 * 说明: 如果是控件触发 传blur或传值,
 * 不传值默认是点击保存按钮统一对控件进行校验)
 */
export function validateFun(event: any, eventType?: string, _value?: any, callback?: any) {
    if (typeof event == 'string') {
        event = document.querySelectorAll(`[write-field="${event}"]`)?.[0]
    }
    let value = getDomValue(event, eventType, _value)
    let rules = getDomAttribute(event, 'rules', eventType)
    let key = getDomAttribute(event, 'write-field', eventType)
    let msg = ''
    // let hidden = getDomIsHidden(event,eventType)
    // 隐藏的dom不参与校验
    // 241020更新 因存在Tab页 dom被隐藏导致没有进入校验 隐藏dom仍参与校验,并检查表单绑定
    let hidden = false
    if (!hidden && rules && key) {
        // 必填优先校验
        let findRequired = rules.find(rule => rule.type == 'required')
        if (findRequired) {
            msg += validateRequired(value)
        }
        if (value) {
            let defaultRules = rules.filter(rule => rule.type != 'required')
            for (let i = 0; i < defaultRules.length; i++) {
                if (msg.length == 0) {
                    msg += validateReg(defaultRules[i].type, value)
                }
            }
        }

        if (!validateInfos[key]) {
            validateInfos[key] = reactive({})
        }

        if (msg.length > 0) {
            let errorObj = reactive({
                validateStatus: 'error',
                help: msg
            })
            validateInfos[key]['validateStatus'] = errorObj.validateStatus
            validateInfos[key]['help'] = errorObj.help
        } else {
            let valObj = reactive({
                validateStatus: 'validating',
                help: ''
            })
            validateInfos[key]['validateStatus'] = valObj.validateStatus
            validateInfos[key]['help'] = valObj.help
        }
        validateInfos[key]['type'] = 'default'
    }
    if (callback) {
        callback(event)
    }
}

/**
 * 判断是否校验成功
 */
function isValidateSuccess() {
    let success = true
    for (const key in validateInfos) {
        if (validateInfos[key] && validateInfos[key]['validateStatus'] == 'error') {
            success = false
            break
        }
    }
    return success
}

/**
 * 初始化validateInfos
 */
export function initValidateInfos() {
    validateInfos = {}
    return validateInfos
}

/**
 * 清空validateInfos
 */
export function resetValidateInfos() {
    for (const key in validateInfos) {
        if (validateInfos[key]) {
            let obj = reactive({
                validateStatus: 'validating',
                help: ''
            })
            validateInfos[key]['validateStatus'] = obj.validateStatus
            validateInfos[key]['help'] = obj.help
        }
    }
    return validateInfos
}

export function setValidateInfos(key, validateStatus, help) {
    if (!validateInfos[key]) {
        validateInfos[key] = {}
    }
    validateInfos[key]['validateStatus'] = validateStatus
    validateInfos[key]['help'] = help
}
/**
 * 下拉框同步
 * @param value
 * @param object viewData对象
 * @param curr 当前绑定
 * @param syn 同步绑定
 */
export const syncChange = (value: any, object: {
    value: object
}, punctuation: string, curr: string, syn?: string, callback?: any) => {
    punctuation = punctuation ? punctuation : ','
    // 绑定code 同步更新label
    if (curr && curr != 'undefined') {
        let currarr = curr.includes('.') ? curr.split(".") : curr
        let values = Array.isArray(value) ? value.map(v => v.value || v) : [value?.value || value]
        if (curr.includes('.')) {
            object[currarr[0]][currarr[1]] = values ? values.join(punctuation) : undefined
        } else {
            object[currarr] = values ? values.join(punctuation) : undefined
        }
    }
    if (syn) {
        let synarr = syn.includes('.') ? syn.split(".") : syn
        let labels = Array.isArray(value) ? value.map(v => v.label || v) : [value?.label || value]
        if (syn.includes('.')) {
            object[synarr[0]][synarr[1]] = labels ? labels.join(punctuation) : undefined
        } else {
            object[synarr] = labels ? labels.join(punctuation) : undefined
        }
    }
    nextTick(() => {
        if (callback) {
            callback(value)
        }
    })
};

/**
 * 表下拉清除
 * @param object
 * @param curr
 */
export function onTableSelectClear(object: { value: object }, curr: string, callback?: any) {
    let currarr = curr.split(".")
    object[currarr[0]][currarr[1]] = ''
    if (callback) {
        callback()
    }
}

/**
 * 表下拉多选时清除单项
 * @param value
 * @param option
 * @param object
 * @param curr
 * @param callback
 */
export function onTableSelectChange(value, option, object: { value: object }, curr: string, callback?: any) {
    let currarr = curr.split(".")
    if (currarr.length > 1) {
        object[currarr[0]][currarr[1]] = value ? value.join(',') : undefined
    } else {
        object[currarr[0]] = value ? value.join(',') : undefined
    }

    if (callback) {
        callback()
    }
}

/**
 * 表下拉双向绑定更新等
 * @param row 行数据
 * @param object viewData
 * @param curr 当前绑定值
 * @param keyName 选中字段
 * @param syn  同步更新值
 * @param labelName 显示字段
 */
export function onTableSelectRowChange(row: any, object: {
    value: object
}, curr: string, keyName: string, syn?: string, labelName?: string, callback?: Function) {
    // 绑定code 同步更新 label
    let currarr = curr.split(".")
    let selectValue = row.map(r => r[keyName])
    if (currarr.length > 1) {
        object[currarr[0]][currarr[1]] = selectValue ? selectValue.join(',') : undefined
        if (syn && labelName) {
            let synarr = syn.split(".")
            let selectLabel = row.map(r => r[labelName])
            object[synarr[0]][synarr[1]] = selectLabel ? selectLabel.join(',') : undefined
        }
    } else {
        object[currarr[0]] = selectValue ? selectValue.join(',') : undefined
        if (syn && labelName) {
            let synarr = syn.split(".")
            let selectLabel = row.map(r => r[labelName])
            object[synarr[0]] = selectLabel ? selectLabel.join(',') : undefined
        }
    }
    if (callback) {
        callback(row)
    }
}


// 获取select全选状态
export const getSelectAllCheck = (value, options) => {
    let values = options ? options.map(option => option.value) : []
    let _valueArr = value ? (value.includes(',') ? value.split(',') : [value]) : []
    return (_valueArr.length == values.length) && (_valueArr.length !== 0) && (values.length !== 0)
}

// 设置select全选
export const setSelectAllCheck = (e, viewData, value, options) => {
    let check = e.target.checked
    let obj = value ? (value.includes('.') ? value.split('.') : value) : null
    if (obj) {
        let values = options ? options.map(option => option.value) : []
        if (value.includes('.')) {
            viewData[obj[0]][obj[1]] = check ? values.join(',') : null
        } else {
            viewData[obj] = check ? values.join(',') : null
        }
    }
}

/**
 * 设置input的值 (手动触发change事件 同步v-model的值)
 * @param element
 * @param value
 */
export function setInputValue(element, value) {
    if (element) {
        element.value = value
        if ("createEvent" in document) {
            // chrome 浏览器
            let evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            element.dispatchEvent(evt);
        } else {
            // ie
            element.fireEvent("onchange")
        }
    }
}
/**
 * 计算
 * @param aType
 * @param fields
 * @param viewData
 * @returns
 */
export function getAccount(aType: string, fields: string, viewData: object) {
    let zhi = 0;
    switch (aType) {
        case "sum":
            zhi = sum(fields, viewData)
            break;
        case "avg":
            const he: number = sum(fields, viewData)
            zhi = he / fields.split(',').length
            break;
        case "min":
            break;
        case "max":
            break;
        default:
            break;
    }
    return zhi;
}
function sum(fields: string, viewData: object) {
    let sum: number = 0
    if (fields.indexOf(',') > -1) {
        let arr = fields.split(',')
        for (let i = 0; i < arr.length; i++) {
            let obj = arr[i].split('.')
            let _value = viewData[obj[0]][obj[1]]
            if (_value == undefined) _value = 0
            sum += _value
        }
    }
    return sum
}
export function hideField(formSetting: any, viewData: any, index: number) {
    // 先确定对比的值
    // 然后循环条件  根据类型拼接
    let _result = false
    const ruleList = formSetting[index].ruleList
    let ruleEvaluations: any = []
    for (let index = 0; index < ruleList.length; index++) {
        let ruleStatus = false
        const ruleInfo = ruleList[index];
        const { field, selectType, ruleValue, matchType, ruleType } = ruleInfo;
        const arr = field.split(".")
        let compareValue = ruleValue
        if (selectType == "field") {
            const arrRuleValue = ruleValue.split(".")
            compareValue = viewData.value[arrRuleValue[0]][arrRuleValue[1]]
        }
        if (viewData.value != null) {
            const info = viewData.value[arr[0]]
            if (info != undefined && info[arr[1]] != undefined) {
                const fieldValue = info[arr[1]]
                switch (ruleType) {
                    case "等于":
                        ruleStatus = fieldValue === compareValue ? true : false;
                        break;
                    case "不等于":
                        ruleStatus = fieldValue != compareValue ? true : false;
                        break;
                    case "包含":
                        ruleStatus = fieldValue.includes(compareValue) ? true : false;
                        break;
                    case "不包含":
                        ruleStatus = !fieldValue.includes(compareValue) ? true : false;
                        break;
                    case "大于":
                        ruleStatus = Number(fieldValue) > Number(compareValue) ? true : false;
                        break;
                    case "小于":
                        ruleStatus = Number(fieldValue) < Number(compareValue) ? true : false;
                        break;
                    default:
                        break;
                }
            }
        }
        ruleEvaluations.push({ matchType: matchType, status: ruleStatus })
    }
    if (ruleEvaluations.length > 0) {
        // if (ruleEvaluations.length == 1) {
        //     _result = ruleEvaluations[0].status
        // } else {
        const orEvaluations = ruleEvaluations.filter((t: any) => t.matchType == "或")
        const andEvaluations = ruleEvaluations.filter((t) => t.matchType !== "或");
        // 满足任一“或”条件则显示，且所有“与”条件都满足时才显示
        _result = (orEvaluations.some((t) => t.status) || andEvaluations.every((t) => t.status));
        // }
    }
    return _result
}

/**
 * 下拉json数据获取
 * @param selectJsonSetting
 */
export async function getSelectJsonSetting(selectJsonSetting: any) {
    for (const key in selectJsonSetting.value) {
        if (selectJsonSetting.value[key].options.length == 0) {
            let url = new URL(`/public/json/${key}.json`, import.meta.url).href
            await defHttp.get({ url: url }, { withToken: true }).then((_res) => {
                if (_res) {
                    if (selectJsonSetting.value[key].remoteLabel == 'label' && selectJsonSetting.value[key].remoteValue == 'value') {
                        selectJsonSetting.value[key].options = _res
                    } else {
                        selectJsonSetting.value[key].options = _res.map((item) => {
                            item.label = item[selectJsonSetting.value[key].remoteLabel]
                            item.value = item[selectJsonSetting.value[key].remoteValue]
                            return item
                        })
                    }
                }
            })
        }
    }
}

/** 表单表格行编辑 start **/
let obj = reactive<any>({ obj1: {}, obj2: {} })

/**
 * 新增行
 * @param columns
 * @param dataSource
 */
export function addNewRow(columns: any, dataSource: any) {
    let newData: any = {}
    let arr = columns.value ? columns.value : columns
    for (const column of arr) {
        const columnName = column["dataIndex"];
        if (columnName != undefined) {
            newData[columnName] = '';
        }
    }
    let data = dataSource.value ? dataSource.value : dataSource
    data.push(newData)
}

export const editRow = (key: string, editableData: any, dataSource: any, keyCol: string) => {
    // editableData[key] = cloneDeep(dataSource.filter((item: { bdcqzh: string; }) => key == item[keyCol])[0]);
    // obj.obj1[key] = cloneDeep(editableData[key])
    const keyData = cloneDeep(dataSource.filter((item) => key === item[keyCol])[0]);
    // 转换字符串使能匹配上数据字典
    Object.keys(keyData).forEach(field => {
        const value = keyData[field];
        if (value !== null && value !== undefined && typeof value !== 'function') {
            keyData[field] = String(value);
        }
    });
    
    editableData[key] = keyData;
    obj.obj1[key] = cloneDeep(editableData[key]);
};

export const saveRow = (key: string, editableData, dataSource: any, keyCol, tableName, _callback?: any) => {
    Object.assign(dataSource.filter((item: { [keyCol]: string; }) => key == item[keyCol])[0], editableData[key]);
    obj.obj2[key] = cloneDeep(editableData[key])
    let entity = []
    // 家庭成员 由于是新增时手动给cbfbm赋值,此时obj1和obj2中此字段没有差异 固没有被更新进去, 暂时屏蔽此行 直接用最新的obj2
    // entity = compareObjects(obj.obj1[key], obj.obj2[key])
    let saveObj = JSON.parse(JSON.stringify(obj.obj2[key]))
    for (const key in saveObj) {
      if (key == 'action') {
        delete saveObj[key];
      }
    }
    entity = saveObj
    if (!isEmpty(entity)) {
        let data: any = [];
        data = entity;
        // 当更新列为空时，默认id
        const colName = keyCol || "id"
        const keyValue = editableData[key][colName]
        let url = '/imaginform/zrzy-form/form/report/update'
        if (keyValue == "") {
            // 执行新增的操作
            url = '/imaginform/zrzy-form/form/report/addRow'
        } else {
            data[colName] = keyValue;
        }
        // 存在差异，需要更新
        defHttp.post({
            url: url,
            data: {
                keyCol: colName,
                tableName: tableName,
                data: entity,
            }
        }, { withToken: true }).then((res) => {
            if (res.code == 200) {
                delObj(key, editableData);
                message.success('数据更新成功');
                if (keyValue == "") {
                    let _dataSource = Array.isArray(dataSource) ? dataSource : dataSource?.value
                    const i = _dataSource.length;
                    _dataSource[i - 1][colName] = res.result[colName]
                }
            } else {
                message.error('数据更新失败');
            }
        })
    } else {
        delObj(key, editableData);
    }
};

/**
 * 删除对象
 * @param key
 */
function delObj(key: string, editableData) {
    delete editableData[key];
    delete obj.obj1[key];
    delete obj.obj2[key];
}

export const cancelRow = (key: string, editableData) => {
    delete editableData[key];
};

export const delRow = (key: string, dataSource: any, keyCol, tableName) => {
    defHttp.post({
        url: '/imaginform/zrzy-form/form/report/deleteRow',
        params: {
            keyCol: keyCol,
            tableName: tableName,
            keyValue: key,
        } }, { withToken: true }).then((res) => {
        if (res && res.success) {
            let _dataSource = Array.isArray(dataSource) ? dataSource : dataSource?.value
            let findIndex = _dataSource.findIndex(f => f[keyCol] == key)
            _dataSource.splice(findIndex, 1)
            message.success('删除成功!')
        }
    })
    
}
/** 行编辑所需要代码 end **/

/**
 * tag显示逻辑
 */
export function evaluateTagCondition(tag, compareValue) {
    if (tag?.condition === '=') {
      return tag?.value == compareValue;
    } else if (tag?.condition === '!=') {
      return tag?.value != compareValue;
    }
    return false; // 默认返回 false
}

export function getMatchTag(tagList, text) {
  const matchedTags = tagList.filter(tag =>
    evaluateTagCondition(tag, text) && tag.color && tag.color.length
  );

  if (matchedTags.length === 0) return null;

  // 优先匹配 `=` 规则的 tag
  const exactMatch = matchedTags.find(tag => tag?.condition === "=");
  return exactMatch || matchedTags[0]; // 如果没有 `=` 规则，则选第一个
}
