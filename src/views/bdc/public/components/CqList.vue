<template>
    <div ref="formRef" class="cici-form-css" style="padding: 10px"><a-form :labelWrap="true"> <a-form
                id="wonder-form-css" :labelWrap="true">
                <a-row class="wonderform-row-css " style="padding: 0px 0px 0px 0px" :gutter="[8, 0]" tyle="flex">
                    <a-col :span="8" :offset="0"><a-form-item label="不动产单元号"><a-input v-model:value="viewData.bdcdyh"
                                allowClear></a-input></a-form-item> </a-col>
                    <a-col :span="8" :offset="0"><a-form-item label="权利类型"><a-input v-model:value="viewData.qllxmc"
                                allowClear></a-input></a-form-item> </a-col>
                    <a-col :span="3" :offset="0">
                        <a-form-item style="text-align: left;padding-left:5px">
                            <a-button type="primary" @click="search" class="btn-icon-content">
                                查询
                            </a-button>
                        </a-form-item> </a-col>
                    <a-col :span="4" :offset="0"> </a-col></a-row></a-form>

            <c-table :columns="columns" :data-source="dataSource" @columns-change="onColumnsChange" :loading="loading"
                @export="onCExport" :eLoading="eLoading" v-model:value="selectedValue" :isSelectList="true"
                keyName="bdcdyh" mode="multiple" :pagination="paginations" @change="handleTableChange"
                @row-change="onSelectChange">
                <template #rowbar="{ record }">

                    <a-button type="link" @click="(record)"></a-button>
                </template>
            </c-table> <a-form id="wonder-form-css" :labelWrap="true">
                <a-row class="wonderform-row-css " style="padding: 8px 0px 0px 0px" :gutter="[8, 0]" tyle="flex">
                    <a-col :span="12" :offset="0">
                        <a-form-item style="text-align: left;padding-left:5px">
                            <a-button type="primary" @click="createSc" class="btn-icon-content">
                                <template #icon><svg-icon name="ing" width="16" height="16"></svg-icon></template><span
                                    class="btn-title">提取数据</span>
                            </a-button>
                        </a-form-item> </a-col></a-row></a-form>
        </a-form></div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios";
import { onMounted, ref, computed, reactive, watch } from "vue";
import { getDictItemsByCode, getTreeDictItemsByCode, formatMultipleSelectValue, formatMultipleTreeSelectValue, useVNodes } from '/@/views/online/utils/commonUtils';
import { syncChange, getSelectAllCheck, setSelectAllCheck } from "/@/views/online/utils/wonder1.0.1";
import { initTableV2, onExportExcel } from "/@/views/online/utils/wonder-report";
import { message } from "ant-design-vue";
import { emit } from "process";
const VNodes = useVNodes();
let dataSource: any = ref([])
let paginations = ref()
let columns = ref<any>([])
let viewData = ref<any>({})
let loading = ref<boolean>(false)
let eLoading = ref<boolean>(false)
let reportInfo = reactive<any>({
    formId: '',
    tableName: '',
    title: "文件",
    keyCol: '',
    searchInfo: [],
})


paginations.value = { total: 0, current: 1, pageSize: 5, showSizeChanger: false, showTotal: (total) => `共 ${total} 条数据` };
columns.value = [{ "id": "column-67130a3e-9a2b-cae0-89a1-26bd1fe2f5f8", "title": "不动产单元号", "dataIndex": "bdcdyh", "width": "auto", "options": { "hidden": false }, "children": [] }, { "key": "column-50d91f52-131c-1b36-2c4e-b0f5df450502", "title": "权利类型", "dataIndex": "qllxmc", "width": "auto", "options": { "hidden": false }, "id": "column-46a7ae6d-076c-8a24-e60a-b5f3c5e58824", "children": [], "className": "tableClass" }, { "title": "操作", "key": "action", "with": 200, "fixed": "right" }];
reportInfo.searchInfo = [{ "name": "bdcdyh", "searchType": "like", "defaultValue": "" }];
reportInfo.formId = 1;
reportInfo.title = '首次登记查询列表-禁随意修改';



let basicInfo = ref<any>({ "state": { "selectedRowKeys": [], "selectedRows": [], "loading": false } })

let selectedValue: any = ref([])
let options = {
    viewData: viewData,
    dataSource: dataSource,
    reportInfo: reportInfo,
    paginations: paginations,
    loading: loading,
    sortField: "",
    sortOrder: ""
}
function search() {
    paginations.value.current = 1
    initTableV2(options);
}
let filterColumns: any = ref([]);
filterColumns.value = columns.value
function onColumnsChange(data: any) {
    filterColumns.value = data
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

function onCExport(_data: any) {
    let exportColumns = ref(_data)
    if (exportColumns.value.length == 0) {
        message.warning('请选择要导出的列')
        return
    } else {
        onExportExcel(exportColumns, viewData, reportInfo, eLoading);
    }
}



function onSelectChange(selectedRowKeys, selectedRows) {
    basicInfo.value.state.selectedRowKeys = selectedRowKeys;

}
const emit = defineEmits(['ok'])

function createSc() {
    if (basicInfo.value.state.selectedRowKeys.length == 0) {
        message.warning('请选择要提取的数据')
    } else {
        emit('ok', { reload: true, data: basicInfo.value.state.selectedRowKeys })
    }
}

</script>

<style scoped lang="less">
@import url('/@/assets/less/form.less');
</style>
