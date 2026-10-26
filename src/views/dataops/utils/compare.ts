/**
 * 数据比对相关的运行时常量(文案与配色)
 * <p>与 utils/history.ts 同理:从 types/compare.ts 迁出,保持 types/ 为纯类型目录。</p>
 */
import type { CompareStrategy } from '/@/views/dataops/api/model/compare'

/** 比对策略文案 */
export const COMPARE_STRATEGY_LABELS: Record<CompareStrategy, string> = {
  ROW_COUNT: '行数比对',
  CHECKSUM: '校验和比对',
  DIFF_ROWS: '差异行抽样'
}

/** 比对结果文案与颜色 */
export const COMPARE_RESULT_LABELS: Record<string, string> = {
  MATCH: '一致',
  MISMATCH: '不一致',
  FAILED: '失败',
  RUNNING: '运行中'
}

export const COMPARE_RESULT_COLORS: Record<string, string> = {
  MATCH: 'success',
  MISMATCH: 'error',
  FAILED: 'error',
  RUNNING: 'processing'
}

/** 实际校验模式文案(P1-10) */
export const COMPARE_MODE_LABELS: Record<string, string> = {
  ROW_COUNT: '仅行数',
  XOR: '整表校验和',
  CHUNKED: '分块校验'
}

/** 校验模式配色 */
export const COMPARE_MODE_COLORS: Record<string, string> = {
  ROW_COUNT: 'default',
  XOR: 'orange',
  CHUNKED: 'blue'
}
