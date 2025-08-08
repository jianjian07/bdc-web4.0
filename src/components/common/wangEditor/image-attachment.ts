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
function imageToHtml(elem: SlateElement, childrenHtml: string): string {
  const { src = '', alt = '', dataId = '', style = {} } = elem as any
  let styleStr = 'max-width: 100%;'
  if (style.width) styleStr += ` width: ${style.width};`
  if (style.height) styleStr += ` height: ${style.height};`
  // console.log('imageToHtml style:', style)
  return `<img 
    src="${src}" 
    alt="${alt || ''}" 
    data-w-e-type="image"
    data-id="${dataId || ''}"
    style="${styleStr}"
  />`
}

/**
 * 解析html 生成图片元素
 * @param domElem
 * @param children
 * @param editor
 */
function parseImageHtml(domElem: Element, children: any[], editor: IDomEditor): SlateElement {
  const $elem = domElem as HTMLImageElement
  const dataId = srcToDataIdMap.get($elem.src) || $elem.getAttribute('data-id') || ''
  const style = srcToStyleMap.get($elem.src) || {}
  return {
    type: 'image',
    src: $elem.getAttribute('src') || '',
    alt: $elem.getAttribute('alt') || '',
    dataId: dataId,
    width: $elem.style.width || style?.width || '',
    height: $elem.style.height || style?.height || '',
    // 新增：合并样式数据
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
      }
    }
  })
}

/**
 * 图片上传
 * @param insertFn
 * @param editor
 */
export async function customBrowseAndUploadFunc(insertFn: Function, editor: IDomEditor) {
  const input = document.createElement('input')
  input.type = 'file'
  // input.accept = 'image/*' 
  // svg的有点问题暂时不考虑
  input.accept = '.jpg,.jpeg,.png,.gif'

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
        res.result.forEach((file: any) => {
          const filePath = file.filePath
          const fileName = file.fileName
          const id = file.id
          const downloadUrl = `${(window as any).settingConfig?.proxyBaseDomain || ''}/zrzy-system/common/upfiles/download?filePath=${encodeURIComponent(
            filePath
          )}&fileName=${encodeURIComponent(fileName)}`

          editor.restoreSelection() // 确保光标位置
          editor.insertNode({
            type: 'image',
            src: downloadUrl,
            alt: fileName,
            dataId: id,
            children: [{ text: '' }],
          } as any)
          
          // 维护 src 到 dataId 的映射
          srcToDataIdMap.set(downloadUrl, id)
          srcToStyleMap.set(downloadUrl, {}) // 初始化空样式
          
          // 插入后立即同步 data-id 到 DOM
          setTimeout(() => {
            
            syncImageDataIdToDom(editor)
            addFileId(id)
            addUploadedFileId(String(id))
          }, 100)
          
          // console.log('插入图片后的HTML:', editor.getHtml())
        })
      } else {
        message.warning('上传失败，返回格式异常')
      }
    } catch (err) {
      message.warning('图片上传失败')
    }
  }

  input.click()
}