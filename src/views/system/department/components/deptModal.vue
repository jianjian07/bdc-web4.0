<template>
  <a-drawer :title="title" :width="720" :open="open" :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }" @close="onClose">
    <template #extra>
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" @click="onOk">确定</a-button>
    </template>
    <a-form :model="dataInfo" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
      <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入部门名称' }]">
        <a-input v-model:value="dataInfo.name" />
      </a-form-item>
      <a-form-item label="简称" name="simpleName" :rules="[{ required: true, message: '请输入部门简称' }]">
        <a-input v-model:value="dataInfo.simpleName" />
      </a-form-item>
      <a-form-item label="行政区划" name="areacode">
        <a-tree-select v-model:value="dataInfo.areacode" :tree-data="regionOption" :fieldNames="regionFieldNames"
          style="width: 100%" :dropdown-style="{ maxHeight: '500px', overflow: 'auto' }" />
      </a-form-item>
      <a-form-item label="状态" name="enabled">
        <a-switch v-model:checked="dataInfo.enabled" checked-children="启用" un-checked-children="禁用" />
      </a-form-item>
      <a-form-item label="排序" name="sortid">
        <a-input-number style="width: 100%" v-model:value="dataInfo.sortid" defaultValue="0" />
      </a-form-item>
      <a-form-item label="上级部门" name="pid">
        <a-tree-select v-model:value="dataInfo.pid" :tree-data="deptListOption" :load-data="onLoadData"
          :fieldNames="deptFieldNames" style="width: 100%" allow-clear
          :dropdown-style="{ maxHeight: '500px', overflow: 'auto' }" placeholder="请选择上级部门" />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import { defHttp } from "/@/utils/http/axios";
import { onMounted, ref } from "vue";
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "部门",
  },
  dataInfo: {
    type: Object,
    default: {},
  },
});
let isAdd = ref(false);
if (props.dataInfo.id == undefined) {
  isAdd.value = true;
} else {
  props.dataInfo.oldPid = props.dataInfo.pid;
}

let open = ref(props.open);
let regionOption: any = ref([]);
let deptListOption: any = ref([]);

const regionFieldNames = { label: "areaName", value: "areaCode" };
const deptFieldNames = { label: "name", value: "id" };

const emit = defineEmits(["ok"]);

enum api {
  add = "/api/zrzy-system/sys/dept/saveDept",
  regionList = "/api/zrzy-system/sys/areacode/queryAreaTree",
  deptList = "/api/zrzy-system/sys/dept/treeLazy",
  currentBranchTree = "/api/zrzy-system/sys/dept/deptCurrentBranchTrees", // 编辑时
}

onMounted(() => {
  loadRegionList();
  initTree();
});

/**
 * 保存
 */
function onOk() {
  console.log(JSON.stringify(props.dataInfo));
  // 执行保存
  let url = api.add;
  let _data = {
    areacode: props.dataInfo.areacode,
    createTime: props.dataInfo.createTime,
    enabled: props.dataInfo.enabled,
    id: props.dataInfo.id,
    name: props.dataInfo.name,
    pid: props.dataInfo.pid,
    simpleName: props.dataInfo.simpleName,
    sortid: props.dataInfo.sortid,
  };
  defHttp
    .post({ url: url, data: _data }, { withToken: true })
    .then((res) => {
      if (res && res.code == 200) {
        message.success("保存成功！");
        props.dataInfo.id = res.result;
        emit("ok", {
          isAdd: isAdd.value,
          refreshParentPage: true,
          data: props.dataInfo,
        });
      }
    })
    .catch((err) => {
      console.info(err);
    });
}

function onClose() {
  // 执行取消
  emit("ok", { isAdd: false, refreshParentPage: true });
}

/**
 * 统一入口，根据状态选择初始化树
 */
function initTree() {
  // 编辑时存在上级部门
  if (
    props.dataInfo.pid != "0" &&
    props.dataInfo.pid != 0 &&
    props.dataInfo.pid != undefined &&
    props.dataInfo.pid != ""
  ) {
    loadCurrentBranchTrees();
  } else {
    // 新增时左侧未选择部门
    onLoadData({ dataRef: { id: 0 } });
  }
}

function loadRegionList() {
  return new Promise((resolve) => {
    defHttp
      .get(
        {
          url: api.regionList,
        },
        { withToken: true }
      )
      .then((res: any) => {
        if (res?.success) {
          regionOption.value = res.result;
          resolve(res.result);
        } else {
          message.warning(res?.message || "未查询到行政区数据！");
        }
      });
  });
}

function onLoadData(treeNode: any) {
  return new Promise((resolve) => {
    const { id } = treeNode.dataRef;
    defHttp
      .get(
        {
          url: api.deptList,
          params: {
            name: "",
            pid: id,
            isLazy: true,
          },
        },
        {
          withToken: true,
        }
      )
      .then((res: any) => {
        if (res?.success) {
          if (id == 0) {
            deptListOption.value = res.result.map((item: any) => {
              return {
                ...item,
                isLeaf: !item.hasChildren,
              };
            });
          } else if (treeNode.dataRef.children.length == 0) {
            treeNode.dataRef.children = res.result.map((item: any) => {
              return {
                ...item,
                isLeaf: !item.hasChildren,
              };
            });
          }
          resolve(res.result);
        }
      });
  });
}

/**
 * 初始化树
 * 编辑时
 */
function loadCurrentBranchTrees() {
  return new Promise((resolve) => {
    defHttp
      .post(
        {
          url: api.currentBranchTree,
          data: [props.dataInfo.pid],
        },
        {
          withToken: true,
        }
      )
      .then((res: any) => {
        if (res?.success) {
          deptListOption.value = res.result.map((item: any) => {
            return {
              ...item,
              isLeaf: !item.hasChildren,
            };
          });
          resolve(res.result);
        } else {
          message.error(res?.message);
        }
      });
  });
}
</script>

<style scoped lang="less"></style>
