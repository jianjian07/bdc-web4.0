<template>
    <div class="modalClass">
        <a-modal v-model:open="modalVisible" :title="modalTitle">
            <a-form ref="formRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" :rules="rules"
                :model="formState">
                <a-form-item label="表单名称" name="form_name">
                    <a-textarea v-model:value="formState.formName" placeholder="表单名称" showCount
                        :auto-size="{ maxRows: 1 }" :maxlength="50"></a-textarea>
                </a-form-item>
                <a-form-item label="表单编码" name="code">
                    <a-input v-model:value="formState.code" placeholder="表单编码"></a-input>
                </a-form-item>
                <a-form-item label="表单分类">
                    <a-tree-select v-model:value="formState.formType" :tree-data="getDictItemsByCode('bdfl')" allowClear
                        @change="changeType">
                    </a-tree-select>
                </a-form-item>
                <a-form-item label="备注">
                    <a-textarea v-model:value="formState.remark" :rows="4" />
                </a-form-item>
            </a-form>
            <template #footer>
                <div class="footerClass">
                    <a-checkbox v-model:checked="isAutoOpenDesign">添加后自动打开设计</a-checkbox>
                    <div>
                        <a-button key="back" @click="modalVisible = false">关闭</a-button>
                        <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleModalOk">
                            <template #icon>
                                <save-outlined />
                            </template>
                            保存
                        </a-button>
                    </div>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { defHttp } from "/@/utils/http/axios";
import { message } from 'ant-design-vue';
import { SaveOutlined } from '@ant-design/icons-vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
import { formatToDateTime } from "/@/views/online/utils/dateUtil";
// 弹窗是否显示
let modalVisible = ref<boolean>(false)
// 弹窗标题
let modalTitle = ref<string>('新建工作表')
// 弹窗loading
let confirmLoading = ref<boolean>(false)
// 表单实例
let formRef = ref()
// 表单数据
let formState = ref<any>({})
let propsRecord = ref<any>({})
let isAutoOpenDesign = ref(false) // 是否自动打开设计表单
const rules = ref<any>({
    formName: [{ required: true, message: '请输入表单名称!' }],
    code: [{ required: true, validator: checkFormCode }],
})

enum api {
    check = '/magicapi/zrzy-form/magic/form/form/check'
}

const emit = defineEmits(['handOver'])
/**
 * 添加
 */
function add() {
    modalVisible.value = true
    modalTitle.value = '新建工作表'
    const _value =
    {
        "list": [],
        "config": {
            "labelWidth": 120,
            "layout": "horizontal",
            "baseScript": "",
            "dataSource": [],
            "eventScript": [
                {
                    "key": "base",
                    "name": "全局变量定义",
                    "func": "// const a=1",
                    "param": ""
                },
                {
                    "key": "mounted002",
                    "name": "initMount",
                    "func": "",
                    "param": "",
                    "type": "Mounted"
                }
            ]
        }
    }

    formState.value = { content: JSON.stringify(_value) }
    propsRecord.value = {}
    isAutoOpenDesign.value = false
}
/**
 * 编辑
 */
function edit(record: any) {
    modalVisible.value = true
    modalTitle.value = '编辑工作表'
    formState.value = JSON.parse(JSON.stringify(record))
    propsRecord.value = JSON.parse(JSON.stringify(record))
    isAutoOpenDesign.value = false
}

/**
 * 弹窗确认
 */
function handleModalOk() {
    confirmLoading.value = true
    formRef.value.validate().then(() => {
        let url = ''
        const time = new Date().getTime();
        const value = formatToDateTime(time);
        if (formState.value.id) {
            url = '/api/zrzy-form/form/update' // 编辑
            formState.value.updateTime = value

        } else {
            url = '/api/zrzy-form/form/add' // 新增
            formState.value.createTime = value
        }
        defHttp.post({ url: url, data: formState.value }, { withToken: true }).then((res) => {
            if (res.success) {
                message.success('保存成功')
                emit('handOver', {
                    isAutoOpenDesign: isAutoOpenDesign.value,
                    data: formState.value
                })
                modalVisible.value = false
            } else {
                message.error('保存失败' + res?.message)
            }
        }).catch(err => {
            message.error('保存失败')
        }).finally(() => {
            confirmLoading.value = false
        })
    }).catch((error: any) => {
        confirmLoading.value = false
    })
}
function changeType(_value, label) {
    formState.value.typeName = label[0]
}

/**
 * 检查表单编码是否重复
 * @param _rule
 * @param value
 */
async function checkFormCode(_rule: any, value: string) {
    if (value === '') {
        return Promise.reject('请输入表单编码!');
    } else {
        if (!value.match(/^[A-Za-z0-9_]*$/)) {
            return Promise.reject('请输入字母数字或下划线!')
        } else {
            if (propsRecord.value && (value == propsRecord.value.code)) {
                return Promise.resolve()
            } else {
                await defHttp.post({ url: api.check, params: { code: value } }, { withToken: true }).then((res) => {
                    if (res && res.code == 200) {
                        return Promise.resolve()
                    } else {
                        return Promise.reject(res?.message)
                    }
                }).catch(err => {
                    return Promise.reject(err)
                })
            }
        }
    }
}

defineExpose({
    add,
    edit
})
</script>

<style lang="less" scoped>
.footerClass {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
