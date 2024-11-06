<template>
    <div>
        <div class="title">{{ formConfig.title }}</div>
        <CBtnsVue :vueRefs="demoRefs" :btnList="btnList" v-model:spinning="spinning"/>
         <a-spin :spinning="spinning">
            <div style="width: 100%;height: 100%;display: flex;background-color:#f5f5f5; padding: 5px 0px;">
            <div style="width: calc(100% - 305px);background-color: #fff;padding: 5px;">
                <a-space-compact style="margin: 5px 10px;">
                    <a-button type="primary" @click="openList">
                        土地
                    </a-button>
                    <a-button type="primary" @click="openList">
                        楼盘表
                    </a-button>
                    <a-button type="primary">开发中...</a-button>
                </a-space-compact>
                <a-drawer v-if="open" v-model:open="open" title="不动产首次登记列表" width="1000"
                    :style="{ position: 'absolute' }" :footer-style="{ textAlign: 'right' }" @close="onClose">
                    <!-- <CRView id="1" @ok="onReload"></CRView> -->
                    <CqList @ok="onReload"></CqList>
                </a-drawer>
                <div>
                    <component v-bind:is="component" :ref="setRef" id="21" :reload="reload">
                    </component>
                    <component v-bind:is="component" :ref="setRef" id="28" :reload="reload">
                    </component>
                </div>
            </div>
            <div style="width: 300px;     margin-left: 5px;background-color: #fff;padding: 5px;">
                附件 待开发
            </div>
        </div>
         </a-spin>
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { TableOutlined, EditOutlined } from '@ant-design/icons-vue';
import { defHttp } from '/@/utils/http/axios';
import { useRoute } from 'vue-router';
import { guid } from '/@/utils';
import { extractData } from '/@/utils/bdc/bdc';
let activeKey = ref('1');
const CBtnsVue = defineAsyncComponent(() => import("/@/views/bdc/public/Btns.vue"));
const CRView = defineAsyncComponent(() => import("/@/views/online/report/RView.vue"));
const CqList = defineAsyncComponent(() => import("/@/views/bdc/public/components/CqList.vue"));
const component = computed(() => {
    return defineAsyncComponent(() => import("/@/views/online/form/GenerateForm.vue"));
})
let open = ref(false);
// 表单配置
let formConfig = ref<any>({})
// 表单上方配置按钮
let btnList = ref<any>({
  list1: [],
  list2: [],
  list3: []
})
// 表单内配置按钮
let formBtnList = ref<any>([])
// 表单loading
let spinning = ref<boolean>(false)

onMounted(() => {
  getFormConfig()
})

function getFormConfig() {
  formConfig.value = {
    title: '不动产首次登记(张三,李四)',
    btnConfig: {
      list1: [{
        name: '保存',
        func: 'baseSave',
        // 保存方法如果传参不打引号会立刻执行
        // params: `{
        //     beforeFun: bdc.aa('1'),
        //     afterFun: bdc.aa(1),
        //     params: { a:1 }
        //   }
        // `,
        params: `{
            beforeFun: "aa(demoRefs,1)",
            afterFun: "aa(1)",
            params: { a:1 }
          }
        `,
      },{
        name: '移交',
        func: 'handOver',
        params: '',
      },{
        name: '回退',
        func: 'handBack',
        params: '1,"2"'
      }],
      list2: [{
        name: '打印询问笔录',
        func: 'lookFile'
      },{
        name: '打印受理通知书',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '跳转附件',
        func: 'lookFile'
      },{
        name: '打印测试5',
        func: 'lookFile'
      },{
        name: '打印测试6',
        func: 'lookFile'
      },{
        name: '打印受理通知书',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      },{
        name: '打印缴费通知单',
        func: 'lookFile'
      }],
      list3: [{
        name: '查看附件',
        func: 'lookFile',
        params: `{ a: 1, b: '1' } `
      },{
        name: '楼盘表',
        func: 'lookLpb'
      }],
      list4: []
    }
  }
  
  Object.keys(btnList.value).forEach((key) => {
    btnList.value[key] = formConfig.value.btnConfig[key] || []
  })
  
  formBtnList.value = formConfig.value.btnConfig.list4 || []
}
function openList() {
    open.value = true
    // let modal = cModal({
    //     title: '首次列表',
    //     filePath: 'views/online/report/RView',
    //     width: 1200,
    //     formData: {
    //         formId: '1'
    //     },
    //     onOk: (_res: any) => {
    //         // res为弹窗内组件的dom

    //         modal.destroy()
    //     }
    // })
}
/**
 * 关闭弹窗
 */
function onClose() {
    open.value = false
}
const route = useRoute();
const slbh = route.query.slbh?.toString()
let reload = ref("")
/**
 * 刷新
 */
function onReload(obj: any) {
    debugger
    extractData(obj)
    // const data = obj.data
    // let bdcModels = []
    // let _data: any =
    // {
    //     "djdl": "CQ",
    //     "slbh": slbh,
    //     "guid": "process1713234366021",
    //     "regType": "",
    //     "djlb": "",
    //     "bdcModels": []
    // }
    // for (let index = 0; index < data.length; index++) {
    //     const dyh = data[index];
    //     bdcModels.push({ bdcdyh: dyh })
    // }
    // _data.bdcModels = bdcModels
    // defHttp.post({
    //     url: '/api/zrzy-bdc/bdc/case/addCase',
    //     data: _data
    // }, { withToken: true }).then((res) => {
    //     open.value = false
    //     reload.value = guid()
    //     console.log('数据提取成功')
    // })
}
// function savaVue() {
//     checkDemoRefs()
//     sendSaveFun('baseSave', demoRefs)
// }
// let isMounted = false
// const setRef = (el: any) => {
//     if (el && isMounted) {
//         demoRefs.push(el)
//         demoRefs = Array.from(new Set(demoRefs))
//     }
// }

// onMounted(() => {

//     console.info('new fun')
//     isMounted = true
// })
// 组件实例
let demoRefs: any = []
// 动态设置ref 在组件渲染后才能设置
const setRef = (el: any) => {
    if (el) {
        demoRefs.push(el)
    }
}
/**
 * 获取dom
 */
// function checkDemoRefs() {
//     debugger
//     if (demoRefs && demoRefs[0]) {
//         let el = demoRefs[0]
//         if (el && el.$.exposed && el.$.exposed.multipleRef) {
//             let arr = el.$.exposed.multipleRef()
//             if (arr) {
//                 demoRefs = [el, ...arr]
//                 // 去重
//                 demoRefs = Array.from(new Set(demoRefs))
//                 console.log('demoRefs', demoRefs)
//             }
//         }
//     }
// }

</script>

<style scoped lang="less">
.title {
    background-color: #5094F9;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    letter-spacing: 0.1em;
    color: #fff;
    font-weight: 600;
}
</style>