<template>
    <div class="cc-container">
        <div style="display: flex; flex-direction: column; height: 100%">
            <div style="line-height: 3em; background-color: #fff;padding: 10px 10px;">
                <a-space style="padding-bottom: 10px;">
                    <a-button type="primary" @click="addTenant()">添加租户</a-button>
                </a-space>
                <a-alert type="info" :show-icon="true">
                    <template #message>
                        当前选择：
                        <span style="font-weight: 600;">
                            {{ selectInfo.tenantName }}
                        </span>
                        <span @click="cancelSelect" v-if="selectInfo.tenantName"
                            style="color:#1890ff;padding-left: 10px; cursor: pointer;">
                            取消选择
                        </span>
                    </template>
                </a-alert>
            </div>
            <div class="tenantList"
                style="margin-top: 8px;line-height: 3em; background-color: #fff; flex: 1;height: calc(100% - 60px); min-width: 300px; overflow: auto">
                <TenantList ref="tenantListRef" @select="onSelect"> </TenantList>
            </div>
        </div>

        <div class="tenantTabContent" style="height: 100%">
            <a-tabs v-model:activeKey="activeKey" style="padding: 5px; height: 100%;">
                <a-tab-pane key="1" tab="基本信息">
                    <BaseInfo v-if='selectInfo.id || isAddMode' :selectInfo="selectInfo" :isAddMode="isAddMode"
                        @refreshList="onRefreshList" @cancelAdd="onCancelAdd" />
                    <a-empty v-else>
                        <template #description>
                            请先选择一个租户，或点击"添加租户"按钮创建新租户
                        </template>
                    </a-empty>
                </a-tab-pane>
                <!-- <a-tab-pane key="2" tab="租户套餐" force-render>
                    <a-empty v-if='!selectInfo.id'>
                        <template #description>
                            请先选择一个租户
                        </template>
                    </a-empty>
                    <tenant-pack-manager v-else :tenant-id="selectInfo.id" tenant-scoped />
                </a-tab-pane> -->
                <a-tab-pane key="3" tab="流程关联" force-render>
                    <a-empty v-if='!selectInfo.id'>
                        <template #description>
                            请先选择一个租户
                        </template>
                    </a-empty>
                    <ProcessTree v-else :selectInfo="selectInfo" />
                </a-tab-pane>
                <a-tab-pane key="4" tab="角色关联" force-render>
                    <a-empty v-if='!selectInfo.id'>
                        <template #description>
                            请先选择一个租户
                        </template>
                    </a-empty>
                    <role-list v-else :selectInfo="selectInfo"></role-list>
                </a-tab-pane>
                <!--                <a-tab-pane key="5" tab="跨租户共享" force-render>-->
                <!--                    <a-empty v-if='!selectInfo.id'>-->
                <!--                        <template #description>-->
                <!--                            请先选择一个租户-->
                <!--                        </template>-->
                <!--                    </a-empty>-->
                <!--                    <div v-else style="padding: 20px; text-align: center; color: #999;">-->
                <!--                        跨租户共享功能开发中...-->
                <!--                    </div>-->
                <!--                </a-tab-pane>-->
            </a-tabs>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import TenantList from "/@/views/system/tenant/components/tenantList.vue"
import RoleList from "/@/views/system/tenant/components/RoleList.vue"
import TenantPackManager from "/@/views/system/tenantpack/index.vue"
const BaseInfo = defineAsyncComponent(() => import("./components/tenantInfo.vue"))
const ProcessTree = defineAsyncComponent(() => import("./components/ProcessTree.vue"))
const activeKey = ref('1');
let selectInfo: any = ref({});
let isAddMode = ref(false);
let tenantListRef: any = ref()


/**
* 选中的租户
* @param node 选中的租户
*/
function onSelect(node: any) {
    selectInfo.value = node
    isAddMode.value = false
}

/**
* 取消选择 selectInfo
*/
function cancelSelect() {
    selectInfo.value = {}
    isAddMode.value = false
    // 重置树选择
    tenantListRef.value.onResetSelect()
}

/**
* 取消新增
*/
function onCancelAdd() {
    isAddMode.value = false
    selectInfo.value = {}
    tenantListRef.value.onResetSelect()
}

/**
* 添加租户
*/
function addTenant() {
    isAddMode.value = true
    selectInfo.value = {}
    // 切换到基本信息Tab
    activeKey.value = '1'
}

function onRefreshList() {
    tenantListRef.value.loadTenantList()
}
</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.tenantList {
    :deep(.ant-tree-checkbox) {
        margin-block-start: 0px !important;
    }
}

.tenantTabContent {
    width: 100%;
    background-color: #fff;
    margin-left: 8px;

    :deep(.ant-tabs-content) {
        height: 100%;
    }

    :deep(.ant-tabs-content-holder) {
        height: 100%;
        overflow: auto;
    }
}
</style>
