<template>
    <a>首次登记</a>
</template>

<script setup lang="ts">
import { defHttp } from "/@/utils/http/axios";
enum api {
    add = '/process/extActProcess/add',
    list = '/designform/designFormCommuse/roleDegisnList',
    startMutilProcess = 'act/process/extActProcess/startMutilProcess',
    list1 = '/tyyw/zrzy-cloud-joa/joa/designform/designFormCommuse/roleDegisnList'
}
const record = {
    id: '',
    taskId: '',
    processInstanceId: ''
}
ceshi()
function ceshi() {
    defHttp.post({ url: api.list1 }, { withToken: true }).then(res => {
        debugger
    })
    // const p = {
    //     flowCode: "onl_air_china_materiel",
    //     formUrl: "super/bpm/process/components/OnlineFormDetail",
    //     formUrlMobile: "check/onlineForm/detail",
    //     id: "1778672881065037825"
    // }

}
const flowCodePre = 'desform_'
function add(desform: any) {
    const param = {
        desformId: desform.id,
        desformCode: desform.desformCode,
        desformDataId: "dataId",
        desformName: desform.desformName,
        processName: desform.procName,
        flowCode: flowCodePre + desform.desformCode,
        titleExp: desform.titleExp
    }
}

// let params = { code: record.id, taskId: record.taskId, processInstanceId: record.processInstanceId }
</script>

<style scoped lang="less"></style>