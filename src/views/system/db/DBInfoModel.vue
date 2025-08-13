<template>
    <a-form layout="vertical">

        当前版本号： <span style="color: dodgerblue;padding-left: 10px;">{{ sqlInfo.sqlVersion }}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;
        数据源: <span>{{ sqlInfo.dbKey }}</span>
        <p style="color: #6c727f !important;">执行人：{{ sqlInfo.createBy }}
            <a-divider type="vertical" />{{
            sqlInfo.createTime }}
        </p>
        <a-form-item label="执行脚本">
            <monaco-editor v-model="sqlInfo.sqlContent" language="sql" theme="vs" style="width: 100%;" height="500px">
            </monaco-editor>
        </a-form-item>
        <p style="color: #6c727f !important;">回滚人：{{ sqlInfo.updateBy }}
            <a-divider type="vertical" />{{
            sqlInfo.updateTime }}
        </p>
        <a-form-item label="回滚脚本">
            <monaco-editor v-model="sqlInfo.rollbackSqlContent" language="sql" theme="vs" style="width: 100%;"
                height="500px">
            </monaco-editor>
        </a-form-item>

    </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import monacoEditor from '/@/components/monaco/monacoEditor.vue'
import { message } from 'ant-design-vue';
const props = defineProps({
    formData: {
        type: Object,
        default: {}
    }
});
let sqlInfo: any = ref({})
getSqlInfo()
/**
 * 执行sql
 */
function getSqlInfo() {
    defHttp.get({ url: '/api/zrzy-bdc/sys/db/getById', params: { id: props.formData.id } }, { withToken: true }).then((res) => {
        if (res.success) {
            sqlInfo.value = res.result
        } else {
            message.error(res?.message)
        }
    }).catch(err => {
        message.error(err.message)
    })
    console.log(sqlInfo.value)
}
</script>

<style scoped lang="less"></style>