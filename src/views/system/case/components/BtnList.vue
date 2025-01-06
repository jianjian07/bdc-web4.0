<template>
    <div class="list-css">
        <div class="header-css">
            <OrderedListOutlined /> 按钮配置
            <a-button type="primary" size="small" style="margin-bottom: 8px;float: right;" @click="handleAdd"
                :icon="h(PlusOutlined)">
                按钮
            </a-button>
        </div>
        <a-table bordered :data-source="btnList" :columns="columns" :pagination="false">
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
                    <a-popconfirm v-if="btnList.length" title="确定删除?" @confirm="onDelete(record.id0, index)">
                        <a style="color:#ff4d4f">删除</a>
                    </a-popconfirm>
                </template>
                <template v-else>
                    <template v-if="editableData[record.id0]">
                        <a-input v-if="column.componentType == 'input'"
                            v-model:value="editableData[record.id0][column.dataIndex]" style="margin: -5px 0" />
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
                        <a-select v-if="column.componentType == 'select'" :bordered="false"
                            :options="getDictItemsByCode(column.dict)" v-model:value="record[column.dataIndex]"
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
import { PlusOutlined, OrderedListOutlined } from '@ant-design/icons-vue';
import { getDictItemsByCode } from '/@/utils/form/commonUtils';
import Enumerable from 'linq';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
const props = defineProps({
    nodeInfo: {
        type: Object,
        default: () => ({})
    }
});
enum api {
    listUrl = '/api/zrzy-bdc/flow/btn/list',
    addUrl = '/api/zrzy-bdc/flow/btn/add',
    updateUrl = '/api/zrzy-bdc/flow/btn/update',
    deleteUrl = '/api/zrzy-bdc/flow/btn/delete'
}
const columns = [
    {
        title: '按钮',
        dataIndex: 'funName',
        width: 200,
        align: 'center',
        componentType: 'select',
        dict: 'funbtn'
    },
    {
        title: '名称',
        dataIndex: 'btnName',
        align: 'center',
        width: 150,
        componentType: 'input'
    },
    {
        title: '参数',
        dataIndex: 'bz',
        align: 'center',
        componentType: 'input'
    },
    {
        title: '位置',
        dataIndex: 'anwz',
        align: 'center',
        width: 100,
        componentType: 'select',
        dict: 'anwz'
    },
    {
        title: '批量',
        dataIndex: 'ispl',
        align: 'center',
        width: 80,
        componentType: 'select',
        dict: 'yn'
    },
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
let btnList: any = ref([])
watch(props.nodeInfo, (_newValue, _oldValue) => {
    getList()
},{
  immediate: true
});
function getList() {
    defHttp.post({ url: api.listUrl, data: { ...props.nodeInfo } }, { withToken: true }).then((res) => {
        if (res.success) {
            btnList.value = res.result;
        }
    });
}

/** 行编辑所需要代码 begin **/
const editableData: any = reactive({});
/** 编辑 **/
const edit = (key: string) => {
    editableData[key] = cloneDeep(btnList.value.filter((item: any) => key == item.id0)[0]);
};
/** 保存 **/
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
            editableData[key].id0 = res.result
            Object.assign(btnList.value.filter(item => key == item.id0)[0], editableData[key]);
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
        btnList.value.splice(index, 1);// 尚未保存到数据库
    } else {
        // 删除数据库该记录行
        defHttp.post({ url: api.deleteUrl, params: { id: key } }, { withToken: true }).then((res) => {
            if (res.success) {
                message.success('删除成功')
                btnList.value.splice(index, 1);
            }
        });
    }
};
/** 行编辑所需要代码 end **/
const handleAdd = () => {
    let max = 0
    if (btnList.value.length > 0)
        max = Enumerable.from(btnList.value).max((item: any) => item.orderNum);
    const id = 'l' + new Date().getTime().toString();
    const newData = {
        id0: id,
        btnType: '',
        funName: '',
        btnName: '',
        bz: '',
        anwz: '',
        ispl: '1',
        orderNum: parseInt(max.toString()) + 1,
    };
    btnList.value.push(newData);
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