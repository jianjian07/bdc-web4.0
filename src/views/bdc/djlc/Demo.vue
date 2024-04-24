<template>
    <a-collapse v-model:activeKey="activeKey_collapse">
        <a-collapse-panel key="1" header="基础设置">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="编号">
                    <a-input v-model:value="scopedElement.id"
                        @change="(event: any) => updateElementId(event, 'id')"></a-input>
                    <!-- <a-input v-model:value="info.id" @change="(event) => changeField(event, 'id')" /> -->
                </a-form-item>

                <a-form-item label="名称">
                    <!-- <a-input v-model:value="elementId"></a-input> -->
                    <a-input v-model:value="scopedElement.name"
                        @change="(event: any) => updateElementId(event, 'name')" />
                </a-form-item>
                <a-form-item label="备注">
                    <a-textarea v-model:value="scopedElement.documentation" :auto-size="{ minRows: 2, maxRows: 5 }" />
                    <!-- <a-input v-model:value="info.documentation"
                        @change="(event) => changeField(event, 'documentation')" /> -->
                </a-form-item>
            </a-form>
        </a-collapse-panel>
        <a-collapse-panel key="2" header="用户配置">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="用户类型">
                    <!-- <a-select v-model:value="info.actionType" :options="yhlxOptions" allowClear style="width: 100%" /> -->
                </a-form-item>
                <a-form-item label="处理人">
                    <!-- <a-input v-model:value="info.assignee" @change="(event) => changeField(event, 'assignee')" /> -->
                </a-form-item>
            </a-form>
        </a-collapse-panel>
    </a-collapse>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useModelerStore } from '/@/store/modules/modeler';
const props = defineProps({
    currentElementId: {},
    element: {},
    businessObject: {
        default: function () {
            return {}
        },
    },
    modeling: {
    },
    moddle: {
    },
})
const modelerStore = useModelerStore()
let activeKey_collapse = ref("1")
// let elementInfo = ref(modelerStore.getActive)
let scopedElement = ref();
scopedElement.value = modelerStore.getActive
watch(() => props.currentElementId, (newVal, oldVal) => {
    scopedElement.value = modelerStore.getActive
})
function updateElementId(event: { target: { value: any; }; }, type: any) {
    const value = event.target.value
    setIdValue(scopedElement.value, value);
}
function setIdValue(element: Element, value: string) {

    const modeling = modelerStore.getModeling;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    modeling.updateProperties(element, {
        id: value
    });
}
debugger
</script>

<style scoped lang="less"></style>