<template>
    <a-popover trigger="click" placement="bottomRight" arrow-point-at-center title="导出设置">
        <template #content>
            <div class="column-content-css" style="width: 400px!important;">
                <a-transfer v-model:target-keys="targetKeys" :data-source="cColumns" show-search
                    :filter-option="filterOption" :render="item => item.title" @change="handleChange"
                    @search="handleSearch">
                    <template #children="{ direction, selectedKeys, onItemSelect }">
                        <a-tree v-if="direction === 'right'" class="draggable-tree" block-node @dragenter="onDragEnter"
                            @drop="onDrop" :checked-keys="[...selectedKeys]" :tree-data="filterColumns" checkable
                            draggable @check="(_, props) => { onChecked(props, [...selectedKeys], onItemSelect); }">
                        </a-tree>
                    </template>

                </a-transfer>
            </div>
            <div style="text-align: right;padding-top: 10px;"><a-button type="primary" size="small" @click="onCExport"
                    :loading="loading">导出</a-button>
            </div>
        </template>
        <a-button type="text">导出
            <template #icon>
                <DownloadOutlined style="color: #1677ff;font-weight: 600;" />
            </template>
        </a-button>
    </a-popover>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
const props = defineProps({
    columns: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
})
let cColumns: any = ref([])

function initColumns() {
    cColumns.value = []
    props.columns.forEach((element: any) => {
        if (element.key != "action") {
            cColumns.value.push({
                key: element.key == undefined ? element.id : element.key,
                title: element.title,
                dataIndex: element.dataIndex
            });
        }
    });
}

interface MockData {
    key: string;
    title: string;
    description: string;
    chosen: boolean;
}
const targetKeys = ref<string[]>([]);
onMounted(() => {
    filterColumns.value = []
    initColumns();
});
const filterOption = (inputValue: string, option: MockData) => {
    return option.title.indexOf(inputValue) > -1;
};
const handleChange = (keys: string[], direction: string, moveKeys: string[]) => {
    moveKeys.forEach(key => {
        if (direction == 'left') {
            const nIndex = filterColumns.value.findIndex(item => item.key == key)
            filterColumns.value.splice(nIndex, 1)
        } else {
            filterColumns.value.push(cColumns.value.find(item => item.key == key))
        }
    });
    baseColumns.value = filterColumns.value
};

const handleSearch = (dir: string, value: string) => {
    if (dir == 'right') {
        filterColumns.value = baseColumns.value.filter(item => item.title.indexOf(value) > -1)
    }
};
const emit = defineEmits(['export'])
let filterColumns: any = ref([])
let baseColumns: any = ref([])
/**
 * 导出
 */
function onCExport() {
    emit('export', filterColumns.value);
}
const onChecked = (
    e: any,
    checkedKeys: string[],
    onItemSelect: (n: any, c: boolean) => void,
) => {
    const { eventKey } = e.node;
    onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
};
function isChecked(selectedKeys: (string | number)[], eventKey: string | number) {
    return selectedKeys.indexOf(eventKey) !== -1;
}
const onDrop = (info: any) => {
    console.log(info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    // 保存要交换的数据
    const oldIndex = filterColumns.value.findIndex(item => item.key === dragKey);
    const newIndex = filterColumns.value.findIndex(item => item.key === dropKey);
    const temp = info.dragNode
    // 执行交换
    filterColumns.value.splice(oldIndex, 1); // 移除旧位置的数据
    filterColumns.value.splice(newIndex, 0, temp); // 在新位置插入数据
}
const onDragEnter = (info: any) => {
    console.log(info);
};
</script>
<style lang="less" scoped>
.column-content-css {
    ::v-deep(.ant-transfer) {
        .ant-transfer-list {
            min-height: 300px;
            max-height: 600px;
            height: auto;
        }
    }
}
</style>