<template>
    <!-- <c-basic-modal :open="open" :title="title" @ok="handleOk"></c-basic-modal> -->
    <a-modal v-model:open="open" :title="title" @ok="handleOk" @cancel="onCancel">
        <a-form :model="formData" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
            <a-form-item label="名称" name="dictName" :rules="[{ required: true, message: '请输入字典名称!' }]">
                <a-input v-model:value="formData.dictName" />
            </a-form-item>

            <a-form-item label="值" name="dictCode" :rules="[{ required: true, message: '请输入字典编码,只能为字母!' }]">
                <a-input v-model:value="formData.dictCode" />
            </a-form-item>

            <a-form-item label="状态" name="status" :rules="[{ required: true, message: '请选择字典状态' }]">
                <a-switch v-model:checked="formData.status" checkedValue="1" unCheckedValue="0"></a-switch>
            </a-form-item>

            <a-form-item label="描述" name="description">
                <a-textarea v-model:value="formData.description" placeholder="输入描述" :rows="4" />
            </a-form-item>
            <a-form-item label="排序" name="description">
                <a-input-number id="inputNumber" v-model:value="formData.sort" :min="0" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue';
import { ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { updateHasChild } from '/@/api/sys/dict';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "弹出框"
    },
    dataInfo: {
        type: Object,
        default: {}
    }
})

let { hasChild, key, ...restConfig } = props.dataInfo
let formData = ref<any>(restConfig)
let open = ref(props.open)
const emit = defineEmits(["ok"])
/**
 * 保存
 */
function handleOk() {
    // 执行保存
    let url = '/api/zrzy-bdc/sys/dict/insertOrUpdate'
    formData.value.delFlag = 0
    defHttp.post({ url: url, data: formData.value }, { withToken: true }).then((res) => {
        if (res.result) {
            message.success("保存成功")
            if (formData.value.dictType == "1") {//分类字典
                //将父级的children置空
                updateHasChild(props.dataInfo.parentId, "1")
                // updateHasChild()
                emit("ok", { isAdd: true, refreshParentPage: true })
            } else {
                emit("ok", { isAdd: true })
            }
        }
        else {
            message.error("保存失败")
        }
    }).catch(err => {
        console.info(err)
    })
}
function onCancel() {
    // 执行取消
    emit("ok", { isAdd: false })
}
</script>

<style lang="less" scoped></style>
