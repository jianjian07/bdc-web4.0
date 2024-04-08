<template>
    <!-- <c-generate-form :data="data"></c-generate-form> -->
    <CGenerateReportV3 :data="data"></CGenerateReportV3>
</template>
<script setup lang="ts">
// import CGenerateForm from './modules/GenerateForm.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
const data: any = {
    "list": [
        {
            "type": "grid",
            "icon": "grid",
            "columns": [
                {
                    "type": "col",
                    "key": "col",
                    "options": {
                        "span": 12,
                        "offset": 0,
                        "push": 0,
                        "pull": 0,
                        "xs": 24,
                        "sm": 12,
                        "md": 12,
                        "lg": 12,
                        "xl": 12
                    },
                    "list": [
                        {
                            "id": "c828f0c0-cb70-e86c-5e52-f7ec5997e63e",
                            "type": "input",
                            "compType": "report",
                            "name": "编号",
                            "icon": "input",
                            "required": false,
                            "width": "100%",
                            "extended": "",
                            "prefix": "",
                            "suffix": "",
                            "rules": [],
                            "key": "15e38948-b8e0-a99a-9f31-bbf2a5946abf",
                            "model": "ceshi.code",
                            "searchType": "eq"
                        }
                    ]
                },
                {
                    "type": "col",
                    "key": "754c89d8-9d04-e102-0751-823e128454a4",
                    "options": {
                        "span": 12,
                        "offset": 0,
                        "push": 0,
                        "pull": 0,
                        "xs": 24,
                        "sm": 12,
                        "md": 12,
                        "lg": 12,
                        "xl": 12
                    },
                    "list": [
                        {
                            "id": "02b1091a-dcf8-e3c9-c052-2d30489def15",
                            "type": "button",
                            "compType": "report",
                            "name": "按钮",
                            "icon": "btn",
                            "buttonType": "primary",
                            "beforeIcon": "",
                            "extended": "@click=\"search\"",
                            "events": {
                                "onclick": ""
                            },
                            "key": "4af20113-72c7-6ca4-f26a-34e185681a33"
                        }
                    ]
                }
            ],
            "options": {
                "gutter": 0,
                "justify": "start",
                "align": "top",
                "customClass": "",
                "hidden": false,
                "flex": true,
                "responsive": true,
                "remoteFunc": "",
                "remoteOption": "",
                "tableColumn": false,
                "subform": false
            },
            "name": "栅格布局",
            "key": "cef2ddd1-4be8-2a6a-5676-03142f71e9d2",
            "model": "",
            "id": "1fdfda3f-1869-455a-b8af-3a5e9b77a2d4"
        },
        {
            "type": "table",
            "name": "列表",
            "key": "95ec818b-a9bf-1924-ee66-b15f68b4ddde",
            "icon": "table",
            "model": "ceshi",
            "isedit": false,
            "options": {
                "pagination": true,
                "pageSize": 5,
                "showAction": true
            },
            "action": [
                {
                    "title": "",
                    "oper": ""
                }
            ],
            "tableColumns": [
                {
                    "key": "column-7132691a-e7e9-e67c-f8f7-c90c4e3772b1",
                    "title": "id",
                    "dataIndex": "id",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                },
                {
                    "key": "column-a1333a9c-1050-dd65-e30b-30091b2c782f",
                    "title": "code",
                    "dataIndex": "code",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                },
                {
                    "key": "column-7b4bec60-763a-df42-c279-97636b88b2c7",
                    "title": "title",
                    "dataIndex": "title",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                },
                {
                    "key": "column-e45e0389-23b2-3580-82af-f8463342ec64",
                    "title": "dbType",
                    "dataIndex": "dbType",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                },
                {
                    "key": "column-611cab58-c902-67d0-261c-cfaa0f30b2a7",
                    "title": "isLoad",
                    "dataIndex": "isLoad",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                },
                {
                    "key": "column-dbaaf7c2-b8fc-e41b-d53e-d6b2ada52c95",
                    "title": "content",
                    "dataIndex": "content",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                },
                {
                    "key": "column-82281103-a8f8-a16a-7723-7a98ee8c9fc9",
                    "title": "tableName",
                    "dataIndex": "tableName",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                },
                {
                    "key": "column-60b55dd8-13b6-b20e-2666-56a3f7bc7821",
                    "title": "dataSource",
                    "dataIndex": "dataSource",
                    "width": "auto",
                    "options": {
                        "hidden": false
                    }
                }
            ],
            "extended": "",
            "id": "a200dcd6-1325-cfaa-79a7-d68f323b55f5"
        }
    ],
    "config": {
        "layout": "horizontal",
        "baseScript": "",
        "dataSource": [],
        "eventScript": [
            {
                "key": "base",
                "name": "全局变量定义",
                "func": "// const a=1",
                "param": ""
            },
            {
                "key": "mounted002",
                "name": "mounted",
                "func": "console.info('new fun')",
                "param": ""
            }
        ]
    }
}

onMounted(() => {
    const route = useRoute();
    const code = ref(route.params?.code);
    console.log('code:', code.value)
})
</script>