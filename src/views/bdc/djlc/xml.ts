export const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
export const jeecg1 = `<?xml version="1.0" encoding="UTF-8"?>
   <definitions  xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:activiti="http://activiti.org/bpmn" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" typeLanguage="http://www.w3.org/2001/XMLSchema" expressionLanguage="http://www.w3.org/1999/XPath" targetNamespace="http://www.jeecg.com">
       <process  id="process1713234366021" name="process1713234366021">
           <documentation>流程描述</documentation>
           <startEvent  id="start" name="开始节点" activiti:initiator="applyUserId">
           </startEvent>
           <endEvent  id="end" name="结束节点">
           </endEvent>
       </process>
       <bpmndi:BPMNDiagram id="BPMNDiagram_process1713234366021">
           <bpmndi:BPMNPlane bpmnElement="process1713234366021" id="BPMNPlane_process1713234366021">
               <bpmndi:BPMNShape bpmnElement="start" id="BPMNShape_start">
                   <omgdc:Bounds height="30" width="30" x="200" y="50"/>
               </bpmndi:BPMNShape>
               <bpmndi:BPMNShape bpmnElement="end" id="BPMNShape_end">
                   <omgdc:Bounds height="30" width="30" x="200" y="400"/>
               </bpmndi:BPMNShape>
           </bpmndi:BPMNPlane>
       </bpmndi:BPMNDiagram>
   </definitions>`
export const aa = `
   <?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:flowable="http://flowable.org/bpmn" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="process_1713229741859" name="流程_1713229741859">
    <bpmn2:extensionElements>
      <flowable:executionListener class="org.jeecg.modules.extbpm.listener.execution.ProcessEndListener" event="end" />
      <flowable:eventListener class="org.jeecg.modules.listener.tasktip.TaskCreateGlobalListener" />
    </bpmn2:extensionElements>
    <bpmn2:startEvent id="StartEvent_01ydzqe" name="开始" flowable:initiator="applyUserId" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="process_1713229741859">
      <bpmndi:BPMNShape id="StartEvent_01ydzqe_di" bpmnElement="StartEvent_01ydzqe">
        <dc:Bounds x="142" y="212" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="149" y="255" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`