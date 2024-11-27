<!-- 左侧导航 -->
<template>
  <!--  <a-menu v-for="menu, index in menuList" v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys" theme="dark"-->
  <!--    mode="inline">-->
  <!--    <a-sub-menu v-if="menu.children!.length > 0" :key="menu.id">-->
  <!--      <template #icon>-->
  <!--        <SettingOutlined />-->
  <!--      </template>-->
  <!--      <template #title>{{ menu.name }}</template>-->
  <!--      <a-menu-item v-for="submenu, i in dataFilter(menu.children)" :key="submenu.path" @click="changeMenu(submenu)">-->
  <!--        {{ submenu.name }}-->
  <!--      </a-menu-item>-->
  <!--    </a-sub-menu>-->
  <!--    <a-menu-item v-if="menu.children!.length == 0" :key="menu.path" @click="changeMenu(menu)">-->
  <!--      <template #icon>-->
  <!--        <SettingOutlined />-->
  <!--      </template>-->
  <!--      {{ menu.name }}-->
  <!--    </a-menu-item>-->
  <!--  </a-menu>-->
  <a-menu :openKeys="state.openKeys" v-model:selectedKeys="selectedKeys" mode="inline" theme="dark"
    @click="handleMenuItem" @openChange="onOpenChange">
    <sub-menu :menu="menuList"></sub-menu>
  </a-menu>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { usePermissionStore } from '/@/store/modules/permission'
import { useAppStore } from "/@/store/modules/app"
const appStore = useAppStore()
import { SettingOutlined } from '@ant-design/icons-vue'
import { menuModel } from '/@/api/sys/model/menuModel'
import { router } from '/@/router'
import { useTabsStore } from "/@/store/modules/tabs"
import SubMenu from "/@/views/layouts/default/sider/subMenu.vue"
import { useRouter } from "vue-router"
import { PageEnum } from "/@/enums/pageEnum"
import { findNode } from "/@/utils/form/commonUtils"

const permissionStore = usePermissionStore()
const tabStore = useTabsStore()
// tab列表
const tabList = computed(() => tabStore.getTabList)
// 当前选中tab
const tabActiveKeys = computed(() => tabStore.getTabActiveKey)
const menuInfo = permissionStore.getMenuInfo
const menuList = initMenuList(menuInfo)
const menuFirst = menuList[0]
const openKeys = [menuFirst.id]
let state = reactive({
  rootSubmenuKeys: [],
  openKeys: []
})
state.rootSubmenuKeys = getRootMenuKeys()
state.openKeys = [menuFirst.id]
let selectedKeys = ref<string[] | number[]>([])


watch(() => tabActiveKeys.value, (newVal, oldVal) => {
  selectedKeys.value = [newVal]
  let find = findNode(menuList,newVal,'path')
  if (find) {
    state.openKeys = [find.pid]
  }
})

onMounted(() => {
  const router = useRouter()
  if (router.currentRoute.value.fullPath == PageEnum.BASE_HOME
    && PageEnum.BASE_HOME !== menuFirst.children![0].path
    && tabList.value.length == 0
  ) {
    // 默认初始时 BASE_HOME 重定向到菜单首页
    router.replace({ path: menuFirst.children![0].path })
    selectedKeys.value = [menuFirst.children![0].path]
  } else {
    selectedKeys.value = [router.currentRoute.value.fullPath]
  }
})

// 过滤
function dataFilter(data: any) {
  const _data = data.filter((p: any) => {
    return p.hidden == false
  })
  return _data
}

/**
 * 初始化菜单
 * @param newArr
 */
function initMenuList(newArr) {
  let newData = newArr.filter(item => {

    if (item.children) {
      item.children = initMenuList(item.children)
    }
    return item.hidden == false
  })
  return newData
}

function getRootMenuKeys() {
  return menuList.map(menu => menu.id)
}

/**
 * 点击菜单 切换路由
 * @param item
 * @param key
 * @param keyPath
 */
function handleMenuItem({ item, key, keyPath }) {
  let menu = JSON.parse(item.role)
  // if (menu.component == 'sys/iframe/index') {
  //   appStore.setIframeSrc(menu.extra)
  // }
  router.replace({ path: menu.path })
}

/**
 * 只展开当前父级
 * @param openKeys
 */
function onOpenChange(openKeys) {
  const latestOpenKey = openKeys.find(key => state.openKeys.indexOf(key) === -1);
  if (state.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
    state.openKeys = openKeys;
  } else {
    state.openKeys = latestOpenKey ? [latestOpenKey] : [];
  }
}
</script>
<style lang="less" scoped></style>
