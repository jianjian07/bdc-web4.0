import { notification } from "ant-design-vue";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";
import { cloneDeep, isString } from "lodash-es";
import { setObjToUrlParams } from "../..";
import { AxiosOptions } from "./axiosModel";
// import { CreateAxiosOptions } from "../../http/axiosTransform";
import { RequestOptions, Result } from "/#/axios";
import { RequestEnum } from "/@/enums/httpEnum";
// import { useMessage } from "/@/hooks/web/useMessage";
import { useUserStoreWithOut } from "/@/store/modules/user";
// import { options } from "/@/views/bigscreen/cchart";
// const { notification } = useMessage();
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
                    this.checkStatus(response.data.code);
                    return Promise.resolve(response);
                } else {
                    this.handleErrorData(response.data)
                }
            },
            error => {
                this.handleErrorData(error)
                // console.log(error);
            }
        );
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
        const { joinParamsToUrl, joinTime = true } = config.requestOptions;
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
                if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
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
        return config;
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
        if (config && config.headers && config.requestOptions) { // 多一步判断
            if (config.requestOptions.xAuthToken != undefined) {
                Reflect.set(config.headers, 'x-auth-token', config.requestOptions.xAuthToken)
            }
        }
        return config;
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
        let message = this.checkStatus(err.response.status);
        notification.error({
            message: "axios提示",
            description: message,
            duration: 3, //超时时间
        });
        return;
    }
    private checkStatus(status: any) {
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
                this.source.cancel('认证已过期！'); // 取消其他正在进行的请求
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
