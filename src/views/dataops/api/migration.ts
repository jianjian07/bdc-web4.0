import { get, post, put, del } from '/@/views/dataops/api/request'
import type { PageResponse } from '/@/views/dataops/api/model/common'
import type { MigrationHistory, MigrationLogItem } from '/@/views/dataops/api/model/history'
import type {
  CreateMigrationTask,
  MigrationTask,
  PrecheckSummary,
  ScriptDryRunResult,
  ScriptItem,
  ScriptResponse,
  TaskProgressSnapshot,
  TaskTemplate
} from '/@/views/dataops/api/model/migration'

/** 迁移任务接口地址集中声明 */
enum api {
  task = '/api/zrzy-data/data/migration/tasks',
  metadata = '/api/zrzy-data/data/migration/tasks/',
}

/**
 * @description: 分页查询迁移任务
 * @param {object} req 分页与筛选参数
 */
export function listMigrationTasksApi(
  req: { page?: number; size?: number; keyword?: string; status?: string } = {}
) {
  return get<PageResponse<MigrationTask>>(api.task, {
    page: req.page ?? 1,
    size: req.size ?? 20,
    keyword: req.keyword,
    status: req.status
  })
}

/**
 * @description: 任务详情(含表配置与列映射)
 * @param {number} id 任务主键
 */
export function getMigrationTaskApi(id: number) {
  return get<MigrationTask>(`${api.task}/${id}`)
}

/**
 * @description: 创建任务(同步展开表配置)
 * @param {CreateMigrationTask} payload 任务定义
 */
export function createMigrationTaskApi(payload: CreateMigrationTask) {
  return post<MigrationTask>(api.task, payload)
}

/**
 * @description: 更新任务(仅 PENDING/FAILED 可改)
 * @param {number} id 任务主键
 * @param {CreateMigrationTask} payload 任务定义
 */
export function updateMigrationTaskApi(id: number, payload: CreateMigrationTask) {
  return put<MigrationTask>(`${api.task}/${id}`, payload)
}

/**
 * @description: 删除任务
 * @param {number} id 任务主键
 */
export function deleteMigrationTaskApi(id: number) {
  return del<void>(`${api.task}/${id}`)
}

/**
 * @description: 任务聚合进度快照(监控大屏轮询兜底, 与 WS 推送同源)
 * @param {number} id 任务主键
 */
export function getTaskProgressApi(id: number) {
  return get<TaskProgressSnapshot>(`${api.metadata}${id}/progress`)
}

/**
 * @description: 任务下脚本清单与执行进度(SQL_SCRIPT 模式)
 * @param {number} id 任务主键
 */
export function getTaskScriptsApi(id: number) {
  return get<ScriptResponse[]>(`${api.metadata}${id}/scripts`)
}

/**
 * @description: 单脚本试运行(事务内执行后回滚)
 * @param {number} id 任务主键
 * @param {ScriptItem} payload 待验证脚本
 */
export function dryRunScriptApi(id: number, payload: ScriptItem) {
  return post<ScriptDryRunResult>(`${api.metadata}${id}/scripts/dry-run`, payload)
}

/**
 * @description: 启动任务
 * @param {number} id 任务主键
 */
export function startTaskApi(id: number) {
  return post<MigrationTask>(`${api.metadata}${id}/start`)
}

/**
 * @description: 暂停任务
 * @param {number} id 任务主键
 */
export function pauseTaskApi(id: number) {
  return post<MigrationTask>(`${api.metadata}${id}/pause`)
}

/**
 * @description: 恢复任务
 * @param {number} id 任务主键
 */
export function resumeTaskApi(id: number) {
  return post<MigrationTask>(`${api.metadata}${id}/resume`)
}

/**
 * @description: 取消任务
 * @param {number} id 任务主键
 */
export function cancelTaskApi(id: number) {
  return post<MigrationTask>(`${api.metadata}${id}/cancel`)
}

/**
 * @description: 执行预检查(幂等,覆盖旧结果)
 * @param {number} id 任务主键
 */
export function runPrecheckApi(id: number) {
  return post<PrecheckSummary>(`${api.metadata}${id}/precheck`)
}

/**
 * @description: 最近一次预检查结果
 * @param {number} id 任务主键
 */
export function getLatestPrecheckApi(id: number) {
  return get<PrecheckSummary>(`${api.metadata}${id}/precheck`)
}

/**
 * @description: 任务运行日志(分页,支持关键字搜索)
 * @param {number} id 任务主键
 */
export function getTaskLogsApi(
  id: number,
  req: {
    level?: string
    table?: string
    historyId?: number
    keyword?: string
    page?: number
    size?: number
  } = {}
) {
  return get<PageResponse<MigrationLogItem>>(`${api.metadata}${id}/logs`, {
    level: req.level,
    table: req.table,
    historyId: req.historyId,
    keyword: req.keyword,
    page: req.page ?? 1,
    size: req.size ?? 50
  })
}

/**
 * @description: 任务最近一次运行历史
 * @param {number} id 任务主键
 */
export function getTaskHistoryApi(id: number) {
  return get<MigrationHistory | null>(`${api.metadata}${id}/history`)
}

// ==================== 任务模板 ====================

/**
 * @description: 导出任务模板(JSON,含表级覆盖与列映射)
 * @param {number} id 任务主键
 */
export function getTaskTemplateApi(id: number) {
  return get<TaskTemplate>(`${api.metadata}${id}/template`)
}

/**
 * @description: 导入任务模板(按模板创建新任务)
 * @param {TaskTemplate} payload 模板内容
 */
export function importTaskTemplateApi(payload: TaskTemplate) {
  return post<MigrationTask>(`${api.task}/template-import`, payload)
}

/**
 * @description: 克隆任务(复制配置创建新任务)
 * @param {number} id 任务主键
 */
export function cloneTaskApi(id: number) {
  return post<MigrationTask>(`${api.metadata}${id}/clone`)
}
