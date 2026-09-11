<template>
    <div class="znbd-container">
        <!-- 受理编号输入 + 触发比对 -->
        <!-- <div class="znbd-toolbar">
            <a-input-search v-model:value="innerSlbh" placeholder="请输入受理编号" style="width: 320px" enter-button="开始比对"
                :loading="loading" allow-clear @search="loadCompare" />
        </div> -->
        <a-skeleton :loading="loading" active>
            <!-- 比对结果表格：不一致行 数据库值/文档抽取值 标红 -->
            <a-table v-if="rows.length > 0" :columns="columns" :data-source="rows" :pagination="false" size="small"
                bordered :scroll="{ y: 980 }" :loading="loading" row-key="name">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'dbValue'">
                        <a-table v-if="getArrayValue(record, 'dbValue')" class="array-value-table"
                            :columns="buildArrayColumns(getArrayValue(record, 'dbValue') || [])"
                            :data-source="buildArrayRows(getArrayValue(record, 'dbValue') || [])" :pagination="false"
                            size="small" bordered :scroll="{ x: 'max-content', y: 400 }" />
                        <span v-else :class="{ 'diff-red': record.status === '不一致' }">{{ record.dbValue ?? '' }}</span>
                    </template>
                    <template v-else-if="column.dataIndex === 'ocrValue'">
                        <a-table v-if="getArrayValue(record, 'ocrValue')" class="array-value-table"
                            :columns="buildArrayColumns(getArrayValue(record, 'ocrValue') || [])"
                            :data-source="buildArrayRows(getArrayValue(record, 'ocrValue') || [])" :pagination="false"
                            size="small" bordered :scroll="{ x: 'max-content', y: 400 }" />
                        <span v-else :class="{ 'diff-red': record.status === '不一致' }">{{ record.ocrValue ?? '' }}</span>
                    </template>
                    <template v-else-if="column.dataIndex === 'status'">
                        <span :class="record.status === '不一致' ? 'diff-red' : 'status-ok'">{{ record.status }}</span>
                    </template>
                </template>
            </a-table>
        </a-skeleton>
        <!-- <a-empty v-else-if="!loading" description="暂无比对结果，请输入受理编号开始比对" /> -->
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { defHttp } from '/@/utils/http/axios'
import { message } from 'ant-design-vue'

enum api {
    compare = '/api/zrzy-bdc/ocr/extract/compare'
}

const props = defineProps<{
    /** 受理编号（父组件可传入自动触发比对） */
    formData: {
        type: Object,
        default: null
    }
}>()
// 受理编号（优先取父组件传入值）
let innerSlbh = ref(props.formData.slbh || '')
let loading = ref(false)
let rows = ref<any[]>([])

// 比对表格列
const columns = [
    { title: '比对列名', dataIndex: 'name', width: 150 },
    { title: '数据库值', dataIndex: 'dbValue' },
    { title: '文档抽取值', dataIndex: 'ocrValue' },
    { title: '状态', dataIndex: 'status', width: 100 }
]

type CompareValueKey = 'dbValue' | 'ocrValue'

/**
 * Array/ArrayList 类型的值可能是数组，也可能是 JSON 字符串，统一转换后用于表格展示。
 */
function getArrayValue(record: any, key: CompareValueKey): any[] | null {
    if (!['Array', 'ArrayList'].includes(record?.dataType)) return null

    const value = record?.[key]
    if (Array.isArray(value)) return value
    if (typeof value !== 'string' || !value.trim()) return null

    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : null
    } catch (e) {
        return null
    }
}

/** 按数组中全部对象的字段顺序构建列。 */
function buildArrayColumns(rows: any[]) {
    const keys: string[] = []
    rows.forEach((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return
        Object.keys(row).forEach((key) => {
            if (!keys.includes(key)) keys.push(key)
        })
    })
    if (keys.length === 0 && rows.length > 0) return [{ title: '值', dataIndex: 'value' }]
    return keys.map((key) => ({ title: key, dataIndex: key }))
}

/** 为嵌套表格补充稳定的行 key。 */
function buildArrayRows(rows: any[]) {
    return rows.map((row, index) => {
        const value = row && typeof row === 'object' && !Array.isArray(row) ? row : { value: row }
        return { ...value, key: index }
    })
}

// 父组件传入 slbh 变化时自动比对
watch(() => props.formData.slbh, (val) => {
    if (val) {
        innerSlbh.value = val
        loadCompare()
    }
}, { immediate: true })

/**
 * 调用智能比对接口
 */
function loadCompare() {
    if (!innerSlbh.value) {
        message.warning('请输入受理编号')
        return
    }
    loading.value = true
    rows.value = []
    defHttp
        .post(
            { url: api.compare, data: { ...props.formData }, timeout: 10 * 60 * 1000 },
            { withToken: true }
        )
        .then((res: any) => {
            if (res?.success) {
                rows.value = res.result || []
                if (rows.value.length === 0) {
                    message.warning('未比对到字段数据')
                }
            } else {
                message.error(res?.message || '智能比对失败')
            }
        })
        .catch((err: any) => {
            message.error(err?.message || '智能比对失败')
        })
        .finally(() => {
            loading.value = false
        })
}

defineExpose({ loadCompare })
</script>

<style lang="less" scoped>
.znbd-container {
    background: #fff;
    padding: 10px 0px;

    .znbd-toolbar {
        margin-bottom: 16px;
    }

    // 不一致标红
    .diff-red {
        color: #f5222d;
        font-weight: 500;
    }

    // 一致绿色
    .status-ok {
        color: #52c41a;
    }

    .array-value-table {
        min-width: 360px;

        :deep(.ant-table-cell) {
            white-space: nowrap;
        }
    }
}
</style>
