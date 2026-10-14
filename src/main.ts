import { createApp } from 'vue'
import './style.css'
import '/@/assets/less/base.less'
import App from './App.vue'
import { registerGlobComp } from './components/registerGlobComp'

import { setupStore } from './store';
import { router, setupRouter } from './router';
import { setupRouterGuard } from './router/guard';
import { fetchNacosConfig, getGlobalFontSize, initGlobalSetting } from './settings/initSetting'
import checkTimeout from './utils/lockUtil'
import formImagining from 'form-imagining'
import 'form-imagining/dist/style.css'
import bpmDesigner from 'bpm-designer'
import 'bpm-designer/dist/bpm-designer.css'
import 'ant-design-vue/dist/reset.css';
import 'virtual:svg-icons-register'; // 引入svg icon注册脚本

import setDirectives from './directives/index'
import { registerUploadAttachmentModule } from "/@/components/common/wangEditor/upload-attachment.ts"
import { registerImageModule } from "/@/components/common/wangEditor/image-attachment.ts"
import { refreshAccessToken } from "/@/utils/http/axios/axios"

async function bootstrap() {
  // 加载nacos配置
  await fetchNacosConfig()
  const app = createApp(App)
  // 定义弹窗中自己的动态组件加载
  const modules = import.meta.glob('/src/**/*.vue');
  const fontSize = getGlobalFontSize()
  const configTheme: any = {
    token: {
      colorPrimary: '#5094F9',
      colorPrimaryBg: '#cae8ff',
      fontSize: fontSize
    },
  }
  // 提供 `modules` 让 A 组件内部使用
  app.provide('projModules', modules);
  app.provide('appTheme', configTheme);
  // 注册自定义图片
  registerImageModule()
  // 注册富文本组件附件上传按钮
  registerUploadAttachmentModule()
  // 配置存储 先挂载pinna实例
  setupStore(app);
  // 暴露全局 token 刷新钩子：供 form-imagining 等独立子包在 token 过期时
  // 复用主应用的「单飞刷新 + token 旋转」逻辑，避免子包各自刷新互相作废 refreshToken
  (window as any).__bdcRefreshToken__ = refreshAccessToken
  // 注册全局
  registerGlobComp(app)
  // 加载全局配置
  initGlobalSetting()
  // 配置路由
  await setupRouter(app)
  // 路由保护
  setupRouterGuard(router)
  // 定时器(长时间不操作退出)
  checkTimeout()
  app.use(formImagining)
  app.use(bpmDesigner)
  app.use(setDirectives)
  app.mount('#app', true)
}
bootstrap()
