<template>
    <a-drawer :title="title" :width="720" :open="open" :body-style="{ paddingBottom: '80px' }"
        :footer-style="{ textAlign: 'right' }" @close="onClose">
        <template #extra>
            <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
            <a-button type="primary" @click="onOk">确定</a-button>
        </template>
        <a-form ref="formRef" :model="dataInfo" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
            <a-form-item label="用户账号" name="username" :rules="[{ required: true, message: '请输入用户账号' }]">
                <a-input v-model:value="dataInfo.username" />
            </a-form-item>
            <a-form-item label="用户姓名" name="realName" :rules="[{ required: true, message: '请输入用户姓名' }]">
                <a-input v-model:value="dataInfo.realName" />
            </a-form-item>
            <!-- <a-form-item v-if="isAdd" label="密码" name="password" :rules="[{ required: true, message: '请输入用户密码' }]">
                <a-input-password v-model:value="dataInfo.password" />
            </a-form-item> -->
            <a-form-item label="性别" name="sex" :rules="[{ required: true, message: '请选择性别' }]">
                <a-select v-model:value="dataInfo.sex" allowClear
                    :options="getDictItemsByCode('sex').map((a: any) => ({ value: a.label }))" style="width: 100%;">
                </a-select>
            </a-form-item>
            <a-form-item label="生日" name="brithDay">
                <a-date-picker v-model:value="dataInfo.brithDay" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
            <a-form-item label="邮箱" name="email" :rules="[{ message: '请输入邮箱' }]">
                <a-input v-model:value="dataInfo.email" />
            </a-form-item>
            <a-form-item label="手机号码" name="phone" :rules="[{ message: '请输入手机号码' }]">
                <a-input v-model:value="dataInfo.phone" />
            </a-form-item>
            <a-form-item label="联系地址" name="address" :rules="[{ message: '请输入联系地址' }]">
                <a-input v-model:value="dataInfo.address" />
            </a-form-item>
            <a-form-item label="初始化状态" name="initStatus">
                <a-select v-model:value="dataInfo.initStatus">
                    <a-select-option :value="true">已初始化</a-select-option>
                    <a-select-option :value="false">未初始化</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="所属角色" name="roleList">
                <a-select v-model:value="dataInfo.roleList" :disabled="!isSuperAdmin && !hasCurrentTenant" allowClear mode="multiple"
                    :options="roleListOption" :fieldNames="{ label: 'name', value: 'id'} " style="width: 100%;">
                </a-select>
            </a-form-item>
            <a-form-item label="所属部门" name="deptList">
                <a-tree-select showCheckedStrategy="TreeSelect.SHOW_ALL" v-model:value="dataInfo.deptList" :disabled="!canSelectDept" :tree-data="deptListOption" :fieldNames="{ label: 'name', value: 'id'}" treeDefaultExpandAll multiple style="width: 100%" allow-clear placeholder="请选择部门"/>
            </a-form-item>
            <a-form-item label="所属租户" name="deptList">
                 <a-select v-model:value="dataInfo.tenantIdList" :disabled="!isSuperAdmin" allowClear mode="multiple"
                    :options="tenantListOption" :fieldNames="{ label: 'name', value: 'id'} " style="width: 100%;">
                </a-select>
            </a-form-item>
            <a-form-item label="状态" name="enabled">
                <a-switch v-model:checked="dataInfo.enabled" checked-children="启用" un-checked-children="禁用"/>
            </a-form-item>
            <a-form-item label="排序" name="sortid">
                <a-input-number v-model:value="dataInfo.sortid" defaultValue="0" />
            </a-form-item>
        </a-form>
    </a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import { computed, onMounted, ref } from 'vue'
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils";
import { useUserStore } from '/@/store/modules/user';
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "用户"
    },
    dataInfo: {
        type: Object,
        default: {}
    },
    deptInfo: {
        type: Object,
        default: () => ({})
    },
    roleListOption: {
        type: Array,
        default: []
    }
})
let isAdd = ref(false)
if (props.dataInfo.id == undefined) {
    isAdd.value = true
}
console.log(JSON.stringify(props.dataInfo))
let open = ref(props.open)
const emit = defineEmits(["ok"])
let deptListOption = ref<any>([])
let tenantListOption = ref<any>([])
const formRef = ref()
const userStore = useUserStore()
const isSuperAdmin = computed(() => {
  const permissions = (userStore.getUserInfo as any).permissions
  return Array.isArray(permissions) && permissions.includes('admin')
})
const hasCurrentTenant = computed(() => {
  const tenantId = userStore.getTenant
  return tenantId != null && tenantId !== ''
})
const canSelectDept = computed(() => isSuperAdmin.value || hasCurrentTenant.value)

enum api {
    add = '/api/zrzy-system/sys/v1/user/add',
    update = '/api/zrzy-system/sys/v1/user/update',
    deptTree = '/api/zrzy-system/sys/dept/deptTree',
    tenantList = '/api/zrzy-system/sys/tenant/list'
}

onMounted(() => {
  initTenantSelection()
  initTree()
  initTenantList()
})

/**
 * 非超级管理员只能使用当前租户，未关联租户时保持为空
 */
function initTenantSelection() {
  const tenantId = userStore.getTenant
  props.dataInfo.tenantIdList = isAdd.value ? (tenantId != null && tenantId !== '' ? [tenantId] : [])  : props.dataInfo.tenantIdList
}
/**
 * 保存
 */
function onOk() {
    console.log(JSON.stringify(props.dataInfo))
    formRef.value
      .validate()
      .then(() => {
            // 执行保存
        let url = api.update
        if (isAdd.value) {
            url = api.add
        }
        defHttp.post({ url: url, data: props.dataInfo }, { withToken: true }).then((res) => {
            if (res && res.code == 200) {
                if (res.result == '已存在同名用户！') {
                    message.error(res.result)
                } else {
                    message.success("保存成功")
                    emit("ok", { isAdd: true, refreshParentPage: true })
                }
            }


        }).catch(err => {
            console.info(err)
        })
      })
}
function onClose() {
    // 执行取消
    emit("ok", { isAdd: false, refreshParentPage: true })
}

/**
 * 统一入口，根据状态选择初始化树
 */
async function initTree() {
  props.dataInfo.deptList = props.dataInfo.deptList || []
  await loadDeptTree()
}

/**
 * 接口已返回当前登录用户的租户范围部门树
 */
function loadDeptTree() {
  return new Promise(resolve => {
    defHttp.get({ url: api.deptTree }, { withToken: true }).then((res: any) => {
      if (res?.success) {
        deptListOption.value = filterDeptTree(res.result || [])
        resolve(res.result)
      } else {
        deptListOption.value = []
        message.error(res?.message || '加载部门树失败')
        resolve([])
      }
    }).catch(() => {
      deptListOption.value = []
      message.error('加载部门树失败')
      resolve([])
    })
  })
}

/**
 * 在已按租户过滤的树中
 * 进一步限制为左侧所选部门及其子树
 */
function filterDeptTree(deptTree: any[]) {
  const selectedDeptId = (props.deptInfo as any)?.id
  if (selectedDeptId == null || selectedDeptId === '') {
    return deptTree
  }

  const selectedDept = findDeptNode(deptTree, selectedDeptId)
  return selectedDept ? [selectedDept] : []
}

function findDeptNode(nodes: any[], deptId: string | number) {
  for (const node of nodes) {
    if (String(node.id) === String(deptId)) {
      return node
    }
    const target = findDeptNode(node.children || [], deptId)
    if (target) {
      return target
    }
  }
  return null
}

function initTenantList() {
  defHttp.get({ url: api.tenantList },{ withToken: true }).then((res: any) => {
      if (res && res.success) {
        tenantListOption.value = res.result || []
      } else {
        tenantListOption.value = []
        message.error(res?.message)
      }
  })
}
</script>

<style scoped lang="less"></style>
