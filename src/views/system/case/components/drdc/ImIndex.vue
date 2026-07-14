<template>
  <a-form ref="formRef" :model="processModel" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }"
    autocomplete="off" style="margin-top: 20px">
    <a-form-item label="选择文件">
      <a-upload name="file" v-model:file-list="fileList" :max-count="1"
        :headers="{ authorization: 'authorization-text' }" :showUploadList="false" :customRequest="handleImportJson">
        <a-button>
          <upload-outlined />
          文件
        </a-button>
      </a-upload>
    </a-form-item>
    <a-form-item label="流程" name="lcid" :rules="[{ required: true, message: '请选择需要导出的流程' }]">
      <a-tree-select v-model:value="processModel.lcid" show-search style="width: 500px"
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请输入流程名称" allow-clear
        :tree-data="treeData" :field-names="{
    children: 'children',
    label: 'title',
    value: 'key',
  }" tree-node-filter-prop="title" @select="selectProcess"></a-tree-select>
    </a-form-item>
    <a-form-item label="权利类型">
      <a-select v-model:value="processModel.qllx" mode="multiple" :options="getDictItemsByCode('qllx')" allowClear
        style="width: 500px" show-search optionFilterProp="label" disabled>
      </a-select>
    </a-form-item>
    <a-form-item label="导入权利类型">
      <a-select v-model:value="processModel.qllxNew" mode="multiple" :options="getDictItemsByCode('qllx')" allowClear
        style="width: 500px" show-search optionFilterProp="label"
        :disabled="processModel.qllx != null && processModel.qllx.length > 1">
      </a-select>
      <div style="margin-top: 10px; color: red">
        当所选文件权利类型为多个时，导入权利类型不允许选择，只能完整导入
      </div>
    </a-form-item>
    <a-form-item label="导入项">
      <a-checkbox-group v-model:value="processModel.pzx" style="width: 100%; display: grid">
        <div v-for="(item, index) in pzxList" :key="index" style="padding: 5px">
          <a-checkbox :value="item.key" :disabled="importpzx != null && importpzx.indexOf(item.key) == -1">{{ item.title
            }}</a-checkbox>
        </div>
      </a-checkbox-group>
    </a-form-item>
    <a-form-item :wrapper-col="{ offset: 6, span: 18 }">
      <a-space>
        <a-button type="primary" @click="importProcess">
          <upload-outlined />
          导入流程信息
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { defHttp } from "/@/utils/http/axios";
import { UploadOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils";
enum api {
  processlist = "/api/zrzy-bdc/act/process/extActProcess/list",
  roleProcesslist = "/api/zrzy-system/role/getRoleProcessList",
  exportUrl = "/api/zrzy-bdc/process/config/exportProcessAll",
  showImportUrl = "/api/zrzy-bdc/flow/config/showImportProcess",
  importUrl = "/api/zrzy-bdc/process/config/importProcessAll",
}
const formRef = ref();
let processModel: any = ref({});
let treeData = ref([]);
let importpzx: any = ref<string>();
const pzxList = [
  // { title: "流程设计信息", key: "process" },
  { title: "流程基础配置", key: "flow" },
  { title: "节点表单和按钮配置", key: "form" },
  { title: "权利其它配置", key: "qlqt" },
  { title: "权利人配置", key: "qlr" },
];
onMounted(() => {
  loadTreeData();
});
function loadTreeData() {
  let url = api.processlist;
  defHttp
    .get({ url: url, params: { ajlx: "1" } }, { withToken: true })
    .then((res) => {
      treeData.value = res.result;
    });
}
let name = ref("流程信息");
function selectProcess(value, node, extra) {
  name.value = node.title;
}
/**
 * 导入json
 */
let fileList: any = ref([]);

// 自定义上传
function handleImportJson() {
  importFile(api.showImportUrl, bb);
}
function bb(result: any) {
  processModel.value = result;
  importpzx.value = processModel.value.pzx;
}
function importProcess() {
  importFile(api.importUrl);
}
function importFile(url?: string, callback?: any) {
  if (fileList.value.length == 0) {
    message.error("请选择文件");
    return;
  }
  const fileData = new FormData();
  fileList.value.forEach((ele: any) => {
    fileData.append(`files`, ele.originFileObj);
  });
  if (Object.keys(processModel.value).length != 0) {
    const { lcid, qllx, qllxNew, pzx } = processModel.value;
    fileData.append(`lcid`, lcid);
    fileData.append(`qllx`, qllx);
    fileData.append(`qllxNew`, qllxNew);
    fileData.append(`pzx`, pzx);
  }
  defHttp
    .post(
      {
        url: url,
        data: fileData,
        headers: { "Content-Type": "multipart/form-data" },
      },
      { withToken: true }
    )
    .then((res: any) => {
      if (res && res.success) {
        // 此处调用回调函数
        if (typeof callback == "function") {
          callback(res.result);
        } else {
          message.info(res?.message);
        }
      }
    });
}
</script>

<style scoped lang="less"></style>
