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
                        <span v-if="record.taskSupervise" style="color: red;">【{{ record.taskSuperviseUserRealName + "督办："
            + record.taskSuperviseRemark }}】</span>
                        <span v-if="record.taskUrgent" style="color: red;">【{{ record.taskUrgentUserRealName + "加急："
            + record.taskUrgentRemark }}】</span>
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
                            <a @click="handleReceive(record)">领取</a>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios"
import { ref, createVNode, onMounted } from 'vue'
import { SearchOutlined, RedoOutlined, RollbackOutlined, AlertOutlined, ExclamationCircleOutlined, SolutionOutlined } from '@ant-design/icons-vue';
import { router } from "/@/router";
import { Modal, message } from "ant-design-vue";
enum api {
    list = '/api/zrzy-bdc/act/task/list',
    receive = '/api/zrzy-bdc/act/task/claim'
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
    { title: '操作', key: 'action', width: 130, align: "center" }
]

let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
    showTotal: () => {
        return `共 ${pagination.value.total} 条数据`
    }
})

onMounted(() => {
    loadData()
})

/**
 * 加载数据
 */
function loadData() {
    spinning.value = true
    defHttp.post({ url: api.list, params: { pageNo: pagination.value.current, pageSize: pagination.value.pageSize }, data: { ajmc: formData.value.ajmc, slbh: formData.value.slbh, isLq: true } }, { withToken: true }).then(res => {
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
 * 查看项目信息
 * @param record
 */
function itemView(record: any) {
    router.push('/task/hisTaskDeal?slbh=' + record.slbh)
}

/**
 * 领取
 * @param record
 */
function handleReceive(record: any) {
    defHttp.get({ url: api.receive, params: { taskId: record.taskId } }, { withToken: true }).then(res => {
        if (res && res.success) {
            message.success('领取成功!')
            loadData()
        } else {
            message.warning('领取失败!')
        }
    })
}

</script>

<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>