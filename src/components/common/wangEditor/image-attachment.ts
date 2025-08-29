import { Boot, IDomEditor } from '@wangeditor/editor'
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

export function setImageId(id: string | number) {
  currentId = id
}

/**
 * 为SVG创建blob URL用于显示（读取时使用）
 * @param originalUrl 原始URL
 * @param imgElement 图片DOM元素
 */
async function createSvgBlobUrl(originalUrl: string, imgElement: HTMLImageElement) {
  try {
    // 解析URL获取参数
    const url = new URL(originalUrl)
    const filePath = decodeURIComponent(url.searchParams.get('filePath') || '')
    const fileName = decodeURIComponent(url.searchParams.get('fileName') || '')
    
    if (!filePath || !fileName) {
      throw new Error('无法解析文件路径参数')
    }

    // 获取SVG文件内容
    const blobRes = await defHttp.get({
      url: '/api/zrzy-system/common/upfiles/download',
      params: {
        filePath: filePath,
        fileName: fileName
      },
      responseType: 'blob'
    }, { withToken: true })

    if (blobRes.size > 0) {
      // 创建blob URL
      const blob = new Blob([blobRes], { type: 'image/svg+xml' })
      const blobUrl = URL.createObjectURL(blob)
      
      // 替换DOM中的src
      imgElement.src = blobUrl
      
      // 当图片从DOM中移除时释放blob
      const observer = new MutationObserver(() => {
        if (!document.contains(imgElement)) {
          URL.revokeObjectURL(blobUrl)
          observer.disconnect()
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }
  } catch (error) {
    console.warn('创建SVG blob URL失败', error)
  }
}

/**
 * 初始化编辑器中的所有SVG图片（在编辑器设置内容后调用）
 * @param editor
 */
export function initializeSvgImages(editor: IDomEditor) {
  if (!editor) return
  const container = editor.getEditableContainer()
  if (!container) return

  // 查找所有的SVG图片
  const allImages = container.querySelectorAll('img')
  
  allImages.forEach(img => {
    const imgElement = img as HTMLImageElement
    const src = imgElement.getAttribute('src')
    if (!src) return

    // 检测是否为SVG文件
    const isSvg = imgElement.getAttribute('data-is-svg') === 'true' || 
                 imgElement.classList.contains('svg-image') ||
                 src.toLowerCase().includes('.svg')

    if (isSvg) {
      imgElement.setAttribute('data-is-svg', 'true')
      imgElement.classList.add('svg-image')
      
      // 如果src是原始下载地址 转换为blob URL
      if (src.includes('download') && !src.startsWith('blob:')) {
        createSvgBlobUrl(src, imgElement).catch(error => {
          console.warn('初始化SVG显示失败:', error)
        })
      }
    }
  })
}

/**
 * 注册图片模块
 */
export function registerImageModule() {
  if ((window as any).__wangeditor_image_registered__) return
  (window as any).__wangeditor_image_registered__ = true

  const elemToHtmlConf = {
    type: 'image',
    elemToHtml: imageToHtml,
  }
  const parseHtmlConf = {
    selector: 'img[data-w-e-type="image"]',
    parseElemHtml: parseImageHtml,
  }
  const module = {
    parseElemsHtml: [parseHtmlConf],
    elemsToHtml: [elemToHtmlConf],
    // 不自定义 renderElem，保留原生拖拽缩放功能
  }
  Boot.registerModule(module)
}

/**
 * 生成图片的html
 * @param elem
 * @param childrenHtml
 */
function imageToHtml(elem: SlateElement, _childrenHtml: string): string {
  const { src = '', alt = '', dataId = '', style = {}, isSvg = false } = elem as any
  let styleStr = 'max-width: 100%;'
  if (style.width) styleStr += ` width: ${style.width};`
  if (style.height) styleStr += ` height: ${style.height};`
  
  // console.log('imageToHtml style:', style)
  return `<img 
    src="${src}" 
    alt="${alt || ''}" 
    data-w-e-type="image"
    data-id="${dataId || ''}"
    data-is-svg="${isSvg ? 'true' : 'false'}"
    class="${isSvg ? 'svg-image' : ''}"
    style="${styleStr}"
  />`
}

/**
 * 解析html 生成图片元素
 * @param domElem
 * @param children
 * @param editor
 */
function parseImageHtml(domElem: Element, _children: any[], _editor: IDomEditor): SlateElement {
  const $elem = domElem as HTMLImageElement
  const originalSrc = $elem.getAttribute('src') || ''
  const dataId = srcToDataIdMap.get(originalSrc) || $elem.getAttribute('data-id') || ''
  const style = srcToStyleMap.get(originalSrc) || {}
  const isSvg = $elem.getAttribute('data-is-svg') === 'true' || 
               $elem.classList.contains('svg-image') ||
               originalSrc.toLowerCase().includes('.svg')
  
  // 如果是SVG文件，在读取时创建blob URL用于显示
  if (isSvg && originalSrc && !originalSrc.startsWith('blob:')) {
    // 创建blob URL并替换DOM中的显示
    createSvgBlobUrl(originalSrc, $elem).catch(error => {
      console.warn('读取时创建SVG blob URL失败:', error)
    })
  } 
  
  return {
    type: 'image',
    src: originalSrc, // 始终保存原始URL到数据结构中
    alt: $elem.getAttribute('alt') || '',
    dataId: dataId,
    width: $elem.style.width || style?.width || '',
    height: $elem.style.height || style?.height || '',
    isSvg: isSvg,
    style: {
      width: $elem.style.width || style?.width || '',
      height: $elem.style.height || style?.height || ''
    },
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
  
  // 查找所有图片节点（包括原生图片和自定义图片）
  const imgs = container.querySelectorAll('img')
  imgs.forEach(img => {
    // 如果 DOM 里没有 data-id，从映射中获取
    const src = img.getAttribute('src')
    if (!src) return
    
    // console.log('同步前状态:', {
    //   src,
    //   domDataId: img.getAttribute('data-id'),
    //   mapDataId: srcToDataIdMap.get(src)
    // })

    // 只有当映射存在且与DOM不一致时才更新
    const mapDataId = srcToDataIdMap.get(src)
    const currentDataId = img.getAttribute('data-id')
    
    if (mapDataId && currentDataId !== mapDataId) {
      // console.log('需要更新data-id:', { 当前值: currentDataId, 映射值: mapDataId })
      img.setAttribute('data-id', mapDataId)
      
      if (img.getAttribute('alt') !== 'attachment-file-icon') {
        img.setAttribute('data-w-e-type', "image")
        
        const isSvg = src.toLowerCase().includes('.svg')
        if (isSvg) {
          img.setAttribute('data-is-svg', 'true')
          img.classList.add('svg-image')
        }
      }
    }

    // 检查并转换SVG图片
    const imgElement = img as HTMLImageElement
    const isSvg = img.getAttribute('data-is-svg') === 'true' || 
                 img.classList.contains('svg-image') ||
                 src.toLowerCase().includes('.svg')
    
    if (isSvg && src && !src.startsWith('blob:') && src.includes('download')) {
      // 为已存在的SVG图片创建blob URL
      createSvgBlobUrl(src, imgElement).catch(error => {
        console.warn('同步时创建SVG blob URL失败:', error)
      })
    }
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
          headers: { 'Content-Type': 'multipart/form-data' },
        },
        { withToken: true }
      )
      if (res && res.code === 200 && Array.isArray(res.result)) {
        for (const file of res.result) {
          const filePath = file.filePath
          const fileName = file.fileName
          const id = file.id
          // 检查是否为图片文件
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp']
          const fileExtension = fileName.toLowerCase().split('.').pop() || ''
          const isImageFile = imageExtensions.includes(fileExtension)
          const isSvgFile = fileExtension === 'svg'
          
          // 构建原始下载URL
          const originalUrl = `${(window as any).settingConfig?.proxyBaseDomain || ''}/zrzy-system/common/upfiles/download?filePath=${encodeURIComponent(
            filePath
          )}&fileName=${encodeURIComponent(fileName)}`
          
          let displayUrl = originalUrl

          // SVG文件特殊处理：创建blob URL用于即时显示
          if (isSvgFile) {
            try {
              const blobRes = await defHttp.get({
                url: '/api/zrzy-system/common/upfiles/download',
                params: {
                  filePath: filePath,
                  fileName: fileName
                },
                responseType: 'blob'
              }, { withToken: true })
              
              if (blobRes.size > 0) {
                // 创建blob URL用于显示
                const blob = new Blob([blobRes], { type: 'image/svg+xml' })
                displayUrl = URL.createObjectURL(blob)
              }
            } catch (error) {
              console.warn('获取SVG blob失败，使用原始URL:', error)
              displayUrl = originalUrl + '&inline=true'
            }
          } else if (isImageFile) {
            // 其他图片类型尝试添加inline参数
            displayUrl = originalUrl + '&inline=true'
          }

          editor.restoreSelection() // 确保光标位置
          
          // 保存原始URL到HTML 但替换为displayUrl显示
          const imageNode = {
            type: 'image',
            src: originalUrl,
            alt: fileName,
            dataId: id,
            children: [{ text: '' }],
            isSvg: isSvgFile
          } as any

          editor.insertNode(imageNode)
          
          // 维护映射关系（使用原始URL）
          srcToDataIdMap.set(originalUrl, id)
          srcToStyleMap.set(originalUrl, {})
          
          // 插入后立即同步 data-id 到 DOM , 且立即替换DOM中的显示URL
          setTimeout(() => {
            syncImageDataIdToDom(editor)
            addFileId(id)
            addUploadedFileId(String(id))
            
            // 替换DOM中的src为可显示的URL
            if (displayUrl !== originalUrl) {
              const container = editor.getEditableContainer()
              const imgs = container?.querySelectorAll(`img[src="${originalUrl}"]`)
              imgs?.forEach(img => {
                (img as HTMLImageElement).src = displayUrl
              })
            }
          }, 100)
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