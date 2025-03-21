<template>
  <div class="act-ru-delegate-modal">
    <a-modal
        :maskClose="false"
        :open="open"
        :title="title"
        :width="1000"
        destroyOnClose
        @cancel="handleCancel"
        @ok="handleOk"
    >
      <div class="act-ru-delegate-modal-content">
        <a-spin :spinning="confirmLoading">
          <a-form
              ref="formRef"
              :model="formState"
              :rules="formRules">
            <a-row>
              <a-col :span="12">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="代理人">
                  <a-input-search v-model:value="formState.agentname" placeholder="请先选择用户" readOnly>
                    <template #enterButton>
                      <a-button @click="handleChooseUser">选择用户</a-button>
                    </template>
                  </a-input-search>
                </a-form-item>
              </a-col>
              <a-col :span="12">
               <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="委托人">
                 <a-input v-model:value="formState.ownername" readOnly></a-input>
               </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="开始时间">
                  <a-date-picker
                      v-model:value="formState.beginDate"
                      format="YYYY-MM-DD"
                      placeholder="请选择开始时间"
                      style="width: 100%"
                      value-format="YYYY-MM-DD">
                  </a-date-picker>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="结束时间">
                  <a-date-picker
                      v-model:value="formState.endDate"
                      format="YYYY-MM-DD"
                      placeholder="请选择结束时间"
                      style="width: 100%"
                      value-format="YYYY-MM-DD">
                  </a-date-picker>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="委托原因">
                  <a-input v-model:value="formState.ereason" placeholder="请输入委托原因"></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="流程">
                  <a-tree-select v-model:value="formState.list"
                                 :fieldNames="{ value: 'key' }"
                                 :multiple="true" :tree-data="nodeList"
                                 placeholder="请选择流程">
                  </a-tree-select>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :labelCol="labelCol2" :wrapperCol="wrapperCol2" label="备注">
                  <a-textarea v-model:value="formState.remark" :rows="4" placeholder="请输入备注"></a-textarea>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-spin>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { cModal } from "/@/components/cModal/index"
import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import dayjs from "dayjs"
import { useUserStore } from "/@/store/modules/user"

const userStore = useUserStore()
const userInfo = userStore.getUserInfo
// 是否显示弹窗
let open = ref<boolean>(false)
// 标题
let title = ref<string>('')
// 确认loading
let confirmLoading = ref<boolean>(false)
// 表单实例
let formRef = ref<any>()
// 表单
let formState = ref<any>({})
// 表单规则
const formRules: any = {}
// 布局
let labelCol = { span: 6 }
let wrapperCol = { span: 16 }
let labelCol2 = { span: 3 }
let wrapperCol2 = { span: 20 }
// 流程列表
let nodeList = ref<any>([])

const emit = defineEmits(['ok'])

enum api {
  nodeList = '/api/zrzy-bdc/act/process/extActProcess/list',
  add = '/api/zrzy-bdc/bpm/actRuDelegate/add',
  edit = '/api/zrzy-bdc/bpm/actRuDelegate/edit',
  query = '/api/zrzy-bdc/bpm/actRuDelegate/queryActRuDelegateNodeByMainId'
}

defineExpose({
  add,
  edit
})

onMounted(() => {
  getNodeList()
})

/**
 * 新增
 */
function add() {
  title.value = '新增'
  formState.value = {
    ownerid: userInfo.username,
    ownername: userInfo.realname
  }
  open.value = true
}

/**
 * 编辑
 * @param record
 */
async function edit(record) {
  title.value = '编辑'
  formState.value = JSON.parse(JSON.stringify(record))
  let list = await queryList(record)
  formState.value.actRuDelegateNodeList = list
  formState.value.list = list.map(item => item.processId)
  open.value = true
}

/**
 * 查询已选中的流程
 * @param record
 */
function queryList(record) {
  return new Promise((resolve, reject) => {
    defHttp.get({ url: api.query, params: { id: record.id } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        message.warning('查询出错!')
        resolve([])
      }
    })
  })
}

/**
 * 确认
 */
function handleOk() {
  formRef.value.validate().then(() => {
    let params = JSON.parse(JSON.stringify(formState.value))
    params.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    params.updateBy = userInfo.username
    if (title.value == '新增') {
      params.createTime = params.updateTime
      params.createBy = params.updateBy
    }
    if (!params.actRuDelegateNodeList) {
      params.actRuDelegateNodeList = []
    }
    params.actRuDelegateNodeList = (params.list || []).map((item) => {
      let find = params.actRuDelegateNodeList.find(node => node.processId == item)
      if (find) {
        find.updateBy = params.updateBy
        find.updateTime = params.updateTime
        return find
      } else {
        return {
          createBy: params.createBy,
          createTime: params.createTime,
          updateBy: params.updateBy,
          updateTime: params.updateTime,
          processId: item
        }
      }
    })
    delete params.list
    let fun = title.value == '新增' ? 'post' : 'put'
    defHttp[fun]({ url: title.value == '新增' ? api.add : api.edit, data: params }, { withToken: true }).then((res) => {
      if (res && res.code == 200) {
        message.success(title.value + '成功')
        open.value = false
        emit('ok')
      } else {
        message.error(res.message)
      }
    }).catch(err => {
      message.error(err)
    })
  })
}

/**
 * 关闭
 */
function close() {
  handleCancel()
}

/**
 * 关闭
 */
function handleCancel() {
  open.value = false
}

/**
 * 获取流程列表
 */
function getNodeList() {
  defHttp.get({ url: api.nodeList }, { withToken: true }).then((res) => {
    if (res && res.success) {
      let tree = res.result || []
      updateDisabledStatus(tree)
      nodeList.value = tree
    }
  })
}

/**
 * 更新禁选状态 只允许选择子节点
 * @param tree
 */
function updateDisabledStatus(tree) {
  function traverse(nodes) {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.selectable = false
        traverse(node.children)
      } else {
        node.selectable = true
      }
    })
  }

  traverse(tree)
}


/**
 * 选择用户
 */
function handleChooseUser() {
  let modal = cModal({
    title: '选择用户',
    width: 1200,
    filePath: 'views/bdc/task/components/UserChosen',
    formData: {
      currentKeys: formState.value.agentid ? [formState.value.agentid] : []
    },
    onOk: async (res: any) => {
      if (res && res.selectedRow) {
        formState.value.agentid = res.selectedRow[0].username
        formState.value.agentname = res.selectedRow[0].realName
        modal.destroy()
      } else {
        message.warning('请先选择一条数据!')
      }
    }
  })

}
</script>

<style lang="less" scoped>

</style>