<template>
  <div class="wonder-table-form">
    <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="6" :offset="0">
          <a-form-item label="受理编号">
            <a-input v-model:value="formData.slbh" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="流程类别">
            <a-select v-model:value="formData.lclx" :options="getDictItemsByCode('bpm_process_type')"
              @change="onChangeLclx" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="流程名称">
            <a-select v-model:value="formData.lcid" :options="lcmcList" @change="onChangeAjlx" />
          </a-form-item>
        </a-col>
        <a-col :span="4" :offset="0">
          <a-form-item label="办理环节">
            <a-select v-model:value="formData.nodeName" :options="nodeList" allowClear />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="[0, 8]" tyle="flex">
        <a-col :span="6" :offset="0">
          <a-form-item label="不动产单元号">
            <a-input v-model:value="formData.bdcdyh" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="坐落">
            <a-input v-model:value="formData.zl" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item label="案卷名称">
            <a-input v-model:value="formData.ajmc" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="6" :offset="0">
          <a-form-item style="text-align: center;">
            <a-space>
              <a-button type="primary" @click="searchData">
                <template #icon>
                  <component :is="SearchOutlined"></component>
                </template>
                查询
              </a-button>
              <a-button @click="clear">
                <template #icon>
                  <component :is="RedoOutlined"></component>
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="wonder-table-css">
    <a-spin :spinning="spinning">
      <a-table :columns="columns" :data-source="datalist" :pagination="pagination" @change="onChange($event, loadData)">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ajmc'">
            <a @click="itemView(record)">{{ record.ajmc }}</a>
            <span v-if="record.taskSupervise" style="color: red;">【{{ record.taskSuperviseUserRealName + "督办："
      + record.taskSuperviseRemark }}】</span>
            <span v-if="record.taskUrgent" style="color: red;">【{{ record.taskUrgentUserRealName + "加急："
      + record.taskUrgentRemark }}】</span>
            <span v-if="record.taskBack" style="color: red;">【{{ "退件：" + record.taskBackRemark }}】</span>
          </template>
          <template v-if="column.key === 'taskTimeStatus'">
            <span>
              <a-space>
                <a-tag color="orange" v-if="record.taskTimeStatus == 1">
                  <template #icon>
                    <RollbackOutlined />
                  </template>
                  预警
                </a-tag>
                <a-tag color="red" v-if="record.taskTimeStatus == 2">
                  <template #icon>
                    <AlertOutlined />
                  </template>
                  超时
                </a-tag>
                <a-tag color="green" v-if="record.taskTimeStatus == 0">正常</a-tag>
                <a-tooltip key="blue" :title="'委托人: ' + record.taskOwnerName">
                  <a-tag color="blue" v-if="record.taskDelegation" style="cursor: pointer">
                    <template #icon>
                      <SolutionOutlined />
                    </template>
                    {{ record.taskOwnerName }}
                  </a-tag>
                </a-tooltip>
              </a-space>
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space :size="2">
              <template #split>
                <a-divider type="vertical" />
              </template>
              <a :class="{ 'case-bl-active': clickedList.includes(record.slbh) || record.handleFlag == 1 }"
                @click="handleCase(record)">办理</a>
              <a v-if="!record.taskDelegation" @click="handleEntruster(record)">委托</a>
              <a v-if="record.taskName == '收件' || record.taskName == '受理'"
                @click="handleDelete(record.slbh, record.ajmc)">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref, createVNode, onMounted } from 'vue'
import { SearchOutlined, RedoOutlined, RollbackOutlined, AlertOutlined, ExclamationCircleOutlined, SolutionOutlined } from '@ant-design/icons-vue';
import { router } from "/@/router";
import { Modal, message } from "ant-design-vue";
import { cModal } from "/@/components/cModal/index"
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils.ts";
enum api {
  // list = '/tyyw/zrzy-cloud-bpm/act/task/list?column=createTime&order=des',//统一运维
  tasklist = '/api/zrzy-bdc/act/task/list',
  delUrl = "/api/zrzy-bdc/bdcdj/lcsc/deleteWfAndBusinessData",
  taskEntrust = '/api/zrzy-bdc/act/task/taskEntrust',
  handleFlagUrl = '/api/zrzy-bdc/hi/taskinst/updateHandleFlag',
  getLcListByLclx = '/api/zrzy-bdc/flow/flowConfig/getLcListByLclx',
  nodelistUrl = '/api/zrzy-bdc/act/process/extActProcessNode/list'
}
let datalist = ref([]);
let formData: any = ref({})
let spinning = ref<boolean>(true);
const columns = [
  { title: "任务id", dataIndex: "taskId", align: "center" },
  { title: "状态", dataIndex: "taskTimeStatus", align: "center", key: "taskTimeStatus", width: 100 },
  { title: "案卷名称", dataIndex: "ajmc", align: "center", key: "ajmc" },
  { title: "登记类别", dataIndex: "processDefinitionName", align: "center", key: "processDefinitionName" },
  { title: "受理编号", dataIndex: "slbh", align: "center" },
  { title: "节点ID", dataIndex: "taskDefKey", align: "center" },
  { title: "当前节点", dataIndex: "taskName", align: "center" },
  { title: "时长", dataIndex: "durationStr", align: "center" },
  { title: "提交人", dataIndex: "processApplyUserName", align: "center" },
  { title: "提交时间", dataIndex: "taskBeginTime", align: "center" },
  { title: '操作', key: 'action', width: 200, align: "center" }
]
let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: () => {
    return `共 ${pagination.value.total} 条数据`
  },
  showSizeChanger: true,
  showQuickJumper: true
})
// 流程名称下拉
let lcmcList = ref([])
// 业务节点下拉
let nodeList = ref([])
// 当前点击过办理案卷
let clickedList = ref<any>([])

onMounted(() => {
  loadData()
})

function loadData() {
  spinning.value = true
  let data = {
    lcid: formData.value.lcid,
    ajmc: formData.value.ajmc,
    slbh: formData.value.slbh,
    bdcdyh: formData.value.bdcdyh,
    zl: formData.value.zl,
    taskName: formData.value.nodeName
  }
  defHttp.post({ url: api.tasklist, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }, data: data }, { withToken: true }).then(res => {
    if (res.success) {
      const result = res.result
      datalist.value = result.records
      pagination.value.total = result.total
    }
    spinning.value = false
  }).catch(_err => {
    spinning.value = false
  })
}
/**
 * 查询
*/
function searchData() {
  pagination.value.current = 1
  loadData()
}
/**
* 分页
* @param pag
* @param callback 回调函数
*/
function onChange(pag: any, callback: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  callback()
}
/**
 * 重置
*/
function clear() {
  formData.value = {}
  loadData()
}
/**
 * 移交
 * @param record
 */
function handleCase(record: any) {
  if (!clickedList.value.includes(record.slbh)) {
    clickedList.value.push(record.slbh)
  }
  // 记录办理状态
  handleFlag(record)
  router.push({ path: '/bdc/casedoing', query: { slbh: record.slbh, taskId: record.taskId, nodeId: record.taskDefKey } });
}

/**
 * 修改办理状态
 */
function handleFlag(record) {
  if (!record.taskId || record.handleFlag == 1) {
    return
  }
  defHttp.get({
    url: api.handleFlagUrl,
    params: { taskId: record.taskId }
  }, { withToken: true }).then((res) => {
    if (res && res.code == 200) {

    } else {
      console.log("修改办理状态失败：" + res.message)
    }
  }).catch((err => {
    console.log("修改办理状态失败：" + err)
  }))
}

/**
 * 查看项目信息
 * @param record
 */
function itemView(record: any) {
  router.push('/task/hisTaskDeal?slbh=' + record.slbh)
}

/**
 * 委托
 * @param record
 */
function handleEntruster(record: any) {
  let modal = cModal({
    title: '选择用户',
    width: 1200,
    filePath: 'views/bdc/task/components/UserChosen',
    onOk: async (res: any) => {
      if (res && res.selectedRow) {
        let params = {
          taskId: record.taskId,
          taskAssigneeUserId: res.selectedRow[0].username
        }
        defHttp.put({ url: api.taskEntrust, params: params }, { withToken: true }).then((res) => {
          if (res && res.success) {
            message.success('委托成功!')
            loadData()
            modal.destroy()
          } else {
            message.warning('委托失败!')
          }
        })
      } else {
        message.warning('请先选择委托的用户!')
      }
    }
  })
}

/**
 * 删除
 * @param slbh
 */
function handleDelete(slbh: string, ajmc: string) {
  Modal.confirm({
    title: '确定要删除该案卷吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '案卷名称：' + ajmc,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      defHttp.delete(
        { url: api.delUrl, params: { slbh: slbh } }, { withToken: true }
      ).then((res: any) => {
        if (res?.success) {
          message.success('删除成功！')
          loadData()
        } else {
          message.warning(res?.message)
        }
      })
    },
    onCancel() {
    },
  });


}

/**
 * 流程类型下拉
 */
function onChangeLclx(_value) {
  if (_value) {
    getLcmcByLclx(_value)
  } else {
    formData.value.lcid = ''
    formData.value.nodeName = ''
    lcmcList.value = []
    nodeList.value = []
  }
}

/**
 * 流程名称下拉
 */
function getLcmcByLclx(lclx) {
  return new Promise((resolve, reject) => {
    defHttp.get({ url: api.getLcListByLclx, params: { lclx: lclx } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        lcmcList.value = res.result.map(item => {
          return {
            value: item.lcid,
            label: item.lcmc
          }
        })
        if (lcmcList.value.length > 0) {
          let currentId = lcmcList.value[0].value
          formData.value.lcid = currentId
          getNode(currentId)
        } else {
          formData.value.lcid = undefined
        }
        resolve(true)
      } else {
        reject(false)
      }
    }).catch(err => {
      reject(false)
    })
  })
}

/**
 * 流程名称下拉
 */
function onChangeAjlx(_value) {
  if (_value) {
    getNode(_value)
  } else {
    formData.value.nodeName = ''
  }
}

/**
 * 业务节点下拉
 */
function getNode(currentLcid) {
  defHttp.get({ url: api.nodelistUrl, params: { processId: currentLcid } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      nodeList.value = res.result.map(item => {
        return {
          value: item.processNodeName,
          label: item.processNodeName
        }
      })
    }
  })
}
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');

.case-bl-active {
  color: #771caa;
}
</style>
