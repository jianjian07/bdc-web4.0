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
        ref="zcyhlx"
        name="zcyhlx"
      >
        <a-select v-model:value="formState.zcyhlx" :options="getDictItemsByCode('wwsjzcyhlx')" @change="onUserTypeChange"/>
      </a-form-item>
      <a-form-item
        label="用户名"
        ref="username"
        name="username"
      >
        <a-input v-model:value="formState.username" placeholder="至少6个字符" />
      </a-form-item>
      <a-form-item
        label="真实姓名"
        ref="realName"
        name="realName"
        :rules="[{ required: formState.zcyhlx == '1', message: '请输入真实姓名', trigger: 'change' }]"
        v-if="formState.zcyhlx == '1'"
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
        <a-input-password v-model:value="formState.confirmPassword" placeholder="请再次输入密码"/>
      </a-form-item>
      <a-form-item
        label="企业名称"
        ref="qymc"
        name="qymc"
        v-if="formState.zcyhlx !== '1'"
      >
        <a-input v-model:value="formState.qymc" placeholder="请输入企业名称"/>
      </a-form-item>
      <a-form-item
        label="企业性质"
        ref="qyxz"
        name="qyxz"
        v-if="formState.zcyhlx !== '1'"
      >
        <a-select v-model:value="formState.qyxz" :options="getDictItemsByCode('qyxz')"/>
      </a-form-item>
      <a-form-item
        label="证件类型"
        ref="zjlx"
        name="zjlx"
      >
        <a-select v-model:value="formState.zjlx" :options="getDictItemsByCode('zjzl')"/>
      </a-form-item>
      <a-form-item
        label="证件号码"
        ref="zjhm"
        name="zjhm"
      >
        <a-input v-model:value="formState.zjhm" />
      </a-form-item>
      <a-form-item
        label="联系人"
        ref="frxm"
        name="frxm"
        v-if="formState.zcyhlx !== '1'"
      >
        <a-input v-model:value="formState.frxm" />
      </a-form-item>
      <a-form-item
        label="电话号码"
        ref="phone"
        name="phone"
      >
        <a-input v-model:value="formState.phone" />
      </a-form-item>
      <a-form-item
        label="上传证明文件"
        :rules="[{ required: true, message: '请上传证明文件'}]"
      >
        <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" multiple >
          <a-space>
            <a-button>
              <upload-outlined></upload-outlined>
              选择文件
            </a-button>
            <a-button v-if="reUpload"  type="primary" @click.stop="uploadFile">
              重新上传
            </a-button> 
          </a-space>         
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
import { UploadOutlined } from '@ant-design/icons-vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';

const userStore = useUserStoreWithOut();

const formRef = ref()

let formState = reactive({
  zcyhlx: '',
  realName: '',
  username: '',
  password: '',
  confirmPassword: '',
  qymc: '',
  qyxz: '',
  zjlx: '',
  zjhm: '',
  frxm: '',
  phone: '',
});

let helpinfo = ref('')
let psw_regex = ref('')
let zcyhlx = ref(2)

let fileList: any = ref([])

let reUpload: any = ref(false)
let currentId: any = ref('')

const zjlxMap = {
  '1': 'idCard',
  '2': 'HMTIdCard',
  '3': 'passport',
  '4': 'householdRegister',
  '5': 'officerCertificate',
  '6': 'organizationCode',
  '7': 'businessLicense',
  '8': 'socialCode', 
  '9': 'foreignerIdCard	', 
  '99': 'otherId', 
}

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

const validateUserName = (rule, value, callback) => {
  defHttp.get(
    {
      url: urlList.checkUserName,
      params: { userName: value }
    },
    { withToken: true }
  ) .then((res: any) => {
    if(res?.success) {
      if(res.result) {
        callback('该用户名已注册，请重新输入！')
      } else {
        callback()
      }
    }
  })
}

const validateZJHM = (rule, value, callback) => {
  let info = ''
  let regex = ''
  if(userStore?.validateRuleList?.length) {
    let pwdRule = userStore?.validateRuleList.filter(ele => ele.ruleCode == zjlxMap[formState.zjlx])
    info = pwdRule[0]?.message
    regex = pwdRule[0]?.content
  }

  if(regex && !!(eval(regex) instanceof RegExp) && !eval(regex).test(value)) {
    callback(info)
  } else {
    callback()
  }
}

const formRules: any = {
  zcyhlx: [
    { required: true, message: '请输入注册用户类型' },
  ],
  username: [
    { required: true, message: '用户名至少6个字符', min: 6, trigger: 'change'  },
    { validator: validateUserName, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { validator: validateNewPassword, trigger: 'change' },
  ],
  qymc: [
    { required: zcyhlx.value == 2, message: '请输入企业名称' },
  ],
  qyxz: [
    { required: zcyhlx.value == 2, message: '请选择企业性质' },
  ],
  zjlx: [
    { required: true, message: '请选择证件类型' },
  ],
  zjhm: [
    { required: true, validator: validateZJHM, trigger: 'blur' },
  ],
  frxm: [
    { required: zcyhlx.value == 2, message: '请输入联系人' },
  ],
  phone: [
    { required: true, message: '请输入电话号码' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'change' },
    { validator: validateConfirmPassword, trigger: 'change' },
  ]
}

const urlList = {
  add: '/api/zrzy-system/sys/wwuser/add',
  checkUserName: '/api/zrzy-system/sys/wwuser/checkUserName', // 校验用户名是否重复
  upload: '/api/zrzy-wwsj/wwsj/upfiles/file/uploadZczm'
}


const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      if(fileList.value.length == 0) {
        message.warning('请选择要上传的附件材料')
        return
      }
      // 新增
      defHttp.post(
        {
          url: urlList.add,
          data: {
            ...formState,
            password: encryptionAES(formState.password),
            confirmPassword: encryptionAES(formState.confirmPassword)
          }
        },
        { withToken: true }
      ).then((res: any) => {
        if(res?.success) {
          // TODO 上传证明材料
          currentId.value = res.result
          uploadFile()
        } else {
          message.warning(res?.message || '用户注册失败！')
        }
      })
    }).catch((error:any) => {
      console.log('error', error);
    });
}

function uploadFile() {
  // TODO 上传证明材料
  const formData = new FormData()
    const params = {
      userId: currentId.value, // 附件目录ID
    }
    fileList.value.forEach((ele:any) => {
      formData.append(`files`, ele.originFileObj);
    })

    defHttp
      .post(
          {
            url: urlList.upload,
            data: formData,
            params: params,
            headers: { "Content-Type": "multipart/form-data" },
          },
          { withToken: true }
      ).then((res: any) => {
        if(res && res.success) {
          message.success('注册成功！')
          reUpload.value = false
          fileList.value = []
          onReset()
        } else {
          message.warning(res?.message || '证明文件上传失败！请重新上传！')
          reUpload.value = true
        }
      })
}

function onReset() {
  Object.keys(formState).forEach(element => {
    formState[element] = ''
  });
  zcyhlx.value = 2
}

function beforeUpload() {
  return false
}

// 从上传列表中移除
function removeFile(file: any) {
  fileList.value = fileList.value.filter((ele:any) => ele.uid != file.uid)
}

function onUserTypeChange(value) {
  zcyhlx.value = Number(value)
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