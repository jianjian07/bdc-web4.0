<template>
  <div class="addNewContent">
    <!-- 新增大厅 -->
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" :rules="formRules">
      <a-form-item label="大厅名称" ref="dtmc" name="dtmc">
        <a-input v-model:value="formState.dtmc" allowClear />
      </a-form-item>
      <a-form-item label="所属区" ref="areaCode" name="areaCode">
        <a-cascader v-model:value="showCode" :fieldNames="regionFieldNames" :options="regionOptions"
          @change="onRegionChange" change-on-select allowClear />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';

const props = defineProps({
  formData: { //流程信息
    type: Object,
    default: {}
  }
})
const formRef = ref()

const formState = reactive({
  dtmc: '',
  areaCode: ''
});

const showCode: any = ref([])

const formRules: any = {
  dtmc: [
    { required: true, message: '请输入大厅名称', trigger: 'change' },
  ],
  areaCode: [
    { required: true, message: '请选择行政区名称', trigger: 'change' },
  ]
}

const urlList = {
  add: '/api/zrzy-wwsj/wwsj/dt/save',
  regionList: '/api/zrzy-system/sys/areacode/queryAreaTree',
}

const regionFieldNames = { label: 'areaName', value: 'areaCode', }

const regionOptions = ref([])

watch(() => props.formData, (val) => {
  if (val.type == 'edit') {
    formState.dtmc = val.itemData.dtmc
    formState.areaCode = val.itemData.areaCode
    showCode.value = setShowCode(val.itemData.areaCode)
  }
}, {
  immediate: true
})

onMounted(() => {
  loadRegionList()
})

function loadRegionList() {
  regionOptions.value = []
  defHttp.get(
    {
      url: urlList.regionList,
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      regionOptions.value = res.result
    } else {
      message.warning(res?.message || '未查询到行政区数据！')
    }
  })
}

function onRegionChange(value, selectedOptions) {
  console.log(value, selectedOptions)
  formState.areaCode = selectedOptions[value.length - 1].areaCode
  showCode.value = value
}

function setShowCode(code: any) {
  let codeList: any = []
  if (Number(code) % 100 !== 0) {
    codeList = [Math.floor(Number(code) / 10000) + '0000', Math.floor(Number(code) / 100) + '00', code]
  } else if (Number(code) % 10000 !== 0) {
    codeList = [Math.floor(Number(code) / 10000) + '0000', code]
  } else {
    codeList = [code]
  }
  console.log('codeList', codeList)
  return codeList
}

const onSubmit = () => {
  return new Promise((resolve, reject) => {
    formRef.value
      .validate()
      .then(() => {
        let url = urlList.add
        let method = 'post'

        defHttp[method](
          {
            url: url,
            data: { ...props.formData?.itemData, ...formState }
          },
          { withToken: true }
        ).then((res: any) => {
          if (res?.success) {
            if (props.formData.type == 'edit') {
              message.success('修改成功！')
            } else {
              message.success('新增成功！')
            }
            return resolve(true)
          } else {
            message.warning(res?.message || '操作失败！')
            return reject()
          }
        })
      }).catch((error: any) => {
        console.log('error', error);
      });
  })
}

defineExpose({
  onSubmit
});

</script>

<style scoped lang="less"></style>