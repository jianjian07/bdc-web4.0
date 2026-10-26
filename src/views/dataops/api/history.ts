import { get } from '/@/views/dataops/api/request'
import type { PageResponse } from '/@/views/dataops/api/model/common'
import type { DirtyDataItem, HistoryTable, MigrationHistory, MigrationLogItem } from '/@/views/dataops/api/model/history'

/** 历史接口地址集中声明 */
enum api {
  histories = '/api/zrzy-data/data/migration/histories'
}

/**
 * @description: 分页查询迁移历史
 * @param {object} req 分页与筛选参数(startTime/endTime 为 ISO-8601,按开始时间过滤)
 */
export function listHistoriesApi(
  req: {
    page?: number
    size?: number
    taskId?: number
    status?: string
    startTime?: string
    endTime?: string
  } = {}
) {
  return get<PageResponse<MigrationHistory>>(api.histories, {
    page: req.page ?? 1,
    size: req.size ?? 20,
    taskId: req.taskId,
    status: req.status,
    startTime: req.startTime,
    endTime: req.endTime
  })
}

/**
 * @description: 历史详情
 */
export function getHistoryApi(id: number) {
  return get<MigrationHistory>(`${api.histories}/${id}`)
}

/**
 * @description: 历史关联日志(分页,支持关键字搜索)
 */
export function getHistoryLogsApi(
  id: number,
  req: { level?: string; keyword?: string; page?: number; size?: number } = {}
) {
  return get<PageResponse<MigrationLogItem>>(`${api.histories}/${id}/logs`, {
    level: req.level,
    keyword: req.keyword,
    page: req.page ?? 1,
    size: req.size ?? 50
  })
}

/**
 * @description: 历史关联表级结果
 */
export function getHistoryTablesApi(id: number) {
  return get<HistoryTable[]>(`${api.histories}/${id}/tables`)
}

/**
 * @description: 历史关联脏数据(B4, 分页)
 */
export function getHistoryDirtyDataApi(
  id: number,
  req: { tableName?: string; page?: number; size?: number } = {}
) {
  return get<PageResponse<DirtyDataItem>>(`${api.histories}/${id}/dirty-data`, {
    tableName: req.tableName,
    page: req.page ?? 1,
    size: req.size ?? 20
  })
}

/**
 * @description: 脏数据 CSV 下载地址(浏览器直接打开)
 */
export function dirtyDataExportUrl(id: number) {
  return `${api.histories}/${id}/dirty-data/export`
}

/**
 * @description: 历史报告 CSV 下载地址
 */
export function historyReportExportUrl(id: number) {
  return `${api.histories}/${id}/report`
}

/**
 * @description: 历史报告 Excel 下载地址
 */
export function historyReportExcelExportUrl(id: number) {
  return `${api.histories}/${id}/report/excel`
}
