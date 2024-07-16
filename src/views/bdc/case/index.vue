<template>
    <div style="padding: 50px;">
        <a-row :gutter="[40, 24]">
            <a-col v-for="(item) in lcflList" class="gutter-row" :span="6">
                <a-card :class="cIndex == item.code ? 'card-box card-box-hover' : 'card-box'" :bordered="true"
                    hoverable="true" @click="onClick(item)">
                    <a-card-meta :title="item.title">
                        <template #avatar>
                            <div style="padding:5px;" :class="cIndex == item.code ? 'aa' : ''">
                                <svg-icon :name="item.icon" width="40px" height="40px"></svg-icon>
                            </div>
                        </template>
                    </a-card-meta>
                    <!-- <p></p>
                    <p>Card content</p> -->
                    <template #actions>
                        <a style="text-align: right;padding-right: 20px;">创建案卷
                            <ArrowRightOutlined />
                        </a>
                    </template>
                </a-card>
            </a-col>
        </a-row>
    </div>
    <!-- <div v-for="(item) in flowList">
        <a @click="onClick(item)"> {{ item.procName }}</a>
    </div> -->

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { addFlow, getDegisnList } from '/@/views/bdc/utils/case'
import { ArrowRightOutlined } from '@ant-design/icons-vue'
let cIndex = ref('-1')
function onClick(item: any) {
    const params = {
        regType: '0101',
        guid: item.code
    }
    cIndex.value = item.code
    addFlow(params)
}
const lcflList: any = [
    {
        code: 'process1713234366021', title: "不动产首次登记", icon: 'lcfl/lcfl01'
    },
    { code: '1', title: '产权登记', icon: 'lcfl/lcfl01' },
    { code: '2', title: '抵押登记', icon: 'lcfl/lcfl01' },
    { code: '3', title: '查封登记', icon: 'lcfl/lcfl01' },
    { code: '4', title: '异议登记', icon: 'lcfl/lcfl01' },
    { code: '5', title: '承包经营权', icon: 'lcfl/lcfl01' }
]

let flowList: any = await getDegisnList()

</script>

<style scoped lang="less">
.card-box {
    min-width: 120px;
}

.card-box-hover {
    transition: all 0.3s ease-in-out;
    border: 1px solid rgba(9, 184, 80, 0.9);
    box-shadow: 0px 5px 10px rgba(29, 58, 83, 0.15);

}


.aa {
    border-radius: 50%;
    animation: glowing 1s ease-in-out infinite alternate;
}

@keyframes glowing {
    from {
        box-shadow: 0 0 0 0 rgba(9, 184, 80, 0.9);
    }

    to {
        box-shadow: 0 0 20px rgba(9, 184, 80, 0.5);
    }
}

::v-deep(.ant-card) {
    .ant-card-meta {
        align-items: center;
    }

    .ant-card-actions {
        border: 0px !important;
        margin-top: -30px;
    }

}
</style>