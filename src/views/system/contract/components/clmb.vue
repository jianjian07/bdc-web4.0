
<template>
  <div ref="formRef" class="cici-form-css"><a-form :label-col="{ style: { width:'120px'} }" :labelWrap="true" :disabled="formDisabled"> <a-form id="wonder-form-css" :label-col="{ style: { width:'120px'} }" :labelWrap="true" >
  <a-row class="wonderform-row-css " style="padding: 0px 0px 0px 0px"  :gutter="[8, 0]" tyle="flex">
                  <a-col :span="24" :offset="0" >
              <div class="title-css6 title-left" >
                 <span>第十条  商品房相关设施设备交付条件</span>
              </div>
              <div class="title-css6 title-left" >
                 <span>（一）基础设施设备</span>
              </div><pre class="indent" style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;"> 1.供水、排水：交付时供水、排水配套设施齐全，并与城市公共供水、排水管网连接。使用自建设施供水的，供水的水质符合国家规定的饮用水卫生标准，</pre><a-form-item class="c-form-item-margin-22"   label="" ><a-input              ></a-input></a-form-item><pre class="indent" style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;"> 2.供电：交付时纳入城市供电网络并正式供电，</pre><a-form-item class="c-form-item-margin-22"   label="" ><a-input              ></a-input></a-form-item><pre class="indent" style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;"> 3.燃气：交付时完成室内燃气管道的敷设，并与城市燃气管网连接，保证燃气供应，</pre><a-form-item class="c-form-item-margin-22"   label="" ><a-input       style="width: 100px"        ></a-input></a-form-item> </a-col></a-row></a-form>
</a-form></div>
  </template>
  <script setup lang="ts">
import { defHttp } from "/@/utils/http/axios";
import { ref, reactive, onMounted, computed, onBeforeUpdate,useAttrs, watch } from "vue";
import { getDictItemsByCode,getTreeDictItemsByCode,formatMultipleSelectValue,formatMultipleTreeSelectValue, getCasDictItemsByCode, useVNodes } from '/@/utils/form/commonUtils';
import { getData,getDataByApi,initTable, initCTableV2, initAllCTableV2, validateInfos, validateFun, onSubmitForm, syncChange, onTableSelectClear, onTableSelectChange, onTableSelectRowChange, getSelectAllCheck, setSelectAllCheck, getAccount, hideField, getSelectJsonSetting,editRow, saveRow, cancelRow  } from "/@/utils/form/wonder1.0.1";
import tableSelectProps from "/@/components/form-widget/widget/tableSelectOptions"
import { cModal } from "/@/components/cModal/index"
import { Modal, message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

const formId=142;
const route = useRoute();
const VNodes = useVNodes();
let datalist: any = ref([]);
let formRef = ref()
let formDisabled = ref(false)
let demoRefs: any = []
let viewData = ref<any>({})
let formSetting = undefined
let apiDataSource = []
let isSubmit = ref(true)
let { disabled } = useAttrs()

// 如果有传值优先读取父组件传值
if (disabled != undefined && typeof disabled == 'boolean') {
formDisabled.value = disabled
}


// const a=1



await getDataByApi(viewData, apiDataSource)
await getData(viewData, formId)

  
      onMounted(() => {
              console.info('new fun')
              
      })

  
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
  @import url('/@/views/system/contract/components/mb.less');
  </style>
  