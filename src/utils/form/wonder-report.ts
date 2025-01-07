import { computed, reactive, ref } from "vue"
import { cloneDeep } from 'lodash-es';
import { message } from "ant-design-vue";
import { compareObjects } from "/@/utils/index";
import { defHttp } from "/@/utils/http/axios"
import { isEmpty } from "/@/utils/is"
import XLSX from 'xlsx-js-style';
import { formatToDate } from "/@/utils/dateUtil";
/**
 * 如果是API,没必要指明查询条件是等于还是模糊，因为逻辑在后端，因此这里查询条件对象直接是viewData
 * 参数示例如下：
 * const params = {
     ...viewData.value, current: paginations.value.current, size: paginations.value.pageSize
   }
 */

/**
 * table 数据源方法
 * @param options
 */
export function initTable(viewData, dataSource, reportInfo, paginations, loading) {
    loading.value = true
    const url = '/imaginform/zrzy-form/form/report/list'
    let searchData = getSearchData(viewData, reportInfo)
    const data = {
        searchData: searchData,
        id: reportInfo.formId,
        "isPage": true,
        "current": paginations.value.current,
        "size": paginations.value.pageSize
    }

    return new Promise((resolve, reject) => {
        defHttp.post({
            url: url,
            data
        }, { withToken: true }).then((res) => {
            if (res.code == 200) {
                const result = JSON.parse(res.result)
                // resolve(result)
                dataSource.value = result.records
                // console.log('dataSource.value', dataSource.value)
                paginations.value.total = result.total
            }
            loading.value = false
            resolve(true)
        })
    })
}
/**
 * table 数据源方法 参数改为对象
 * @param options - 包含以下属性
 * @param viewData - 表单数据
 * @param dataSource - 表格数据源
 * @param reportInfo - 表格信息
 * @param paginations - 分页信息
 * @returns
 */
export function initTableV2(options: any) {
    const { viewData, dataSource, reportInfo, paginations, loading, sortField, sortOrder } = options
    loading.value = true
    const url = '/imaginform/zrzy-form/form/report/list'
    let searchData = getSearchData(viewData, reportInfo)
    let data = {
        searchData: searchData,
        id: reportInfo.formId,
        "isPage": true,
        "current": paginations.value.current,
        "size": paginations.value.pageSize
    }
    if (sortOrder != "" && sortOrder != undefined) {
        let _sortOrder = sortOrder == "ascend" ? "asc" : "desc"
        data = Object.assign({}, data, { sortField: sortField, sortOrder: _sortOrder })
    }
    return new Promise((resolve, reject) => {
        defHttp.post({
            url: url,
            data
        }, { withToken: true }).then((res) => {
            if (res.code == 200) {
                const result = JSON.parse(res.result)
                // resolve(result)
                dataSource.value = result.records
                // console.log('dataSource.value', dataSource.value)
                paginations.value.total = result.total
            }
            loading.value = false
            resolve(true)
        })
    })
}
/**
 * api table数据源
 * @param viewData
 * @param dataSource
 * @param reportApiSource
 * @param paginations
 */
export function initApiTable(viewData, dataSource, reportApiSource, paginations, loading) {
    return new Promise(async (resolve, reject) => {
        loading.value = true
        let res = await eval(reportApiSource)
        if (res) {
            dataSource.value = res.list || res.records
            paginations.value.total = res.total
        }
        loading.value = false
        resolve(true)
    })
}

export function search(viewData, dataSource, reportInfo, paginations, loading) {
    paginations.value.current = 1
    initTable(viewData, dataSource, reportInfo, paginations, loading);
}

/**
 * 分页
 * @param pag
*/
// export function onChange(pag: any, ) {
//     paginations.value.current = pag
//     initTable();
// }
// 没用到暂时屏蔽
// export function getParams(options: { viewData: any; searchInfo: any }) {
//     let searchData = getSearchData()
//     const params = {
//         ...searchData,
//         "current": paginations.value.current,
//         "size": paginations.value.pageSize
//     }
//     return params
// }

function getSearchData(viewData, reportInfo) {
    let searchData = <any>[]
    // 组装查询条件
    for (var name in viewData.value) {
        if (viewData.value[name] != "" && viewData.value[name] != null) {
            const r = reportInfo.searchInfo.filter((t: { name: string }) => t.name == name)[0]
            if (r) {
                searchData.push({ ...r, value: viewData.value[name] })
            }
        }
    }
    return searchData
}
/** 行编辑所需要代码 begin **/
// export const editableData: any = reactive({});
let obj = reactive<any>({ obj1: {}, obj2: {} })
export const edit = (key: string, editableData: any, dataSource: any, keyCol: string) => {
    // editableData[key] = cloneDeep(dataSource.filter((item) => key == item[keyCol])[0]);
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

export const editOld = (key: string, editableData: any, dataSource: any) => {
    editableData[key] = cloneDeep(dataSource.filter((item: { id: string; }) => key == item.id)[0]);
    obj.obj1[key] = cloneDeep(editableData[key])
};

export const save = (key: string, editableData, dataSource: any, keyCol, tableName, _callback?: any) => {
    Object.assign(dataSource.filter((item: { [keyCol]: string; }) => key == item[keyCol])[0], editableData[key]);
    obj.obj2[key] = cloneDeep(editableData[key])
    let entity = []
    entity = compareObjects(obj.obj1[key], obj.obj2[key])
    if (!isEmpty(entity)) {
        let data: any = [];
        data = entity;
        // 当更新列为空时，默认id
        const colName = keyCol || "id"
        const keyValue = editableData[key][colName]
        let url = '/imaginform/zrzy-form/form/report/update'
        if (keyValue == "") {
            // 执行新增的操作
            url = '/imaginform/zrzy-form/form/report/add'
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
                message.info('数据更新成功');
                if (keyValue == "") {
                    _callback && _callback(res.result)
                } else {
                    _callback && _callback()
                }
            } else {
                message.error('数据更新失败');
            }
        })
    } else {
        delObj(key, editableData);
    }
};

export const saveOld = (key: string, editableData, dataSource: any, reportInfo: any, _callback?: any) => {
    Object.assign(dataSource.filter((item: { id: string; }) => key == item.id)[0], editableData[key]);
    obj.obj2[key] = cloneDeep(editableData[key])
    let entity = []
    entity = compareObjects(obj.obj1[key], obj.obj2[key])
    if (!isEmpty(entity)) {
        let data: any = [];
        data = entity;
        // 当更新列为空时，默认id
        const colName = reportInfo.keyCol || "id"
        const keyValue = editableData[key][colName]
        let url = '/imaginform/zrzy-form/form/report/update'
        if (keyValue == "") {
            // 执行新增的操作
            url = '/imaginform/zrzy-form/form/report/add'
        } else {
            data[colName] = keyValue;
        }
        // 存在差异，需要更新
        defHttp.post({
            url: url,
            data: {
                keyCol: colName,
                tableName: reportInfo.tableName,
                data: entity,
            }
        }, { withToken: true }).then((res) => {
            if (res.code == 200) {
                delObj(key, editableData);
                message.info('数据更新成功');
                if (keyValue == "") {
                    _callback && _callback(res.result)
                } else {
                    _callback && _callback()
                }
            } else {
                message.error('数据更新失败');
            }
        })
    } else {
        delObj(key, editableData);
    }
};

export const cancel = (key: string, editableData) => {
    delete editableData[key];
};
/**
 * 新增行
 * @param columns
 * @param dataSource
 */
export function addNewRow(columns: any, dataSource: any) {
    let newData: any = {}
    for (const column of columns.value) {
        const columnName = column["dataIndex"];
        if (columnName != undefined) {
            newData[columnName] = '';
        }
    }
    dataSource.value.push(newData);
}
/******** api模式 导出数据start **********/
/**
 * api模式导出数据
 * @param options 
 * @returns 
 */
export function onExportExcelApi(options: any) {
    const { viewData, paginations, reportApiSource, bLoading, exportColumns, reportInfo } = options
    paginations.value.current = 1
    const size = paginations.value.pageSize
    paginations.value.pageSize = paginations.value.total
    return new Promise(async (resolve, reject) => {
        bLoading.value = true
        let res = await eval(reportApiSource)
        if (res) {
            const worksheetData = res.list || res.records
            downloadExcelApi(exportColumns, worksheetData, reportInfo)
        }
        paginations.value.pageSize = size
        bLoading.value = false
        resolve(true)
    })
}
/**
 * excel导出数据
 * @param exportColumns 
 * @param worksheetData 
 */
function downloadExcelApi(exportColumns, worksheetData, reportInfo) {
    // 将数据转换为工作表
    let headerArr: any = []
    let newHeaderArr: any = []
    for (let index = 0; index < exportColumns.value.length; index++) {
        const column = exportColumns.value[index];
        headerArr.push(column.dataIndex)
        newHeaderArr.push(column.title)
    }
    // 过滤不需要的key
    const data = worksheetData.map(
        obj => Object.fromEntries(
            Object.entries(obj).filter(
                (r) => headerArr.includes(r[0])
            )
        )
    );
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headerArr });
    // 创建一个新的工作簿
    const workbook = XLSX.utils.book_new();
    // 把第一行的表头(newHeaderArr )替换成实际需要展示的表头
    XLSX.utils.sheet_add_aoa(worksheet, [newHeaderArr], { origin: "A1" });
    // 将工作表添加到工作簿中
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // 添加样式（定义在下方）
    addStyle(workbook.Sheets.Sheet1)
    const title = reportInfo.title + formatToDate(new Date())
    // 将工作簿导出为 Excel 文件
    XLSX.writeFile(workbook, title + '.xlsx');
}
/**
 * 样式
 * @param ws 
 */
function addStyle(ws) {
    for (const key in ws) {
        // 数据列
        if (!key.includes('!')) {
            ws[key].s = {
                font: { // 字体设置
                    sz: 10,
                    bold: false,
                    color: {
                        rgb: '000000'// 十六进制，不带#
                    }
                },
                alignment: { // 文字居中
                    horizontal: 'center',
                    vertical: 'center',
                    wrapText: true
                },
                border: { // 设置边框
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                }
            }
            // if (ws[key].t === 'z') {
            //     ws[key].t = 's'
            // }
        }
    }
}
/******** api模式 导出数据end **********/
/**
 * 导出headers: any, fileName: string
*/
export function onExportExcel(columns, viewData, reportInfo, bLoading) {
    bLoading.value = true
    const headers = [...columns.value]
    if (headers.length > 0) {
        const lastHeader = headers[headers.length - 1];
        if (lastHeader.key === 'action') {
            headers.pop(); // 移除最后一列
        }
    }
    let searchData = getSearchData(viewData, reportInfo)
    const data = {
        searchData: searchData,
        headers: headers,
        id: reportInfo.formId
    }
    let url = '/api/zrzy-form/export/exportToExcel'

    defHttp.post({ url: url, data: data, responseType: "blob" }, { withToken: true }).then((res) => {
        const title = reportInfo.title + formatToDate(new Date().getTime())
        downloadExcel(res, title)
        bLoading.value = false
    }).catch(err => {
        console.info(err)
    })
}
/**
 * excel 下载，请求excel导出过后使用
 * @param res
 * @param name
 */
function downloadExcel(res: any, name: string) {
    const blob = new Blob([res])
    // 文件名
    const fileName = name + '.xlsx'
    const elink = document.createElement('a')
    elink.download = fileName
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href)
    document.body.removeChild(elink)
}
/**
 * 删除对象
 * @param key
 */
function delObj(key: string, editableData) {
    delete editableData[key];
    delete obj.obj1[key];
    delete obj.obj2[key];
}
/** 行编辑所需要代码 end **/
/** 列设置 begin **/
// 多选框的事件回调
export function filterFun(value: Array<string>, columns) {
    return columns.value.filter(item => {
        if (value.includes(item.dataIndex)) {
            // 当暴露值为true时，循环遍历的值会赋给filterValue
            return true
        } else if (item.title == '操作') {
            return true
        }
        return false
    })
}
/** 列设置 end **/