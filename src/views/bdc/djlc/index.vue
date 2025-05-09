<template>
    <div class="disign-css">
        <a-tabs v-model:activeKey="activeKey" centered @change="ceshi">
            <a-tab-pane key="1" tab="流程设计器">
                <div class="designer-container">
                    <li>
                        <a href="javascript:" class="active" @click="handlerUndo" title="撤销操作">撤销</a>
                    </li>
                    <li>
                        <a href="javascript:" class="active" @click="handlerRedo" title="恢复操作">恢复</a>
                    </li>
                    <div id="container" class="containerBox"></div>

                    <div id="js-properties-panel" class="panel">
                    </div>
                    <div class="custom-properties-panel">
                        <Demo v-if="show" :currentElementId="currentElementId"></Demo>
                        <!-- <a-collapse v-if="info != null" v-model:activeKey="activeKey_collapse">
                            <a-collapse-panel key="1" header="基础设置">
                                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                                    <a-form-item label="节点id">
                                        <a-input v-model:value="info.id"
                                            @change="(event) => changeField(event, 'id')" />
                                    </a-form-item>

                                    <a-form-item label="名称">
                                        <a-input v-model:value="info.name"
                                            @change="(event) => changeField(event, 'name')" />
                                    </a-form-item>
                                    <a-form-item label="备注">
                                        <a-input v-model:value="info.documentation"
                                            @change="(event) => changeField(event, 'documentation')" />
                                    </a-form-item>
                                </a-form>
                            </a-collapse-panel>
                            <a-collapse-panel key="2" header="用户配置" v-if="visible">
                                <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                                    <a-form-item label="用户类型">
                                        <a-select v-model:value="info.actionType" :options="yhlxOptions" allowClear
                                            style="width: 100%" />
                                    </a-form-item>
                                    <a-form-item label="处理人">
                                        <a-input v-model:value="info.assignee"
                                            @change="(event) => changeField(event, 'assignee')" />
                                    </a-form-item>
                                </a-form>
                            </a-collapse-panel>
                        </a-collapse>
                        <a-collapse v-else v-model:activeKey="activeKey_collapse">

                            <a-collapse-panel key="1" header="流程配置">
                                <a-form-item label="备注">
                                    <a-input v-model:value="moddleElement.documentation"
                                        @change="(event) => changeField(event, 'documentation')" />
                                </a-form-item>
                            </a-collapse-panel>

                        </a-collapse> -->
                    </div>


                </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="流程XML" force-render style="overflow-y: hidden;">
                <monaco-editor v-model="xml" language="xml" theme="vs" style="width: 100%;border: 1px solid #e5e7eb;"
                    height="100%" update:modelValue="xml">
                </monaco-editor>
                <div>我是xml</div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>


<script setup name="useProTableDetail">
// 导入一下有关于bpmn-js的字体库以及样式文件
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
// 右侧属性面包样式
import 'bpmn-js-properties-panel/dist/assets/properties-panel.css'
import { markRaw, onMounted, ref, reactive } from "vue";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule // 右边多余的属性
} from "bpmn-js-properties-panel";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
import Demo from "./Demo.vue";
// 汉化包 (这里注意你们项目的路径！！！！！！！)
import customTranslate from "./customTranslate";
import { xmlStr } from './xml.ts' // 放在下面了
import monacoEditor from '/@/components/monaco/monacoEditor.vue'
import { useModelerStore } from '/@/store/modules/modeler'
const modelerStore = useModelerStore()
const activeKey = ref('1');
const activeKey_collapse = ref('1');
const visible = ref(false);
let show = ref(false)
let containerEl = ref(null);
let bpmnModeler = reactive({})
let moddleElement = ref({})
const yhlxOptions = [
    { value: '指定人', label: '指定人' },
    { value: '候选角色', label: '候选角色' },
    { value: '候选部门', label: '候选部门' },
]
onMounted(async () => {
    init();

});
// 将汉化包装成一个模块
const customTranslateModule = {
    translate: ['value', customTranslate]
}
// 自定义右边属性面板属性定义
//当前选择的元素合集
let selectedElementsArr = reactive({
    selectedElements: [],
})
let element = ref(null)
let info = ref(null)
let xml = ref(xmlStr)
/**
 * 初始化流程图
 */
let init = () => {
    containerEl.value = document.getElementById("container");
    // 加markRaw去除双向绑定作用域
    bpmnModeler = markRaw(
        new BpmnModeler({
            container: containerEl.value,
            //添加控制板
            propertiesPanel: {
                parent: "#js-properties-panel"
            },
            additionalModules: [
                // 右边的属性栏
                // BpmnPropertiesPanelModule,
                // BpmnPropertiesProviderModule,
                // Demo,
                // customTranslateModule,//汉化
                // CamundaPlatformPropertiesProviderModule
            ],
            moddleExtensions: {
                camunda: camundaModdleDescriptor
            }
        })
    );
    // bpmnModeler.createDiagram(() => { })
    // bpmnModeler.createDiagram(() => { // 自适应大小

    //     // const result = bpmnModeler.importXML(xmlStr);
    //     xmlStr
    //     // bpmnModeler.value.get("canvas").zoom("fit-viewport");
    // });
    bpmnModeler.on("import.done", () => {

        const a = "2"
        setCurrentElement(null)
        // setCurrentElement(null);
    });
    // // selection.changed监听选中的元素
    // bpmnModeler.on('selection.changed', (e) => {
    //     selectedElementsArr.selectedElements = e.newSelection // 数组, 可能有多个
    //     element = e.newSelection[0] // 默认取第一个
    //     info.value = e.newSelection[0]
    //     if (element != undefined && element.type === "bpmn:Task") {
    //         visible.value = true
    //     } else {
    //         visible.value = false
    //     }
    //     if (e.newSelection.length == 0) {
    //         moddleElement.value = bpmnModeler.getDefinitions().rootElements[0]
    //     }
    // })

    // //使用element.changed监听发生改变的元素
    bpmnModeler.on('element.click', (e) => {
        // show.value = false
        const { element } = e

        // if (!info.value) {
        //     return
        // }
        // if (element.id === info.value.id) {
        //     info.value = element
        // }
        // if (element && element.id === currentElementId.value) {
        //     setCurrentElement(element);
        // }
        setCurrentElement(element);
        show.value = true
    })
    aa()

};
let currentElementId = ref(-1)
function setCurrentElement(activatedElement) {
    let activatedElementTypeName = "";
    if (!activatedElement) {
        activatedElement = modelerStore.getElRegistry?.find(
            (el) => el.type === "bpmn:Process" || el.type === "bpmn:Collaboration"
        );

        if (!activatedElement) {
            return console.log("No Element found!");
        }
    }
    currentElementId.value = activatedElement.id;
    modelerStore.setElement(markRaw(activatedElement));
}
function aa() {

    const result = bpmnModeler.importXML(xml.value)
    modelerStore.setModeler(bpmnModeler)
}
function handlerRedo() {
    // console.log("xml" + xml.value.toString())
    bpmnModeler.get("commandStack").redo()
}
function handlerUndo() {
    bpmnModeler.get("commandStack").undo()
}
//自定义面板内容
/**
 * 更新元素属性
 * @param { Object } 要更新的属性, 例如 { name: '', id: '' }
 *
 */

function updateProperties(properties) {

    const modeling = bpmnModeler.get('modeling')
    // console.log(element, properties)
    modeling.updateProperties(element, properties)
}

/**
 * 改变控件触发的事件
 * @param { Object } input的Event
 * @param { String } 要修改的属性的名称
 *
 *
 */
// 当控件内的内容发生改变时, 同步更新element.
function changeField(event, type) {

    const value = event.target.value
    let properties = {}
    properties[type] = value
    element[type] = value
    updateProperties(properties) // 调用属性更新方法
}
async function ceshi(activeKey) {
    if (activeKey == '2') {
        const result = await bpmnModeler.saveXML({ format: true });
        // const { xml } = result;

        xml.value = result.xml
    }
}
</script>

<style scoped lang="less">
// 右边工具栏样式
@import "./styleCss.less";

.disign-css {
    height: 100%;

    ::v-deep(.ant-tabs) {
        height: 100% !important;

        .ant-tabs-content {
            height: 100%;
        }
    }

    .custom-properties-panel {
        padding: 0px !important;
    }

}


.designer-container {
    background: url(/@/assets/bpm/bg.svg);
    margin-bottom: 25px;
    display: flex;
    flex-direction: column;
    position: relative;
}

.panel {
    width: 300px;
    top: 1px;
    position: absolute;
    right: 1px;
    // border: 1px solid #dcdfe6;
}

.containerBox {
    height: 100%;
}

.containerBox {
    height: 100%;
}

.djs-palette.two-column.open {
    width: 20px !important;
}

/** 自定义属性面板样式 **/
.custom-properties-panel {
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    background-color: #f8f8f8;
    // border-color: rgba(0, 0, 0, 0.09);
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    padding: 20px;
}
</style>