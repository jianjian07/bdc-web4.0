<template>
    <div class="list-css">
        <a-button type="primary" size="small" style="margin-bottom: 8px;float: right;" @click="handleAdd"
            :icon="h(PlusOutlined)">表单</a-button>
        <a-table bordered :data-source="dataSource" :columns="columns" :pagination="false">
            <template #bodyCell="{ column, text, record, index }">
                <template v-if="column.dataIndex === 'operation'">
                    <span v-if="editableData[record.id0]">
                        <a @click="save(record.id0)">保存</a>
                        <a-divider type="vertical" />
                        <a-popconfirm title="确定取消编辑吗?" @confirm="cancel(record.id0)">
                            <a>取消</a>
                        </a-popconfirm>
                    </span>
                    <span v-else>
                        <a @click="edit(record.id0)">编辑</a>
                    </span>
                    <a-divider type="vertical" />
                    <a-popconfirm v-if="dataSource.length" title="确定删除?" @confirm="onDelete(record.id0, index)">
                        <a style="color:#ff4d4f">删除</a>
                    </a-popconfirm>
                </template>
                <template v-else>
                    <template v-if="editableData[record.id0]">
                        <a-input v-if="column.componentType == 'input'"
                            v-model:value="editableData[record.id0][column.dataIndex]"
                            @blur="column.blur ? searchFormInfo(editableData[record.id0]) : ''" style="margin: -5px 0" />
                        <a-select v-once v-else-if="column.componentType == 'select'"
                            v-model:value="editableData[record.id0][column.dataIndex]"
                            :options="getDictItemsByCode(column.dict)"
                            :field-names="{ label: 'labelplus', value: 'value' }" allowClear
                            style="width: 100%;margin: -5px 0" />
                        <div v-else>
                            {{ text }}
                        </div>
                    </template>
                    <div v-else>
                        <a-select v-once :bordered="false" v-if="column.componentType == 'select'"
                            v-model:value="record[column.dataIndex]" :options="getDictItemsByCode(column.dict)"
                            style="width: 100%;margin: -5px 0;border: 0px !important;background-color: #fff;"
                            disabled />
                        <div v-else>
                            {{ text }}
                        </div>
                    </div>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es';
import { reactive, ref, h, watch } from 'vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import Enumerable from 'linq';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';

enum api {
    listUrl = '/api/zrzy-bdc/flow/vfd/list',
    addUrl = '/api/zrzy-bdc/flow/vfd/add',
    updateUrl = '/api/zrzy-bdc/flow/vfd/update',
    deleteUrl = '/api/zrzy-bdc/flow/vfd/delete',
    queryByCodeUrl = '/api/zrzy-form/form/queryByCode'
}
const props = defineProps({
    nodeInfo: {
        type: Object,
        default: () => ({})
    }
});
const columns = [
    {
        title: '类别',
        dataIndex: 'bdlb',
        align: 'center',
        componentType: 'select',
        width: 100,
        dict: 'ymlb'
    },
    {
        title: '表单名/地址',
        dataIndex: 'vfd',
        width: 180,
        componentType: 'input',
        blur: true
    },
    {
        title: '名称',
        dataIndex: 'vfdtitle',
        width: 150,
        align: 'center',
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
    // {
    //     title: '权利人分类',
    //     dataIndex: 'qlrlb',
    //     align: 'center',
    //     componentType: 'select',
    //     dict: 'qlrfl'
    // },
    {
        title: '顺序',
        dataIndex: 'orderNum',
        width: 80,
        align: 'center',
        componentType: 'input'
    },
    {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        width: 200
    },
];

let dataSource: any = ref([])
let bdList = ref([])
dataSource.value = bdList.value
/** 监控qllx 权利类型切换时，重新加载对应的表单数据 **/
watch(props.nodeInfo, (_newValue, _oldValue) => {
    getList()
}, {
  immediate: true
});
function getList() {
    defHttp.post({ url: api.listUrl, data: { ...props.nodeInfo } }, { withToken: true }).then((res) => {
        if (res.success) {
            dataSource.value = res.result;
        }
    });
}

/** 行编辑所需要代码 begin **/
const editableData: any = reactive({});
const edit = (key: string) => {
    editableData[key] = cloneDeep(dataSource.value.filter((item: any) => key == item.id0)[0]);
};
/** 保存行数据 **/
const save = (key: string) => {
    let _data: any = {}
    Object.assign(_data, editableData[key], props.nodeInfo)
    let _url = api.updateUrl
    if (key.includes('l')) {
        _url = api.addUrl
        _data.id0 = ''
    }
    defHttp.post({ url: _url, data: _data }, { withToken: true }).then((res) => {
        if (res.success) {
            if (key.includes('l')) {
                editableData[key].id0 = res.result
            }
            //    const _index= dataSource.value.findIndex(item => key == item.id0)
            //    dataSource.value[_index]=editableData[key]
            Object.assign(dataSource.value.filter(item => key == item.id0)[0], editableData[key]);
            delete editableData[key];
        }
    });
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
        // 删除数据库该记录行
        defHttp.post({ url: api.deleteUrl, params: { id: key } }, { withToken: true }).then((res) => {
            if (res.success) {
                message.success('删除成功')
                dataSource.value.splice(index, 1);
            }
        });
    }
};
/** 行编辑所需要代码 end **/
const handleAdd = () => {
    let max = 0
    if (dataSource.value.length > 0)
        max = Enumerable.from(dataSource.value).max((item: any) => item.orderNum);
    const id = 'l' + new Date().getTime().toString();
    const newData = {
        id0: id,
        vfdtitle: '',
        vfd: '',
        bdfl: 0,
        ispl: '1',
        iszd: '1',
        // qlrlb: '',
        // qlrlbmc: '',
        orderNum: parseInt(max.toString()) + 1,
    };
    dataSource.value.push(newData);
    editableData[id] = cloneDeep(newData);
};
function searchFormInfo(info) {
    const code = info.vfd;
    defHttp.get({ url: api.queryByCodeUrl, params: { code: code } }, { withToken: true }).then((res) => {
        if (res.success && res.result) {
            info.formId = res.result.id;
            info.vfdtitle = res.result.formName;
        }
    })
}
</script>

<style scoped lang="less">
.list-css {
    ::deep(.ant-table) {

        .ant-table-thead>tr>th,
        .ant-table-tbody>tr>td,
        .ant-table tfoot>tr>th,
        .ant-table tfoot>tr>td {
            padding: 12px 8px;
        }
    }
}
</style>