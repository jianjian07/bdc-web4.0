import type { AxiosRequestConfig } from 'axios'
import { defHttp } from '/@/utils/http/axios'
import { $error } from '../../../utils/message'

/**
 * 迁移模块 HTTP 请求封装
 *
 * <p>db-web 源码以 `get<T>(url, params)` 形态调用,内部拆包 `{code,message,data}`;
 * 本项目统一响应体 Result 为 `{success,message,code,result}`(成功 code=200)。
 * 两处口径不同,统一在本文件适配,使移植过来的 api/*.ts 与页面代码无需逐处改写。</p>
 *
 * <p>本项目 defHttp 已注入 token / 401 无感刷新 / 网络错误通知,
 * 这里只负责业务层拆包: success=false 时弹错并 reject, 成功返回 result 字段。</p>
 */

/** 本项目统一响应体(Result) */
interface BizResult<T = unknown> {
    success?: boolean
    code?: number
    message?: string
    result?: T
}

/** 业务拆包: 失败提示并 reject, 成功返回 result 字段 */
async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
    const res = (await promise) as BizResult<T>
    if (res && typeof res === 'object' && 'success' in res) {
        if (res.success) {
            return (res.result ?? null) as T
        }
        const hint = res.message || '业务错误'
        $error(`[${res.code}] ${hint}`)
        return Promise.reject(new Error(hint))
    }
    // 非约定格式(如文件流),直接返回
    return res as T
}

/** GET 简化 */
export function get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
): Promise<T> {
    return unwrap<T>(defHttp.get({ url, params, ...config }, { withToken: true }))
}

/** POST 简化 */
export function post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> {
    return unwrap<T>(defHttp.post({ url, data, ...config }, { withToken: true }))
}

/** PUT 简化 */
export function put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> {
    return unwrap<T>(defHttp.put({ url, data, ...config }, { withToken: true }))
}

/** DELETE 简化 */
export function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrap<T>(defHttp.delete({ url, ...config }, { withToken: true }))
}
