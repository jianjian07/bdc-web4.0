<template>

</template>

<script setup lang="ts">

</script>

<style scoped lang="less"></style>
<!-- <template>
  <a-dropdown :trigger="trigger">
    <span v-if="isExtra" class="tab-extra"> 测试 </span>
    <span v-else class="tab-action">
      <span class="tab-info"> 测试 </span>
    </span>
    <template #overlay>
      <a-menu>
        <a-menu-item
          v-for="item in dropMenuList"
          @click="handleClickTabAction(item.value)"
        >
          {{ item.title }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

  <script lang="ts" setup>
import { computed, onMounted, ref, onBeforeUnmount } from "vue"
import { message } from "ant-design-vue";
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
const currentTab = computed(() => tabStore.getCurrentTab)
// 下拉菜单
let dropMenuList = computed(() => {
  return [
    {
      title: '保存',
      value: 'saveFun'
    },
    {
      title: '获取高度',
      value: 'heightFun'
    },
    {
      title: '移交',
      value: 'saveHandOver'
    }
  ]
})
onMounted(() => {
  // 开启监听
  window.top.addEventListener('message', eventLister, false)
});
onBeforeUnmount(() => {
  // 摧毁监听
  window.top.removeEventListener('message', eventLister)
})
/**
 * 监听事件
 * @param e
 */
function eventLister(e) {
  // 接收来自表单的数据
  var data = Object.prototype.toString.call(e.data) === '[object String]' ? JSON.parse(e.data) : e.data
  // 执行保存方法标识
  switch (data.method) {
    case 'getIframeMessageCallback':
      getIframeMessageCallback(data.data)
      break;
    case 'getSaveFormResult':
      getSaveFormResult(data.data)
      break;
    case 'saveHandOver':
      getSaveHandOverResult(data.data)
      break;
  }
}
/**
 * 点击tab操作
 * @param action
 */
function handleClickTabAction(action) {
  switch (action) {
    case 'saveFun':
      saveForm()
      break;
    case 'heightFun':
      getIframeMessage()
      break;
    case 'saveHandOver':
      saveHandOver()
      break;
  }
}
/**
 * 表单执行保存
 */
function saveForm() {
  window.postMessage(JSON.stringify({
    method: 'saveForm'
  }), '*')
}
/**
 * 表单获取高度
 */
function getIframeMessage() {
  window.postMessage(JSON.stringify({
    method: 'getIframeMessage'
  }), '*')
}

/**
 * 表单执行移交
 */
function saveHandOver() {
  window.postMessage(JSON.stringify({
    method: 'saveHandOver'
  }), '*')
}

/**
 * 返回表单高度
 */
function getIframeMessageCallback(data) {
  var obj = JSON.parse(data)
  message.success("表单高度为：" + obj.height + "px")
}
/**
 * 返回保存操作结果
 */
function getSaveFormResult(data) {
  var obj = JSON.parse(data)
  if (obj && obj.saveResult) {
    // message.success(obj.saveMessage)
  } else {
    message.error(obj.saveMessage)
  }
}

/**
 * 返回移交操作结果
 * @param data
 */
function getSaveHandOverResult(data) {
  console.log('data',data)
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
</style> -->
