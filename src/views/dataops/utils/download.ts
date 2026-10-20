/**
 * 触发后端导出文件下载（带鉴权的 blob 方案）
 *
 * <p>原 db-web 用 window.open 直开 GET URL，但本项目所有 /api/** 均要求
 * Authorization + xSign 请求头，裸开必 401（请求未认证）。改为 defHttp
 * 携带 token 取回文件流，再经 Blob URL 触发浏览器保存。</p>
 *
 * <p>沿用项目既有范式（ProcessImg.vue 等）：
 * responseType: 'blob' + isTransformResponse: false 拿到原始 AxiosResponse，
 * res.data 即 Blob，文件名优先取 Content-Disposition。</p>
 */
import { defHttp } from '/@/utils/http/axios'
import { $error } from '../../../utils/message'

/**
 * 解析下载失败的真实原因: 优先读后端响应体(ErrorResponse JSON 被包成 Blob),
 * 提取 message/exceptionId; 拿不到时退回 axios 错误消息。
 */
async function resolveErrorMessage(e: unknown): Promise<string> {
  const base = e instanceof Error ? e.message : String(e)
  const data: any = (e as any)?.response?.data
  if (data instanceof Blob) {
    try {
      const text = await data.text()
      try {
        const body = JSON.parse(text)
        const detail = body?.message ?? body?.msg
        if (detail) {
          const eid = body?.exceptionId ? ` [异常ID: ${body.exceptionId}]` : ''
          return `${base}—— 后端: ${detail}${eid}`
        }
      } catch { /* 非 JSON, 原样截断返回 */ }
      if (text) return `${base}—— 响应: ${text.slice(0, 200)}`
    } catch { /* 忽略读取失败 */ }
  }
  return base
}

export async function openDownload(url: string) {
  try {
    const res: any = await defHttp.get({ url, responseType: 'blob' }, {
      withToken: true,
      isTransformResponse: false
    })
    const blob = res?.data
    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error('响应不是有效的文件流')
    }
    // 鉴权通过但业务失败时, Result(JSON) 也会被包成 Blob —— 提前识别,
    // 避免"成功下载了一个 json 文件"这种难以排查的现象
    if (blob.type && blob.type.includes('json')) {
      const text = await blob.text()
      throw new Error(`接口返回错误: ${text.slice(0, 200)}`)
    }
    // 文件名: 优先 Content-Disposition(后端 attachment; filename=xxx), 回落 URL 尾段
    const disposition: string = res?.headers?.['content-disposition'] ?? ''
    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition)
    const fallback = url.slice(url.lastIndexOf('/') + 1) || 'download'
    const name = decodeURIComponent((match?.[1] ?? fallback).trim())
    // Blob URL + 隐藏 a 标签触发保存, 用后即毁
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (e) {
    $error('下载失败: ' + (await resolveErrorMessage(e)))
  }
}
