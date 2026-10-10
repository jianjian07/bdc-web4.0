<template>
    <div class="tenant-list-container">
        <a-input-search v-model:value="searchValue" placeholder="请输入关键字查询" style="margin-bottom: 10px;" allowClear />
        <a-tree v-if="treeData.length > 0" :tree-data="treeData" :selected-keys="selectedKeys" @select="onSelect"
            :expanded-keys="expandedKeys" :auto-expand-parent="autoExpandParent" @expand="onExpand"
            :field-names="{ title: 'name', key: 'id' }">
            <template #title="{ name }">
                <span v-if="searchValue && name && name.indexOf(searchValue) > -1">
                    {{ name.substring(0, name.indexOf(searchValue)) }}
                    <span style="color: #f50">{{ searchValue }}</span>
                    {{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
                </span>
                <span v-else>{{ name }}</span>
            </template>
        </a-tree>
        <a-empty v-else description="暂无数据" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { defHttp } from '/@/utils/http/axios';

const emit = defineEmits(['select']);

const searchValue = ref('');
const treeData = ref<any[]>([]);
const selectedKeys = ref<string[]>([]);
const expandedKeys = ref<(string | number)[]>([]);
const autoExpandParent = ref<boolean>(true);

// 扁平化的数据列表，用于搜索时快速定位父节点
let dataList: { key: any; title: string }[] = [];

/**
 * 将树形数据扁平化为一维列表
 */
function generateList(data: any[]) {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        dataList.push({ key: node.id, title: node.name });
        if (node.children) {
            generateList(node.children);
        }
    }
}

/**
 * 根据节点 key 获取其父节点 key
 */
function getParentKey(key: any, tree: any[]): any {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some((item: any) => item.id === key)) {
                parentKey = node.id;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
}

/**
 * 加载租户列表
 */
function loadTenantList() {
    defHttp.get(
        {
            url: '/api/zrzy-system/sys/tenant/tenantTree',
        },
        { withToken: true }
    ).then((res: any) => {
        if (res && res.success) {
            treeData.value = res.result || []
            dataList = []
            generateList(treeData.value)
        }
    })
}

/**
 * 展开/收起节点
 */
function onExpand(keys: (string | number)[]) {
    expandedKeys.value = keys;
    autoExpandParent.value = false;
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

// 监听搜索关键字，自动展开匹配节点的父级
watch(searchValue, (value) => {
    if (!value) {
        expandedKeys.value = [];
        autoExpandParent.value = false;
        return;
    }
    const expanded = dataList
        .map((item) => {
            if (item.title && item.title.indexOf(value) > -1) {
                return getParentKey(item.key, treeData.value);
            }
            return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i) as (string | number)[];
    expandedKeys.value = expanded;
    autoExpandParent.value = true;
});

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
