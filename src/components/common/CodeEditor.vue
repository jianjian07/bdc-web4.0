<template>
  <div 
    :class="{'full-screen-parent': true, 'full-screen': fullCoder, 'auto-height': isAutoHeight}"
  >
    <div v-if="fullScreen" class="full-screen-icon" @click="()=>fullCoder=!fullCoder">
      <FullscreenOutlined v-show="!fullCoder"/>
      <FullscreenExitOutlined v-show="fullCoder"/>
    </div>
    <div v-if="languageChange" class="changeLanguage">
      <a-select
        ref="select"
        v-model:value="mode"
        style="width: 120px"
        :options="modes"
        size="small"
      ></a-select>
    </div>
    <div class="code-editor-cust full-screen-child">
      <Codemirror
        v-model:value="code"
        :options="cmOptions"
        :border="true"
        ref="cmRef"
        :placeholder="placeholder"
        width="100%"
        height="100%"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import type { CmComponentRef } from "codemirror-editor-vue3";
import type { Editor } from "codemirror";
// placeholder
import "codemirror/addon/display/placeholder.js";
// language
import "codemirror/mode/xml/xml.js";
import "codemirror/mode/javascript/javascript.js";
// theme
import "codemirror/theme/dracula.css";
import jsonlint from "jsonlint-mod-fixed";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/json-lint";

window.jsonlint = jsonlint;
let fullCoder: any = ref(false)
let isAutoHeight: any = ref(false)
let mode = ref<String>('')

const modes = [{
  label: 'JSON',
  value: 'application/json'
}, {
  
}]
// application/json
const props = defineProps({
  // 外部传入的内容，用于实现双向绑定
  value: {
    type: String,
    default: ''
  },
  // 外部传入的语法类型
  language: {
    type: String,
    default: null
  },
  languageChange: {
    type: Boolean,
    default: false,
    required: false
  },
  placeholder: {
    type: String,
    default: null
  },
  // 显示行号
  lineNumbers: {
    type: Boolean,
    default: true
  },
  // 是否显示全屏按钮
  fullScreen: {
    type: Boolean,
    default: false
  },
  // 全屏以后的zIndex
  zIndex: {
    type: [Number, String],
    default: 999
  },
  autoHeight: {
    type: [String, Boolean],
    default: true
  }
})

let placeholder = computed(() => {
  return `请在此输入${props.language}代码`
})

let cmOptions = ref({
    mode: 'application/json', // Language mode
    theme: "dracula", // Theme
    // tab宽度
    tabSize: 2,
    lineNumbers: true,
    lineWiseCopyCut: true,
    gutters: ["CodeMirror-lint-markers"],
    lint: false,
    autoRefresh: true,
  })

const cmRef = ref<CmComponentRef>();
let code: any = ref('')

const emit = defineEmits(['codeValue'])

watch(() => props.value, (val: any) => {
  code.value = val
}, {
  immediate: true
})

watch(() => props.language, (val: String) => {
  mode.value = val
}, {
  immediate: true
})

watch(() => mode.value, (val: any) => {
  cmOptions.value.lint = false
  if(val) {
    let mode: any = modes.filter((_v) => _v.label == val)[0].value
    cmOptions.value.mode = mode
    if(val == 'JSON' && code.value) { //检查JSON格式
      cmOptions.value.lint = true
    }
  }

}, {
  immediate: true
})

onMounted(() => {
  setTimeout(() => {
    cmRef.value?.refresh();
  }, 10)
})

const onChange = (val: string) => {
  if(val) {
    cmOptions.value.lint = true
  } else {
    cmOptions.value.lint = false
  }
  emit('codeValue', val)
};
</script>

<style lang="less" scoped>
.code-editor-cust {
  flex-grow: 1;
  display: flex;
  position: relative;
  height: 100%;

  .CodeMirror {
    flex-grow: 1;
    z-index: 1;

    .CodeMirror-code {
      line-height: 19px;
    }

  }

  .code-mode-select {
    position: absolute;
    z-index: 2;
    right: 10px;
    top: 10px;
    max-width: 130px;
  }

  .CodeMirror {
    height: auto;
    min-height: 100%;
  }

  .null-tip {
    position: absolute;
    top: 4px;
    left: 36px;
    z-index: 10;
    color: #ffffffc9;
    line-height: initial;
  }

  .null-tip-hidden {
    display: none;
  }
}

/* 全屏样式 */
.full-screen-parent {
  position: relative;
  height: 240px;

  .full-screen-icon {
    // opacity: 0;
    color: black;
    width: 20px;
    height: 20px;
    line-height: 20px;
    background-color: white;
    position: absolute;
    top: 1px;
    right: 1px;
    z-index: 9;
    cursor: pointer;
    transition: opacity 0.3s;
    text-align: center;
  }

  &:hover {
    .full-screen-icon {
      opacity: 1;

      &:hover {
        background-color: rgba(255, 255, 255, 0.88);
      }
    }
  }

  &.full-screen {
    position: fixed;
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    padding: 10px;
    background-color: #f5f5f5;
    z-index: 1000;

    .full-screen-icon {
      top: 11px;
      right: 11px;
      text-align: center;
    }

    .changeLanguage {
      top: 10px;
      right: 36px;
    }

    .full-screen-child {
      height: 100%;
      max-height: 100%;
      min-height: 100%;
    }
  }

  .full-screen-child {
    height: 100%;
  }

  &.auto-height {
    .full-screen-child {
      min-height: 120px;
      max-height: 320px;
      height: unset;
      overflow: hidden;
    }

    &.full-screen .full-screen-child {
      height: 100% !important;
      max-height: 100% !important;
      min-height: 100% !important;
    }
  }

  .changeLanguage {
    position: absolute;
    top: 0px;
    right: 26px;
    z-index: 9;
  }

}

.CodeMirror-cursor {
  height: 18.4px !important;
}
</style>