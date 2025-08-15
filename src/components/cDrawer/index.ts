import CommonDrawer from '/@/components/cDrawer/index.vue'
import { createApp } from "vue"
import { registerGlobComp } from "/@/components/registerGlobComp"
import formImagining from 'form-imagining'
import { cDrawerModel } from "/@/components/cDrawer/model"
import { getGlobalFontSize } from "/@/settings/initSetting.ts"

let scopeBus = null

export function updateCDrawerScopeBus(value) {
  scopeBus = value
}

export function cDrawer (options?: cDrawerModel) {
  let div: any
  let app: any
  let instance: any

  div = document.createElement('div')
  // 没有传入方法时 无论点击确认或取消都会关闭弹窗
  // 这里是否需要默认关闭摧毁dom?? 默认摧毁
  if (options && !options.onCancel) {
    options.onCancel = () => {
      destroy()
    }
  }

  if (options && !options.onOk) {
    options.onOk = () => {
      destroy()
    }
  }
  
  if (options && options.isDefaultBtn !== false) {
    options.isDefaultBtn = true
  }
  
  // 定义弹窗中自己的动态组件加载 
  const modules = import.meta.glob('/src/**/*.vue');
  const fontSize = getGlobalFontSize()
  const configTheme:any = {
    token: {
      colorPrimary: '#5094F9',
      colorPrimaryBg: '#e6f4ff',
      fontSize: fontSize
    },
  }
  
  app = createApp(CommonDrawer, { ...options });
  app.provide('projModules', modules);
  app.provide('appTheme', configTheme);
  app.provide('scopedEventBus',scopeBus);
  registerGlobComp(app)
  // app.use(router)
  app.use(formImagining)
  instance = app.mount(div);
  
  // 设置弹窗loading
  function setConfirmLoading(value:boolean) {
    if (instance) {
      instance.setConfirmLoading(value)
    }
  }

  // 显示 (如果是关闭了弹窗, 没有销毁dom 可以进行显示)
  function show() {
    if (instance) {
      instance.show()
    }
  }

  // 关闭
  function close() {
    if (instance) {
      instance.close()
    }
  }
  
  // 更新
  function update(options?: cDrawerModel) {
    if (instance) {
      instance.update(options)
    }
  }

  // 销毁dom
  function destroy() {
    close()
    setTimeout(() => {
      instance = app.unmount()
      if (div.parentNode) {
        div.parentNode.removeChild(div)
      }
    },0)
  }

  return {
    setConfirmLoading,
    show,
    close,
    destroy,
    update
  }
}



