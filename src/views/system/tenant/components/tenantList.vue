<template>
    <div class="tenant-list-container">
        <a-input-search v-model:value="searchValue" placeholder="请输入关键字查询" style="margin-bottom: 10px;"
            @search="onSearch" />
        <a-tree v-if="treeData.length > 0" :tree-data="treeData" :selected-keys="selectedKeys" @select="onSelect"
            :field-names="{ title: 'name', key: 'id' }">
            <template #title="{ name }">
                <span>{{ name }}</span>
            </template>
        </a-tree>
        <a-empty v-else description="暂无数据" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { defHttp } from '/@/utils/http/axios';

const emit = defineEmits(['select']);

const searchValue = ref('');
const treeData = ref<any[]>([]);
const selectedKeys = ref<string[]>([]);

/**
 * 加载租户列表
 */
function loadTenantList() {
    defHttp.get(
        {
            url: '/api/zrzy-system/sys/tenant/list',
        },
        { withToken: true }
    ).then((res: any) => {
        if (res && res.success) {
            treeData.value = res.result || []
        }
    })
}

/**
 * 搜索租户
 */
function onSearch() {
    loadTenantList()
}

/**
 * 选择租户
 */
function onSelect(selectedKeysValue: string[], info: any) {
    if (selectedKeysValue.length > 0) {
        selectedKeys.value = selectedKeysValue
        emit('select', info.node)
    }
}

/**
 * 重置选择
 */
function onResetSelect() {
    selectedKeys.value = []
}

defineExpose({
    loadTenantList,
    onResetSelect
})

onMounted(() => {
    loadTenantList()
})
</script>

<style scoped lang="less">
.tenant-list-container {
    padding: 10px;
}
</style>
