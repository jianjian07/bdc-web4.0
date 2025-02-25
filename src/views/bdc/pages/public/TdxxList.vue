
    <template>
    <div ref="formRef" class="cici-form-css"><a-form :label-col="{ style: { width:'120px'} }" :labelWrap="true" :disabled="formDisabled">
                <div class="title-css1 title-left" >
                   <span>宗地列表</span>
                </div><a-table :columns="columns.columns1" :data-source="viewData.BDC_TDDJ"   :pagination="paginations['pagination1']" @change="onChange1($event,'pagination1')" bordered>
           <template #bodyCell="{ column, text, record }">
                  
        <template v-if="column.key === 'action'">
                
                <span>
                <a-button type="link" @click="LookTdxx(record)">查看</a-button><a-divider type="vertical" /><a-button type="link" @click="EditTdxx(record)">编辑</a-button><a-divider type="vertical" /><a-button type="link" @click="(record)">登记簿</a-button><a-divider type="vertical" /><a-button type="link" @click="delData(record)">删除</a-button><a-divider type="vertical" /><a-button type="link" @click="uploadFile(record)">上传附件</a-button><a-divider type="vertical" /><a-button type="link" @click="lookFile(record)">查看附件</a-button>
               </span>
        </template>
        
           </template>
        </a-table>
</a-form></div>
    </template>
    <script setup lang="ts">
import { defHttp } from "/@/utils/http/axios";
import { ref, reactive, onMounted, computed, onBeforeUpdate,useAttrs, watch } from "vue";
import { getDictItemsByCode,getTreeDictItemsByCode,formatMultipleSelectValue,formatMultipleTreeSelectValue, getCasDictItemsByCode, useVNodes } from '/@/views/online/utils/commonUtils';
import { getData,getDataByApi,initTable, initCTableV2, initAllCTableV2, validateInfos, validateFun, onSubmitForm, syncChange, onTableSelectClear, onTableSelectChange, onTableSelectRowChange, getSelectAllCheck, setSelectAllCheck, getAccount, hideField, getSelectJsonSetting } from "/@/views/online/utils/wonder1.0.1";
import tableSelectProps from "/@/components/form-widget/widget/tableSelectOptions"
import { cModal } from "/@/components/cModal/index"
import { Modal, message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

const formId=34;
const route = useRoute();
const VNodes = useVNodes();
let datalist: any = ref([]);
let formRef = ref()
let formDisabled = ref(false)
let demoRefs: any = []
let viewData = ref<any>({"BDC_TDDJ":[]})
let formSetting = []
let apiDataSource = []
let isSubmit = ref(true)
let { disabled } = useAttrs()

// 如果有传值优先读取父组件传值
if (disabled != undefined && typeof disabled == 'boolean') {
  formDisabled.value = disabled
}

    let paginations = reactive({"pagination1":{"bindName":"BDC_TDDJ","total":0,"current":1,"pageSize":5,"change":"onChange1($event,'pagination1')","showSizeChanger":false}});
        const columns={"columns1":[{"title":"宗地代码","dataIndex":"ZDDM","className":"tableClass","id":"column-fa90fa16-a115-10cf-51b9-ee6a959452e9","align":"left","options":{"hidden":false,"orderRule":""}},{"title":"宗地面积","dataIndex":"ZDMJ","id":"column-0ef7643b-6fbe-bb99-d15c-5957b6c9f4bb","align":"left","options":{"hidden":false,"orderRule":""}},{"title":"使用权面积","dataIndex":"SYQMJ","id":"column-1f2ea13c-9828-ab3a-bae9-ccf71d76811c","align":"left","options":{"hidden":false,"orderRule":""}},{"title":"土地用途","dataIndex":"TDYT","id":"column-fd2c5167-3ec4-63a6-61cf-a535f96f2979","align":"left","options":{"hidden":false,"orderRule":""}},{"title":"土地坐落","dataIndex":"TDZL","id":"column-d15e1c7c-fe71-354b-dc62-a04b89dd3ce4","align":"left","options":{"hidden":false,"orderRule":""}},{"title":"操作","key":"action"}]};

// 在线模式，只支持变量basicInfo



            initAllCTableV2({ viewData: viewData, formId: formId, paginations: paginations });
            
             /**
              * 分页
              * @param pag 
              * @param paginationName 分页对象
              */
            function onChange1(pag: any, paginationName: string) {
                paginations[paginationName] = pag
                initCTableV2({ viewData: viewData, formId: formId, pagination: paginations[paginationName]});
            }
        
await getDataByApi(viewData, apiDataSource)
await getData(viewData, formId)

    
    
    function hideFields(index: number) {
       return hideField(formSetting, viewData, index)
    }
    /**
     * 保存
     */
    async function onSubmit() {
        return isSubmit.value ? await onSubmitForm(formRef.value) : null
    }
    /**
    * 用于多表单 
    * @returns {*[]|null}
    */
    function multipleRef() {
        let arr: any = []
        for (let i = 0; i < demoRefs.length; i++) {
          if (demoRefs[i].child) {
            arr.push(demoRefs[i].child)
          }
        }
        return arr.length ? arr : null
    }
    onBeforeUpdate(() => {
      // dom变化时清空 会重新设置
      demoRefs = []
    })
    
    defineExpose({
        multipleRef,
        onSubmit,
        isSubmit,
        formId
    })
    
    </script>

    <style scoped lang="less">
    @import url('/@/assets/less/form.less');
    </style>
    