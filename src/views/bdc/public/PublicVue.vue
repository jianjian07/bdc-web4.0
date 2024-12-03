<template>
  <div style="height: 100%;">
    <div class="title">{{ formConfig.ajmc }}</div>
    <CBtnsVue v-model:spinning="spinning" :btnList="btnList" :vueRefs="demoRefs" />
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
              :style="{ position: 'absolute' }" title="数据提取" width="1000" @close="onClose">
              <template #extra>
                <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
                <a-button type="primary" @click="handleOk">确定</a-button>
              </template>
              <LookLpb v-if="eType == 'lpb'" ref="dataForm"></LookLpb>
              <CRView v-else :id="formId" ref="dataForm" @ok="onReload"></CRView>
            </a-drawer>
          </div>
          <div :class="['form-body', formBtnList.length == 0 ? 'form-body-without-btn' : '']">
            <template v-for="(form, index) in formList">
              <component v-bind:is="form.bdlb == '0' ? generateForm : component(form.vfd)" :id="form.formId"
                :formCode="form.vfd" :disabled="form.iszd == '1'" :ref="setRef" :reload="reload">
              </component>
            </template>
            <template v-if="qlr">
              <qlr-list v-show="showQlr" :qlr="qlr" :jdmc="jdmc"></qlr-list>
            </template>
            <!-- <tdxx-list></tdxx-list> -->
          </div>
        </div>
        <div v-if="showFilePanel" class="split-line" id="drag-line" @mousedown="onDragStart"></div>
        <div v-if="showFilePanel" :class="['right-content']" :style="{ width: rightWidth + 'px', height: '100%' }">
          <div style="width: 100%; height: 100%">
            <SsoFile :manage="isManage" />
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { useRoute } from 'vue-router'
import { extractData } from '/@/utils/bdc/bdc'
import { isJsonData } from "/@/utils/form/commonUtils"
import QlrList from '/@/views/bdc/pages/qlr/QlrList.vue'
import { getMultipleRef } from "/@/views/bdc/public/bdc"
import { cModal } from "/@/components/cModal/index"
import eventBus from "/@/views/bdc/djlc/eventBus"
import { resetValidateInfos } from "/@/utils/form/wonder1.0.1"
const modules = import.meta.glob('/src/**/*.vue')
const CBtnsVue = defineAsyncComponent(() => import("/@/views/bdc/public/Btns.vue"))
const CRView = defineAsyncComponent(() => import("/@/views/online/report/RView.vue"))
const generateForm = computed(() => {
  return defineAsyncComponent(() => import("/@/views/online/form/GenerateForm.vue"))
})
const LookLpb = defineAsyncComponent(() => import("/@/views/bdc/lpb/index.vue"))
const SsoFile = defineAsyncComponent(() => import("/@/views/system/ssofile/index.vue"))
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
let formContent = ref()
// 容器的宽度
let containerWidth = 0
let leftWidth = ref<any>(500)
let rightWidth = ref<any>(0)
// 权利人
let qlr = ref<any>('')
// 节点名称
let jdmc = ref<any>('')
// 是否显示权利人
let showQlr = ref<boolean>(true)
// 预览附件
let previewFile = ref<boolean>(false)
// 展示附件模块
let showFilePanel = ref<boolean>(false)
// 是否默认展示管理状态
let isManage = ref<boolean>(false)
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
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
  getFormConfig()
  initBusEvent()
  resetValidateInfos()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  removeBusEvent()
})

function initBusEvent() {
  eventBus.on('onChangeQlr', onChangeQlrShow)
  eventBus.on('previewFile', onPreviewFile)
  eventBus.on('showFile', onShowFile)
}

function removeBusEvent() {
  eventBus.off('onChangeQlr', onChangeQlrShow)
  eventBus.off('previewFile', onPreviewFile)
  eventBus.off('showFile', onShowFile)
}

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
  let taskId = route.query.taskId
  defHttp.get({ url: api.getFlowConfig, params: { slbh: slbh, jdid: jdid, taskId: taskId } }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {
      formConfig.value = res.result
      Object.keys(btnList.value).forEach((key) => {
        btnList.value[key] = formConfig.value?.btnList.filter(btn => btn.anwz == key) || []
      })
      formBtnList.value = formConfig.value?.btnList.filter(btn => btn.anwz == 'form') || []
      formList.value = formConfig.value?.vueList || []
      jdmc.value = formConfig.value.jdmc || '收件'
      let qlrxx = Array.isArray(formConfig.value.qlrxx) ? formConfig.value.qlrxx : [formConfig.value.qlrxx]
      qlr.value = formConfig.value.qlrxx ? qlrxx : []
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
    // 修正非 JSON 格式字符串
    let correctedBz = btn.bz
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // 键名加双引号
      .replace(/'/g, '"'); // 单引号变双引号
    let params = btn.bz ? (isJsonData(correctedBz) ? JSON.parse(correctedBz) : correctedBz) : ''
    let _params = `(demoRefs,spinning${params ? (',' + JSON.stringify(params)) : params})`
    await eval(`${btn.funName}` + _params)
  }
}

/**数据提取 start */
let eType = ref('')
let formId = ref('0')
/**
 * 数据提取通用弹框接口
 * @param demoRefs 
 * @param spinning 
 * @param params 
 */
function openList(demoRefs, spinning, params?: any) {
  const { vtype, reportId } = params
  eType.value = vtype != undefined ? vtype : ''
  formId.value = reportId != undefined ? reportId : ''
  open.value = true
}
// ref实例
let dataForm = ref()
/**
 * 数据提取的保存方法
 */
function handleOk() {
  if (dataForm.value) {
    if (dataForm.value.handleOk != undefined) {
      dataForm.value.handleOk()
    } else {
      dataForm.value.$.exposed.createCase()
    }
  }
}
/**
 * 关闭弹窗
 */
function onClose() {
  open.value = false
}
let reload = ref("")
/**
 * 刷新
 */
function onReload(obj: any) {
  obj.open = open
  obj.reload = reload
  extractData(obj)
}
/**数据提取 end */
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
    }
  }
}

/**
 * 开始拖拽
 * @param event
 */
function onDragStart(event) {
  previewFile.value = false
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

/**
 * 表单权利人是否显示
 * @param value
 */
function onChangeQlrShow(value) {
  showQlr.value = value.show
}

/**
 * 预览附件，操作附件模块宽度自动增大
 * @param value
 */
function onPreviewFile(value) {
  if (value) {
    previewFile.value = true
    if (rightWidth.value < 900) {
      rightWidth.value = 900
      leftWidth.value = containerWidth - 910
    }

  } else {
    previewFile.value = false
    rightWidth.value = 350
    leftWidth.value = containerWidth - 360
  }
}

/**
 * 是否展示附件模块
 * @param value
 */
function onShowFile(manage) {
  if (!showFilePanel.value) {
    rightWidth.value = 350
    leftWidth.value = containerWidth - 360
  } else {
    rightWidth.value = 0
    leftWidth.value = containerWidth - 10
  }
  showFilePanel.value = !showFilePanel.value
  isManage.value = manage
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

.open-Content {
  // transition: all 0.35s ease-in-out;
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