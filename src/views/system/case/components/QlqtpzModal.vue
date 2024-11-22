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
        <a-select v-model:value="formState.djlx" :options="djlx.value"  placeholder="请选择登记类型" />
      </a-form-item>
      <a-form-item ref="qllx" label="权利类型" name="qllx">
        <a-select v-model:value="formState.qllx" :options="getDictItemsByCode('qllx')" placeholder="请选择权利类型" />
      </a-form-item>
      <a-form-item ref="sfybz" label="是否一本证" name="sfybz">
        <a-select v-model:value="formState.sfybz" :options="getDictItemsByCode('yn')" placeholder="请选择是否一本证" />
      </a-form-item>
      <a-form-item ref="sfpl" label="是否批量" name="sfpl">
        <a-select v-model:value="formState.sfpl" :options="getDictItemsByCode('ispl')" placeholder="请选择是否批量" />
      </a-form-item>
      <a-form-item ref="jzlx" label="介质类型" name="jzlx">
        <a-select v-model:value="formState.jzlx" :options="getDictItemsByCode('jzlx')" placeholder="请选择介质类型" />
      </a-form-item>
      <a-form-item ref="sjbm" label="编码" name="sjbm">
        <a-input @mousedown="onmousedown" v-model:value="formState.sjbm" placeholder="请输入编码" />
      </a-form-item>
      <a-form-item ref="zt" label="状态" name="zt">
        <a-select v-model:value="formState.zt" :options="getDictItemsByCode('sfys')" placeholder="请选择状态" />
      </a-form-item>
      <a-form-item ref="sjnr" label="设计内容" name="sjnr">
        <CodeEditor :fullScreen="true" language="JSON" @codeValue="getCodeValue" :value="formState.sjnr"></CodeEditor>
      </a-form-item>

    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
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
  sjnr: ''
})
let djlx: any = ref([])

const rules: any = {
  lcid: { requires: true, message: '请选择流程类型', trigger: 'blur'}
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
  if(val.type !== 'new') {
    Object.keys(formState.value).forEach(key => {
      formState.value[key] = val.itemData[key]
    })
  } else {
    formState.value.lcid = val.lcid
  }
  formState.value.djlx = ''
  if(val.djlx && val.djlx.length) {
    djlx.value = val.djlx.map(element => {
      return {
        label: element,
        value: element
      }
    });
    formState.value.djlx = djlx.value[0].value
  }
}, {
  immediate: true,
  deep: true
})

function getCodeValue(val) {
  formState.value.sjnr = val
}

function onmousedown() {
  if(!formState.value.sjbm) {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/getConfigQlqtBySlbh',
      params: { slbh: 'FDZYDJ20160714000003' },
      data: {}
    },{ withToken: true }
    ).then((res: any) => {
      if(res && res.success) {
        formState.value.sjbm = res.result
        manageQLQT(res.result)
      }
    }).catch((error: any) => {
      console.log(error)
    })
  }
}

// 用于弹窗的权利其他获取，根据业务号传参
function getQlqtqkByMap(e) {
  if (e.target.value.trim() !== '') {
    return
  }
  let slbh = 'FDZYDJ20160714000003' //受理编号
  const quickParam = { ywh: '', slbh: slbh }
  const xmlParam = { ywh: '', slbh: slbh }
  const param = { quickParam: quickParam, xmlParam: xmlParam }
  getQlqtqkByParam(e, param)
}

// 用于传参的权利其他
function getQlqtqkByParam(e, param) {
  if (e.target.value.trim() !== '') {
    return
  }
  let url = '/api/bdcdj/bdcQlqtpz/getConfigQlqtByMap'
  defHttp.post({
    url: url,
    data: param
  },{
    withToken: true
  }).then((res: any) => {
    if(res && res.success) {
      let qlqtConfig = res.result
      manageQLQT(qlqtConfig)
    }
  }).catch(err => {
    console.log(err)
  })
}

// 整理返回的权利其他内容
function manageQLQT(qlqtConfig) {
  let reg = /\\([^\u4e00-\u9fa5]+)\\/g
  let ret = {}
  let qlqtmatch = qlqtConfig.match(reg)
  if (qlqtmatch) {
    // console.log(qlqtmatch)
    qlqtmatch.forEach((value, index, array) => {
      let objkey = value.replace(/\\/g, '')
      let dom:any = document.getElementById(objkey)
      if (dom === null || dom.nodeName === null) {
        ret[objkey] = ''
      } else {
        if (dom.nodeName === 'DIV') {
          let select = dom.getElementsByClassName('ant-select-selection-selected-value')[0]
          ret[objkey] = select.innerText
        } else if (dom.classList.contains('ant-calendar-picker')) {
          ret[objkey] = dom.getElementsByTagName('input')[0].value
        } else {
          ret[objkey] = dom.value
        }
      }
      qlqtConfig = qlqtConfig.replace(value, ret[objkey])
    })
  }
  // 赋值
  // e.target.value = qlqtConfig
  // e.target.dispatchEvent(new Event('input'))
}

// 保存
function onSubmit() {
  return new Promise((resolve, reject) => {
    formRef.value
    .validate()
    .then(() => {
      console.log('values', formState, toRaw(formState));
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