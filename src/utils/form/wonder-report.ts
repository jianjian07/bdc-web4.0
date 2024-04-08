import { reactive, ref } from "vue"
import { defHttp } from "../http/axios"
import { cloneDeep } from 'lodash-es';
import { message } from "ant-design-vue";
import { compareObjects } from "/@/utils/index";
import { isEmpty } from "../is";
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
export function initTable(viewData, dataSource, reportInfo, paginations) {
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
                paginations.value.total = result.total
            }
        })
    })
}
export function search(viewData, dataSource, reportInfo, paginations) {
    paginations.value.current = 1
    initTable(viewData, dataSource, reportInfo, paginations);
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
            searchData.push({ ...r, value: viewData.value[name] })
        }
    }
    return searchData
}
/** 行编辑所需要代码 begin **/
// export const editableData: any = reactive({});
let obj = reactive<any>({ obj1: {}, obj2: {} })
export const edit = (key: string, editableData: any, dataSource: any) => {
    editableData[key] = cloneDeep(dataSource.filter((item: { id: string; }) => key == item.id)[0]);
    obj.obj1[key] = cloneDeep(editableData[key])
};
export const save = (key: string, editableData, dataSource: any, reportInfo: any, _callback?: any) => {
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
/**
 * 导出headers: any, fileName: string
*/
export function onExportExcel(columns, viewData, reportInfo) {
    const headers = { ...columns.value }
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
    let url = '/imaginform/zrzy-form/export/exportToExcel'

    defHttp.post({ url: url, data: data, responseType: "blob" }, { withToken: true }).then((res) => {
        downloadExcel(res, reportInfo.title)
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
