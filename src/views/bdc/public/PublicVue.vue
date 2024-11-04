<template>
    <div style="padding: 5px;">
        <a-space-compact block style="padding-left: 110px;margin-bottom: 5px;">
            <a-button type="primary" size="small" @click="openList">
                <template #icon>
                    <TableOutlined />
                </template>
                土地
            </a-button>
            <a-button type="primary" size="small">
                <template #icon>
                    <EditOutlined />
                </template>开发中...</a-button>
        </a-space-compact>
        <a-drawer v-if="open" v-model:open="open" title="不动产首次登记列表" width="1000" :style="{ position: 'absolute' }"
            :footer-style="{ textAlign: 'right' }" @close="onClose">
            <CRView id="1" @ok="onReload"></CRView>
        </a-drawer>
        <a-tabs v-model:activeKey="activeKey" centered tab-position="left">
            <a-tab-pane key="1" tab="收件信息">
                <component v-bind:is="component" :ref="setRef" id="21" :reload="reload">
                </component>
            </a-tab-pane>
            <a-tab-pane key="2" tab="房地信息" force-render>
                <component v-bind:is="component" :ref="setRef" id="28" :reload="reload">
                </component>
            </a-tab-pane>
            <a-tab-pane key="3" tab="其它信息">
                <!-- 
                <component v-bind:is="component" formCode="3">
                </component> -->
            </a-tab-pane>
        </a-tabs>
        <!-- <a-button type="link" @click="savaVue">保存</a-button> -->
        <!-- <CBtnsVue :vueRefs="demoRefs" /> -->
    </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';
import { TableOutlined, EditOutlined } from '@ant-design/icons-vue';
import { defHttp } from '/@/utils/http/axios';
import { useRoute } from 'vue-router';
import { guid } from '/@/utils';
let activeKey = ref('1');
const CBtnsVue = defineAsyncComponent(() => import("/@/views/bdc/public/Btns.vue"));
const CRView = defineAsyncComponent(() => import("/@/views/online/report/RView.vue"));
const component = computed(() => {
    return defineAsyncComponent(() => import("/@/views/online/form/GenerateForm.vue"));
})
let open = ref(false);
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
    const data = obj.data
    let bdcModels = []
    let _data: any =
    {
        "djdl": "CQ",
        "slbh": slbh,
        "guid": "process1713234366021",
        "regType": "",
        "djlb": "",
        "bdcModels": []
    }
    for (let index = 0; index < data.length; index++) {
        const dyh = data[index];
        bdcModels.push({ bdcdyh: dyh })
    }
    _data.bdcModels = bdcModels
    defHttp.post({
        url: '/api/zrzy-bdc/bdc/case/addCase',
        data: _data
    }, { withToken: true }).then((res) => {
        open.value = false
        reload.value = guid()
        console.log('数据提取成功')
    })
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

<style scoped lang="less"></style>