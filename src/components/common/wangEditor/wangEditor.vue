<template>
  <div class="wang-editor-div" style="border: 1px solid #ccc">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="height: 300px; overflow-y: hidden;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { onBeforeUnmount, ref, shallowRef, watch, nextTick } from 'vue'
import {
  currentFileIds,
  initialFileIds,
  setUploadId, uploadedFileIds,
} from "/@/components/common/wangEditor/upload-attachment.ts"
import {
  customBrowseAndUploadFunc,
  setImageId, srcToDataIdMap,srcToStyleMap,
  syncImageDataIdToDom, 
  initializeSvgImages, 
  clearImageCache,
  findImageInfoFromSlate
} from "/@/components/common/wangEditor/image-attachment.ts"

const props = defineProps({
  mode: {
    type: String,
    default: 'simple' // default simple
  },
  content: {
    type: String,
    default: ''
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    required: true
  }
})

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

const toolbarConfig = {
  excludeKeys: ["code", "emotion", "codeBlock", "codeSelectLang"],
  insertKeys: {
    index: 18, // 插入到某个位置前
    keys: ['uploadAttachment'] //注入自定义附件上传按钮
  }
}
const editorConfig = {
  placeholder: '请输入内容...',
  readOnly: props.readOnly,
  EXTEND_CONF: {
    customModules: true, 
  },
  MENU_CONF: {
    uploadImage: {
      customBrowseAndUpload(insertFn: Function) {
        customBrowseAndUploadFunc(insertFn, editorRef.value)
      }
    },
  }
}

watch(() => props.content, (val) => {
  valueHtml.value = val
}, {
  immediate: true
})

watch(() => props.id, (val) => {
  // 同步通知公告id
  setImageId(val)
  setUploadId(val)
}, {
  immediate: true
})

const emit = defineEmits(['editorValue', 'ready'])

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
  
  if (imageObserver) {
    imageObserver.disconnect()
    imageObserver = null
  }
  
  uploadedFileIds.value = new Set([])
  initialFileIds.value = new Set([])
  currentFileIds.value = new Set([])
  srcToDataIdMap.clear()
  srcToStyleMap.clear()
  clearImageCache()
})

// 保存 observer 引用，用于销毁
let imageObserver: MutationObserver | null = null

/**
 * 创建
 * @param editor
 */
const handleCreated = async (editor) => {
  editorRef.value = editor 
  // 初始化 data-id 集合
  initDataIds()

  // 监听编辑器容器变化
  const container = editor.getEditableContainer()
  if (container) {
    // 先同步一次 DOM
    syncImageDataIdToDom(editor)
    await nextTick()
    
    // 初始化SVG图片显示
    initializeSvgImages(editor)
    
    // 监听 DOM 变化
    imageObserver = new MutationObserver(() => {
      if (!editorRef.value) return
      // 同步data-id 和 资源比对和删除
      syncImageDataIdToDom(editor)
      updateCurrentFileIds(container)
    })
    imageObserver.observe(container, {
      childList: true,
      subtree: true,
    })
  }

  emit('ready', Array.from(currentFileIds.value))
}

/**
 * 初始化data-id
 */
const initDataIds = () => {
  const ids = new Set<string>()
  if (valueHtml.value) {
    const div = document.createElement('div')
    div.innerHTML = valueHtml.value
    const elementsWithId = div.querySelectorAll('[data-id]')
    Array.from(elementsWithId).forEach((el) => {
      const id = (el as HTMLElement).getAttribute('data-id')
      const src = (el as HTMLElement).getAttribute('src')
      const originalSrc = (el as HTMLElement).getAttribute('data-original-src') || src
      // 提取样式信息 （图片缩放）
      const style = {
        width: el.getAttribute('style')?.match(/width:\s*([^;]+)/)?.[1] || '',
        height: el.getAttribute('style')?.match(/height:\s*([^;]+)/)?.[1] || ''
      }
      if (id && originalSrc) {
        // 统一存储格式校验 - 使用原始URL作为key
        srcToDataIdMap.set(originalSrc, id)
        srcToStyleMap.set(originalSrc, style)
      }
      if (id) ids.add(String(id))
    })
  }
  currentFileIds.value = new Set(ids)
  initialFileIds.value = new Set(ids)
}

/**
 * 更新当前附件id
 * @param container
 */
const updateCurrentFileIds = (container) => {
  const domIds = new Set<string>(
      Array.from(container.querySelectorAll('[data-id]'))
          .map(el => (el as HTMLElement).getAttribute('data-id'))
          .filter((id): id is string => Boolean(id))
  )
  currentFileIds.value = domIds
}


// 获取当前编辑器内容
const getEditorValue = () => {
  return editorRef.value.getHtml()
}

// 编辑器内容变化时
const handleChange = (editor) => {
  const container = editor.getEditableContainer()
  if (container) {
    const imgContainers = container.querySelectorAll('.w-e-image-container')
    Array.from(imgContainers).forEach(div => {
      const img = div.querySelector('img[data-w-e-type="image"]')
      
      if (img) {
        // 优先从 data-original-src 获取原始 URL，否则用当前 src
        const originalSrc = img.getAttribute('data-original-src') || img.getAttribute('src')
        let dataId = ''

        // 先从映射中查找
        dataId = srcToDataIdMap.get(originalSrc) || ''
        
        // 如果映射中没有，再从 Slate 节点中查找
        if (!dataId) {
          const slateInfo = findImageInfoFromSlate(editor, originalSrc)
          if (slateInfo) {
            dataId = slateInfo.dataId
          }
        }
        
        if (dataId) {
          img.setAttribute('data-id', dataId)
          // 确保映射关系存在
          if (originalSrc && !srcToDataIdMap.has(originalSrc)) {
            srcToDataIdMap.set(originalSrc, dataId)
          }
        }
        // 只同步当前图片节点
        let width = div.style.width
        let height = div.style.height
        if (width || height) {
          // 只查找当前 dataId 的图片节点
          const imageNodeEntries = findImageNodePaths(editor.children, dataId)
          for (const [node, path] of imageNodeEntries) {
            if ((node as any).type !== 'image') continue
            if (
                !(node as any).style ||
                (node as any).style.width !== width ||
                (node as any).style.height !== height
            ) {
              // 网络图片修改会报错 因为是只读对象
              if (!Object.isFrozen(node)) {
                node.style.width = width
                node.style.height = height
              }
            }
          }
        }
      }
    })
  }
  emit('editorValue', editor.getHtml())
}

function findImageNodePaths(nodes, dataId, path = []) {
  let result = []
  nodes.forEach((node, idx) => {
    const currentPath = path.concat(idx)
    if ((node as any).type === 'image' && String((node as any).dataId) === String(dataId)) {
      result.push([node, currentPath])
    }
    if (Array.isArray((node as any).children)) {
      result = result.concat(findImageNodePaths((node as any).children, dataId, currentPath))
    }
  })
  return result
}

defineExpose({
  getEditorValue
})


</script>
<style lang="less" scoped>
.w-e-full-screen-container {
  z-index: 1020 !important;
}

.wang-editor-div {
  :deep(.attachment-block) {
    display: inline-block;
    background: #f6f8fa;
    padding: 4px 8px;
    border-radius: 4px;
    margin: 4px 0;
    font-size: 14px;
    color: #1890ff;
    border: 1px dashed #d9d9d9;
  }

  :deep(.attachment-block a) {
    text-decoration: none;
  }

  :deep(img) {
    vertical-align: baseline;
  }
}

</style>