/** 比对策略 */
export type CompareStrategy = 'ROW_COUNT' | 'CHECKSUM' | 'DIFF_ROWS'

/** 比对总体结果 */
export type CompareOverallResult = 'MATCH' | 'MISMATCH' | 'FAILED' | 'RUNNING' | null

/** 比对任务 */
export interface CompareTask {
  id: number
  name: string
  sourceId: string
  targetId: string
  sourceName?: string
  targetName?: string
  sourceSchema: string
  targetSchema: string
  tables: string[]
  strategy: CompareStrategy
  overallResult: CompareOverallResult
  parallelWorkers: number
  startedAt?: string
  finishedAt?: string
  createTime?: string
}

/** 创建比对任务请求 */
export interface CreateCompareTask {
  name: string
  sourceId: string
  targetId: string
  sourceSchema?: string
  targetSchema?: string
  tables: string[]
  strategy?: CompareStrategy
  parallelWorkers?: number
}

/** 单表比对结果 */
export interface CompareResult {
  id: number
  compareTaskId: number
  sourceTable: string
  targetTable: string
  sourceRowCount: number
  targetRowCount: number
  rowCountMatch: boolean
  checksumMatch: boolean | null
  diffCount: number | null
  /** 总块数(P1-10 分块校验) */
  chunkCount?: number | null
  /** 差异块数(P1-10 分块校验) */
  diffChunkCount?: number | null
  /** 精确差异行数(P1-10, null=未走分块/未精确) */
  diffExact?: number | null
  /** 抽样估算差异行数(P1-10 保留旧口径) */
  diffEstimate?: number | null
  /** 实际校验模式: ROW_COUNT / XOR / CHUNKED */
  comparedMode?: string | null
  /** 比对口径备注: 已自动排除的自增列 / 行级对齐降级说明 */
  note?: string | null
  createTime?: string
}

/** 比对差异块明细(P1-10) */
export interface CompareChunk {
  id: number
  compareResultId: number
  chunkIndex: number
  lowerBound: string | null
  upperBound: string | null
  sourceRows: number
  targetRows: number
  sourceHash: string
  targetHash: string
  diffRows: number | null
}
