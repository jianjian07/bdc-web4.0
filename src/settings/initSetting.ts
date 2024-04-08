import { ProjectConfig } from "/#/config"
import { Persistent } from "/@/utils/cache/persistent"
import { PROJ_CFG_KEY } from "/@/enums/cacheEnum"
import { deepMerge } from "/@/utils"
import projectSetting from "/@/settings/projectSetting"
import { useAppStore } from "/@/store/modules/app"

/**
 * 初始化全局配置
 */
export function initGlobalSetting() {
  const appStore = useAppStore();
  let config: ProjectConfig = Persistent.getLocal(PROJ_CFG_KEY) as ProjectConfig;
  config = deepMerge(projectSetting, config || {});
  appStore.setProjectConfig(config);
}
