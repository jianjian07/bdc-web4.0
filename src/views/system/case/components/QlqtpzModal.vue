<template>
  <div class="QlqtpzModal">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{span: 6}"
      :wrapper-col="{span: 16}"
    >
      <a-form-item v-show="false" ref="lcid" label="流程类型" name="lcid">
        <a-input v-model:value="formState.lcid" />
      </a-form-item>
      <a-form-item ref="djlx" label="登记类型" name="djlx">
        <a-select v-model:value="formState.djlx" :options="djlxOption"  placeholder="请选择登记类型">
        </a-select>
      </a-form-item>
      <a-form-item ref="qllx" label="权利类型" name="qllx">
        <a-select v-model:value="formState.qllx" :options="getDictItemsByCode('qllx')" placeholder="请选择权利类型" />
      </a-form-item>
      <a-form-item ref="sfybz" label="是否一本证" name="sfybz">
        <a-select v-model:value="formState.sfybz" :options="getDictItemsByCode('sfybz')" placeholder="请选择是否一本证" />
      </a-form-item>
      <a-form-item ref="sfpl" label="是否批量" name="sfpl">
        <a-select v-model:value="formState.sfpl" :options="getDictItemsByCode('ispl')" placeholder="请选择是否批量" />
      </a-form-item>
      <a-form-item ref="jzlx" label="介质类型" name="jzlx">
        <a-select v-model:value="formState.jzlx" :options="getDictItemsByCode('jzlx')" placeholder="请选择介质类型" />
      </a-form-item>
      <a-form-item v-show="false" ref="sjbm" label="编码" name="sjbm">
        <a-input v-model:value="formState.sjbm" placeholder="请输入编码" />
      </a-form-item>
      <a-form-item ref="zt" label="状态" name="zt">
        <a-select v-model:value="formState.zt" :options="getDictItemsByCode('sfys')" placeholder="请选择状态" />
      </a-form-item>
      <a-form-item ref="sjnrFormat" label="设计内容格式" name="sjnrFormat">
        <a-select v-model:value="formState.sjnrFormat" :options="getDictItemsByCode('sjnrgs')" placeholder="请选择设计内容格式" />
      </a-form-item>
      <a-form-item ref="sjnr" label="设计内容" name="sjnr">
        <CodeEditor :fullScreen="true" :language="formState.sjnrFormat" @codeValue="getCodeValue" :value="formState.sjnr"></CodeEditor>
      </a-form-item>

    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import CodeEditor from '/@/components/common/CodeEditor.vue'


const formRef = ref();
let formState: any = ref({
  id: '',
  lcid: '',
  djlx: '',
  qllx: '',
  sfybz: '',
  sfpl: '',
  jzlx: '',
  sjbm: '',
  zt: '',
  sjnr: '',
  sjnrFormat: ''
})
let djlxOption: any = reactive([])

const rules: any = {
  lcid: { required: true, message: '请选择流程类型', trigger: 'blur'}
}

const urlList = {
  add: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/add', // 添加
  edit: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/edit', // 编辑
  processlist: '/api/zrzy-bdc/act/process/extActProcess/list'
}

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

watch(() => props.formData, (val: any) => {
  formState.value.djlx = ''
  if(val.djlx && val.djlx.length) {
    djlxOption = val.djlx.map(element => {
      return {
        label: element,
        value: element
      }
    });
    formState.value.djlx = djlxOption[0].value
  }
  formState.value.sjnrFormat = getDictItemsByCode('sjnrgs')[0].dictCode
  if(val.type !== 'new') {
    Object.keys(formState.value).forEach(key => {
      formState.value[key] = val.itemData[key]
      if(key == 'sjnrFormat' && !formState.value.sjnrFormat) {
        formState.value.sjnrFormat = 'json'
      }
    })
  } else {
    formState.value.lcid = val.lcid
  }
}, {
  immediate: true,
  deep: true
})

function getCodeValue(val) {
  formState.value.sjnr = val
}

// 保存
function onSubmit() {
  return new Promise((resolve, reject) => {
    formRef.value
    .validate()
    .then(() => {
      let url = props.formData.type == 'edit' ? urlList.edit : urlList.add
      if(props.formData.type == 'edit') {
        defHttp.put(
          {
            url: url,
            data: formState.value
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            message.success('修改成功！')
            resolve(true)
          } else {
            message.warning(res?.message || '修改失败！')
            reject()
          }
        })
      } else if(props.formData.type == 'new'){
        defHttp.post(
          {
            url: url,
            data: formState.value
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            message.success('添加成功！')
            resolve(true)
          } else {
            message.warning(res?.message || '添加失败')
            reject()
          }
        })
      } else {
        resolve(true)
      }
    })
    .catch((error: any) => {
      console.log('error', error);
    });
  })
}

defineExpose({
  onSubmit
})

</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.QlqtpzModal {
  padding-top: 20px;
}
</style>
