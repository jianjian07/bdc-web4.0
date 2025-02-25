<template>
    <a-collapse v-model:activeKey="activeKey_collapse">
        <a-collapse-panel key="1" header="基础设置">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="编号">
                    <a-input v-model:value="elementId"></a-input>
                    <!-- <a-input v-model:value="info.id" @change="(event) => changeField(event, 'id')" /> -->
                </a-form-item>

                <a-form-item label="名称">
                    <a-input v-model:value="elementId"></a-input>
                    <!-- <a-input v-model:value="info.name" @change="(event) => changeField(event, 'name')" /> -->
                </a-form-item>
                <a-form-item label="备注">
                    <a-textarea v-model:value="elementId" :auto-size="{ minRows: 2, maxRows: 5 }" />
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
import { onMounted, reactive, ref, toRaw, watch } from "vue";
import { useModelerStore } from '/@/store/modules/modeler'
import { getBusinessObject, is, isAny } from "bpmn-js/lib/util/ModelUtil";
import EventBus from "/@/views/online/utils/eventBus";
import { ModdleElement } from "bpmn-js/lib/features/modeling/Modeling";
// import { ModdleElement } from "bpmn-moddle";
const modelerStore = useModelerStore()

const props = defineProps({
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
let activeKey_collapse = ref("1")
let form = ref()
// 默认节点名称
type DefaultElement = {
    elementType: string; // 节点类型
    defaultName: string; // 默认节点名称
};

// 默认节点名称
const list: DefaultElement[] = [
    { elementType: "bpmn:StartEvent", defaultName: "开始事件" },
    { elementType: "bpmn:UserTask", defaultName: "用户任务" },
    { elementType: "bpmn:ServiceTask", defaultName: "服务任务" },
    { elementType: "bpmn:ExclusiveGateway", defaultName: "互斥网关" },
    { elementType: "bpmn:ParallelGateway", defaultName: "并行网关" },
    { elementType: "bpmn:EndEvent", defaultName: "结束节点" }
];
let bpmnModeler = modelerStore.getModeler
let activeElement = modelerStore.getActive
// 当前节点信息
let scopedElement: Element;
// 节点id
const elementId = ref<string>("");
// 节点名称
const elementName = ref<string>("");
// 节点文档
const elementDoc = ref<string>("");
/**
 * 获取节点数据
 */
const getElementData = () => {
    elementId.value = modelerStore.getActiveId as string;
    elementName.value = getNameValue(scopedElement) || "";
    elementDoc.value = getDocumentValue(scopedElement) || "";
};
/**
 * 更新节点名称
 * @param value 节点名称
 */
const updateElementName = (value: string) => {
    setNameValue(scopedElement, value);
};

function getDocumentValue(element: Element): string {
    const businessObject = element?.businessObject;
    const documentation = businessObject && findDocumentation(businessObject.get("documentation"));
    return documentation && documentation.text;
}
const DOCUMENTATION_TEXT_FORMAT = "text/plain";

function findDocumentation(docs) {
    return docs.find(function (d) {
        return (d.textFormat || DOCUMENTATION_TEXT_FORMAT) === DOCUMENTATION_TEXT_FORMAT;
    });
}
/**
 * 初始化节点名称,如果节点名称等于空预赋值
 */
const initElementName = () => {
    elementName.value = getNameValue(scopedElement) || "";
    if (elementName.value) return;
    const item = list.find((t) => t.elementType === modelerStore.getActive.type);
    const elements: any[] = modelerStore.getElRegistry._elements;
    if (item && elements[elementId.value]) {
        updateElementName(item.defaultName);
    }
};

// 根据元素获取 name 属性
function getNameValue(element: Element): string | undefined {
    if (isAny(element, ["bpmn:Collaboration", "bpmn:DataAssociation", "bpmn:Association"])) {
        return undefined;
    }
    if (is(element, "bpmn:TextAnnotation")) {
        return element.businessObject.text;
    }
    if (is(element, "bpmn:Group")) {
        const businessObject: ModdleElement = getBusinessObject(element),
            categoryValueRef = businessObject?.categoryValueRef;
        return categoryValueRef?.value;
    }
    return element?.businessObject.name;
}
// 根据输入内容设置 name 属性
function setNameValue(element: Element, value: string): void {


    const modeling = modelerStore.getModeling;
    const canvas = modelerStore.getCanvas;
    const bpmnFactory: BpmnFactory | undefined = modelerStore.getModeler?.get("bpmnFactory");

    if (isAny(element, ["bpmn:Collaboration", "bpmn:DataAssociation", "bpmn:Association"])) {
        return undefined;
    }
    if (is(element, "bpmn:TextAnnotation")) {
        return modeling?.updateModdleProperties(element, element.businessObject, { text: value });
    }
    if (is(element, "bpmn:Group")) {
        const businessObject = getBusinessObject(element),
            categoryValueRef = businessObject.categoryValueRef;
        if (!categoryValueRef) {
            initializeCategory(businessObject, canvas?.getRootElement(), bpmnFactory);
        }
        return modeling?.updateLabel(element, value);
    }
    modeling?.updateModdleProperties(element, element.businessObject, { name: value });
}

// 点击用户节点，初始化用
EventBus.on("element-init", function () {
    debugger
    scopedElement = modelerStore.getActive;
    initElementName();
    getElementData();
});
// let extensionElements = null
// let modeler: any = props.moddle
// let element: any = props.element
// form.value = JSON.parse(JSON.stringify(props.businessObject))
// // watch(() => props.businessObject, (newVal, oldVal) => {
// //     form.value = JSON.parse(JSON.stringify(newVal))
// // }
// // )

// let formType = ["bpmn:StartEvent", "bpmn:UserTask"]

//修改表单字段


</script>

<style scoped lang="less"></style>