import type { UserInfo, LoginInfo } from '/#/store';
// import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia';
import { store } from '/@/store';
// import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import userToken from "../../../public/static/userToken.json"
import {
  ROLES_KEY,
  TOKEN_KEY,
  USER_INFO_KEY,
  SZ_USER_INFO_KEY,
  LOGIN_INFO_KEY,
  DB_DICT_DATA_KEY,
  CATEGORY_DATA_KEY,
  VALIDATE_RULE_DATA_KEY,
  TENANT_ID,
  IGS_INFO
} from '/@/enums/cacheEnum'
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { GetUserInfoModel, LoginParams, ThirdLoginParams } from '/@/api/sys/model/userModel';
import { getUserInfo, licence, loginApi, getSysDict, login_tyyw } from '/@/api/sys/user';
// import { useI18n } from '/@/hooks/web/useI18n';
// import { useMessage } from '/@/hooks/web/useMessage';
import { router } from '../../router';
import { usePermissionStore } from '/@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '../../router/routes/basic';
import { isArray } from '/@/utils/is';
import { Modal, notification } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { createVNode } from 'vue';
import { getCategoryDict, getDataDict, getRuleList } from "/@/api/sys/dict"
// import { useGlobSetting } from '/@/hooks/setting';
// import { useSso } from '/@/hooks/web/useSso';

interface UserState {
  userInfo: Nullable<UserInfo>;
  szUserInfo?: any;
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
  licence?: string
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // 用户信息
    userInfo: null,
    // sz用户信息
    szUserInfo: null,
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
    licence: ''
  }),
  getters: {
    getUserInfo(): UserInfo {
      return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getSzUserInfo(): any {
      return this.szUserInfo || getAuthCache<UserInfo>(SZ_USER_INFO_KEY) || {}
    },
    getLoginInfo(): LoginInfo {
      return this.loginInfo || getAuthCache<LoginInfo>(LOGIN_INFO_KEY) || {};
    },
    getToken(): string {
      return this.token || getAuthCache<string>(TOKEN_KEY);
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
  },
  actions: {
    setIgsList(list: any) {
      this.igsInfo = list;
      setAuthCache(IGS_INFO, list);
    },
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
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
    setSzUserInfo(info: any) {
      this.szUserInfo = info
      setAuthCache(SZ_USER_INFO_KEY, info);
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
    resetState() {
      this.setUserInfo(null);
      this.setSzUserInfo(null);
      this.setToken('');
      //   this.roleList = [];
      this.sessionTimeout = false;
      this.menuIndex = -1
      this.licence = ''
    },
    formatDictList(newArr: any, parent?: any) {
      let newData = newArr.map((item: any) => {
        item.label = item.dictName
        item.value = item.dictCode
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
      // 登录界面不是使用单点登录接口，此处获取深圳用户代码屏蔽
      // const szUserInfo: any = await initEventUserInfo()
      if (userInfo) {
        this.setUserInfo(userInfo);
      }
      // 数据字典
      getDataDict()
      // 分类字典
      getCategoryDict()
      // 规则
      // getRuleList()
      // if (szUserInfo) {
      //   if (userToken.iszsEnv != '0') {
      //     this.setToken(szUserInfo.token.access_token);
      //     this.setSzUserInfo(szUserInfo.userInfo)
      //   } else {
      //     this.setSzUserInfo(szUserInfo)
      //   }
      // }
      return userInfo;
    },
    // 获取深圳用户信息
    async getSzUserInfoAction(ssotoken: String): Promise<any | null> {
      if (!ssotoken) {
        return null;
      }
      const szUserInfo: any = await initEventUserInfo(ssotoken)
      if (szUserInfo) {
        // 局方单点登录增加Single 标识
        const token = "Single " + szUserInfo.token.access_token
        this.setToken(token);
        this.setSzUserInfo(szUserInfo.userInfo)
      }
      return szUserInfo;
    },
    /**
     * 退出登录
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          //   await doLogout();
        } catch {
          console.log('注销Token失败');
        }
      }
      this.setToken('');
      setAuthCache(TOKEN_KEY, null);
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