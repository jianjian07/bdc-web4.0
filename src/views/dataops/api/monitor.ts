import { get } from '/@/views/dataops/api/request'
import type { MetricsSnapshot } from '/@/views/dataops/api/model/monitor'

enum api {
  monitor = '/api/zrzy-data/data/monitor'
}

/**
 * @description: 查询迁移引擎指标快照(活跃 worker / 累计行数 / 失败计数等)
 * @return {Promise<MetricsSnapshot>} 指标快照
 */
export function getMetricsApi(): Promise<MetricsSnapshot> {
  return get<MetricsSnapshot>(`${api.monitor}/metrics`)
}
