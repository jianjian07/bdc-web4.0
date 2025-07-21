<template>
  <div class="design-text-modal">
    <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="stateRules">
      <a-form-item label="名称" name="designName">
        <a-input v-model:value="formState.designName" placeholder="请输入名称"/>
      </a-form-item>
      <a-form-item label="设计内容" name="designContent">
        <a-textarea v-model:value="formState.designContent" placeholder="请输入设计内容"/>
      </a-form-item>
      <a-form-item label="设计类型" name="designType">
        <a-select v-model:value="formState.designType" :options="getDictItemsByCode('design_text')"/>
      </a-form-item>
      <a-form-item label="角色" name="roles">
        <a-select v-model:value="formState.rolesArr" :options="roleOptions" :field-names="{ label: 'name', value: 'id' }" mode="multiple" @change="handleChangeRoles"/>
      </a-form-item>
      <a-form-item label="是否公开" name="isOpenCheck">
        <a-checkbox v-model:checked="formState.isOpenCheck">公开</a-checkbox>
      </a-form-item>
      <a-form-item label="状态" name="zt">
        <a-select v-model:value="formState.zt" :options="getDictItemsByCode('sfys')"/>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import dayjs from "dayjs"
import { useUserStore } from "/@/store/modules/user"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

const formRef = ref()
let formState: any = reactive({
  id: '',
  designName: '',
  designContent: '',
  designType: '',
  roles: '',
  rolesArr: [],
  zt: '',
  isOpenCheck: false,
  isOpen: '0'
})

const labelCol = { style: { width: '130px' } };
const wrapperCol = { span: 20 };

const stateRules: any = {
  designName: [{ required: true, message: '请输入名称' }],
  designContent: [{ required: true, message: '请输入设计内容' }],
  designType: [{ required: true, message: '请选择设计类型' }],
  roles: [{ required: true, message: '请选择角色' }],
  zt: [{ required: true, message: '请选择状态' }]
}
// 角色
let roleOptions = ref<any>([]) 

enum api {
  add = '/api/zrzy-bdc/bdc/bdcDesignText/add',
  edit = '/api/zrzy-bdc/bdc/bdcDesignText/edit'
}

watch(() => props.formData, (val) => {
  if (val && val.roleList) {
    roleOptions.value = val.roleList
  }
  if (val && val.type != 'add') {
    Object.keys(formState).forEach(ele => {
       formState[ele] = val.record[ele]
    })
    formState['isOpenCheck'] = formState['isOpen'] == 1
    formState['rolesArr'] = formState['roles'].includes(',') ? formState['roles'].split(',') : [formState['roles']]
  }
}, {
  immediate: true
})

function handleChangeRoles(e) {
  formState.roles = formState.rolesArr.join(',')
}

function onSubmit() {
  return new Promise((resolve, reject) => {
    let url = props.formData.type == 'add' ? api.add : api.edit
    let method = props.formData.type == 'add' ? 'post' : 'put'
    formRef.value
      .validate()
      .then(() => {
        
        formState.roles = formState.rolesArr.join(',')
        formState.isOpen = formState.isOpenCheck ? 1 : 0
        formState.createTime = formState.createTime || dayjs().format("YYYY-MM-DD HH:mm:ss")
        formState.createBy = formState.createBy || useUserStore().getUserInfo.username
        formState.updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
        formState.updateBy = useUserStore().getUserInfo.username

        defHttp[method](
          {
            url: url,
            data: formState
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            message.success(res.message)
            return resolve(true)
          } else {
            message.warning(res?.message || '操作失败！')
            return reject()
          }
        })
      }).catch((error: any) => {
        console.log(error)
      });
  })
}

defineExpose({
  onSubmit
})

</script>

<style lang="less" scoped>

</style>