<template>
  <div class="QlqtpzModal">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item ref="yblcbm" label="已发生的登记" name="yblcbm">
        <a-cascader v-model:value="lcKey" :options="options" :fieldNames="fieldNames" placeholder="请选择" @change="onChange"/>
      </a-form-item>
      <a-form-item ref="yblczt" label="登记状态" name="yblczt">
        <a-radio-group v-model:value="formState.yblczt">
          <a-radio :value="0">
            在办
          </a-radio>
          <a-radio :value="1">
            已办
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item ref="xzcz" label="限制办理情况" name="xzcz">
        <a-radio-group v-model:value="formState.xzcz">
          <a-radio :value="-1">
            限制
          </a-radio>
          <a-radio :value="0">
            提示
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';


const formRef = ref();
let formState: any = ref({
  id: "",
  yblcbm: "",
  yblczt: 1,
  yblcmc: "",
  xzcz: -1,
  xzlcmc: "",
  xzlcbm: "",
  bz: "",
  lcid: ""
})
let lcKey: any = ref()
let options: any = ref([])
let fieldNames = { label: 'title', value: 'key', children: 'children' }
let editZt: any = ref('')

const rules: any = {
  yblcbm: { required: true, message: '请选择已发生的登记', trigger: 'blur'}
}

const urlList = {
  add: '/api/zrzy-bdc/bdcdj/ywys/add', // 添加
  edit: '/api/zrzy-bdc/bdcdj/ywys/edit', // 编辑
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
    editZt.value = val.itemData.yblczt
    // 获取已办流程编码名称
    getLcKey(val.itemData.lclx, val.itemData.yblcbm, val.treeData)
  } else {
    //给限制流程编码及名称赋值
    formState.value.xzlcbm = val.xzlcbm
    formState.value.xzlcmc = val.xzlcmc
    formState.value.lcid = val.lcid
  }
  options.value = val.treeData
  
}, {
  immediate: true,
  deep: true
})

function getLcKey(lclx, regType, data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].key == lclx) {
      let children = data[i].children
      for(let j = 0; j < children.length; j++) {
        if(children[j].regType === regType) {
          lcKey.value = [data[i].key, children[j].key]
          break;
        }
      }
    }
  }
}

function onChange(value, selectedOptions) {
  //给已办流程编码及名称赋值
  if (value.length == 2) {
    formState.value.yblcmc = selectedOptions[1].title
    formState.value.yblcbm = selectedOptions[1].regType
    formState.value.lclx = selectedOptions[1].lclx
  }
}

function isObtainTwoData(formdata, data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].lcid == formdata.lcid && data[i].yblcbm == formdata.yblcbm && data[i].yblczt == formdata.yblczt) {
      return true
    }
  }
  return false
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
        // 判断
        if (editZt.value != formState.value.yblczt) {
          let edit = isObtainTwoData(formState.value, props.formData.dataList)
          if (edit) {
            message.warning('已存在当前数据！')
            return resolve(true)
          }
        }
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
        // 判断
        let add = isObtainTwoData(formState.value, props.formData.dataSource)
        if (add) {
          message.warning('已存在当前数据！')
          return resolve(true)
        }
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