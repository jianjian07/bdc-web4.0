<template>
  <div class="c-monaco-editor">
    <div ref="codeEditBox" class="codeEditBox"></div>
    <FullscreenOutlined class="un-fullscreen-icon" v-if="!isFullscreen" @click="toggleFullscreen"/>
    <FullscreenExitOutlined class="fullscreen-icon" v-else @click="toggleFullscreen"/>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { editorProps } from './monacoEditorType'
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import * as monaco from 'monaco-editor'
// import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
// import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

const props = defineProps({
    readOnly: {
        type: Boolean,
        default: false
    }, ...editorProps
})
const emit = defineEmits(['update:modelValue', 'change', 'editor-mounted'])
// self.MonacoEnvironment = {
//     getWorker(_: string, label: string) {
//         if (label === 'json') {
//             return new jsonWorker()
//         }
//         if (['css', 'less'].includes(label)) {
//             return new cssWorker()
//         }
//         if (['html', 'handlebars', 'razor'].includes(label)) {
//             return new htmlWorker()
//         }
//         if (['typescript', 'javascript'].includes(label)) {
//             return new tsWorker()
//         }
//         return new EditorWorker()
//     },
// }
let editor: monaco.editor.IStandaloneCodeEditor
let isFullscreen = ref<boolean>(false)
const codeEditBox = ref()
const init = () => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
    })
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
    })
    editor = monaco.editor.create(codeEditBox.value, {
        value: props.modelValue,
        language: props.language,
        theme: props.theme,
        ...props.options,
    })
    editor.getAction('editor.action.formatDocument')!.run();//自动格式化代码
    // 监听值的变化
    editor.onDidChangeModelContent(() => {
        const value = editor.getValue() //给父组件实时返回最新文本
        emit('update:modelValue', value)
        emit('change', value)
    })
    format()
    emit('editor-mounted', editor)
}

// 切换编码语言
const handleLanguage = (language: string) => {
    let model = editor.getModel()
    if (model) {
        monaco.editor.setModelLanguage(model, language)
    }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (codeEditBox.value) {
    codeEditBox.value.classList.toggle('fullscreen', isFullscreen.value)
  }

  // 重新布局
  nextTick(() => {
    editor?.layout()
  })
}

watch(() => props.language, newValue => {
    if (editor) {
        handleLanguage(newValue)
    }
})
watch(
    () => props.modelValue,
    newValue => {
        if (editor) {
            const value = editor.getValue()
            if (newValue !== value) {
                editor.getAction('editor.action.formatDocument')!.run();//自动格式化代码
                editor.setValue(newValue)
                format()
            }
        }
    }
)
onMounted(() => {
    init()
})

const format = (): void => {
    const readOnly = props.readOnly;
    editor?.updateOptions({ readOnly: false });
    editor?.getAction('editor.action.formatDocument')?.run()
        .then()
        .finally(() => editor?.updateOptions({ readOnly }));
    editor?.setValue(editor?.getValue());
}
</script>

<style lang="less" scoped>
.c-monaco-editor {
  position: relative;
}

.codeEditBox {
    width: v-bind(width);
    height: v-bind(height);
    border-radius: 2px;
    border: 1px solid #d9d9d9;
}

.codeEditBox.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: white;
}

.un-fullscreen-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: rgba(255, 255, 255, 80%);
  font-size: 14px;
  z-index: 1000;
}

.fullscreen-icon {
  position: fixed;
  top: 2px;
  right: 2px;
  background-color: rgba(255, 255, 255, 80%);
  z-index: 9999;
  font-size: 14px;
}
</style>
