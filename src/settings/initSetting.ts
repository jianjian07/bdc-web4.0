import { ProjectConfig } from "/#/config"
import { Persistent } from "/@/utils/cache/persistent"
import { PROJ_CFG_KEY } from "/@/enums/cacheEnum"
import { deepMerge } from "/@/utils"
import projectSetting from "/@/settings/projectSetting"
import { useAppStore } from "/@/store/modules/app"
import { message } from "ant-design-vue"
// 默哀日
const memorialDays = ['04-04', '05-19', '07-07', '09-18', '11-30', '12-13']; 

/**
 * 初始化全局配置
 */
export function initGlobalSetting() {
  const appStore = useAppStore();
  let config: ProjectConfig = Persistent.getLocal(PROJ_CFG_KEY) as ProjectConfig;
  config = deepMerge(projectSetting, config || {});
  appStore.setProjectConfig(config);
}

/**
 * 检查是否为默哀日
 */
export function checkAndApplyMemorialEffect() {
  const today = getTodayKey()
  if (memorialDays.includes(today)) {
    applyMemorialEffect()
  }
}

/**
 * 应用哀悼黑白主题
 */
function applyMemorialEffect() {
  const appElement = document.querySelector('#app')
  if (!appElement.classList.contains('black-white-app')) {
    appElement.classList.add('black-white-app')
  }
}

/**
 * 获取今日日期 MM-DD
 */
function getTodayKey() {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${mm}-${dd}`
}

/**
 * 切换(哀悼)黑白主题
 */
export function toggleBlackWhite() {
  const appElement = document.querySelector('#app')
  if (appElement.classList.contains('black-white-app')) {
    appElement.classList.remove('black-white-app')
  } else {
    appElement.classList.add('black-white-app')
  }
  message.info('主题已切换!')
}
