<template>
    <a-modal :open="true" :title="modalTitle" width="600px" @cancel="handleClose" :footer="null" :closable="true">
        <!-- ===== 主视图：协作者/管理者列表 ===== -->
        <template v-if="view === 'main'">
            <!-- 搜索栏 -->
            <div class="search-bar">
                <a-input-search v-model:value="searchText" placeholder="输入 用户名 / 邮箱 / 手机号 / 部门 添加协作权限" :bordered="false"
                    style="width: 100%" @search="switchToAdd" />
            </div>

            <!-- 协作者区域 -->
            <div class="perm-section">
                <div class="section-header">
                    <span class="section-title">
                        协作者
                        <a-tooltip title="协作者可以查看和编辑文件夹内容">
                            <QuestionCircleOutlined class="help-icon" />
                        </a-tooltip>
                    </span>
                    <a @click="switchToAdd" class="add-link">
                        <PlusCircleOutlined /> 添加协作者
                    </a>
                </div>
                <!-- 继承权限 -->
                <div v-if="inheritedCount > 0" class="perm-item inherited">
                    <div class="perm-user">
                        <div class="avatar avatar-upload">
                            <UploadOutlined />
                        </div>
                        <span class="user-name">上级目录协作者</span>
                        <a @click="viewInherited" class="view-link">查看</a>
                    </div>
                    <span class="perm-role-tag inherited-tag">继承权限</span>
                </div>
                <!-- 协作者列表 -->
                <div v-for="item in collaborators" :key="item.id" class="perm-item">
                    <div class="perm-user">
                        <div class="avatar">
                            <TeamOutlined v-if="item.targetType === 2" />
                            <UserOutlined v-else />
                        </div>
                        <span class="user-name">{{ item.name }}{{ item.isMe ? ' (我)' : '' }}</span>
                    </div>
                    <a-dropdown>
                        <a class="perm-role-tag" @click.prevent>
                            {{ item.permLabel }}
                            <DownOutlined />
                        </a>
                        <template #overlay>
                            <a-menu @click="(e: any) => changePerm(item, e.key)">
                                <a-menu-item key="1">可查看</a-menu-item>
                                <!-- <a-menu-item key="2">可编辑</a-menu-item> -->
                            </a-menu>
                        </template>
                    </a-dropdown>
                </div>
                <a-empty v-if="collaborators.length === 0 && inheritedCount === 0" description="暂无协作者"
                    :image-style="{ height: '40px' }" />
            </div>

            <!-- 底部操作栏 -->
            <div class="modal-footer">
                <a-button type="primary" @click="switchToAdd" size="small">
                    <PlusOutlined /> 添加协作者
                </a-button>
            </div>
        </template>

        <!-- ===== 添加协作者视图 ===== -->
        <template v-if="view === 'add'">
            <!-- 标题栏（返回 + 标题） -->
            <div class="add-title-bar">
                <a @click="switchToMain" class="back-btn">
                    <ArrowLeftOutlined /> 返回
                </a>
                <span class="title-text">添加协作者</span>
            </div>

            <!-- 搜索栏 -->
            <div class="search-bar">
                <a-input-search v-model:value="addSearchText" placeholder="输入 用户名 / 邮箱 / 手机号 / 部门 添加协作权限"
                    :bordered="false" style="width: 100%" @search="onAddSearch" />
            </div>

            <!-- Tab 切换 -->
            <div class="add-tabs">
                <span :class="['tab-item', { active: addTab === 'user' }]"
                    @click="addTab = 'user'; loadUsers()">用户</span>
                <span :class="['tab-item', { active: addTab === 'org' }]"
                    @click="addTab = 'org'; loadDeptTree()">组织架构</span>
            </div>

            <!-- 用户列表 -->
            <div v-if="addTab === 'user'" class="user-list">
                <div v-for="user in filteredUsers" :key="user.id" class="user-item">
                    <div class="user-info">
                        <div class="avatar">
                            <UserOutlined />
                        </div>
                        <span class="user-name">{{ user.realName }}</span>
                    </div>
                    <span class="user-contact">{{ user.username }}</span>
                    <a-dropdown>
                        <a class="add-perm-btn" @click.prevent>
                            添加权限
                            <DownOutlined />
                        </a>
                        <template #overlay>
                            <a-menu @click="(e: any) => addCollaborator(user, e.key)">
                                <a-menu-item key="1">可查看</a-menu-item>
                                <!-- <a-menu-item key="2">可编辑</a-menu-item> -->
                            </a-menu>
                        </template>
                    </a-dropdown>
                </div>
                <a-empty v-if="filteredUsers.length === 0" description="暂无匹配用户" :image-style="{ height: '40px' }" />
            </div>

            <!-- 组织架构 -->
            <div v-if="addTab === 'org'" class="org-panel">
                <a-input-search v-model:value="deptSearchText" placeholder="搜索部门" allow-clear
                    style="margin-bottom: 12px" @search="onDeptSearch" />
                <a-tree :tree-data="filteredDeptTree" :fieldNames="{ title: 'name', key: 'id', children: 'children' }"
                    default-expand-all block-node>
                    <template #title="node">
                        <div class="dept-node">
                            <span class="dept-name">{{ node.name }}</span>
                            <a-dropdown>
                                <a class="add-perm-btn" @click.prevent>
                                    添加权限
                                    <DownOutlined />
                                </a>
                                <template #overlay>
                                    <a-menu @click="(e: any) => addDeptCollaborator(node, e.key)">
                                        <a-menu-item key="1">可查看</a-menu-item>
                                    </a-menu>
                                </template>
                            </a-dropdown>
                        </div>
                    </template>
                </a-tree>
            </div>
        </template>
    </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
    QuestionCircleOutlined,
    PlusCircleOutlined,
    PlusOutlined,
    DownOutlined,
    UserOutlined,
    TeamOutlined,
    UploadOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons-vue'
import { defHttp } from '/@/utils/http/axios'

const props = defineProps<{
    folder: any
}>()

const emit = defineEmits(['close'])

// ========== 视图切换 ==========
const view = ref<'main' | 'add'>('main')

const modalTitle = computed(() => {
    const name = props.folder?.folderName || props.folder?.fileName || ''
    return view.value === 'main' ? `协作 - ${name}` : ''
})

// ========== 主视图数据 ==========
const searchText = ref('')
const collaborators = ref<any[]>([])
const inheritedCount = ref(0)

// ========== 添加视图数据 ==========
const addSearchText = ref('')
const addTab = ref<'user' | 'org'>('user')
const userList = ref<any[]>([])
const deptSearchText = ref('')
const deptTree = ref<any[]>([])

// ========== API ==========
const api = {
    permList: '/api/zrzy-bdc/doc/permission/list',
    permGrant: '/api/zrzy-bdc/doc/permission/grant',
    permRevoke: '/api/zrzy-bdc/doc/permission/revoke',
    breadcrumb: '/api/zrzy-bdc/doc/folder/breadcrumb',
    userList: '/api/zrzy-system/sys/v1/user/page',
    deptTree: '/api/zrzy-system/sys/dept/deptTree',
}

onMounted(() => {
    loadPermissions()
    loadInheritedPermissions()
})

// ========== 主视图逻辑 ==========
/** 加载权限列表 */
function loadPermissions() {
    if (!props.folder?.id) return
    defHttp.get({ url: api.permList, params: { folderId: props.folder.id } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                const list = res.result || []
                collaborators.value = list
                    .filter((p: any) => p.status === 1)
                    .map((p: any) => ({
                        ...p,
                        name: p.targetName || p.targetId,
                        isMe: p.isMe || false,
                        permLabel: p.permType === 2 ? '可编辑' : '可查看',
                    }))
            }
        })
        .catch(() => {
            collaborators.value = []
        })
}

/** 加载继承权限数量（文件无继承概念） */
function loadInheritedPermissions() {
    if (!props.folder?.id || props.folder.parentId === '0' || props.folder.fileName) return
    defHttp.get({ url: api.breadcrumb, params: { folderId: props.folder.id } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                const ancestors = res.result || []
                inheritedCount.value = ancestors.length
            }
        })
        .catch(() => {
            inheritedCount.value = 0
        })
}

function switchToAdd() {
    view.value = 'add'
    addTab.value = 'user'
    addSearchText.value = ''
    loadUsers()
}

function switchToMain() {
    view.value = 'main'
}

function viewInherited() {
    message.info('查看上级目录协作者')
}

function changePerm(item: any, key: string) {
    const permLabel = key === '1' ? '可查看' : '可编辑'
    defHttp.post({
        url: api.permGrant,
        data: {
            folderId: props.folder.id,
            targetType: item.targetType || 1,
            targetId: item.targetId,
            permType: key === '2' ? 2 : 1,
        },
    }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                item.permLabel = permLabel
                message.success('权限已更新')
            }
        })
}

function openSettings() {
    message.info('设置功能')
}

// ========== 添加视图 - 用户列表 ==========
/** 加载用户列表 */
function loadUsers() {
    const params: any = {
        pageNo: 1,
        pageSize: 50,
    }
    if (addSearchText.value) {
        params.userName = addSearchText.value
    }
    defHttp.get({ url: api.userList, params }, { withToken: true })
        .then((res: any) => {
            if (res?.code === 200) {
                const records = res.result?.records || res.result || []
                userList.value = Array.isArray(records) ? records : []
            } else {
                userList.value = []
            }
        })
        .catch(() => {
            userList.value = []
        })
}

const filteredUsers = computed(() => {
    if (!addSearchText.value) return userList.value
    const kw = addSearchText.value.toLowerCase()
    return userList.value.filter(
        (u: any) =>
            (u.realName && u.realName.toLowerCase().includes(kw)) ||
            (u.username && u.username.toLowerCase().includes(kw)) ||
            (u.phone && u.phone.includes(kw)) ||
            (u.email && u.email.toLowerCase().includes(kw))
    )
})

function onAddSearch() {
    loadUsers()
}

/** 添加协作者 */
function addCollaborator(user: any, key: string) {
    const permLabel = key === '1' ? '可查看' : '可编辑'
    defHttp.post({
        url: api.permGrant,
        data: {
            folderId: props.folder.id,
            targetType: 1,
            targetId: user.id,
            permType: key === '2' ? 2 : 1,
        },
    }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                message.success(`已添加 ${user.realName || user.username} 为${permLabel}`)
                // 从用户列表移除
                userList.value = userList.value.filter((u: any) => u.id !== user.id)
                // 添加到协作者列表
                collaborators.value.push({
                    id: user.id,
                    targetId: user.id,
                    targetType: 1,
                    targetName: user.realName || user.username,
                    name: user.realName || user.username,
                    permLabel,
                    permType: key === '2' ? 2 : 1,
                    isMe: false,
                })
            } else {
                message.error(res?.message || '添加失败')
            }
        })
        .catch(() => {
            message.error('添加失败')
        })
}

// ========== 添加视图 - 组织架构 ==========
/** 加载部门树 */
function loadDeptTree() {
    if (deptTree.value.length > 0) return
    defHttp.get({ url: api.deptTree }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                deptTree.value = res.result || []
            }
        })
        .catch(() => {
            deptTree.value = []
        })
}

const filteredDeptTree = computed(() => {
    if (!deptSearchText.value) return deptTree.value
    return filterDeptTree(deptTree.value, deptSearchText.value.toLowerCase())
})

function filterDeptTree(tree: any[], keyword: string): any[] {
    return tree
        .map((node: any) => {
            const nameMatch = node.name && node.name.toLowerCase().includes(keyword)
            const filteredChildren = node.children ? filterDeptTree(node.children, keyword) : []
            if (nameMatch || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren }
            }
            return null
        })
        .filter(Boolean)
}

function onDeptSearch() {
    // computed 自动响应
}

/** 添加部门协作者（部门及其所有下级部门用户均获得权限） */
function addDeptCollaborator(dept: any, key: string) {
    const permLabel = key === '1' ? '可查看' : '可编辑'
    defHttp.post({
        url: api.permGrant,
        data: {
            folderId: props.folder.id,
            targetType: 2,
            targetId: dept.id,
            permType: key === '2' ? 2 : 1,
        },
    }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                message.success(`已添加 ${dept.name} 为${permLabel}`)
                collaborators.value.push({
                    id: dept.id,
                    targetId: dept.id,
                    targetType: 2,
                    targetName: dept.name,
                    name: dept.name,
                    permLabel,
                    permType: key === '2' ? 2 : 1,
                    isMe: false,
                })
            } else {
                message.error(res?.message || '添加失败')
            }
        })
        .catch(() => {
            message.error('添加失败')
        })
}

/** 关闭弹窗 */
function handleClose() {
    emit('close')
}
</script>

<style scoped lang="less">
// 搜索栏
.search-bar {
    margin-bottom: 20px;

    :deep(.ant-input-search) {
        background: #f5f7fa;
        border: 1px solid transparent;
        border-radius: 8px;
        transition: all 0.25s;

        &:hover,
        &:focus-within {
            background: #fff;
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }

        .ant-input {
            border: none;
            background: transparent;
            font-size: 13px;
        }

        .ant-input-search-button {
            border: none;
            background: transparent;
        }
    }
}

// 权限区域
.perm-section {
    margin-bottom: 24px;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        padding: 0 0 10px;

        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2329;
            display: flex;
            align-items: center;
            gap: 6px;

            .help-icon {
                color: #c0c4cc;
                font-size: 13px;
                cursor: help;

                &:hover {
                    color: #1890ff;
                }
            }
        }

        .add-link {
            font-size: 13px;
            color: #1890ff;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border-radius: 4px;
            transition: all 0.2s;

            &:hover {
                color: #40a9ff;
                background: rgba(24, 144, 255, 0.06);
            }
        }
    }

    .perm-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        margin: 0 -12px;
        border-radius: 8px;
        transition: background 0.2s;

        &:hover {
            background: #f5f7fa;
        }

        &.inherited {
            .perm-user .user-name {
                color: #8f959e;
            }
        }

        .perm-user {
            display: flex;
            align-items: center;
            gap: 10px;

            .avatar {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: linear-gradient(135deg, #e8f4ff 0%, #d6e8ff 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1890ff;
                font-size: 15px;
                flex-shrink: 0;

                &.avatar-upload {
                    background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
                    color: #fa8c16;
                }
            }

            .user-name {
                font-size: 13px;
                color: #1f2329;
                font-weight: 450;
            }

            .view-link {
                font-size: 12px;
                color: #1890ff;
                margin-left: 6px;
                padding: 1px 6px;
                border-radius: 3px;

                &:hover {
                    background: rgba(24, 144, 255, 0.08);
                }
            }
        }

        .perm-role-tag {
            font-size: 12px;
            padding: 4px 14px;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            color: #606266;
            cursor: pointer;
            background: #fff;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;

            &:hover {
                color: #1890ff;
                border-color: #1890ff;
            }

            &.inherited-tag {
                color: #8f959e;
                border-color: #ebeef5;
                background: #f5f7fa;
                cursor: default;

                &:hover {
                    color: #8f959e;
                    border-color: #ebeef5;
                }
            }
        }
    }
}

// 底部操作栏
.modal-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
    margin-top: 4px;
}

// 添加视图标题栏
.add-title-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .back-btn {
        font-size: 13px;
        color: #606266;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.06);
        }
    }

    .title-text {
        font-size: 16px;
        font-weight: 600;
        color: #1f2329;
    }
}

// Tab 切换
.add-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 4px;

    .tab-item {
        padding: 6px 20px;
        font-size: 13px;
        color: #606266;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.25s;
        font-weight: 450;

        &.active {
            color: #1890ff;
            background: #fff;
            font-weight: 500;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }

        &:hover:not(.active) {
            color: #1890ff;
        }
    }
}

// 用户列表
.user-list {
    max-height: 360px;
    overflow-y: auto;
    margin: 0 -12px;
    padding: 0 12px;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 2px;
    }

    .user-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        margin: 0 -12px;
        border-radius: 8px;
        gap: 12px;
        transition: background 0.2s;

        &:hover {
            background: #f5f7fa;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 100px;

            .avatar {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: linear-gradient(135deg, #e8f4ff 0%, #d6e8ff 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1890ff;
                font-size: 15px;
                flex-shrink: 0;
            }

            .user-name {
                font-size: 13px;
                color: #1f2329;
                font-weight: 450;
            }
        }

        .user-contact {
            flex: 1;
            font-size: 11px;
            color: #8f959e;
        }

        .add-perm-btn {
            font-size: 12px;
            padding: 4px 14px;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            color: #606266;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            background: #fff;
            transition: all 0.2s;

            &:hover {
                color: #1890ff;
                border-color: #1890ff;
                background: rgba(24, 144, 255, 0.04);
            }
        }
    }
}

// 组织架构
.org-panel {
    max-height: 360px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 2px;
    }
}

// 组织架构节点
.dept-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-right: 8px;

    .dept-name {
        font-size: 13px;
        color: #1f2329;
    }

    .add-perm-btn {
        font-size: 12px;
        padding: 2px 12px;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        color: #606266;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        background: #fff;
        transition: all 0.2s;

        &:hover {
            color: #1890ff;
            border-color: #1890ff;
            background: rgba(24, 144, 255, 0.04);
        }
    }
}
</style>
