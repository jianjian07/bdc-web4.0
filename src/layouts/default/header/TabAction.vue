<template>
  <a-dropdown :trigger="trigger">
    <span v-if="isExtra" class="tab-extra">
      <DownOutlined />
    </span>
    <span v-else class="tab-action">
      <span class="tab-info">
        {{ tabItem.meta.title }}
      </span>
    </span>
    <template #overlay>
      <a-menu>
        <a-menu-item :disabled="item.disabled" v-for="item in dropMenuList" @click="handleClickTabAction(item.value)">
          <RedoOutlined v-if="item.value == 'refresh'"/>
          <CloseOutlined v-if="item.value == 'closeCurrent'" />
          <VerticalAlignTopOutlined style="transform: rotate(-90deg)" v-if="item.value == 'closeLeft'"/>
          <VerticalAlignBottomOutlined style="transform: rotate(-90deg)" v-if="item.value == 'closeRight'"/>
          <VerticalAlignMiddleOutlined v-if="item.value == 'closeOther'"/>
          <MinusOutlined v-if="item.value == 'closeAll'"/>
          {{ item.title }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { DownOutlined,RedoOutlined,CloseOutlined,MinusOutlined,
  VerticalAlignTopOutlined,VerticalAlignBottomOutlined,VerticalAlignMiddleOutlined

} from '@ant-design/icons-vue';
import { useTabsStore } from "/@/store/modules/tabs"
const tabStore = useTabsStore()
const props = defineProps({
  tabItem: {
    type: Object,
    default: null
  },
  isExtra: {
    type: Boolean,
    default: false
  }
})
// tab列表
const tabList = computed(() => tabStore.getTabList);
const trigger = computed(() => props.isExtra ? 'click' : 'contextmenu')
const currentTab = computed(() => tabStore.getCurrentTab )
// 下拉菜单
let dropMenuList = computed(() => {
  let tab,refreshDisabled,leftDisabled,rightDisabled,otherDisabled,currentDisabled,allDisabled
  tab = props.tabItem ? props.tabItem : currentTab.value
  let tabLength = tabList.value.length
  let currentTabIndex = tabList.value.findIndex(f => f.fullPath == tab.fullPath)
  let activeTab = currentTab.value
  if (tab.fullPath == activeTab.fullPath) {
    refreshDisabled = false
    leftDisabled = currentTabIndex == 0
    rightDisabled = currentTabIndex == tabLength - 1
    otherDisabled = tabLength < 2
    currentDisabled = currentTabIndex == 0
    allDisabled = false
  } else {
    refreshDisabled = true
    leftDisabled = true
    rightDisabled = true
    otherDisabled = true
    currentDisabled = currentTabIndex == 0
    allDisabled = false
  }
  return [
    {
      title: '重新加载',
      value: 'refresh',
      disabled: refreshDisabled
    },
    {
      title: '关闭当前',
      value: 'closeCurrent',
      disabled: currentDisabled
    },
    {
      title: '关闭左侧',
      value: 'closeLeft',
      disabled: leftDisabled
    },
    {
      title: '关闭右侧',
      value: 'closeRight',
      disabled: rightDisabled
    },
    {
      title: '关闭其他',
      value: 'closeOther',
      disabled: otherDisabled
    },
    {
      title: '关闭全部',
      value: 'closeAll',
      disabled: allDisabled
    }
  ]
})

/**
 * 点击tab操作
 * @param action
 */
function handleClickTabAction(action) {
  let tab = props.tabItem ? props.tabItem : currentTab.value
  switch (action) {
    case 'refresh':
      tabStore.refreshTab()
      break;
    case 'closeAll':
      tabStore.closeAllTab()
      break;
    case 'closeLeft':
      tabStore.closeLeftTab(tab)
      break;
    case 'closeRight':
      tabStore.closeRightTab(tab)
      break;
    case 'closeOther':
      tabStore.closeOtherTab(tab)
      break;
    case 'closeCurrent':
      tabStore.closeCurrentTab(tab)
      break;
  }
}

</script>

<style lang="less" scoped>
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
