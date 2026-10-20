/**
 * 统一 WS 平台客户端(/ws/broad, JSON 帧协议)
 * <p>对接后端 org.mapgis.websocket.platform: 客户端发 {op:auth|sub|ping},
 * 服务端回 {op:welcome|msg|err|pong}。内置自动重连(3s)与心跳(30s);
 * 收到 AUTH_FAILED 后停止重连(凭据已失效, 重连无意义)。</p>
 */

export interface WsBroadOptions {
  /** 完整 ws 地址, 如 ws://host:port/zrzy-system/ws/broad */
  url: string
  /** 可选 token(鉴权绑定通道必传); 传函数则在每次(重)连时取最新值, 兼容 token 无感刷新 */
  token?: string | (() => string | undefined)
  /** 订阅通道名, 如 notification.user / log */
  channel: string
  /** 通道内目标键(用户名/服务名/taskId) */
  selector: string
  /** 收到业务消息(msg 帧) */
  onMessage: (data: any, channel: string, selector: string) => void
  /** 连接建立并完成订阅后回调(可选) */
  onOpen?: () => void
}

export interface WsBroadClient {
  close: () => void
}

const RECONNECT_DELAY_MS = 3000
const PING_INTERVAL_MS = 30000

export function createWsBroad(opts: WsBroadOptions): WsBroadClient {
  let socket: WebSocket | null = null
  let closed = false
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

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

  function connect() {
    socket = new WebSocket(opts.url)
    socket.onopen = () => {
      const token = typeof opts.token === 'function' ? opts.token() : opts.token
      if (token) {
        socket?.send(JSON.stringify({ op: 'auth', token }))
      }
      socket?.send(JSON.stringify({ op: 'sub', channel: opts.channel, selector: opts.selector }))
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
  }
}
