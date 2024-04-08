import { CacheTypeEnum } from "../enums/cacheEnum";
import { ProjectConfig } from "/#/config"

// ! 改动后需要清空浏览器缓存
const setting: ProjectConfig = {
  // 权限缓存存放位置。默认存放于localStorage
  permissionCacheType: CacheTypeEnum.LOCAL,
  // 标签页
  multiTabsSetting: true,
  // 菜单
  menuSetting: {
    collapsed: false
  }
}

export default setting;
