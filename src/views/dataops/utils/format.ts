import dayjs from 'dayjs'

/** 时间格式化（默认 YYYY-MM-DD HH:mm:ss） */
export function formatDateTime(
  v: string | Date | number | null | undefined,
  pattern = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (v === null || v === undefined || v === '') return '-'
  const d = dayjs(v)
  return d.isValid() ? d.format(pattern) : String(v)
}

/** 端口默认提示 */
export function defaultPort(dbType: string): number {
  return dbType === 'POSTGRES' ? 5432 : 1433
}

/**
 * 进度百分比(保留两位小数)
 * <p>统一原先在 monitor 大屏里重复三处的 Math.round(m/t*10000)/100。</p>
 */
export function percent(migrated: number | null | undefined, total: number | null | undefined): number {
  if (!total || total <= 0) return 0
  const m = migrated ?? 0
  if (m <= 0) return 0
  return Math.min(100, Math.round((m / total) * 10000) / 100)
}

/**
 * 毫秒耗时人类可读(1d2h3m / 5h30m / 5m30s / 42s)
 * <p>统一原先散落在 MigrationDetail / history / monitor 三处的重复实现。</p>
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms < 0) return '-'
  return formatSeconds(Math.round(ms / 1000))
}

/**
 * 秒数人类可读(1d2h3m / 5h30m / 5m30s / 42s)
 * @param opts.lessThanOneText 小于 1 秒时的文案(默认返回 '0s')
 */
export function formatSeconds(
  seconds: number | null | undefined,
  opts: { lessThanOneText?: string } = {}
): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '-'
  if (seconds < 0) return '-'
  if (seconds < 1) return opts.lessThanOneText ?? '0s'
  const s = Math.round(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m${s % 60}s`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h${m % 60}m`
  return `${Math.floor(h / 24)}d${h % 24}h`
}