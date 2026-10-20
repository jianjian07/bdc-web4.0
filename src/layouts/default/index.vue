<template>
  <Layout :class="prefixCls" style="height: 100vh">
    <!-- <LayoutFeatures /> -->
    <!-- 头 -->
    <LayoutHeader fixed v-show="!fullscreen" />
    <Layout :class="[layoutClass]" style="min-height: calc(100% - 50px)">
      <!-- 左侧导航 -->
      <!-- 这里测试如果sider的放里面会导致莫名其妙渲染100多次-->
      <a-layout-sider class="menu-sider" width="250" v-model:collapsed="getCollapsed" collapsible :trigger="null"
        v-show="!fullscreen">
        <LayoutSideBar />
      </a-layout-sider>

      <Layout :class="`${prefixCls}-main`">
        <!-- 暂时不增加 -->
        <LayoutMultipleHeader v-if="getTabsShow" />
        <a-spin :spinning="appStore.getPageLoading" size="large">
          <LayoutContent />
        </a-spin>
      </Layout>
    </Layout>
  </Layout>
  <spin-mask v-if="maskShow" :mask-text="maskText"></spin-mask>
</template>
<script lang="ts" setup>
import { Layout, Modal } from 'ant-design-vue'
import { computed, onMounted, unref, ref, defineAsyncComponent, toRefs, onBeforeUnmount } from 'vue'
import LayoutHeader from '/@/layouts/default/header/index.vue'
import LayoutMultipleHeader from '/@/layouts/default/header/MultipleHeader.vue'
import LayoutSideBar from '/@/layouts/default/sider/index.vue'
// import LayoutContent from './content/index.vue';
import { useAppStore } from '/@/store/modules/app';
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { useTabsStore } from "/@/store/modules/tabs"
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
import { PageEnum } from "/@/enums/pageEnum";
import { currentRoute } from "/@/router"
import { useUserStore } from "/@/store/modules/user.ts"
import { createWsBroad } from '/@/utils/wsBroad'
import type { WsBroadClient } from '/@/utils/wsBroad'
const LayoutContent = defineAsyncComponent(() => import("./content/index.vue"));
const appStore = useAppStore()
const tabStore = useTabsStore()
// tab显示状态
const { getTabsShow } = useTabsSetting()
// 全屏状态
const fullscreen = computed(() => tabStore.getIsFullScreen)
// 收缩状态
const { getCollapsed } = useMenuSetting();
// 蒙版相关
let { maskShow, maskText } = toRefs(appStore.$state)
const route = currentRoute;
let prefixCls = 'default-layout'
let showMenuList = ref(true)
let wsBroad: WsBroadClient | null = null;

onMounted(() => {
  onStartWs()
})

onBeforeUnmount(() => {
  onCloseWs()
})

/**
 * 开启ws: 订阅本人通知通道(notification.user, 需 token 鉴权绑定),
 * 收到踢下线通知时弹窗并登出(负载 traceId 与本地不符则忽略, 多租户同名用户隔离)
 */
function onStartWs() {
  const userStore = useUserStore();
  const userInfo = userStore.getUserInfo
  if (userInfo && userInfo.username) {
    wsBroad = createWsBroad({
      url: (window as any).settingConfig?.wsbaseDomain + "/zrzy-system/ws/broad",
      token: () => userStore.getToken,
      channel: 'notification.user',
      selector: userInfo.username,
      onMessage: (data: any) => {
        const payload = (data && typeof data === 'object') ? data : { message: data };
        if (payload.traceId && userInfo.loginTraceId && payload.traceId !== userInfo.loginTraceId) {
          return;
        }
        Modal.warning({
          title: '系统下线通知',
          content: payload.message || '您已在其他设备登录，即将退出！',
          onOk() {
            userStore.logout(true);
          }
        });
      }
    })
  }
}

/**
 * 关闭ws
 */
function onCloseWs() {
  if (wsBroad) {
    wsBroad.close();
    wsBroad = null;
  }
}

const layoutClass = () => {
  let cls: string[] = ['ant-layout'];
  if (unref(true) || unref(true)) {
    cls.push('ant-layout-has-sider');
  }
  return cls;
};
</script>
<style lang="less">
@prefix-cls: ~'default-layout';

.@{prefix-cls} {
  display: flex;
  width: 100%;
  min-height: 100% !important;
  // background-color: @content-bg;
  flex-direction: column;

  >.ant-layout {
    min-height: 100%;
  }

  &-main {
    width: 100%;
    margin-left: 1px;
  }
}

.menu-sider {
  overflow: auto;
}

.menu-sider::-webkit-scrollbar {
  display: none;
}
</style>
