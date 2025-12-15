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
import { useThemeSetting } from "/@/hooks/setting/useThemeSetting.ts"
import { useUserStoreWithOut } from "/@/store/modules/user"

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
  const { getTheme, toggleTheme } = useThemeSetting();
  const theme = getTheme.value
  const memorialDays = window.settingConfig?.memorialDays || ['04-04', '05-12', '07-07', '09-18', '11-30', '12-13'];
  const today = getTodayKey()
  const isMemorialDay = memorialDays.includes(today)
  const userStore = useUserStoreWithOut()
  // 主题是全局配置
  if (isMemorialDay) {
    const userChoiceDate = userStore.getMemorialUserChoiceDate
    const userOverrodeToday = userChoiceDate === today

    // 当天首次进入（未手动覆盖）时，强制使用黑白主题；之后尊重当日用户选择
    if (!userOverrodeToday && theme !== 'memorial') {
      toggleTheme()
    }

    // 根据当前主题应用/移除效果
    if (theme === 'memorial') {
      applyMemorialEffect()
    } else {
      removeMemorialEffect()
    }
  } else {
    // 非默哀日清除当日覆盖标记，并按主题应用效果
    userStore.setMemorialUserChoiceDate('')
    if (theme === 'memorial') {
      applyMemorialEffect()
    } else {
      removeMemorialEffect()
    }
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
 * 取消应用哀悼黑白主题
 */
function removeMemorialEffect() {
  const appElement = document.body
  if (appElement.classList.contains('black-white-app')) {
    appElement.classList.remove('black-white-app')
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
  const { toggleTheme } = useThemeSetting();
  const userStore = useUserStoreWithOut()
  toggleTheme()
  const appElement = document.body
  if (appElement.classList.contains('black-white-app')) {
    appElement.classList.remove('black-white-app')
  } else {
    appElement.classList.add('black-white-app')
  }
  // 如果今天是默哀日，记录“当日已由用户手动选择”，避免刷新后再次被强制为黑白
  const memorialDays = window.settingConfig?.memorialDays || ['04-04', '05-12', '07-07', '09-18', '11-30', '12-13'];
  const today = getTodayKey()
  if (memorialDays.includes(today)) {
    userStore.setMemorialUserChoiceDate(today)
  }
  message.info('主题已切换!')
}

/**
 * 读取nacos配置
 */
export function fetchNacosConfig() {
  return new Promise(async (resolve) => {
    let nacosToken = await getNacosToken()
    //let nacosToken = ''
    defHttp.get({
      url: '/nacos/v1/cs/configs?dataId=bdc.json&group=DEFAULT_GROUP&tenant=public&accessToken=' + nacosToken,
      // responseType: 'json',
      // headers: {
      //     'Content-Type': 'application/json;charset=UTF-8'
      // }
    }, { withToken: false }).then((res) => {
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
 * 获取nacos token
 */
function getNacosToken() {
  return new Promise(async (resolve) => {
    let result: any = await getSettingJson()
    if (result && result.nacosUser && result.nacosPwd) {
      let params = {
        username: result.nacosUser,
        password: result.nacosPwd
      }
      let url = '/api/zrzy-system/api/v1/auth/getNacosToken'
      defHttp.get({ url: url, params: params }, { withToken: false }).then((res) => {
        if (res && res.success) {
          resolve(res.result)
        } else {
          resolve('')
        }
      })
    }
  })
}

/**
 * 获取全局配置
 */
function getSettingJson() {
  return new Promise((resolve) => {
    defHttp.get({ url: '/setting.json?t=' + Date.now() }, { withToken: false }).then((res) => {
      resolve(res)
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
