<template>
  <a-form ref="formRef" :disabled="formDisabled" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol"
    :rules="stateRules">
    <a-form-item label="消息类型" ref="msgCategory" name="msgCategory">
      <a-radio-group v-model:value="formState.msgCategory" @change="onCatelogChange"
        :options="getDictItemsByCode('tzggxxlx')">
      </a-radio-group>
    </a-form-item>
    <a-form-item label="标题" name="title">
      <a-input v-model:value="formState.title" placeholder="请输入标题" />
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
    <a-form-item v-show="showGSSJ" label="公示时间" name="startTime">
      <div style="display: flex">
        <a-date-picker format="YYYY/MM/DD HH:mm:ss" value-format="YYYY/MM/DD HH:mm:ss"
          v-model:value="formState.startTime" @change="onGSSJChange" />
        <span style="display: flex; align-items: center; padding:0 8px">
          <span> 起 </span>
          <span style="padding: 0 8px;">
            <a-input v-model:value="workDay" @change="onWorkDayChange"></a-input>
          </span>
          <span> 个工作日 </span>
        </span>
        <a-form-item name="endTime" class="endTime-form-item">
          <a-date-picker format="YYYY/MM/DD HH:mm:ss" value-format="YYYY/MM/DD HH:mm:ss"
            v-model:value="formState.endTime" @change="onGSSJChange" />
        </a-form-item>
        <span style="display: flex; align-items: center; padding-left: 8px">
          止
        </span>
      </div>
    </a-form-item>
    <!--    <a-form-item v-show="showGSSJ && false" label="公示结束时间" name="endTime">-->
    <!--      <a-date-picker-->
    <!--          format="YYYY/MM/DD HH:mm:ss"-->
    <!--          value-format="YYYY/MM/DD HH:mm:ss"-->
    <!--          v-model:value="formState.endTime"-->
    <!--          @change="onGSSJChange"-->
    <!--      />-->
    <!--    </a-form-item>-->
    <a-form-item label="内容" name="msgContent">
      <WangEditor ref="wangEditorRef" @editorValue="setContent" :readOnly="formDisabled" :id="formState.id"
        :content="formState.msgContent"></WangEditor>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { message } from 'ant-design-vue'
import WangEditor from '/@/components/common/wangEditor/wangEditor.vue'
import { cModal } from "/@/components/cModal/index"
import dayjs from 'dayjs'
import { useUserStore } from "/@/store/modules/user"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'
import {
  currentFileIds,
  getDeletedFileIds,
  getUploadedFileIds,
} from "/@/components/common/wangEditor/upload-attachment.ts"
import { encryptByBase64 } from '/@/utils/cipher'

const formRef = ref()
let formState: any = reactive({
  id: '',
  title: '',
  msgAbstract: '',
  msgContent: '',
  msgType: 'ALL',
  priority: 'H',
  sendStatus: 0, // '0'未发布 '1'已发布 '2'已撤销
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
})

let chooseUser: any = ref(false)
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
let formDisabled = ref(false)
const labelCol = { style: { width: '130px' } }
const wrapperCol = { span: 19 }
let wangEditorRef = ref()

const api = {
  add: '/api/zrzy-system/sys/sysTzgg/add',
  edit: '/api/zrzy-system/sys/sysTzgg/edit',
  delFile: '/api/zrzy-system/common/upfiles/deleteFj',
}

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

watch(() => props.formData, (val) => {
  if (val.type != 'new') {
    Object.keys(formState).forEach(ele => {
      formState[ele] = val.record[ele]
    })
    onGSSJChange()
    if (formState.msgType == 'USER' && val.type == 'edit') {
      chooseUser.value = true
    }
    let length = formState.userIds ? (formState.userIds.split(',')).length : 0
    alertMessage.value = `已选择 ${length} 人`
    if (formState.msgCategory == '3') {
      showGSSJ.value = true
    }
  }
  formDisabled.value = val.type == 'view'
}, {
  immediate: true
})

function setContent(val) {
  formState.msgContent = val
}

function onTypeChange(e) {
  if (e.target.value == 'USER') {
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
    filePath: 'views/bdc/task/components/UserChosen',
    formData: {
      modeType: 'checkbox',
      filterKeyName: 'id',
      currentKeys: formState.userIds ? formState.userIds.split(',') : []
    },
    footerStyle: { 'text-align': 'center' },
    onOk: async (res: any) => {
      if (res && res.selectedRow) {
        formState.userIds = res.selectedRow.map(m => m.id).join(',')
        alertMessage.value = `已选择 ${res.selectedRow.length || 0} 人`
        modal.destroy()
      } else {
        message.warning('请先选择用户!')
      }
    },
    onCancel: () => {
      modal.destroy()
    }
  })
}

function onWorkDayChange() {
  if (formState.startTime) {
    formState.endTime = dayjs(addWorkDays(formState.startTime, workDay.value)).format("YYYY-MM-DD HH:mm:ss")
  }
}

function onGSSJChange() {
  if (formState.endTime) {
    workDay.value = getDays(dayjs(formState.startTime).format("YYYY-MM-DD"), dayjs(formState.endTime).format("YYYY-MM-DD")) //根据日期计算出工作日有多少
  }
}

/**
 * 用于计算起始日期加上n个工作日的终止日期
 * startDate 开始日期
 * numDaya 工作日（如公示日期为15个工作日）
 * */
function addWorkDays(startDate, numDays) {
  let currentDate = new Date(startDate)
  let count = 0

  // 循环增加天数直到达到指定的工作日数
  while (count < numDays) {
    currentDate.setDate(currentDate.getDate() + 1)

    // 检查是否为工作日（这里假设工作日为周一至周五，不包括节假日，节假日需要调用函数才能判断）
    if (currentDate.getDay() % 6 !== 0) { // getDay() 返回星期的数字，0 代表星期日
      count++
    }
  }

  console.log(currentDate)

  // 返回计算后的终止日期
  return currentDate
}

function getDays(startDate, endDate) {
  var start = new Date(Date.parse(startDate))
  var end = new Date(Date.parse(endDate))
  var startTime = start.getTime()
  var endTiem = end.getTime()
  //获取开始日期是周几
  var startweek = start.getDay()
  //计算出相隔的天数
  var days = Math.abs((endTiem - startTime) / (1000 * 60 * 60 * 24)) + 1
  //存放相隔之间的周六日天数
  var weeks = 0
  for (var i = 0; i < days; i++) {
    //如果开始日期是周六日，weeks+1,否则，验证下一天
    if (startweek == 0 || startweek == 6) {
      weeks++
    }
    //下一天的时间戳
    startweek = startTime + (1000 * 90 * 60 * 24 * (i + 1))
    //下一天是周几
    startweek = new Date(startweek).getDay()
  }
  var result = days - weeks
  return result
}

/**
 * 规范化富文本中的图片标签
 * @param html
 */
function normalizeMsgContentHtml(html) {
  try {
    if (!html || typeof html !== 'string') return html
    const wrapper = document.createElement('div')
    wrapper.innerHTML = html
    // 仅处理 wangeditor 的图片节点
    const imgs = wrapper.querySelectorAll('img[data-w-e-type="image"]')
    imgs.forEach((img) => {
      const original = img.getAttribute('data-original-src') || ''
      const src = img.getAttribute('src') || ''
      // 若存在原始下载地址且当前为 base64，则写回 src=""
      if (original && /^\s*data:/i.test(src)) {
        img.setAttribute('src', '')
      }
    })
    return wrapper.innerHTML
  } catch (_) {
    return html
  }
}

const onSubmit = async () => {
  return new Promise(async (resolve, reject) => {
    const deletedIds = getDeletedFileIds() || []
    const uploadedIds = getUploadedFileIds() || []
    const currentIds = new Set(currentFileIds.value || [])
    // 新上传但未保留的
    const unkeptUploadedIds = uploadedIds.filter(id => !currentIds.has(id))

    // 需要删除的所有ID
    const allDelIds = [...deletedIds, ...unkeptUploadedIds]

    // 去重（防止重复）
    const uniqueDelIds = Array.from(new Set(allDelIds))

    let delRes = true
    if (uniqueDelIds.length > 0) {
      delRes = await deleteAttachment(uniqueDelIds)
    }
    if (!delRes) {
      resolve(false)
      return
    }
    let url = props.formData.type == 'new' ? api.add : api.edit
    let method = props.formData.type == 'new' ? 'post' : 'put'
    formRef.value
      .validate()
      .then(() => {

        formState.createTime = formState.createTime || dayjs().format("YYYY-MM-DD HH:mm:ss")
        formState.createBy = formState.createBy || useUserStore().getUserInfo.username
        formState.updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
        formState.updateBy = useUserStore().getUserInfo.username
        // 避免将 base64 存入数据库
        formState.msgContent = encryptByBase64(normalizeMsgContentHtml(formState.msgContent))
        defHttp[method](
          {
            url: url,
            data: formState
          },
          { withToken: true }
        ).then((res: any) => {
          if (res?.success) {
            message.success(res?.message)
            return resolve(true)
          } else {
            message.warning(res?.message || '操作失败！')
            return reject()
          }
        })
      }).catch((error: any) => {
        console.log(error)
      })
  })
}

async function onCancel() {
  // 删除所有新上传但未保留的附件
  const uploadedIds = getUploadedFileIds() || []
  return await deleteAttachment(uploadedIds)
}

/**
 * 删除附件
 * @param delIds
 */
function deleteAttachment(delIds) {
  return new Promise((resolve) => {
    if (delIds.length > 0) {
      Promise.all(delIds.map(id => {
        return defHttp.delete({ url: api.delFile, params: { id } }, { withToken: true }).then((res) => {
          if (res && res.code == 200) {
            message.success('已删除新上传的附件')
          } else {
            message.error(res?.message || '删除附件出错!')
          }
        })
      })).then(() => {
        resolve(true)
      }).catch(() => {
        message.error('删除附件失败，请稍后重试')
        resolve(false)
      })
    } else {
      resolve(true)
    }
  })
}

defineExpose({
  onSubmit,
  onCancel
})

</script>

<style lang="less" scoped>
.endTime-form-item {
  margin-bottom: 0;
}
</style>