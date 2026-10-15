<template>
  <a-drawer v-model:open="props.open" title="异常日志详情" @close="onClose" :width="720">
    <div class="form-item-form">
      <a-form :model="props.data" :label-col="{ style: { width: '60px' } }">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="接口地址" name="requestUri">
              <a-input v-model:value="props.data.requestUri" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="异常id" name="traceId">
              <a-input v-model:value="props.data.traceId" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item label="请求方式" name="requestMethod">
              <a-tag color="purple" style="font-size: 13px">{{ props.data.requestMethod }}</a-tag>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="异常类型" name="exceptionType">
              <a-tag color="red" style="font-size: 13px">{{ props.data.exceptionType }}</a-tag>
            </a-form-item>
          </a-col>
          <!--          <a-col :span="8">-->
          <!--            <a-form-item label="应用程序" name="applicationName">-->
          <!--              <a-tag color="cyan" style="font-size: 13px">{{ props.data.applicationName }}</a-tag>-->
          <!--            </a-form-item>-->
          <!--          </a-col>-->
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="请求参数" name="requestParams">
              <a-textarea v-model:value="props.data.requestParams" :autoSize="{ minRows: 1, maxRows: 6 }"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item label="发起人" name="createBy">
              <a-input v-model:value="props.data.createBy" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="IP地址" name="ipAddress">
              <a-input v-model:value="props.data.ipAddress" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="异常时间" name="exceptionTime">
              <a-input v-model:value="props.data.exceptionTime" />
            </a-form-item>
          </a-col>
        </a-row>
<!--        <a-row :gutter="24">-->
<!--          <a-col :span="24">-->
<!--            <a-form-item label="异常信息" name="exceptionMessage">-->
<!--              <a-textarea v-model:value="props.data.exceptionMessage" :rows="6" />-->
<!--            </a-form-item>-->
<!--          </a-col>-->
<!--        </a-row>-->
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="堆栈信息" name="stackTrace">
              <a-textarea v-model:value="props.data.stackTrace" :rows="24" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </a-drawer>
</template>
<script setup lang="ts">

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: { requestMethod: '', applicationName: '', exceptionType: '' }
  }
})
const emit = defineEmits(["ok"])

function onClose() {
  // 执行取消
  emit("ok")
}
</script>

<style scoped lang="less"></style>