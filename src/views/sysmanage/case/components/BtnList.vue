<template>
    <div class="header-css">
        <OrderedListOutlined /> 按钮配置
        <a-button type="primary" size="small" style="margin-bottom: 8px;float: right;" @click="handleAdd"
            :icon="h(PlusOutlined)">按钮</a-button>
    </div>

    <a-table bordered :data-source="dataSource" :columns="columns" :pagination="false">
        <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.dataIndex === 'operation'">
                <span v-if="editableData[record.id]">
                    <a @click="save(record.id)">保存</a>
                    <a-divider type="vertical" />
                    <a-popconfirm title="确定取消编辑吗?" @confirm="cancel(record.id)">
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
                    <a-select v-else-if="column.componentType == 'select'"
                        v-model:value="editableData[record.id][column.dataIndex]"
                        :options="getDictItemsByCode('funbtn')" :field-names="{ label: 'labelplus', value: 'value' }"
                        allowClear style="width: 100%;margin: -5px 0" />
                    <div v-else>
                        {{ text }}
                    </div>
                </template>
                <div class="select-noboder" v-else>
                    <a-select v-if="column.componentType == 'select'" :options="options[column.dict]"
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
import { reactive, ref, h } from 'vue';
import { PlusOutlined, OrderedListOutlined } from '@ant-design/icons-vue';
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
import Enumerable from 'linq';
getDictItemsByCode('FUNBTN')
const options: any = {
    anlx: [
        {
            value: 'save',
            label: '保存(save)'
        },
        {
            value: 'card',
            label: '证号(card)'
        }
    ]
}
const columns = [
    {
        title: '按钮类型',
        dataIndex: 'btnType',
        width: 250,
        align: 'center',
        componentType: 'select',
        dict: 'anlx'
    },
    {
        title: '按钮名称',
        dataIndex: 'btnName',
        align: 'center',
        width: 250,
        componentType: 'input'
    },
    {
        title: '参数',
        dataIndex: 'params',
        align: 'center',
        componentType: 'input'
    },
    {
        title: '顺序',
        dataIndex: 'sxh',
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
const dataSource: any = ref([
    {
        id: '1',
        btnType: 'card',
        btnFun: '',
        btnName: '生成证号',
        params: '1,2',
        sxh: 1,
    },
]);

/** 行编辑所需要代码 begin **/
const editableData: any = reactive({});
const edit = (key: string) => {
    editableData[key] = cloneDeep(dataSource.value.filter((item: any) => key == item.id)[0]);
};
const save = (key: string) => {
    Object.assign(dataSource.value.filter((item: any) => key == item.id)[0], editableData[key]);
    delete editableData[key];
};
const cancel = (key: string) => {
    delete editableData[key];
};
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
        max = Enumerable.from(dataSource.value).max((item: any) => item.sxh);
    const id = 'l' + new Date().getTime().toString();
    const newData = {
        id: id,
        btnType: '',
        btnFun: '',
        btnName: '',
        params: '',
        sxh: max + 1,
    };
    dataSource.value.push(newData);
    editableData[id] = cloneDeep(newData);
};
</script>

<style scoped lang="less">
.header-css {
    padding: 10px 0;
    color: rgba(0, 0, 0, 0.88);
    font-weight: 600;
    font-size: 14px;
}

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