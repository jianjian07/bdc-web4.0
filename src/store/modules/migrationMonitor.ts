import { defineStore } from 'pinia'
import { getTaskProgressApi, listMigrationTasksApi } from '/@/views/dataops/api/migration'
import { stompHub, TaskTopics } from '/@/views/dataops/api/progressPoll'
import type { MigrationTask, TaskProgressSnapshot } from '/@/views/dataops/api/model/migration'

/** WebSocket 任务进度消息(与 REST 快照同源) */
export type TaskProgressMsg = TaskProgressSnapshot

/** WebSocket 实时日志消息 */
export interface TaskLogMsg {
  taskId: number
  historyId: number
  table: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  loggedAt: string
}

/** WebSocket 状态变更消息 */
export interface TaskStateMsg {
  taskId: number
  from: string
  to: string
  reason: string
  at: string
}

/** 日志环形缓冲容量 */
const LOG_BUFFER_SIZE = 300

/** 任务订阅退订句柄(taskId -> progress/log/state 三个 topic 的退订函数), 模块级保存避免进入可序列化 state */
const unsubscribers = new Map<number, Array<() => void>>()

/** 任务终态(收到即退订, 常驻订阅只会在 WS 离线时白跑 REST 兑底轮询; PAUSED 可恢复不退订) */
const TERMINAL_STATES = ['COMPLETED', 'FAILED', 'CANCELLED']

/**
 * @description: 监控大屏全局状态
 * <p>聚合运行中任务 + 实时日志流(WebSocket);轮询兜底刷新任务列表。</p>
 */
export const useMonitorStore = defineStore('app-monitor', {
  state: () => ({
    /** 全部任务(供大屏筛选 RUNNING) */
    tasks: [] as MigrationTask[],
    loading: false,
    /** taskId -> 最新进度 */
    progressMap: {} as Record<number, TaskProgressMsg>,
    /** taskId -> 状态(实时) */
    stateMap: {} as Record<number, string>,
    /** 实时日志环形缓冲 */
    logs: [] as TaskLogMsg[],
    /** WebSocket 是否在线 */
    wsOnline: false,
    /** 已订阅的 taskId 集合 */
    subscribedTasks: new Set<number>()
  }),
  getters: {
    /** 运行中任务(状态实时映射后) */
    runningTasks(state): MigrationTask[] {
      return state.tasks.filter((t) =>
        (state.stateMap[t.id] ?? t.status) === 'RUNNING'
        || (state.stateMap[t.id] ?? t.status) === 'PAUSED'
      )
    },
    /** 全局统计 */
    stats(state) {
      const live = (t: MigrationTask) => state.stateMap[t.id] ?? t.status
      return {
        total: state.tasks.length,
        running: state.tasks.filter((t) => live(t) === 'RUNNING' || live(t) === 'PAUSED').length,
        completed: state.tasks.filter((t) => live(t) === 'COMPLETED').length,
        failed: state.tasks.filter((t) => live(t) === 'FAILED').length
      }
    }
  },
  actions: {
    /**
     * 绑定 WebSocket 在线状态(幂等,内部只注册一次)
     * <p>必须由组件在挂载时调用一次,否则 wsOnline 不会随断线而更新。</p>
     */
    bindWsStatus() {
      this.wsOnline = stompHub.isOnline()
      stompHub.onStatusChange((online) => {
        this.wsOnline = online
      })
    },

    /** 拉取任务列表(供大屏与统计) */
    async fetchTasksAction() {
      this.loading = true
      try {
        const page = await listMigrationTasksApi({ page: 1, size: 200 })
        this.tasks = page.list ?? []
        // 对 RUNNING/PAUSED 任务自动订阅进度
        const active = this.tasks.filter((t) => t.status === 'RUNNING' || t.status === 'PAUSED')
        active.forEach((t) => this.subscribeTask(t.id))
        // REST 轮询兜底: WS 断线/丢消息时仍保证进度持续更新、状态不丢失
        await Promise.all(
          active.map(async (t) => {
            try {
              const snap = await getTaskProgressApi(t.id)
              // 判 snap 即可: totalRows=0(空表/纯结构迁移)的任务同样需要回填状态
              if (snap) {
                this.progressMap[t.id] = { ...snap, taskId: t.id }
                if (snap.status) this.stateMap[t.id] = snap.status
              }
            } catch {
              /* 单次轮询失败忽略, 下一轮重试 */
            }
          })
        )
      } finally {
        this.loading = false
      }
    },

    /** 订阅某任务的实时进度/日志/状态 */
    subscribeTask(taskId: number) {
      if (this.subscribedTasks.has(taskId)) return
      this.subscribedTasks.add(taskId)

      const unsubs: Array<() => void> = []
      unsubs.push(
        stompHub.subscribe(TaskTopics.progress(taskId), (msg) => {
          const p = msg as TaskProgressMsg
          this.progressMap[taskId] = p
          if (p.status) this.stateMap[taskId] = p.status
        })
      )
      unsubs.push(
        stompHub.subscribe(TaskTopics.log(taskId), (msg) => {
          this.logs.push(msg as TaskLogMsg)
          if (this.logs.length > LOG_BUFFER_SIZE) {
            this.logs.splice(0, this.logs.length - LOG_BUFFER_SIZE)
          }
        })
      )
      unsubs.push(
        stompHub.subscribe(TaskTopics.state(taskId), (msg) => {
          const s = msg as TaskStateMsg
          this.stateMap[taskId] = s.to
          // 状态变化时刷新任务列表
          if (['COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED'].includes(s.to)) {
            this.fetchTasksAction()
          }
          // 终态即退订: 任务不会再推消息, 常驻订阅只会无限累积
          // (WS 离线时对已终态任务持续白跑 REST 兑底轮询)
          if (TERMINAL_STATES.includes(s.to)) {
            this.unsubscribeTask(taskId)
          }
        })
      )
      unsubscribers.set(taskId, unsubs)
    },

    /**
     * 退订某任务并回收进度/状态缓存
     * <p>终态事件到达时自动调用; 页面不再关注某任务时也可显式调用。</p>
     */
    unsubscribeTask(taskId: number) {
      const unsubs = unsubscribers.get(taskId)
      if (!unsubs) return
      unsubs.forEach((u) => u())
      unsubscribers.delete(taskId)
      this.subscribedTasks.delete(taskId)
      // 进度/状态缓存随退订回收: 任务状态回落 tasks 列表(终态后由 fetchTasksAction 刷新)
      delete this.progressMap[taskId]
      delete this.stateMap[taskId]
    }
  }
})

