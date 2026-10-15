<template>
    <div class="ocr-task-container">
        <!-- 左侧任务列表 -->
        <div class="task-sidebar">
            <div class="sidebar-header">
                <a-button type="primary" block @click="handleNewTask">新建任务</a-button>
            </div>
            <div class="sidebar-search">
                <a-input v-model:value="searchForm.name" placeholder="任务名称或受理编号" allow-clear size="small"
                    @pressEnter="handleSearch" />
                <div class="search-btns">
                    <a-button type="primary" size="small" @click="handleSearch">
                        <SearchOutlined />查询
                    </a-button>
                    <a-button size="small" @click="handleReset">重置</a-button>
                </div>
            </div>
            <div class="task-list">
                <div v-for="item in taskList" :key="item.id" class="task-item" @click="selectTask(item)">
                    <div class="task-item-info">
                        <div class="task-item-name-row" :class="{ active: currentTask?.id === item.id }">
                            <span class="task-item-name">{{ item.name }}</span>
                            <DeleteOutlined v-if="currentTask?.id === item.id" @click.stop="deleteTask(item)" />
                        </div>
                        <div class="task-item-meta">
                            <span>{{ item.createTime }}</span>
                        </div>
                    </div>
                </div>
                <a-empty v-if="taskList.length === 0" description="暂无抽取任务" :image-style="{ height: '48px' }" />
            </div>
            <div class="task-pagination" v-if="taskPagination.total > 0">
                <a-pagination v-model:current="taskPagination.current" v-model:pageSize="taskPagination.pageSize"
                    :total="taskPagination.total" size="small" :show-total="(t: number) => `共 ${t} 条`" simple
                    @change="onTaskPageChange" />
            </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="task-content">
            <!-- 新建任务表单 -->
            <div v-if="!currentTask" class="new-task-panel">
                <div class="panel-title">新建抽取任务</div>
                <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
                    <a-form-item label="抽取配置" required>
                        <a-select v-model:value="newTaskForm.ocrSceneCode" placeholder="请选择抽取配置" :options="sceneOptions"
                            allow-clear />
                    </a-form-item>
                    <a-form-item label="受理编号">
                        <a-input v-model:value="newTaskForm.slbh" placeholder="请输入受理编号（可选）" allow-clear />
                    </a-form-item>
                    <a-form-item label="PDF文件" required>
                        <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" accept=".pdf"
                            :max-count="1">
                            <a-button>
                                <UploadOutlined />
                                选择PDF文件
                            </a-button>
                        </a-upload>
                    </a-form-item>
                    <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
                        <a-button type="primary" :loading="extracting" @click="submitNewTask">
                            {{ extracting ? '抽取中，请耐心等待…' : '开始抽取' }}
                        </a-button>
                    </a-form-item>
                </a-form>
            </div>

            <!-- 任务详情与抽取结果 -->
            <div v-else class="task-detail-panel">
                <div class="panel-title">结果查看</div>
                <a-descriptions :column="2" size="small" bordered class="task-desc">
                    <a-descriptions-item label="任务名称">{{ currentTask.name }}</a-descriptions-item>
                    <a-descriptions-item label="抽取配置">{{ currentTask.ocrSceneCode }}</a-descriptions-item>
                    <a-descriptions-item label="受理编号">{{ currentTask.slbh || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="创建时间">{{ currentTask.createTime }}</a-descriptions-item>
                </a-descriptions>

                <template v-if="taskData">
                    <!-- 单一字段 -->
                    <div v-if="singleRows.length > 0" class="result-block">
                        <div class="block-title">单个字段</div>
                        <a-table :columns="singleColumns" :data-source="singleRows" :pagination="false" size="small"
                            bordered :scroll="{ y: 320 }" />
                    </div>

                    <!-- 组合字段 -->
                    <div v-for="(rows, groupName) in comboData" :key="groupName" class="result-block">
                        <div class="block-title">{{ groupName }}（{{ rows.length }} 条）</div>
                        <a-table v-if="rows.length > 0" :columns="buildComboColumns(rows)"
                            :data-source="buildComboRows(rows)" :pagination="false" size="small" bordered
                            :scroll="{ x: 'max-content', y: 320 }" />
                        <a-empty v-else description="无数据" :image-style="{ height: '40px' }" />
                    </div>
                </template>
                <a-empty v-else description="暂无抽取结果" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { DeleteOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { defHttp } from '/@/utils/http/axios'
import { message, Modal } from 'ant-design-vue'

enum api {
    add = '/api/zrzy-bdc/ocr/task/add',
    list = '/api/zrzy-bdc/ocr/task/list',
    queryById = '/api/zrzy-bdc/ocr/task/queryById',
    delete = '/api/zrzy-bdc/ocr/task/delete',
    sceneList = '/api/zrzy-bdc/ocr/scene/queryAllList'
}

// 左侧任务列表
let taskList = ref<any[]>([])
let currentTask = ref<any>(null)

// 任务列表分页
const taskPagination = ref({
    total: 0,
    current: 1,
    pageSize: 10
})

// 查询条件
const searchForm = ref({
    name: '',
})

// 抽取配置（场景）下拉选项
let sceneOptions = ref<any[]>([])

// 新建任务表单
let newTaskForm = ref<any>({
    ocrSceneCode: "sqb",
    slbh: ''
})
let fileList = ref<any[]>([])
let extracting = ref(false)

// 单一字段表格
const singleColumns = [
    { title: '字段', dataIndex: 'name', width: 220 },
    { title: '值', dataIndex: 'value' }
]

// 解析后的抽取结果
const taskData = computed<any>(() => {
    if (!currentTask.value?.data) return null
    try {
        return JSON.parse(currentTask.value.data)
    } catch (e) {
        return null
    }
})

// 单一字段行数据
const singleRows = computed(() => {
    const singleKey = taskData.value?.singleKey || {}
    return Object.keys(singleKey).map((k, i) => ({ key: i, name: k, value: singleKey[k] ?? '' }))
})

// 组合字段数据
const comboData = computed<Record<string, any[]>>(() => {
    return taskData.value?.comboKey || {}
})

/**
 * 构建组合字段表格列（按第一行的字段顺序）
 */
function buildComboColumns(rows: any[]) {
    const keys: string[] = []
    rows.forEach((row) => {
        Object.keys(row).forEach((k) => {
            if (!keys.includes(k)) keys.push(k)
        })
    })
    return keys.map((k) => ({ title: k, dataIndex: k }))
}

/**
 * 构建组合字段表格行数据
 */
function buildComboRows(rows: any[]) {
    return rows.map((row, i) => ({ ...row, key: i }))
}

onMounted(() => {
    loadScenes()
    loadTasks()
})

/**
 * 加载抽取配置（场景）下拉选项
 */
function loadScenes() {
    defHttp.get({ url: api.sceneList }, { withToken: true }).then((res: any) => {
        if (res?.success) {
            sceneOptions.value = (res.result || []).map((s: any) => ({
                label: s.sceneName ? `${s.sceneName}（${s.code}）` : s.code,
                value: s.code
            }))
        }
    })
}

/**
 * 加载任务列表
 */
function loadTasks() {
    defHttp
        .get(
            {
                url: api.list,
                params: {
                    pageNo: taskPagination.value.current,
                    pageSize: taskPagination.value.pageSize,
                    name: searchForm.value.name || ""
                }
            },
            { withToken: true }
        )
        .then((res: any) => {
            if (res?.success) {
                taskList.value = res.result?.records || []
                taskPagination.value.total = res.result?.total || 0
                // 首次加载时默认选中第一条
                if (!currentTask.value && taskList.value.length > 0) {
                    selectTask(taskList.value[0])
                }
            }
        })
}

/**
 * 查询
 */
function handleSearch() {
    taskPagination.value.current = 1
    currentTask.value = null
    loadTasks()
}

/**
 * 重置查询条件
 */
function handleReset() {
    searchForm.value = { name: '' }
    taskPagination.value.current = 1
    currentTask.value = null
    loadTasks()
}

/**
 * 任务列表分页切换
 */
function onTaskPageChange(page: number) {
    taskPagination.value.current = page
    currentTask.value = null
    loadTasks()
}

/**
 * 新建任务 - 清空右侧表单
 */
function handleNewTask() {
    currentTask.value = null
    newTaskForm.value = { ocrSceneCode: undefined, slbh: '' }
    fileList.value = []
}

/**
 * 选择任务 - 加载详情（含抽取结果）
 */
function selectTask(item: any) {
    defHttp
        .get({ url: api.queryById, params: { id: item.id } }, { withToken: true })
        .then((res: any) => {
            if (res?.success) {
                currentTask.value = res.result
            } else {
                message.error(res?.message || '查询任务详情失败')
            }
        })
}

/**
 * 上传前拦截，阻止自动上传
 */
function beforeUpload() {
    return false
}

/**
 * 提交新建任务：上传PDF并执行抽取
 */
function submitNewTask() {

    if (fileList.value.length === 0) {
        message.warning('请选择待抽取的PDF文件')
        return
    }

    const formData = new FormData()
    formData.append('file', fileList.value[0].originFileObj)
    formData.append('slbh', newTaskForm.value.slbh || '')
    formData.append('ocrSceneCode', newTaskForm.value.ocrSceneCode)

    extracting.value = true
    defHttp
        .post(
            {
                url: api.add, data: formData,
                headers: { "Content-Type": "multipart/form-data" }, timeout: 10 * 60 * 1000
            },
            { withToken: true }
        )
        .then((res: any) => {
            if (res?.success) {
                message.success('抽取完成')
                taskPagination.value.current = 1
                loadTasks()
                // 直接展示新任务结果
                currentTask.value = res.result
                fileList.value = []
                newTaskForm.value = { ocrSceneCode: newTaskForm.value.ocrSceneCode, slbh: '' }
            } else {
                message.error(res?.message || '抽取任务失败')
            }
        })
        .catch((err: any) => {
            message.error(err?.message || '抽取任务失败')
        })
        .finally(() => {
            extracting.value = false
        })
}

/**
 * 删除任务
 */
function deleteTask(item: any) {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除任务「${item.name}」吗？`,
        okText: '确定',
        cancelText: '取消',
        onOk() {
            defHttp
                .delete({ url: api.delete, params: { id: item.id } }, { withToken: true })
                .then((res: any) => {
                    if (res?.success) {
                        message.success('删除成功')
                        if (currentTask.value?.id === item.id) {
                            handleNewTask()
                        }
                        // 当前页删空了且不是第一页，回退一页
                        if (taskList.value.length <= 1 && taskPagination.value.current > 1) {
                            taskPagination.value.current--
                        }
                        loadTasks()
                    } else {
                        message.error(res?.message || '删除失败')
                    }
                })
        }
    })
}
</script>

<style lang="less" scoped>
.ocr-task-container {
    display: flex;
    height: calc(100vh - 150px);
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
}

// 左侧边栏
.task-sidebar {
    width: 260px;
    min-width: 260px;
    border-right: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;

    .sidebar-header {
        padding: 16px;
    }

    .sidebar-search {
        padding: 0 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-bottom: 1px solid #f0f0f0;

        .search-btns {
            display: flex;
            gap: 8px;
        }
    }

    .task-list {
        flex: 1;
        overflow-y: auto;
        padding: 0 8px;

        .task-item {
            margin: 0 16px;
            padding: 12px 0;
            cursor: pointer;
            transition: all 0.2s;
            border-bottom: 1px solid #e8e9eb;

            .task-item-info {
                .task-item-name-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;

                    .task-item-name {
                        font-size: 13px;
                        color: #333;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        flex: 1;
                    }

                    &.active .task-item-name {
                        color: #1890ff !important;
                    }
                }

                .task-item-meta {
                    font-size: 12px;
                    color: #999;
                }
            }
        }
    }

    .task-pagination {
        padding: 8px 16px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: center;
    }
}

// 右侧内容区
.task-content {
    flex: 1;
    padding: 24px 32px;
    overflow-y: auto;

    .panel-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
    }

    .task-desc {
        margin-bottom: 20px;
    }

    .result-block {
        margin-bottom: 20px;

        .block-title {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
            padding-left: 8px;
            border-left: 3px solid #1890ff;
        }
    }
}
</style>
