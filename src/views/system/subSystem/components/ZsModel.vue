<template>
    <div style="padding: 16px; max-width: 640px;">
        <a-alert v-if="activeId" type="info" show-icon style="margin-bottom: 12px;">
            <template #message>
                {{ isTenant ? '租户' : '系统' }}证书信息配置：
                <b>{{ isTenant ? selectInfo?.name : selectSystem?.name }}</b>
            </template>
        </a-alert>
        <a-spin :spinning="spinning">
            <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }"
                layout="horizontal">
                <a-form-item label="省简称" name="provinceShort" :rules="[{ required: true, message: '请输入省简称' }]">
                    <a-input v-model:value="formState.provinceShort" placeholder="请输入省简称，如：浙" :maxlength="20" />
                </a-form-item>
                <a-form-item label="市简称" name="cityShort" :rules="[{ required: true, message: '请输入市简称' }]">
                    <a-input v-model:value="formState.cityShort" placeholder="请输入市简称，如：杭" :maxlength="20" />
                </a-form-item>
                <a-form-item label="证号开头数字" name="startNum" :rules="[{ required: true, message: '请输入证号开头数字' }]">
                    <a-input-number v-model:value="formState.startNum" :min="0" :precision="0" style="width: 100%;"
                        placeholder="请输入证号开头数字" />
                </a-form-item>
                <a-form-item label="发证机构" name="fzjg" :rules="[{ required: true, message: '请输入发证机构' }]">
                    <a-input v-model:value="formState.fzjg" placeholder="请输入发证机构名称" :maxlength="100" />
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 6, span: 16 }">
                    <a-button type="primary" :loading="saving" @click="onSave">保存</a-button>
                    <a-button style="margin-left: 8px;" @click="onReset">重置</a-button>
                </a-form-item>
            </a-form>
        </a-spin>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';

const props = defineProps({
    // 子系统（系统级配置）来源：subSystem 页面
    selectSystem: {
        type: Object,
        default: null,
    },
    // 租户（租户级配置）来源：tenant 页面
    selectInfo: {
        type: Object,
        default: null,
    },
});
const urlList = {
    queryBySystem: '/api/zrzy-bdc/bdc/zsxxConfig/queryBySystem',
    save: '/api/zrzy-bdc/bdc/zsxxConfig/save',
};

const spinning = ref<boolean>(false);
const saving = ref<boolean>(false);
const formRef = ref();

// 租户级配置优先：有租户则按租户，否则按系统
const isTenant = computed(() => !!props.selectInfo?.id);
const activeId = computed(() => (isTenant.value ? props.selectInfo.id : props.selectSystem?.id));

const formState = reactive({
    id: undefined as number | undefined,
    systemId: undefined as number | undefined,
    tenantId: undefined as number | undefined,
    provinceShort: '',
    cityShort: '',
    startNum: undefined as number | undefined,
    fzjg: '',
});

watch(
    () => [props.selectSystem, props.selectInfo],
    () => {
        if (activeId.value) {
            loadConfig();
        } else {
            resetForm();
        }
    },
    { immediate: true }
);

function resetForm() {
    formState.id = undefined;
    formState.systemId = undefined;
    formState.tenantId = undefined;
    formState.provinceShort = '';
    formState.cityShort = '';
    formState.startNum = undefined;
    formState.fzjg = '';
    formRef.value?.clearValidate();
}

function buildQueryParams() {
    return isTenant.value
        ? { tenantId: props.selectInfo.id }
        : { systemId: props.selectSystem.id };
}

function loadConfig() {
    if (!activeId.value) {
        return;
    }
    spinning.value = true;
    defHttp
        .get(
            {
                url: urlList.queryBySystem,
                params: buildQueryParams(),
            },
            { withToken: true }
        )
        .then((res: any) => {
            if (res?.success) {
                const data = res.result || {};
                formState.id = data.id;
                formState.systemId = data.systemId;
                formState.tenantId = data.tenantId;
                formState.provinceShort = data.provinceShort || '';
                formState.cityShort = data.cityShort || '';
                formState.startNum = data.startNum;
                formState.fzjg = data.fzjg || '';
            } else {
                message.warning(res?.message || '查询证书信息配置失败');
            }
        })
        .finally(() => {
            spinning.value = false;
        });
}

function onSave() {
    formRef.value
        ?.validate()
        .then(() => {
            // 根据当前模式写入对应的 systemId / tenantId，另一项置空
            if (isTenant.value) {
                formState.tenantId = props.selectInfo.id;
                formState.systemId = undefined;
            } else {
                formState.systemId = props.selectSystem.id;
                formState.tenantId = undefined;
            }
            saving.value = true;
            defHttp
                .post(
                    {
                        url: urlList.save,
                        data: { ...formState },
                    },
                    { withToken: true }
                )
                .then((res: any) => {
                    if (res?.success) {
                        message.success('保存成功！');
                        if (res.result?.id) {
                            formState.id = res.result.id;
                        }
                    } else {
                        message.warning(res?.message || '保存失败');
                    }
                })
                .finally(() => {
                    saving.value = false;
                });
        })
        .catch(() => {
            // 表单校验未通过
        });
}

function onReset() {
    if (formState.id) {
        loadConfig();
    } else {
        resetForm();
    }
}

defineExpose({
    loadConfig,
});
</script>

<style scoped lang="less"></style>
