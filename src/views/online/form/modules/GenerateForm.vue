<template>
    <my-component></my-component>
</template>

<script lang="ts" setup>
import { defineComponent, ref } from 'vue'
import { generateHtml } from '../utils/generate';
import { defHttp } from "/@/utils/http/axios";
const props = defineProps({
    data: {
        type: Object,
        default: null
    }
})
const designData: any = props.data
let list = ref(designData.config.eventScript)
const generateData = generateHtml(designData.list)
const columns: any = [...generateData.columns]//拷贝
const MyComponent = defineComponent({
    template: generateData.html,
    props: {
        message: String,
    },
    setup(props) {
        let formData: any = ref([]);
        columns.push({
            title: '操作',
            key: 'action',
        })
        let datalist = ref<any>([])
        let pagination = ref({
            total: 0,
            current: 1,
            pageSize: designData.list.filter((t: { type: string; }) => t.type == "table")[0].options.pageSize,
        })
        // 脚本
        const events = <any>{}
        generateTs();
        return {
            formData,
            pagination,
            datalist,
            columns,
            ...events,
            defHttp,
            onChange
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
         * 自动生成脚本
         */
        function generateTs() {
            for (let i = 0; i < list.value.length; i++) {
                const _data = list.value[i];
                events[_data.name] = newFunction(_data)
            }
        }
        /**
         * 返回函数 带参数 | 不带参数
         * @param _data 
         */
        function newFunction(_data: any) {
            if (_data.param != "") {
                return (params: any) => {
                    eval(_data.func);
                };
            } else {
                return () => {
                    eval(_data.func);
                };
            }
        }
    }
})
</script>