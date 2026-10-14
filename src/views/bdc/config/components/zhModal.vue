<template>
  <a-modal v-model:open="visible" :confirm-loading="confirmLoading" :mask-closable="false" width="600px"
    :ok-text="mode === 'edit' ? '确认修改' : '确认新增'" cancel-text="取消" class="zh-modal" @ok="handleOk"
    @cancel="handleCancel">
    <template #title>
      <div class="modal-title">
        <div class="title-icon" :class="mode">
          <EditOutlined v-if="mode === 'edit'" />
          <PlusOutlined v-else />
        </div>
        <div class="title-text">
          <div class="title-main">{{ modalTitle }}</div>
          <div class="title-sub" v-if="parentNode">父节点：{{ parentNode.label }} ({{ parentNode.value || '-' }})
          </div>
        </div>
      </div>
    </template>

    <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }"
      class="zh-form">
      <a-form-item label="名称" name="label">
        <a-input v-model:value="formState.label" placeholder="请输入名称，如：产权首次" allow-clear />
      </a-form-item>
      <a-form-item label="登记类型" name="value">
        <a-input v-model:value="formState.value" placeholder="请输入登记类型，如：0101" allow-clear />
      </a-form-item>
      <a-form-item label="显示类型" name="xslx">
        <a-select v-model:value="formState.xslx" placeholder="请选择或输入显示类型" allow-clear show-search>
          <a-select-option v-for="opt in xslxOptions" :key="opt" :value="opt">{{ opt }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="国标登记类型" name="gbdjlx">
        <a-select v-model:value="formState.gbdjlx" placeholder="请选择国标登记类型" allow-clear show-search>
          <a-select-option v-for="opt in gbdjlxOptions" :key="opt.value" :value="opt.value">
            {{ opt.value }} - {{ opt.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { EditOutlined, PlusOutlined } from '@ant-design/icons-vue';

const emit = defineEmits<{
  (e: 'ok', payload: { mode: 'add' | 'edit'; data: any; target?: any; parent?: any }): void;
}>();

const visible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const mode = ref<'add' | 'edit'>('add');
const targetNode = ref<any>(null);
const parentNode = ref<any>(null);

const xslxOptions = ['SYQZT', 'DYZT', 'YGZT', 'JZWQZT', 'TDQZT'];
const gbdjlxOptions = [
  { value: '100', label: '首次登记' },
  { value: '200', label: '转移登记' },
  { value: '300', label: '变更登记' },
  { value: '400', label: '注销登记' },
  { value: '500', label: '更正登记' },
  { value: '600', label: '异议登记' },
  { value: '700', label: '预告登记' },
  { value: '800', label: '查封登记' },
  { value: '900', label: '其他登记' },
];

const formState = reactive({
  label: '',
  value: '',
  xslx: '',
  gbdjlx: '',
});

const rules = {
  label: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  xslx: [{ required: true, message: '请选择显示类型', trigger: 'change' }],
  gbdjlx: [{ required: true, message: '请选择国标登记类型', trigger: 'change' }],
};

const modalTitle = computed(() => {
  if (mode.value === 'edit') return '编辑节点';
  return parentNode.value ? '新增子节点' : '新增根节点';
});

function open(payload: { mode: 'add' | 'edit'; node: any; parent: any }) {
  mode.value = payload.mode;
  targetNode.value = payload.node || null;
  parentNode.value = payload.parent || null;
  if (payload.mode === 'edit' && payload.node) {
    formState.label = payload.node.label ?? '';
    formState.value = payload.node.value ?? '';
    formState.xslx = payload.node.xslx ?? '';
    formState.gbdjlx = payload.node.gbdjlx ?? '';
  } else {
    formState.label = '';
    formState.value = '';
    formState.xslx = '';
    formState.gbdjlx = '';
  }
  visible.value = true;
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 0);
}

async function handleOk() {
  try {
    await formRef.value?.validate();
  } catch (e) {
    return;
  }
  const data = {
    label: formState.label.trim(),
    value: formState.value.trim(),
    xslx: formState.xslx.trim(),
    gbdjlx: formState.gbdjlx.trim(),
  };
  emit('ok', {
    mode: mode.value,
    data,
    target: targetNode.value,
    parent: parentNode.value,
  });
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}

defineExpose({
  open,
});
</script>

<style lang="less">
.zh-modal {
  .ant-modal-content {
    border-radius: 10px;
    overflow: hidden;
  }

  .ant-modal-header {
    border-bottom: 1px solid #f0f0f0;
    padding: 14px 20px;
    background: linear-gradient(135deg, #f6faff 0%, #eef5ff 100%);
  }

  .modal-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .title-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 16px;

      &.edit {
        background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
      }

      &.add {
        background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      }
    }

    .title-text {
      .title-main {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        line-height: 1.3;
      }

      .title-sub {
        font-size: 12px;
        color: #6b7280;
        margin-top: 2px;
      }
    }
  }

  .ant-modal-body {
    padding: 22px 16px 8px;
  }

  .zh-form {
    .ant-form-item-label>label {
      font-weight: 500;
      color: #374151;
    }
  }

  .ant-modal-footer {
    border-top: 1px solid #f0f0f0;
    padding: 12px 20px;
  }
}
</style>
