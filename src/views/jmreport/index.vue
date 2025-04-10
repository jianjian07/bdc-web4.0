<template>
    <div class="wonder-table-form">
        <a-form :label-col="{ style: { width: '100px' } }" :labelWrap="true">
            <a-row :gutter="[0, 8]" tyle="flex">
                <a-col :span="6" :offset="0">
                    <a-form-item label="报表名称">
                        <a-input v-model:value="formData.name" allowClear />
                    </a-form-item>
                </a-col>
                <a-col :span="4" :offset="0">
                    <a-form-item style="text-align: center;">
                        <a-space>
                            <a-button type="primary" @click="loadData('query')">
                                <template #icon>
                                    <component :is="SearchOutlined"></component>
                                </template>查询</a-button>
                            <a-button @click="refreshData">
                                <template #icon>
                                    <component :is="RedoOutlined"></component>
                                </template>重置</a-button>
                        </a-space>
                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>
    </div>
    <div class="wonder-table-css">
        <div class="wonder-table-toolbar">
            <a-button type="primary" @click="addData">
                <template #icon>
                    <plus-outlined />
                </template>
                新建报表
            </a-button>
        </div>
        <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
            @change="onChange($event, loadData)"><template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                        <a @click="editData(record)">编辑</a>
                        <a @click="copyData(record)">复制</a>
                        <a @click="preview(record)">预览</a>
                        <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
                            <a>删除</a>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script lang="ts" setup>
import { defHttp } from "/@/utils/http/axios";
import { ref, onMounted } from "vue";
import { PlusOutlined, SearchOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';


enum Api {
    copyUrl = '/api/zrzy-form/wform/copyData',
}
const columns = [
    { title: "id", dataIndex: "id", width: 150 },
    { title: "报表名称", dataIndex: "name", width: 320, ellipsis: true },
    // { title: "表单编码", dataIndex: "code", width: 150 },
    { title: "报表分类", dataIndex: "typeName", width: 220 },
    { title: "创建时间", dataIndex: "createTime", width: 140 },
    { title: '操作', key: 'action', width: 250, fixed: 'right', }
]
let datalist: any = ref([]);
let formData: any = ref({ name: '', code: '', formType: '' });

let formTypeValue = ref('');
onMounted(() => {
    loadData() // 初始化加载数据
})
let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})
/**
 * 表格数据加载
*/
async function loadData(type?: string | undefined) {
    // 解决翻页后查询不到的问题
    if (type == 'query') {
        pagination.value = {
            total: 0,
            current: 1,
            pageSize: 10,
        }
    }
    let url = '/api/zrzy-form/jmreport/query/report/folder'
    let name = formData.value.name
    name = name ? name.trim() : name
    defHttp.get({ url: url, params: { name: name, pageNo: pagination.value.current, pageSize: pagination.value.pageSize } }, { withToken: false }).then((res) => {
        if (res.success) {
            datalist.value = res.result.records
            pagination.value.total = res.result.total
        }

    }).catch(err => {
        console.info(err)
    })
}
/**
 * 表单分类改变
*/
function onSelect(_value: any, node: any, _extra: any) {
    if (_value == undefined) {
        formTypeValue.value = ''
    } else {
        const array: any = node.children;
        let arrType: any = []
        if (node.children != undefined && array.length > 0) {
            array.forEach((item: any) => {
                arrType.push("'" + item.dict_code + "'")
            });
        }
        const selectValue = "'" + _value + "'"
        if (arrType.length == 0) {
            formTypeValue.value = selectValue
        } else {
            arrType.push(selectValue)
            formTypeValue.value = arrType.join(',')
        }
    }
    pagination.value.current = 1
    loadData()
}
/**
 * 重置
*/
function refreshData() {
    formData.value = {}
    loadData()
}
/**
 * 复制表单
*/
function copyData(record: any) {
    defHttp.get({ url: '/api/zrzy-form/jmreport/reportCopy', params: { id: record.id } }, { withToken: false }).then((res) => {
        if (res.success) {
            message.success('复制成功')
            loadData()
        } else {
            message.error('复制失败')
        }
    }).catch(err => {
        console.info(err)
    })
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
 * 添加表单
*/
function addData() {
    let url = '/api/zrzy-form/jmreport/save'
    defHttp.post({ url: url }, { withToken: false }).then((res) => {
        if (res.success) {
            window.open(`${window.settingConfig.printDomain}/zrzy-form/jmreport/index/` + res.result.id, '_blank')
        }
    }).catch(err => {
        console.info(err)
    })
}
/**
 * 编辑表单
*/
function editData(record) {
    window.open(`${window.settingConfig.printDomain}/zrzy-form/jmreport/index/` + record.id, '_blank')
}
/**
 * 在线预览
 * @param record
 */
function preview(record: any) {
    window.open(`${window.settingConfig.printDomain}/zrzy-form/jmreport/view/` + record.id, '_blank')
}
/**
 * 删除表单
*/
function deleteData(record) {
    // http://192.168.27.87:1004/zrzy-form/jmreport/delete?id=949203339267919872&token=null
    if (!record.id) return
    let url = '/api/zrzy-form/jmreport/delete' // 删除
    defHttp.delete({ url: url, params: { id: record.id } }, { withToken: false }).then((res) => {
        if (res.success) {
            message.success('删除成功')
            loadData()
        } else {
            message.error('删除失败' + res?.message)
        }
    }).catch(err => {
        message.error('删除失败')
    })
}
</script>
<style lang="less" scoped>
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
</style>
