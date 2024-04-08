import { ref, watch } from "vue"
/**
 * 生成代码
 * @returns  
 * code
 */
export function generateCode(formData: any) {
    // const formStore = useFormStore()
    let _script = '\n\r'
    let _style = '\n'
    let _body = generateHtml(formData.list)
    let _html = _body.html
    let _columns = _body.columns
    _script = generateTs(formData.config, _body.columns)

    /******** 动态脚本 end *********/
    let options = { body: _html, script: _script, style: _style }
    const templateCode =
        "<template>" + options.body +
        "</template>" +
        "\n\r" +
        '<script lang="ts" setup>' + options.script + generateData.value.pagScript +
        "</script>" +
        "\n" +
        '<style lang="less" scoped>' +
        options.style +
        "</style>"
    return templateCode
}
/**
 * 生成ts
 * @param data 
 * @returns 
 */
export function generateTs(data: any, columns: any) {
    let _script = ''
    // import { defHttp } from "/@/utils/http/axios";
    // import { ref,onMounted,reactive } from 'vue';
    let fromData: any = null
    let list: any = null
    _script = `
    `
    let _baseScript = 'import { defHttp } from "/@/utils/http/axios";\nimport { ref,onMounted } from "vue";' + "\n";
    _script += _baseScript
    _script += "const columns=" + JSON.stringify(columns) + "\n";
    _script += "let datalist:any=ref([]);\n"
    _script += "let formData: any = ref([]);\n"
    // _script += `${data.baseScript}`
    /******** 动态数据源 begin *********/
    const dataSources = data.dataSource
    for (let index = 0; index < dataSources.length; index++) {
        const dataSource = dataSources[index];
        let _params = dataSource.params
        let params = {}

        debugger
        _script += `
        function ${dataSource.name}(){
        let url = '${dataSource.url}'
        defHttp.${dataSource.method}({ url: url,params: {`
        let p = ""
        for (let index = 0; index < _params.length; index++) {
            const param = _params[index];
            p += `${[param.key]}:${param.value},`
        }
        _script += p.substring(0, p.length - 1)
        _script += `}}, { withToken: true } ).then((res) => {
            ${dataSource.requestFunc}
            }).catch(err => {
                console.info(err)
            })
}
`
    }
    /******** 动态数据源 end *********/
    /******** 动态脚本 begin *********/
    const funs = data.eventScript
    for (let index = 0; index < funs.length; index++) {
        const fun = funs[index];
        if (fun.name == '全局变量定义') {
            _script += `${fun.func}`
        }
        else if (fun.name == 'mounted') {
            _script += `
        onMounted(() => {
                ${fun.func}
        })`}
        else {
            if (fun.param == undefined) {
                fun.param == ''
            }
            _script += `
        function ${fun.name}(${fun.param}){
            ${fun.func}
        }
        `}
    }
    return _script;
}
let generateData = ref({ html: '', columns: [], pagScript: "" })
/**
 * 生成templage
 * @param data 
 * @returns 
 */
export function generateHtml(data: any) {
    // const formStore = useFormStore()
    let _body = ` <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">`
    let _vType = ''
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        _vType = element.type
        switch (_vType) {
            case 'grid':
                _body += generateGrid(element)
                break;
            case 'table':
                _body += generateTable(element)
                generatePage(element);
                break;
            default:
                _body += generateInput(element)
        }
    }
    _body += `\n\r</a-form>`
    generateData.value.html = _body
    return generateData.value
    // return _body
}
function generatePage(element: any) {
    let pagination = ref({ total: 0, current: 1, pageSize: 5 });
    let _script = "";
    if (element.options.pagination) {
        const size = element.options.pageSize
        _script += `let pagination = ref({
            total: 0,
            current: 1,
            pageSize:${size},
        })`+ '\n'
    }
    generateData.value.pagScript = _script
}
export function generateInput(element: any) {
    let _body = ''
    const _vType = element.type
    if (_vType == "input") {
        _body += ` <a-form-item label="${element.name}">
        <a-input  v-model:value="${element.model}" ${element.extended}/>
    </a-form-item>`
    } else if (_vType == 'textarea') {
        _body += `<a-form-item label="${element.name}">
        <a-textarea  v-model:value="${element.model}" placeholder="" :rows="2" ${element.extended}/>
    </a-form-item>`
    } else if (_vType == 'button') {
        _body += `<a-form-item style="text-align: center;">
        <a-button type="${element.buttonType}" ${element.extended}>${element.name}</a-button>
    </a-form-item>`
    }
    return _body
}
/**
 * 解析grid
 * @param element 
 */
function generateGrid(element: any) {
    let _body = ''
    _body += `
    <a-row :gutter="[${element.options.gutter}, 8]" tyle="flex">`
    for (let colIndex = 0; colIndex < element.columns.length; colIndex++) {
        const column = element.columns[colIndex];
        _body += `
                    <a-col :span="${column.options.span}" :offset="${column.options.offset}">`
        for (let i = 0; i < column.list.length; i++) {
            const data = column.list[i];
            _body += generateInput(data)
        }
        _body += ` </a-col>`
    }
    _body += `</a-row>`
    return _body
}

function generateTable(element: any) {
    generateData.value.columns = element.tableColumns
    let _body = ''
    let _pagination = ''
    if (element.options.pagination) {
        _pagination = `:pagination="pagination" @change="onChange($event, loadData)"`
    }
    let _oper = ""
    const iLength = element.action.length
    if (iLength > 0) {
        for (let index = 0; index < iLength; index++) {
            const _action = element.action[index];
            _oper += `<a @click="${_action.oper}(record)">${_action.title}</a>`
            if (index != iLength - 1) {
                _oper += `<a-divider type="vertical" />`
            }
        }
    }
    const _action = `<template #bodyCell="{ column, record }">
    <template v-if="column.key === 'action'">
        <span>
            ${_oper}
        </span>
    </template>
</template>`
    _body += `<a-table :columns="columns" :data-source="${element.model}" ${_pagination} bordered>${_action}</a-table>`
    return _body
}
function generateTable_bf(element: any) {
    let _body = ''
    _body += `
        <table class="form-table-css" >
            <thead class="form-table-thead" >
                <tr>`
    for (let index = 0; index < element.tableColumns.length; index++) {
        const column = element.tableColumns[index];
        _body += `<th> ${column.title} </th>`
    }
    _body += `</tr>
    </thead>
    <tbody class="form-table-tbody">`
    _body += `<tr v-if="${element.model}.length == 0"><td colspan="${element.tableColumns.length}" class="td-empty-data">暂无数据</td></tr>`
    _body += `<tr v-for="item, index in datasource(${element.model})">`
    for (let index = 0; index < element.tableColumns.length; index++) {
        const column = element.tableColumns[index];
        _body += `<td>{{item.${column.model}}}</td>`
    }
    _body += `</tr></tbody>
    </table>
    `
    // if (element.options.pagination) {
    //     _body += `<div class="form-table-pagination"><a-pagination v-model:current="pagination.current" v-model:pageSize="pagination.pageSize" :total="pagination.total" :show-total="pagination.showTotal" @change="onChange"/></div>`
    // }
    return _body
}
// export const getColumn = columns