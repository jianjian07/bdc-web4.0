import { get, post, del } from '/@/views/dataops/api/request'
import type { PageResponse } from '/@/views/dataops/api/model/common'
import type { CompareResult, CompareTask, CompareChunk, CreateCompareTask } from '/@/views/dataops/api/model/compare'

/** 比对任务接口地址集中声明 */
enum api {
  tasks = '/api/zrzy-data/data/compare/tasks'
}

/**
 * @description: 分页查询比对任务
 */
export function listCompareTasksApi(
  req: { page?: number; size?: number; keyword?: string; result?: string } = {}
) {
  return get<PageResponse<CompareTask>>(api.tasks, {
    page: req.page ?? 1,
    size: req.size ?? 20,
    keyword: req.keyword,
    result: req.result
  })
}

/**
 * @description: 比对任务详情
 */
export function getCompareTaskApi(id: number) {
  return get<CompareTask>(`${api.tasks}/${id}`)
}

/**
 * @description: 创建比对任务
 */
export function createCompareTaskApi(payload: CreateCompareTask) {
  return post<CompareTask>(api.tasks, payload)
}

/**
 * @description: 删除比对任务(级联结果)
 */
export function deleteCompareTaskApi(id: number) {
  return del<void>(`${api.tasks}/${id}`)
}

/**
 * @description: 启动比对(异步)
 */
export function startCompareTaskApi(id: number) {
  return post<CompareTask>(`${api.tasks}/${id}/start`)
}

/**
 * @description: 比对结果明细
 */
export function getCompareResultsApi(id: number) {
  return get<CompareResult[]>(`${api.tasks}/${id}/results`)
}

/**
 * @description: 差异行抽样 CSV 下载地址
 */
export function diffCsvExportUrl(compareTaskId: number, resultId: number) {
  return `${api.tasks}/${compareTaskId}/results/${resultId}/diff-csv`
}

/**
 * @description: 比对差异块明细(P1-10)
 */
export function getCompareChunkDiffsApi(compareTaskId: number, resultId: number) {
  return get<CompareChunk[]>(`${api.tasks}/${compareTaskId}/results/${resultId}/chunks`)
}
