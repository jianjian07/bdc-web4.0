<template>
  <div class="api-profile-modal">
    <a-modal v-model:open="modalVisible" :title="modalTitle" :width="1200" centered class="profile-modal"
             @ok="handleModalOk">
      <a-form
          ref="formRef"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          :rules="rules"
          :model="formState">
        <a-form-item label="接口名称" name="apiName">
          <a-input v-model:value="formState.apiName" placeholder="接口名称"></a-input>
        </a-form-item>
        <a-form-item label="接口编码" name="apiCode">
          <a-input v-model:value="formState.apiCode" placeholder="接口编码"></a-input>
        </a-form-item>
        <a-form-item label="版本" name="versionCode">
          <a-select :options="getDictItemsByCode('version_code')" v-model:value="formState.versionCode" style="width: 100%"></a-select>
        </a-form-item>
        <a-form-item label="配置项内容" name="content">
          <monaco-editor v-model="formState.content" language="json" height="450px">
          </monaco-editor>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formState.remark" placeholder="备注" :auto-size="{ minRows: 4 }"></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
// 弹窗是否显示
import { ref } from "vue"
import monacoEditor from '/@/components/monaco/monacoEditor.vue'
import dayjs from "dayjs"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { useUserStore } from "/@/store/modules/user"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
const userStore = useUserStore();
const userInfo = userStore.getUserInfo

let modalVisible = ref<boolean>(false)
// 弹窗标题
let modalTitle = ref<string>('新增')

let formRef = ref()

let formState = ref<any>({
  apiName: '',
  apiCode: '',
  content: '',
  remark: '',
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: ''
})

const rules = ref<any>({
  apiName: [{ required: true, message: '请输入接口名称!' }],
  apiCode: [{ required: true, message: '请输入接口编码!' }],
  versionCode: [{ required: true, message: '请选择版本!' }]
})

enum api {
  save = '/api/zrzy-api/onlapiContent/saveOnlApiContent',
}

const emit = defineEmits(['ok'])

defineExpose({
  add,
  edit
})

/**
 * 添加
 */
function add() {
  modalVisible.value = true
  modalTitle.value = '新增'
  reset()
}

/**
 * 编辑
 * @param record
 */
function edit(record) {
  console.log('re',record)
  modalVisible.value = true
  modalTitle.value = '编辑'
  formState.value = JSON.parse(JSON.stringify(record))
}

/**
 * 确认
 */
function handleModalOk() {
  formRef.value.validate().then(() => {
    console.log('formState.value',formState.value)
    let params = JSON.parse(JSON.stringify(formState.value))
    params.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    params.updateBy =  userInfo.username
    if (modalTitle.value == '新增') {
      params.createTime = params.updateTime
      params.createBy = params.updateBy
    }
    defHttp.post({ url: api.save, data: params }, { withToken: true }).then((res) => {
      if (res && res.code == 200) {
        message.success(modalTitle.value + '成功')
        modalVisible.value = false
        emit('ok')
      } else {
        message.error(res.message)
      }
    }).catch(err => {
      message.error(err)
    })
  })
}

/**
 * 清空数据
 */
function reset() {
  formState.value = {
    apiName: '',
    apiCode: '',
    versionCode: '',
    content: '',
    remark: '',
    createBy: '',
    createTime: '',
    updateBy: '',
    updateTime: ''
  }
}
</script>

<style lang="less" scoped>

</style>
