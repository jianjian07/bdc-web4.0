<template>
  <div class="sys-role-modal">
    <a-modal v-model:open="modalVisible" :title="modalTitle" :confirm-loading="confirmLoading" @ok="handleModalOk">
      <a-form ref="formRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" :rules="rules" :model="formState">
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="formState.name" placeholder="角色名称"></a-input>
        </a-form-item>
        <a-form-item label="权限标识" name="permission">
          <a-select v-model:value="formState.permission" placeholder="权限标识">
            <a-select-option value="admin">超级管理员</a-select-option>
            <a-select-option value="sysmanager">系统管理员</a-select-option>
            <a-select-option value="manager">部门管理员</a-select-option>
            <a-select-option value="common">普通用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="说明">
          <a-textarea v-model:value="formState.remark" :auto-size="{ minRows: 4 }" placeholder="说明">
          </a-textarea>
        </a-form-item>
        <a-form-item label="排序" name="sortid">
          <a-input v-model:value.number="formState.sortid" placeholder="排序"></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { defHttp } from '/@/utils/http/axios';
import { message } from "ant-design-vue";
enum api {
  updateRoleApi = '/api/zrzy-system/role/update',//修改角色
  addRoleApi = '/api/zrzy-system/role/add',//新增角色
}
// 弹窗是否显示
let modalVisible = ref<boolean>(false)
// 弹窗标题
let modalTitle = ref<string>('新增')
// 弹窗loading
let confirmLoading = ref<boolean>(false)
// 表单实例
let formRef = ref()
// 表单数据
let formState = ref<any>({})

const rules = ref<any>({
  name: [{ required: true, message: '请输入菜单名称!' }],
  permission: [{ required: true, message: '请选择权限标识!' }],
  sortid: [{ required: true, message: '请输入排序!' }]
})

const props = defineProps({
  modalShow: {
    type: Boolean,
    default: false
  }
})

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
  formRef.value?.resetFields()
  formState.value = {}
}

/**
 * 编辑
 * @param record
 */
function edit(record) {
  modalVisible.value = true
  modalTitle.value = '编辑'
  formState.value = JSON.parse(JSON.stringify(record))
}

/**
 * 弹窗确认
 */
function handleModalOk() {
  formRef.value.validate().then(() => {
    let _url = api.addRoleApi
    if (formState.value.id) {
      _url = api.updateRoleApi
    }
    defHttp.post({ url: _url, data: formState.value }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success(modalTitle.value + '成功')
        modalVisible.value = false
        emit('ok')
      } else {
        message.warning(modalTitle.value + '失败')
      }
    }).catch(err => {
      console.info(err)
    })
    console.log('values', formState.value,);
  })
    .catch(error => {
      console.log('error', error);
    })
}
</script>

<style lang="less" scoped></style>
