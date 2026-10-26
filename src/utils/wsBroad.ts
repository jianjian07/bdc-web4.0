/**
 * 统一 WS 平台客户端(/ws/broad, JSON 帧协议)
 * <p>对接后端 org.mapgis.websocket.platform: 客户端发 {op:auth|sub|unsub|ping},
 * 服务端回 {op:welcome|msg|err|pong}。内置自动重连(3s)与心跳(30s);
 * 收到 AUTH_FAILED 后停止重连(凭据已失效, 重连无意义)。</p>
 * <p>支持单连接多通道订阅(subscriptions 或运行期 subscribe/unsubscribe),
 * 多业务可共享一条连接;重连后自动恢复全部订阅。</p>
 */

export interface WsBroadSubscription {
  channel: string
  selector: string
}

export interface WsBroadOptions {
  /** 完整 ws 地址, 如 ws://host:port/zrzy-system/ws/broad */
  url: string
  /** 可选 token(鉴权绑定通道必传); 传函数则在每次(重)连时取最新值, 兼容 token 无感刷新 */
  token?: string | (() => string | undefined)
  /** 订阅单个通道(简单场景;与 subscriptions 二选一), 如 notification.user / log */
  channel?: string
  /** 通道内目标键(用户名/服务名/taskId) */
  selector?: string
  /** 订阅多个通道(单连接复用) */
  subscriptions?: WsBroadSubscription[]
  /** 收到业务消息(msg 帧) */
  onMessage: (data: any, channel: string, selector: string) => void
  /** 连接建立并完成订阅后回调(可选) */
  onOpen?: () => void
  /** 连接断开回调(可选;自动重连仍会进行) */
  onClose?: () => void
}

export interface WsBroadClient {
  close: () => void
  /** 运行期追加订阅(重连后自动恢复) */
  subscribe: (channel: string, selector: string) => void
  /** 运行期退订 */
  unsubscribe: (channel: string, selector: string) => void
}

const RECONNECT_DELAY_MS = 3000
const PING_INTERVAL_MS = 30000

export function createWsBroad(opts: WsBroadOptions): WsBroadClient {
  let socket: WebSocket | null = null
  let closed = false
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /** 当前生效的订阅集(onopen 时全量重发, 重连自动恢复) */
  const subs: WsBroadSubscription[] = opts.subscriptions
    ? opts.subscriptions.map((s) => ({ ...s }))
    : [{ channel: opts.channel ?? '', selector: opts.selector ?? '' }]

  function stopTimers() {
    if (pingTimer !== null) {
      clearInterval(pingTimer)
      pingTimer = null
    }
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function sendFrame(s: WsBroadSubscription, op: 'sub' | 'unsub') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ op, channel: s.channel, selector: s.selector }))
    }
  }

  function connect() {
    socket = new WebSocket(opts.url)
    socket.onopen = () => {
      const token = typeof opts.token === 'function' ? opts.token() : opts.token
      if (token) {
        socket?.send(JSON.stringify({ op: 'auth', token }))
      }
      subs.forEach((s) => sendFrame(s, 'sub'))
      pingTimer = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ op: 'ping' }))
        }
      }, PING_INTERVAL_MS)
      opts.onOpen?.()
    }
    socket.onmessage = (event) => {
      let frame: any
      try {
        frame = JSON.parse(event.data)
      } catch {
        return
      }
      if (frame?.op === 'msg') {
        opts.onMessage(frame.data, frame.channel, frame.selector)
      } else if (frame?.op === 'err' && frame?.code === 'AUTH_FAILED') {
        // 凭据已失效: 停止重连(页面登出流程会 close)
        closed = true
        socket?.close()
      }
    }
    socket.onclose = () => {
      stopTimers()
      opts.onClose?.()
      if (!closed) {
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      }
    }
  }

  connect()

  return {
    close() {
      closed = true
      stopTimers()
      socket?.close()
      socket = null
    },
    subscribe(channel: string, selector: string) {
      if (subs.some((s) => s.channel === channel && s.selector === selector)) return
      const s = { channel, selector }
      subs.push(s)
      sendFrame(s, 'sub')
    },
    unsubscribe(channel: string, selector: string) {
      const i = subs.findIndex((s) => s.channel === channel && s.selector === selector)
      if (i < 0) return
      subs.splice(i, 1)
      sendFrame({ channel, selector }, 'unsub')
    }
  }
}
