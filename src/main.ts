import { createApp } from 'vue'
import './style.css'
import '/@/assets/less/base.less'
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
import 'virtual:svg-icons-register'; // 引入svg icon注册脚本

import setDirectives from './directives/index'
import { defHttp } from "/@/utils/http/axios"

/**
 * 读取nacos配置
 */
function fetchNacosConfig() {
    return new Promise((resolve) => {
        defHttp.get({ 
            url: '/nacos/v1/cs/configs?dataId=bdc.json&group=DEFAULT_GROUP&tenant=public',
            responseType: 'json',
            headers: { 
                'Content-Type': 'application/json;charset=UTF-8'
            }
        }, { withToken: true }).then((res) => {
            if (res) {
                window.settingConfig = res
                if (window.settingConfig.appTitle) {
                    document.title = window.settingConfig.appTitle;
                }
            } else {
                alert('nacos配置读取失败！')
            }
            resolve(true)
        })
    })
}

async function bootstrap() {
    // 加载nacos配置
    await fetchNacosConfig()
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
    await setupRouter(app)
    // 路由保护
    setupRouterGuard(router)
    // 定时器(长时间不操作退出)
    checkTimeout()
    app.use(formImagining)
    app.use(setDirectives)
    app.mount('#app', true)
}
bootstrap()
