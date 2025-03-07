<template>
  <div class="cc-container">
      <div style="display: flex; flex-direction: column; height: 100%">
          <div style="line-height: 3em; background-color: #fff;padding: 10px 10px;">
            <a-space style="padding-bottom: 10px;">
              <a-button type="primary" @click="addRegion()">添加区域</a-button>
              <a-button type="primary" :disabled="!selectInfo.title" @click="addRegion('child')">添加下级区域</a-button>
              <a-button type="default" :disabled="!checkedInfo.length" @click="showDeleteConfirm">批量删除区域</a-button>
            </a-space>  
            <a-alert type="info" :show-icon="true">
              <template #message>
                  当前选择：
                  <span style="font-weight: 600;">
                      {{ selectInfo.title }}
                  </span>
                  <span @click="cancelSelect" v-if="selectInfo.title" style="color:#1890ff;padding-left: 10px; cursor: pointer;">
                    取消选择
                  </span>
              </template>
            </a-alert>
          </div>
          <div class="regionList" style="margin-top: 8px;line-height: 3em; background-color: #fff; flex: 1;height: calc(100% - 60px); min-width: 500px; overflow: auto">
            <RegionList ref="regionListRef" @select="onSelect" @check="onCheck" @regionInfo="getRegionList"> </RegionList>
          </div>
      </div>

      <div class="userTabContent" style="height: 100%">
          <a-tabs v-model:activeKey="activeKey" style="padding: 5px; height: 100%;">
              <a-tab-pane key="1" tab="基本信息">
                  <BaseInfo v-if='selectInfo' :selectInfo="selectInfo" :regionData="regionData" @refreshList="onRefreshList" />
                  <a-empty v-else>
                    <template #description>
                      请先选择一个区域
                    </template>
                  </a-empty>
              </a-tab-pane>
              <a-tab-pane key="2" tab="宗地归属" force-render>
                  <ZDList v-if='selectInfo' :selectInfo="selectInfo" @refreshList="onRefreshList"/>
                  <a-empty v-else>
                    <template #description>
                      请先选择一个区域
                    </template>
                  </a-empty>
              </a-tab-pane>
          </a-tabs>
      </div>

  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, h } from "vue";
import { cModal } from "/@/components/cModal/index"
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import RegionList from "/@/views/system/regionmanage/components/regionList.vue"
const BaseInfo = defineAsyncComponent(() => import("./components/addRegion.vue"))
const ZDList = defineAsyncComponent(() => import("/@/views/system/regionmanage/components/zdList.vue"))
const activeKey = ref('1');
let selectInfo: any = ref('');
let checkedInfo: any = ref('');
let regionData: any = ref(null);
let regionListRef: any = ref()


/**
* 选中行政区
* @param node 选中的行政区
*/
function onSelect(node: any) {
  selectInfo.value = node
}

/**
* 勾选的行政区
* @param data 勾选的行政区
*/
function onCheck(data: any) {
  checkedInfo.value = data
}

/**
* 行政区列表
* @param data 行政区列表
*/
function getRegionList(data: any) {
  regionData.value = data
}

/**
* 取消选择 selectInfo
*/
function cancelSelect() {
  selectInfo.value = ''
  // 重置树选择
  regionListRef.value.onResetSelect()
}

/**
* 添加区域
* @param data 添加区域
*/
function addRegion(type: any = 'parent') {
  let modal = cModal({
    title: type == 'parent' ? '添加区域' : '添加下级区域',
    width: 800,
    filePath: 'views/system/regionmanage/components/addRegion',
    footerStyle: { 'text-align': 'center' },
    okText: '确认',
    formData: {
      type: type, // 添加区域'parent'或下级区域'child'
      parentNode: selectInfo.value, // 上级区域信息
      regionData: regionData.value
    },
    onOk: async (res: any) => {
      modal.setConfirmLoading(true)
      // res为弹窗内组件的dom
      let validator = await res.addRegion()
      if (validator) {
        //刷新树
        onRefreshList()
      }
      modal.setConfirmLoading(false)
      modal.close()
    },
    onCancel: () => {
      modal.close()
    }
  })
}

const showDeleteConfirm = () => {
  Modal.confirm({
    title: `确定要删除所选中的 ${checkedInfo.value.length} 条数据吗?`,
    icon: h(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      onDelete()
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

/**
* 批量删除勾选的行政区 checkedInfo
*/
function onDelete() {
  defHttp.delete(
    {
      url: '/api/zrzy-bdc/sys/areacode/deleteBatch',
      params: { areaCodes: checkedInfo.value.join(',') }
    },
    { withToken: true }
  ).then((res: any) => {
    if(res && res.success) {
      message.success('删除成功！')
      //刷新树
      onRefreshList()
      if(checkedInfo.value.includes(selectInfo.value.areaCode)) {
        selectInfo.value = ''
      }
    } else {
      message.warning('删除失败！')
    }
  })
}

function onRefreshList() {
  regionListRef.value.loadRegionList()
}
</script>

<style scoped lang="less">
@import url('/@/assets/less/style_lb.less');

.line {
  width: 1px;
  height: 650px;
  background: linear-gradient(244deg, rgba(255, 255, 255, 0) 0%, rgba(24, 144, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
}

.regionList {
  :deep(.ant-tree-checkbox) {
    margin-block-start: 0px !important;
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