<template>
  <div style="border: 1px solid #ccc">
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
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from 'vue'


// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

const toolbarConfig = {
  excludeKeys: ["code", "emotion", "codeBlock", "codeSelectLang"]
}
const editorConfig = { 
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/**',
       // 小于该值就插入 base64 格式（而不上传），默认为 0
      base64LimitSize: 50 * 1024, // 50k
    }
  }
}

// 上传图片配置参考：https://www.wangeditor.com/v5/menu-config.html#%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0

const props = defineProps({
  mode: {
    type: String,
    default: 'simple' // default simple
  },
  content: {
    type: String,
    default: ''
  }
})

watch(() => props.content, (val) => {
  valueHtml.value = val
}, {
  immediate: true
})

const emit = defineEmits(['editorValue'])

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const handleChange = (editor) => {
  emit('editorValue', editor.getHtml())
}


</script>

<style lang="less" scoped>
.w-e-full-screen-container {
  z-index: 1020 !important;
}
</style>