<template>
    <!-- type=0 事项目录 -->
    <a-form v-if="data.type === 0" :model="flowInfo" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }"
        autocomplete="off">
        <a-form-item label="目录编码" name="sxbm">
            <a-input v-model:value="flowInfo.code" placeholder="请输入目录编码" />
        </a-form-item>
        <a-form-item label="目录名称" name="sxmc">
            <a-input v-model:value="flowInfo.name" placeholder="请输入目录名称" />
        </a-form-item>
        <a-form-item label="是否流程">
            <a-switch v-model:checked="flowInfo.type" :checkedValue="1" :unCheckedValue="0" />
        </a-form-item>
        <!-- <a-form-item label="事项类型" name="sxlx">
            <a-input v-model:value="flowInfo.sxlx" placeholder="请输入事项类型" />
        </a-form-item> -->
        <a-form-item label="排序号" name="orderNum">
            <a-input-number v-model:value="flowInfo.orderNum" :min="1" style="width:100px" />
        </a-form-item>
        <a-form-item label="备注" name="bz">
            <a-textarea v-model:value="flowInfo.bz" :rows="3" placeholder="请输入备注" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
            <a-button type="primary" @click="handleMlSave">保存</a-button>
            <a-button style="margin-left: 10px" @click="handleMlAdd">新增</a-button>
            <a-popconfirm v-if="flowInfo.id" title="确定删除该目录？" ok-text="确定" cancel-text="取消" @confirm="handleMlDelete">
                <a-button danger style="margin-left: 10px">删除</a-button>
            </a-popconfirm>
        </a-form-item>
    </a-form>

    <!-- type=1 事项明细 -->
    <a-form v-if="data.type === 1" :model="flowInfo" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }"
        autocomplete="off">

        <a-form-item label="事项编号">
            <a-input v-model:value="flowInfo.code" />
        </a-form-item>
        <a-form-item label="事项名称">
            <a-input v-model:value="flowInfo.name" />
        </a-form-item>
        <a-form-item label="关联流程" name="lcid">
            <a-tree-select v-model:value="flowInfo.lcid" :tree-data="flowList" placeholder="请选择流程"
                :fieldNames="{ children: 'children', title: 'title', value: 'key' }" allowClear style="width: 40%;">
            </a-tree-select>&nbsp;&nbsp;{{ "sss" + data.sxlx }}
            <a-button type="primary" @click="handleAddTbl(flowInfo.lcid)">流程设计</a-button>
            <a-input v-model:value="flowInfo.lcid" readOnly style="width: 40%;" />
        </a-form-item>
        <a-form-item label="登记大类">
            <a-input v-model:value="flowInfo.djdl" />
        </a-form-item>
        <a-form-item label="登记小类">
            <a-input v-model:value="flowInfo.djxl" />
            <div style="color: #5094f9;font-size: 10px;padding-top: 5px;">默认为空，特殊情况需填写，如区分经营权和承包经营权、强制转移等</div>
        </a-form-item>
        <a-form-item label="RegType" name="regType" :rules="[{ required: true, message: '请输入登记类型' }]">
            <a-input v-model:value="flowInfo.regType" />
        </a-form-item>
        <a-form-item label="显示类型">
            <a-input v-model:value="flowInfo.xslx" />
        </a-form-item>
        <a-form-item label="国标登记类型">
            <a-input v-model:value="flowInfo.gbdjlx" />
        </a-form-item>
        <a-form-item label="流程前缀">
            <a-input v-model:value="flowInfo.prefix" />
        </a-form-item>
        <a-form-item label="流程时限(小时)">
            <a-input-number v-model:value="flowInfo.lcsx" />
        </a-form-item>
        <a-form-item label="顺序号">
            <a-input-number v-model:value="flowInfo.orderNum" :min="1" :max="100" />
        </a-form-item>
        <a-form-item label="流程启用">
            <a-switch v-model:checked="flowInfo.status" :checkedValue="1" :unCheckedValue="0" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
            <a-button type="primary" @click="handleMxSave">保存</a-button>
            <a-button style="margin-left: 10px" @click="handleMxAdd">新增</a-button>
            <a-popconfirm v-if="flowInfo.id" title="确定删除该明细？" ok-text="确定" cancel-text="取消" @confirm="handleMxDelete">
                <a-button danger style="margin-left: 10px">删除</a-button>
            </a-popconfirm>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { message } from 'ant-design-vue'

const props = defineProps({
    data: {
        type: Object as () => Record<string, any>,
        default: () => ({})
    }
})

const emit = defineEmits(['setBaseInfo', 'refreshTree', 'openFlowDesign'])

// ==================== 事项目录 ====================
// let mlInfo: any = ref({})
// let mlOptions: any = ref([])
let flowList: any = ref([])
enum mlApi {
    queryByIdUrl = '/api/zrzy-bdc/bpm/sxml/queryById',
    saveUrl = '/api/zrzy-bdc/bpm/sxml/edit',
    addUrl = '/api/zrzy-bdc/bpm/sxml/add',
    deleteUrl = '/api/zrzy-bdc/bpm/sxml/delete',
    listUrl = '/api/zrzy-bdc/bpm/sxml/list'
}
loadFlowList()
function loadFlowList() {
    let url = '/api/zrzy-bdc/act/process/extActProcess/list'
    defHttp.get({ url: url, params: { ajlx: '1' } }, { withToken: true }).then((res) => {
        // 假设 treeData 是你从接口获取的原始树形数据
        const processedTreeData = res.result.map(item => ({
            ...item,
            disabled: true, // 直接将一级节点设为禁用
            // 如果下面还有多级子节点，且子节点不需要禁用，保持原样即可
            children: item.children || []
        }))
        flowList.value = processedTreeData
    })
}
/** 加载目录信息 */
function getInfo(nodeData: any) {
    let url = nodeData.type === 0 ? mlApi.queryByIdUrl : mxApi.queryByIdUrl
    defHttp.get({ url: url, params: { id: nodeData.id } }, { withToken: true }).then((res: any) => {
        if (res.success) {
            flowInfo.value = res.result
        }
    })
}
// /** 加载目录信息 */
// function getMlInfo(id: string) {
//     defHttp.get({ url: mlApi.queryByIdUrl, params: { id } }, { withToken: true }).then((res: any) => {
//         if (res.success) {
//             mlInfo.value = res.result
//         } else {
//             // mlInfo.value = { id: props.lcid }
//         }
//         // emit('setBaseInfo', mlInfo.value)
//     })
// }

// /** 加载目录列表（供明细选择所属目录） */
// function loadMlOptions() {
//     defHttp.get({ url: mlApi.listUrl, params: { lcid: props.data.lcid } }, { withToken: true }).then((res: any) => {
//         if (res.success) {
//             mlOptions.value = res.result.records || res.result || []
//         }
//     })
// }

/** 保存目录 */
function handleMlSave() {

    // flowInfo.value.lcid = flowInfo.value.lcid || props.lcid
    const url = flowInfo.value.id ? mlApi.saveUrl : mlApi.addUrl
    defHttp.post({ url, data: flowInfo.value }, { withToken: true }).then((res: any) => {
        if (res.success) {
            message.success('保存成功')
            emit('setBaseInfo', flowInfo.value)
            emit('refreshTree')
        } else {
            message.error(res.message || '保存失败')
        }
    })
}

/** 新增目录 */
function handleMlAdd() {
    flowInfo.value = {
        code: '',
        name: '',
        type: 0,
        orderNum: 1,
        bz: ''
    }
}

/** 删除目录 */
function handleMlDelete() {
    defHttp.delete({ url: mlApi.deleteUrl, params: { id: flowInfo.value.id } }, { withToken: true }).then((res: any) => {
        if (res.success) {
            message.success('删除成功')
            emit('refreshTree')
        } else {
            message.error(res.message || '删除失败')
        }
    })
}

// ==================== 事项明细 ====================
let flowInfo: any = ref({})

enum mxApi {
    queryByIdUrl = '/api/zrzy-bdc/bpm/sxmx/queryById',
    saveUrl = '/api/zrzy-bdc/bpm/sxmx/edit',
    addUrl = '/api/zrzy-bdc/bpm/sxmx/add',
    deleteUrl = '/api/zrzy-bdc/bpm/sxmx/delete'
}

// /** 加载明细信息 */
// function getMxInfo(id: string) {
//     defHttp.get({ url: mxApi.queryByIdUrl, params: { id } }, { withToken: true }).then((res: any) => {
//         if (res.success) {
//             flowInfo.value = res.result
//         }
//         // emit('setBaseInfo', flowInfo.value)
//     })
// }

/** 保存明细 */
function handleMxSave() {
    flowInfo.value.islc = flowInfo.value.lcid ? 1 : 0
    const url = flowInfo.value.id ? mxApi.saveUrl : mxApi.addUrl
    defHttp.post({ url, data: flowInfo.value }, { withToken: true }).then((res: any) => {
        if (res.success) {
            message.success('保存成功')
            emit('refreshTree')
        } else {
            message.error(res.message || '保存失败')
        }
    })
}

/** 新增明细 */
function handleMxAdd() {
    flowInfo.value = {
        code: '',
        name: '',
        lcid: '',
        type: 1,
        orderNum: 1,
        lclx: flowInfo.value.lclx
    }
}

/** 删除明细 */
function handleMxDelete() {
    defHttp.delete({ url: mxApi.deleteUrl, params: { id: flowInfo.value.id } }, { withToken: true }).then((res: any) => {
        if (res.success) {
            message.success('删除成功')
            emit('refreshTree')
        } else {
            message.error(res.message || '删除失败')
        }
    })
}
function handleAddTbl(lcid: string) {
    emit('openFlowDesign', lcid)
}

// ==================== 数据加载 ====================
watch(() => props.data, (newVal) => {
    if (Object.keys(newVal).length == 0) return
    if (newVal.id != undefined) {
        getInfo(newVal)
    } else {
        flowInfo.value = newVal
    }

    // if (props.data.type === 0) {
    //     getMlInfo(newVal.id)
    // } else if (props.data.type === 1) {
    //     if (newVal.id != undefined) {
    //         getMxInfo(newVal.id)
    //     } else {
    //         flowInfo.value = newVal
    //     }
    // }
}, { immediate: true })
</script>

<style scoped lang="less"></style>