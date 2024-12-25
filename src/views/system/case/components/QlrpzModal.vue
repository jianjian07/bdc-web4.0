<template>
  <div class="qlrpz-modal">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      :disabled="formData.type == 'view'"
    >
      <a-form-item ref="djlx" label="登记类型" name="djlx">
        <a-input v-model:value="formState.djlx" readOnly></a-input>
      </a-form-item>
      <a-form-item ref="qllx" label="权利类型" name="qllx">
        <a-select v-model:value="formState.qllx" :options="getDictItemsByCode('qllx')" placeholder="请选择权利类型" />
      </a-form-item>
      <a-form-item ref="qlrlxmc" label="权利人名称" name="qlrlxmc">
        <a-select v-model:value="formState.qlrlb" :options="getDictItemsByCode('qlrlb')" placeholder="请选择权利人名称" @change="onChange"></a-select>
      </a-form-item>
      <a-form-item ref="qlrxsmc" label="权利人显示名称" name="qlrxsmc">
        <a-input v-model:value="formState.qlrxsmc" placeholder="请输入权利人显示名称"></a-input>
      </a-form-item>
      <a-form-item ref="tbxx" label="同步信息" name="tbxx">
        <a-input v-model:value="formState.tbxx" placeholder="请输入同步信息"></a-input>
      </a-form-item>
      <a-form-item ref="btnIdArr" label="按钮" name="btnIdArr">
         <a-checkbox-group v-model:value="formState.btnIdArr" style="width: 100%">
           <a-checkbox value="1">新增</a-checkbox>
           <a-checkbox value="2">编辑</a-checkbox>
           <a-checkbox value="3">查看</a-checkbox>
           <a-checkbox value="4">删除</a-checkbox>
           <a-checkbox value="5">家庭成员</a-checkbox>
         </a-checkbox-group>
      </a-form-item>
      <a-form-item ref="sxh" label="顺序号" name="sxh">
        <a-input-number v-model:value="formState.sxh" placeholder="请输入顺序号" :disabled="formData.type == 'view'" style="width: 100%"></a-input-number>
      </a-form-item>
      <a-form-item ref="orderNum" label="排序" name="orderNum">
        <a-input-number v-model:value="formState.orderNum" placeholder="请输入排序" :disabled="formData.type == 'view'" style="width: 100%"></a-input-number>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
import { ref, toRaw, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const formRef = ref();
let formState: any = ref({
  id: '',
  lcid: '',
  djlx: '',
  qllx: '',
  qlrlb: '',
  qlrlxmc: '',
  qlrxsmc: '',
  tbxx: '',
  sxh: '',
  btnId: '',
  orderNum: ''
})

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

enum api {
  add = '/api/zrzy-bdc/flow/qlr/add',
  edit = '/api/zrzy-bdc/flow/qlr/update'
}

watch(() => props.formData, (val: any) => {
  formState.value.djlx = val.djlx.join(',')
  if(val.type !== 'new') {
    Object.keys(formState.value).forEach(key => {
      formState.value[key] = val.itemData[key]
      if (key == 'btnId' && formState.value[key]) {
        formState.value['btnIdArr'] = formState.value['btnId'].includes(',') ? formState.value['btnId'].split(',') : [formState.value['btnId']]
      }
    })
  } else {
    formState.value.lcid = val.lcid
  }
}, {
  immediate: true,
  deep: true
})


// 保存
function onSubmit() {
  return new Promise((resolve, reject) => {
    formRef.value
    .validate()
    .then(() => {
      console.log('values', formState, toRaw(formState));
      formState.value['btnId'] = formState.value['btnIdArr'] ? formState.value['btnIdArr'].join(',') : ''
      formState.value.qlrlxmc = getDictItemsByCode('qlrlb').filter((_v: any) => _v.dictCode == formState.value.qlrlb)[0]?.dictName || ''
      let copyState = JSON.parse(JSON.stringify(formState.value))
      delete copyState.btnIdArr
      console.log('formState.value',formState.value)
      let url = props.formData.type == 'edit' ? api.edit : api.add
      if(props.formData.type == 'edit') {
        defHttp.post(
          {
            url: url,
            data: copyState
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
        delete copyState.id
        defHttp.post(
          {
            url: url,
            data: copyState
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

function onChange(value) {
  let label = getDictItemsByCode('qlrlb').filter((_v: any) => _v.dictCode == value)[0]?.dictName || ''
  formState.value.qlrlxmc = label
}

defineExpose({
  onSubmit
})
</script>

<style lang="less">
.qlrpz-modal {
  .ant-input-number-disabled { 
  
    input {
      color: rgba(0, 0, 0, 0.25)
    }
  }
}


</style>