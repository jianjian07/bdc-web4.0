<template>
  <div style="height: 100%;">
    <div class="title">{{ formConfig.ajmc }}</div>
    <CBtnsVue v-model:spinning="spinning" :btnList="btnList" :vueRefs="demoRefs" :formTaskData="formTaskData" />
    <a-spin :spinning="spinning" wrapperClassName="form-content-spin">
      <div class="form-content" ref="formContent">
        <div class="left-content" :style="{ width: leftWidth + 'px' }">
          <div class="form-btn-list">
            <a-space-compact style="margin: 5px 10px;">
              <template v-for="(btn, index) in formBtnList">
                <a-button type="primary" @click="handleClick(btn)">
                  {{ btn.btnName }}
                </a-button>
              </template>
            </a-space-compact>
            <a-drawer v-if="open" v-model:open="open" :footer-style="{ textAlign: 'right' }"
              :style="{ position: 'absolute' }" title="不动产首次登记列表" width="1000" @close="onClose">
              <!-- <CRView id="1" @ok="onReload"></CRView> -->
              <CqList @ok="onReload"></CqList>
            </a-drawer>
          </div>
          <div :class="['form-body', formBtnList.length == 0 ? 'form-body-without-btn' : '']">
            <template v-for="(form, index) in formList">
              <component v-bind:is="form.bdlb == '0' ? generateForm : component(form.vfd)" :id="form.formId"
                :formCode="form.vfd" :disabled="form.iszd == '1'" :ref="setRef" :reload="reload">
              </component>
            </template>
            <!-- <tdxx-list></tdxx-list> -->
          </div>
        </div>
        <div class="split-line" id="drag-line" @mousedown="onDragStart"></div>
        <div class="right-content" :style="{ width: rightWidth + 'px' }">
          <div style="width: 100%">

            附件 待开发
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { TableOutlined, EditOutlined } from '@ant-design/icons-vue'
import { defHttp } from '/@/utils/http/axios'
import { useRoute } from 'vue-router'
import { guid } from '/@/utils'
import { extractData } from '/@/utils/bdc/bdc'
import { isJsonData } from "/@/utils/form/commonUtils"
import TdxxList from "/@/views/bdc/pages/public/TdxxList.vue"
import { message } from "ant-design-vue"
const modules = import.meta.glob('/src/**/*.vue')
let activeKey = ref('1')
const CBtnsVue = defineAsyncComponent(() => import("/@/views/bdc/public/Btns.vue"))
const CRView = defineAsyncComponent(() => import("/@/views/online/report/RView.vue"))
const CqList = defineAsyncComponent(() => import("/@/views/bdc/public/components/CqList.vue"))
const generateForm = computed(() => {
  return defineAsyncComponent(() => import("/@/views/online/form/GenerateForm.vue"))
})

const route = useRoute();
let open = ref(false)
// 表单配置
let formConfig = ref<any>({})
// 表单上方配置按钮
let btnList = ref<any>({
  left: [],
  center: [],
  right: []
})
// 表单内配置按钮
let formBtnList = ref<any>([])
// 表单列表
let formList = ref<any>([])
// 表单loading
let spinning = ref<boolean>(false)
// 表单流程相关数据(给按钮提供数据)
let formTaskData = ref<any>({})
let formContent = ref()
// 容器的宽度
let containerWidth = 0
let leftWidth = ref<any>(500)
let rightWidth = ref<any>(300)
let startX = 0
// 通用表单组件实例
let demoRefs: any = []
// 动态设置ref 在组件渲染后才能设置
const setRef = (el: any) => {
  if (el) {
    demoRefs.push(el)
  }
}
const component = (path: string) => {
  let _com = `/src/views/${path}.vue`
  let isCorrect = Object.keys(modules).includes(_com)
  if (isCorrect) {
    return defineAsyncComponent(modules[`/src/views/${path}.vue`])
  } else {
    return null
  }
}
enum api {
  getFlowConfig = '/api/zrzy-bdc/flow/vue/getFlowConfig',
  getTaskInfo = '/api/zrzy-bdc/act/task/getProcessTaskTransInfo'
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
  getFormConfig()
  getTaskInfo()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
})

function handleResize() {
  containerWidth = formContent.value?.offsetWidth;
  leftWidth.value = containerWidth - rightWidth.value - 10; // 10px 是 split-line 的宽度
}

/**
 * 获取表单配置
 */
function getFormConfig() {
  let slbh = route.query.slbh
  let jdid = route.query.nodeId
  defHttp.get({ url: api.getFlowConfig, params: { slbh: slbh, jdid: jdid } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      formConfig.value = res.result
      Object.keys(btnList.value).forEach((key) => {
        btnList.value[key] = formConfig.value?.btnList.filter(btn => btn.anwz == key) || []
      })

      formBtnList.value = formConfig.value?.btnList.filter(btn => btn.anwz == 'form') || []
      formList.value = formConfig.value?.vueList || []
    }
  })

  // formConfig.value = {
  //   title: '不动产首次登记(张三,李四)',
  //   btnConfig: {
  //     list1: [{
  //       name: '保存',
  //       func: 'baseSave',
  //       // 保存方法如果传参不打引号会立刻执行
  //       // params: `{
  //       //     beforeFun: bdc.aa('1'),
  //       //     afterFun: bdc.aa(1),
  //       //     params: { a:1 }
  //       //   }
  //       // `,
  //       params: `{
  //           beforeFun: "aa(demoRefs,1)",
  //           afterFun: "aa(1)",
  //           params: { a:1 }
  //         }
  //       `,
  //     }, { name: '移交', func: 'handOver', params: '', },
  //     { name: '回退', func: 'handBack', params: '1,"2"' }],
  //     list2: [{ name: '打印询问笔录', func: 'lookFile' },
  //     { name: '打印受理通知书', func: 'lookFile' },
  //     { name: '打印缴费通知单', func: 'lookFile' },
  //     { name: '跳转附件', func: 'lookFile' },
  //     { name: '打印测试5', func: 'lookFile' },
  //     { name: '打印测试6', func: 'lookFile' }],
  //     list3: [{ name: '查看附件', func: 'lookFile', params: `{ a: 1, b: '1' } ` },
  //     { name: '楼盘表', func: 'lookLpb' },
  //     { name: '查看附件', func: 'lookFile', params: `{ a: 1, b: '1' } ` },
  //     { name: '图形', func: 'lookLpb' },
  //     { name: '楼盘表', func: 'lookLpb' },
  //     { name: '查看附件', func: 'lookFile', params: `{ a: 1, b: '1' } ` },
  //     { name: '图形', func: 'lookLpb' }],
  //     list4: [{ name: '土地', func: 'openList' },
  //     { name: '楼盘表', func: 'lookTd' },
  //     { name: '林权', func: 'lookTd' }
  //     ]
  //   },
  //   formList: [
  //     {
  //       formCode: 'SJXX_PL',
  //       formId: '36',
  //       readOnly: false,
  //       isPl: false
  //     },
  //     // {
  //     //   formCode: 'FWYF',
  //     //   formId: '28',
  //     //   readOnly: true,
  //     //   isPl: true
  //     // },
  //     {
  //       formCode: 'FWYF',
  //       formId: '34',
  //       readOnly: true,
  //       isPl: true
  //     }
  //   ]
  // }

}

/**
 * 获取流程信息
 */
function getTaskInfo() {
  let taskId = route.query.taskId
   defHttp.get({ url: api.getTaskInfo, params: { taskId: taskId } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        let taskData = res.result
        let slbh = route.query.slbh
        let lcmc = formConfig.value.ajmc
        let cbsj, cbr
        if (taskData.bpmLogList.length) {
          cbsj = taskData.bpmLogList[0].opTime
          cbr = taskData.bpmLogList[0].opUserName
        } else {
          cbsj = taskData.taskNameStartTime
          cbr = taskData.taskAssigneeName
        }
        
        formTaskData.value.transData = {
          taskId: taskId,
          slbh: slbh,
          lcmc: lcmc,
          jdmc: taskData.nodeName,
          cbr: cbr,
          cbsj: cbsj,
          taskData: taskData
        }
      } else {
        message.warning('获取流程数据失败:' + res.message)
      }
   })
}

/**
 * 按钮
 * @param btn
 */
async function handleClick(btn) {
  if (btn.funName) {
    checkDemoRefs()
    console.log('demoRefs', demoRefs)
    let params = btn.bz ? (isJsonData(btn.bz) ? JSON.parse(btn.bz) : btn.bz) : ''
    let _params = `(demoRefs,spinning,formTaskData${params ? (',' + params) : params})`
    await eval(`${btn.funName}` + _params)
  }
}

function openList() {
  open.value = true
}

/**
 * 关闭弹窗
 */
function onClose() {
  open.value = false
}

// const route = useRoute()
// const slbh = route.query.slbh?.toString()
let reload = ref("")

/**
 * 刷新
 */
function onReload(obj: any) {
  obj.open = open
  obj.reload = reload
  extractData(obj)
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

/**
 * 获取dom
 */
function checkDemoRefs() {
  if (demoRefs) {
    let el = [...demoRefs]
    if (el) {
      let mulArr = getMultipleRef([el], [])
      demoRefs = mulArr
      demoRefs = Array.from(new Set(demoRefs))
      // console.log('msarr', mulArr)
    }
  }
}

function getMultipleRef(list: any[], arr: any[]) {
  list.forEach((item: any) => {
    if (Array.isArray(item)) {
      let _list = getMultipleRef(item, [])
      arr = [...arr, ..._list]
    } else {
      arr.push(item)
      if ((item && item.multipleRef && item.multipleRef())) {
        return getMultipleRef(item.multipleRef(), arr)
      } else if (item && item.$ && item.$.exposed && item.$.exposed.multipleRef && item.$.exposed.multipleRef()) {
        return getMultipleRef(item.$.exposed.multipleRef(), arr)
      } else if (item && item._ && item._.exposed && item._.exposed.multipleRef && item._.exposed.multipleRef()) {
        return getMultipleRef(item._.exposed.multipleRef(), arr)
      }
    }
  })
  console.log('arr', arr)
  return arr
}

/**
 * 开始拖拽
 * @param event
 */
function onDragStart(event) {
  startX = event.clientX
  document.addEventListener("mousemove", onDragging);
  document.addEventListener("mouseup", onDragEnd);
}

function onDragging(event) {
  const deltaX = event.clientX - startX
  let newLeftWidth = leftWidth.value + deltaX
  let newRightWidth = containerWidth - newLeftWidth - 10

  // 限制最小宽度
  if (newLeftWidth < 500) {
    newLeftWidth = 500
    newRightWidth = containerWidth - newLeftWidth - 10
  } else if (newRightWidth < 250) {
    newRightWidth = 250
    newLeftWidth = containerWidth - newRightWidth - 10
  }

  if (newLeftWidth + newRightWidth + 10 > containerWidth) {
    newLeftWidth = containerWidth - newRightWidth - 10
    newRightWidth = containerWidth - newLeftWidth - 10
  }

  leftWidth.value = newLeftWidth
  rightWidth.value = newRightWidth

  startX = event.clientX
}

/**
 * 拖拽结束
 */
function onDragEnd() {
  document.removeEventListener("mousemove", onDragging)
  document.removeEventListener("mouseup", onDragEnd)
}

</script>

<style lang="less" scoped>
.title {
  background-color: #5094F9;
  height: 40px;
  line-height: 40px;
  padding-left: 10px;
  letter-spacing: 0.1em;
  color: #fff;
  font-weight: 600;
}

.form-content-spin {
  height: calc(100% - 85px) !important;
}

.form-content {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #f5f5f5;
  padding: 5px 0px;

  .form-btn-list {
    margin-bottom: 5px;
  }

  .form-body {
    height: calc(100% - 47px);
    overflow: auto;
    padding: 0px 10px;

  }

  .form-body-without-btn {
    height: 100%;
  }
}

.left-content {
  background-color: #fff;
  padding: 5px;
  height: 100%;
}

.right-content {
  background-color: #fff;
  padding: 5px;
  height: 100%;
}

.split-line {
  width: 10px;
  position: relative;
  cursor: col-resize;

  &::after {
    content: "";
    position: absolute;
    width: 2px;
    height: 50px;
    background: #d5d3d3;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

/**修改滚动条样式（仅Google有效） */
::-webkit-scrollbar {
  width: 7px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background-color: #b6b7b9;
}
</style>