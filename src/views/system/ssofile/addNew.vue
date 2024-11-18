<template>
  <div class="addNewContent">
    <!-- 新增目录 -->
    <a-form
      ref="formRef"
      :model="catalogState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 16 }"
      :rules="catalogRules"
      v-if="formData.type == 'catalog'"
    >
      <a-form-item
        label="目录名称"
        ref="materialName"
        name="materialName"
      >
        <a-input v-model:value="catalogState.materialName" />
      </a-form-item>
    </a-form>
    <!-- 新增附件 -->
    <a-form
      ref="formRef"
      :model="fileState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 16 }"
      :rules="fileRules"
      v-if="formData.type == 'file'"
    >
      <a-form-item
        label="上传方式"
      > 
        <a-radio-group v-model:value="isFileUpload">
          <a-radio value="cata">目录上传</a-radio>
          <a-radio value="file">文件上传</a-radio>
        </a-radio-group>
      </a-form-item>
      <template v-if="isFileUpload == 'file'">
        <a-form-item
          label="目录名称"
          ref="materialId"
          name="materialId"
        >
        <a-select
          ref="select"
          v-model:value="fileState.materialId"
          :options="catalogOptions"
          :fieldNames="fieldNames"
        >
        </a-select>
        </a-form-item>
        <a-form-item
          label="附件"
        >
        <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" multiple >
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
        </a-form-item>
      </template>
      
      <template v-else>
        <a-form-item
          label="附件"
        >
        <a-upload 
          v-model:file-list="fileList"
          :before-upload="beforeUpload"
          multiple webkitdirectory directory
        >
          <a-button>
            <upload-outlined></upload-outlined>
            选择目录
          </a-button>
          <template #itemRender="{ file }">
            <a-space>
              <span>{{ file.name }}</span>
              <a href="javascript:;" @click="removeFile(file)">移除</a>
            </a-space>
          </template>
        </a-upload>
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, reactive, ref, onMounted, watch, defineExpose } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { resolve } from 'path';

const props = defineProps({
  formData: { //流程信息
    type: Object,
    default: {}
  }
})
const formRef = ref()

const catalogState = reactive({
  materialName: '',
  materialId: ''
});

const catalogRules: any = {
  materialId: [
    { required: true, message: '请输入目录名称', trigger: 'change' },
  ]
}

const fileState = ref({
  materialId: '',
  materialName: '',
  fileList: []
})

const fileRules: any = {
  materialId: [
    { required: true, message: '请选择关联目录', trigger: 'change' },
  ]
}

let isFileUpload = ref<string>(props.formData.way || 'cata')
let folderList:any = ref([])
let fileList: any = ref([])
let catalogOptions : any = ref([])
const urlList = {
  getCatalog: '/api/zrzy-bdc/bdcdj/upfiles/file/queryMaterialTreeList', // 提取附件目录
  uploadBatch: '/api/zrzy-bdc/bdcdj/upfiles/file/uploadBatch' // 批量上传文件
}

let isNew = computed(() => {
  return !props.formData.materialId
})

const fieldNames = { label: 'materialName', value: 'id', }

watch(() => isFileUpload.value, (val:String) => {
  if(val == 'file' && props.formData.type == 'file') {
    getCatalogList()
  }
})

watch(() => props.formData.type, (val: String) => {
  if(val == 'file' && Object.keys(props.formData.catalogData).length > 0) {
    fileState.value.materialId = props.formData.catalogData.id
    fileState.value.materialName = props.formData.catalogData.materialName
  }
},{
  immediate: true
})

onMounted(() => {
  if(isFileUpload.value == 'file' && props.formData.type == 'file') {
    getCatalogList()
  }
})


function getCatalogList() {
  if(catalogOptions.value.length != 0) {
    return
  }
  // 获取附件目录
  defHttp.get(
    {
      url: urlList.getCatalog,
      params: { procInstId: props.formData.procInstId } // 实例ID
    },
    { withToken: true }
  ).then((res: any) => {
    if(res?.success) {
      catalogOptions.value = res.result
    } else {
      message.warning(res?.message)
    }
  })
}

// 从上传列表中移除
function removeFile(file: any) {
  fileList.value = fileList.value.filter((ele:any) => ele.uid != file.uid)
}


// 选择目录
function handleSelectCata(info: any) {
  let folderName:any = info.file.originFileObj.webkitRelativePath.split('/').length > 2 ? info.file.originFileObj.webkitRelativePath.split('/')[1] : ''
  if(folderName && !folderList.value.includes(folderName)) {
    folderList.value.push(folderName)
  }
}

function beforeUpload() {
  return false
}

// 新增的材料目录仅关联当前案卷
const addCatalog = () => {
  return new Promise((resolve, reject) => {
    formRef.value
      .validate()
      .then(() => {
        let params = {
              procInstId: props.formData.procInstId,
              processId: props.formData.processId,
              nodeId: props.formData.nodeId,
              materialId: props.formData?.materialId || '',
              materialName: catalogState.materialName
            }
        if(!props.formData?.materialId) {
          delete params.materialId
        }
        // 新增附件目录
        defHttp.post(
          {
            url: '/api/zrzy-bdc/bdcdj/upfiles/casematerial/add',
            data: params
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            if (props.formData.materialId) {
              message.success('目录修改成功！')
            } else {
              message.success('目录新增成功！')
            } 
            return resolve(true)
          } else {
            message.warning(res?.message)
            return reject()
          }
        })
      }).catch((error:any) => {
        console.log('error', error);
      });
  })
}

const uploadFile = () => {
  return new Promise((resolve, reject) => {
    if(isFileUpload.value == 'file' && !fileState.value.materialId) {
      return
    }
    if(fileList.value.length == 0) {
      message.warning('请选择要上传的附件材料')
      return
    }
    const formData = new FormData()
    const params = {
      materialId: fileState.value.materialId, // 附件目录主键
      materialName: fileState.value.materialName, // 附件目录名称
      procInstId: props.formData.procInstId //流程实例ID
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
  addCatalog,
  uploadFile
});

</script>

<style scoped lang="less">
</style>