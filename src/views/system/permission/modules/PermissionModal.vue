<template>
  <div class="permission-modal">
    <a-modal v-model:open="modalVisible" :width="760" :title="title + '权限配置'" :confirm-loading="confirmLoading"
             @ok="handleModalOk" @cancel="handleModalCancel"
             :body-style="{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }">
      <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
        <a-form-item label="用户">
          <a-input v-model:value="formState.realName"/>
        </a-form-item>
        <template v-if="type == 'db'">
          <a-form-item label="流程">
            <a-tree-select v-model:value="formState.superviseProcessArr" :tree-data="treeData" show-search
                           tree-node-filter-prop="title"
                           label-in-value multiple
                           tree-checkable
                           allowClear
                           :field-names="{
               children: 'children',
               value: 'key',
               label: 'title',
            }"/>
          </a-form-item>
          <a-form-item label="状态">
            <a-switch v-model:checked="formState.superviseStatus" :checkedValue="1" :unCheckedValue="0"
                      checked-children="启用" un-checked-children="禁用"/>
          </a-form-item>
        </template>
        <template v-if="type == 'jj'">
          <a-form-item label="流程">
            <a-tree-select v-model:value="formState.urgentProcessArr" :tree-data="treeData" show-search
                           tree-node-filter-prop="title"
                           label-in-value multiple
                           tree-checkable
                           allowClear
                           :field-names="{
                 children: 'children',
                 value: 'key',
                 label: 'title',
              }"/>
          </a-form-item>
          <a-form-item label="状态">
            <a-switch v-model:checked="formState.urgentStatus" :checkedValue="1" :unCheckedValue="0"
                      checked-children="启用" un-checked-children="禁用"/>
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { findNode } from "/@/views/online/utils/commonUtils.ts"

const props = defineProps({
  type: {
    type: String,
    default: 'db' // db 督办 jj 加急
  },
  treeData: {
    type: Array,
    default: () => []
  }
})

// 弹窗是否显示
let modalVisible = ref<boolean>(false)
// 确认loading
let confirmLoading = ref<boolean>(false)
// 标题
let title = ref<string>("")

let formState = ref<any>({
  realName: '',
})

const emit = defineEmits(['ok'])

enum api {
  db = '/api/zrzy-bdc/process/extActSuperviseAuthority/save',
  jj = '/api/zrzy-bdc/process/extActUrgentAuthority/save'
}

onMounted(() => {

})

/**
 * 新增
 */
function add() {
  title.value = '新增'
  modalVisible.value = true
}

/**
 * 编辑
 */
function edit(record) {
  title.value = '编辑'
  modalVisible.value = true
  formState.value = JSON.parse(JSON.stringify(record))
  if (props.type == 'db') {
    const processKeys = record.superviseProcess ? record.superviseProcess.split(',') : []
    formState.value.superviseProcessArr = processKeys.map(key => {
      const node = findNode(props.treeData, key, 'key')
      return { value: key, label: node?.title || key }
    })
  } else {
    const processKeys = record.urgentProcess ? record.urgentProcess.split(',') : []
    formState.value.urgentProcessArr = processKeys.map(key => {
      const node = findNode(props.treeData, key, 'key')
      return { value: key, label: node?.title || key }
    })
  }
}

/**
 * 确认
 */
function handleModalOk() {
  confirmLoading.value = true
  let url = props.type == 'db' ? api.db : api.jj
  let data = JSON.parse(JSON.stringify(formState.value))
  data.superviseProcess = data.superviseProcessArr ? data.superviseProcessArr.map(item => item.value).join(',') : ''
  data.urgentProcess = data.urgentProcessArr ? data.urgentProcessArr.map(item => item.value).join(',') : ''
  if (props.type == 'db') {
    data.superviseUser = data.id
  } else {
    data.urgentUser = data.id
  }
  delete data.id
  delete data.superviseProcessArr
  delete data.urgentProcessArr
  defHttp.put({ url: url, data: data }, { withToken: true }).then((res) => {
    confirmLoading.value = false
    if (res && res.success) {
      message.success('保存成功!')
      modalVisible.value = false
      emit('ok')
    } else {
      message.error(res?.message || '保存失败!')
    }
  })
}

/**
 * 取消
 */
function handleModalCancel() {
  modalVisible.value = false
}

defineExpose({
  add,
  edit
})
</script>

<style scoped lang="less">

</style>