<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="8" :offset="0">
                    <a-form-item label="案卷名称">
                        <a-input v-model:value="formData.processDefinitionName" />
                    </a-form-item>
                </a-col>
                <a-col :span="8" :offset="0">
                    <a-form-item label="案卷编号">
                        <a-input v-model:value="formData.id" />
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
        <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
            @change="onChange($event, loadData)">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                    <span>
                        <a-tag color="orange" v-if="record.taskBack">
                            <template #icon>
                                <RollbackOutlined />
                            </template>
                            回退
                        </a-tag>
                        <a-tag color="red" v-if="record.taskUrge">
                            <template #icon>
                                <AlertOutlined />
                            </template>
                            催办
                        </a-tag>
                        <a-tag color="green"
                            v-if="!record.taskUrgent && !record.taskBack && !record.taskSupervise">正常</a-tag>
                    </span>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="handleCase(record)">办理</a>
                        <a>移交</a>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios"
import { ref } from 'vue';
import { SearchOutlined, RedoOutlined, RollbackOutlined, AlertOutlined } from '@ant-design/icons-vue';
import { router } from "/@/router";
enum api {
    list = '/tyyw/zrzy-cloud-bpm/act/task/list?column=createTime&order=des'//统一运维
}
let datalist = ref([]);
let formData: any = ref({})
const columns = [
    { title: "状态", dataIndex: "status", align: "center", key: "status", width: 200 },
    { title: "案卷名称", dataIndex: "processDefinitionName", align: "center" },
    { title: "案卷编号", dataIndex: "id", align: "center" },
    { title: "当前节点", dataIndex: "taskName", align: "center" },
    { title: "时长", dataIndex: "durationStr", align: "center" },
    { title: "提交人", dataIndex: "taskAssigneeName", align: "center" },
    { title: "提交时间", dataIndex: "taskBeginTime", align: "center" },
    { title: '操作', key: 'action', width: 200, align: "center" }
]
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})
loadData()
function loadData() {
    defHttp.get({ url: api.list }, { withToken: true }).then(res => {
        const result = res.result
        datalist.value = result.records
        pagination.value.total = result.total
    }).catch(err => {

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
    pagination.value = pag
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
    router.push("/bdc/casedoing" + '/' + record.id)
}
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>