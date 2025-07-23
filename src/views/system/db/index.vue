<template>
    <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            当前获取到的更新版本号： <span style="color: dodgerblue;padding-left: 20px;">{{ sqlInfo.sqlVersion }}</span>
            <a @click="jumpUrl" title="点击跳转" v-if="sqlInfo.status != 0"
                style="color: dodgerblue;padding-left: 20px;">已执行过，具体请到DB更新日志中查看</a>
        </a-form-item>
        <a-form-item label="数据源">
            <a-select v-model:value="sqlInfo.dbKey" :options="dataSources" allow-clear style="width: 100%;"
                @change="handleDb" />
        </a-form-item>
        <a-form-item label="sql内容">
            <!-- <a-textarea v-model:value="sqlInfo.sqlContent" placeholder="sql语句" :rows="8" /> -->
            <monaco-editor v-model="sqlInfo.sqlContent" language="sql" theme="vs" style="width: 100%;" height="500px">
            </monaco-editor>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
            <a-space>
                <a-button type="primary" @click="execSql" v-if="sqlInfo.status == 0">执行sql</a-button>
                <a-button type="primary" @click="rollbackSql" v-if="sqlInfo.status == 1">回滚</a-button>
            </a-space>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
            <a-row>
                <a-col :span="14">
                    <div class="desc">
                        <p style="font-size: 16px">
                            <strong>回滚脚本生成:</strong>
                        </p>
                        <p>
                            <CheckCircleOutlined :style="{ color: '#389e0d' }" />
                            跳过注释和空行
                            <a>以分号作为语句结束符</a>
                        </p>
                        <p>
                            <CheckCircleOutlined :style="{ color: '#389e0d' }" />
                            对于新增表CREATE TABLE，生成 <a>DROP TABLE </a>
                        </p>
                        <p>
                            <CheckCircleOutlined :style="{ color: '#389e0d' }" />
                            修改表名RENAME TO，生成 <a>RENAME TO </a> 回滚语句
                        </p>
                        <p>
                            <CheckCircleOutlined :style="{ color: '#389e0d' }" />
                            新增字段ADD COLUMN，生成 <a>DROP COLUMN </a> 回滚语句
                        </p>
                        <p>
                            <CheckCircleOutlined :style="{ color: '#389e0d' }" />
                            修改字段名RENAME COLUMN TO，生成 <a>RENAME COLUMN TO </a> 回滚语句
                        </p>
                        <!-- <p>
                            <CloseCircleOutlined :style="{ color: 'red' }" />
                            对于UPDATE，生成反向 <a>UPDATE</a> 回滚语句【尚未实现】
                        </p> -->

                    </div>
                </a-col>
                <a-col :span="10">
                    <div class="desc">
                        <p style="font-size: 16px">
                            <strong>不生成回滚脚本:</strong>
                        </p>
                        <p>
                            <CloseCircleOutlined :style="{ color: 'red' }" />
                            跳过注释和空行
                            <a>以分号作为语句结束符</a>
                        </p>
                        <p>
                            <CloseCircleOutlined :style="{ color: 'red' }" />
                            查询类不生成
                        </p>
                        <p>
                            <CloseCircleOutlined :style="{ color: 'red' }" />
                            对于增加注释COMMENT ON COLUMN<a>不生成</a>
                        </p>
                        <p>
                            <CloseCircleOutlined :style="{ color: 'red' }" />
                            对于UPDATE，暂不生成反向 <a>UPDATE</a> 回滚语句 <a>
                                <ArrowRightOutlined />更新情况较多，且存在数据量较大的状况
                            </a>
                        </p>
                        <p>
                            <CloseCircleOutlined :style="{ color: 'red' }" />
                            调整字段长度不生成
                        </p>
                    </div>
                </a-col>
            </a-row>
        </a-form-item>
        <!-- 记录执行记录：每次执行的脚本及对应的回滚脚本 -->
    </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import monacoEditor from '/@/components/monaco/monacoEditor.vue'
import { message } from 'ant-design-vue';
import { router } from '/@/router';
import { CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
let sqlInfo: any = ref({})
let dataSources = ref([])
getDataSources()
getSqlInfo()
function jumpUrl() {
    router.push('/online/report/view/1947246854286385154')
}
async function getDataSources() {
    const res = await defHttp.get({ url: '/api/zrzy-system/sys/datasource/options' }, { withToken: true })
    dataSources.value = res.result
}
function handleDb() {
    defHttp.post({ url: '/api/zrzy-system/sys/db/checkExec', data: sqlInfo.value }, { withToken: true }).then((res) => {
        if (res.success) {
            sqlInfo.value.status = res.result.status
        } else {
            message.error(res?.message)
        }
    }).catch(err => {
        message.error(err.message)
    })
}
/**
 * 执行sql
 */
function getSqlInfo() {
    defHttp.get({ url: '/api/zrzy-system/sys/db/info' }, { withToken: true }).then((res) => {
        if (res.success) {
            sqlInfo.value = res.result
            // message.success('执行成功')
        } else {
            message.error(res?.message)
        }
    }).catch(err => {
        message.error(err.message)
    })
    console.log(sqlInfo.value)
}
/**
 * 执行sql
 */
function execSql() {
    defHttp.post({ url: '/api/zrzy-system/sys/db/execSql', data: sqlInfo.value }, { withToken: true }).then((res) => {
        if (res.success) {
            sqlInfo.value = res.result
            message.success('执行成功')
        } else {
            message.error(res?.message)
        }
    }).catch(err => {
        message.error(err.message)
    })
}
function rollbackSql() {
    defHttp.post({ url: '/api/zrzy-system/sys/db/rollback', params: { id: sqlInfo.value.id } }, { withToken: true }).then((res) => {
        if (res.success) {
            message.success('回滚成功')
        } else {
            message.error(res?.message)
        }
    }).catch(err => {
        message.error(err.message)
    })
}
</script>

<style scoped lang="less">
.desc {
    left: 300px;
}
</style>