<template>
    <div class="table-header-css" style="text-align: left;padding:5px ;overflow: hidden;">
        <div style="float: left;">
            <a-space>
                <slot name="toolbar">
                </slot>
            </a-space>
        </div>
        <div v-if="!isSelectList" style="float: right">
            <a-space>
                <ExportModal :columns="columns" @export="onCExport" :loading="eLoading" />
                <a-popover style="" trigger="click" placement="bottomRight" arrow-point-at-center>
                    <template #title>
                        <a-checkbox v-model:checked="state.checkAll" :indeterminate="state.indeterminate"
                            @change="onCheckAllChange">
                            全选
                        </a-checkbox>
                    </template>
                    <template #content>
                        <div class="column-content-css">
                            <a-divider style="height: 2px;margin: 5px 0px!important" />
                            <a-checkbox-group v-model:value="state.checkValue" @change="changeColumn">
                                <draggable :list="checkColumn" ghost-class="ghost" :force-fallback="true"
                                    fallback-class="fallbackClass" animation="300" @start="onStart" @end="onEnd"
                                    item-key="title">
                                    <template #item="{ element }">
                                        <div class="column-item-css">
                                            <div class="item">
                                                <drag-outlined style="padding-right:10px;" />
                                                <a-checkbox :value="element.value">{{ element.label }}</a-checkbox>
                                            </div>
                                        </div>
                                    </template>
                                </draggable>
                            </a-checkbox-group>
                        </div>
                    </template>
                    <a-button type="text">自定义列
                        <template #icon>
                            <SettingFilled style="color: #1677ff;" />
                        </template>
                    </a-button>
                </a-popover>
            </a-space>
        </div>
    </div>
    <a-table :class="isSelectList ? 'select-table' : ''" :columns="filterColumns" :data-source="dataSource"
        :loading="loading" :pagination="paginations" bordered :row-selection="isSelectList ? rowSelection : undefined"
        :rowKey="isSelectList ? keyName : undefined" :customRow="isSelectList ? customRow : undefined" :size="size"
        @change="handleTableChange">
      <template #bodyCell="{ column, text, record }">
        <slot name="bodyCell" :column="column" :text="text" :record="record"></slot>
      </template>
    </a-table>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { message } from "ant-design-vue";
import { DragOutlined, SettingFilled } from '@ant-design/icons-vue';
import draggable from "vuedraggable";
import ExportModal from '/@/components/table/ExportModal.vue'
import { getRowSpan } from "/@/views/online/utils/commonUtils"
// let eLoading = ref<boolean>(false)
const props = defineProps({
    // 表格数据
    dataSource: {
        type: Array,
        default: () => []
    },
    // 表格列
    columns: {
        type: Array,
        default: () => [{}]
    },
    // 分页信息
    pagination: {
        type: Object,
        default: () => ({})
    },
    // 加载中
    loading: {
        type: Boolean,
        default: false
    },
    eLoading: {
        type: Boolean,
        default: false
    },
    isSelectList: {
        type: Boolean,
        default: false
    },
    keyName: {
        type: String,
        default: ''
    },
    mode: {
        type: String,
        default: ''
    },
    value: {
        type: [String, Number, Array]
    },
    size: {
        type: String,
    }
})
let paginations = ref(props.pagination && props.pagination.pageSize ? props.pagination : false)
// let visible = ref(false)
let filterColumns: any = ref([])
filterColumns.value = props.columns
if (filterColumns.value && filterColumns.value.length) {
  filterColumns.value?.map((column) => {
  if (column.options && column.options.isRowSpan) {
    column.customCell = (_, index) => {
      return { rowSpan: getRowSpan(props.dataSource, index, column.dataIndex)}
    }
  }
  return column
})
}
// let exportColumns: any = ref([])
// exportColumns.value = props.columns
let defaultOptions: any = ref([])
const state = reactive({
    indeterminate: true,
    checkAll: true,
    checkValue: defaultOptions.value,
});
// const exportstate = reactive({
//     indeterminate: true,
//     checkAll: true,
//     checkValue: defaultOptions.value,
// });
let checkColumn: any = ref([])
initColumns()
function initColumns() {
    props.columns.map((item: any) => {
        if (item.key != "action") {
            checkColumn.value.push({ label: item.title, value: item.dataIndex });
            defaultOptions.value.push(item.dataIndex)
        } else {
            // _columns.push({ label: item.title, value: item.dataIndex });
        }
    });
}
// 多选框的事件回调
function filterFun(value: Array<string>) {
    return props.columns.filter((item: any) => {
        if (value.includes(item.dataIndex)) {
            // 当暴露值为true时，循环遍历的值会赋给filterValue
            return true
        } else if (item.key == 'action') {
            return true
        }
        return false
    })
}
const emit = defineEmits(['columns-change', 'export', 'update-value', 'row-change', 'getTable', 'change', 'update:value'])
function changeColumn(checked) {
    const filterValue = filterFun(checked)
    filterColumns.value = filterValue
    emit('columns-change', filterColumns.value);
}
/**
 * 导出excel
 * @param data 
 */
function onCExport(data: any) {
    emit('export', data);
}
const onCheckAllChange = (e: any) => {
    // const lValue = state.checkValue
    if (!e.target.checked) {
        message.error("不能全部取消，请至少选择一个字段！")
        state.checkAll = true
        return;
    }
    Object.assign(state, {
        checkValue: e.target.checked ? defaultOptions.value : [],
        indeterminate: false,
    });
    // const nValue = state.checkValue
    // let diff: any = []
    changeColumn(state.checkValue)
};
watch(
    () => state.checkValue,
    val => {
        state.indeterminate = !!val.length && val.length < defaultOptions.value.length;
        state.checkAll = val.length === defaultOptions.value.length;
    },
);
/**
 * 排序
 * @param pagination 
 * @param filters 
 * @param sorter 
 */
function handleTableChange(pagination, filters, sorter) {
    console.log('pagination',pagination)
  console.log('props.pagination',props.pagination)
  
    emit('change', { pagination: pagination, sorter: sorter })
}
/**
 * 拖拽
 */
//开始拖拽事件
function onStart() {

}
//结束拖拽事件
function onEnd(e: any) {
    const { oldIndex, newIndex } = e;
    if (oldIndex !== newIndex) {
        // 保存要交换的数据
        const temp = filterColumns.value[oldIndex];
        // 执行交换
        filterColumns.value.splice(oldIndex, 1); // 移除旧位置的数据
        filterColumns.value.splice(newIndex, 0, temp); // 在新位置插入数据
        // const movedItem = filterColumns.value.splice(oldIndex - 1, 1)[0]; // 这里减1是列表有选择框
        // filterColumns.value.splice(newIndex - 1, 0, movedItem);
        // localStorage.setItem('computedColumns', JSON.stringify(columns.value));
    }
    // filterColumns.value = newColums;
}
/**
 * 行选择 -- start ---
 */
// 下拉框选中值
let selectedValue = computed({
    get() {
        if (!props.value) {
            selectedRow.value = []
        }
        return props.value;
    },
    set(val) {
        isRowChange.value = true
        emit('update:value', val)
        emit("update-value", val);
    }
});
// 下拉选中行
let selectedRow: any = ref([])
// 是否是选中导致的值改变
let isRowChange = ref(false)
// 行选择
const rowSelection = computed(() => {
    return {
        type: props.mode === 'multiple' ? 'checkbox' : 'radio',
        selectedRowKeys: selectedValue.value,
        onSelect(record: any, selected: any) {
            if (props.mode == 'multiple') {
                selectRow(selected, record)
            } else {
                selectedValue.value = [record[props.keyName.toUpperCase()]]
                emit('row-change', [record])
            }
        },
        onSelectAll(selected: any, _selectionRows: any, changeRows: any) {
            if (selected) {
                selectedRow.value = selectedRow.value.concat(changeRows)
            }
            if (!selected) {
                let selectionRows = JSON.parse(JSON.stringify(selectedRow.value))
                const delIndex: any = []
                selectionRows.forEach((item: any, index: any) => {
                    changeRows.forEach((val: any) => {
                        if (item[props.keyName] === val[props.keyName]) {
                            delIndex.push(index)
                        }
                    })
                })
                delIndex.forEach((item: any) => {
                    delete selectionRows[item]
                })
                selectionRows = selectionRows.filter((item: any) => {
                    return item !== undefined
                })
                selectedRow.value = selectionRows
            }
            selectedValue.value = selectedRow.value.map((m: any) => m[props.keyName])
            emit('row-change', selectedRow.value)
        },
    }
})
const customRow = (record: any) => {
    return {
        onClick: (event) => {
            if (props.mode == 'multiple') {
                console.log('selectedValue.value', selectedValue.value)
                let find = selectedValue.value?.find(f => f == record[props.keyName])
                let check = !find
                selectRow(check, record)
            } else {
                selectedValue.value = [record[props.keyName]]
                emit('row-change', [record])
            }
        }
    }
}
function selectRow(selected: any, record: any) {
    if (selected) {
        selectedRow.value.push(record)
    } else {
        const delIndex = selectedRow.value.findIndex((val: any) => {
            return val[props.keyName] === record[props.keyName]
        })
        selectedRow.value.splice(delIndex, 1)
    }
    // selectedValue.value = selectedRow.value
    selectedValue.value = selectedRow.value.map(m => m[props.keyName])
    // selectedValue.value = selectedRow.value.map((m: any) => m[props.keyName])
    emit('row-change', selectedRow.value)
}
watch(() => props.value, async (newVal) => {
    if (!isRowChange.value) {
        selectedRow.value = props.value ? props.value.map((v: string) => props.dataSource.find((f: any) => f[props.keyName] == v)) : []
    }
    isRowChange.value = false
}, {
    deep: true
})
/**
 * 行选择 -- end ---
 */

</script>

<style scoped lang="less">
@import url('/@/assets/less/form.less');

.column-content-css {
    //height: 300px;
    width: 100%;
    width: 300px;
    overflow-y: auto;
    user-select: none;
}

.column-item-css {
    display: flex;
    align-items: center;
    min-width: 100%;
    padding: 4px 16px 4px 0;
}

.ghost {
    border-bottom: solid 2px rgb(19, 122, 239) !important;
}

.fallbackClass {
    display: none;
}
</style>