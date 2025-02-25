<template>
  <div class="QlqtpzModal">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{span: 6}"
      :wrapper-col="{span: 16}"
    >
      <a-form-item v-show="false" ref="processName" label="流程名称" name="processName">
        <a-input v-model:value="formState.processName" disabled/>
      </a-form-item>
      <a-form-item ref="nodeId" label="节点名称" name="nodeId">
        <a-select v-model:value="formState.nodeId" :fieldNames="fieldNames" placeholder="请选择节点" :options="JDOptions" @change="onChange"></a-select>
      </a-form-item>
      <a-form-item ref="subType" label="权利类型" name="subType">
        <a-select v-model:value="formState.subType" :options="getDictItemsByCode('qllx')" placeholder="请选择权利类型" />
      </a-form-item>
      <a-form-item ref="materialName" label="目录名称" name="materialName">
        <a-input v-model:value="formState.materialName" placeholder="请输入目录名称"></a-input>
      </a-form-item>
      <a-form-item ref="copies" label="份数" name="copies">
        <a-input-number style="width: 100%" v-model:value="formState.copies" placeholder="请输入份数"></a-input-number>
      </a-form-item>
      <a-form-item ref="orderId" label="顺序号" name="orderId">
        <a-input-number style="width: 100%" v-model:value="formState.orderId" placeholder="请输入顺序号"></a-input-number>
      </a-form-item>
      <a-form-item ref="must" label="必须" name="must">
        <a-radio-group v-model:value="formState.must">
          <a-radio value="1">
            是
          </a-radio>
          <a-radio value="0">
            否
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item ref="original" label="原件" name="original">
        <a-radio-group v-model:value="formState.original">
          <a-radio value="1">
            是
          </a-radio>
          <a-radio value="0">
            否
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item ref="sign" label="签收" name="sign">
        <a-radio-group v-model:value="formState.sign">
          <a-radio value="1">
            是
          </a-radio>
          <a-radio value="0">
            否
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item ref="remark" label="说明" name="remark">
        <a-textarea :rows="2" v-model:value="formState.remark"/>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';


const formRef = ref();
let formState: any = ref({
  id: "",
  nodeId: "",
  nodeName: "",
  processId: "",
  processName: "",
  materialId: "",
  materialName: "",
  copies: '',
  subType: "",
  must: 0,
  original: 0,
  xzcz: -1,
  sign: 0,
  remark: ""
})
let JDOptions: any = ref([])
let fieldNames = { label: 'processNodeName', value: 'processNodeCode', children: 'children' }

const rules: any = {
  nodeId: { required: true, message: '请选择节点名称', trigger: 'blur'},
  materialName: { required: true, message: '请输入目录名称', trigger: 'blur'},
  subType: { required: true, message: '请选择权利类型', trigger: 'blur'}
}

const urlList = {
  add: '/api/zrzy-bdc/casematerialConfig/add', // 添加
  edit: '/api/zrzy-bdc/casematerialConfig/edit', // 编辑
  nodelistUrl: '/api/zrzy-bdc/act/process/extActProcessNode/list' //节点列表
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
    debugger
  } else {
    formState.value.processId = val.lcid
    formState.value.processName = val.baseInfo.lcmc
  }
  getNode()
}, {
  immediate: true,
  deep: true
})

function getNode() {
  defHttp.get({ url: urlList.nodelistUrl, params: { processId: props.formData.lcid } }, { withToken: true }).then((res) => {
    JDOptions.value = res.result;
    formState.value.nodeId = formState.value.nodeId || res.result[0].processNodeCode
    formState.value.nodeName = formState.value.nodeName || res.result[0].processNodeName
  });
}

function onChange(value, option) {
  formState.value.nodeId = value
  formState.value.nodeName = option.label
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
            message.success('编辑成功！')
            resolve(true)
          } else {
            message.warning(res?.message || '编辑失败！')
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