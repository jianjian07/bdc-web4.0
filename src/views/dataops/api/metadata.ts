import { post } from '/@/views/dataops/api/request'
import type { TableMeta, TableStructure } from '/@/views/dataops/api/model/migration'

/** 元数据接口地址集中声明 */
enum api {
  tables = '/api/zrzy-data/data/metadata/tables',
  columns = '/api/zrzy-data/data/metadata/columns',
}

/**
 * @description: 列出数据源 schema 下的表
 * @param {string} dataSourceId 数据源 id(字符串主键)
 * @param {string} [schema] schema 名(空=数据源默认)
 * @param {string} [keyword] 表名关键字过滤
 */
export function listTablesApi(dataSourceId: string, schema?: string, keyword?: string) {
  return post<TableMeta[]>(api.tables, { dataSourceId, schema, keyword })
}

/**
 * @description: 读取表结构(列清单 + 主键)
 * @param {string} dataSourceId 数据源 id(字符串主键)
 * @param {string} schema schema 名
 * @param {string} tableName 表名
 */
export function getTableColumnsApi(
  dataSourceId: string,
  schema: string,
  tableName: string
) {
  return post<TableStructure>(api.columns, {
    dataSourceId,
    schema,
    tableName
  })
}
