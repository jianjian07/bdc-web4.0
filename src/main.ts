import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerGlobComp } from './components/registerGlobComp'

import { setupStore } from './store';
import { router, setupRouter } from './router';
import { setupRouterGuard } from './router/guard';
import { initGlobalSetting } from './settings/initSetting';
import checkTimeout from '/@/utils/sysUtil'
import formImagining from 'form-imagining'
import 'form-imagining/dist/style.css'
import 'ant-design-vue/dist/reset.css';
import 'element-plus/theme-chalk/index.css';
import 'virtual:svg-icons-register'; // 引入svg icon注册脚本
// createApp(App).mount('#app')
async function bootstrap() {
    const app = createApp(App)
    // 定义弹窗中自己的动态组件加载
    const modules = import.meta.glob('/src/**/*.vue');
    // 提供 `modules` 让 A 组件内部使用
    app.provide('projModules', modules);
    // 配置存储 先挂载pinna实例
    setupStore(app)
    // 注册全局
    registerGlobComp(app)
    // 加载全局配置
    initGlobalSetting()
    // 配置路由
    setupRouter(app)
    // 路由保护
    setupRouterGuard(router)
    // 定时器(长时间不操作退出)
    checkTimeout()
    app.use(formImagining)
    app.mount('#app', true)
}
bootstrap()