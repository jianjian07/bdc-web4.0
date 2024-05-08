import * as convert from 'xml-js';
import { defHttp } from '/@/utils/http/axios';
import { guid } from '..';
import { message } from 'ant-design-vue';
import modal from 'ant-design-vue/es/modal';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
import { router } from '/@/router';
import { pinyin } from 'pinyin-pro';
const titleModel = {
    "type": "header",
    "icon": "header",
    "required": false,
    "extended": "",
    "font": "14",
    "align": "center",
    "color": "#000",
    "cssextended": "",
    "classname": "title-css1",
}
export async function vfdToForm(info: any, info1: any, formId: string) {

    let vfdModel = { formId: formId, content: "", formDataList: [] }
    const { MySelect, MyUpdate } = info1.WebFormConfig
    vfdModel.formDataList = getSql(MySelect, MyUpdate, formId)
    const controlList = info.elements[0].elements.find((t: any) => t.name == "SingleControlList").elements
    let _formdata: any =
    {
        list: [],
        config: {
            labelWidth: 120,
            layout: 'horizontal',
            baseScript: '',
            dataSource: [],
            baseProps: [],//defineProps
            cBasicInfo: [],//表单变量
            eventScript: [{
                key: "base",
                name: "全局变量定义",
                func: "// 在线模式，只支持变量basicInfo",
                type: "base",
                // func: "// const a=1",
                param: '',
                isasync: false
            }],
            formSetting: []
        },
    }
    // for (let index = 0; index <LayoutControlGroup.length; index++) {
    const tablelist = info.elements[0].elements.find((t: { name: string; }) => t.name == "Table").elements
    // let _list: any = []
    let _current: any = []
    let _index: number = 0;
    // for (let index = 3; index < 4; index++) {
    for (let index = 0; index < tablelist.length; index++) {
        // console.log("外层循环")
        const { attributes, elements } = tablelist[index];
        const tName = tablelist[index].name

        let col1 = []
        let col2 = []
        let number = 0

        let span = 12
        let _columns24: any = []


        if (tName == "LayoutControlGroup") {
            gridModel.id = guid()
            gridModel.key = guid()
            let _grid = JSON.parse(JSON.stringify(gridModel))
            if (_index > 0) {

                // 已经存在其它组件
                const _col: any = JSON.parse(JSON.stringify(colModel))
                _col.list = _current
                _grid.columns = [_col]
                _formdata.list.push(_grid)
                _index = 0
                _current = []
                _grid = JSON.parse(JSON.stringify(gridModel))
            }
            if (attributes.TextVisible == "True") {
                _formdata.list.push({
                    ...titleModel,
                    "id": attributes.name,
                    "name": attributes.Text,
                    "key": attributes.name
                })
            }
            for (let i = 0; i < elements.length; i++) {
                const cc = elements[i]
                const name1 = cc.name
                const cAttributes = cc.attributes
                if (cAttributes.ControlType == "GridControl") {
                    //table
                    const tableList = cc.elements[0].elements
                    console.log("列表")

                    let _tableColumns = []
                    let _action = []
                    for (let t = 0; t < tableList.length; t++) {
                        const table = tableList[t];
                        const column = table.attributes
                        const actions = table.elements
                        if (actions == undefined) {
                            _tableColumns.push({ title: column.Text, dataIndex: column.BindField })
                        } else {//操作列

                            for (let o = 0; o < actions.length; o++) {
                                const action = actions[o].attributes;
                                _action.push({
                                    "title": action.Text,
                                    "oper": action.ScriptFunName == undefined ? "" : action.ScriptFunName,
                                })
                            }

                        }
                    }
                    let { model, writeFields }: { model: string; writeFields: any[]; } = getModel(controlList, cAttributes.Name);

                    const tableModel = {
                        "type": "table",
                        "name": "列表",
                        "key": "610b671a-4137-596e-3bc8-601252cd6054",
                        "icon": "table",
                        "model": model,
                        "isedit": false,
                        "options": {
                            "pagination": true,
                            "pageSize": 5,
                            "showAction": true
                        },
                        "action": _action,
                        "tableColumns": _tableColumns,
                        "extended": "",
                        "id": "de920507-01c5-459e-186b-70d47f3bef53"
                    }
                    _formdata.list.push(tableModel)
                } else {
                    if (name1 == "LayoutControlItem" && (cAttributes.ControlType != "RadioButton" && cAttributes.ControlType != "CheckEdit")) {
                        let { col, title } = genInput(cAttributes, elements, i, controlList)
                        const width = parseInt(cAttributes.Size.split(',')[0].split('=')[1])
                        if (width > 300) {
                            genColumn2(col1, col2, _grid)
                            // 结束两列布局，新增col
                            col1 = []
                            col2 = []
                            // 按row处理
                            // console.log(title + "宽度是" + width)
                            if (span == 12) {
                                _columns24 = { ...colModel, list: [col] }
                            } else {
                                _columns24.list.push(col)
                            }
                            span = 24
                            // 为了正确的排序 ，如第一个是24，第二个是12，则第二个会被放到第二列，实际第一个应该在第一列
                            number = 0
                        } else {
                            number++
                            if (col != "") {
                                if (number % 2 == 0 || number == 0) {
                                    col2.push(col)
                                } else {
                                    col1.push(col)
                                }
                            }
                            span = 12
                            _columns24 = genColumn24(_columns24, _grid);
                        }
                    }
                }
                if (i === elements.length - 1) {
                    _columns24 = genColumn24(_columns24, _grid)
                    genColumn2(col1, col2, _grid)
                }
            }
            if (_grid.columns.length > 0)
                _formdata.list.push(_grid)
        }
        else if (tName == "LayoutControlItem") {
            _index++
            let { title, col } = genInput(attributes, elements, index, controlList);
            _current.push(col)
        }

    }
    // 将表单设计数据_formdata更新到数据表
    // formStore.formData = _formdata
    vfdModel.content = JSON.stringify(_formdata)
    updateFormInfo(vfdModel)
}
export async function vfdToForm_bf(formId: string) {
    const url = '/public/vfd/FDXX.vfdx'
    // const url = '/public/vfd/FWXXList.vfdx'
    //const url = '/public/vfd/BDCDJ_JZDJB.vfdx'
    defHttp.post({ url: url }, { withToken: false }).then((res) => {
        const xmlString = res
        const jsonData = convert.xml2json(xmlString, { compact: true, spaces: 4 });

        const jsonData1 = convert.xml2json(xmlString, { spaces: 4 });
        const newdata = JSON.parse(jsonData)
        const newdata1 = JSON.parse(jsonData1)
        vfdToForm(newdata1, newdata, formId)
    })
}
function getSql(mySelect: any, myUpdate: any, formId: string) {
    debugger
    let list: any = []
    // 我的查询
    mySelect.SQL.forEach((sql: any) => {
        const name = sql.Name._text
        const fields = convertToPinyin(sql.Fields._text)
        const body = convertToPinyin(sql.Body._text.replace(/dbo\./g, ''))

        list.push({
            name: name,
            cType: 'sql',
            dType: 'select',
            fields: JSON.stringify(fields.split(';')),
            formId: formId,
            isList: 0,
            content: body,
        })
    });
    // 我的更新
    myUpdate.SQL.forEach((sql: any) => {
        const name = sql.Name._text
        const fields = convertToPinyin(sql.Fields._text)
        const body = convertToPinyin(sql.Body._text)
        list.push({
            name: name,
            cType: 'sql',
            dType: 'update',
            fields: JSON.stringify(fields.split(';')),
            formId: formId,
            isList: 0,
            content: body,
        })
    });
    return list;
    // batchInsert(list);
}
// 批量插入
function updateFormInfo(vfdModel: any) {
    // 重复导入时，要先删除再导入
    defHttp.post({ url: "/api/zrzy-form/form/vfdToForm", data: vfdModel }, { withToken: true }).then(async (_res) => {
        if (_res.code == 200) {
            message.success("VFD导入成功")
            modal.confirm({
                title: '导入成功，是否直接进入设计界面?',
                icon: h(ExclamationCircleOutlined),
                okText: '是',
                cancelText: '否',
                content: h('div', { style: 'color:red;' }, '点击否，停留在当前列表'),
                onOk() {
                    router.push("/online/form/design" + '/' + vfdModel.formId)
                },
                onCancel() {
                    console.log('Cancel');
                },
                class: 'test',
            });

        }
    })
}
const gridModel = {
    "type": "grid",
    "icon": "grid",
    "columns": [],
    "options": {
        "gutter": 0,
        "justify": "start",
        "align": "top",
        "customClass": "",
        "hidden": false,
        "flex": true,
        "responsive": true,
        "remoteFunc": "",
        "remoteOption": "",
        "tableColumn": false,
        "subform": false
    },
    "top": 0,
    "bottom": 0,
    "left": 0,
    "right": 0,
    "name": "栅格布局",
    "key": "646abeba-159e-031f-6b7f-546f068a891c",
    "model": "",
    "id": "994571c8-4d27-1cdc-7512-7ed101b29089"
}
const colModel = {
    "type": "col",
    "key": "37d076b0-e5bb-efc3-a786-962b1bf604cb",
    "id": "ccae2218-6056-c284-0140-64306f27ceba",
    "options": {
        "span": 24,
        "offset": 0,
        "push": 0,
        "pull": 0,
        "xs": 24,
        "sm": 12,
        "md": 12,
        "lg": 12,
        "xl": 12
    }
}
function newCol(col: {}): any {
    return {
        "type": "col",
        "key": "37d076b0-e5bb-efc3-a786-962b1bf604cb",
        "id": "ccae2218-6056-c284-0140-64306f27ceba",
        "options": {
            "span": 24,
            "offset": 0,
            "push": 0,
            "pull": 0,
            "xs": 24,
            "sm": 12,
            "md": 12,
            "lg": 12,
            "xl": 12
        },
        "list": [col]
    };
}

function genColumn24(_columns24: any, _grid: any) {
    if (_columns24.list != undefined && _columns24.list.length > 0) {
        _grid.columns.push(_columns24);
        _columns24 = [];
    }
    return _columns24;
}
function genColumn2(col1: any, col2: any, _grid: any) {
    if (col1.length > 0) {
        const column1 =
        {
            "type": "col",
            "key": "37d076b0-e5bb-efc3-a786-962b1bf604cb",
            "id": "ccae2218-6056-c284-0140-64306f27ceba",
            "options": {
                "span": 12,
                "offset": 0,
                "push": 0,
                "pull": 0,
                "xs": 24,
                "sm": 12,
                "md": 12,
                "lg": 12,
                "xl": 12
            },
            "list": col1
        }
        const column2 =
        {
            "type": "col",
            "key": "37d076b0-e5bb-efc3-a786-962b1bf604cb",
            "id": "ccae2218-6056-c284-0140-64306f27ceba",
            "options": {
                "span": 12,
                "offset": 0,
                "push": 0,
                "pull": 0,
                "xs": 24,
                "sm": 12,
                "md": 12,
                "lg": 12,
                "xl": 12
            },
            "list": col2
        }
        _grid.columns.push(column1)
        _grid.columns.push(column2)
    }
}
function genInput(attributes: any, elements: any, i: number, controlList: any) {
    const item = attributes;
    const { CheckingType, DataType } = attributes;
    let _type = attributes.ControlType
    let title = "标题";
    if (elements == undefined) {
        title = ""
    } else {
        const lableItem = elements[i - 1];
        if (lableItem !== undefined) {
            title = lableItem.attributes.Text;
        }
    }
    const checkingType = item.CheckingType;
    let required = false;
    if (checkingType == "required") {
        required = true;
        title = title.replace('*', '');
    }
    let { model, writeFields }: { model: string; writeFields: any[]; } = getModel(controlList, item.Name);
    // 特殊处理
    if (DataType == "Date") {
        _type = "Date"
    }
    if (CheckingType == "number") {
        _type = "Number"
    }
    let col = {};
    switch (_type) {
        case "Button":
            col = {
                "id": "9234035d-8f9d-5db1-8651-9e6ede64e32d",
                "type": "button",
                "name": item.ControlText,
                "icon": "btn",
                "buttonType": "primary",
                "beforeIcon": "",
                "extended": "",
                "events": {
                    "onclick": ""
                },
                "key": "69c12f94-91a7-419b-1ac5-b575769c998f"
            };
            break;
        case "TextEdit":
            col = {
                "id": item.Name,
                "type": "input",
                "name": title,
                "icon": "input",
                "required": required,
                "width": "100%",
                "extended": "",
                "prefix": "",
                "suffix": "",
                "rules": [],
                "key": item.Name,
                "model": model,
                "writeField": writeFields
            };
            break;
        case "RichTextEdit":
            col = {
                "id": item.Name,
                "type": "textarea",
                "name": title,
                "icon": "textarea",
                "required": required,
                "width": "100%",
                "extended": "",
                "rows": 2,
                "key": item.Name,
                "model": model,
                "writeField": writeFields
            };
            break;
        case "CheckBox":
            col = {
                "id": item.Name,
                "type": "checkbox",
                "name": title,
                "icon": "checkbox",
                "required": false,
                "extended": "",
                "optionsType": "data",
                "dic": item.Dictionary,
                "options": [],
                "key": item.Name
            };
            break;
        case "ComboBox":
            col = {
                "id": item.Name,
                "type": "select",
                "name": title,
                "icon": "select",
                "required": false,
                "width": "100%",
                "extended": "",
                "dictType": "data",
                "dic": item.Dictionary,
                "key": item.Name,
                "model": model,
                "writeField": writeFields
            };
            break;
        case "Number":
            col = {
                "id": item.Name,
                "type": "inputnumber",
                "name": title,
                "icon": "inputnumber",
                "required": required,
                "width": "100%",
                "minCheck": true,
                "maxCheck": true,
                "step": 1,
                "precision": null,
                "extended": "",
                "key": item.Name,
                "model": model,
                "writeField": writeFields
            };
            break;
        case "Date":
            col = {
                "id": item.Name,
                "type": "datepicker",
                "name": title,
                "icon": "date",
                "required": required,
                "width": "100%",
                "extended": "",
                "key": item.Name,
                "model": model,
                "writeField": writeFields
            };
            break;
        default:

            break;
    }
    return { title, col };
}
/**
 * 获得要绑定的数据源
 * @param controlList 
 * @param name 
 * @returns 
 */
function getModel(controlList: any, name: string) {
    let model = '';
    let writeFields: any[] = [];
    for (let w = 0; w < controlList.length; w++) {
        const { ID, ReadField, WriteField } = controlList[w].attributes;
        if (ID == name) {
            model = ReadField;
            if (WriteField != "") {
                let write = convertToPinyin(WriteField)
                writeFields = write.split(';');
            }
        }
    }
    model = convertToPinyin(model)
    // 增加判断  如果是中文,转换为拼音首字母
    return { model, writeFields };
}


function convertToPinyin(text: string) {
    return pinyin(text, { pattern: 'first', separator: '' }).toUpperCase()
}