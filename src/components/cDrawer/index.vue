<template>
  <a-config-provider :locale="zhCN">
    <a-drawer class="commonDrawer" v-model:open="drawerVisible" :width="(isFullScreen || fullScreen) ? '100%' : width"
              :root-class-name="(fullScreen || isFullScreen) ? `full-common-drawer ${wrapClassName || ''}` : (wrapClassName || '')"
              :confirmLoading="confirmLoading" :maskClosable="maskClosable"  @cancel="handleClose"
              v-bind="footerBind"
    >
      <template #title>
        <div v-if="!isFullScreen" class="fullscreen-custom" @click="handleFullscreen">
          <FullscreenExitOutlined v-if="fullScreen"/>
          <FullscreenOutlined v-else/>
        </div>
      </template>
      
      <template v-if="footer" #footer>
        <div :style="footerStyle">
          <a-space>
            <a-button v-if="isDefaultBtn" @click="handleClose">{{ cancelText }}</a-button>
            <template v-for="(btn, btnIndex) in footerExtendBtn">
              <a-button :type="btn.type" @click="handleExtendBtn(btn)">{{ btn.name }}</a-button>
            </template>
            <a-button v-if="isDefaultBtn" type="primary" @click="handleOk">{{ okText }}</a-button>
          </a-space>
        </div>
      </template>
      <Suspense v-if="isFinish">
        <template #default>
          <component v-bind:is="component" :formData="formData" ref="link"></component>
        </template>
        <template #fallback>
          <a-spin tip="Loading...">
            <div style="min-height: 200px"></div>
          </a-spin>
        </template>
      </Suspense>
    </a-drawer>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from "ant-design-vue/es/locale/zh_CN"
import { computed, defineAsyncComponent, onMounted, ref } from "vue"
import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons-vue"
const modules = import.meta.glob('/src/**/*.vue')
// 是否显示抽屉弹窗
let drawerVisible = ref<boolean>(false)
// 弹窗loading
let confirmLoading = ref<boolean>(false)
// 子组件
let link = ref()
// 是否全屏
let fullScreen = ref<boolean>(false)
// 组件是否加载完成
let isFinish = ref(false)
const component = computed(() => {
  return defineAsyncComponent(modules[`/src/${props.filePath}.vue`]);
});

let props = defineProps({
  title: {
    type: String,
    default: '标题'
  },
  width: {
    type: [String, Number],
    default: 520
  },
  height: {
    type: [String, Number],
    default: 0
  },
  filePath: {
    type: String,
    default: ''
  },
  isFullScreen: {
    type: Boolean,
    default: false
  },
  formData: {
    type: [Object, String, Number, Array]
  },
  okText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  onOk: {
    type: Function,
    default: null
  },
  onCancel: {
    type: Function,
    default: null
  },
  footer: {
    type: Boolean,
    default: true
  },
  footerStyle: {
    type: Object,
    default: () => {
      return {
        'text-align': 'end'
      }
    }
  },
  wrapClassName: {
    type: String,
    default: ''
  },
  footerExtendBtn: {
    type: Array,
    default: []
  },
  isDefaultBtn: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: false
  }
})

// 页脚绑定
const footerBind = computed(() => {
  if (props.footer) {
    return ''
  } else {
    return { footer: null }
  }
})

defineExpose({
  setConfirmLoading,
  show,
  close,
  update
})

onMounted(() => {
  isFinish.value = true
  show()
})

/**
 * 设置loading
 * @param value
 */
function setConfirmLoading(value: boolean) {
  confirmLoading.value = value
}

/**
 * 确定
 */
async function handleOk() {
  if (props.onOk && typeof props.onOk === "function") {
    let childDom = link.value
    let res
    if (childDom && childDom?.rView?.$?.exposed?.exposedEvents?.handleOk) {
      res = await childDom.rView.$.exposed.exposedEvents.handleOk()
      props.onOk(res)
    } else if (childDom && childDom.handleOk) {
      res = await childDom.handleOk()
      props.onOk(res)
    } else {
      props.onOk(childDom)
    }
    // 自己在方法里面执行关闭按钮操作
  } else {
    drawerVisible.value = false
  }
}

/**
 * 点击扩展方法
 */
function handleExtendBtn(btn) {
  let func = btn.func
  if (func && typeof func === 'function') {
    let childDom = link.value
    func(childDom)
  } else {
    drawerVisible.value = false
  }
}

/**
 * 调用显示
 */
function show() {
  drawerVisible.value = true
}

/**
 * 调用关闭
 */
function close() {
  drawerVisible.value = false
}


/**
 * 更新props
 */
function update(newProps) {
  props = deepMerge({ ...props }, newProps);
}

function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) return target;

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * 点击关闭
 */
function handleClose() {
  if (props.onCancel && typeof props.onCancel === "function") {
    let childDom = link.value
    props.onCancel(childDom)
    // 自己在方法里面执行关闭按钮操作
  } else {
    drawerVisible.value = false
  }
}


/**
 * 全屏
 */
function handleFullscreen() {
  fullScreen.value = !fullScreen.value
}
</script>

<style scoped lang="less">
.commonDrawer {
  .fullscreen-custom {
    position: absolute;
    cursor: pointer;
    top: 17px;
    right: 26px;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.45);

    &:hover {
      color: rgba(0, 0, 0, 0.75);
    }
  }
}
</style>
<style lang="less">
.full-common-drawer {

  .ant-drawer {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  //.ant-drawer-content {
  //  display: flex;
  //  flex-direction: column;
  //  height: calc(100vh) !important;
  //}
  //
  //.ant-drawer-body {
  //  flex: 1;
  //  overflow: auto;
  //}
}

.commonDrawer {

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
}
</style>
