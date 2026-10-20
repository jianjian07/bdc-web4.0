import type { MigrationTaskTable } from './migration'

/** 迁移历史 */
export interface MigrationHistory {
  id: number
  taskId: number
  taskName: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  totalTables: number
  completedTables: number
  failedTables: number
  totalRows: number
  migratedRows: number
  durationMs: number
  errorSummary?: string | null
  startedAt?: string
  finishedAt?: string
  /** 最近一次心跳(后端 P1-14 新增; 当前前端不展示, 保留以备"判断是否卡死"用) */
  lastHeartbeat?: string | null
}

/** 迁移日志条目 */
export interface MigrationLogItem {
  id: number
  taskId: number
  historyId?: number | null
  tableName?: string | null
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  stackTrace?: string | null
  loggedAt: string
}

/** 脏数据条目(B4) */
export interface DirtyDataItem {
  id: number
  historyId: number
  tableName: string
  rowIndex?: number | null
  sourcePk?: Record<string, unknown> | null
  errorMessage?: string | null
  rawValue?: Record<string, unknown> | null
  createdAt?: string
}

/** 历史表级结果(复用任务表结构) */
export type HistoryTable = MigrationTaskTable
