<template>
    <a-upload name="file" :headers="headers" :showUploadList="false" :customRequest="customUpload"
        style="margin: auto 2px;">
        <a>VFD</a>
        <!-- <a-button type="text">
            <upload-outlined></upload-outlined>
            VFD
        </a-button> -->
    </a-upload>
</template>

<script setup lang="ts">
import { vfdToForm } from '/@/views/online/utils/vfd2.0';
import { ref } from 'vue';
import * as convert from 'xml-js';
const props = defineProps({
    formId: {
        type: String,
        default: ''
    }
})
const headers = {
    authorization: 'authorization-text',
};
const loading = ref<boolean>(false);
const imageUrl = ref<string>('');
const fileList = ref([]);

const acceptType = ['application/json'];
const handleChange = (info: any) => {
    // debugger
    if (info.file.status !== 'uploading') {
        console.log('uploading');
    }
    if (info.file.status === 'done') {
        console.log('done');
    } else if (info.file.status === 'error') {
        console.log('error');
    }
}


// 自定义上传
const customUpload = (info: any) => {
    const reader = new FileReader();
    // console.log("表单id" + props.formId);
    reader.onload = (e: any) => {
        const fileContent = e.target.result;
        const jsonData = convert.xml2json(fileContent, { compact: true, spaces: 4 });
        const newdata = JSON.parse(jsonData)
        const str = convert.xml2json(fileContent, { spaces: 4 });
        const data = JSON.parse(str)
        vfdToForm(data, newdata, props.formId)
    };
    reader.readAsText(info.file);
};
</script>

<style scoped lang="less"></style>