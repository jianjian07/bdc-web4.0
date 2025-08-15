<template>
  <div class="multiple-header">
    <a-tabs size="small" type="editable-card" :animated="false" :hideAdd="true" :activeKey="activeKeys"
      @change="handleChange" @edit="handleEdit">
      <a-tab-pane v-for="(item, index) in tabList" :key="item.fullPath" :closable="getClosable(index)">
        <template #tab>
          <tab-action :tab-item="item"></tab-action>
        </template>
      </a-tab-pane>

      <template #rightExtra>
        <span class="tab-extra" @click="handleReLoading">
          <RedoOutlined :spin="loading" />
        </span>
        <tab-action :is-extra="true"></tab-action>
        <span class="tab-extra" @click="handleFullScreen">
          <FullscreenExitOutlined v-if="fullscreen" />
          <FullscreenOutlined v-else />
        </span>
      </template>
    </a-tabs>
  </div>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { RedoOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import { useRouter } from "vue-router"
import { router } from "/@/router"
import { usePermissionStore } from "/@/store/modules/permission"
const TabAction = defineAsyncComponent(() => import("/@/views/layouts/default/header/TabAction.vue"));
const tabStore = useTabsStore()
// tab选中面板key
const activeKeys = computed(() => tabStore.getTabActiveKey)
// tab列表
const tabList = computed(() => tabStore.getTabList);
// 全屏状态
const fullscreen = computed(() => tabStore.getIsFullScreen)
// 加载状态
let loading = ref<boolean>(false)
// 菜单相关
const permissionStore = usePermissionStore()
const menuInfo = permissionStore.getMenuInfo
const menuList = dataFilter(menuInfo)
const menuFirst = menuList[0]
import { PageEnum } from "/@/enums/pageEnum";
import { REDIRECT_ROUTE } from "/@/router/routes/basic"
// 路由
// const router = useRouter()

// 监听当前路由
watch(() => router.currentRoute.value, (newValue: any, oldValue) => {
  if (!oldValue && tabList.value.length === 0) {
    tabStore.resetTabList()
  }
  if (tabList.value.length > 0) {
    if (newValue.fullPath !== activeKeys.value && ((newValue.name != REDIRECT_ROUTE.name) && (newValue.name != REDIRECT_ROUTE.children?.[0]?.name))) {
      tabStore.addTab(newValue)
    }
  } else {
    // 如果当前路由是设置的baseHome且和菜单首页不一致 则不添加其tab
    if (PageEnum.BASE_HOME !== menuFirst?.children![0].path && newValue.fullPath == PageEnum.BASE_HOME) {
      return
    }

    if (newValue.fullPath == menuFirst?.children![0].path) {
      // 正常设置了标签页显示, 菜单首页设置第一个tab
      let first = menuFirst?.children![0]
      if (first) {
        tabStore.addTab({
          name: first.name,
          fullPath: first.path,
          meta: {
            cache: first.cache,
            component: first.component,
            componentName: first.componentName,
            title: first.name
          }
        })
      }
    } else {
      // 若是一开始没有设置标签页显示, 当开启标签页显示时, 在添加当前页面为tab前,需要把菜单首页先添加
      let first = menuFirst?.children![0]
      if (first) {
        tabStore.addTab({
          name: first.name,
          fullPath: first.path,
          meta: {
            cache: first.cache,
            component: first.component,
            componentName: first.componentName,
            title: first.name
          }
        })
      }
      // 重载界面不设置
      if ((newValue.name != REDIRECT_ROUTE.name) && (newValue.name != REDIRECT_ROUTE.children?.[0]?.name)) {
        tabStore.addTab(newValue)
      }
    }
  }
}, {
  immediate: true,
  // deep: true
})

watch(() => activeKeys.value, (newVal, oldVal) => {
  tabStore.setRouterChangeObj({ old: oldVal, new: newVal })
  if (tabStore.isFromTab) {
    // console.log('tab操作')
    tabStore.setFromTab(false) 
    if (newVal.includes('?')) {
      let params: any = getUrl(newVal)
      router.replace({ path: newVal, query: params })
    } else {
      router.replace({ path: newVal })
    }
    return // 避免循环导航
  } else {
    // console.log('路由操作')
  }
})

/**
 * 获取地址栏参数
 * @param url
 */
function getUrl(url: string) {
  if (url.includes('?')) {
    let arr = url.split('?')
    let res = arr[1].split('&')
    let item = {}
    for (let i = 0; i < res.length; i++) {
      let a = res[i].split('=')
      item[a[0]] = a[1]
    }
    return item
  } else {
    return {}
  }
}
/**
 * 是否显示关闭按钮(第一个不显示)
 * @param index
 */
function getClosable(index) {
  return !!index
}
/**
 * 切换面板
 * @param key
 */
function handleChange(key) {
  tabStore.setFromTab(true)
  tabStore.setTabActiveKey(key)
}

/**
 * 新增和删除页签的回调
 * @param targetKey
 * @param action
 */
function handleEdit(targetKey: string | MouseEvent, action: string) {
  if (action == 'remove') {
    let find = tabList.value.find((f: any) => f.fullPath == targetKey)
    if (find) {
      tabStore.removeTab(find)
    }
  }
}

/**
 * 点击重新加载
 */
function handleReLoading() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
  tabStore.refreshTab()
}

/**
 * 切换全屏
 */
function handleFullScreen() {
  tabStore.toggleFullScreen()
}

/**
 * 菜单过滤
 * @param data
 */
function dataFilter(data: any) {
  const _data = data.filter((p: any) => {
    return p.hidden == false;
  })
  return _data;
}
</script>
<style lang="less" scoped>
.multiple-header {
  height: 50px;
  background-color: #fff;
  box-shadow: 0 1px 4px #00152914;

  :deep(.ant-tabs) {
    .ant-tabs-nav-wrap {
      height: 40px;
      margin-top: 4px;
    }

    .ant-tabs-tab {
      background-color: #fff;
      padding: 0 20px 0 30px;
      margin: 0 10px 0 0 !important;
      border: 0;
    }

    .ant-tabs-tab:hover {
      border: none;
      outline: none;
      
      .ant-tabs-tab-remove {
          opacity: 1;

          .anticon-close:hover {
            background-color: #c0c4cc;
            transform-origin: 100% 50%;
            border-radius: 100%;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

            svg {
              width: 11px;
              color: white;
            }
          }
        }
    }

    .ant-tabs-tab-active {
      border-bottom: 2px solid #00b96b !important;

      &:hover {
        .ant-tabs-tab-remove {
          opacity: 1;

          .anticon-close:hover {
            background-color: #c0c4cc;
            transform-origin: 100% 50%;
            border-radius: 100%;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

            svg {
              width: 11px;
              color: white;
            }
          }
        }
      }
    }

    .ant-tabs-nav {
      margin: 0;
      height: 50px;
      padding-left: 10px;

      .ant-tabs-tab-remove {
        position: relative;
        left: 10px;
        margin: 0;
        padding: 0;
        font-size: 10px;
        opacity: 0;

        .anticon-close {
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}

.tab-extra {
  display: inline-block;
  width: 36px;
  height: 50px;
  line-height: 50px;
  color: #00000073;
  text-align: center;
  cursor: pointer;
  border-left: 1px solid #d9d9d9;
}
</style>
