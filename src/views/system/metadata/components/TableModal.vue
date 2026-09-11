<template>
  <a-drawer :title="title" :width="720" :open="open" :body-style="{ paddingBottom: '80px' }" @close="close">
    <a-form ref="formRef" :model="formData" :label-col="{ style: { width: '120px' } }" autocomplete="off">
      <a-form-item label="表名" name="tblName" :rules="[{ required: true, message: '请输入表名' }]">
        <a-input v-model:value="formData.tblName" placeholder="请输入数据库表名"/>
      </a-form-item>
      <a-form-item label="表名简称" name="tblShortName" :rules="[{ required: true, message: '请输入表名简称' }]">
        <a-input v-model:value="formData.tblShortName" placeholder="请输入表名简称"/>
      </a-form-item>
      <a-form-item label="表说明" name="tblText" :rules="[{ required: true, message: '请输入表说明' }]">
        <a-input v-model:value="formData.tblText" placeholder="请输入表说明"/>
      </a-form-item>
      <a-form-item label="数据源" name="dbKey" :rules="[{ required: true, message: '请选择数据源' }]">
        <a-select v-model:value="formData.dbKey" :options="dataSources" placeholder="请选择数据源" allow-clear/>
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">停用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="排序" name="orderNum">
        <a-input-number v-model:value="formData.orderNum" :min="0" :precision="0" style="width: 100%"/>
      </a-form-item>
    </a-form>
    <template #extra>
      <a-space>
        <a-button @click="close">取消</a-button>
        <a-button type="primary" :loading="saving" @click="save">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '元数据表' },
  data: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['close', 'saved'])
const formRef = ref()
const saving = ref(false)
const dataSources = ref<any[]>([])
const formData = ref<any>({ status: 1, orderNum: 0, ...(props.data || {}) })
onMounted(() => {
  loadDataSources()
})

/**
 * 加载
 */
function loadDataSources() {
  defHttp.get({ url: '/api/zrzy-system/sys/datasource/options' }, { withToken: true })
    .then((res: any) => {
    dataSources.value = res.result || []
    })
    .catch(() => {
      message.error('获取数据源失败')
    })
}

/**
 * 保存
 */
function save() {
  formRef.value.validate()
    .then(() => {
    saving.value = true
    return defHttp.post({
      url: '/api/zrzy-form/metadata/tbl/saveOrUpdate',
      data: formData.value
    }, { withToken: true })
    })
    .then((res: any) => {
    if (res.success) {
      message.success('保存成功')
      emit('saved')
    } else message.error(res.message || '保存失败')
    })
    .catch((error: any) => {
      if (!error?.errorFields) message.error('保存失败')
    })
    .finally(() => {
      saving.value = false
    })
}

function close() {
  emit('close')
}
</script>
