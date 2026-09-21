<template>
    <a-dropdown :open="dropdownVisible" :trigger="['click']" :placement="placement" @openChange="handleVisibleChange">
        <a-input v-model:value="inputValue" :placeholder="placeholder" :disabled="disabled" :allow-clear="allowClear"
            @input="handleInput" @clear="handleClear" @focus="handleFocus">
            <template #suffix>
                <DownOutlined :style="{ fontSize: '8px', color: 'gray' }" />
            </template>
        </a-input>

        <template #overlay>
            <div class="input-table-dropdown" :style="{ width: dropdownWidth }">
                <!-- 搜索框 -->
                <div v-if="showSearch" class="search-wrapper">
                    <a-form-item-rest>
                        <a-input v-model:value="searchText" placeholder="请输入搜索内容" allow-clear size="small"
                            @input="handleSearch" @clear="handleSearchClear">
                            <template #prefix>
                                <SearchOutlined />
                            </template>
                        </a-input>
                    </a-form-item-rest>
                </div>

                <!-- 表格区域 -->
                <div class="table-wrapper">
                    <a-table :columns="columns" :data-source="filteredDataSource" :pagination="pagination"
                        :scroll="scroll" :loading="loading" :row-key="rowKey" :size="size" :custom-row="customRow"
                        @change="handleTableChange" class="input-table">
                        <template #bodyCell="{ column, record, text, index }">
                            <slot name="bodyCell" :column="column" :text="text" :record="record"></slot>
                            <template v-if="column.dataIndex === 'index'">
                                {{ index + 1 }}
                            </template>
                        </template>
                    </a-table>
                </div>

                <!-- 底部信息 -->
                <div v-if="showFooter" class="footer-wrapper">
                    <span class="total-text">共 {{ filteredDataSource.length }} 条</span>
                </div>
            </div>
        </template>
    </a-dropdown>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { DownOutlined, SearchOutlined } from '@ant-design/icons-vue';

interface ColumnType {
    title: string;
    dataIndex: string;
    key?: string;
    width?: string | number;
    align?: string;
    [key: string]: any;
}

interface DataSourceType {
    [key: string]: any;
}

const props = defineProps({
    // 输入框值
    modelValue: {
        type: String,
        default: ''
    },
    // 表格列配置
    columns: {
        type: Array as () => ColumnType[],
        required: true
    },
    // 表格数据
    dataSource: {
        type: Array as () => DataSourceType[],
        default: () => []
    },
    // 占位符
    placeholder: {
        type: String,
        default: '请选择'
    },
    // 是否禁用
    disabled: {
        type: Boolean,
        default: false
    },
    // 是否允许清空
    allowClear: {
        type: Boolean,
        default: true
    },
    // 下拉框位置
    placement: {
        type: String,
        default: 'bottomLeft'
    },
    // 下拉框宽度
    dropdownWidth: {
        type: String,
        default: '500px'
    },
    // 是否显示搜索
    showSearch: {
        type: Boolean,
        default: true
    },
    // 搜索字段
    searchField: {
        type: String,
        default: ''
    },
    // 行唯一标识
    rowKey: {
        type: String,
        default: 'id'
    },
    // 表格尺寸
    size: {
        type: String,
        default: 'small'
    },
    // 分页配置
    pagination: {
        type: [Object, Boolean],
        default: () => ({
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            size: 'small'
        })
    },
    // 表格滚动配置
    scroll: {
        type: Object,
        default: () => ({
            y: 300
        })
    },
    // 加载状态
    loading: {
        type: Boolean,
        default: false
    },
    // 是否显示底部
    showFooter: {
        type: Boolean,
        default: true
    },
    // 显示值字段
    displayField: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'select', 'change', 'search']);

const inputValue = ref(props.modelValue);
const dropdownVisible = ref(false);
const searchText = ref('');
const selectedRecord = ref<DataSourceType | null>(null);

// 计算过滤后的数据
const filteredDataSource = computed(() => {
    if (!searchText.value || !props.searchField) {
        return props.dataSource;
    }
    return props.dataSource.filter(item => {
        const value = item[props.searchField];
        return value && String(value).toLowerCase().includes(searchText.value.toLowerCase());
    });
});

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal;
});

// 处理输入
function handleInput(e: any) {
    emit('update:modelValue', e.target?.value ?? e);
    emit('change', e.target?.value ?? e);
}

// 处理清空
function handleClear() {
    inputValue.value = '';
    selectedRecord.value = null;
    emit('update:modelValue', '');
    emit('select', null);
    emit('change', '');
}

// 处理聚焦
function handleFocus() {
    // 可以在这里添加聚焦时的逻辑
}

// 处理下拉框显示变化
function handleVisibleChange(visible: boolean) {
    if (props.disabled) return;
    dropdownVisible.value = visible;
    if (visible) {
        searchText.value = '';
    }
}

// 处理搜索
function handleSearch() {
    emit('search', searchText.value);
}

// 处理搜索清空
function handleSearchClear() {
    searchText.value = '';
    emit('search', '');
}

// 处理表格变化
function handleTableChange(pagination: any, filters: any, sorter: any) {
    // 可以在这里处理分页、排序、过滤等事件
}

// 自定义行
const customRow = (record: DataSourceType) => {
    return {
        onClick: () => {
            handleRowSelect(record);
        },
        style: {
            cursor: 'pointer'
        }
    };
};

// 处理行选择
function handleRowSelect(record: DataSourceType) {
    selectedRecord.value = record;

    // 如果指定了显示字段,则显示该字段的值
    if (props.displayField) {
        inputValue.value = record[props.displayField] || '';
        emit('update:modelValue', record[props.displayField] || '');
    } else {
        // 否则显示第一个非空字段的值
        const firstValue = Object.values(record).find(val => val !== null && val !== undefined);
        inputValue.value = String(firstValue ?? '');
        emit('update:modelValue', String(firstValue ?? ''));
    }

    emit('select', record);
    emit('change', inputValue.value, record);
    dropdownVisible.value = false;
}
</script>

<style scoped lang="less">
.input-table-dropdown {
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    padding: 10px;

    .search-wrapper {
        padding: 8px;
        border-bottom: 1px solid #f0f0f0;
    }

    .table-wrapper {
        max-height: 400px;
        //overflow: auto;

        .input-table {
            margin: 0;

            :deep(.ant-table-body) {
                scrollbar-width: thin;

                &::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                &::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 3px;

                    &:hover {
                        background-color: rgba(0, 0, 0, 0.3);
                    }
                }
            }

            :deep(.ant-table-row) {
                cursor: pointer;

                &:hover {
                    background-color: #f5f5f5;
                }
            }
        }
    }

    .footer-wrapper {
        padding: 8px 12px;
        border-top: 1px solid #f0f0f0;
        background-color: #fafafa;
        text-align: right;

        .total-text {
            font-size: 12px;
            color: #666;
        }
    }
}

.rotate-icon {
    transform: rotate(180deg);
    transition: transform 0.3s;
}

:deep(.ant-input-suffix) {
    .anticon {
        transition: transform 0.3s;
    }
}
</style>
