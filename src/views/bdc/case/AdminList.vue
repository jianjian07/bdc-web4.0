<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="案卷名称">
                        <a-input v-model:value="formData.ajmc" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="受理编号">
                        <a-input v-model:value="formData.slbh" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="searchData">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询</a-button>
                            <a-button @click="clear">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置</a-button>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </div>
    <div class="wonder-table-css">
        <a-spin :spinning="spinning">
            <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
                @change="onChange($event, loadData)">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'ajmc'">
                        <a @click="itemView(record)">{{ record.ajmc }}</a>
                        <span v-if="record.taskSupervise" style="color: red;">【{{ record.taskSuperviseUserRealName+"督办：" +record.taskSuperviseRemark }}】</span>
                        <span v-if="record.taskUrgent" style="color: red;">【{{  record.taskUrgentUserRealName+"加急：" +record.taskUrgentRemark }}】</span>
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
                            <a @click="handleCase(record)">办理</a>
                            <a v-if="!record.taskDelegation" @click="handleEntruster(record)">委托</a>
                            <a v-if="record.taskName == '收件'" @click="handleDelete(record.slbh, record.ajmc)">删除</a>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-spin>
    </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref, createVNode } from 'vue';
import { SearchOutlined, RedoOutlined, RollbackOutlined, AlertOutlined, ExclamationCircleOutlined, SolutionOutlined } from '@ant-design/icons-vue';
import { router } from "/@/router";
import { Modal, message } from "ant-design-vue";
import { cModal } from "/@/components/cModal/index"
enum api {
    // list = '/tyyw/zrzy-cloud-bpm/act/task/list?column=createTime&order=des',//统一运维
    tasklist = '/api/zrzy-bdc/act/task/list',
    delUrl = "/api/zrzy-bdc/bdcdj/lcsc/deleteWfAndBusinessData",
    taskEntrust = '/api/zrzy-bdc/act/task/taskEntrust'
}
let datalist = ref([]);
let formData: any = ref({})
let spinning = ref<boolean>(true);
const columns = [
    { title: "任务id", dataIndex: "taskId", align: "center" },
    { title: "状态", dataIndex: "taskTimeStatus", align: "center", key: "taskTimeStatus", width: 100 },
    { title: "案卷名称", dataIndex: "ajmc", align: "center", key: "ajmc" },
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
    }
})
loadData()
function loadData() {
    spinning.value = true
    defHttp.post({ url: api.tasklist, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }, data: { ajmc: formData.value.ajmc, slbh: formData.value.slbh, isAll: true } }, { withToken: true }).then(res => {
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
    router.push({ path: '/bdc/casedoing', query: { slbh: record.slbh, taskId: record.taskId, nodeId: record.taskDefKey } });
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
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
