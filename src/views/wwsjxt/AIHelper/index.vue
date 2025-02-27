<template>
  <div class="AIHelper">
    <div class="topicContent">
      <a-button size="large" @click="onAddNew()">
        <template #icon>
            <plus-outlined />
        </template>
        创建新会话
      </a-button>
      <div class="topicList">
        <div class="topicItem" v-for="(item, index) in topicList" :key="index" @click="currentTopic = item" :class="currentTopic.id == item.id ? 'activeTopic' : ''">
          <div class="itemTitle">
            <MessageOutlined />&nbsp;
            {{ item.title }}
          </div>
          <div class="itemOperate">
            <a-space>
              <EditOutlined @click="editTopic(item)" />
              <a-popconfirm title="是否确定删除该会话？" ok-text="确定" cancel-text="取消"
                  @confirm="deleteTopic(item)">
                  <DeleteOutlined />
              </a-popconfirm>
              <ShareAltOutlined />
            </a-space>
          </div>
        </div>
      </div>
    </div>
    <div class="questionContent">
      <div class="questionList" ref="chatContainer">
        <template v-for="(item, index) in conversationList">
          <div class="questionLeft" v-if="item.role == 'assistant'" :key="index">
            <div class="questionItem">
              <div class="avatar">
                <svg-icon name="AIHelper"  width="40px" height="40px" ></svg-icon>
              </div>
              <div class="content">
                <span v-html="item.content"></span>
                <div v-if="item.type == 'answer'" class="clip" @click="copyText(item.content)">
                  <CopyOutlined />
                  复制内容
                </div>
              </div>
            </div>
            <div style="clear: both;"></div>
          </div>
          <div class="questionRight" v-if="item.role == 'user'" :key="index">
            <div class="questionItem">
              <div class="content">
                <span v-html="item.content"></span>
                <div style="text-align: right;" class="edit" @click="editText(item.content)">
                  <EditOutlined />
                  编辑
                </div>
              </div>
              <div class="avatar">
                <svg-icon name="mySelf"  width="40px" height="40px" fill="#555555"></svg-icon>
              </div>
              
            </div>
            <div style="clear: both;"></div>
          </div>
        </template>

      </div>
      <div class="question">
        <div v-if="inAnswer"  @click="abortRequest" class="stopRequest">
          <svg-icon name="suspend"  width="20px" height="20px" ></svg-icon>
          停止回答
        </div>
        <a-textarea
          v-model:value="question"
          placeholder="输入您的问题，按 Ctrl+Enter 换行，按 Enter 发送"
          :auto-size="{ minRows: 3, maxRows: 10 }"
          :bordered="false"
          @keydown="handleTextareaKey"
        />
        <div class="operate">
          <div class="list"></div>
          <div class="send" @click="sendQuestion">
            <SendOutlined style="transform: rotate(-45deg); margin-top: -5px;" />
            <span style="padding-left: 3px;">发送</span>
          </div>
        </div>
      </div>
    </div>

    <a-modal v-model:open="open" title="编辑会话" @ok="handleOk" @cancel="handleCancel">
      <a-form style="padding: 40px 20px;">
        <a-form-item label="会话标题">
          <a-input v-model:value="editItem.title" />
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';
import { PlusOutlined, MessageOutlined, EditOutlined, DeleteOutlined, ShareAltOutlined, SendOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { useUserStoreWithOut } from '/@/store/modules/user';

let topicList = ref([
  {
    id: 1,
    title: '帮我写一篇演讲稿'
  },
  {
    id: 2,
    title: '帮我写一篇论文'
  },
  {
    id: 3,
    title: '帮我写一篇作文'
  }
]);

let open = ref<boolean>(false);
let editItem = ref({})
let question = ref('')
let currentTopic = ref({})

let conversationList: any = ref([
  {
    role: 'assistant',
    content: '您好，我是AI助手，请问有什么可以帮您的吗？',
    type: 'default'
  }
])

// 新增中止控制器
const abortController = ref<AbortController>()
const isStreaming = ref(false)
let inAnswer = ref(false)

const urlList = {
  znwd: '/api/zrzy-form/ai/znwd',
  aiStream: '/api/zrzy-form/ai/call/Stream'
}

// 在原有代码基础上添加以下内容
const chatContainer = ref<HTMLElement>();

// 监听会话列表变化
watch(conversationList, async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}, { deep: true, immediate: true });

watch(() => currentTopic.value, (val: any) => {
  if(val && val?.id) {
    // TODO 加载会话主题，获取之前的会话记录
  } else {
    conversationList.value = []
    conversationList.value.push({
      role: 'assistant',
      content: '您好，我是AI助手，请问有什么可以帮您的吗？',
      type: 'default'
    })
  }
})

function onAddNew() {
  // 新增
  topicList.value.unshift({
    id: 0,
    title: '新的会话'
  })
}

function editTopic(item: any) {
  // 编辑
  open.value = true;
  editItem.value = cloneDeep(item)
}

function handleOk() {
  open.value = false
  editItem.value = {}
  // TODO 保存会话主题
}

function handleCancel() {
  // 取消
  open.value = false
  editItem.value = {}
}

function deleteTopic(item: any) {
  // 删除
  topicList.value = topicList.value.filter((i: any) => i.id !== item.id)
}

function sendQuestion() {
  // 初始化中止控制器
  abortController.value = new AbortController()
  isStreaming.value = true
  // 发送问题
  let currentDate = question.value
  if(!currentDate) {
    message.error('请输入问题')
    return
  }
  question.value = ''
  conversationList.value.push({
    role: 'user',
    content: currentDate
  })

  // 创建临时消息对象用于流式更新
  const tempMessage = {
    role: 'assistant',
    content: 'AI助手正在思考中...',
    type: 'waiting'
  }
  conversationList.value.push(tempMessage)

  // 使用封装的axios实例进行流式请求
  defHttp.post({
    url: urlList.aiStream,
    params: {
      message: currentDate
    },
    responseType: 'text', // 指定响应类型为文本
    // 添加中止信号
    signal: abortController.value.signal,
    onDownloadProgress: (progressEvent) => {
      const chunk = progressEvent?.event?.currentTarget?.responseText.replace(/\n\ndata:/gm, '')  
      inAnswer.value = true

      if (!chunk) return

      // 新增数据格式处理
      const rawData = chunk
        // 过滤SSE协议前缀
        .replace(/^data:\s*/gm, '')  
        // 移除可能存在的JSON格式标记
        .replace(/^{.*?}\n?/g, '')
        // 清理事件标记
        .replace(/event:error/g, '');

      // 处理分块数据（后端返回纯文本流）
      tempMessage.content = parseMarkdown(rawData)
      tempMessage.type = 'answer'
      // 触发视图更新
      conversationList.value = [...conversationList.value]
    }
  }, {
    withToken: true,
    // 覆盖默认的响应处理
    isTransformResponse: false,
    withTimeout: false
  }).then(() => {
    inAnswer.value = false
  }).catch((err: any) => {
    if (err.name !== 'CanceledError') {
      console.error('Stream error:', err)
      tempMessage.content = 'AI助手思考失败，请稍后再试!'
    }
    inAnswer.value = false
  }).finally(() => {
    isStreaming.value = false
    inAnswer.value = false
  })
}

// 中止请求方法
function abortRequest() {
  if (abortController.value) {
    abortController.value.abort()
    isStreaming.value = false
  }
}

// 添加Markdown解析方法
const parseMarkdown = (text: string) => {
    // 按处理优先级排序的正则替换规则
    return text
      // 转义HTML特殊字符（已在前端输入时处理，此处为防御性代码）
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // 代码块（三反引号格式）
      .replace(/```[\s\S]*?```/g, (match) => 
        `<pre><code>${match.replace(/```/g, '').trim()}</code></pre>`)
      // 行内代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 标题（支持1-6级）
      .replace(/^#+\s+(.+)$/gm, (_, text) => {
        const level = Math.min(_.match(/#/g)?.length || 1, 6)
        return `<h${level}>${text}</h${level}>`
      })
      // 无序列表
      .replace(/^[\*\-+]\s+(.+)$/gm, '<li>$1</li>')
      // 加粗
      .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
      // 斜体
      .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
      // 图片
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />')
      // 链接
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // 换行保留
      .replace(/\n/g, '<br>');
  };

// 复制文本内容到剪切板
const copyText = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      message.success("内容已复制到剪切板！");
    })
    .catch((error) => {
      message.warning("操作失败： ", error);
    });
};

const editText = (text: string) => {
  question.value = text
}

function handleTextareaKey(e: KeyboardEvent) {
  // 处理 Ctrl + Enter 换行
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    question.value += '\n';
  } else if (e.key === 'Enter') {
    // 处理 Enter 发送
    e.preventDefault();
    sendQuestion();
  }
}

</script>

<style scoped lang="less">
.AIHelper {
  display: flex;
  height: 100%;
  overflow: hidden;
  .topicContent {
    padding: 20px;
    background: #fff;
    width: 300px;
    height: 100%;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    button {
      width: 100%;
    }
    .topicList {
      margin-top: 20px;
      overflow: auto;
      flex: 1;
      .topicItem {
        padding: 12px;
        border-radius: 5px;
        background: #EFF4FA;
        margin: 5px 0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        .itemOperate {
          display: none;
        }
        &:hover {
          .itemOperate {
            display: block;
          }
        }
      }
      .activeTopic {
        background: #1890ff;
        color: #fff;
      }
    }
  }
  .questionContent {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    .questionList {
      flex: 1;
      overflow: auto;
      // font-size: 14px;
      .questionLeft {
        width: 100%;
        transition: background .1s ease-in-out;

        .questionItem {
          display: block;
          width: 100%;
          float: left;
          padding: 15px 50px 15px 0;
          position: relative;
          box-sizing: border-box;
          .avatar {
            position: absolute;
            left: 0;
            top: 18px;
            margin-left: 0;
          }
        }
        .content {
          width: auto;
          padding: 10px;
          margin-left: 50px;
          line-height: 30px;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          display: block;
          float: left;
        }
        .clip {
          color: #1890ff;
          cursor: pointer;
          margin-top: 5px;
        }
      }
      .questionRight {
        width: 100%;
        transition: background .1s ease-in-out;

        .questionItem {
          display: block;
          width: 100%;
          float: right;
          padding: 15px 0px 15px 50px;
          position: relative;
          box-sizing: border-box;
          .avatar {
            position: absolute;
            right: 0;
            top: 18px;
            margin-right: 0;
          }
        }
        
        .content {
          width: auto;
          padding: 10px;
          margin-right: 50px;
          line-height: 30px;
          background: #EFF4FA;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          display: block;
          float: right;
        }

        .edit {
          display: none;
          color: #1890ff;
          cursor: pointer;
          margin-top: 5px;
        }

      }
    }
    .question {
      border: 1px solid #d9d9d9;
      border-radius: 10px;
      position: relative;
      margin-top: 20px;
    }

    .stopRequest {
      position: absolute;
      right: 10px;
      top: -30px;
      cursor: pointer;
      &:hover {
        color: #1890ff;
        .svg-icon {
          fill: #1890ff !important;
        }
      }
    }
    .operate {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px;
      .send {
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}
</style>