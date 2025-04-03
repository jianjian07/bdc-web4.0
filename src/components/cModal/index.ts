import CommonModal from '/@/components/cModal/index.vue'
import { createApp } from "vue"
import { registerGlobComp } from "/@/components/registerGlobComp"
import formImagining from 'form-imagining'
import { cModalModel } from "/@/components/cModal/model"
import { router } from "/@/router";

export function cModal (options?: cModalModel) {
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

  app = createApp(CommonModal, { ...options });
  registerGlobComp(app)
  app.use(router)
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
  function update(options?: cModalModel) {
    if (instance) {
      instance.update(options)
    }
  }

  // 销毁dom
  function destroy() {
    close()
    setTimeout(() => {
      instance = app.unmount()
    },200)
  }

  return {
    setConfirmLoading,
    show,
    close,
    destroy,
    update
  }
}



