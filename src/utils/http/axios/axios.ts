import { notification } from "ant-design-vue";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";
import { cloneDeep, isString } from "lodash-es";
import { RequestOptions, Result } from "/#/axios";
import { RequestEnum } from "/@/enums/httpEnum";
// import { useMessage } from "/@/hooks/web/useMessage";
import { useUserStoreWithOut } from "/@/store/modules/user";
import { encryptByMd5 } from "/@/utils/cipher";
import { setObjToUrlParams } from "/@/utils"
import { AxiosOptions } from "/@/utils/http/axios/axiosModel"
import { refreshTokenApi } from "/@/api/sys/user"
// import { options } from "/@/views/bigscreen/cchart";
// const { notification } = useMessage();

/**
 * 全局单飞刷新锁。
 * 主应用与 form-imagining 等独立子包共用同一把锁，保证同一时刻只发起一次刷新，
 * 避免后端 refreshToken 旋转机制下「多方各自刷新互相作废」的连环失败。
 */
let refreshingPromise: Promise<string | null> | null = null

/**
 * 单飞刷新 access token（全局共享）。
 * - 并发调用复用同一次刷新请求；
 * - 成功后新的 access/refresh token 会写入 store 与共享 localStorage
 *   （CC__COMMON__LOCAL__KEY__ -> TOKEN__ / REFRESH__TOKEN__），
 *   form-imagining 等子包通过实时读取 localStorage 即可拿到新 token。
 * @returns 新的 access token（含 Bearer 前缀）；失败返回 null
 */
export function refreshAccessToken(): Promise<string | null> {
    // 已有刷新在进行中：直接复用，避免重复旋转 refreshToken
    if (refreshingPromise) return refreshingPromise
    const userStore = useUserStoreWithOut()
    const refreshToken = userStore.getRefreshToken
    // 没有 refreshToken 无法刷新
    if (!refreshToken) return Promise.resolve(null)
    const task = refreshTokenApi(refreshToken)
        .then((result: any) => {
            if (result && result.token) {
                // 同步新 token 到 store（内部会立即写入共享 localStorage）
                userStore.setToken(result.token)
                if (result.refreshToken) {
                    userStore.setRefreshToken(result.refreshToken)
                }
                return result.token as string
            }
            // 多租户降级或刷新失败
            return null
        })
        .catch(() => null)
    refreshingPromise = task
    // 本次刷新结束后释放锁，允许后续再次刷新
    task.finally(() => {
        if (refreshingPromise === task) refreshingPromise = null
    })
    return task
}

export class RequestHttp {
    private axiosInstance: AxiosInstance;
    private readonly options: AxiosOptions;
    private source: CancelTokenSource;

    /**
     * 构造函数
     */
    constructor(options: AxiosOptions) {
        this.options = options
        // 创建一个新的axios
        this.axiosInstance = axios.create(options)
        this.setupInterceptors()
        const cancelToken = axios.CancelToken
        this.source = cancelToken.source()
    }

    /**
     * 创建axios
     * @param config axios配置
     */
    private createAxios(config: AxiosRequestConfig) {

        this.axiosInstance = axios.create(config)
    }

    /**
     * 拦截器配置
     */
    private setupInterceptors() {
        /**
         * 请求拦截器
         */
        this.axiosInstance.interceptors.request.use(
            config => {
                // 处理config
                config = this.beforeRequest(config)
                if (!config.url) {
                    return Promise.reject('noURL')
                }
                // 拦截器配置
                return this.requestInterceptors(config);
            },
            error => {
                return Promise.reject(error);
            }
        );
        //  响应拦截器
        this.axiosInstance.interceptors.response.use(
            response => {
                if (response.status == 200) {
                    const bizCode = response.data?.code
                    // 401/424 视为 token 失效，先尝试用 refreshToken 无感刷新，失败再跳登录
                    if (bizCode === 401 || bizCode === 424) {
                        return this.handleTokenExpired(response) as Promise<AxiosResponse>
                    }
                    this.checkStatus(bizCode, true);
                    return Promise.resolve(response);
                }
                this.handleErrorData(response.data)
                return Promise.reject(response)
            },
            error => {
                // HTTP 层 401/424（部分网关直接返回 HTTP 状态码）
                const httpStatus = error?.response?.status
                if (httpStatus === 401 || httpStatus === 424) {
                    return this.handleTokenExpired(error.response) as Promise<AxiosResponse>
                }
                this.handleErrorData(error)
                return Promise.reject(error)
                // console.log(error);
            }
        );
    }

    /**
     * 处理 token 过期：尝试用 refreshToken 无感刷新，成功后重放原请求；
     * 并发场景下只发起一次刷新，其余请求挂起等待新 token。
     *
     * @param response 触发 401/424 的原始响应
     */
    private async handleTokenExpired(response: AxiosResponse | undefined): Promise<any> {
        const originalConfig = response?.config as AxiosRequestConfig | undefined

        // 没有原始请求上下文，无法重放，直接走登出
        if (!originalConfig) {
            this.checkStatus(401, true)
            return Promise.reject(response)
        }

        // 标记本次请求已尝试过刷新，避免刷新后仍 401 导致死循环
        const retryFlag = '__isRetryRequest__'
        if ((originalConfig as any)[retryFlag]) {
            this.checkStatus(401, true)
            return Promise.reject(response)
        }

        // 刷新接口本身、登录接口、注销接口不参与刷新流程，避免循环调用
        const skipUrls = ['/auth/refresh', '/auth/authorization', '/auth/logOut', '/auth/authorizationTyyw']
        if (originalConfig.url && skipUrls.some(u => originalConfig.url!.includes(u))) {
            this.checkStatus(401, true)
            return Promise.reject(response)
        }

        // 共享单飞刷新：并发请求与 form-imagining 等子包复用同一次刷新，
        // 刷新成功后新 token 已写入 store 与共享 localStorage
        const newToken = await refreshAccessToken()
        if (newToken) {
            // 用新 token 重放当前请求
            ; (originalConfig as any)[retryFlag] = true
            if (originalConfig.headers) {
                originalConfig.headers.Authorization = newToken
            }
            return this.axiosInstance.request(originalConfig)
        }
        // 刷新失败（含多租户降级）：清理状态并跳登录
        this.checkStatus(401, true)
        return Promise.reject(response)
    }

    /**
     * 请求之前处理config
     * @param config
     */
    private beforeRequest_bf(config: AxiosOptions) {
        const params = config.params || {}
        const data = config.data || false
        if (config.method?.toUpperCase() == RequestEnum.GET) {
            if (!isString(params)) {
                // 后续完善
            } else {
                // 兼容restful风格
                config.url = config.url + params
                config.params = undefined
            }
        } else {
            if (!isString(params)) {
                if (config.data) {
                    config.data = data
                } else {
                    // 非get请求，如果没有传data 则把params当做data
                    config.data = params
                }
            } else {
                config.data = params
                config.params = undefined
            }
        }
        return config;
    }

    // 请求之前处理config
    private beforeRequest(config) {
        const { joinParamsToUrl, joinTime = false } = config.requestOptions;
        const params = config.params || {};
        const data = config.data || false;
        if (config.method?.toUpperCase() === RequestEnum.GET) {
            if (!isString(params)) {
                // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
                config.params = Object.assign(params || {}, this.joinTimestamp(joinTime, false));
            } else {
                // 兼容restful风格
                config.url = config.url + params + `${this.joinTimestamp(joinTime, true)}`;
                config.params = undefined;
            }
        } else {
            if (!isString(params)) {
                if (Reflect.has(config, 'data') && config.data) {
                    config.data = data;
                    config.params = params;
                } else {
                    // 非GET请求如果没有提供data，则将params视为data
                    // config.data = params;
                    // config.params = undefined;
                    config.data = Object.assign(params || {}, this.joinTimestamp(joinTime, false));
                }
                if (joinParamsToUrl) {
                    config.url = setObjToUrlParams(config.url as string, Object.assign({}, config.params, config.data));
                }
            } else {
                // 兼容restful风格
                config.url = config.url + params;
                config.params = undefined;
            }
        }
        // 统一将data中的undefined转为空字符串，避免JSON.stringify丢失字段
        // if (config.data && typeof config.data === 'object') {
        //     config.data = this.replaceUndefinedToEmpty(config.data);
        // }
        return config;
    }

    /** 深度递归将对象中所有undefined值转为空字符串 */
    private replaceUndefinedToEmpty(obj: any): any {
        if (obj === null || obj === undefined) return ''
        if (Array.isArray(obj)) {
            return obj.map(item => this.replaceUndefinedToEmpty(item));
        }
        if (typeof obj === 'object') {
            const result: any = {};
            for (const key in obj) {
                if (obj[key] === undefined) {
                    result[key] = '';
                } else if (obj[key] !== null && typeof obj[key] === 'object') {
                    result[key] = this.replaceUndefinedToEmpty(obj[key]);
                } else {
                    result[key] = obj[key];
                }
            }
            return result;
        }
        return obj;
    }

    /**按ascii码从小到大排序
     *
     * @param obj
     * @returns {string}
     */
    private sortAscii(obj) {
        let arr = new Array();
        let num = 0;
        for (let i in obj) {
            // undefined的数据不做拼接
            if (obj[i] === undefined) {
                continue
            }
            arr[num] = i;
            num++;
        }
        // 去重
        arr = Array.from(new Set(arr));
        let sortArr = arr.sort();
        let str = '';             //自定义排序字符串
        for (let i in sortArr) {
            str += sortArr[i];
        }
        return str;
    }

    private signParams(data) {
        let s_data = this.sortAscii(data);
        let sign = encryptByMd5(s_data)
        return sign
    }

    /**
     * 判断是否是
     * @param obj
     * @private
     */
    private isArrayLike(obj) {
        let arr = new Array();
        let num = 0;
        for (let i in obj) {
            if (i == '0') {
                return true
            }
        }
        return false
    }

    private joinTimestamp(join: boolean, restful = false): string | object {
        if (!join) {
            return restful ? '' : {};
        }
        const now = new Date().getTime();
        if (restful) {
            return `?_t=${now}`;
        }
        return { _t: now };
    }

    /**
     * 请求拦截器配置
     * @param config
     * @returns
     */
    private requestInterceptors(config: AxiosOptions) {
        if (config.requestOptions?.withToken) {
            const userStore = useUserStoreWithOut();
            const token = userStore.getToken
            if (config && config.headers) { // 多一步判断
                //config.headers.Authorization = "Bearer 5d9c3a3c-bbd8-40a3-bd7a-59b4a02ed394";
                if (!config.headers.Authorization) {
                    config.headers.Authorization = token
                }
            }
        }

        if (config.requestOptions?.withTimeout !== undefined) {
            if (!config.requestOptions.withTimeout) {
                config.timeout = 0
            }
        }

        if (config && config.headers && config.requestOptions) { // 多一步判断
            if (config.requestOptions.xAuthToken != undefined) {
                Reflect.set(config.headers, 'x-auth-token', config.requestOptions.xAuthToken)
            }
            let url: string = config.url
            let urlObj = {}
            if (url && url.indexOf('?') > -1) {
                urlObj = this.urlParamsToObject(url)
            }
            let params = {}
            params = Object.assign(params, config.params)
            if (urlObj && Object.keys(urlObj).length > 0) {
                params = Object.assign(params, urlObj)
            }
            if (config.data && Object.keys(config.data).length > 0) {
                params = Object.assign(params, config.data)
            }
            // 添加签名，解决API成批分配问题
            let sign = ''
            // 暂不考虑数组 及 伪数组
            if (Array.isArray(params) || this.isArrayLike(params) || !params || Object.keys(params).length === 0) {
                sign = encryptByMd5("noParams")
            } else {
                sign = this.signParams(params);
            }
            config.headers.xSign = sign
        }
        return config;
    }

    private urlParamsToObject(url) {
        var obj = {}; // 创建空对象用于存储参数
        var params = url.slice(url.indexOf('?') + 1).split('&'); // 将参数部分分割成数组
        for (var i = 0; i < params.length; i++) {
            var keyValue = params[i].split('='); // 将参数键值对分割成数组
            var key = decodeURIComponent(keyValue[0]); // 解码参数键
            var value = decodeURIComponent(keyValue[1] || ''); // 解码参数值，默认为空字符串
            if (key === '') {
                continue; // 如果参数键为空，则跳过当前循环
            }
            if (obj.hasOwnProperty(key)) {
                if (Array.isArray(obj[key])) {
                    obj[key].push(value); // 如果参数键已存在且对应的值是数组，则追加新值到数组中
                } else {
                    obj[key] = [obj[key], value]; // 如果参数键已存在且对应的值不是数组，则将原值和新值组成数组
                }
            } else {
                obj[key] = value; // 如果参数键不存在，则直接将值存入对象
            }
        }
        return obj;
    }

    /**
     * 错误信息的处理
     * @param err
     */
    private handleErrorData(err: any) {
        if (err.code == "ECONNABORTED") {
            this.source.cancel('连接超时！'); // 取消其他正在进行的请求
            // this.goLogin()
        }
        let message = err == 'noURL' ? '请检查请求URL是否填写' : this.checkStatus(err.response?.status);
        notification.error({
            message: "axios提示",
            description: message,
            duration: 3, //超时时间
        });
        return;
    }

    private checkStatus(status: any, showMsg?: boolean) {
        let message = ""
        switch (status) {
            case 400:
                message = "请求错误(400)，请重新申请";
                break;
            case 401: {
                message = '未授权,请重新登陆';
                this.goLogin();
                break;
            }
            case 424: {
                message = 'token认证已过期,请重新登陆';
                this.source.cancel('token认证已过期！'); // 取消其他正在进行的请求
                this.goLogin();
                break;
            }
            case 500: {
                message = '服务器错误(500)';
                // this.goLogin()
                break;
            }
            case 402: {
                return message;
            }
            default:
                message = "网络连接出错";
        }
        if (showMsg && (status == 401 || status == 424)) {
            notification.error({
                message: "axios提示",
                description: message,
                duration: 3, //超时时间
            });
        }
        return message
    }

    /**
     * token失效 退出登录
     */
    private goLogin() {
        // 返回主页
        // 清空store
        const userStore = useUserStoreWithOut()
        userStore.setToken(undefined)
        userStore.logout(true)
    }

    /**
     *
     * @param config
     * @returns
     */
    request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        let conf: AxiosOptions = cloneDeep(config)
        const { requestOptions } = this.options
        conf.requestOptions = options
        return new Promise((resolve, reject) => {
            this.axiosInstance
                .request<any, AxiosResponse<Result>>(conf)
                .then((res: AxiosResponse<Result>) => {
                    try {
                        if (options?.isTransformResponse == false) {
                            resolve(res as unknown as Promise<T>)
                        } else {
                            if (res) {
                                const { data } = res
                                if (data.data == undefined) {
                                    resolve(data as unknown as Promise<T>)
                                } else {
                                    resolve(data.data as unknown as Promise<T>)
                                }
                            } else {
                                resolve(res)
                            }
                        }
                        return;
                    } catch (error) {
                        reject(error)
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: RequestEnum.GET }, options)
    }

    post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: RequestEnum.POST }, options)
    }

    delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: RequestEnum.DELETE }, options)
    }

    put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: RequestEnum.PUT }, options)
    }

    // post1<T = any>(url: string, params: any): Promise<T> {
    //     const config = {
    //         method: 'POST',
    //         url: url,
    //         data: params
    //     }
    //     return this.request(config)
    // }
    // put(url: string, params: any) {
    //     const config = {
    //         method: 'PUT',
    //         url: url,
    //         params: params
    //     }
    //     return this.request(config)
    // }
    // delete(url: string, params: any) {
    //     const config = {
    //         method: 'DELETE',
    //         url: url,
    //         params: params
    //     }
    //     return this.request(config)
    // }
}
