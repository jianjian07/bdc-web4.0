<template>
  <a-modal v-model:open="modalVisible" :title="modalTitle" :footer="readOnly ? null : undefined"
           :confirm-loading="confirmLoading" @ok="handleModalOk">
    <a-form ref="formRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" :rules="rules" :model="formState">
      <a-form-item label="套餐包名称" name="packName">
        <a-input v-model:value="formState.packName" placeholder="请输入套餐包名称" :disabled="readOnly"/>
      </a-form-item>
      <a-form-item label="备注说明" name="remarks">
        <a-textarea v-model:value="formState.remarks" :auto-size="{ minRows: 4 }" placeholder="请输入备注说明"
                    :disabled="readOnly"/>
      </a-form-item>
      <a-form-item label="自动分配用户" name="izSysn">
        <a-switch v-model:checked="formState.izSysn" checked-value="1" un-checked-value="0" :disabled="readOnly"/>
      </a-form-item>
      <a-form-item label="开启状态" name="status">
        <a-switch v-model:checked="formState.status" checked-value="1" un-checked-value="0" :disabled="readOnly"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'

enum api {
  add = '/api/zrzy-system/sys/tenantPack/add',
  update = '/api/zrzy-system/sys/tenantPack/update',
  queryById = '/api/zrzy-system/sys/tenantPack/queryById',
}

const emit = defineEmits(['ok'])
const modalVisible = ref(false)
const modalTitle = ref('新增')
const confirmLoading = ref(false)
const readOnly = ref(false)
const includeTenantId = ref(false)
const formRef = ref()
const formState = ref<any>({})
const rules = {
  packName: [{ required: true, message: '请输入套餐包名称' }],
}

defineExpose({ add, edit, view })

/**
 * 租户 Tab 新增时才将指定的 tenantId 写入表单
 */
function createEmptyForm(tenantId?: string | number, withTenantId = false) {
  const form = {
    id: '',
    packName: '',
    status: '1',
    remarks: '',
    packCode: '',
    packType: '',
    izSysn: '0',
  }
  return withTenantId ? { ...form, tenantId } : form
}

function add(tenantId?: string | number, withTenantId = false) {
  modalTitle.value = '新增'
  readOnly.value = false
  includeTenantId.value = withTenantId
  formState.value = createEmptyForm(tenantId, withTenantId)
  modalVisible.value = true
}

function edit(id: string | number, withTenantId = false) {
  openDetail(id, false, withTenantId)
}

function view(id: string | number) {
  openDetail(id, true, false)
}

function openDetail(id: string | number, readonly: boolean, withTenantId: boolean) {
  modalTitle.value = readonly ? '查看' : '编辑'
  readOnly.value = readonly
  includeTenantId.value = withTenantId
  confirmLoading.value = true
  defHttp.get({ url: api.queryById, params: { id } }, { withToken: true }).then((res) => {
    if (res?.success) {
      const detail = res.result || {}
      const { tenantId, ...detailWithoutTenantId } = detail
      formState.value = {
        ...createEmptyForm(tenantId, withTenantId),
        ...(withTenantId ? detail : detailWithoutTenantId),
        status: String(detail.status ?? '1'),
        izSysn: String(detail.izSysn ?? '0'),
      }
      modalVisible.value = true
    } else {
      message.warning(res?.message || '套餐详情查询失败')
    }
  }).catch((err) => console.info(err)).finally(() => {
    confirmLoading.value = false
  })
}

/**
 *  提交保存
 */
function handleModalOk() {
  if (readOnly.value) return
  formRef.value?.validate().then(() => {
    confirmLoading.value = true
    const { id, tenantId, ...dataWithoutId } = formState.value
    const data = {
      ...dataWithoutId,
      ...(id ? { id } : {}),
      ...(includeTenantId.value ? { tenantId } : {}),
      status: String(formState.value.status),
      izSysn: String(formState.value.izSysn),
    }
    const url = id ? api.update : api.add
    return defHttp.post({ url, data }, { withToken: true }).then((res) => {
      if (res?.success) {
        message.success(`${modalTitle.value}成功`)
        modalVisible.value = false
        emit('ok')
      } else {
        message.warning(res?.message || `${modalTitle.value}失败`)
      }
    }).catch((err) => console.info(err)).finally(() => {
      confirmLoading.value = false
    })
  }).catch(() => undefined)
}
</script>
