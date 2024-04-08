<template>
  <div class="sys-menu-form">
    <a-form ref="formRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" :rules="rules" :model="formState">
      <a-form-item label="菜单类型" name="type">
        <a-radio-group v-model:value="formState.type" button-style="solid">
          <a-radio-button :value="0">目录</a-radio-button>
          <a-radio-button :value="1">菜单</a-radio-button>
          <a-radio-button :value="2">按钮</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="菜单图标" v-show="formState.type != 2">
        <a-input v-model:value="formState.icon">
          <template #addonAfter>
            <setting-outlined />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item label="外联菜单" v-show="formState.type == 1">
        <a-radio-group v-model:value="formState.iframe" button-style="solid">
          <a-radio-button :value="true">是</a-radio-button>
          <a-radio-button :value="false">否</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="菜单可见" v-show="formState.type != 2">
        <a-radio-group v-model:value="formState.hidden" button-style="solid">
          <a-radio-button :value="false">是</a-radio-button>
          <a-radio-button :value="true">否</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="菜单缓存" v-show="formState.type == 1">
        <a-radio-group v-model:value="formState.cache" button-style="solid">
          <a-radio-button :value="true">是</a-radio-button>
          <a-radio-button :value="false">否</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-show="formState.type != 2" label="菜单名称" name="name">
        <a-input v-model:value="formState.name" placeholder="菜单名称"></a-input>
      </a-form-item>
      <a-form-item v-show="formState.type == 2" label="按钮名称">
        <a-input v-model:value="formState.name" placeholder="按钮名称"></a-input>
      </a-form-item>
      <a-form-item v-show="formState.type != 0 && formState.iframe == false" label="权限标识">
        <a-input v-model:value="formState.permission" placeholder="权限标识"></a-input>
      </a-form-item>
      <a-form-item v-show="formState.type != 2" label="路由地址" name="path">
        <a-input v-model:value="formState.path" placeholder="路由地址"></a-input>
      </a-form-item>
      <a-form-item v-show="formState.type != 2" label="组件路径" name="component">
        <a-input v-model:value="formState.component" placeholder="组件路径"></a-input>
      </a-form-item>
      <a-form-item v-show="formState.type != 2">
        <template #label>
          <div class="label" style="margin-right: 5px">组件名称</div>
          <a-popover>
            <template #content>
              此处名称应和vue组件的name属性保持一致。<br />
              组件名称不能重复，主要用于路由缓存功能。<br />
              如果组件名称和vue组件的name属性不一致，则会导致路由缓存失效。<br />
              非必填，留空则会根据访问路径自动生成。
            </template>
            <div class="zjmc-info">
              <InfoCircleOutlined />
            </div>
          </a-popover>
        </template>
        <a-input v-model:value="formState.componentName" placeholder="组件名称"></a-input>
      </a-form-item>
      <a-form-item v-show="formState.iframe == true" label="外链地址">
        <a-input v-model:value="formState.url" placeholder="外链地址"></a-input>
      </a-form-item>
      <a-form-item label="菜单排序">
        <a-input v-model:value="formState.sortid" placeholder="菜单排序"></a-input>
      </a-form-item>
      <a-form-item label="上级类目" name="pid">
        <a-tree-select v-model:value="formState.pid" style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="上级类目" tree-default-expand-all
          :tree-data="treeRoot">
        </a-tree-select>
      </a-form-item>
      <a-form-item label="附加信息">
        <a-textarea v-model:value="formState.extra" :auto-size="{ minRows: 4 }" placeholder="附加信息">
        </a-textarea>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import { SettingOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const props = defineProps({
  type: {
    type: String,
    default: '新增'
  },
  treeRoot: {
    type: Array,
    default: []
  },
  record: {
    type: Object,
    default: {}
  },
  sysId: {
    type: [String, Number],
    default: ''
  }
})

let formRef = ref()
let formState = ref<any>({
  name: '',
  icon: '',
  type: 1,
  iframe: false,
  hidden: false,
  cache: false,
  sortid: 999,
  pid: 0,
  subsystemId: props.sysId
})

const rules = ref<any>({
  type: [{ required: true, message: '请输入菜单类型!' }],
  name: [{ required: true, message: formState.type == 2 ? '请输入按钮名称' : '请输入菜单名称!' }],
  path: [{ required: true, message: '请输入路由地址!' }, { pattern: /^\//, message: '请填写正确的格式' }],
  component: [{ required: true, message: '请输入组件路径!' }],
  pid: [{ required: true, message: '请选择上级类目!' }]
})

const emit = defineEmits(['formOk'])

enum api {
  // 添加菜单
  add = '/api/zrzy-system/menu/add',
  // 编辑菜单
  edit = '/api/zrzy-system/menu/edit'
}

defineExpose({
  formState,
  handleOk
})

watch(() => props.record, () => {
  initFields()
}, {
  deep: true
})

onMounted(() => {
  initFields()
})

/**
 * 初始表单
 */
function initFields() {
  if (props.record) {
    setFields(props.record)
  } else {
    resetFields()
  }
}

/**
 * 重置表单
 */
function resetFields() {
  formRef.value.resetFields()
  formState.value = {
    icon: '',
    type: 1,
    iframe: false,
    hidden: false,
    cache: false,
    sortid: 999,
    pid: 0,
    subsystemId: props.sysId
  }
}

/**
 * 设置表单
 * @param record
 */
function setFields(record) {
  let rec = JSON.parse(JSON.stringify(record))
  delete rec.hasChildren
  delete rec.children
  delete rec.createTime
  formState.value = rec
}


/**
 * 提交
 */
function handleOk() {
  formRef.value.validate().then(() => {
    let apiUrl = props.type == '新增' ? api.add : api.edit
    defHttp.post({ url: apiUrl, params: formState.value }, { withToken: true }).then((res) => {
      message.success(props.type + '成功')
      emit('formOk')
    }).catch(err => {
      message.error(props.type + '失败')
    })
  })
    .catch(error => {
      console.log('error', error);
    })
}

</script>

<style lang="less" scoped>
.sys-menu-form {
  height: 100%;
}

.zjmc-info {
  &:hover {
    // color: @primary-color
  }
}
</style>
