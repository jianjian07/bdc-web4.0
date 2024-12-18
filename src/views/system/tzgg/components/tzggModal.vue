<template>
  <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="stateRules">
    <a-form-item label="消息类型" ref="msgCategory" name="msgCategory">
      <a-radio-group v-model:value="formState.msgCategory" @change="onCatelogChange" :options="getDictItemsByCode('tzggxxlx')">
      </a-radio-group>
    </a-form-item>
    <a-form-item label="标题" name="title">
      <a-input v-model:value="formState.title" placeholder="请输入标题"/>
    </a-form-item>
    <a-form-item label="摘要" name="msgAbstract">
      <a-textarea v-model:value="formState.msgAbstract" placeholder="请输入摘要" />
    </a-form-item>
    <a-form-item label="接收用户" name="msgType">
      <a-radio-group v-model:value="formState.msgType" @change="onTypeChange">
        <a-radio value="ALL">全体用户</a-radio>
        <a-radio value="USER">指定用户</a-radio>
      </a-radio-group>
      <a-button v-show='chooseUser' type="primary" @click="showUserModal">选择用户</a-button>
      <div v-show="formState.msgType == 'USER'" style="padding-top: 10px;">
        <a-alert :message="alertMessage" type="success"></a-alert>
      </div>
    </a-form-item>
    <a-form-item label="优先级" name="priority">
      <a-radio-group v-model:value="formState.priority">
        <a-radio value="H">高</a-radio>
        <a-radio value="M">中</a-radio>
        <a-radio value="L">低</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-show="showGSSJ" label="公示开始时间" name="startTime">
      <div style="display: flex">
        <a-date-picker
          format="YYYY/MM/DD HH:mm:ss"
          value-format="YYYY/MM/DD HH:mm:ss"
          v-model:value="formState.startTime"
          @change="onGSSJChange"
        />
        <span style="display: flex; align-items: center; padding-left: 8px">
          <span> 起 </span>
          <span style="padding: 0 8px;">
            <a-input v-model:value="workDay" @change="onWorkDayChange"></a-input>
          </span>
          <span> 个工作日</span>
        </span>
      </div>
    </a-form-item>
    <a-form-item v-show="showGSSJ" label="公示结束时间" name="endTime">
      <a-date-picker
        format="YYYY/MM/DD HH:mm:ss"
        value-format="YYYY/MM/DD HH:mm:ss"
        v-model:value="formState.endTime"
        @change="onGSSJChange"
      />
    </a-form-item>
    <a-form-item label="内容" name="msgContent">
      <WangEditor @editorValue="setContent" :content="formState.msgContent"></WangEditor>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import WangEditor from '/@/components/common/wangEditor.vue'
import { cModal } from "/@/components/cModal/index"
import dayjs from 'dayjs';
import { useUserStore } from "/@/store/modules/user";
import { getDictItemsByCode } from '/@/utils/form/commonUtils';

const formRef = ref()
let formState: any = reactive({
  id: '',
  title: '',
  msgAbstract: '',
  msgContent: '',
  msgType: 'ALL',
  priority: 'H',
  sendStatus: '0', // '0'未发布 '1'已发布 '2'已撤销
  sendTime: '',
  cancelTime: '',
  delFlag: '0',
  msgCategory: '1',
  userIds: '',
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
  startTime: '',
  endTime: ''
});

let chooseUser:any = ref(false)
let alertMessage: any = ref('已选择 0 人')
let showGSSJ: any = ref(false)
let workDay: any = ref('')

const stateRules: any = {
  title: [
    { required: true, message: '请输入标题', trigger: 'change' },
  ],
  msgAbstract: [
    { required: true, message: '请输入摘要', trigger: 'change' },
  ],
  msgType: [
    { required: true, message: '请选择通告对象类型', trigger: 'change' },
  ],
  msgCategory: [
    { required: true, message: '请选择消息类型', trigger: 'change' },
  ],
  startTime: [
    { required: showGSSJ.value, message: '请选择公示开始日期', trigger: 'change' },
  ],
  endTime: [
    { required: showGSSJ.value, message: '请选择公示结束日期', trigger: 'change' },
  ]
}

const labelCol = { style: { width: '130px' } };
const wrapperCol = { span: 19 };
const api = {
  add: '/api/zrzy-bdc/sys/sysTzgg/add',
  edit: '/api/zrzy-bdc/sys/sysTzgg/edit'
}


const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

watch(() => props.formData, (val) => {
  if(val.type != 'new') {
    Object.keys(formState).forEach(ele => {
      formState[ele] = val.record[ele]
    })
    onGSSJChange()
    if(formState.msgType == 'USER' && val.type == 'edit') {
      chooseUser.value = true
    }
    let length = formState.userIds ? (formState.userIds.split(',')).length : 0
    alertMessage.value = `已选择 ${length} 人`
    if(formState.msgCategory == '3') {
      showGSSJ.value = true
    }
  }
}, {
  immediate: true
})

function setContent(val) {
  formState.msgContent = val
}

function onTypeChange(e) {
  if(e.target.value == 'USER') {
    chooseUser.value = true
  } else {
    chooseUser.value = false
    formState.userIds = ''
  }
}

function onCatelogChange(e) {
  if (e.target.value == '3') {
    showGSSJ.value = true
  } else {
    showGSSJ.value = false
  }
}

function showUserModal() {
  let modal = cModal({
    title: '选择用户',
    width: 1000,
    filePath: 'views/system/tzgg/components/userList',
    footerStyle: { 'text-align': 'center' },
    onOk: async (res: any) => {
      modal.setConfirmLoading(true)
      // res为弹窗内组件的dom
      formState.userIds = res.state?.selectedRowKeys.join(',')
      const names = res.state?.selectedRowNames
      alertMessage.value = '已选择 0 人'
      if(names.length) {
         alertMessage.value = '已选择'
        for(let i=0; i<names.length; i++) {
          if (i == 0) {
            alertMessage.value += ` ${names[i]}`
          } else if(i < 3) {
            alertMessage.value += `、${names[i]}`
          } else {
            break
          }
        }
        if(names.length > 3) {
          alertMessage.value += ` 等 ${names.length} 人` 
        }
      }
      modal.setConfirmLoading(false)
      modal.destroy()
    },
    onCancel: () => {
      modal.close()
    }
  })
}

function onWorkDayChange() {
  if(formState.startTime) {
    formState.endTime = dayjs(addWorkDays(formState.startTime, workDay.value)).format("YYYY-MM-DD HH:mm:ss")
  }
}

function onGSSJChange() {
  if(formState.endTime) {
    workDay.value = getDays(dayjs(formState.startTime).format("YYYY-MM-DD"), dayjs(formState.endTime).format("YYYY-MM-DD")) //根据日期计算出工作日有多少
  }
}

/**
 * 用于计算起始日期加上n个工作日的终止日期
 * startDate 开始日期
 * numDaya 工作日（如公示日期为15个工作日）
 * */ 
function addWorkDays(startDate, numDays) {
  let currentDate = new Date(startDate);
  let count = 0;
 
  // 循环增加天数直到达到指定的工作日数
  while (count < numDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // 检查是否为工作日（这里假设工作日为周一至周五，不包括节假日，节假日需要调用函数才能判断）
    if (currentDate.getDay() % 6 !== 0) { // getDay() 返回星期的数字，0 代表星期日
      count++;
    }
  }

  console.log(currentDate)
 
  // 返回计算后的终止日期
  return currentDate;
}

function getDays(startDate, endDate){
  var start = new Date(Date.parse(startDate));
  var end = new Date(Date.parse(endDate));
  var startTime = start.getTime();
  var endTiem = end.getTime();
  //获取开始日期是周几
  var startweek = start.getDay();
  //计算出相隔的天数
  var days = Math.abs((endTiem - startTime) / (1000*60*60*24)) + 1;
  //存放相隔之间的周六日天数
  var weeks = 0;
  for (var i = 0; i < days ; i++) {
    //如果开始日期是周六日，weeks+1,否则，验证下一天
    if (startweek == 0  || startweek == 6) {
        weeks ++;
    }
    //下一天的时间戳
    startweek = startTime + (1000 * 90 * 60 * 24 * (i+1));
    //下一天是周几
    startweek = new Date(startweek).getDay();
  }
  var result = days - weeks;
  return result;
}


const onSubmit = () => {
  return new Promise((resolve, reject) => {
    let url = props.formData.type == 'new' ? api.add : api.edit
    let method = props.formData.type == 'new' ? 'post' : 'put'
    formRef.value
      .validate()
      .then(() => {

        formState.createTime = formState.createTime || dayjs().format("YYYY-MM-DD HH:mm:ss")
        formState.createBy = formState.createBy || useUserStore().getUserInfo.username
        formState.updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
        formState.updateBy = useUserStore().getUserInfo.username

        defHttp[method](
          {
            url: url,
            data: formState
          },
          { withToken: true }
        ).then((res: any) => {
          if(res?.success) {
            message.success(res.message)
            return resolve(true)
          } else {
            message.warning(res?.message || '操作失败！')
            return reject()
          }
        })
      }).catch((error: any) => {
        console.log(error)
      });
  })
}

defineExpose({
  onSubmit
})

</script>

<style lang="less" scoped>

</style>