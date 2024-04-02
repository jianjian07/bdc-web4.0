import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import { registerGlobComp } from './components/registerGlobComp'
import 'ant-design-vue/dist/reset.css';
// createApp(App).mount('#app')
async function bootstrap() {
    const app = createApp(App)
    // 注册全局
    registerGlobComp(app)
    app.mount('#app', true)
}
bootstrap()