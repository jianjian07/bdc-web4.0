<template>
    <a-drawer :title="title" width="calc(50vw)" :open="open" :body-style="{ paddingBottom: '80px' }" @close="onClose"
        :footer-style="{ textAlign: 'right' }">
        <a-form :model="jobInfo" ref="ruleForm" :label-col="{ style: { width: '150px' } }" layout="horizontal"
            autocomplete="off">
            <a-divider orientation="left">基础配置</a-divider>
            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="执行器" name="jobGroup" :rules="[{ required: true, message: '执行器' }]">
                        <a-input v-model:value="jobInfo.jobGroup" prefix="" suffix="" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="任务描述" name="jobDesc" :rules="[{ required: true, message: '任务描述' }]">
                        <a-input v-model:value="jobInfo.jobDesc" prefix="" suffix="" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="负责人" name="author" :rules="[{ required: true, message: '负责人' }]">
                        <a-input v-model:value="jobInfo.author" prefix="" suffix="" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="报警邮件" name="alarmEmail">
                        <a-input v-model:value="jobInfo.alarmEmail" prefix="" suffix=""
                            placeholder="请输入报警邮件，多个邮件地址则用逗号分隔" />
                    </a-form-item>
                </a-col>
                <a-divider orientation="left">调度配置</a-divider>
                <a-col :span="12">
                    <a-form-item label="调度类型" name="scheduleType" :rules="[{ required: true }]">
                        <a-select v-model:value="jobInfo.scheduleType" @change="onChange">
                            <a-select-option value="NONE">无</a-select-option>
                            <a-select-option value="CRON">CRON</a-select-option>
                            <a-select-option value="FIX_RATE">固定速度</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item v-if="jobInfo.scheduleType == 'CRON'" label="Cron" name="scheduleConf"
                        :rules="[{ required: true, message: 'Cron表达式' }]">
                        <a-input v-model:value="jobInfo.scheduleConf" prefix="" suffix="" @click="openDialog" allow-clear/>
                    </a-form-item>
                    <a-modal v-model:open="showCron" :width="500" centered :destroyOnClose="true" title="Cron表达式" @ok="handleOk">
                      <vue3-cron v-model="expression" locale="cn"/>
                    </a-modal>
                    <a-form-item v-if="jobInfo.scheduleType == 'FIX_RATE'" label="固定速度" name="title"
                        :rules="[{ required: true, message: '固定速度' }]">
                        <a-input v-model:value="jobInfo.title" prefix="" suffix="" />
                    </a-form-item>
                </a-col>
                <a-divider orientation="left">任务配置</a-divider>
                <a-col :span="12">
                    <a-form-item label="运行模式" name="glueType" :rules="[{ required: true, message: '运行模式' }]">
                        <a-select v-model:value="jobInfo.glueType">
                            <a-select-option value="BEAN">BEAN</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="JobHandler" name="executorHandler"
                        :rules="[{ required: true, message: '请输入JobHandler' }]">
                        <a-input v-model:value="jobInfo.executorHandler" prefix="" suffix=""
                            placeholder="请输入JobHandler" />
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="任务参数" name="code">
                        <a-textarea v-model:value="jobInfo.code" />
                    </a-form-item>
                </a-col>
                <a-divider orientation="left">高级配置</a-divider>
                <a-col :span="12">
                    <a-form-item label="路由策略" name="executorRouteStrategy" :rules="[{ required: true }]">
                        <a-select v-model:value="jobInfo.executorRouteStrategy">
                            <a-select-option value="FIRST">第一个</a-select-option>
                            <a-select-option value="LAST">最后一个</a-select-option>
                            <a-select-option value="ROUND">轮询</a-select-option>
                            <a-select-option value="RANDOM">随机</a-select-option>
                            <a-select-option value="CONSISTENT_HASH">一致性HASH</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="子任务ID" name="childJobId">
                        <a-input v-model:value="jobInfo.childJobId" prefix="" suffix=""
                            placeholder="请输入子任务ID,存在多个用逗号分隔" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="调度过期策略" name="misfireStrategy" :rules="[{ required: true, message: '报表编号' }]">
                        <a-select v-model:value="jobInfo.misfireStrategy">
                            <a-select-option value="DO_NOTHING">忽略</a-select-option>
                            <a-select-option value="FIRE_ONCE_NOW">立即执行一次</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="阻塞处理策略" name="executorBlockStrategy"
                        :rules="[{ required: true, message: '阻塞处理策略' }]">
                        <a-select v-model:value="jobInfo.executorBlockStrategy">
                            <a-select-option value="SERIAL_EXECUTION">单机串行</a-select-option>
                            <a-select-option value="DISCARD_LATER">丢弃后续调度</a-select-option>
                            <a-select-option value="COVER_EARLY">覆盖之前调度</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="任务超时时间" name="executorTimeout"
                        :rules="[{ required: true, message: '任务超时时间，单位秒，大于0时生效' }]">
                        <a-input-number defaultValue="0" v-model:value="jobInfo.executorTimeout" prefix=""
                            style="width: 100%;" placeholder="任务超时时间，单位秒，大于0时生效" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="失败重试次数" name="executorFailRetryCount"
                        :rules="[{ required: true, message: '失败重试次数，大于0时生效' }]">
                        <a-input-number defaultValue="0" v-model:value="jobInfo.executorFailRetryCount" prefix=""
                            style="width: 100%;" placeholder="失败重试次数，大于0时生效" />
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
        <template #extra>
            <a-space>
                <a-button @click="onClose">取消</a-button>
                <a-button type="primary" @click="onOk">保存</a-button>
            </a-space>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import Vue3Cron from 'vue3-cron-antd';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "任务属性"
    },
    data: {
        type: Object
    }
})
let jobInfo = ref<any>()
let ruleForm = ref<any>()
// 是否显示cron
let showCron = ref<boolean>(false)
// cron表达式
let expression = ref<any>('')

jobInfo.value = props.data
function onClose() {
    emit('ok', { refresh: false })
}
const emit = defineEmits(['ok'])
enum Api {
    addUrl = '/api/zrzy-api/jobinfo/add',
    updateUrl = '/api/zrzy-api/jobinfo/update'
}
function onOk() {
    ruleForm.value.validate().then(() => {
        let url = Api.addUrl
        if (jobInfo.value.id > 0) {
            url = Api.updateUrl
        }
        defHttp.post({ url: url, params: {}, data: jobInfo.value }, { withToken: true }).then((res) => {
            if (res.code === 200) {
                message.success('保存成功')
                emit('ok', { refresh: true })
            } else {
                message.error(res.msg)
            }
        }).catch(err => {
            message.error(err.message)
        }).finally(() => {

        })
    })
}
function onChange(value: any) {
    jobInfo.value.scheduleType = value
}

function openDialog () {
  showCron.value = true;
  if (jobInfo.value.scheduleConf != ""){
    expression.value = jobInfo.value.scheduleConf
  }
}

const handleOk = () => {
  showCron.value = false
  jobInfo.value.scheduleConf= expression.value
  ruleForm.value?.validateFields('scheduleConf')
}
</script>
