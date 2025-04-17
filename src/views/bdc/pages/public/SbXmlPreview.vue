<template>
  <div class="sb-xml-preview">
    <a-spin :spinning="loading" style="height: 100%">
      <CodeEditor :fullScreen="false" language="xml" :value="xml" :readOnly="formData.readOnly"></CodeEditor>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import CodeEditor from '/@/components/common/CodeEditor.vue'
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const props = defineProps({
    formData: {
        type: Object,
        default: {}
    },
})

let xml = ref<string>('')
let loading =ref<boolean>(false)

enum api {
  xyXmlByYw = '/api/zrzy-report/bdc/report/respondXml',
  xyXmlByDb = '/api/zrzy-report/bdc/report/register/responseXml',
  sbXmlByYw = '/api/zrzy-report/bdc/report/reportXml',
  sbXmlByDb = '/api/zrzy-report/bdc/report/register/reportXml'
}

// 业务上报XML 1
// 业务响应 2
// 登簿上报 3
// 登簿响应 4

onMounted(()=> {
  getXml()
})

function getXml() {
  let url = ''
  let type = props.formData.xmlType 
  if (type == '1') {
    url = api.sbXmlByYw
  } else if (type == '2') {
    url = api.xyXmlByYw
  } else if (type == '3') {
    url = api.sbXmlByDb
  } else if (type == '4') {
    url = api.xyXmlByDb
  }
  loading.value = true
  defHttp.get({ url: url, params: { id: props.formData.id } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      xml.value = res.result
    } else {
      message.warning(res?.message)
    }
    loading.value = false
  })
}

</script>

<style lang="less" scoped>
.sb-xml-preview {
  height: 100%;
  
  :deep(.full-screen-parent) {
    height: 100%;
  }
  
  :deep(.ant-spin-nested-loading) {
    height: 100%;

    .ant-spin-container {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>