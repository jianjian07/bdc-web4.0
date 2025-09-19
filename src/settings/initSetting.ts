import { ProjectConfig } from "/#/config"
import { Persistent } from "/@/utils/cache/persistent"
import { PROJ_CFG_KEY } from "/@/enums/cacheEnum"
import { deepMerge } from "/@/utils"
import projectSetting from "/@/settings/projectSetting"
import { useAppStoreWithOut } from "/@/store/modules/app"
import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import { decryptAES } from "/@/utils/cipher.ts"
import { usePermissionStore } from "/@/store/modules/permission.ts"

/**
 * 初始化全局配置
 */
export function initGlobalSetting() {
  const appStore = useAppStoreWithOut();
  let config: ProjectConfig = Persistent.getLocal(PROJ_CFG_KEY) as ProjectConfig;
  config = deepMerge(projectSetting, config || {});
  appStore.setProjectConfig(config);
}

export function initShowCreateBtnByLicense() {
  let license = window.settingConfig?.license;
  let showCreateBtn = license ? decryptAES(license) === 'COMPANY_LICENSE' : false;
  const permissionStore = usePermissionStore()
  permissionStore.setShowCreateBtn(showCreateBtn)
}

/**
 * 检查是否为默哀日
 */
export function checkAndApplyMemorialEffect() {
  // 默哀日
  const memorialDays = window.settingConfig.memorialDays || ['04-04', '05-12', '07-07', '09-18', '11-30', '12-13'];
  const today = getTodayKey()
  if (memorialDays.includes(today)) {
    applyMemorialEffect()
  }
}

/**
 * 应用哀悼黑白主题
 */
function applyMemorialEffect() {
  const appElement = document.body
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
  const appElement = document.body
  if (appElement.classList.contains('black-white-app')) {
    appElement.classList.remove('black-white-app')
  } else {
    appElement.classList.add('black-white-app')
  }
  message.info('主题已切换!')
}

/**
 * 读取nacos配置
 */
export function fetchNacosConfig() {
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

/**
 * 获取全局字体大小
 */
export function getGlobalFontSize() {
    const raw = window?.settingConfig?.fontSize;
    const size = raw !== null && raw !== '' && !isNaN(Number(raw))
      ? Number(raw)
      : 13;
    return size;
}
