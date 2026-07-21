// 自定义菜单类
import { IButtonMenu, IDomEditor, SlateElement, DomEditor, SlateDescendant } from '@wangeditor/editor'
import { h, VNode } from 'snabbdom'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'
import { getUrl } from '/@/utils'
import { Boot } from '@wangeditor/editor'
import { ref } from "vue"

// 当前关联id
let currentId: string | number = ''
// 上传的文件id
export const uploadedFileIds = ref(new Set<string | number>())
// 初始的文件id
export const initialFileIds = ref(new Set<string | number>())
// 当前的文件id
export const currentFileIds = ref(new Set<string | number>())

/**
 * 设置当前通知公告id
 * @param id
 */
export function setUploadId(id: string | number) {
  currentId = id
}

/**
 * 添加当前文件id
 * @param id
 */
export function addFileId(id: string | number) {
  currentFileIds.value.add(id)
}

/**
 * 添加上传的文件id
 * @param id
 */
export function addUploadedFileId(id: string) {
  uploadedFileIds.value.add(id)
}

/**
 * 获取已上传的文件id
 */
export function getUploadedFileIds() {
  return Array.from(uploadedFileIds.value)
}

/**
 * 获取删除的文件id
 */
export function getDeletedFileIds() {
  // 初始有但现在没有的
  return Array.from(initialFileIds.value).filter(id => !currentFileIds.value.has(id))
}

function withAttachment<T extends IDomEditor>(editor: T) {
  const { isInline, isVoid } = editor
  const newEditor = editor

  newEditor.isInline = (elem) => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'attachment') return true // 针对 type: attachment ，设置为 inline
    return isInline(elem)
  }

  newEditor.isVoid = (elem) => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'attachment') return true // 针对 type: attachment ，设置为 void
    return isVoid(elem)
  }

  return newEditor
}

// 注册附件上传模块
export function registerUploadAttachmentModule() {
  if ((window as any).__wangeditor_attachment_registered__) return
  const renderElemConf = {
    type: 'attachment', // 新元素 type 
    renderElem: renderAttachment,
  }

  const elemToHtmlConf = {
    type: 'attachment', // 新元素的 type
    elemToHtml: attachmentToHtml,
  }

  const parseHtmlConf = {
    selector: 'span[data-w-e-type="attachment"]', // CSS 选择器，匹配特定的 HTML 标签
    parseElemHtml: parseAttachmentHtml,
  }

  const module = {
    editorPlugin: withAttachment,
    parseElemsHtml: [parseHtmlConf /* 其他元素... */],
    elemsToHtml: [elemToHtmlConf /* 其他元素... */],
    renderElems: [renderElemConf /* 其他元素... */],
  }
  Boot.registerModule(module)

  // 注册按钮菜单
  Boot.registerMenu({
    key: 'uploadAttachment',
    factory: () => new UploadAttachment()
  })
  ;(window as any).__wangeditor_attachment_registered__ = true
}

/**
 * 上传附件按钮
 */
class UploadAttachment implements IButtonMenu {
  title = '上传附件'
  iconSvg = `<svg t="1753426334196" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2702" width="1em" height="1em" fill="currentColor" >
<g transform="scale(1.2) translate(-100, -100)">
<path d="M726.528 877.714286H608.548571c-11.849143 0-19.382857-12.873143-19.382857-24.064 0-11.190857 7.533714-25.746286 19.382857-25.746286h113.371429a23.771429 23.771429 0 0 1 3.657143 0c94.939429-5.12 163.84-63.634286 173.129143-152.941714 9.362286-89.307429-49.590857-170.861714-141.604572-193.462857a20.699429 20.699429 0 0 1-16.091428-17.554286C728.868571 350.134857 633.270857 268.946286 512 268.946286c-121.344 0-218.916571 83.968-231.058286 197.778285a20.48 20.48 0 0 1-16.164571 17.554286c-92.013714 22.601143-147.090286 99.474286-137.728 188.781714 9.362286 89.307429 76.434286 149.650286 171.373714 154.843429a25.014857 25.014857 0 0 1 3.657143 0H512c11.849143 0 22.235429 7.533714 21.430857 26.770286-0.731429 18.139429-9.581714 23.04-21.430857 23.04H297.252571a22.381714 22.381714 0 0 1-6.070857-0.804572c-112.420571-8.192-202.898286-90.112-216.356571-195.657143-13.385143-105.618286 54.125714-205.385143 161.206857-238.299428C256.950857 314.368 374.125714 219.428571 512 219.428571c137.728 0 254.902857 94.939429 275.821714 223.378286 107.154286 32.914286 174.811429 132.900571 161.426286 238.592-13.458286 105.691429-104.228571 187.611429-216.722286 195.657143a25.453714 25.453714 0 0 1-5.851428 0.658286z" fill="#333333" p-id="2703"></path>
<path d="M588.8 735.085714l-7.314286-7.314285a71.314286 71.314286 0 0 0 7.314286 7.314285z" fill="#17A7FB" p-id="2704"></path>
<path d="M614.107429 607.524571l-1.755429-1.682285-91.794286-87.552a23.259429 23.259429 0 0 0-31.744 0l-91.428571 87.259428-2.121143 1.974857a27.062857 27.062857 0 0 0-6.582857 26.258286 28.525714 28.525714 0 0 0 16.822857 18.285714 30.793143 30.793143 0 0 0 28.672-3.145142 26.258286 26.258286 0 0 0 6.363429-6.144l33.206857-31.744v245.174857c0 11.849143 13.824 21.504 30.866285 21.504 17.115429 0 30.866286-9.654857 30.866286-21.504V611.035429l34.962286 33.426285 3.218286 3.072c5.12 4.242286 11.702857 6.656 18.944 6.656a28.525714 28.525714 0 0 0 29.110857-27.794285 26.112 26.112 0 0 0-7.606857-18.870858z" fill="#333333" p-id="2705"></path>
</g>
</svg>`
  tag = 'button'
  readonlyTooltip = '上传附件'

  getValue(): string | boolean {
    return ''
  }

  isActive(): boolean {
    return false
  }

  isDisabled(): boolean {
    return false
  }

  async exec(editor: IDomEditor) {
    if (!currentId) {
      message.warning('请先保存当前内容后再上传附件')
      return
    }
    // 创建一个隐藏的文件选择 input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '*' // 接受所有类型
    input.style.display = 'none'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('files', file)
      formData.append('keyValue', currentId)
      formData.append('keyGroup', '1')

      try {
        const res = await defHttp.post(
          {
            url: '/api/zrzy-system/common/upfiles/uploadBatch',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          },
          { withToken: true }
        )

        if (res.code === 200 && res.result?.length > 0) {
          const { fileName, filePath, fileSize, id } = res.result[0]
          const downloadUrl = `${window.settingConfig.proxyBaseDomain}/zrzy-system/common/upfiles/download?filePath=${encodeURIComponent(filePath)}&fileName=${encodeURIComponent(fileName)}`
          addFileId(id) // 维护当前id集合
          addUploadedFileId(String(id)) // 新上传集合

          editor.restoreSelection()
          editor.insertNode({
            type: 'attachment',
            fileName,
            fileSize: formatFileSize(fileSize),
            id: id,
            url: downloadUrl,
            children: [{ text: '' }]
          })
          
        } else {
          message.warning('附件上传失败')
        }
      } catch (err) {
        // console.error('附件上传错误:', err)
        message.warning('附件上传异常')
      }
    }

    document.body.appendChild(input)
    input.click()

    // 清理
    setTimeout(() => document.body.removeChild(input), 1000)
  }
}

/**
 * 渲染“附件”元素到编辑器
 * @param elem 附件元素
 * @param children 元素子节点，void 元素可忽略
 * @param editor 编辑器实例
 * @returns vnode 节点（通过 snabbdom.js 的 h 函数生成）
 */
function renderAttachment(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const { fileName = '', url = '', fileSize = '', id = '' } = elem as any
  const filePng = getUrl('images/user/download.png')
  // 容器卡片
  const container = h('div', {
    props: { contentEditable: false },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      verticalAlign: 'bottom',
      gap: '12px',
      padding: '8px 12px',
      border: '1px solid #eee',
      borderRadius: '6px',
      backgroundColor: '#f8f8f8',
      width: '100%',
      maxWidth: '280px',
      margin: '6px 0',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    },
    hook: {
      insert(vnode) {
        const el = vnode.elm as HTMLElement
        // 手动设置 data-id 属性
        if (id) {
          el.setAttribute('data-id', id)
        }
        // hover边框
        el.addEventListener('mouseenter', () => {
          el.style.borderColor = '#409EFF'
        })
        el.addEventListener('mouseleave', () => {
          el.style.borderColor = '#eee'
        })
      }
    }
  }, [
    // 文件图标
    h('img', {
      props: {
        src: filePng,
        alt: 'attachment-file-icon'
      },
      style: {
        width: '36px',
        height: '36px',
        flexShrink: '0'
      }
    }),

    // 右侧文字部分
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
        overflow: 'hidden',
      }
    }, [
      // 文件名
      h('span', {
        attrs: {
          title: fileName
        },
        style: {
          fontSize: '13px',
          color: '#333',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
          maxWidth: '140px',
        }
      }, fileName),

      // 文件大小
      h('span', {
        style: {
          fontSize: '12px',
          color: '#999',
          marginTop: '4px',
        }
      }, fileSize)
    ]),


    // 下载按钮
    h('button', {
      style: {
        border: '1px solid #409EFF',
        backgroundColor: '#ecf5ff',
        color: '#409EFF',
        padding: '4px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
      },
      on: {
        click() {
          window.open(url, '_blank')
        }
      }
    }, '下载')
  ])

  return container
}


/**
 * 生成“附件”元素的 HTML
 * @param elem 附件元素，即上文的 myResume
 * @param childrenHtml 子节点的 HTML 代码，void 元素可忽略
 * @returns “附件”元素的 HTML 字符串
 */
function attachmentToHtml(elem: SlateElement, childrenHtml: string): string {
  // 获取附件元素的数据
  const { url = '', fileName = '', fileSize = '', id = '' } = elem as any

  // 生成 HTML 代码
  const html = `<span
        data-w-e-type="attachment"
        data-w-e-is-void
        data-w-e-is-inline
        data-id="${id}"
        data-url="${url}"
        data-fileName="${fileName}"
        data-fileSize="${fileSize}"
    >${fileName}</span>`

  return html
}

/**
 * 解析 HTML 字符串，生成“附件”元素
 * @param domElem HTML 对应的 DOM Element
 * @param children 子节点
 * @param editor editor 实例
 * @returns “附件”元素，如上文的 myResume
 */
function parseAttachmentHtml(
  domElem: Element,
  children: SlateDescendant[],
  editor: IDomEditor
): SlateElement {

  // 从 DOM element 中获取“附件”的信息
  const url = domElem.getAttribute('data-url') || ''
  const fileName = domElem.getAttribute('data-fileName') || ''
  const fileSize = domElem.getAttribute('data-fileSize') || ''
  const id = domElem.getAttribute('data-id') || ''

  // 生成“附件”元素
  const myResume = {
    type: 'attachment',
    url,
    fileName,
    fileSize,
    id,
    children: [{ text: '' }], // void node 必须有 children ，其中有一个空字符串，重要！！！
  }

  return myResume
}

/**
 * 格式化文件大小
 * @param size
 */
function formatFileSize(size: number): string {
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB'
  return (size / (1024 * 1024)).toFixed(1) + 'MB'
}

export default UploadAttachment
