<template>
    <div class="tenant-info-container">
        <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ style: { width: '160px' } }"
            style="padding: 20px;">
            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="租户ID" name="id">
                        <a-input v-model:value="formData.id" placeholder="系统自动生成" :disabled="true" />
                    </a-form-item>
                </a-col>
                <a-col :span="24">
                    <a-form-item label="租户名称" name="name">
                        <a-input v-model:value="formData.name" placeholder="请输入租户名称" allow-clear />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="上级租户" name="parentTenantId">
                        <a-select v-model:value="formData.parentTenantId" placeholder="请选择上级租户"
                            :options="parentTenantList" allow-clear :field-names="{ label: 'name', value: 'id' }">
                        </a-select>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="租户层级" name="tenantLevel">
                        <a-select v-model:value="formData.tenantLevel" placeholder="请选择租户层级">
                            <a-select-option value="省级">省级</a-select-option>
                            <a-select-option value="市级">市级</a-select-option>
                            <a-select-option value="县级">县级</a-select-option>
                            <a-select-option value="乡镇级">乡镇级</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="24">
                <a-col :span="24">
                    <a-form-item label="关联区域" name="qxdm">
                        <a-tree-select v-model:value="formData.qxdm" tree-data-simple-mode treeDefaultExpandAll
                            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="gData" tree-checkable
                            allow-clear />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="24">
                <a-col :span="24">
                    <a-form-item label="关联机构" name="department">
                        <a-tree-select v-model:value="formData.department" :tree-data="deptListOption"
                            :fieldNames="{ label: 'name', value: 'id' }" treeDefaultExpandAll style="width: 100%"
                            allow-clear placeholder="请选择部门" />
                        <!-- <a-select v-model:value="formData.department" placeholder="请选择关联机构" allow-clear>
                            <a-select-option v-for="item in orgList" :key="item.id" :value="item.id">
                                {{ item.orgName }}
                            </a-select-option>
                        </a-select> -->
                    </a-form-item>
                </a-col>

            </a-row>
            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="租户开始日期" name="beginDate">
                        <a-date-picker v-model:value="formData.beginDate" style="width: 100%;" placeholder="请选择租户开始日期"
                            format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="租户结束日期" name="endDate">
                        <a-date-picker v-model:value="formData.endDate" style="width: 100%;" placeholder="请选择租户结束日期"
                            format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                    </a-form-item>
                </a-col>

            </a-row>
            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="租户联系人" name="lxr">
                        <a-input v-model:value="formData.lxr" placeholder="请输入联系人" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="联系人电话" name="lxdh">
                        <a-input v-model:value="formData.lxdh" placeholder="请输入联系电话" />
                    </a-form-item>
                </a-col>

            </a-row>

            <a-row :gutter="24">
                <a-col :span="12">
                    <a-form-item label="租户状态">
                        <a-radio-group v-model:value="formData.status">
                            <a-radio :value="0">停用</a-radio>
                            <a-radio :value="1">正常</a-radio>
                            <a-radio :value="2">注销</a-radio>
                        </a-radio-group>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="租户管理员" name="tenantAdmin">
                        <c-input-table v-model="formData.tenantAdmin" :columns="columns" :dataSource="userList"
                            searchField="username" displayField="username" @select="handleSelect" />
                    </a-form-item>
                </a-col>
            </a-row>
            <a-row :gutter="24" v-if="showActionButtons">
                <a-col :span="24" style="text-align: center;">
                    <a-space>
                        <a-button type="primary" @click="saveTenant">保存</a-button>
                        <a-button v-if="!isAddMode" @click="handleDel">删除</a-button>
                        <a-button v-if="isAddMode" @click="handleCancel">取消</a-button>
                    </a-space>
                </a-col>
            </a-row>
        </a-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, createVNode } from "vue";
import { defHttp } from '/@/utils/http/axios';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
const props = defineProps({
    selectInfo: {
        type: Object,
        default: () => ({})
    },
    isAddMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['refreshList', 'cancelAdd']);
let deptListOption = ref<any>([])
const formRef = ref();
const parentTenantList = ref<any[]>([]);
const formData = reactive<any>({});

// 初始化空表单
function initEmptyForm() {
    formData.id = ''
    formData.name = ''
    formData.parentTenantId = ''
    formData.tenantLevel = ''
    formData.qxdm = []
    formData.department = ''
    formData.lxr = ''
    formData.lxdh = ''
    formData.status = '1'
    formData.tenantAdmin = ""
    formData.beginDate = ''
    formData.endDate = ''
    formData.createTime = ''
    formData.updateTime = ''
}

const rules = {
    name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
    tenantLevel: [{ required: true, message: '请选择租户层级', trigger: 'change' }]
};
/**
 * 加载上级租户列表
 */
function loadParentTenantList() {
    defHttp.get(
        {
            url: '/api/zrzy-system/sys/tenant/list',
        },
        { withToken: true }
    ).then((res: any) => {
        if (res && res.success) {
            parentTenantList.value = res.result || []
            // 移除当前选中的租户，避免自己选择自己作为上级租户
            if (props.selectInfo && props.selectInfo.id) {
                parentTenantList.value = parentTenantList.value.filter((tenant: any) => tenant.id !== props.selectInfo.id)
            }
        }
    })
}

/**
 * 保存租户
 */
async function saveTenant() {
    try {
        await formRef.value.validate();
        formData.parentTenantId = formData.parentTenantId || null
        const url = formData.id
            ? '/api/zrzy-system/sys/tenant/update'
            : '/api/zrzy-system/sys/tenant/add';

        defHttp.post(
            {
                url: url,
                data: { ...formData, qxdm: formData.qxdm.join(',') }
            },
            { withToken: true }
        ).then((res: any) => {
            if (res && res.success) {
                message.success(formData.id ? '修改成功！' : '添加成功！')
                emit('refreshList')
                // 如果是新增模式，重置表单
                if (!formData.id) {
                    initEmptyForm()
                }
                return true
            } else {
                message.warning(res.message || '操作失败！')
                return false
            }
        })
    } catch (error) {
        console.error('验证失败:', error);
        return false
    }
}
function handleDel() {
    Modal.confirm({
        title: '确定要删除该租户吗?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '租户名称：' + formData.name,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
            defHttp.post(
                {
                    url: '/api/zrzy-system/sys/tenant/delete',
                    params: { id: props.selectInfo.id }
                },
                { withToken: true }
            ).then((res: any) => {
                if (res && res.success) {
                    message.success('删除成功！')
                    emit('refreshList')
                    emit('cancelAdd')
                } else {
                    message.warning(res.message || '操作失败！')
                }
            })
        },
        onCancel() {
        },
    });

}

/**
 * 加载租户详情
 */
function loadTenantDetail() {
    if (props.selectInfo && props.selectInfo.id) {
        defHttp.get(
            {
                url: '/api/zrzy-system/sys/tenant/queryById',
                params: { id: props.selectInfo.id }
            },
            { withToken: true }
        ).then((res: any) => {
            if (res && res.success) {
                Object.assign(formData, { ...res.result, qxdm: res.result.qxdm === "" ? [] : res.result.qxdm.split(',') })
            }
        })
    } else if (props.isAddMode) {
        // 新增模式，初始化空表单
        initEmptyForm()
    }
}

// 保存和取消按钮
const showActionButtons = computed(() => {
    return props.isAddMode || (props.selectInfo && props.selectInfo.id)
})

const gData = ref<any>();

function loadRegionList() {
    defHttp.get(
        {
            url: '/api/zrzy-system/sys/areacode/queryAreaTreeAndZdgs',
            params: { bAllCheck: true }
        },
        { withToken: true }
    ).then((res: any) => {
        if (res?.success) {
            gData.value = normalizeTreeData(res?.result || [])
        } else {
            message.warning(res?.message || '未查询到数据！')
        }
    })
}
function normalizeTreeData(list: any[]) {
    return list.map(item => {
        const newItem = {
            ...item,
            key: item.areaCode,
            value: item.areaCode,
        }
        if (item.children?.length) {
            newItem.children = normalizeTreeData(item.children)
        }
        return newItem
    })
}
/**
 * 初始化树
 * 1、新增时左侧选择了部门 2、编辑时
 */
function loadCurrentBranchTrees() {
    return new Promise(resolve => {
        defHttp.get({
            url: '/api/zrzy-system/sys/dept/deptTree',
            params: { pid: 0 }
        }, {
            withToken: true
        }).then((res: any) => {
            if (res?.success) {
                deptListOption.value = res.result.map((item: any) => {
                    return {
                        ...item,
                        isLeaf: !item.hasChildren
                    }
                })
                resolve(res.result)
            } else {
                message.error(res?.message)
            }
        })
    })
}
let userList = ref([])
/**
 * 加载用户列表
 */
function loadUserList() {
    defHttp.get(
        {
            url: '/api/zrzy-system/sys/v1/user/page?userName=&deptId=',
            params: { pageNo: 1, pageSize: 10 }
        },
        { withToken: true }
    ).then((res: any) => {
        if (res && res.success) {
            userList.value = res.result.records || []
        }
    })
}

const columns = [
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 60,
    },
    {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
    },
    {
        title: '姓名',
        dataIndex: 'realName',
        key: 'realName',
    },
    {
        title: '性别',
        dataIndex: 'sex',
        key: 'sex',
    }
]
function handleSelect(record) {
    formData.tenantAdmin = record.username
}
/**
 * 取消操作
 */
function handleCancel() {
    if (props.isAddMode) {
        emit('cancelAdd')
    }
}

defineExpose({
    saveTenant
})

// 监听selectInfo和isAddMode变化
watch(() => [props.selectInfo, props.isAddMode], () => {
    loadTenantDetail()
    loadParentTenantList()
}, { deep: true })

onMounted(() => {
    loadParentTenantList()
    loadCurrentBranchTrees()
    loadUserList()
    loadTenantDetail()
    loadRegionList()
})
</script>

<style scoped lang="less">
.tenant-info-container {
    padding: 10px;
}
</style>
