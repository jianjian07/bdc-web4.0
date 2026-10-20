/**
 * 运行指标类型(P1-13)
 * 字段与后端 `dbmigrator_*` Prometheus 指标一一对应, 见后端 MigrationMetrics.snapshot()
 */

/** 引擎指标快照 */
export interface MetricsSnapshot {
  /** 当前运行中的迁移任务数 */
  runningTasks: number
  /** 当前活跃 worker 数(含表内并发的切片 worker) */
  activeWorkers: number
  /** 本实例累计迁移行数(进程内累计, 重启归零) */
  migratedRowsTotal: number
  /** chunk COPY 重试累计次数 */
  chunkRetriesTotal: number
  /** chunk 最终失败累计次数 */
  chunkFailuresTotal: number
  /** 迁移失败的表累计数 */
  tableFailuresTotal: number
  /** 记为脏数据的 chunk 累计数 */
  dirtyChunksTotal: number
  /** Prometheus 抓取端点 */
  prometheusEndpoint?: string
}
