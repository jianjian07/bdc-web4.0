<template>
  <div class="addNewContent">
    <!-- 新增目录 -->
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" :rules="formRules">
      <a-form-item label="大厅名称" ref="subsystemid" name="subsystemid">
        <a-select v-model:value="formState.subsystemid" :fieldNames="systemFieldNames" :options="systemOptions"
          @change="onSystemChange" allowClear />
      </a-form-item>
      <a-form-item label="所属区" ref="areaCode" name="areaCode">
        <a-cascader v-model:value="showCode" :fieldNames="regionFieldNames" :options="regionOptions"
          @change="onRegionChange" change-on-select allowClear />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, reactive, ref, watch } from 'vue';
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
  subsystemname: '',
  subsystemid: '',
  areaName: '',
  areaCode: ''
});

const showCode: any = ref([])

const formRules: any = {
  subsystemname: [
    { required: true, message: '请选择子系统名称', trigger: 'change' },
  ],
  areaName: [
    { required: true, message: '请选择行政区名称', trigger: 'change' },
  ]
}

const urlList = {
  add: '/api/zrzy-bdc/sys/sysSubArea/add',
  edit: '/api/zrzy-bdc/sys/sysSubArea/edit',
  regionList: '/api/zrzy-bdc/sys/areacode/queryAreaTree',
  systemList: '/api/zrzy-system/sys/sysSubsystem/list'
}

const regionFieldNames = { label: 'areaName', value: 'areaCode', }
const systemFieldNames = { label: 'name', value: 'id', }

const systemOptions = ref([])
const regionOptions = ref([])

watch(() => props.formData, (val) => {
  if (val.type == 'edit') {
    formState.subsystemname = val.itemData.subsystemname
    formState.subsystemid = val.itemData.subsystemid
    formState.areaName = val.itemData.areaName
    formState.areaCode = val.itemData.areaCode
    showCode.value = setShowCode(val.itemData.areaCode)
  }
}, {
  immediate: true
})

onMounted(() => {
  loadRegionList()
  loadSystemList()
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

function loadSystemList() {
  systemOptions.value = []
  defHttp.get(
    {
      url: urlList.systemList,
      params: { pageSize: 1000, pageNo: 1 }
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      systemOptions.value = res.result.records
    } else {
      message.warning(res?.message || '未查询到行政区数据！')
    }
  })
}

function onSystemChange(value, selectedOptions) {
  formState.subsystemid = selectedOptions.id
  formState.subsystemname = selectedOptions.name
}

function onRegionChange(value, selectedOptions) {
  console.log(value, selectedOptions)
  formState.areaCode = selectedOptions[value.length - 1].areaCode
  showCode.value = value
  formState.areaName = selectedOptions[value.length - 1].areaName
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
        let url = props.formData.type == 'edit' ? urlList.edit : urlList.add
        let method = props.formData.type == 'edit' ? 'put' : 'post'

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