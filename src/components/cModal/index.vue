<template>
  <a-config-provider :locale="zhCN">
    <a-modal class="commonModal" v-model:open="modalVisible" :width="(isFullScreen || fullScreen) ? '100%' : width"
      :wrap-class-name="(fullScreen || isFullScreen) ? 'full-common-modal' : ''" :confirmLoading="confirmLoading" :maskClosable="false"
      v-bind="footerBind">
      <template #title>
        {{ title }}
        <div v-if="!isFullScreen" class="fullscreen-custom" @click="handleFullscreen">
          <FullscreenExitOutlined v-if="fullScreen" />
          <FullscreenOutlined v-else />
        </div>
      </template>
      <template #footer>
        <div :style="footerStyle">
          <a-button @click="handleClose">{{ cancelText }}</a-button>
          <a-button type="primary" @click="handleOk">{{ okText }}</a-button>
        </div>
      </template>
      <Suspense v-if="isFinish">
        <component v-bind:is="component" :formData="formData" ref="link"></component>
      </Suspense>
    </a-modal>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref, defineExpose, defineProps } from "vue"
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
const modules = import.meta.glob('/src/**/*.vue')
// 是否显示弹窗
let modalVisible = ref<boolean>(false)
// 弹窗loading
let confirmLoading = ref<boolean>(false)
// 子组件
let link = ref()
// 是否全屏
let fullScreen = ref<boolean>(false)
let isFinish = ref(false)
const component = computed(() => {
  return defineAsyncComponent(modules[`/src/${props.filePath}.vue`]);
});

const props = defineProps({
  title: {
    type: String,
    default: '标题'
  },
  width: {
    type: [String, Number],
    default: 520
  },
  filePath: {
    type: String,
    default: 'components/wonderform/free/PreviewDemo'
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
  close
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
function handleOk() {
  if (props.onOk && typeof props.onOk === "function") {
    let childDom = link.value
    props.onOk(childDom)
    // 自己在方法里面执行关闭按钮操作
  } else {
    modalVisible.value = false
  }
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
    modalVisible.value = false
  }
}

/**
 * 调用显示
 */
function show() {
  modalVisible.value = true
}

/**
 * 调用关闭
 */
function close() {
  modalVisible.value = false
}

/**
 * 全屏
 */
function handleFullscreen() {
  fullScreen.value = !fullScreen.value
}

</script>

<style lang="less" scoped>
.commonModal {
  .fullscreen-custom {
    position: absolute;
    cursor: pointer;
    top: 17px;
    right: 56px;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.45);

    &:hover {
      color: rgba(0, 0, 0, 0.75);
    }
  }
}
</style>
<style lang="less">
.full-common-modal {

  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh)!important;
  }

  .ant-modal-body {
    flex: 1;
    overflow: auto;
  }
}
</style>
