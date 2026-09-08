<template>
  <a-drawer :title="title" :width="720" :open="open" :body-style="{ paddingBottom: '80px' }" @close="onClose"
            :footer-style="{ textAlign: 'right' }">
    <a-form :model="dataInfo" ref="formRef" :label-col="{ style: { width: '150px' } }" layout="vertical"
            autocomplete="off">
      <a-form-item label="表名" name="tblName" :rules="[{ required: true, message: '请输入表名' }]">
        <a-input v-model:value="dataInfo.tblName" prefix="" suffix=""/>
      </a-form-item>
      <a-form-item label="字段名" name="colName" :rules="[{ required: true, message: '请输入字段名' }]">
        <a-input v-model:value="dataInfo.colName" prefix="" suffix=""/>
      </a-form-item>
      <a-form-item label="备注" name="colComment">
        <a-input v-model:value="dataInfo.colComment"/>
      </a-form-item>
      <a-form-item label="是否加密" name="isEncode">
        <a-switch v-model:checked="isEncode" checked-children="是" un-checked-children="否"/>
      </a-form-item>
    </a-form>
    <template #extra>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onOk">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: "属性"
  },
  data: {
    type: Object,
    default: {}
  }
})
const formRef = ref()
let dataInfo = ref<any>(JSON.parse(JSON.stringify(props.data)))
let isEncode = ref(dataInfo.value.isEncode == 1)

const emit = defineEmits(['ok'])

/**
 * 提交表单
 */
function onOk() {
  formRef.value.validate().then(() => {
    let url = '/api/zrzy-form/metadata/saveOrUpdate'
    dataInfo.value.isEncode = isEncode.value ? 1 : 0
    console.log(JSON.stringify(dataInfo.value))
    defHttp.post({ url: url, data: dataInfo.value }, { withToken: true }).then((res) => {
      if (res.success) {
        message.success('保存成功')
      } else {
        message.error('保存失败' + res.message)
      }
    }).catch(err => {
      message.error('保存失败')
    }).finally(() => {
      emit('ok', { refresh: true })
    })
  })
}

/**
 * 关闭表单
 */
function onClose() {
  emit('ok', { refresh: false })
}
</script>
