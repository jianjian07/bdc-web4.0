<template>
  <a-drawer v-model:open="visible" :title="title" :width="1400" @close="onClose">
    <template #extra>
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" :loading="saving" @click="onOk">确定</a-button>
    </template>
    <a-form layout="vertical" ref="formRef" :model="formData" :label-col="{ span: 8 }" :wrapper-col="{ span: 22 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="数据源编码" name="code" extra="同步任务按编码引用，编辑不可修改"
            :rules="[{ required: true, message: '请输入数据源编码' }]">
            <a-input v-model:value="formData.code" :disabled="isEdit" :maxlength="64" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="数据源名称" name="name" :rules="[{ required: true, message: '请输入数据源名称' }]">
            <a-input v-model:value="formData.name" :maxlength="128" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="数据库类型" name="dbType" :rules="[{ required: true, message: '请选择数据库类型' }]">
            <a-select v-model:value="formData.dbType" :options="getDictItemsByCode('database')" placeholder="请选择数据库类型"
              style="width: 100%" @change="onTypeChange" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="驱动类" name="dbDriver" extra="留空按连接地址自动推断">
            <a-input v-model:value="formData.dbDriver" placeholder="如 org.postgresql.Driver" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="主机" name="hostName" :rules="[{ required: true, message: '请输入主机' }]">
            <a-input v-model:value="formData.hostName" placeholder="如 192.168.1.100" @change="setDbUrl" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="端口" name="port" :rules="[{ required: true, message: '请输入端口' }]">
            <a-input-number v-model:value="formData.port" :min="1" :max="65535" style="width: 100%"
              @change="setDbUrl" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="数据库名" name="dbName" :rules="[{ required: true, message: '请输入数据库名' }]">
            <a-input v-model:value="formData.dbName" @change="setDbUrl" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="模式名" name="schemaName" extra="PG 默认 public / MSSQL、SQL Server 默认 dbo">
            <a-input v-model:value="formData.schemaName" @change="setDbUrl" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="数据源地址" name="dbUrl" :rules="[{ required: true, message: '请输入数据源地址' }]">
            <a-input v-model:value="formData.dbUrl" placeholder="按主机/端口/库名自动生成，可手工调整" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用户名" name="dbUsername" :rules="[{ required: true, message: '请输入用户名' }]">
            <a-input v-model:value="formData.dbUsername" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="密码" name="dbPassword" :rules="passwordRules">
            <a-input-password v-model:value="formData.dbPassword" :placeholder="isEdit ? '留空表示不修改' : '请输入密码'"
              style="width: 70%" />&nbsp;&nbsp;
            <a-button type="primary" :loading="testing" @click="onTestConnection">
              <template #icon>
                <ApiOutlined />
              </template>
              测试连接
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="字符集" name="charset">
            <a-select v-model:value="formData.charset" :options="CHARSET_OPTIONS" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="时区" name="timezone">
            <a-select v-model:value="formData.timezone" :options="TIMEZONE_OPTIONS" show-search style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="连接超时(秒)" name="connectTimeoutSec">
            <a-input-number v-model:value="formData.connectTimeoutSec" style="width: 100%" :min="1" :max="300" />
          </a-form-item>
        </a-col>
        <!-- <a-col :span="8">
          <a-form-item label="状态" name="status">
            <a-switch :checked="formData.status !== '0'" checked-children="有效" un-checked-children="无效"
              @change="onStatusChange" />
          </a-form-item>
        </a-col> -->
      </a-row>
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="备注" name="remark">
            <a-textarea v-model:value="formData.remark" :rows="3" placeholder="输入备注" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-drawer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { ApiOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { defHttp } from '/@/utils/http/axios'
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'

enum api {
  add = '/api/zrzy-system/sys/datasource/add',
  update = '/api/zrzy-system/sys/datasource/update',
  test = '/api/zrzy-system/sys/datasource/testConnection',
  queryById = '/api/zrzy-system/sys/datasource/queryById'
}

/** 数据源类型驱动模板：切换类型时同步驱动/端口/模式名并拼装连接地址 */
const DRIVER_TEMPLATES: any[] = [
  {
    match: 'mysql',
    dbDriver: 'com.mysql.cj.jdbc.Driver',
    port: 3306,
    schemaName: '',
    buildUrl: (host, port, dbName) =>
      `jdbc:mysql://${host}:${port}/${dbName}?characterEncoding=UTF-8&useUnicode=true&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true`
  },
  {
    match: '达梦',
    dbDriver: 'dm.jdbc.driver.DmDriver',
    port: 5236,
    schemaName: '',
    buildUrl: (host, port, dbName, schemaName) =>
      `jdbc:dm://${host}:${port}${schemaName ? `?schema=${schemaName}` : ''};databaseName=${dbName}`
  },
  {
    match: 'sqlserver',
    dbDriver: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
    port: 1433,
    schemaName: '',
    buildUrl: (host, port, dbName) =>
      `jdbc:sqlserver://${host}:${port};databaseName=${dbName};encrypt=true;trustServerCertificate=true`
  },
  {
    match: 'oracle',
    dbDriver: 'oracle.jdbc.OracleDriver',
    port: 1521,
    schemaName: '',
    buildUrl: (host, port, dbName) => `jdbc:oracle:thin:@${host}:${port}:${dbName}`
  },
  {
    match: 'postgre',
    dbDriver: 'org.postgresql.Driver',
    port: 5432,
    schemaName: 'public',
    buildUrl: (host, port, dbName, schemaName) =>
      `jdbc:postgresql://${host}:${port}/${dbName}${schemaName ? `?currentSchema=${schemaName}` : ''}`
  }
]

const CHARSET_OPTIONS = ['UTF-8', 'GBK', 'GB18030'].map((item) => ({
  label: item,
  value: item
}))

const TIMEZONE_OPTIONS = ['Asia/Shanghai', 'UTC', 'Asia/Tokyo', 'America/New_York', 'Europe/London'].map(
  (item) => ({ label: item, value: item })
)

interface Props {
  open?: boolean
  title?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '数据源',
  id: ''
})

const emit = defineEmits<{ ok: [payload: { isAdd: boolean }] }>()

const isEdit = computed(() => props.id !== '')
const passwordRules = computed(() => (isEdit.value ? [] : [{ required: true, message: '请输入密码' }]))
const visible = ref(props.open)
const formRef = ref<FormInstance>()
const saving = ref(false)
const testing = ref(false)
const formData = ref<any>(createDefaultForm())

onMounted(() => {
  if (isEdit.value) {
    loadFormData()
  }
})

function createDefaultForm(): any {
  return {
    code: '',
    name: '',
    dbType: '',
    dbDriver: '',
    hostName: '',
    port: '',
    dbName: '',
    schemaName: '',
    dbUrl: '',
    dbUsername: '',
    dbPassword: '',
    status: '1',
    charset: 'UTF-8',
    timezone: 'Asia/Shanghai',
    connectTimeoutSec: 30,
    remark: ''
  }
}

/** 编辑态回填（密码不回显，留空表示不修改） */
async function loadFormData() {
  try {
    const res = await defHttp.get<any>(
      { url: api.queryById, params: { id: props.id } },
      { withToken: true }
    )
    if (res.success && res.result) {
      formData.value = { ...createDefaultForm(), ...res.result, dbPassword: '' }
    } else {
      message.error(res.message || '加载数据源失败')
    }
  } catch (err) {
    console.info(err)
  }
}

/** 切换类型：同步驱动/端口/模式名并重拼连接地址 */
function onTypeChange(value: string) {
  const items = getDictItemsByCode('database') as any[]
  const label = items.find((item) => item.value === value)?.label ?? ''
  formData.value.dbTypeText = label
  const template = findDriverTemplate(label)
  if (template) {
    formData.value.dbDriver = template.dbDriver
    formData.value.port = template.port
    formData.value.schemaName = template.schemaName
  }
  setDbUrl()
}

/** 按主机/端口/库名/模式拼装连接地址 */
function setDbUrl() {
  const template = findDriverTemplate(formData.value.dbTypeText)
  if (!template) return
  formData.value.dbUrl = template.buildUrl(
    formData.value.hostName || '',
    formData.value.port || template.port,
    formData.value.dbName || '',
    formData.value.schemaName || ''
  )
}

/** 按类型文本查找驱动模板（大小写不敏感、模糊匹配） */
function findDriverTemplate(dbTypeText?: string): any | undefined {
  if (!dbTypeText) return undefined
  const text = dbTypeText.toLowerCase()
  return DRIVER_TEMPLATES.find((item) => text.includes(item.match))
}

/** 保存 */
async function onOk() {
  try {
    await formRef.value?.validate()
  } catch (err) {
    console.info(err)
    return
  }
  saving.value = true
  try {
    const data: any = {
      ...formData.value,
      dbPassword: formData.value.dbPassword || undefined
    }
    const res = await defHttp.post<any>(
      { url: isEdit.value ? api.update : api.add, data },
      { withToken: true }
    )
    if (res.success) {
      message.success(isEdit.value ? '编辑成功' : '新增成功')
      emit('ok', { isAdd: !isEdit.value })
    } else {
      message.error(res.message || '保存失败')
    }
  } catch (err) {
    console.info(err)
  } finally {
    saving.value = false
  }
}

/** 测试连接（编辑态密码留空时后端用已保存密码） */
async function onTestConnection() {
  try {
    await formRef.value?.validate()
  } catch (err) {
    console.info(err)
    return
  }
  testing.value = true
  try {
    const res = await defHttp.post(
      {
        url: api.test,
        data: {
          ...formData.value,
          dbPassword: formData.value.dbPassword || undefined
        }
      },
      { withToken: true, withTimeout: false }
    )
    if (res.success) {
      if (res.result?.connected) {
        message.success(`${res.result.message}：${res.result.version}（${res.result.latencyMs}ms）`)
      } else {
        message.error(res.result?.message || '连接失败')
      }
    } else {
      message.error(res.message || '测试失败')
    }
  } catch (err) {
    console.info(err)
  } finally {
    testing.value = false
  }
}

/** 取消/关闭 */
function onClose() {
  emit('ok', { isAdd: false })
}
</script>
