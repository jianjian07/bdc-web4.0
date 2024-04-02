import { ConfigEnv, UserConfig, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();

  const env = loadEnv(mode, root);
  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_GLOB_API_URL } = env;
  return {
    base: VITE_PUBLIC_PATH,
    server: {
      port: Number(VITE_PORT),
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: VITE_GLOB_API_URL,// 代理的目标地址
          changeOrigin: true,// 开启跨域
          rewrite: path => path.replace(/^\/api/, '')// 路由重写
        },
        '/magicapi': {
          target: VITE_GLOB_API_URL,// 代理的目标地址
          changeOrigin: true,// 开启跨域
          rewrite: path => path.replace(/^\/magicapi/, '')// 路由重写
        }
      }
    },
    resolve: {
      alias: {
        "vue": "vue/dist/vue.esm-bundler.js",
        '/@/': pathResolve('src') + '/',
        '/#/': pathResolve('types') + '/',
      },
    },
    plugins: [vue()],
  }
}
function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}