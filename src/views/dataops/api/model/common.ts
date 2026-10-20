/**
 * 后端统一响应格式
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  traceId?: string
}

/**
 * 分页请求参数
 */
export interface PageRequest {
  page?: number
  size?: number
  orderBy?: string
  desc?: boolean
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/**
 * 业务错误码（与 docs/03-api-design.md §1.2 对齐）
 * <p>仅保留前端实际消费的成员: 拦截器据此判定业务成功。</p>
 */
export enum BizErrorCode {
  SUCCESS = 0
}