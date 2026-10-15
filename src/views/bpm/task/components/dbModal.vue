<template>
  <div class="dbModal">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 16 }"
      :rules="formRules"
    >
      <a-form-item
        label="流程实例"
        ref="processInstId"
        name="processInstId"
      >
        <a-input v-model:value="formState.processInstId" />
      </a-form-item>
      <a-form-item 
        label="督办原因"
        ref="superviseReason"
        name="superviseReason"
      >
        <a-textarea v-model:value="formState.superviseReason" :rows="4" placeholder="请输入督办原因"></a-textarea>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { useUserStore } from '/@/store/modules/user';

const userStore = useUserStore();
const userInfo = userStore.getUserInfo

enum api {
  queryByInstId = '/api/zrzy-bdc/process/extActSupervise/queryByInstId', //通过实例id查询
  queryById = '/api/zrzy-bdc/process/extActSupervise/queryById', // 通过id查询
  add = '/api/zrzy-bdc/process/extActSupervise/add', //添加
  edit = '/api/zrzy-bdc/process/extActSupervise/edit', //编辑
}

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

const formRef = ref()
let formState: any = ref({
  id: "",
  createBy: "",
  processId: "",
  processInstId: "",
  superviseMan: "",
  operateDate: new Date(),
  superviseReason: "",
  superviseStatus: 0
});
const formRules: any = {
  processInstId: [
    { required: true, message: '请输入流程实例', trigger: 'blur' },
  ],
  superviseReason: [
    { required: true, message: '请输入督办原因', trigger: 'blur' },
  ]
}
let edit = ref(false)

watch(() => props.formData, (val: any) => {
  if(val && val.record) {
    if(val.record.isSupervise === '1') {
      edit.value = true
      // 已经督办过，代表需要编辑，先通过实例id查询督办信息
      queryInfo(val.record)
    } else {
      // 新增督办，获取流程实例ID值
      formState.value.processInstId = val.record.processInstanceId
      formState.value.processId = val.record.processDefinitionId
    }
  }
}, {
  immediate: true
})

function queryInfo(record: any) {
  defHttp.get({
    url: api.queryByInstId,
    params: { id: record.processInstanceId }
  }, { withToken: true }).then((res: any) => {
    if(res && res.success) {
      formState.value = res.result
    }
  })
}

function getNowDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()

  return year + '-' + month + '-' + day
}

function onSubmit() {
  return new Promise((resolve, reject) => {
    formRef.value
      .validate()
      .then(() => {
        let method = edit.value ? 'put' : 'post'
        let url = edit.value ? api.edit : api.add

        formState.value.superviseMan = userInfo?.userId
        formState.value.operateDate = getNowDate()
        formState.value.superviseStatus = '1' //表示加急
        formState.value.isSupervise= '1' //督办

        // 根据edit值判断是新增还是编辑
        defHttp[method](
          {
            url: url,
            data: formState.value
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            message.success('操作成功！')
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

defineExpose({
  onSubmit
})
</script>

<style lang="less" scoped>
.dbModal {

}
</style>