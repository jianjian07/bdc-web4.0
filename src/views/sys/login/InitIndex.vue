<template>
    <div class="content">
        <a-row style="height: 100%;">
            <a-col :span="12" style="">
                <img src="/@/assets/images/login/bg06.jpg" class="rounded">
            </a-col>
            <a-col :span="12" style="padding-top: 10px;">
                <!--  layout="vertical" -->
                <!-- :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" -->
                <a-tabs v-model:activeKey="activeKey" style="padding: 10px; height: 100%;">
                    <a-tab-pane key="license" tab="授权">
                         <license-index :isInit="true" />
                    </a-tab-pane>
                    <a-tab-pane key="datasource" tab="数据库">
                        <a-form style="margin: 10px;" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <a-form-item label="IP">
                        <a-input v-model:value="initData.clientIp" />
                    </a-form-item>
                    <a-form-item label="数据库密码加密">
                        <a-row style="height: 100%;margin-bottom: 12px">
                            <a-col :span="17" style="">
                                <a-input v-model:value="initData.dbPwd" allowClear/>
                            </a-col>
                            <a-col :span="7">
                                <a-space style="padding-left: 15px">
                                    <a-button type="primary" html-type="submit" @click="encryptDbPwd">加密</a-button>
                                    <a-button type="primary" html-type="submit" @click="decryptDbPwd">解密</a-button>
                                </a-space>
                            </a-col>
                        </a-row>

                        <a-textarea v-model:value="initData.encryptDbPwd" :auto-size="{ minRows: 2, maxRows: 5 }"
                            style="margin-top: 8px;" />
                    </a-form-item>
                </a-form>
                    </a-tab-pane>
                </a-tabs>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { defHttp } from '/@/utils/http/axios';
import licenseIndex from '/@/views/system/license/index.vue'
import { ref } from 'vue';

let initData = ref<any>({})
let activeKey = ref<string>('license')
enum api {
    getUrl = '/api/zrzy-system/sys/common/get',
    encryptUrl = '/api/zrzy-system/sys/common/encrypt',
    decryptUrl = '/api/zrzy-system/sys/common/decrypt',
}
defHttp.get({ url: api.getUrl }, { withToken: false }).then((res) => {
    if (res && res.success) {
        initData.value = res.result
    }
})
function encryptDbPwd() {
    defHttp.get({ url: api.encryptUrl, params: { str: initData.value.dbPwd } }, { withToken: false }).then((res) => {
        initData.value.encryptDbPwd = res
    })
}
function decryptDbPwd() {
    defHttp.get({ url: api.decryptUrl, params: { str: initData.value.dbPwd } }, { withToken: false }).then((res) => {
        initData.value.encryptDbPwd = res
    })
}
</script>

<style scoped lang="less">
.content {
    padding: calc(1.875rem * 0.5);
    // border: 1px solid yellowgreen;
    height: 100vh;
    width: 90%;
}

.rounded {
    border-radius: 0.5rem !important;
    width: 100%;
}
</style>
