<template>
  <a-form :label-col="{ style: { width: '80px' } }" :labelWrap="true">
    <a-form-item label="受理编号" v-if="formData.length == 1">
      <a-input v-model:value="formData[0].caseno" disabled/>
    </a-form-item>
    <a-form-item label="待推送主题">
      <a-checkbox-group class="custom-checkbox-group" v-model:value="chooseData" :options="optionsList">
      </a-checkbox-group>
    </a-form-item>

  </a-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRefs } from "vue";
import { defHttp } from "/@/utils/http/axios";
import { message } from "ant-design-vue";

const props = defineProps({
  formData: {
    type: Array,
    default: () => ([])
  }
})

enum api {
  sendMsg = '/api/zrzy-api/mq/message/sendMsg'
}

const { formData } = toRefs(props);

let optionsList = computed(() => {
  return formData.value[0].topic_tag.split("|").map(item => ({
    label: item,
    value: item
  }));
});

// 默认选中所有主题
let chooseData = ref<any>([]);

onMounted(() => {
  chooseData.value = formData.value[0].topic_tag.split("|");
})

async function handleOk() {
  sendMqMsg()
}

/**
 * 发送消息
 */
async function sendMqMsg() {
  let requestData = { topicTagList: chooseData.value };
  const messageList = formData.value.map(form => {
    const { key_value, key_name, caseno } = form;
    return {
      keyValue: key_value,
      keyName: key_name,
      caseno: caseno
    };
  });
  requestData.dataList = messageList;
  defHttp.post({ url: api.sendMsg, data: requestData }, { withToken: true }).then((res) => {
    if (res.success) {
      message.success(res.message)
    } else {
      message.error(res.message)
    }
  }).catch(err => {
    message.error(err)
  })
}

defineExpose({
  handleOk
})
</script>
<style scoped lang="less">
.custom-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 控制行间距 */
}
</style>