<template>
    <div class="ruleContainer">
        <div class="ruleList">
            <div class="searchContanier">
                <a-input-search v-model:value="filterValue" placeholder="请输入规则名称或编号查询" @search="queryRuleVerifyList"
                    style="margin-right: 6px;" />
                <a-button type="primary" @click="queryRuleVerifyList" style="margin-right: 6px;">
                    <template #icon><search-outlined /></template>查询
                </a-button>
                <a-button type="primary" @click="reset">
                    <template #icon><redo-outlined /></template>重置
                </a-button>
            </div>
            <a-button type="primary" style="margin-bottom: 5px;" class="btnClass" @click="add">
                <template #icon><plus-outlined /></template>新增
            </a-button>
            <a-list item-layout="horizontal" :data-source="ruleList">
                <template #renderItem="{ item }">
                    <a-list-item :style="{ backgroundColor: item.id == activeId ? '#08990f1c' : '' }">
                        <template #actions v-if="item.id">
                            <a @click="edit(item)"><form-outlined />编辑</a>
                            <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消"
                                @confirm="deleteVerifyRule(item.id)">
                                <a><delete-outlined />删除</a>
                            </a-popconfirm>
                        </template>
                        <a-list-item-meta :description="item.content">
                            <template #title>
                                <a @click="viewData(item)">{{ item.ruleName }}</a>
                            </template>
                            <template #avatar>
                                <key-outlined style="font-size:18px; color: #089910;margin-top: 8px;" />
                            </template>
                        </a-list-item-meta>
                    </a-list-item>
                </template>
            </a-list>
            <a-pagination class="pagination" v-if="ruleList && ruleList.length > 0" v-model:current="pagination.current"
                v-model:page-size="pagination.pageSize" :total="pagination.total" show-less-items
                @change="changePagination" />
        </div>
        <a-divider type="vertical" class="dividerClass" />
        <div class="formContainer">
            <div class="formContent" v-if="showFormPanel">
                <div class="titleClass">
                    <span><span style="color:#e87040;font-weight: 600;"> {{ isAdd ? '新增' : '编辑' }}</span>校验规则</span>
                </div>
                <a-form ref="formRef" :rules="rules" :model="ruleFormData" :label-col="{ span: 4 }"
                    :wrapper-col="{ span: 20 }">
                    <a-form-item label="规则名称" name="ruleName">
                        <a-input v-model:value="ruleFormData.ruleName" :disabled="isView" />
                    </a-form-item>
                    <a-form-item label="规则编码" name="code">
                        <a-input v-model:value="ruleFormData.code" :disabled="isView" />
                    </a-form-item>
                    <a-form-item label="正则表达式" name="pattern">
                        <a-textarea v-model:value="ruleFormData.pattern" :disabled="isView" :rows="5" />
                    </a-form-item>
                    <a-form-item label="提示信息" name="message">
                        <a-input v-model:value="ruleFormData.message" :disabled="isView" />
                    </a-form-item>
                    <a-form-item label="规则描述" name="content">
                        <a-textarea v-model:value="ruleFormData.content" :disabled="isView" :rows="3" />
                    </a-form-item>
                    <a-form-item :wrapper-col="{ offset: !isView ? 18 : 20, span: !isView ? 6 : 4 }">
                        <a-button v-if="!isView" type="primary" html-type="submit" class="btnClass" @click="save"
                            :loading="saveLoading" style="margin-right: 15px;">
                            <template #icon><save-outlined /></template>保存
                        </a-button>
                        <a-button type="primary" html-type="submit" class="btnClass" @click="test">
                            <template #icon><reconciliation-outlined /></template>测试
                        </a-button>
                    </a-form-item>
                </a-form>
            </div>
            <div class="formContent" v-if="showFormPanel && showTestPanel">
                <div class="titleClass">
                    <span> 测试校验规则</span>
                    <close-outlined @click="showTestPanel = false" />
                </div>
                <a-form ref="testFormRef" :rules="testRules" :model="testRuleFormData" :label-col="{ span: 4 }">
                    <a-form-item :label="ruleFormData.ruleName" name="test">
                        <a-input v-model:value="testRuleFormData.test" />
                    </a-form-item>
                    <a-form-item :wrapper-col="{ offset: 20, span: 4 }">
                        <a-button type="primary" html-type="submit" class="btnClass" @click="verifyTest">
                            <template #icon><caret-right-outlined /></template>校验
                        </a-button>
                    </a-form-item>
                </a-form>
            </div>
            <div class="emptyClass" v-if="!showFormPanel"><reconciliation-filled style="font-size: 88px;" />规则校验</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PlusOutlined, DeleteOutlined, SearchOutlined, FormOutlined, KeyOutlined, SaveOutlined, ReconciliationOutlined, ReconciliationFilled, CaretRightOutlined, CloseOutlined, RedoOutlined, UnlockOutlined } from '@ant-design/icons-vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useUserStore } from "/@/store/modules/user";

enum api {
    queryRuleVerifyList = '/api/zrzy-form/magic/form/rule/queryRuleVerifyList',
    addVerifyRule = '/api/zrzy-form/magic/form/rule/addVerifyRule',
    deleteVerifyRule = '/api/zrzy-form/magic/form/rule/deleteVerifyRule',
    editVerifyRule = '/api/zrzy-form/magic/form/rule/editVerifyRule',
}
// 分页
let pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
})
// 表单实例
let formRef = ref()
// 校验规则列表数据
let ruleList = ref<any>([])
// 校验规则详情
let ruleFormData = ref<any>({})
// 校验规则表单校验规则
const rules = ref<any>({
    ruleName: [{ required: true, message: '请输入规则名称!' }],
    code: [{ required: true, message: '请选择规则编码!' }],
    pattern: [{ required: true, validator: validateMethod, message: '请输入正则表达式' }],
    message: [{ required: true, message: '请输入提示信息!' }],
    content: [{ required: true, message: '请输入规则描述!' }],
})
let testRuleFormData = ref<any>({})
let testFormRef = ref()
const testRules = {
    test: [{ validator: validateTestMethod }],
}
// 是否展示表单详情
let showFormPanel = ref(false);
// 是否为新增
let isAdd = ref(false);
// 是否为查看 点击列表标题时为查看
let isView = ref(false);
// 是否展示测试表单
let showTestPanel = ref(false)
let filterValue = ref('')
let saveLoading = ref(false)
// 当前选中规则
let activeId = ref(0)
onMounted(() => {
    queryRuleVerifyList()
})
function reset() {
    filterValue.value = ''
    showFormPanel.value = false
    activeId.value = 0
    queryRuleVerifyList()
}
/**
 * 获取接口列表信息
 */
function queryRuleVerifyList() {
    defHttp.get({ url: api.queryRuleVerifyList, params: { filter: filterValue.value, page: pagination.value.current, size: pagination.value.pageSize } }, { withToken: false }).then((res) => {
        ruleList.value = res.list
        pagination.value.total = res.total || 0
    }).catch((err => {
        message.error('查询失败' + err)
    }))
}
/**
 * 查看详情
*/
function viewData(record) {
    isView.value = true
    showFormPanel.value = true
    ruleFormData.value = record
    activeId.value = record.id
}
/**
 * 新增
 */
function add() {
    showFormPanel.value = true
    showTestPanel.value = false
    activeId.value = 0
    isAdd.value = true
    isView.value = false
    ruleFormData.value = {}
}
/**
 * 编辑
 * @param record 
 */
function edit(record) {
    isAdd.value = false
    showFormPanel.value = true
    isView.value = false
    ruleFormData.value = record
    activeId.value = record.id
}
/**
 * 删除
 * @param id
 */
function deleteVerifyRule(id) {
    defHttp.post({ url: api.deleteVerifyRule, params: { id: id } }, { withToken: false, joinParamsToUrl: true }).then((res) => {
        if (!res.message) {
            message.success('删除成功')
            queryRuleVerifyList()
        } else {
            message.error('删除失败' + res?.message)
        }
    }).catch((err => {

    }))
}
/**
 * 保存 - 新增\编辑保存
 */
function save() {
    saveLoading.value = true
    formRef.value.validate().then(() => {
        let url = ''
        if (isAdd.value) {
            url = api.addVerifyRule
            ruleFormData.value.createTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
            ruleFormData.value.createBy = useUserStore().getUserInfo.username
        } else {
            url = api.editVerifyRule
        }
        ruleFormData.value.updateTime = dayjs().format("YYYY-MM-DD HH:mm:ss")
        ruleFormData.value.updateBy = useUserStore().getUserInfo.username
        defHttp.post({ url: url, data: { ...ruleFormData.value } }, { withToken: false, isTransformResponse: false }).then((res) => {
            if (!res.message) {
                message.success('保存成功')
                queryRuleVerifyList()
            } else {
                message.error('保存失败' + res?.message)
            }
        }).catch((err => {
            message.error('保存失败' + err)
        })).finally(() => saveLoading.value = false)
    }).finally(() => saveLoading.value = false)
}
/**
 * 测试
*/
function test() {
    formRef.value.validate().then(() => {
        showTestPanel.value = true
    })
}
/**
 * 验证是否为正确的正则表达式
*/
function validateMethod(rule, value) {
    return new Promise((resolve, reject) => {
        if (value !== undefined && value !== null) {
            let res = false;
            try {
                res = !!(eval(value) instanceof RegExp);
            } catch (err) {
                res = false;
            }
            if (!res) {
                reject(new Error("请输入正确的正则表达式"))
            } else {
                resolve(true);
            }
        } else {
            reject(new Error("请输入正则表达式"));
        }
    })
}
/**
 * 
*/
function validateTestMethod(rule, value) {
    return new Promise((resolve, reject) => {
        const regex = new RegExp(eval(ruleFormData.value.pattern)); // 正则表达式
        if (regex.test(value)) {
            // 校验通过
            resolve(true);
        } else {
            // 校验失败 设置错误消息
            reject(new Error(ruleFormData.value.message));
        }
    })
}
/**
 * 校验测试数据
*/
function verifyTest() {
    testFormRef.value.validate().then(() => {
        message.success('测试校验成功')
    })
}
/**
 * 切换页
*/
function changePagination(page, pageSize) {
    pagination.value.current = page
    queryRuleVerifyList()
}
</script>
<style lang="less" scoped>
@import url('/@/assets/less/transition.less');

.ruleContainer {
    height: 100%;
    overflow: auto;
    padding: 10px;
    display: flex;
    background-color: #fff;

    .ruleList {
        width: 48%;

        :deep(.ant-list) {
            max-height: calc(100% - 120px);
            overflow: auto;

            .ant-list-item {
                padding: 12px 10px;
            }
        }

        .searchContanier {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .pagination {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin: 5px 0;
        }
    }

    .dividerClass {
        height: 100%;
        background-color: #f0f0f0;
        margin: 0 25px 0px 10px;
    }

    .formContainer {
        width: 55%;

        .formContent {
            // margin-top: 15px;
            width: 100%;
            animation: open 0.5s;

            .titleClass {
                width: 100%;
                // border-bottom: 3px solid @primary-color;
                padding: 8px;
                margin-bottom: 10px;
                font-weight: 800;
                letter-spacing: 2px;
                display: flex;
                justify-content: space-between;
                // background-color: #1890ff;
                // color: #fff;
                border-radius: 3px;
                background-color: #e6f7ff;
                border: 1px solid #91d5ff;
            }
        }

        .emptyClass {
            width: 100%;
            display: flex;
            flex-direction: column;
            padding-top: 30%;
            align-items: center;
            font-size: 30px;
            font-weight: bold;
            color: #eeeeee;
            cursor: default;
        }
    }

    .btnClass {
        color: #fff;
        //background-color: @primary-color;
    }
}

@keyframes open {
    0% {
        transform: translateX(100%);
        opacity: 0;
    }

    100% {
        transform: translateX(0%);
        opacity: 1
    }
}
</style>