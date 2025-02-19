<template>
  <div class="cc-container">
      <div style="display: flex; flex-direction: column; height: 100%">
          <div style="line-height: 3em; background-color: #fff;padding: 10px 10px;">
            <a-alert type="info" :show-icon="true">
              <template #message>
                  当前选择：
                  <span style="font-weight: 600;">
                      {{ selectSystem?.name }}
                  </span>
                  <span @click="cancelSelect" v-if="selectSystem?.name" style="color:#1890ff;padding-left: 10px; cursor: pointer;">
                    取消选择
                  </span>
              </template>
            </a-alert>
          </div>
          <div class="systemList" style="margin-top: 8px;padding-top: 10px; padding-right: 20px; line-height: 3em; background-color: #fff; flex: 1;height: calc(100% - 60px); min-width: 450px; overflow: auto">
            <a-tree :tree-data="systemTree" @select="onSelectSystem" :selected-keys="selectKeys" style="width: 100%" block-node>
              <template #title="{ dataRef }">
                <div class="customTitle">
                  <div class="text-ellipsis">
                    {{ dataRef.name }}
                  </div>
                  <div v-show="false" class="oprBtn">
                    <a-button style="margin-right: 5px" size="small" @click.stop="editSystem(dataRef)"
                      :icon="h(EditOutlined)"></a-button>
                    <a-popconfirm placement="topRight" title="确定删除该子系统？" ok-text="确定" cancel-text="取消" @confirm="deleteSystem(dataRef)">
                      <a-button size="small" @click.stop="" :icon="h(DeleteOutlined)" />
                    </a-popconfirm>
                  </div>
                </div>
              </template>
            </a-tree>
          </div>
      </div>

      <div class="userTabContent" style="height: 100%">
          <a-tabs v-model:activeKey="activeKey" style="padding: 5px; height: 100%;">
              <a-tab-pane key="1" tab="行政区划">
                  <RegionList v-if="selectSystem" :selectSystem="selectSystem" />
                  <a-empty v-else>
                    <template #description>
                      请先选择一个子系统
                    </template>
                  </a-empty>
              </a-tab-pane>
          </a-tabs>
      </div>

  </div>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import RegionList from "/@/views/system/subSystem/components/regionList.vue"
const activeKey = ref('1');

const urlList = {
  systemList: '/api/zrzy-bdc/sys/sysSubsystem/list'
}

let systemTree: any = ref([])
let selectSystem: any = ref(null)
let selectKeys: any = ref([])

loadSystemList()

function loadSystemList() {
  systemTree.value = []
  defHttp.get(
    {
      url: urlList.systemList,
      params: { pageSize: 1000, pageNo: 1}
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      systemTree.value = res.result.records
    } else {
      message.warning(res?.message || '未查询到行政区数据！')
    }
  })
}

function onSelectSystem(selectedKeys, e) {
  selectSystem.value = e.node.dataRef
  selectKeys.value = selectedKeys
}

function editSystem(data: any) {
  console.log(data)
}

function deleteSystem(data: any) {
  console.log(data)
}

function cancelSelect() {
  selectSystem.value = null
  selectKeys.value = []
}


</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.line {
  width: 1px;
  height: 650px;
  background: linear-gradient(244deg, rgba(255, 255, 255, 0) 0%, rgba(24, 144, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
}

.customTitle {
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .oprBtns {
    .fileBtn {
      display: none;
    }
  }
}

.userTabContent {
  width: 100%;
  background-color: #fff;
  margin-left:8px;
  :deep(.ant-tabs-content) {
    height: 100%;
  }

  :deep(.ant-tabs-content-holder) {
    height: 100%;
    overflow: auto;
  }
}
</style>