<template>
    <a-button type="primary" size="small" style="margin-bottom: 8px;float: right;" @click="handleAdd"
        :icon="h(PlusOutlined)">表单</a-button>
    <a-table bordered :data-source="dataSource" :columns="columns" :pagination="false">
        <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.dataIndex === 'operation'">
                <span v-if="editableData[record.id]">
                    <a @click="save(record.id)">保存</a>
                    <a-divider type="vertical" />
                    <a-popconfirm title="确定取消吗?" @confirm="cancel(record.id)">
                        <a>取消</a>
                    </a-popconfirm>
                </span>
                <span v-else>
                    <a @click="edit(record.id)">编辑</a>
                </span>
                <a-divider type="vertical" />
                <a-popconfirm v-if="dataSource.length" title="确定删除?" @confirm="onDelete(record.id, index)">
                    <a style="color:#ff4d4f">删除</a>
                </a-popconfirm>
            </template>
            <template v-else>
                <template v-if="editableData[record.id]">
                    <a-input v-if="column.componentType == 'input'"
                        v-model:value="editableData[record.id][column.dataIndex]" style="margin: -5px 0" />
                    <a-select v-else-if="column.componentType == 'select'" :options="getDictItemsByCode(column.dict)"
                        v-model:value="editableData[record.id][column.dataIndex]" style="width: 100%;margin: -5px 0" />
                    <div v-else>
                        {{ text }}
                    </div>
                </template>
                <div class="select-noboder" v-else>
                    <a-select v-if="column.componentType == 'select'" :options="getDictItemsByCode(column.dict)"
                        v-model:value="record[column.dataIndex]"
                        style="width: 100%;margin: -5px 0;border: 0px !important;background-color: #fff;" disabled />
                    <div v-else>
                        {{ text }}
                    </div>
                </div>
            </template>
        </template>
    </a-table>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es';
import { reactive, ref, h, watch } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import Enumerable from 'linq';
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
const props = defineProps({
    nodeData: {
        type: Object,
        default: () => ({})
    }
});
const options: any = {
    anlx: [
        {
            value: '1',
            label: '按钮'
        },
        {
            value: '2',
            label: '列表'
        }
    ],
    isPl: [
        {
            value: '1',
            label: '是'
        },
        {
            value: '0',
            label: '否'
        }
    ],
    isZd: [
        {
            value: '1',
            label: '是'
        },
        {
            value: '0',
            label: '否'
        }
    ]
}
const columns = [
    {
        title: '表单',
        dataIndex: 'vfdtitle',
        width: 250,
        align: 'center',
        componentType: 'input'
    },
    {
        title: '表单地址',
        dataIndex: 'vfd',
        width: 250,
        componentType: 'input'
    },
    {
        title: '批量',
        dataIndex: 'ispl',
        align: 'center',
        componentType: 'select',
        dict: 'yn'
    },
    {
        title: '只读',
        dataIndex: 'iszd',
        align: 'center',
        componentType: 'select',
        dict: 'yn'
    },
    {
        title: '权利人分类',
        dataIndex: 'qlrfl',
        align: 'center',
        componentType: 'select',
        dict: 'qlrfl'
    },
    {
        title: '顺序',
        dataIndex: 'order_num',
        width: 80,
        align: 'center',
        componentType: 'input'
    },
    {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        width: 210
    },
];

let dataSource: any = ref([])
let bdList = ref([
    {
        id: '1',
        qllx: '3',
        vfdtitle: '收件信息',
        vfd: '/tddj',
        ispl: '1',
        iszd: '1',
        qlrfl: 'CQSC',
        order_num: 1
    },
    {
        id: '2',
        qllx: '4',
        vfdtitle: '土地信息',
        vfd: '/tddj',
        ispl: '0',
        iszd: '1',
        qlrfl: 'CQSC',
        order_num: 1
    }
])
dataSource.value = bdList.value
/** 监控qllx 权利类型切换时，重新加载对应的表单数据 **/
watch(props.nodeData, (newValue, _oldValue) => {
    dataSource.value = bdList.value.filter((item: any) => item.qllx == newValue.qllx)
});

/** 行编辑所需要代码 begin **/
const editableData: any = reactive({});
const edit = (key: string) => {
    editableData[key] = cloneDeep(dataSource.value.filter((item: any) => key == item.id)[0]);
};
/** 保存行数据 **/
const save = (key: string) => {
    Object.assign(dataSource.value.filter((item: any) => key == item.id)[0], editableData[key]);
    delete editableData[key];
};
/** 取消 **/
const cancel = (key: string) => {
    delete editableData[key];
};
/** 删除 **/
const onDelete = (key: string, index: number) => {
    delete editableData[key];
    if (key.includes('l')) {
        dataSource.value.splice(index, 1);// 尚未保存到数据库
    } else {
        // 删除数据库该记录行
    }
};
/** 行编辑所需要代码 end **/
const handleAdd = () => {
    let max = 0
    if (dataSource.value.length > 0)
        max = Enumerable.from(dataSource.value).max((item: any) => item.order_num);
    const id = 'l' + new Date().getTime().toString();
    const newData = {
        id: id,
        vfdtitle: '',
        vfd: '',
        ispl: '1',
        iszd: '1',
        qlrfl: '',
        order_num: max + 1,
    };
    dataSource.value.push(newData);
    editableData[id] = cloneDeep(newData);
};
</script>

<style scoped lang="less">
.select-noboder {
    ::v-deep(.ant-select) {
        .ant-select-selector {
            border: 0px;
            background: #fff;
            color: rgba(0, 0, 0, 0.88);
        }
    }
}
</style>