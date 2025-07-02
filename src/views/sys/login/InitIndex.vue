<template>
    <div class="content">
        <a-row style="height: 100%;">
            <a-col :span="12" style="">
                <img src="/@/assets/images/login/bg06.jpg" class="rounded">
            </a-col>
            <a-col :span="12" style="padding-top: 10px;">
                <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
                    <a-form-item label="IP">
                        <a-input v-model:value="initData.clientIp" />
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { defHttp } from '/@/utils/http/axios';
import { ref } from 'vue';

let initData = ref<any>({})
defHttp.get({ url: '/api/zrzy-system/sys/license/get' }, { withToken: false }).then((res) => {
    if (res && res.success) {
        initData.value = res.result
    }
})
</script>

<style scoped lang="less">
.content {
    padding: calc(1.875rem * 0.5);
    // border: 1px solid yellowgreen;
    height: 100vh;
    width: 90%;
    text-align: center;
}

.rounded {
    border-radius: 0.5rem !important;
    width: 100%;
}
</style>