import Modeler from "bpmn-js/lib/Modeler";
import Modeling from "bpmn-js/lib/features/modeling/Modeling";
import { Moddle } from "bpmn-js/lib/model/Types";
import { defineStore } from "pinia";
import { toRaw } from "vue";
type ModelerState = {
    processEngine: "flowable" | "activiti";
    activeElement: any | undefined;
    activeElementId: string | undefined;
    modeler: Modeler | undefined;
    moddle: Moddle | undefined;
    modeling: any | undefined;
    elementRegistry: any;
    // canvas: Canvas | undefined;
};
const defaultState: ModelerState = {
    processEngine: "activiti",
    activeElement: undefined,
    activeElementId: undefined,
    modeler: undefined,
    moddle: undefined,
    modeling: undefined,
    elementRegistry: undefined,
}
/**
 * @description: 
 */
export const useModelerStore = defineStore({
    id: 'modeler',
    state: (): ModelerState => defaultState,
    getters: {
        getProcessEngine: (state) => toRaw(state.processEngine),
        getActive: (state) => toRaw(state.activeElement),
        getActiveId: (state) => state.activeElementId,
        getModeler: (state) => toRaw(state.modeler),
        getModdle: (state) => toRaw(state.moddle),
        getModeling: (state): Modeling => toRaw(state.modeling),
        getElRegistry: (state) => toRaw(state.elementRegistry),
    },
    actions: {
        /**
         * 设置流程引擎
         * @param processEngine 流程引擎名称
         */
        setProcessEngine(processEngine: "activiti" | "flowable") {
            this.processEngine = processEngine;
        },
        /**
         * 设置设计器对象
         * @param modeler bpmn设计器对象
         */
        setModeler(modeler: Modeler | undefined) {
            this.modeler = modeler;
            if (modeler) {
                this.modeling = modeler.get<Modeling>("modeling");
                this.moddle = modeler.get<Moddle>("moddle");
                // this.canvas = modeler.get<Canvas>("canvas");
                this.elementRegistry = modeler.get("elementRegistry");
            } else {
                this.modeling = this.moddle = undefined;
            }
        },
        /**
         * 设置节点
         * @param element 节点信息
         */
        setElement(element: BpmnElement | undefined) {
            this.activeElement = element;
            this.activeElementId = element.id;
        }
    }
})