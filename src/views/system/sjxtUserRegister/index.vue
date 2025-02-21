<template>
  <div class="xtTitle">
    <!-- <svg-icon name="yjxt"  width="35px" height="35px" ></svg-icon> -->
    <span style="padding-top: 2px; padding-left: 10px;">不动产外网收件系统用户注册</span>
  </div>
  <div class="userRegister">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 10 }"
      :rules="formRules"
    >
      <a-form-item
        label="注册用户类型"
        ref="userType"
        name="userType"
      >
        <a-select v-model:value="formState.userType" :options="getDictItemsByCode('wwsjzcyhlx')" @change="onUserTypeChange"/>
      </a-form-item>
      <a-form-item
        label="用户名"
        ref="userName"
        name="userName"
      >
        <a-input v-model:value="formState.userName" />
      </a-form-item>
      <a-form-item
        label="真实姓名"
        ref="realName"
        name="realName"
        :rules="[{ required: formState.userType == '1', message: '请输入真实姓名', trigger: 'change' }]"
        v-if="formState.userType == '1'"
      >
        <a-input v-model:value="formState.realName" />
      </a-form-item>
      <a-form-item
        label="密码"
        ref="password"
        name="password"
        :help="helpinfo"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <a-form-item
        label="确认密码"
        ref="confirmPassword"
        name="confirmPassword"
      >
        <a-input-password v-model:value="formState.confirmPassword" />
      </a-form-item>
      <a-form-item
        label="企业名称"
        ref="bussinessName"
        name="bussinessName"
        v-if="formState.userType !== '1'"
      >
        <a-input v-model:value="formState.bussinessName" />
      </a-form-item>
      <a-form-item
        label="企业性质"
        ref="bussinessType"
        name="bussinessType"
      >
        <a-select v-model:value="formState.bussinessType" :options="getDictItemsByCode('qyxz')"/>
      </a-form-item>
      <a-form-item
        label="证件类型"
        ref="credentType"
        name="credentType"
      >
        <a-select v-model:value="formState.credentType" :options="getDictItemsByCode('zjzl')"/>
      </a-form-item>
      <a-form-item
        label="证件号码"
        ref="credentCode"
        name="credentCode"
      >
        <a-input v-model:value="formState.credentCode" />
      </a-form-item>
      <a-form-item
        label="联系人"
        ref="contact"
        name="contact"
        v-if="formState.userType !== '1'"
      >
        <a-input v-model:value="formState.contact" />
      </a-form-item>
      <a-form-item
        label="电话号码"
        ref="phoneNumber"
        name="phoneNumber"
      >
        <a-input v-model:value="formState.phoneNumber" />
      </a-form-item>
      <a-form-item
        label="上传证明文件"
        :rules="[{ required: true, message: '请上传证明文件'}]"
      >
        <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" multiple >
          <a-button>
            <upload-outlined></upload-outlined>
            选择文件
          </a-button>
          <template #itemRender="{ file }">
            <a-space>
              <span>{{ file.name }}</span>
              <a href="javascript:;" @click="removeFile(file)">移除</a>
            </a-space>
          </template>
        </a-upload>
        </a-form-item>
    </a-form>
    <a-space style="display: flex; align-items: center; justify-content: center; width: 100%;">
      <a-button type="primary" @click="onSubmit()"> 注册 </a-button>
      <a-button type="default" @click="onReset()"> 重置 </a-button>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, h, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { encryptionAES } from '/@/utils/cipher';
import { useUserStoreWithOut } from "/@/store/modules/user";
import { Modal } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { getDictItemsByCode } from '/@/utils/form/commonUtils';

const userStore = useUserStoreWithOut();

const formRef = ref()

let formState = reactive({
  userType: '',
  realName: '',
  userName: '',
  password: '',
  confirmPassword: '',
  bussinessName: '',
  bussinessType: '',
  credentType: '',
  credentCode: '',
  contact: '',
  phoneNumber: '',
});

let helpinfo = ref('')
let psw_regex = ref('')
let userType = ref(2)

let fileList: any = ref([])

onMounted(() => {
  if(userStore?.validateRuleList?.length) {
    let pwdRule = userStore?.validateRuleList.filter(ele => ele.ruleCode == 'password')
    helpinfo.value = pwdRule[0]?.message
    psw_regex.value = pwdRule[0]?.content
  }
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formState.password) {
    callback('两次输入的密码不一致');
  } else {
    callback();
  }
};

const validateNewPassword = (rule, value, callback) => {
  if(psw_regex.value && !!(eval(psw_regex.value) instanceof RegExp) && !eval(psw_regex.value).test(value)) {
    callback(helpinfo)
  } else {
    callback()
  }
}

const formRules: any = {
  userType: [
    { required: true, message: '请输入注册用户类型' },
  ],
  userName: [
    { required: true, message: '请输入用户名' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { validator: validateNewPassword, trigger: 'change' },
  ],
  bussinessName: [
    { required: userType.value == 2, message: '请输入企业名称' },
  ],
  bussinessType: [
    { required: true, message: '请选择企业性质' },
  ],
  credentType: [
    { required: true, message: '请选择证件类型' },
  ],
  credentCode: [
    { required: true, message: '请输入证件号码' },
  ],
  contact: [
    { required: userType.value == 2, message: '请输入联系人' },
  ],
  phoneNumber: [
    { required: true, message: '请输入电话号码' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'change' },
    { validator: validateConfirmPassword, trigger: 'change' },
  ]
}

const urlList = {
  update: '/api/zrzy-system/sys/v1/user/updatePassword'
}


const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      // 新增
      defHttp.post(
        {
          url: urlList.update,
          params: {
            newRePassword: encryptionAES(formState.confirmPassword)
          }
        },
        { withToken: true }
      ).then((res: any) => {
        if(res?.success) {

          let secondsToGo = 2;
          const modal = Modal.success({
            title: `密码修改成功，${secondsToGo}秒后自动跳转登录！`,
          });
          const interval = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
              title: `密码修改成功，${secondsToGo}秒后自动跳转登录！`,
            });
          }, 1000);

          setTimeout(() => {
            clearInterval(interval);
            userStore.setToken(undefined)
            userStore.logout(true)
            modal.destroy();
          }, secondsToGo * 1000);
          
        } else {
          message.warning(res?.message || '密码修改失败！')
        }
      })
    }).catch((error:any) => {
      console.log('error', error);
    });
}

function onReset() {
  Object.keys(formState).forEach(element => {
    formState[element] = ''
  });
  userType.value = 2
}

function beforeUpload() {
  return false
}

// 从上传列表中移除
function removeFile(file: any) {
  fileList.value = fileList.value.filter((ele:any) => ele.uid != file.uid)
}

function onUserTypeChange(value) {
  userType.value = Number(value)
}

</script>

<style scoped lang="less">
.xtTitle {
  // background-color: rgb(66, 253, 350);
  // width: 700px;
  // color: #fff;
  padding: 20px 0 20px 0px;
  margin: 0 20px;
  font-size: 28px;
  // text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #efefef;
}
.userRegister {
  padding: 20px;
}
</style>