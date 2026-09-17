<template>
    <div class="doc-container">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-bar">
            <a-breadcrumb>
                <a-breadcrumb-item>
                    <a @click="navigateTo('0')">我的文档</a>
                </a-breadcrumb-item>
                <a-breadcrumb-item v-for="item in breadcrumbList" :key="item.id">
                    <a @click="navigateTo(item.id, item.myPermType)">{{ item.folderName }}</a>
                </a-breadcrumb-item>
            </a-breadcrumb>
        </div>

        <!-- 工具栏（只读协作者隐藏） -->
        <div v-if="!filePreview && currentFolderPerm !== 1" class="toolbar">
            <a-space>
                <a-button type="primary" @click="showNewFolderModal">
                    <template #icon>
                        <FolderAddOutlined />
                    </template>
                    新建文件夹
                </a-button>
                <a-upload :multiple="true" :show-upload-list="false" :custom-request="handleUpload">
                    <a-button type="primary" ghost>
                        <template #icon>
                            <UploadOutlined />
                        </template>
                        上传文件
                    </a-button>
                </a-upload>
            </a-space>
        </div>

        <!-- 可滚动内容区 -->
        <div v-if="!filePreview" class="content-scroll">
            <!-- 统一列表（文件夹+文件） -->
            <a-table :columns="columns" :data-source="mergedList" :pagination="false" row-key="id" size="middle">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'name'">
                        <span v-if="record._type === 'folder'" class="name-cell folder-link"
                            @click="navigateTo(record.id, record.myPermType)">
                            <FileIcon type="folder" />
                            {{ record.folderName }}
                        </span>
                        <span v-else class="name-cell">
                            <FileIcon :file-name="record.fileName" />
                            {{ record.fileName }}
                        </span>
                    </template>
                    <template v-if="column.key === 'fileSize'">
                        {{ record._type === 'file' ? formatFileSize(record.fileSize) : '-' }}
                    </template>
                    <template v-if="column.key === 'createTime'">
                        {{ record.createTime }}
                    </template>
                    <template v-if="column.key === 'action'">
                        <template v-if="record._type === 'folder'">
                            <a-space v-if="record.myPermType === 0">
                                <a @click="showEditFolderModal(record)">编辑</a>
                                <a @click="showPermissionModal(record)">协作</a>
                                <a-popconfirm title="确定删除此文件夹及其内容？" @confirm="deleteFolder(record.id)">
                                    <a style="color: #ff4d4f">删除</a>
                                </a-popconfirm>
                            </a-space>
                            <span v-else class="readonly-tag">仅查看</span>
                        </template>
                        <template v-else>
                            <a-space>
                                <a v-if="record.myPermType === 0" @click="showPermissionModal(record)">协作</a>
                                <a @click="previewFile(record)">预览</a>
                                <a @click="downloadFile(record)">下载</a>
                                <template v-if="record.myPermType !== 1">
                                    <a @click="showMoveModal(record)">移动</a>
                                    <a-popconfirm title="确定删除此文件？" @confirm="deleteFile(record.id)">
                                        <a style="color: #ff4d4f">删除</a>
                                    </a-popconfirm>
                                </template>
                            </a-space>
                        </template>
                    </template>
                </template>
            </a-table>

            <!-- 空状态 -->
            <a-empty v-if="mergedList.length === 0" description="当前目录为空" />
        </div>

        <!-- 新建/编辑文件夹弹窗 -->
        <a-modal v-model:open="folderModalVisible" :title="folderModalType === 'new' ? '新建文件夹' : '编辑文件夹'"
            @ok="handleFolderSubmit" @cancel="folderModalVisible = false">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
                <a-form-item label="文件夹名称">
                    <a-input v-model:value="folderForm.folderName" placeholder="请输入文件夹名称" />
                </a-form-item>
                <a-form-item label="排序号">
                    <a-input-number v-model:value="folderForm.orderNum" :min="0" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 移动文件弹窗 -->
        <a-modal v-model:open="moveModalVisible" title="移动到" @ok="handleMoveSubmit" @cancel="moveModalVisible = false">
            <a-tree v-if="allFolderTree.length > 0" :tree-data="folderTreeData" :selected-keys="selectedFolderKeys"
                @select="onFolderTreeSelect" default-expand-all />
            <a-empty v-else description="暂无其它文件夹" />
        </a-modal>

        <!-- 协同授权弹窗 -->
        <PermissionModal v-if="permissionModalVisible" :folder="currentPermissionFolder"
            @close="permissionModalVisible = false" />

        <!-- 文件预览 -->
        <div v-if="filePreview" class="file-preview">
            <div class="preview-ops">
                <a @click="downloadFile(previewData)">下载</a>
                <a @click="closePreview" style="margin-left: 12px">关闭</a>
            </div>
            <iframe v-if="previewData.previewUrl" :src="previewData.previewUrl" style="border: none"
                class="preview-iframe" />
            <a-empty v-else description="该文件暂不支持预览" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
    FolderAddOutlined,
    UploadOutlined,
} from '@ant-design/icons-vue'
import FileIcon from '/@/components/FileIcon.vue'
import { defHttp } from '/@/utils/http/axios'
import { Base64 } from 'js-base64'
import PermissionModal from './components/PermissionModal.vue'

// API 地址
const api = {
    folderList: '/api/zrzy-bdc/doc/folder/list',
    folderAdd: '/api/zrzy-bdc/doc/folder/add',
    folderUpdate: '/api/zrzy-bdc/doc/folder/update',
    folderDelete: '/api/zrzy-bdc/doc/folder/delete',
    folderBreadcrumb: '/api/zrzy-bdc/doc/folder/breadcrumb',
    folderTree: '/api/zrzy-bdc/doc/folder/tree',
    fileList: '/api/zrzy-bdc/doc/file/list',
    fileUpload: '/api/zrzy-bdc/doc/file/upload',
    fileDelete: '/api/zrzy-bdc/doc/file/delete',
    fileDownload: '/api/zrzy-bdc/doc/file/download',
    fileMove: '/api/zrzy-bdc/doc/file/move',
}

// 当前文件夹ID
const currentFolderId = ref('0')

// 当前文件夹权限：0=所有者 1=只能查看 2=可编辑
const currentFolderPerm = ref<number>(0)

// 面包屑
const breadcrumbList = ref<any[]>([])

// 文件夹列表
const folderList = ref<any[]>([])

// 文件列表
const fileList = ref<any[]>([])

// 合并列表：文件夹在前，文件在后
const mergedList = computed(() => {
    const folders = folderList.value.map((f) => ({ ...f, _type: 'folder' }))
    const files = fileList.value.map((f) => ({ ...f, _type: 'file' }))
    return [...folders, ...files]
})

// 统一表格列
const columns = [
    { title: '名称', key: 'name', dataIndex: 'name' },
    { title: '大小', key: 'fileSize', dataIndex: 'fileSize', width: 120 },
    { title: '时间', key: 'createTime', dataIndex: 'createTime', width: 180 },
    { title: '操作', key: 'action', width: 260 },
]



// 文件夹弹窗
const folderModalVisible = ref(false)
const folderModalType = ref('new')
const folderForm = ref<any>({ folderName: '', orderNum: 0, parentId: '0' })

// 移动弹窗
const moveModalVisible = ref(false)
const moveFileId = ref('')
const allFolderTree = ref<any[]>([])
const selectedFolderKeys = ref<string[]>([])

// 协同弹窗
const permissionModalVisible = ref(false)
const currentPermissionFolder = ref<any>(null)

// 文件预览
const filePreview = ref(false)
const previewData = ref<any>({})
const kkFileApi = ref('')
const baseApi = ref('')
const proxyBaseApi = ref('')

// 文件夹树数据（给移动弹窗使用）
const folderTreeData = computed(() => {
    return buildTree(allFolderTree.value, '0')
})

/** 构建树结构 */
function buildTree(list: any[], parentId: string): any[] {
    return list
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
            key: item.id,
            title: item.folderName,
            children: buildTree(list, item.id),
        }))
}

/** 初始化加载 */
onMounted(() => {
    const cfg = (window as any).settingConfig || {}
    kkFileApi.value = cfg.kkFileDomain || ''
    baseApi.value = cfg.baseDomain || ''
    proxyBaseApi.value = cfg.proxyBaseDomain || ''
    loadData()
})

/** 加载当前目录数据 */
function loadData() {
    loadFolders()
    loadFiles()
    loadBreadcrumb()
}

/** 加载文件夹列表 */
function loadFolders() {
    defHttp.get({ url: api.folderList, params: { parentId: currentFolderId.value } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                folderList.value = res.result || []
            }
        })
}

/** 加载文件列表 */
function loadFiles() {
    defHttp.get({ url: api.fileList, params: { folderId: currentFolderId.value } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                fileList.value = res.result || []
            }
        })
}

/** 加载面包屑 */
function loadBreadcrumb() {
    if (currentFolderId.value === '0') {
        breadcrumbList.value = []
        return
    }
    defHttp.get({ url: api.folderBreadcrumb, params: { folderId: currentFolderId.value } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                breadcrumbList.value = res.result || []
            }
        })
}

/** 导航到指定文件夹 */
function navigateTo(folderId: string, perm?: number) {
    currentFolderId.value = folderId
    currentFolderPerm.value = perm ?? 0
    // 点击面包屑时关闭预览
    if (filePreview.value) {
        closePreview()
    }
    loadData()
}

/** 新建文件夹弹窗 */
function showNewFolderModal() {
    folderModalType.value = 'new'
    folderForm.value = { folderName: '', orderNum: 0, parentId: currentFolderId.value }
    folderModalVisible.value = true
}

/** 编辑文件夹弹窗 */
function showEditFolderModal(folder: any) {
    folderModalType.value = 'edit'
    folderForm.value = { ...folder }
    folderModalVisible.value = true
}

/** 提交文件夹 */
function handleFolderSubmit() {
    if (!folderForm.value.folderName) {
        message.warning('请输入文件夹名称')
        return
    }
    const url = folderModalType.value === 'new' ? api.folderAdd : api.folderUpdate
    defHttp.post({ url, data: folderForm.value }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                message.success(folderModalType.value === 'new' ? '新建成功' : '编辑成功')
                folderModalVisible.value = false
                loadData()
            } else {
                message.error(res?.message || '操作失败')
            }
        })
}

/** 删除文件夹 */
function deleteFolder(id: string) {
    defHttp.post({ url: api.folderDelete, params: { id } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                message.success('删除成功')
                loadData()
            } else {
                message.error(res?.message || '删除失败')
            }
        })
}

/** 上传文件 */
function handleUpload(options: any) {
    const formData = new FormData()
    formData.append('files', options.file)
    formData.append('folderId', currentFolderId.value)

    defHttp.post({ url: api.fileUpload, data: formData, headers: { 'Content-Type': 'multipart/form-data' } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                message.success('上传成功')
                loadData()
            } else {
                message.error(res?.message || '上传失败')
            }
        })
        .catch(() => {
            message.error('上传失败')
        })
}

/** 删除文件 */
function deleteFile(id: string) {
    defHttp.post({ url: api.fileDelete, params: { id } }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                message.success('删除成功')
                loadData()
            } else {
                message.error(res?.message || '删除失败')
            }
        })
}

/** 预览文件（kkFile） */
function previewFile(data: any) {
    filePreview.value = true
    previewData.value = { ...data }

    let format = ''
    if (data.fileName && data.fileName.includes('.')) {
        format = data.fileName.split('.').pop()?.toLowerCase() || ''
    }

    const base = ['jpg', 'png', 'jpeg'].includes(format) ? proxyBaseApi.value : baseApi.value
    const newName = data.fileName.replace(/\.(?=[^.]*$)/, `${data.id}.`)
    const downloadUrl = `${base}/zrzy-bdc/bdcdj/upfiles/file/download?id=${data.id}&fullfilename=${newName}`
    const encodeUrl = encodeURIComponent(Base64.encode(downloadUrl))

    let officePreviewType = ''
    const pdfPreferred = ['pdf', 'doc', 'docx']
    if (format && pdfPreferred.includes(format)) {
        officePreviewType = '&officePreviewType=pdf'
    }

    previewData.value.previewUrl = `${kkFileApi.value}/onlinePreview?url=${encodeUrl}${officePreviewType}`
}

/** 关闭预览 */
function closePreview() {
    filePreview.value = false
    previewData.value = {}
}

/** 下载文件 */
function downloadFile(record: any) {
    defHttp.get(
        { url: api.fileDownload, params: { id: record.id }, responseType: 'blob' },
        { withToken: true, withTimeout: false }
    ).then((res: any) => {
        if (res.size === 0) {
            message.error('下载附件出错！')
            return
        }
        const blob = new Blob([res])
        const elink = document.createElement('a')
        elink.download = record.fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
    }).catch(() => {
        message.error('下载附件出错！')
    })
}

/** 显示移动弹窗 */
function showMoveModal(record: any) {
    moveFileId.value = record.id
    selectedFolderKeys.value = []
    // 加载所有文件夹
    defHttp.get({ url: api.folderTree }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                allFolderTree.value = res.result || []
            }
        })
    moveModalVisible.value = true
}

/** 选择目标文件夹 */
function onFolderTreeSelect(keys: string[]) {
    selectedFolderKeys.value = keys
}

/** 提交移动 */
function handleMoveSubmit() {
    if (selectedFolderKeys.value.length === 0) {
        message.warning('请选择目标文件夹')
        return
    }
    defHttp.post({
        url: api.fileMove,
        params: { fileId: moveFileId.value, targetFolderId: selectedFolderKeys.value[0] },
    }, { withToken: true })
        .then((res: any) => {
            if (res?.success || res?.code === 200) {
                message.success('移动成功')
                moveModalVisible.value = false
                loadData()
            } else {
                message.error(res?.message || '移动失败')
            }
        })
}

/** 显示协同弹窗 */
function showPermissionModal(folder: any) {
    currentPermissionFolder.value = folder
    permissionModalVisible.value = true
}

/** 格式化文件大小 */
function formatFileSize(size: string | number) {
    const num = typeof size === 'string' ? parseInt(size) : size
    if (!num || num === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let s = num
    while (s >= 1024 && i < units.length - 1) {
        s /= 1024
        i++
    }
    return s.toFixed(2) + ' ' + units[i]
}
</script>

<style scoped lang="less">
.doc-container {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.breadcrumb-bar {
    flex-shrink: 0;
    margin-bottom: 16px;
    padding: 8px 12px;
    background: #fafafa;
    border-radius: 4px;
}

.toolbar {
    flex-shrink: 0;
    margin-bottom: 16px;
}

.content-scroll {
    flex: 1;
    overflow: auto;
    min-height: 0;
}

.name-cell {
    display: inline-flex;
    align-items: center;
}

.folder-link {
    cursor: pointer;

    &:hover {
        color: #1890ff;
    }
}

.readonly-tag {
    color: #8f959e;
    font-size: 12px;
}

.file-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    overflow: hidden;

    .preview-ops {
        padding: 8px 16px;
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
    }

    .preview-iframe {
        flex: 1;
        width: 100%;
        min-height: 500px;
    }
}
</style>
