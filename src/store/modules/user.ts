import type { LoginInfo, UserInfo } from '/#/store'
// import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia'
import { store } from '/@/store'
// import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum'
import {
  APP_LOCAL_CACHE_KEY,
  APP_SESSION_CACHE_KEY,
  CATEGORY_DATA_KEY,
  DB_DICT_DATA_KEY,
  IGS_INFO,
  LAST_OPERATE_TIME,
  LOCK_STATUS,
  LOGIN_INFO_KEY,
  TENANT_ID,
  TOKEN_KEY,
  USER_INFO_KEY,
  VALIDATE_RULE_DATA_KEY
} from '/@/enums/cacheEnum'
import { getAuthCache, removeAuthCache, setAuthCache } from '/@/utils/auth'
import { GetUserInfoModel, LoginParams } from '/@/api/sys/model/userModel'
import { doLogout, getUserInfo, licence, login_tyyw, loginApi } from '/@/api/sys/user'
import { router } from '../../router'
import { usePermissionStore } from '/@/store/modules/permission'
import { RouteRecordRaw } from 'vue-router'
import { PAGE_NOT_FOUND_ROUTE } from '../../router/routes/basic'
import { Modal, notification } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { createVNode } from 'vue'
import { getDict, getRuleList } from "/@/api/sys/dict"
// import { useGlobSetting } from '/@/hooks/setting';
// import { useSso } from '/@/hooks/web/useSso';

interface UserState {
  userInfo: Nullable<UserInfo>;
  token?: string;
  //   roleList: RoleEnum[];
  // 数据字典,
  dicts?: any[];
  // 分类字典
  category?: any[];
  // 校验规则列表
  validateRuleList?: any[];
  // 编码规则列表
  codeRuleList?: any[];
  // 数据规则列表
  dataRuleList?: any[];
  // 其他(api)规则列表
  apiRuleList?: any[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
  tenantid?: string | number;
  loginInfo?: Nullable<LoginInfo>;
  igsInfo?: [],
  menuIndex?: number,
  licence?: string,
  // 是否移交（发送弹窗）
  saveFormFlag?: boolean,
  lastOperateTime?: number,
  isLocked?: string
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // 用户信息
    userInfo: null,
    // token
    token: undefined,
    // 角色列表
    // roleList: [],
    // 数据字典,
    dicts: [],
    // 分类字典
    category: [],
    // 规则列表
    validateRuleList: [],
    // 编码规则列表
    codeRuleList: [],
    // 数据规则列表
    dataRuleList: [],
    // 其他(API)规则列表
    apiRuleList: [],
    // session过期时间
    sessionTimeout: false,
    // 上次获取时间
    lastUpdateTime: 0,
    //租户id
    tenantid: '',
    //登录返回信息
    loginInfo: null,
    igsInfo: [],
    menuIndex: -1,
    licence: '',
    // 是否移交（发送弹窗）
    saveFormFlag: true,
    // 上次操作时间(用于离开锁定)
    lastOperateTime: new Date().getTime(),
    // 是否锁屏
    isLocked: false
  }),
  getters: {
    getUserInfo(): UserInfo {
      return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getLoginInfo(): LoginInfo {
      return this.loginInfo || getAuthCache<LoginInfo>(LOGIN_INFO_KEY) || {};
    },
    getToken(): string {
      return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    getIsLocked(): string {
      // 这里得直接用localstorage
      return this.isLocked || localStorage.getItem(LOCK_STATUS)
    },
    getAllDicts(): [] {
      return this.dicts || getAuthCache(DB_DICT_DATA_KEY);
    },
    getAllCategory(): [] {
      return this.category || getAuthCache(CATEGORY_DATA_KEY)
    },
    getValidateRuleList(): [] {
      return this.validateRuleList || getAuthCache(VALIDATE_RULE_DATA_KEY)
    },
    getCodeRuleList(): [] {
      return this.codeRuleList
    },
    getDataRuleList(): [] {
      return this.dataRuleList
    },
    getApiRuleList(): [] {
      return this.apiRuleList
    },
    // getRoleList(): RoleEnum[] {
    //   return this.roleList.length > 0 ? this.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    // },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
    getTenant(): string | number {
      return this.tenantid || getAuthCache<string | number>(TENANT_ID);
    },
    getIgsInfo(): [] {
      return this.igsInfo || getAuthCache(IGS_INFO);
    },
    getMenuIndex(): number {
      return this.menuIndex || 0;
    },
    getLicence(): string {
      return this.licence || '';
    },
    getLastOperateTime(): number {
      return this.lastOperateTime || getAuthCache(LAST_OPERATE_TIME) || this.getAppCommonLocal(LAST_OPERATE_TIME) || this.getAppCommonSession(LAST_OPERATE_TIME)
    },
    getSaveFormFlag(): boolean {
      return this.saveFormFlag
    }
  },
  actions: {
    setIgsList(list: any) {
      this.igsInfo = list;
      setAuthCache(IGS_INFO, list);
    },
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
      // setCookie(TOKEN_KEY, info)//存储localStorage的同时，也存储一个cookie来监听
    },
    // setRoleList(roleList: RoleEnum[]) {
    //   this.roleList = roleList;
    //   setAuthCache(ROLES_KEY, roleList);
    // },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      console.log('this.lastUpdateTime', this.lastUpdateTime)
      setAuthCache(USER_INFO_KEY, info);
    },
    setLoginInfo(info: LoginInfo | null) {
      this.loginInfo = info;
      setAuthCache(LOGIN_INFO_KEY, info);
    },
    setAllDicts(dicts: any) {
      this.dicts = dicts;
      setAuthCache(DB_DICT_DATA_KEY, dicts);
    },
    setAllCategory(dicts: any) {
      this.category = dicts
      setAuthCache(CATEGORY_DATA_KEY, dicts);
    },
    setValidateRuleList(rules: any) {
      this.validateRuleList = rules
      setAuthCache(VALIDATE_RULE_DATA_KEY, rules);
    },
    setCodeRuleList(rules: any) {
      this.codeRuleList = rules
    },
    setDataRuleList(rules: any) {
      this.dataRuleList = rules
    },
    setApiRuleList(rules: any) {
      this.apiRuleList = rules
    },
    setTenant(id: any) {
      this.tenantid = id;
      setAuthCache(TENANT_ID, id);
      //update-begin---author:liusq  Date:20220102  for：保存用户租户id----
      // @ts-ignore
      setAuthCache(this.userInfo.username, id);
      //update-end---author:liusq  Date:20220102  for：保存用户租户id----
    },
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    setMenuIndex(menuIndex: number) {
      this.menuIndex = menuIndex;
    },
    setLicence(licence: string) {
      this.licence = licence;
    },
    setLastOperateTime(lastOperateTime: number) {
      this.lastOperateTime = lastOperateTime
      setAuthCache(LAST_OPERATE_TIME, lastOperateTime);
    },
    setSaveFormFlag(bool: boolean) {
      this.saveFormFlag = bool
    },
    lockScreen() {
      this.isLocked = 'true'
      localStorage.setItem(LOCK_STATUS, 'true')
    },
    unLockScreen(inputPassword: string): boolean {
      if (inputPassword == this.getLoginInfo.userpwd) {
        this.isLocked = 'false'
        this.setLastOperateTime(new Date().getTime())
        localStorage.removeItem(LOCK_STATUS)
        return true
      }
      return false
    },
    resetLockState() {
      this.isLocked = 'false'
      localStorage.removeItem(LOCK_STATUS)
    },
    resetState() {
      this.setUserInfo(null);
      this.setToken('');
      this.resetLockState()
      //   this.roleList = [];
      this.sessionTimeout = false;
      this.menuIndex = -1
      this.licence = ''
    },
    formatDictList(newArr: any, parent?: any) {
      let newData = newArr.map((item: any) => {
        item.label = item.dictName
        item.value = item.dictCode
        item.labelplus = item.dictName + '(' + item.dictCode + ')';
        if (parent && !parent.status) {
          item.status = 0
        }
        if (!item.status) {
          item.class = 'option-hidden'
        }
        if (item.children) {
          if (item.children.length == 0) {
            delete item.children
          } else {
            item.children = this.formatDictList(item.children, item)
          }
        }
        return item
      })
      return newData
    },
    /**
     * 登录事件
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
      }
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, ...loginParams } = params;
        const data: any = await loginApi(loginParams);
        // const data: any = {
        //   username: params.username,
        //   token: 'Bearer' + ' 789456'
        // }
        if (data && data.message) {
          return Promise.reject(data);
        }
        const { token } = data;
        // save token
        this.setToken(token);
        return this.afterLoginAction(goHome, data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async login_tyyw(
      params: LoginParams & {
        goHome?: boolean;
      }
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, ...loginParams } = params;
        const data: any = await login_tyyw(loginParams);
        if (data && data.message) {
          return Promise.reject(data);
        }
        const { token } = data;
        // save token
        this.setToken(token);
        notification.success({
          message: "登录提示",
          description: "欢迎回来",
          duration: 3, //超时时间
        });
        return this.afterLoginAction(goHome, data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    /**
     * 扫码登录事件
     */
    async qrCodeLogin(token: string): Promise<GetUserInfoModel | null> {
      try {
        // save token
        this.setToken(token);
        return this.afterLoginAction(true, {});
      } catch (error) {
        return Promise.reject(error);
      }
    },
     /**
     * 获取localStorage
     */
    getAppCommonLocal(key: string) {
      if (localStorage[`CC__${APP_LOCAL_CACHE_KEY}`] && this.isJsonData(localStorage[`CC__${APP_LOCAL_CACHE_KEY}`])) {
        let ls = JSON.parse(localStorage[`CC__${APP_LOCAL_CACHE_KEY}`]).value
        return ls[key]?.value
      } else {
        return undefined
      }
    },
    /**
     * 获取sessionStorage
     */
    getAppCommonSession(key: string) {
      if (sessionStorage[`CC__${APP_SESSION_CACHE_KEY}`] && this.isJsonData(sessionStorage[`CC__${APP_SESSION_CACHE_KEY}`])) {
        let ls = JSON.parse(sessionStorage[`CC__${APP_SESSION_CACHE_KEY}`]).value
        return ls[key]?.value
      } else {
        return undefined
      }
    },
    /**
     * 判断是否是json数据
     * @param str
     */
    isJsonData(str) {
      if (typeof str === "string") {
        try {
          let obj = JSON.parse(str)
          if (obj && typeof obj === "object") {
            return true
          } else {
            return false
          }
        } catch (e) {
          console.log("$isJSON error：", e)
          return false
        }
      } else {
        return false
      }
    },
    /**
     * 登录完成处理
     * @param goHome
     */
    async afterLoginAction(goHome?: boolean, data?: any): Promise<any | null> {
      if (!this.getToken) return null;
      //获取用户信息

      const userInfo = await this.getUserInfoAction();
      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        if (!permissionStore.isDynamicAddedRoute) {
          const routes = await permissionStore.buildRoutesAction();
          routes.forEach((route: unknown) => {
            router.addRoute(route as unknown as RouteRecordRaw);
          });

          router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
          permissionStore.setDynamicAddedRoute(true);
        }
        await this.setLoginInfo(data);

        goHome && (await router.replace((userInfo && userInfo.homePath) || PageEnum.BASE_HOME));
      }
      return data;
    },
    // /**
    //  * 手机号登录
    //  * @param params
    //  */
    // async phoneLogin(
    //   params: LoginParams & {
    //     goHome?: boolean;
    //     mode?: ErrorMessageMode;
    //   }
    // ): Promise<GetUserInfoModel | null> {
    //   try {
    //     const { goHome = true, mode, ...loginParams } = params;
    //     const data = await phoneLoginApi(loginParams, mode);
    //     const { token } = data;
    //     // save token
    //     this.setToken(token);
    //     return this.afterLoginAction(goHome, data);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    /**
     * 获取用户信息
     */
    async getUserInfoAction(): Promise<UserInfo | null> {
      if (!this.getToken) {
        return null;
      }
      console.log('this.getToken', this.getToken)
      const userInfo: any = await getUserInfo();
      if (userInfo) {
        this.setUserInfo(userInfo);
      }
      await getDict()
      // 规则
      getRuleList()
      return userInfo;
    },
    /**
     * 退出登录
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          await doLogout();
        } catch {
          console.log('注销Token失败');
        }
      }
      this.setToken('');
      this.resetLockState()
      // setAuthCache(TOKEN_KEY, null);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      this.setLoginInfo(null);
      this.setMenuIndex(-1)

      //如果开启单点登录,则跳转到单点统一登录中心
      //   const openSso = useGlobSetting().openSso;
      //   if (openSso == 'true') {
      //     await useSso().ssoLoginOut();
      //   }

      goLogin && (await router.push(PageEnum.BASE_LOGIN));
    },
    /**
     * 登录事件
     */
    // async ThirdLogin(
    //   params: ThirdLoginParams & {
    //     goHome?: boolean;
    //     mode?: ErrorMessageMode;
    //   }
    // ): Promise<any | null> {
    //   try {
    //     const { goHome = true, mode, ...ThirdLoginParams } = params;
    //     const data = await thirdLogin(ThirdLoginParams, mode);
    //     const { token } = data;
    //     // save token
    //     this.setToken(token);
    //     return this.afterLoginAction(goHome, data);
    //   } catch (error) {
    //     return Promise.reject(error);
    //   }
    // },
    /**
     * 退出询问
     */
    confirmLoginOut() {
      Modal.confirm({
        title: 'Confirm',
        icon: createVNode(ExclamationCircleOutlined),
        content: '是否确认退出系统？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          await this.logout(true);
        },
      });
      // const { createConfirm } = useMessage();
      // //   const { t } = useI18n();
      // createConfirm({
      //   iconType: 'warning',
      //   title: '温馨提醒',
      //   content: '是否确认退出系统?',
      //   onOk: async () => {
      //     await this.logout(true);
      //   },
      // });
    },
    async licenceAction(): Promise<string | ''> {
      return await licence()
    }
  },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}