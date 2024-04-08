// export function a(){
// alert(1)
// }
import { App } from "vue";
import SvgIcon from './SvgIcon.vue'
// App
export function createSvg(app: App<Element>) {
  app.component("svg-icon",SvgIcon)
  // app.use(router);
}  