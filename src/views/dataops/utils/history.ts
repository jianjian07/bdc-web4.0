/**
 * 历史/日志相关的运行时常量(文案与配色)
 * <p>原先散落在 types/history.ts,使 types/ 不再是纯类型目录。这里与 utils/migration.ts 的
 * TASK_STATUS_* 保持一致:运行时常量统一放 utils/,types/ 只放类型定义。</p>
 */

/** 历史状态文案 */
export const HISTORY_STATUS_LABELS: Record<string, string> = {
  RUNNING: '运行中',
  COMPLETED: '已完成',
  FAILED: '失败',
  CANCELLED: '已取消'
}

export const HISTORY_STATUS_COLORS: Record<string, string> = {
  RUNNING: 'processing',
  COMPLETED: 'success',
  FAILED: 'error',
  CANCELLED: 'default'
}

/** 日志级别颜色 */
export const LOG_LEVEL_COLORS: Record<string, string> = {
  INFO: 'blue',
  WARN: 'orange',
  ERROR: 'red'
}
