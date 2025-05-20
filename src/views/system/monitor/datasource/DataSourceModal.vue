<template>
    <a-drawer v-model:open="open" :title="title" @close="onClose" :width="720">
        <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
            <a-button type="primary" @click="onOk">确定</a-button>
        </template>
        <a-form :model="formData" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
            <a-form-item label="数据源编码" name="code" :rules="[{ required: true, message: '请输入数据源编码' }]">
                <a-input v-model:value="formData.code" />
            </a-form-item>
            <a-form-item label="数据源名称" name="name" :rules="[{ required: true, message: '请输入数据源名称' }]">
                <a-input v-model:value="formData.name" />
            </a-form-item>
            <a-form-item label="数据库类型" name="dbType" :rules="[{ required: true, message: '请输入数据库类型' }]">
                <a-select v-model:value="formData.dbType" allowClear
                    @change="(value) => syncChange(value, 'dbTypeText')" label-in-value
                    :options="getDictItemsByCode('database')" style="width: 100%;">
                </a-select>
            </a-form-item>
            <a-form-item label="驱动类" name="dbDriver" :rules="[{ required: true, message: '请输入驱动类' }]">
                <a-input v-model:value="formData.dbDriver" />
            </a-form-item>
            <a-form-item label="主机" name="hostName" :rules="[{ required: true, message: '请输入主机' }]">
                <a-input v-model:value="formData.hostName" />
            </a-form-item>
            <a-form-item label="端口号" name="port" :rules="[{ required: true, message: '请输入端口号' }]">
                <a-input v-model:value="formData.port" />
            </a-form-item>
            <a-form-item label="数据库" name="dbName" :rules="[{ required: true, message: '请输入数据库名' }]">
                <a-input v-model:value="formData.dbName" />
            </a-form-item>
            <a-form-item v-if="formData.dbType == '1'" label="模式名" name="schema" :rules="[{ required: true, message: '请输入模式名' }]">
                <a-input v-model:value="formData.schema" />
            </a-form-item>
            <a-form-item label="数据源地址" name="dbUrl" :rules="[{ required: true, message: '请输入数据源地址' }]">
                <a-input v-model:value="formData.dbUrl" />
            </a-form-item>
            <a-form-item label="用户名" name="dbUsername" :rules="[{ required: true, message: '请输入用户名' }]">
                <a-input v-model:value="formData.dbUsername" />
            </a-form-item>
            <a-form-item label="密码" name="dbPassword" :rules="[{ required: true, message: '请输入密码' }]">
                <a-input-password v-model:value="formData.dbPassword" style="width: 70%;" />
                <a-button type="link" @click="onTestConnection">测试连接</a-button>
            </a-form-item>

            <a-form-item label="备注" name="remark">
                <a-textarea v-model:value="formData.remark" placeholder="输入备注" :rows="4" />
            </a-form-item>
        </a-form>

    </a-drawer>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue';
import { ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils";
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "弹出框"
    },
    id: {
        type: String,
        default: ""
    }
})
enum api {
    addUrl = '/api/zrzy-system/sys/datasource/add',
    updateUrl = '/api/zrzy-system/sys/datasource/update',
    testUrl = '/api/zrzy-system/sys/datasource/testConnection',
    queryByIdUrl = '/api/zrzy-system/sys/datasource/queryById'
}
// let { ...restConfig } = props.dataInfo
let formData = ref<any>({})
let open = ref(props.open)
const emit = defineEmits(["ok"])
initData()
function initData() {
    if (props.id != "") {
        defHttp.get({ url: api.queryByIdUrl + "?id=" + props.id, params: {} }, { withToken: true }).then((res) => {
            if (res.success) {
                formData.value = res.result
            }
        }).catch(err => {
            console.info(err)
        })
    }
}
/**
 * 保存
 */
function onOk() {
    // 执行保存
    let url = api.addUrl
    let methodType = 'add'
    if (formData.value.hasOwnProperty("id")) {
        url = api.updateUrl
        methodType = 'update'
    }
    defHttp.post({ url: url, data: formData.value }, { withToken: true }).then((res) => {
        message.success("保存成功")
        if (methodType == 'add') {
            emit("ok", { isAdd: true })
        } else {
            emit("ok", { isAdd: false })
        }
    }).catch(err => {
        console.info(err)
    })
}
function onTestConnection() {
    defHttp.post({ url: api.testUrl, data: formData.value }, { withToken: true }).then((res) => {
        message.info(res?.message)
    }).catch(err => {
        console.info(err)
    })
}
function syncChange(value: any, syn: string) {
    const dbType = value.label
    formData.value["dbType"] = value.key
    formData.value[syn] = dbType
    const datasourceInfo: any = dataSources.find((item) => item.dbType == dbType)
    formData.value.dbDriver = datasourceInfo.dbDriver
    formData.value.dbUrl = datasourceInfo.dbUrl
    formData.value.schema = ''
}
const dataSources = [
    { dbType: "MYSQl5.8", dbDriver: "com.mysql.cj.jdbc.Driver", dbUrl: "jdbc:mysql://127.0.0.1:3306/demo?characterEncoding=UTF-8&useUnicode=true&useSSL=false&tinyInt1isBit=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai" },
    { dbType: "达梦", dbDriver: "dm.jdbc.driver.DmDriver", dbUrl: "jdbc:dm://121.40.156.34:5236?schema=dzzwxt&serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8&useSSL=truevcxs" },
    { dbType: "SQL Server", dbDriver: "com.microsoft.sqlserver.jdbc.SQLServerDriver", dbUrl: "jdbc:sqlserver://127.0.0.1:1433;SelectMethod=cursor;DatabaseName=demo" },
    { dbType: "Oracle", dbDriver: "oracle.jdbc.OracleDriver", dbUrl: "jdbc:oracle:thin:@127.0.0.1:1521:ORCL" },
    { dbType: "PostgreSQL", dbDriver: "org.postgresql.Driver", dbUrl: "jdbc:postgresql://127.0.0.1:5432/demo" }
]
function onClose() {
    // 执行取消
    emit("ok", { isAdd: false })
}
</script>

<style lang="less" scoped></style>
