/**
 * 加载表单数据
 */
import { validateReg, validateRequired } from "/@/utils/form/validateUtil"
import { reactive, ref, watch } from "vue"
import { message, Modal } from "ant-design-vue"
import { defHttp } from "../http/axios"
import { router } from "/@/router"
import { isJsonData } from "/@/utils/form/commonUtils"
export let validateInfos: any = reactive({})

export async function getData(object1: { value: object }, formId?: number) {
    if (Object.keys(object1.value).length == 0) {
        return
    }
    const query = router.currentRoute.value.query
    const url = '/api/zrzy-form/generate/select'
    // formId: 14, param: { DOC_NO: 'QG1-20221434' } }
    //formId: 1, param: { code: 'demo1' }
    await defHttp.post({
        url: url,
        data: {
            formId: formId ? formId : 14,
            param: { slbh: query.slbh ? query.slbh : 'QG1-20221434' }
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
export function initTable(options: { dataSourceObj: { value: object }, bindName: string, pagination?: any, formId: number }) {
    const query = router.currentRoute.value.query
    const url = '/api/zrzy-form/generate/getGridModels'
    let params = {
        isPage: false
    }
    if (options.pagination != false) {
        params.isPage = true
        params["current"] = options.pagination.current
        params["size"] = options.pagination.pageSize
    }
    defHttp.post({
        url: url,
        data: {
            formId: options.formId ? options.formId : 14,
            readName: options.bindName,
            param: { slbh: query.slbh ? query.slbh : '06-09098' },
            ...params
        }
    }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            if (params.isPage) {
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
export function initAllCTableV2(options: { viewData: { value: object }, paginations?: any, formId: number }) {
    let paginations = JSON.parse(JSON.stringify(options.paginations))
    for (const key in paginations) {
        let pagination = paginations[key]
        if (pagination.bindName) {
            initCTableV2({ viewData: options.viewData, formId: options.formId, pagination: pagination });
        }
    }
}

/**
 * table 数据源方法 (新)
 * @param options
 */
export function initCTableV2(options: { viewData: { value: object }, pagination?: any, formId: number }) {
    const query = router.currentRoute.value.query
    const url = '/api/zrzy-form/generate/getGridModels'
    let params = {
        isPage: false
    }
    if (options.pagination.pageSize) {
        params.isPage = true
        params["current"] = options.pagination.current
        params["size"] = options.pagination.pageSize
    }
    defHttp.post({
        url: url,
        data: {
            formId: options.formId ? options.formId : 14,
            readName: options.pagination.bindName,
            param: { slbh: query.slbh ? query.slbh : '1932501' },
            ...params
        }
    }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            if (params.isPage) {
                options.viewData.value[options.pagination.bindName] = res.result.records
                options.pagination.total = res.result.total
            } else {
                options.viewData.value[options.pagination.bindName] = res.result
            }
        }
    })
}

export function getData2() {
    // 根据当前流程获取到对应的表单
    // viewData = res.result.ViewData
    let viewData: any = { bdc_djzb: { 业务号: '', age: 20 }, wonder_from: { id: '2', title: '我是yefw' } }
    return viewData;
}
export function saveData() {

    let updateData = <any>{};
    const all = document.getElementsByTagName('input')
    for (let index = 0; index < all.length; index++) {
        const node = all[index]
        const attribute = (node as any).attributes["write-field"];
        const _value = node.value
        if (attribute != undefined) {
            const writeField = attribute.nodeValue
            const fields = writeField.split(';')
            // 开始给更新的字段绑定值
            for (let i = 0; i < fields.length; i++) {
                const data = fields[i].split('.')
                const tableName = data[0]
                updateData[tableName] = updateData[tableName] ? updateData[tableName] : {}
                updateData[tableName][data[1]] = _value
            }
        }
    }
    console.log(JSON.stringify(updateData))
}

/**
 * 通用表单校验保存
 * 基础保存(校验不通过也可以进行数据保存)
 * @param formDoms
 */
export function saveFormData(formDoms: any) {
    return new Promise(async (resolve) => {
        let _result: any = await getFormInfo(formDoms)
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
    })
}

/**
 * 表单移交保存
 * 不通过校验不进行保存
 * @param formDoms
 */
export function saveHandleData(formDoms: any) {
    return new Promise(async (resolve) => {
        let res: any = getFormInfo(formDoms)
        let find = res.find(r => r.validate == false)
        let validateFlag = !find
        if (!validateFlag) {
            message.warning('请检查表单填写')
            resolve(null)
        } else {
            let promises: any = []
            for (let i = 0; i < res.length; i++) {
                promises.push(updateFormDatas(res[i]))
            }
            let allRes: any = await Promise.all(promises)
            let status = allRes ? allRes.filter(r => r).length == res.length : false
            if (status) {
                message.info("保存成功")
                resolve(res)
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

/**
 * 获取表单需要更新的值
 * @param formDoms
 */
export function getFormUpdateData(formDoms) {
    let res: any = []
    if (formDoms) {
        for (let i = 0; i < formDoms.length; i++) {
            let formId
            let el = formDoms[i].$el ? formDoms[i].$el : null
            if (formDoms[i].onSubmit) {
                formId = formDoms[i].formId
            } else if (formDoms[i].$ && formDoms[i].$.exposed && formDoms[i].$.exposed.onSubmit) {
                formId = formDoms[i].$.exposed.formId
            }
            if (el && formId) {
                let dom = el.querySelectorAll('[write-field]')
                let data = getUpdateData(dom)
                if (formId) {
                    res.push({
                        data: [data],
                        formId: formId
                    })
                }
            }
        }
    }
    return res
}

function updateFormDatas(formRes) {
    return new Promise((resolve) => {
        const url = "/api/zrzy-form/generate/update"
        const query = router.currentRoute.value.query
        // code: 'demo1'
        defHttp.post({
            url: url,
            data: {
                formId: formRes.formId ? formRes.formId : 14,
                param: { ...query },
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
export function onSubmitForm(dom: any, callback?: any) {

    let success
    let formDom = dom.querySelectorAll('[write-field]')
    // console.log('formDom', formDom)
    for (let i = 0; i < formDom.length; i++) {
        validateFun(formDom[i])
    }

    if (callback) {
        callback()
    }

    success = isValidateSuccess()
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
                    _arr = _arr.map((v) => { return v.value ? v.value : v }).filter(v => v)
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
        let domClassList = event.target.classList
        let domParentNodeClassList = event.target.parentNode.classList
        if (domClassList.contains('ant-select-selection-search-input') || domParentNodeClassList.contains('ant-picker-input')) {
            // select 控件 || 日期及范围
            let _pNode = event.target.parentNode.parentNode.parentNode
            if (event.target.parentNode.parentNode.classList.contains('ant-select-selection-overflow-item')) {
                _pNode = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
            }
            _attr = _pNode.getAttribute(attributeKey)
        } else {
            // 测试读取props方式获取不到 最新绑定里动态参数的rule里的值
            // 打包后无法读取__vnode属性 且attribute需要是字符串
            // _ctx = event.target.__vnode.ctx.attrs[attributeKey]
            // _props = event.target.__vnode.props[attributeKey]
            _attr = event.target.getAttribute(attributeKey)
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
    let value = getDomValue(event, eventType, _value)
    let rules = getDomAttribute(event, 'rules', eventType)
    let key = getDomAttribute(event, 'write-field', eventType)
    let msg = ''
    if (rules && key) {
        // 必填优先校验
        let findRequired = rules.find(rule => rule.type == 'required')
        if (findRequired) {
            msg += validateRequired(value)
        }
        let defaultRules = rules.filter(rule => rule.type != 'required')
        for (let i = 0; i < defaultRules.length; i++) {
            if (msg.length == 0) {
                msg += validateReg(defaultRules[i].type, value)
            }
        }

        if (!validateInfos[key]) {
            validateInfos[key] = {}
        }
        if (msg.length > 0) {
            validateInfos[key]['validateStatus'] = 'error'
            validateInfos[key]['help'] = msg
        } else {
            validateInfos[key]['validateStatus'] = 'validating'
            validateInfos[key]['help'] = ''
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
        if (validateInfos[key]['validateStatus'] == 'error') {
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
        validateInfos[key]['validateStatus'] = 'validating'
        validateInfos[key]['help'] = ''
    }
    return validateInfos
}
/**
 * 下拉框同步
 * @param value
 * @param object viewData对象
 * @param curr 当前绑定
 * @param syn 同步绑定
 */
export const syncChange = (value: any, object: { value: object }, punctuation: string, curr: string, syn?: string, callback?: any) => {
    punctuation = punctuation ? punctuation : ','
    // 绑定code 同步更新label
    let currarr = curr.split(".")
    let values = Array.isArray(value) ? value.map(v => v.value) : [value.value]
    object[currarr[0]][currarr[1]] = values ? values.join(punctuation) : undefined
    if (syn) {
        let synarr = syn.split(".")
        let labels = Array.isArray(value) ? value.map(v => v.label) : [value.label]
        object[synarr[0]][synarr[1]] = labels ? labels.join(punctuation) : undefined
    }
    if (callback) {
        callback(value)
    }
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
 * 表下拉双向绑定更新等
 * @param row 行数据
 * @param object viewData
 * @param curr 当前绑定值
 * @param keyName 选中字段
 * @param syn  同步更新值
 * @param labelName 显示字段
 */
export function onTableSelectRowChange(row: any, object: { value: object }, curr: string, keyName: string, syn?: string, labelName?: string, callback?: Function) {
    // 绑定code 同步更新 label
    let currarr = curr.split(".")
    let selectValue = row.map(r => r[keyName])
    object[currarr[0]][currarr[1]] = selectValue ? selectValue.join(',') : undefined
    if (syn && labelName) {
        let synarr = syn.split(".")
        let selectLabel = row.map(r => r[labelName])
        object[synarr[0]][synarr[1]] = selectLabel ? selectLabel.join(',') : undefined
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
    let obj = value ? value.split('.') : null
    if (obj) {
        let values = options ? options.map(option => option.value) : []
        viewData[obj[0]][obj[1]] = check ? values.join(',') : null
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
// export function hideField(formSetting: any, viewData: any, index: number) {
//     let _result = false
//     const ruleInfo = formSetting[index].ruleList[0];
//     const { field, selectType, ruleValue } = ruleInfo;
//     const arr = field.split(".")
//     let compareValue = ruleValue
//     if (selectType == "field") {
//         const arrRuleValue = ruleValue.split(".")
//         compareValue = viewData.value[arrRuleValue[0]][arrRuleValue[1]]
//     }
//     if (viewData.value != null) {
//         const info = viewData.value[arr[0]]
//         if (info != undefined && info[arr[1]] != undefined) {
//             _result = info[arr[1]] === compareValue ? true : false;
//         }
//     }
//     return _result
// }
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
