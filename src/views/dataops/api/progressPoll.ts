import {
    getMigrationTaskApi,
    getTaskLogsApi,
    getTaskProgressApi
} from '/@/views/dataops/api/migration'
import type { TaskProgressSnapshot } from '/@/views/dataops/api/model/migration'
import { createWsBroad } from '/@/utils/wsBroad'
import type { WsBroadClient } from '/@/utils/wsBroad'

/**
 * 进度中心(stompHub): 真实 WS 优先 + REST 轮询兜底
 *
 * <p>对接统一 WS 平台(/ws/broad): 后端 ProgressHub 旁路发布 migration.progress/
 * tables/log/state 4 个通道(selector=taskId, 匿名可订阅)。多个页面共享
 * <b>一条</b> WS 连接, 按 topic 聚合订阅/分发;对外 API 形状与原 stomp.ts 完全一致
 * (stompHub.subscribe/unsubscribe/isOnline/onStatusChange + TaskTopics), 页面零改动。</p>
 *
 * <table>
 *   <tr><th>topic</th><th>WS 通道</th><th>REST 兜底(仅 WS 离线时)</th></tr>
 *   <tr><td>progress</td><td>migration.progress 推送(约 1s 一条)</td><td>GET .../progress, 1s</td></tr>
 *   <tr><td>state</td><td>migration.state 状态变更事件</td><td>GET .../progress 比对, 1s</td></tr>
 *   <tr><td>tables</td><td>migration.tables 表级状态推送</td><td>GET .../详情, 2s</td></tr>
 *   <tr><td>log</td><td>migration.log 逐行推送</td><td>GET .../logs 增量, 5s</td></tr>
 * </table>
 *
 * <p>时序约定:
 * <ul>
 *   <li>首次订阅: 先 REST 引导一次(首屏填充/日志回放/建立状态与表签名基线), 再挂 WS
 *       订阅 —— WS 只推引导之后的新消息, 与基线衔接不重复不遗漏;</li>
 *   <li>WS 在线: 停全部 REST 轮询, 纯推送;</li>
 *   <li>WS 断开: 立即逐 topic REST 回填一次(补断连窗口), 并恢复兜底轮询;重连成功后
 *       同样先回填再停轮询;</li>
 *   <li>无法取得 wsbaseDomain 时退化为纯 REST 轮询(等价旧行为)。</li>
 * </ul></p>
 */

/** REST 兜底轮询间隔(ms) */
const PROGRESS_INTERVAL = 1000
const TABLES_INTERVAL = 2000
const LOG_INTERVAL = 5000
/** state 兜底轮询间隔: WS 在线时状态即时推送, 兜底无需 1s 那么密(多任务订阅时降请求量) */
const STATE_INTERVAL = 3000

/** WS 地址(zrzy-data 经网关按服务前缀路由;迁移通道匿名, 无需 token) */
function wsUrl(): string | null {
    const base = (window as any).settingConfig?.wsbaseDomain
    return base ? base + '/zrzy-data/ws/broad' : null
}

/** 连接状态监听(连上 / 断开), 与原 stomp.ts 保持一致 */
export type StatusListener = (online: boolean) => void

interface TopicHandler {
    [topic: string]: Set<(msg: unknown) => void>
}

type TopicKind = 'progress' | 'tables' | 'log' | 'state'

/** topic kind -> 统一 WS 平台通道名 */
const KIND_CHANNEL: Record<TopicKind, string> = {
    progress: 'migration.progress',
    tables: 'migration.tables',
    log: 'migration.log',
    state: 'migration.state'
}

function parseTopic(topic: string): { kind: TopicKind; taskId: number } | null {
    const m = /^\/topic\/task\/(\d+)\/(progress|tables|log|state)$/.exec(topic)
    return m ? { kind: m[2] as TopicKind, taskId: Number(m[1]) } : null
}

function topicOf(channel: string, selector: string): string | null {
    const kind = (Object.keys(KIND_CHANNEL) as TopicKind[]).find((k) => KIND_CHANNEL[k] === channel)
    return kind ? `/topic/task/${selector}/${kind}` : null
}

/** REST 日志条目 -> 日志消息形状(字段名对齐 TaskLogMsg) */
function toLogMsg(
    taskId: number,
    it: {
        id: number
        historyId?: number | null
        tableName?: string | null
        level: 'INFO' | 'WARN' | 'ERROR'
        message: string
        loggedAt: string
    }
) {
    return {
        taskId,
        historyId: it.historyId ?? null,
        table: it.tableName ?? '',
        level: it.level,
        message: it.message,
        loggedAt: it.loggedAt
    }
}

class PollHub {
    private handlers: TopicHandler = {}
    /** REST 兜底定时器(仅 WS 离线时存在) */
    private timers = new Map<string, ReturnType<typeof setInterval>>()
    /** 已挂 WS 订阅的 topic(连接内自动恢复, 与 timers 互斥: 在线只推送, 离线只轮询) */
    private wsTopics = new Set<string>()
    /** state topic: 上次分发的 status */
    private lastStatus = new Map<string, string>()
    /** log topic: 已分发的日志 id(增量去重) */
    private pushedLogIds = new Map<string, Set<number>>()
    /** tables topic: 表名 -> 上次状态签名(status:migratedRows) */
    private lastTableState = new Map<string, Map<string, string>>()
    private statusListeners = new Set<StatusListener>()
    private online = false
    /** 共享 WS 连接(首订阅时懒创建, 最后一个订阅退订后关闭) */
    private ws: WsBroadClient | null = null

    /** 是否在线(WS 连接状态;WS 不可用时恒为 false, 此时纯 REST 轮询) */
    isOnline(): boolean {
        return this.online
    }

    /** 注册连接状态监听,注册时会立即回推一次当前状态 */
    onStatusChange(fn: StatusListener): () => void {
        this.statusListeners.add(fn)
        fn(this.online)
        return () => {
            this.statusListeners.delete(fn)
        }
    }

    private setOnline(next: boolean) {
        if (this.online === next) return
        this.online = next
        this.statusListeners.forEach((fn) => fn(next))
    }

    /**
     * 订阅 topic(与原 stompHub.subscribe 签名一致)
     * @param topic 主题(如 /topic/task/1/progress)
     * @param handler 消息回调(JSON 已解析)
     * @returns 退订函数
     */
    subscribe(topic: string, handler: (msg: unknown) => void): () => void {
        const first = !this.handlers[topic] || this.handlers[topic].size === 0
        let set = this.handlers[topic]
        if (!set) {
            set = new Set()
            this.handlers[topic] = set
        }
        set.add(handler)

        const parsed = parseTopic(topic)
        if (parsed && first && !this.wsTopics.has(topic)) {
            // 先 REST 引导一次(首屏填充/基线建立), 再挂 WS 订阅衔接增量
            this.tick(topic, parsed)
                .catch(() => {
                    /* 引导失败忽略, 兜底轮询/WS 推送会继续 */
                })
                .finally(() => {
                if (!this.handlers[topic]) return // 引导期间已全部退订
                this.ensureWs()
                if (this.ws) {
                    this.ws.subscribe(KIND_CHANNEL[parsed.kind], String(parsed.taskId))
                    this.wsTopics.add(topic)
                }
                // WS 尚未就绪(连接中/不可用): 先用 REST 兜底, 连上后会被停掉
                if (!this.online) this.startTimer(topic, parsed)
            })
        }

        return () => this.unsubscribe(topic, handler)
    }

    private unsubscribe(topic: string, handler: (msg: unknown) => void) {
        const s = this.handlers[topic]
        if (!s) return
        s.delete(handler)
        if (s.size === 0) {
            delete this.handlers[topic]
            this.stopTimer(topic)
            this.lastStatus.delete(topic)
            this.pushedLogIds.delete(topic)
            this.lastTableState.delete(topic)
            const parsed = parseTopic(topic)
            if (this.wsTopics.delete(topic) && this.ws && parsed) {
                this.ws.unsubscribe(KIND_CHANNEL[parsed.kind], String(parsed.taskId))
            }
            // 所有订阅都退了: 关闭共享连接
            if (this.wsTopics.size === 0 && Object.keys(this.handlers).length === 0) {
                this.ws?.close()
                this.ws = null
                this.setOnline(false)
            }
        }
    }

    private dispatch(topic: string, msg: unknown) {
        this.handlers[topic]?.forEach((h) => {
            try {
                h(msg)
            } catch (e) {
                console.error('[progressPoll] handler 执行失败:', e)
            }
        })
    }

    // ==================== 共享 WS 连接 ====================

    private ensureWs() {
        if (this.ws) return
        const url = wsUrl()
        if (!url) return // 无网关 WS 配置: 纯 REST 轮询
        this.ws = createWsBroad({
            url,
            subscriptions: [],
            onOpen: () => {
                this.setOnline(true)
                // 首/重连: REST 回填断连窗口丢的更新, 然后停掉兜底轮询
                this.backfillAll()
                this.stopAllTimers()
            },
            onClose: () => {
                this.setOnline(false)
                // 立即逐 topic 回填一次并恢复兜底轮询
                this.backfillAll()
                this.startAllTimers()
            },
            onMessage: (data, channel, selector) => this.onWsMsg(channel, selector, data)
        })
    }

    /** WS msg 帧 -> topic 分发(payload 字段对齐原 REST 形状, 页面零感知) */
    private onWsMsg(channel: string, selector: string, data: any) {
        const topic = topicOf(channel, selector)
        if (!topic || !this.handlers[topic]) return
        const taskId = Number(selector)
        if (channel === 'migration.progress') {
            this.dispatch(topic, { ...data, taskId })
        } else if (channel === 'migration.state') {
            // 记录基线: 避免之后 REST 兜底把同一状态当变更重发
            if (data?.to) this.lastStatus.set(topic, data.to)
            this.dispatch(topic, data)
        } else if (channel === 'migration.tables') {
            // 记录签名: 避免之后 REST 兜底重复分发同一表状态
            const seen = this.lastTableState.get(topic) ?? new Map<string, string>()
            seen.set(data?.table, `${data?.status}:${data?.migratedRows ?? 0}`)
            this.lastTableState.set(topic, seen)
            this.dispatch(topic, data)
        } else if (channel === 'migration.log') {
            // WS 负载 {taskId,historyId,table,level,message,at} -> TaskLogMsg(loggedAt)
            this.dispatch(topic, {
                taskId,
                historyId: data?.historyId ?? null,
                table: data?.table ?? '',
                level: data?.level,
                message: data?.message,
                loggedAt: data?.at
            })
        }
    }

    // ==================== REST 兜底(仅 WS 离线) ====================

    private intervalOf(kind: TopicKind): number {
        if (kind === 'tables') return TABLES_INTERVAL
        if (kind === 'log') return LOG_INTERVAL
        if (kind === 'state') return STATE_INTERVAL
        return PROGRESS_INTERVAL
    }

    private startTimer(topic: string, parsed: { kind: TopicKind; taskId: number }) {
        if (this.timers.has(topic)) return
        const id = setInterval(() => {
            this.tick(topic, parsed).catch(() => {
                /* 单次轮询失败忽略, 下一轮重试 */
            })
        }, this.intervalOf(parsed.kind))
        this.timers.set(topic, id)
    }

    private stopTimer(topic: string) {
        const t = this.timers.get(topic)
        if (t) {
            clearInterval(t)
            this.timers.delete(topic)
        }
    }

    private stopAllTimers() {
        this.timers.forEach((t) => clearInterval(t))
        this.timers.clear()
    }

    private activeTopics(): { topic: string; parsed: { kind: TopicKind; taskId: number } }[] {
        return Object.keys(this.handlers)
            .map((topic) => ({ topic, parsed: parseTopic(topic) }))
            .filter((x): x is { topic: string; parsed: { kind: TopicKind; taskId: number } } => !!x.parsed)
    }

    /** 逐 topic 立即 REST 拉取一次(断连窗口回填;内部去重逻辑保证不重复分发) */
    private backfillAll() {
        this.activeTopics().forEach(({ topic, parsed }) => {
            this.tick(topic, parsed).catch(() => {
                /* 回填失败忽略, 兜底轮询会继续 */
            })
        })
    }

    private startAllTimers() {
        this.activeTopics().forEach(({ topic, parsed }) => this.startTimer(topic, parsed))
    }

    /** REST 拉取一次并按 topic 语义分发(兼作首屏引导与断连回填) */
    private async tick(topic: string, parsed: { kind: TopicKind; taskId: number }) {
        if (parsed.kind === 'progress') {
            const snap = await getTaskProgressApi(parsed.taskId)
            if (snap) this.dispatch(topic, { ...snap, taskId: parsed.taskId })
        } else if (parsed.kind === 'state') {
            const snap = await getTaskProgressApi(parsed.taskId)
            const status = snap?.status
            if (status) {
                const prev = this.lastStatus.get(topic)
                // 首轮只记录基线不发事件;之后 status 变化才分发(与 WS 状态变更语义一致)
                if (prev !== undefined && prev !== status) {
                    this.dispatch(topic, {
                        taskId: parsed.taskId,
                        from: prev,
                        to: status,
                        reason: '',
                        at: new Date().toISOString()
                    })
                }
                this.lastStatus.set(topic, status)
            }
        } else if (parsed.kind === 'tables') {
            const task = await getMigrationTaskApi(parsed.taskId)
            const tables = task?.taskTables ?? []
            const seen = this.lastTableState.get(topic) ?? new Map<string, string>()
            for (const t of tables) {
                const name = t.targetTable || t.sourceTable
                const sig = `${t.status}:${t.migratedRows ?? 0}`
                if (seen.get(name) !== sig) {
                    seen.set(name, sig)
                    this.dispatch(topic, {
                        table: name,
                        status: t.status,
                        migratedRows: t.migratedRows,
                        totalRows: t.totalRows,
                        errorMessage: t.errorMessage
                    })
                }
            }
            this.lastTableState.set(topic, seen)
        } else {
            // log: list 最新在前;首轮只回放最近 10 条,之后仅分发新增
            const page = await getTaskLogsApi(parsed.taskId, { page: 1, size: 20 })
            const items = page?.list ?? []
            const seen = this.pushedLogIds.get(topic) ?? new Set<number>()
            if (seen.size === 0) {
                items
                    .slice(0, 10)
                    .reverse()
                    .forEach((it) => {
                        seen.add(it.id)
                        this.dispatch(topic, toLogMsg(parsed.taskId, it))
                    })
            } else {
                const fresh = items.filter((it) => !seen.has(it.id))
                // 从旧到新逐条分发,消费方 unshift 后头部为最新,与 WS 推送语义一致
                fresh.reverse().forEach((it) => {
                    seen.add(it.id)
                    this.dispatch(topic, toLogMsg(parsed.taskId, it))
                })
            }
            this.pushedLogIds.set(topic, seen)
        }
    }
}

/** 全局单例(保留原 stompHub 命名,页面代码零改动) */
export const stompHub = new PollHub()

/** 迁移任务相关 topic 集中声明(与原 db-web 一致) */
export const TaskTopics = {
    progress: (taskId: number) => `/topic/task/${taskId}/progress`,
    tables: (taskId: number) => `/topic/task/${taskId}/tables`,
    log: (taskId: number) => `/topic/task/${taskId}/log`,
    state: (taskId: number) => `/topic/task/${taskId}/state`
}

/** WS 任务进度消息(与 REST 快照同源) —— 供 store 类型引用 */
export type TaskProgressMsg = TaskProgressSnapshot
