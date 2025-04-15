<template>
  <div class="report-table-modal">
    <a-form ref="formRef" :model="reportData" :label-col="{ style: { width: '150px' } }" layout="vertical" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="12">
            <a-form-item label="上报视图/表名" name="tableName" :rules="[{ required: true, message: '请选择上报视图/表名' }]">
                <a-input v-model:value="reportData.tableName" :readOnly="title == '编辑'" prefix="" suffix="" />
            </a-form-item>
        </a-col>
        <a-col :span="12">
            <a-form-item label="关键字段名" name="keyValue" :rules="[{ required: true, message: '请输入关键字段名' }]">
                <a-input v-model:value="reportData.keyValue" prefix="" suffix="" />
            </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="24">
          <a-form-item label="上报SQL" name="content" class="form-item-content">
            <monaco-editor v-model="reportData.content" language="sql"
                style="width: 100%;border: 1px solid #e5e7eb;" height="calc(40vh - 100px)">
            </monaco-editor>
          </a-form-item>
        </a-col>
      </a-row>
      <div style="text-align: right; margin-bottom: 10px">
        <a-button type="primary" @click="handleResolve">解析</a-button>
      </div>
      <a-row :gutter="24">
        <a-col :span="24">
          <a-form-item label="上报字段" name="reportValue">
            <a-transfer
              v-model:target-keys="reportData.reportValueArr"
              v-model:selected-keys="selectedKeys"
              :data-source="reportColumns"
              :render="item => item.title"
              show-search
              @change="handleChange"
              @search="handleSearch"
              style="width: 100%"
              :listStyle="{ height: 'calc(42vh - 100px)', width: '50%' }"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { createVNode, ref, watch } from "vue"
import monacoEditor from '/@/components/monaco/monacoEditor.vue'
import { message, Modal } from "ant-design-vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import dayjs from "dayjs"
import { useUserStore } from "/@/store/modules/user"
import { defHttp } from "/@/utils/http/axios"

const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: ''
  }
})

let reportData = ref<any>({})
let reportColumns = ref<any>([])
let filterColumns = ref<any>([])
let baseColumns = ref<any>([])
const selectedKeys = ref<string[]>([]);
let lastSql = ''
let isResolve = false
let formRef = ref()

const emit = defineEmits(['ok'])

watch(() => props.data,(newVal) => {
  reportData.value = JSON.parse(JSON.stringify(newVal || {}))
  lastSql = reportData.value.content || ''
  if (reportData.value.reportValue && reportData.value.content) {
    handleResolve()
  }
}, {
  immediate: true,
  deep: true
})

watch(() => reportData.value.content, (newVal) => {
  isResolve = false
})

enum api {
  field = '/magicapi/zrzy-form/sql/fileds'
}


const handleChange = (keys: string[], direction: string, moveKeys: string[]) => {
    moveKeys.forEach(key => {
        if (direction == 'left') {
            const nIndex = filterColumns.value.findIndex(item => item.key == key)
            filterColumns.value.splice(nIndex, 1)
        } else {
            filterColumns.value.push(reportColumns.value.find(item => item.key == key))
        }
    });
    baseColumns.value = filterColumns.value
};

const handleSearch = (dir: string, value: string) => {
    if (dir == 'right') {
        filterColumns.value = baseColumns.value.filter(item => item.title.indexOf(value) > -1)
    }
};

/**
 * 解析sql语句
 */
function handleResolve() {
  defHttp.post({ url: api.field, data: { sql: reportData.value.content } }, { withToken: true }).then((res) => {
    if (res && !res.message) {
      reportColumns.value = res.result.map((r) => {
        return {
          title: r,
          key: r,
          dataIndex: r
        }
      })
      isResolve = true
      lastSql = reportData.value.content
      if (reportData.value.reportValue) {
        reportData.value.reportValueArr = reportData.value.reportValue.includes(',') ? reportData.value.reportValue.split(',') : [reportData.value.reportValue]
      } 
    } else {
      message.warning(res.message)
    }
  })
}

/**
 * 确认
 */
function handleOk() {
  formRef.value.validate().then(() => {
     if (lastSql != reportData.value.content && !isResolve && reportColumns.value.length) {
        Modal.confirm({
          content: '检测到上报sql语句发生了变化, 但并未重新进行解析, 这可能会导致上报字段出现问题, 确定要继续吗?',
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            saveData()
          }}
        )
     } else {
       saveData()
     }
  })
}

function saveData() {
  if (!reportData.value.id0) {
    reportData.value.createTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
    reportData.value.createBy = useUserStore().getUserInfo.username
  } 
  reportData.value.updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
  reportData.value.updateBy = useUserStore().getUserInfo.username
  reportData.value.reportValue = reportData.value.reportValueArr?.join(',')
  emit('ok',reportData.value)
}

defineExpose({
  handleOk
})
</script>

<style lang="less" scoped>
.report-table-modal {
  .form-item-content {
    margin-bottom: 10px;
  }
}
</style>