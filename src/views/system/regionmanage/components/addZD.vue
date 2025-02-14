<template>
  <div class="addNewContent">
    <!-- 新增目录 -->
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      :rules="catalogRules"
    >
      <a-form-item
        label="宗地归属名称"
        ref="dictName"
        name="dictName"
      >
        <a-input v-model:value="formState.dictName" />
      </a-form-item>
      <a-form-item
        label="宗地归属代码"                   
        ref="dictCode"
        name="dictCode"
      >
        <a-input v-model:value="formState.dictCode" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, reactive, ref, watch } from 'vue';
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
  dictName: '',
  dictCode: ''
});

const catalogRules: any = {
  dictName: [
    { required: true, message: '请输入宗地归属名称', trigger: 'change' },
  ],
  dictCode: [
    { required: true, message: '请输入宗地归属代码', trigger: 'change' },
  ]
}

watch(() => props.formData, (val) => {
  if(val.type == 'edit') {
    formState.dictName = val.itemData.dictName
    formState.dictCode = val.itemData.dictCode
  }
}, {
  immediate: true
})

// 添加宗地归属
const addZDGS = () => {
  return new Promise((resolve, reject) => {
    formRef.value
      .validate()
      .then(() => {
        let params = {
            description: props.formData.itemData.areaCode || props.formData.itemData.description,
            dictName: formState.dictName,
            dictCode: formState.dictCode,
            dmlx: 'zdgs',
          }
        if(props.formData.type == 'edit') {
          params = { ...props.formData.itemData, ...{ dictName: formState.dictName, dictCode: formState.dictCode }}
        }
        // 新增
        defHttp.post(
          {
            url: '/api/zrzy-bdc/sys/dict/insertOrUpdate',
            data: params
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            if (props.formData.type == 'edit') {
              message.success('宗地归属修改成功！')
            } else {
              message.success('宗地归属新增成功！')
            } 
            return resolve(true)
          } else {
            message.warning(res?.message || '操作失败！')
            return reject()
          }
        })
      }).catch((error:any) => {
        console.log('error', error);
      });
  })
}

defineExpose({
  addZDGS
});

</script>

<style scoped lang="less">
</style>