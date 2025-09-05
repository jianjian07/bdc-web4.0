import { Boot, IDomEditor, SlateTransforms } from '@wangeditor/editor'
import { defHttp } from "/@/utils/http/axios"
import { Element as SlateElement } from "slate"
import { addFileId, addUploadedFileId } from "/@/components/common/wangEditor/upload-attachment.ts"
import { message } from "ant-design-vue"

// 当前关联id
let currentId: string | number = ''

// 维护 src 到 dataId 的映射
export const srcToDataIdMap = new Map<string, string>()
// 维护 src 到 style 的映射
export const srcToStyleMap = new Map<string, { width?: string; height?: string }>()
// 维护 dataId -> dataURL 的映射（基于ID而不是URL，因为可能上传相同图片）
const dataIdToDataUrlMap = new Map<string, string>()
// 维护 dataId -> originalUrl 的映射
const dataIdToOriginalUrlMap = new Map<string, string>()

export function setImageId(id: string | number) {
  currentId = id
}

/**
 * 清空图片缓存
 */
export function clearImageCache() {
  dataIdToDataUrlMap.clear()
  dataIdToOriginalUrlMap.clear()
}

/**
 * 统一的 Slate 节点同步函数
 * @param editor 编辑器实例
 * @param dataId 图片ID
 * @param src 新的src值
 * @param originalSrc 原始URL
 */
function syncSlateNode(editor: IDomEditor, dataId: string, src: string, originalSrc: string) {
  try {
    ;(SlateTransforms as any).setNodes(
      editor as any,
      {
        src,
        originalSrc
      },
      {
        at: [],
        match: (n: any) => n && n.type === 'image' && String(n.dataId) === String(dataId)
      }
    )
  } catch (error) {
    console.warn('同步 Slate 节点失败:', error)
  }
}

/**
 * 从 Slate 节点中查找图片信息
 * @param editor 编辑器实例
 * @param src 图片的src值
 * @returns 图片信息 {dataId, originalSrc} 或 null
 */
export function findImageInfoFromSlate(editor: IDomEditor, src: string): {
  dataId: string;
  originalSrc: string
} | null {
  function searchNodes(nodes: any[]): { dataId: string; originalSrc: string } | null {
    for (const node of nodes) {
      if ((node as any).type === 'image') {
        const nodeSrc = (node as any).src || ''
        if (nodeSrc === src) {
          return {
            dataId: (node as any).dataId || '',
            originalSrc: (node as any).originalSrc || ''
          }
        }
      }
      if (Array.isArray((node as any).children)) {
        const found = searchNodes((node as any).children)
        if (found) return found
      }
    }
    return null
  }

  return searchNodes(editor.children)
}

/**
 * 根据 URL 推断 MIME（优先 fileName 参数，其次路径后缀）
 * @param originalUrl
 */
function inferMimeFromUrl(originalUrl: string) {
  const url = new URL(originalUrl, window.location.origin)
  const fileName = url.searchParams.get('fileName') || ''
  const name = (fileName || url.pathname.split('/').pop() || '').toLowerCase()
  if (name.endsWith('.svg')) return 'image/svg+xml'
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.gif')) return 'image/gif'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.bmp')) return 'image/bmp'
 
  return undefined
}

/** 将 Blob 转为 dataURL */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = err => reject(err)
    reader.readAsDataURL(blob)
  })
}

/** 直接获取并缓存 dataURL（避免后续任何请求） */
async function getStableDataUrl(originalUrl: string, dataId: string, mimeHint?: string): Promise<string> {
  const cached = dataIdToDataUrlMap.get(dataId)
  if (cached) return cached

  // console.log('发起download请求:', originalUrl, '调用栈:', new Error().stack)

  const blobRes = await defHttp.get({
    url: '/api/zrzy-system/common/upfiles/download',
    params: Object.fromEntries(new URL(originalUrl).searchParams.entries()),
    responseType: 'blob'
  }, { withToken: true })
  let type = (blobRes as Blob).type
  const inferred = mimeHint || inferMimeFromUrl(originalUrl)
  if (!type || type === 'application/octet-stream') {
    type = inferred || 'image/png'
  }
  const blob = new Blob([blobRes], { type })
  const dataUrl = await blobToDataUrl(blob)

  // 使用dataId作为key进行缓存
  dataIdToDataUrlMap.set(dataId, dataUrl)
  dataIdToOriginalUrlMap.set(dataId, originalUrl)
  return dataUrl
}

/**
 * 准备图片用于无缝显示
 * @param img
 */
function prepareImageForSeamlessDisplay(img: HTMLImageElement) {
  try {
    if ((img as any).__seamless_locked__) return
      ;
    (img as any).__seamless_locked__ = true
    const src = img.getAttribute('src') || ''
    const mapped = srcToStyleMap.get(src) || {}

    const lockWidth = mapped.width || img.style.width
    const lockHeight = mapped.height || img.style.height
    if (lockWidth && !img.style.width) {
      img.style.width = lockWidth
    }
    if (lockHeight && !img.style.height) {
      img.style.height = lockHeight
    }
  } catch {
  }
}

/**
 * 确保图片的显示URL是稳定的
 * @param img
 * @param originalUrl
 * @param dataId
 * @param mimeHint
 */
async function ensureStableDisplayUrl(img: HTMLImageElement, originalUrl: string, dataId: string, mimeHint?: string) {
  if (originalUrl.startsWith('blob:') || originalUrl.startsWith('data:')) return
  const needStable = originalUrl.includes('/zrzy-system/common/upfiles/download')
  if (!needStable) return

  // 检查是否已经有缓存的dataURL
  const cachedDataUrl = dataIdToDataUrlMap.get(dataId)
  if (cachedDataUrl) {
    img.src = cachedDataUrl
    applyImageAttributes(img, originalUrl)
    return
  }

  // 获取dataURL
  const inferred = mimeHint || inferMimeFromUrl(originalUrl)
  try {
    const dataUrl = await getStableDataUrl(originalUrl, dataId, inferred)
    img.src = dataUrl
    applyImageAttributes(img, originalUrl)
  } catch {
    console.warn('获取稳定显示URL失败:', originalUrl)
  }
}

/**
 * 创建SVG的Blob URL
 * @param originalUrl
 * @param imgElement
 * @param dataId
 */
async function createSvgBlobUrl(originalUrl: string, imgElement: HTMLImageElement, dataId: string) {
  try {
    // 检查是否已经有缓存的dataURL
    const cachedDataUrl = dataIdToDataUrlMap.get(dataId)
    if (cachedDataUrl) {
      imgElement.src = cachedDataUrl
      applyImageAttributes(imgElement, originalUrl)
      return
    }

    // 获取SVG的dataURL
    const dataUrl = await getStableDataUrl(originalUrl, dataId, 'image/svg+xml')
    imgElement.src = dataUrl
    applyImageAttributes(imgElement, originalUrl)
  } catch (error) {
    console.warn('创建SVG dataURL失败', error)
  }
}

/**
 * 初始化图片
 * @param editor
 */
export function initializeSvgImages(editor: IDomEditor) {
  if (!editor) return
  const container = editor.getEditableContainer()
  if (!container) return

  const allImages = container.querySelectorAll('img')
  allImages.forEach(img => {
    const imgElement = img as HTMLImageElement
    const src = imgElement.getAttribute('src') || ''
    const originalUrl = imgElement.getAttribute('data-original-src') || src
    const dataId = imgElement.getAttribute('data-id') || ''

    // 优先检查是否有缓存的dataURL（基于dataId）
    const cachedDataUrl = dataIdToDataUrlMap.get(dataId)
    if (cachedDataUrl) {
      // 如果有缓存，直接使用缓存的dataURL
      imgElement.src = cachedDataUrl
      applyImageAttributes(imgElement, originalUrl)
      prepareImageForSeamlessDisplay(imgElement)
      return
    }

    // 如果图片src已经是dataURL，说明已经是base64了，需要缓存
    if (src.startsWith('data:')) {
      // 将base64缓存到dataIdToDataUrlMap中
      if (dataId) {
        // console.log('initializeSvgImages - 缓存base64到dataId:', dataId, 'base64长度:', src.length)
        dataIdToDataUrlMap.set(dataId, src)
        dataIdToOriginalUrlMap.set(dataId, originalUrl)
      }
      // 设置属性
      applyImageAttributes(imgElement, originalUrl)
      prepareImageForSeamlessDisplay(imgElement)
      return
    }

    // 如果src为空但有data-original-src，需要从data-original-src获取图片
    if (!src && originalUrl && dataId) {
      const isSvg = imgElement.getAttribute('data-is-svg') === 'true' ||
        imgElement.classList.contains('svg-image') ||
        originalUrl.toLowerCase().includes('.svg')

      // 统一设置属性
      applyImageAttributes(imgElement, originalUrl)
      prepareImageForSeamlessDisplay(imgElement)

      if (isSvg) {
        imgElement.setAttribute('data-is-svg', 'true')
        imgElement.classList.add('svg-image')
        createSvgBlobUrl(originalUrl, imgElement, dataId).catch(err => console.warn('初始化SVG显示失败:', err))
      } else {
        // 只有需要稳定化的图片才调用 ensureStableDisplayUrl
        if (originalUrl.includes('/zrzy-system/common/upfiles/download')) {
          ensureStableDisplayUrl(imgElement, originalUrl, dataId).catch(() => {
          })
        }
      }
      return
    }

    // 其他情况（如本地图片）
    if (src) {
      applyImageAttributes(imgElement, originalUrl)
      prepareImageForSeamlessDisplay(imgElement)
    }
  })
}

export function registerImageModule() {
  if ((window as any).__wangeditor_image_registered__) return
    ;
  (window as any).__wangeditor_image_registered__ = true
  const elemToHtmlConf = { type: 'image', elemToHtml: imageToHtml }
  const parseHtmlConf = { selector: 'img[data-w-e-type="image"]', parseElemHtml: parseImageHtml }
  const module = { parseElemsHtml: [parseHtmlConf], elemsToHtml: [elemToHtmlConf] }
  Boot.registerModule(module)
}

/**
 * 生成图片的html
 * @param elem
 * @param childrenHtml
 */
function imageToHtml(elem: SlateElement, _childrenHtml: string): string {
  const { src = '', alt = '', dataId = '', style = {}, isSvg = false, originalSrc: nodeOriginalSrc = '' } = elem as any
  let styleStr = 'max-width: 100%;'
  if (style.width) styleStr += ` width: ${style.width};`
  if (style.height) styleStr += ` height: ${style.height};`

  // 获取原始URL - 优先使用节点中的originalSrc，然后从缓存中获取，最后使用当前src
  let originalSrc = nodeOriginalSrc || src
  if (!originalSrc && dataId) {
    const cachedOriginalUrl = dataIdToOriginalUrlMap.get(dataId)
    if (cachedOriginalUrl) {
      originalSrc = cachedOriginalUrl
    }
  }

  // 如果src是download URL，渲染时src为空，data-original-src为download URL
  if (src.includes('/zrzy-system/common/upfiles/download')) {
    const extraOriginalAttr = ` data-original-src="${src}"`
    const extraSvgAttr = isSvg ? ` data-is-svg="true" class="svg-image"` : ''
    const dataIdAttr = dataId ? ` data-id="${dataId}"` : ''
    return `<img src="" alt="${alt || ''}" data-w-e-type="image"${dataIdAttr}${extraSvgAttr}${extraOriginalAttr} style="${styleStr}" />`
  }

  // 如果src是base64，需要设置data-original-src为原始URL
  if (src.startsWith('data:')) {
    const extraOriginalAttr = originalSrc ? ` data-original-src="${originalSrc}"` : ''
    const extraSvgAttr = isSvg ? ` data-is-svg="true" class="svg-image"` : ''
    const dataIdAttr = dataId ? ` data-id="${dataId}"` : ''
    return `<img src="${src}" alt="${alt || ''}" data-w-e-type="image"${dataIdAttr}${extraSvgAttr}${extraOriginalAttr} style="${styleStr}" />`
  }

  // 其他情况（如本地图片），也需要设置data-original-src
  const extraOriginalAttr = originalSrc ? ` data-original-src="${originalSrc}"` : ''
  const extraSvgAttr = isSvg ? ` data-is-svg="true" class="svg-image"` : ''
  const dataIdAttr = dataId ? ` data-id="${dataId}"` : ''
  return `<img src="${src}" alt="${alt || ''}" data-w-e-type="image"${dataIdAttr}${extraSvgAttr}${extraOriginalAttr} style="${styleStr}" />`
}

/**
 * 解析html 生成图片元素
 * @param domElem
 * @param children
 * @param editor
 */
function parseImageHtml(domElem: Element, _children: any[], _editor: IDomEditor): SlateElement {
  const $elem = domElem as HTMLImageElement
  const attrOriginal = $elem.getAttribute('data-original-src') || ''
  const currentSrc = $elem.getAttribute('src') || ''
  let dataId = $elem.getAttribute('data-id') || ''

  // 如果没有dataId，尝试从映射中恢复
  if (!dataId && attrOriginal) {
    dataId = srcToDataIdMap.get(attrOriginal) || ''
    if (dataId) {
      // 恢复DOM属性
      $elem.setAttribute('data-id', dataId)
    }
  }

  // 优先检查是否有缓存的base64
  const cachedDataUrl = dataIdToDataUrlMap.get(dataId)
  if (cachedDataUrl) {
    // 如果有缓存的base64，使用base64作为src
    const style = srcToStyleMap.get(attrOriginal || currentSrc) || {}
    const isSvg = $elem.getAttribute('data-is-svg') === 'true' || $elem.classList.contains('svg-image') || attrOriginal.toLowerCase().includes('.svg')

    return {
      type: 'image',
      src: cachedDataUrl, // 使用缓存的base64
      alt: $elem.getAttribute('alt') || '',
      dataId,
      originalSrc: attrOriginal || currentSrc, // 确保保持原始URL信息
      width: $elem.style.width || style?.width || '',
      height: $elem.style.height || style?.height || '',
      isSvg,
      style: { width: $elem.style.width || style?.width || '', height: $elem.style.height || style?.height || '' },
      children: [{ text: '' }],
    } as any
  }

  // 如果没有缓存，按原逻辑处理
  let originalSrc = currentSrc
  if (!currentSrc && attrOriginal) {
    originalSrc = attrOriginal
  } else if (currentSrc.startsWith('data:')) {
    originalSrc = currentSrc
  }

  // 使用data-original-src来查找映射关系（如果存在）
  const mappingKey = attrOriginal || originalSrc
  const style = srcToStyleMap.get(mappingKey) || {}
  const isSvg = $elem.getAttribute('data-is-svg') === 'true' || $elem.classList.contains('svg-image') || originalSrc.toLowerCase().includes('.svg')

  return {
    type: 'image',
    src: originalSrc,
    alt: $elem.getAttribute('alt') || '',
    dataId,
    originalSrc: attrOriginal || originalSrc, // 确保保持原始URL信息
    width: $elem.style.width || style?.width || '',
    height: $elem.style.height || style?.height || '',
    isSvg,
    style: { width: $elem.style.width || style?.width || '', height: $elem.style.height || style?.height || '' },
    children: [{ text: '' }],
  } as any
}

/**
 * 同步 data-id 到 DOM 的函数
 * @param editor
 */
export function syncImageDataIdToDom(editor: IDomEditor) {
  if (!editor) return
  const container = editor.getEditableContainer()
  if (!container) return
  const imgs = container.querySelectorAll('img')

  imgs.forEach(img => {
    const src = img.getAttribute('src') || ''
    let originalUrl = img.getAttribute('data-original-src') || ''
    let dataId = img.getAttribute('data-id') || ''

    // 如果图片没有data-id或data-original-src，尝试从 Slate 节点中查找
    if (!dataId || !originalUrl) {
      const slateInfo = findImageInfoFromSlate(editor, src)
      if (slateInfo) {
        if (!dataId && slateInfo.dataId) {
          dataId = slateInfo.dataId
          img.setAttribute('data-id', dataId)
        }
        if (!originalUrl && slateInfo.originalSrc) {
          originalUrl = slateInfo.originalSrc
          img.setAttribute('data-original-src', originalUrl)
        }
      }
    }

    // 尝试从映射中查找
    if (!dataId && originalUrl) {
      dataId = srcToDataIdMap.get(originalUrl) || ''
      if (dataId) {
        img.setAttribute('data-id', dataId)
      }
    }

    // 回填属性（data-id/type/svg/style）
    applyImageAttributes(img as HTMLImageElement, originalUrl)

    // 优先检查是否有缓存的dataURL（基于dataId），如果有就立即使用
    const cachedDataUrl = dataIdToDataUrlMap.get(dataId)
    if (cachedDataUrl) {
      // 如果当前src不是缓存的dataURL，立即替换
      if ((img as HTMLImageElement).src !== cachedDataUrl) {
        (img as HTMLImageElement).src = cachedDataUrl
      }
      // 使用统一的同步函数
      syncSlateNode(editor, dataId, cachedDataUrl, originalUrl)
      prepareImageForSeamlessDisplay(img as HTMLImageElement)
      return // 有缓存就直接返回，不进行后续处理
    }

    // 如果没有缓存且是download URL且有dataId，才进行转换
    if (originalUrl.includes('download') && dataId) {
      const isSvg = (img.getAttribute('data-is-svg') === 'true') || originalUrl.toLowerCase().includes('.svg')
      if (isSvg) {
        createSvgBlobUrl(originalUrl, img as HTMLImageElement, dataId).catch(error => console.warn('同步时创建SVG dataURL失败:', error))
      } else {
        // 稳定化显示
        ensureStableDisplayUrl(img as HTMLImageElement, originalUrl, dataId).catch(() => {
        })
      }
    }

    // 尺寸锁定
    prepareImageForSeamlessDisplay(img as HTMLImageElement)
  })
}

/**
 * 图片上传
 * @param insertFn
 * @param editor
 */
export async function customBrowseAndUploadFunc(_insertFn: Function, editor: IDomEditor) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    if (!currentId) {
      message.warning('请先保存当前内容后再上传图片')
      return
    }
    const files = input.files
    if (!files || files.length === 0) return
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }
      formData.append('keyValue', String(currentId))
      formData.append('keyGroup', '1')
      const res = await defHttp.post(
        {
          url: '/api/zrzy-system/common/upfiles/uploadBatch',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' }
        },
        { withToken: true }
      )
      if (res && res.code === 200 && Array.isArray(res.result)) {
        for (const file of res.result) {
          const filePath = file.filePath
          const fileName = file.fileName
          const id = file.id
          const ext = (fileName.toLowerCase().split('.').pop() || '')
          const isSvgFile = ext === 'svg'
          const originalUrl = `${(window as any).settingConfig?.proxyBaseDomain || ''}/zrzy-system/common/upfiles/download?filePath=${encodeURIComponent(filePath)}&fileName=${encodeURIComponent(fileName)}`
          let displayUrl = originalUrl
          displayUrl = await getStableDataUrl(originalUrl, String(id), isSvgFile ? 'image/svg+xml' : undefined)
          editor.restoreSelection()
          const imageNode = {
            type: 'image',
            src: originalUrl,
            alt: fileName,
            dataId: id,
            originalSrc: originalUrl,
            children: [{ text: '' }],
            isSvg: isSvgFile
          } as any
          editor.insertNode(imageNode)
          srcToDataIdMap.set(originalUrl, id)
          srcToStyleMap.set(originalUrl, {})
          setTimeout(() => {
            const container = editor.getEditableContainer()
            const imgs = container?.querySelectorAll(`img[src="${originalUrl}"]`)
            imgs?.forEach(img => {
              const el = img as HTMLImageElement
              el.setAttribute('data-original-src', originalUrl)
              el.src = displayUrl
              applyImageAttributes(el, originalUrl)
              prepareImageForSeamlessDisplay(el)
            })

            // 使用统一的同步函数更新 Slate 节点
            syncSlateNode(editor, String(id), displayUrl, originalUrl)

            addFileId(id)
            addUploadedFileId(String(id))
          }, 30)
        }
      } else {
        message.warning('上传失败，返回格式异常')
      }
    } catch (err) {
      message.warning('图片上传失败')
    }
  }
  input.click()
}

/**
 * 根据 originalUrl 回填/保持 DOM 属性，确保统计与保存不丢失
 * @param img
 * @param originalUrl
 */
function applyImageAttributes(img: HTMLImageElement, originalUrl: string) {
  try {
    if (originalUrl) img.setAttribute('data-original-src', originalUrl)
    img.setAttribute('data-w-e-type', 'image')
    const mappedId = srcToDataIdMap.get(originalUrl)
    if (mappedId) img.setAttribute('data-id', mappedId)
    const isSvg = originalUrl.toLowerCase().includes('.svg') || img.getAttribute('data-is-svg') === 'true' || img.classList.contains('svg-image')
    if (isSvg) {
      img.setAttribute('data-is-svg', 'true')
      img.classList.add('svg-image')
    }
    const style = srcToStyleMap.get(originalUrl) || {}
    if (style.width && !img.style.width) {
      img.style.width = style.width
    }
    if (style.height && !img.style.height) {
      img.style.height = style.height
    }
  } catch {
  }
}