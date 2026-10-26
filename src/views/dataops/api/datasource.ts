import { get, post } from '/@/views/dataops/api/request'
import type { ConnectionTestResult, DataSource } from '/@/views/dataops/api/model/datasource'

/**
 * 数据源接口(桥接系统多数据源)
 *
 * <p>原 db-web 的数据源 CRUD(/datasources)不移植: 数据源由系统多数据源模块管理。
 * 这里仅保留迁移/比对页面消费的只读能力,全部指向 /data/datasource/*。</p>
 */
enum api {
    datasource = '/api/zrzy-data/data/datasource',
}

/**
 * @description: 分页查询迁移可用数据源(选项接口为全量,前端包装成分页形状以兼容向导调用)
 */
export function listDataSourcesApi(req: { page?: number; size?: number } = {}) {
    return get<DataSource[]>(`${api.datasource}/options`).then((list) => ({
        list: list ?? [],
        total: list?.length ?? 0,
        page: req.page ?? 1,
        size: req.size ?? 20
    }))
}

/**
 * @description: 查询全部迁移可用数据源(下拉框用)
 */
export function listAllDataSourcesApi() {
    return get<DataSource[]>(`${api.datasource}/options`)
}

/**
 * @description: 对已保存数据源测试连接(直连验证,不命中连接池)
 * @param {string} id 系统数据源 id
 */
export function testDataSourceApi(id: string) {
    return post<ConnectionTestResult>(`${api.datasource}/${id}/test`)
}

/**
 * @description: 业务库(源/目标)连接池运行状态快照(排障用)
 */
export function getPoolStatsApi() {
    return get<Record<string, Record<string, unknown>>>(`${api.datasource}/pool-stats`)
}
