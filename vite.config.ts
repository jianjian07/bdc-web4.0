import { ConfigEnv, UserConfig, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import viteCompression from 'vite-plugin-compression';
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();

  const env = loadEnv(mode, root);
  const { VITE_PORT, VITE_PUBLIC_PATH, VITE_GLOB_API_URL, VITE_GLOB_TYYW_API_URL,  VITE_GLOB_NACOS_API_URL  } = env;
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
        },
        '/nacos': {
          target: VITE_GLOB_NACOS_API_URL,// 代理的目标地址
          changeOrigin: true,// 开启跨域
          rewrite: path => path.replace(/^\/nacos/, '/nacos')// 路由重写
        },
        '/imaginform': {
          target: env.VITE_GLOB_API_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/imaginform/, '')
        },
        '/tyyw': {
          target: VITE_GLOB_TYYW_API_URL,// 代理的目标地址
          changeOrigin: true,// 开启跨域
          rewrite: path => path.replace(/^\/tyyw/, '')// 路由重写
        }
      }
    },
    resolve: {
      alias: {
        "vue": "vue/dist/vue.esm-bundler.js",
        '/@/': pathResolve('src') + '/',
        '/#/': pathResolve('types') + '/',
      }
    },
    plugins: [
      createSvgIconsPlugin({
        // svg所在文件夹位置
        iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
        symbolId: 'icon-[name]',
      }),
      viteCompression({
        algorithm: 'gzip',   // 使用 gzip 压缩
        ext: '.gz',          // 压缩后的文件扩展名
        threshold: 10240,    // 只有超过 10KB 的文件才会被压缩
        deleteOriginFile: false, // 是否删除未压缩的文件（慎用）
      }),
      vue()],
  }
}
function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}