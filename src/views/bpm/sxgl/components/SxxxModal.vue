<template>
    <!-- type=0 事项目录 -->
    <a-form v-if="data.ml === 1" ref="mlFormRef" :model="flowInfo" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }"
        autocomplete="off">
        <a-form-item label="目录编码" name="code" :rules="[{ required: true, message: '请输入目录编码' }]">
            <a-input v-model:value="flowInfo.code" placeholder="请输入目录编码" />
        </a-form-item>
        <a-form-item label="目录名称" name="name" :rules="[{ required: true, message: '请输入目录名称' }]">
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
            <!-- <a-button style="margin-left: 10px" @click="handleMlAdd">新增</a-button> -->
            <a-button v-if="flowInfo.id" type="primary" ghost style="margin-left: 10px"
                @click="emit('addMx')">新增事项</a-button>
            <a-popconfirm v-if="flowInfo.id" title="确定删除该目录？" ok-text="确定" cancel-text="取消" @confirm="handleMlDelete">
                <a-button danger style="margin-left: 10px">删除</a-button>
            </a-popconfirm>
        </a-form-item>
    </a-form>

    <!-- type=1 事项明细 -->
    <a-form v-if="data.ml === 0" ref="mxFormRef" :model="flowInfo" name="basic" :label-col="{ span: 6 }"
        :wrapper-col="{ span: 14 }" autocomplete="off">

        <!-- <a-form-item label="事项编号">
            <a-input v-model:value="flowInfo.code" />
        </a-form-item> -->
        <a-form-item label="事项名称" name="name" :rules="[{ required: true, message: '请输入事项名称' }]">
            <a-input v-model:value="flowInfo.name" />
        </a-form-item>
        <a-form-item v-if="data.sxlx == 1" label="关联流程" name="lcid" :rules="[{ required: true, message: '请输入关联流程' }]">
            <a-tree-select v-model:value="flowInfo.lcid" show-search tree-node-filter-prop="title" :tree-data="flowList"
                placeholder="请选择流程" :fieldNames="{ children: 'children', title: 'title', value: 'key' }" allowClear
                style="width: 40%;">
            </a-tree-select>&nbsp;&nbsp;
            <a-button type="primary" @click="handleAddTbl(flowInfo.lcid)">流程设计</a-button>
        </a-form-item>
        <a-form-item v-if="data.sxlx == 0" label="事项编号" name="lcid" :rules="[{ required: true, message: '请输入事项编号' }]">
            <a-input v-model:value="flowInfo.lcid" style="width: 40%;" />
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
        <a-form-item label="事项前缀">
            <a-input v-model:value="flowInfo.prefix" />
        </a-form-item>
        <a-form-item v-if="data.sxlx == 1" label="流程时限(小时)">
            <a-input-number v-model:value="flowInfo.lcsx" />
        </a-form-item>
        <a-form-item label="顺序号">
            <a-input-number v-model:value="flowInfo.orderNum" :min="1" :max="100" />
        </a-form-item>
        <a-form-item label="启用">
            <a-switch v-model:checked="flowInfo.status" :checkedValue="1" :unCheckedValue="0" />
        </a-form-item>
        <a-form-item label="属性扩展">
            <div v-for="(item, index) in extensionItems" :key="item.id" class="extension-row">
                <a-select v-model:value="item.key" class="extension-key-input" placeholder="请选择键名">
                    <a-select-option v-for="key in getAvailableExtensionKeys(item.key)" :key="key" :value="key">
                        {{ key }}
                    </a-select-option>
                </a-select>
                <a-input v-model:value="item.value" class="extension-value-input" placeholder="值" />
                <div class="extension-actions">
                    <MinusCircleOutlined v-if="extensionItems.length > 1" class="extension-icon extension-remove"
                        @click="removeExtension(index)" />
                    <span v-else class="extension-icon-placeholder"></span>
                </div>
            </div>
            <div class="extension-add-row">
                <a-button type="dashed" block :disabled="!canAddExtension" @click="addExtension">
                    <PlusOutlined />
                </a-button>
            </div>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
            <a-button type="primary" @click="handleMxSave">保存</a-button>
            <!-- <a-button style="margin-left: 10px" @click="handleMxAdd">新增</a-button> -->
            <a-popconfirm v-if="flowInfo.id" title="确定删除该明细？" ok-text="确定" cancel-text="取消" @confirm="handleMxDelete">
                <a-button danger style="margin-left: 10px">删除</a-button>
            </a-popconfirm>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { defHttp } from '/@/utils/http/axios'
import { message } from 'ant-design-vue'

const props = defineProps({
    data: {
        type: Object as () => Record<string, any>,
        default: () => ({})
    }
})

const emit = defineEmits(['setBaseInfo', 'refreshTree', 'openFlowDesign', 'addMx'])

// ==================== 事项目录 ====================
const mlFormRef = ref()
// let mlInfo: any = ref({})
// let mlOptions: any = ref([])
let flowList: any = ref([])
enum mlApi {
    queryByIdUrl = '/api/zrzy-bdc/flow/sxml/queryById',
    saveUrl = '/api/zrzy-bdc/flow/sxml/edit',
    addUrl = '/api/zrzy-bdc/flow/sxml/add',
    deleteUrl = '/api/zrzy-bdc/flow/sxml/delete',
    listUrl = '/api/zrzy-bdc/flow/sxml/list'
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
    let url = nodeData.ml === 1 ? mlApi.queryByIdUrl : mxApi.queryByIdUrl
    defHttp.get({ url: url, params: { id: nodeData.id } }, { withToken: true }).then((res: any) => {
        if (res.success) {
            flowInfo.value = res.result
            originalLcid.value = res.result.lcid || ''
            lcidExists.value = false
            if (nodeData.ml === 0) {
                initExtensions()
            }
        }
    })
}
function handleAddTbl(lcid: string) {
    emit('openFlowDesign', lcid)
}

/** 保存目录 */
function handleMlSave() {
    mlFormRef.value.validate().then(() => {
        const url = flowInfo.value.id ? mlApi.saveUrl : mlApi.addUrl
        defHttp.post({ url, data: flowInfo.value }, { withToken: true }).then((res: any) => {
            if (res.success) {
                markExtensionsPersisted()
                message.success('保存成功')
                emit('setBaseInfo', flowInfo.value)
                emit('refreshTree', { type: 'add', id: res.result })
            } else {
                message.error(res.message || '保存失败')
            }
        })
    }).catch(() => { })
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
            emit('refreshTree', { type: 'del' })
        } else {
            message.error(res.message || '删除失败')
        }
    })
}

// ==================== 事项明细 ====================
const mxFormRef = ref()
let flowInfo: any = ref({})
let lcidExists = ref(false)
// 记录初始lcid，用于编辑时排除自身重复校验
let originalLcid = ref('')
type ExtensionItem = {
    id: number,
    key: string,
    value: string,
}

let extensionItems = ref<ExtensionItem[]>([])
let nextExtensionId = 1
const extensionKeys = ['ext1', 'ext2', 'ext3', 'ext4', 'ext5']
const canAddExtension = computed(() => extensionItems.value.length < extensionKeys.length)
let persistedExtensionKeys = new Set<string>()

enum mxApi {
    queryByIdUrl = '/api/zrzy-bdc/flow/sxmx/queryById',
    saveUrl = '/api/zrzy-bdc/flow/sxmx/edit',
    addUrl = '/api/zrzy-bdc/flow/sxmx/add',
    deleteUrl = '/api/zrzy-bdc/flow/sxmx/delete'
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
async function handleMxSave() {
    console.log('保存明细')

    await handleLcidBlur()
    if (lcidExists.value) {
        return
    }

    mxFormRef.value.validate().then(() => {
        syncExtensionsToFlowInfo()
        flowInfo.value.islc = flowInfo.value.lcid ? 1 : 0
        const url = flowInfo.value.id ? mxApi.saveUrl : mxApi.addUrl
        defHttp.post({ url, data: flowInfo.value }, { withToken: true }).then((res: any) => {
            if (res.success) {
                message.success('保存成功')
                emit('refreshTree', { type: 'add', id: res.result })
            } else {
                message.error(res.message || '保存失败')
            }
        })
    }).catch(() => { })
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
    lcidExists.value = false
    originalLcid.value = ''
}

function initExtensions() {
    const extensions = Object.entries(flowInfo.value)
        .filter(([key, value]) => extensionKeys.includes(key) && value != null)
        .sort(([keyA], [keyB]) => extensionKeys.indexOf(keyA) - extensionKeys.indexOf(keyB))

    persistedExtensionKeys = new Set(extensions.map(([key]) => key))

    extensionItems.value = extensions.map(([key, value]) => ({
        id: nextExtensionId++,
        key,
        value: value == null ? '' : String(value),
    }))

    if (!extensionItems.value.length) {
        extensionItems.value = [{ id: nextExtensionId++, key: 'ext1', value: '' }]
    }
}

function addExtension() {
    if (!canAddExtension.value) {
        return
    }
    extensionItems.value.push({
        id: nextExtensionId++,
        key: '',
        value: '',
    })
}

function removeExtension(index: number) {
    if (extensionItems.value.length <= 1) {
        return
    }
    extensionItems.value.splice(index, 1)
}

function syncExtensionsToFlowInfo() {
    const currentExtensionKeys = new Set(
        extensionItems.value
            .map((item) => item.key.trim())
            .filter((key) => extensionKeys.includes(key))
    )
    const removedExtensionKeys = Array.from(persistedExtensionKeys)
        .filter((key) => !currentExtensionKeys.has(key))

    Object.keys(flowInfo.value)
        .filter((key) => extensionKeys.includes(key))
        .forEach((key) => delete flowInfo.value[key])

    extensionItems.value.forEach(({ key, value }) => {
        const trimmedKey = key.trim()
        if (trimmedKey) {
            flowInfo.value[trimmedKey] = String(value ?? '')
        }
    })

    removedExtensionKeys.forEach((key) => {
        flowInfo.value[key] = null
    })
}

function markExtensionsPersisted() {
    persistedExtensionKeys = new Set(
        extensionItems.value
            .map((item) => item.key.trim())
            .filter((key) => extensionKeys.includes(key))
    )
}

function getAvailableExtensionKeys(currentKey: string) {
    const usedKeys = extensionItems.value
        .map((item) => item.key)
        .filter((key) => key && key !== currentKey)
    return extensionKeys.filter((key) => !usedKeys.includes(key))
}

/** 删除明细 */
function handleMxDelete() {
    if (flowInfo.value.status === 1) {
        message.warning('该流程已启用，不允许删除')
        return
    }
    defHttp.delete({ url: mxApi.deleteUrl, params: { id: flowInfo.value.id } }, { withToken: true }).then((res: any) => {
        if (res.success) {
            message.success('删除成功')
            emit('refreshTree', 'del')
        } else {
            message.error(res.message || '删除失败')
        }
    })
}
/** 关联流程失去焦点时校验lcid是否已存在 */
async function handleLcidBlur() {
    const lcid = flowInfo.value.lcid
    if (!lcid) {
        lcidExists.value = false
        return
    }
    // 编辑时lcid未变化，无需校验
    if (flowInfo.value.id && lcid === originalLcid.value) {
        lcidExists.value = false
        return
    }
    const res = await defHttp.get({ url: "/api/zrzy-bdc/flow/sxmx/getConfigByLcid", params: { lcid } }, { withToken: true })
    lcidExists.value = res.success
    if (res.success) {
        message.warning('该流程ID已存在，flow_sxmx不允许lcid重复')
    }
    // defHttp.get({ url: '/api/zrzy-kyq/flow/sxmx/getConfigByLcid', params: { lcid } }, { withToken: true }).then((res: any) => {
    //     lcidExists.value = res.success
    //     if (res.success) {
    //         message.warning('该流程ID已存在，flow_sxmx不允许lcid重复')
    //     }
    // })
}

// ==================== 数据加载 ====================
watch(() => props.data, (newVal) => {
    if (Object.keys(newVal).length == 0) return
    if (newVal.id != undefined) {
        getInfo(newVal)
    } else {
        flowInfo.value = newVal
        if (newVal.ml === 0) {
            initExtensions()
        }
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

<style scoped lang="less">
.extension-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.extension-row:last-child {
    margin-bottom: 0;
}

.extension-row .extension-key-input {
    flex: 0 1 20%;
    min-width: 0;
}

.extension-row .extension-value-input {
    flex: 1 1 80%;
    min-width: 0;
}

.extension-actions {
    display: flex;
    flex: 0 0 44px;
    align-items: center;
    gap: 8px;
}

.extension-icon {
    flex: 0 0 18px;
    font-size: 18px;
    cursor: pointer;
}

.extension-icon-placeholder {
    flex: 0 0 18px;
}

.extension-add-row {
    padding-right: 52px;
}

.extension-remove {
    color: #ff4d4f;
}
</style>
