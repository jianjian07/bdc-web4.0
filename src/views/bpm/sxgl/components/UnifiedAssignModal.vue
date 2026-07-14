<template>
  <a-modal :open="props.open" :title="modalTitle" :width="860" :mask-closable="false" destroy-on-close centered
    @update:open="onOpenChange" @ok="onSave" @cancel="onCancel" :confirm-loading="saving">
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="当前矿业权类型">
            <a-input :value="qllxLabel" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="目标已有匹配项目">
            <a-switch v-model:checked="formState.overrideExisting" checked-children="覆盖" un-checked-children="补齐" />
            <span style="margin-left: 8px; color: #999">默认仅补齐目标节点缺失项</span>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="当前节点表单（默认全选）">
            <a-table size="small" bordered :data-source="vfdList" :columns="vfdColumns" :pagination="false"
              :row-key="record => record.id0"
              :row-selection="{ selectedRowKeys: formState.vfdIdList, onChange: onVfdSelectionChange }" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="当前节点按钮（默认全选）">
            <a-table size="small" bordered :data-source="btnList" :columns="btnColumns" :pagination="false"
              :row-key="record => record.id0"
              :row-selection="{ selectedRowKeys: formState.btnIdList, onChange: onBtnSelectionChange }" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="目标流程（单选，默认当前流程）" required>
            <!-- <a-select v-model:value="formState.targetLcid" :options="processOptions" :loading="processLoading"
              show-search option-filter-prop="label" placeholder="请选择目标流程" @change="onTargetLcidChange" /> -->
            <a-tree-select v-model:value="formState.targetLcid" show-search tree-node-filter-prop="title"
              :tree-data="processOptions" placeholder="请选择目标流程"
              :fieldNames="{ children: 'children', title: 'title', value: 'key' }" allowClear
              @change="onTargetLcidChange">
            </a-tree-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="目标节点（多选）" required>
            <a-select mode="multiple" :options="targetNodeOptions" :loading="nodeLoading" show-search
              option-filter-prop="label" placeholder="请选择目标节点" @change="onTargetNodeChange" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { message } from 'ant-design-vue'
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'

const props = defineProps({
  open: { type: Boolean, default: false },
  nodeInfo: { type: Object, default: () => ({}) },
  isBl: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'success'])

enum api {
  vfdListUrl = '/api/zrzy-bdc/flow/vfd/flowList',
  btnListUrl = '/api/zrzy-bdc/flow/btn/btnList',
  processListUrl = '/api/zrzy-bdc/flow/sxml/treeList',
  nodeListUrl = '/api/zrzy-bdc/act/process/extActProcessNode/list',
  unifiedAssignUrl = '/api/zrzy-bdc/flow/public/unifiedAssign'
}

const vfdColumns = [
  { title: '类别', dataIndex: 'bdlb', width: 80, align: 'center' },
  { title: '表单地址', dataIndex: 'vfd', ellipsis: true },
  { title: '名称', dataIndex: 'vfdtitle', width: 160, align: 'center' },
  { title: '顺序', dataIndex: 'orderNum', width: 60, align: 'center' }
]
const btnColumns = [
  { title: '按钮', dataIndex: 'funName', width: 100, align: 'center' },
  { title: '名称', dataIndex: 'btnName', width: 120, align: 'center' },
  { title: '位置', dataIndex: 'anwz', width: 80, align: 'center' },
  { title: '顺序', dataIndex: 'orderNum', width: 60, align: 'center' }
]

const vfdList = ref<any[]>([])
const btnList = ref<any[]>([])
const processOptions = ref<any[]>([])
const targetNodeOptions = ref<any[]>([])
const processLoading = ref(false)
const nodeLoading = ref(false)
const saving = ref(false)

const formState = reactive<{
  targetLcid: string
  targetJdidList: string[]
  vfdIdList: string[]
  btnIdList: string[]
  overrideExisting: boolean
}>({
  targetLcid: '',
  targetJdidList: [],
  vfdIdList: [],
  btnIdList: [],
  overrideExisting: false
})

const qllxLabel = computed(() => {
  const code = props.nodeInfo?.qllx
  if (!code) return ''
  const dict = getDictItemsByCode('qllx') as any[]
  const hit = dict?.find((d: any) => d.value === code)
  return hit ? `${hit.label}（${code}）` : code
})

const modalTitle = computed(() => {
  const nodeName = props.nodeInfo?.jdmc
  return nodeName ? `当前节点：【${nodeName}】` : '表单、按钮配置统赋'
})

watch(() => props.open, (val) => {
  if (val) {
    initForm()
  }
}, { immediate: true })

function onOpenChange(val: boolean) {
  emit('update:open', val)
}

function initForm() {
  formState.overrideExisting = false
  formState.targetLcid = props.nodeInfo?.lcid || ''
  formState.targetJdidList = []
  loadVfdList()
  loadBtnList()
  loadProcessOptions().then(() => {
    if (formState.targetLcid) {
      loadTargetNodes(formState.targetLcid)
    }
  })
}

function loadVfdList() {
  vfdList.value = []
  formState.vfdIdList = []
  defHttp.get({
    url: api.vfdListUrl,
    params: { lcid: props.nodeInfo?.lcid, jdid: props.nodeInfo?.jdid, qllx: props.nodeInfo?.qllx }
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      vfdList.value = res.result || []
      formState.vfdIdList = vfdList.value.map((item: any) => item.id0)
    }
  })
}

function loadBtnList() {
  btnList.value = []
  formState.btnIdList = []
  defHttp.get({
    url: api.btnListUrl,
    params: { lcid: props.nodeInfo?.lcid, jdid: props.nodeInfo?.jdid, qllx: props.nodeInfo?.qllx }
  }, { withToken: true }).then((res) => {
    if (res?.success) {
      btnList.value = res.result || []
      formState.btnIdList = btnList.value.map((item: any) => item.id0)
    }
  })
}

function loadProcessOptions() {
  processLoading.value = true
  const ajlx = props.isBl ? 2 : 1
  return defHttp.get({ url: api.processListUrl, params: { ajlx } }, { withToken: true })
    .then((res) => {
      processOptions.value = res.result
      // const list: any[] = []
      // if (res?.success && Array.isArray(res.result)) {
      //   for (const node of res.result) {
      //     if (node?.children?.length) {
      //       for (const child of node.children) {
      //         list.push({ label: child.lcmc || child.title, value: child.lcid || child.key })
      //       }
      //     } else if (node?.lcid) {
      //       list.push({ label: node.lcmc || node.title, value: node.lcid })
      //     }
      //   }
      // }
      // processOptions.value = list
    })
    .finally(() => {
      processLoading.value = false
    })
}

function onTargetLcidChange(value: string) {
  formState.targetJdidList = []
  if (value) {
    loadTargetNodes(value)
  } else {
    targetNodeOptions.value = []
  }
}

function loadTargetNodes(lcid: string) {
  nodeLoading.value = true
  defHttp.get({ url: api.nodeListUrl, params: { processId: lcid } }, { withToken: true })
    .then((res) => {
      const list: any[] = []
      if (res?.success && Array.isArray(res.result)) {
        for (const node of res.result) {
          const value = node.processNodeCode || node.id
          if (!value) continue
          if (lcid === props.nodeInfo?.lcid && value === props.nodeInfo?.jdid) {
            continue
          }
          list.push({ label: node.processNodeName, value })
        }
      }
      targetNodeOptions.value = list
    })
    .finally(() => {
      nodeLoading.value = false
    })
}

function onVfdSelectionChange(keys: string[]) {
  formState.vfdIdList = keys
}

function onBtnSelectionChange(keys: string[]) {
  formState.btnIdList = keys
}
function onTargetNodeChange(value: string, option: any) {
  formState.targetJdidList = option.map((opt: any) => ({
    id: opt.value,
    name: opt.label
  }));
}
function onSave() {
  if (!formState.vfdIdList.length && !formState.btnIdList.length) {
    message.warning('请至少选择一个表单或按钮配置')
    return
  }
  if (!formState.targetLcid) {
    message.warning('请选择目标流程')
    return
  }
  if (!formState.targetJdidList.length) {
    message.warning('请至少选择一个目标节点')
    return
  }
  saving.value = true
  const payload = {
    sourceLcid: props.nodeInfo?.lcid,
    sourceJdid: props.nodeInfo?.jdid,
    targetLcid: formState.targetLcid,
    targetJdidList: formState.targetJdidList,
    qllx: props.nodeInfo?.qllx,
    vfdIdList: formState.vfdIdList,
    btnIdList: formState.btnIdList,
    overrideExisting: formState.overrideExisting
  }
  defHttp.post({ url: api.unifiedAssignUrl, data: payload }, { withToken: true })
    .then((res) => {
      if (res?.success) {
        const result = res.result || {}
        message.success(
          `统赋成功：新增表单 ${result.insertedVfdCount || 0} 条，覆盖表单 ${result.overriddenVfdCount || 0} 条；新增按钮 ${result.insertedBtnCount || 0} 条，覆盖按钮 ${result.overriddenBtnCount || 0} 条`
        )
        saving.value = false
        emit('success', result)
        emit('update:open', false)
      } else {
        message.error(res?.message || '统赋失败')
      }
    })
    .finally(() => {
      saving.value = false
    })
}

function onCancel() {
  emit('update:open', false)
}
</script>

<style scoped lang="less">
:deep(.ant-table-cell) {
  padding: 6px 8px;
}
</style>
