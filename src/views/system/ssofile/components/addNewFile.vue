<template>
  <div class="addNewContent">
        <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :multiple="false" >
          <a-button>
            <upload-outlined></upload-outlined>
            选择文件
          </a-button>
          <template #itemRender="{ file }">
            <a-space>
              <span>{{ file.name }}</span>
              <a href="javascript:;" @click="removeFile(file)">移除</a>
            </a-space>
          </template>
        </a-upload>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  formData: { //流程信息
    type: Object,
    default: {}
  }
})

let fileList: any = ref([])
const urlList = {
  uploadBatch: '/api/zrzy-bdc/bdcdj/upfiles/ft/uploadBatch' // 批量上传文件
}

watch(() => props.formData.type, (val: String) => {
},{
  immediate: true
})


// 从上传列表中移除
function removeFile(file: any) {
  fileList.value = fileList.value.filter((ele:any) => ele.uid != file.uid)
}


function beforeUpload() {
  // 检查文件列表，如果已有一个文件，则阻止上传
  if (fileList.value.length > 0) {
    fileList.value = fileList.value[0]
    message.warning('只能上传一个文件');
    return false;
  }
  return false
}

const uploadFile = () => {
  return new Promise((resolve, reject) => {
    if(fileList.value.length == 0) {
      message.warning('请选择要上传的附件材料')
      return
    }
    if(fileList.value.length > 1) {
      message.warning('只允许上传一个附件')
      return
    }
    const formData = new FormData()
    const params = {
      bdcdyh: props.formData.bdcdyh, // 不动产单元号
      stdm: props.formData.stdm // 实体代码
    }
    fileList.value.forEach((ele:any) => {
      formData.append(`files`, ele.originFileObj);
    })
    defHttp
      .post(
          {
            url: urlList.uploadBatch,
            data: formData,
            params: params,
            headers: { "Content-Type": "multipart/form-data" },
          },
          { withToken: true }
      ).then((res: any) => {
        if(res && res.success) {
          message.success('上传成功！')
          resolve(true)
        } else {
          reject()
        }
      })
  })
}

defineExpose({
  uploadFile
});

</script>

<style scoped lang="less">
</style>