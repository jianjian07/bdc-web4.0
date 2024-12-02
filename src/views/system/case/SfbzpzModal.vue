<template>
  <div class="sfbzpz-modal">
    <a-spin :spinning="spinning">
      <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="费用类型">
          <a-select disabled v-model:value="formState.sflx" :options="getDictItemsByCode('fylx')" placeholder="请选择费用类型">
          </a-select>
        </a-form-item>
         <a-form-item label="收费条目名称" name="sfxmc" :rules="[{ required: true, message: '请输入收费条目名称' }]">
           <a-input v-model:value="formState.sfxmc" placeholder="请输入收费条目名称"></a-input>
         </a-form-item>
      </a-form>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

let spinning = ref<boolean>(false)
//
let formState = ref<any>({
  sflx: '',
  sfxmc: ''
})
let formRef = ref<any>()

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

watch(() => props.formData, (val: any) => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formState.value.sflx = val.value || ''
},{
  immediate: true,
  deep: true
})

enum api {
  add = '/api/zrzy-bdc/bdc/sfconfig/add'
}

function handleOk() {
  return new Promise((resolve, reject) => {
    formRef.value
    .validate()
    .then(() => {
      defHttp.post({ url: api.add, data: formState.value }, { withToken: true }).then((res) => {
        if (res && res.success) {
          resolve(true)
          message.success('添加成功')
        } else {
          resolve(false)
          message.success('添加失败')
        }
      })
    })
  })
}

defineExpose({
  handleOk
})
</script>

<style lang="less" scoped>

</style>