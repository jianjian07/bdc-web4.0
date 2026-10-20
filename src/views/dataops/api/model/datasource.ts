/**
 * 数据源模型(桥接版)
 *
 * <p>原 db-web 的数据源为独立 CRUD(t_mds_data_source);本项目由系统多数据源
 * (sys_data_source)统一管理,迁移模块仅消费只读选项(/data/datasource/options),
 * 因此本文件只保留迁移向导/比对页实际消费的字段,并去掉表单与 CRUD 类型。</p>
 */

/** 数据库类型 */
export type DbType = 'MSSQL' | 'POSTGRES'

/** 测试连接结果(与后端 ConnectionTestResult 对齐) */
export interface ConnectionTestResult {
  connected: boolean
  version?: string
  message?: string
  latencyMs?: number
}

/** 数据源选项(只读, 桥接 sys_data_source) */
export interface DataSource {
  /** 系统数据源 id(字符串主键) */
  id: string
  name: string
  code?: string
  dbType: DbType
  /** "host:port/database" 概要地址 */
  address?: string
  /** 默认 schema(后端 options 暂未返回; 缺省时向导不剥 schema 前缀, 行为安全) */
  schemaName?: string
}
