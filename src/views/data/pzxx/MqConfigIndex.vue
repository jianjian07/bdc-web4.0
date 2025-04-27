<template>
    <a-row>
        <a-col :span="5">
            <div style="display: grid;">
                <a-tree default-expand-all :tree-data="treeData">
                    <template #title="{ title, key }">
                        {{ title }}
                    </template>
                </a-tree>
                <a-button style="width: 100%" type="dashed" @click="addTopic">
                    <plus-outlined />
                    新建Topic
                </a-button>
            </div>

        </a-col>
        <a-col :span="16">
            <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }" style="margin-top: 20px;">
                <a-form-item label="队列类型" name="name">
                    <a-select v-model:value="mqData.mqlx" :options="getDictItemsByCode('mq_type')" />
                </a-form-item>
                <a-form-item label="主题" name="topic">
                    <a-input v-model:value="mqData.topic" />
                    <span class="tip-css">命名规则：rp_</span>
                </a-form-item>

                <a-form-item label="Tag标签" name="tag">
                    <a-input v-model:value="mqData.tag" placeholder="" />
                    <span class="tip-css">命名规则：tg_ </span>
                </a-form-item>
                <a-form-item label="接口" name="apiCode">
                    <a-transfer v-model:target-keys="targetKeys" v-model:selected-keys="selectedKeys"
                        :data-source="mockData" :render="item => item.title" show-search
                        :list-style="{ width: '350px', height: '400px' }" />
                </a-form-item>

                <a-form-item label="备注" name="bz">
                    <a-textarea v-model:value="mqData.bz" />
                </a-form-item>
                <a-form-item label="状态" name="status">
                    <a-switch v-model:checked="mqData.status" />
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
                    <a-button type="primary" @click="handleAdd">
                        <template #icon>
                            <CheckOutlined />
                        </template>
                        保存
                    </a-button>
                </a-form-item>
            </a-form>
        </a-col>
    </a-row>


</template>

<script setup lang="ts">
import { PlusOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';
let mqData: any = ref({})
const targetKeys = ref<string[]>([]);
const mockData: any = [];
for (let i = 0; i < 20; i++) {
    mockData.push({
        key: i.toString(),
        title: `queryunit(查询登记信息)${i + 1}`,
        disabled: i % 3 < 1,
    });
}
const treeData: any = [
    {
        title: 'tp_report',
        key: '0-0',
        children: [
            {
                title: 'tg_report',
                key: '0-0-0',
            },
        ],
    },
    {
        title: 'tp_spxx',
        key: '0-1',
        children: [
            {
                title: 'tg_spxx',
                key: '0-2-1',
            },
            {
                title: 'tg_wwsj',
                key: '0-2-2',
            },
        ],
    },
];
</script>

<style scoped lang="less">
.flex-column {
    list-style: none;
}

.tip-css {
    color: gray;
    line-height: 30px;
}
</style>