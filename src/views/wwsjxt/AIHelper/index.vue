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
      <div class="questionList">
        <template v-for="(item, index) in conversationList">
          <div class="questionLeft" v-if="item.role == 'assistant'" :key="index">
            <div class="questionItem">
              <div class="avatar">
                <svg-icon name="AIHelper"  width="40px" height="40px" ></svg-icon>
              </div>
              <div class="content">
                <span>{{ item.content }}</span>
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
                {{ item.content }}
                <div style="text-align: right;" class="edit" @click="editText(item.content)">
                  <EditOutlined />
                  编辑
                </div>
              </div>
              <div class="avatar">
                <svg-icon name="mySelf"  width="40px" height="40px" ></svg-icon>
              </div>
              
            </div>
            <div style="clear: both;"></div>
          </div>
        </template>

      </div>
      <div class="question">
        <a-textarea
          v-model:value="question"
          placeholder="输入您的问题，按回车发送"
          :auto-size="{ minRows: 3, maxRows: 10 }"
          :bordered="false"
          @press-enter="sendQuestion"
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
import { ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';
import { PlusOutlined, MessageOutlined, EditOutlined, DeleteOutlined, ShareAltOutlined, SendOutlined, CopyOutlined } from '@ant-design/icons-vue';

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

const urlList = {
  znwd: '/api/zrzy-form/ai/znwd',
}

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
  conversationList.value.push({
    role: 'assistant',
    content: 'AI助手正在思考中...',
    type: 'waiting'
  })

//   setTimeout(() => {
//     let res = {
//     "success": true,
//     "message": "",
//     "code": 200,
//     "result": "{\"choices\":[{\"message\":{\"role\":\"assistant\",\"content\":\"《不动产首次登记条例》并不是一个准确的法律法规名称。你可能是想了解关于不动产首次登记的相关规定，这在我国主要是由《中华人民共和国民法典》、《不动产登记暂行条例》等法律法规进行规定的。\\n\\n根据这些法律法规，不动产首次登记是指不动产权利第一次依法记载于不动产登记簿的行为，包括集体土地所有权，房屋等建筑物、构筑物所有权，森林、林木所有权，耕地、林地、草地等土地承包经营权，建设用地使用权，宅基地使用权，海域使用权，地役权，抵押权等的首次登记。申请人应当提交相关材料，如身份证明、权属来源证明等，并对申请材料的真实性负责。登记机构受理后会进行审核，最终将符合条件的不动产权利信息记载于不动产登记簿，完成首次登记。\\n\\n如果你有更具体的问题或者需要进一步的帮助，请随时告诉我。\"},\"finish_reason\":\"stop\",\"index\":0,\"logprobs\":null}],\"object\":\"chat.completion\",\"usage\":{\"prompt_tokens\":13,\"completion_tokens\":181,\"total_tokens\":194,\"prompt_tokens_details\":{\"cached_tokens\":0}},\"created\":1740471114,\"system_fingerprint\":null,\"model\":\"qwen-plus\",\"id\":\"chatcmpl-18ae2239-b7d0-9ca3-b34e-8d3ecc57def2\"}",
//     "timestamp": 1740471114504,
//     "exceptionId": null
// }
//     if(res && res.code == 200) {
//       const result = JSON.parse(res.result)
//       console.log(result)
//       conversationList.value.pop()
//       conversationList.value.push({
//         role: 'assistant',
//         content: result.choices[0].message.content,
//         type: 'answer'
//       })
//     }
//   }, 3000);
//   return
  defHttp.post({
    url: urlList.znwd,
    params: {
      role: 'user',
      content: currentDate
    }
  }, {
    withToken: true
  }).then((res: any) => {
    if(res && res.code == 200) {
      const result = JSON.parse(res.result)
      console.log(result)
      conversationList.value.pop()
      conversationList.value.push({
        role: 'assistant',
        content: result.choices[0].message.content,
        type: 'answer'
      })
    } else {
      message.error(res.message)
      conversationList.value.pop()
      conversationList.value.push({
        role: 'assistant',
        content: 'AI助手思考失败，请稍后再试！',
        type: 'error'
      })
    }  
  }).catch((err: any) => {
    message.error(err.message)
    conversationList.value.pop()
    conversationList.value.push({
      role: 'assistant',
      content: 'AI助手思考失败，请稍后再试!',
      type: 'error'
    })
  })
}

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
            top: 23px;
            margin-left: 0;
          }
        }
        .content {
          width: auto;
          padding: 10px;
          margin-left: 50px;
          line-height: 40px;
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
            top: 23px;
            margin-right: 0;
          }
        }
        
        .content {
          width: auto;
          padding: 10px;
          margin-right: 50px;
          line-height: 40px;
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