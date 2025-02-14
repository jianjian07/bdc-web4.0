<template>
  <div style="padding: 20px;">
    <div style="display: flex;">
      <a-input-search v-model:value="searchValue" style="margin-bottom: 8px; padding-right: 8px;" placeholder="请输入关键字查询" />
      <a-dropdown>
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="checkStrictly = !checkStrictly">
              {{ checkStrictly ? '父子关联' : '取消关联'}}
            </a-menu-item>
            <a-menu-item key="2" @click="toggleCheck">
              {{ checkedAll ? '取消勾选' : '全部勾选' }}
            </a-menu-item>
            <a-menu-item key="3" @click="toggleExpand">
              {{ expandAll ? '合并所有' : '展开所有'}}
            </a-menu-item>
          </a-menu>
        </template>
        <a-button>
          树操作
          <DownOutlined />
        </a-button>
      </a-dropdown>
    </div>
    <a-tree
      :expanded-keys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      :tree-data="gData"
      @expand="onExpand"
      checkable
      @select="onSelect"
      @check="onCheck"
      :checkStrictly="checkStrictly"
      :checked-keys="checkKeys"
      :selected-keys="selectKeys"
    >
      <template #title="{ title }">
        <span v-if="title.indexOf(searchValue) > -1">
          {{ title.substring(0, title.indexOf(searchValue)) }}
          <span style="color: #f50">{{ searchValue }}</span>
          {{ title.substring(title.indexOf(searchValue) + searchValue.length) }}
        </span>
        <span v-else>{{ title }}</span>
      </template>
    </a-tree>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { DownOutlined } from '@ant-design/icons-vue';

const urlList = {
  queryTreeAndZdgs: '/api/zrzy-bdc/sys/areacode/queryAreaTreeAndZdgs',
  queryList: '/api/zrzy-bdc/sys/areacode/queryAreaTree',
  queryByKey: '/api/zrzy-bdc/sys/areacode/searchBy'
}

let genData: any = [];
let dataList: any = [];

let checkStrictly: any = ref(false) // 父子关联 flase 关联  true 不关联
let expandAll: any = ref(false) // 展开所有 false 合并 true 展开
let checkedAll: any = ref(false) // 全部勾选 false 取消 true 勾选

const emit = defineEmits(['select', 'check', 'regionInfo'])


const generateList = (data: any) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const key = node.key;
    dataList.push({ key, title: key });
    if (node.children) {
      generateList(node.children);
    }
  }
};


const getParentKey = (
  key: any,
  tree: any,
): any => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

const expandedKeys = ref<(string | number)[]>([]);
const checkKeys = ref<(string | number)[]>([]);
const selectKeys = ref<(string | number)[]>([]);
const searchValue = ref<string>('');
const autoExpandParent = ref<boolean>(true);
const gData = ref<any>(genData);

const onExpand = (keys: string[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

watch(searchValue, () => {
  queryByKey()
});

watch(checkKeys, () => {
  emit('check', checkKeys.value)
}, {
  immediate: true,
  deep: true
})

onMounted(() => {
  loadRegionList()
})


function loadRegionList() {
  defHttp.get(
    {
      url: urlList.queryTreeAndZdgs,
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      genData = res?.result
      gData.value = genData
      generateList(genData);
      emit('regionInfo', genData)
    } else {
      message.warning(res?.message || '未查询到数据！')
    }
  })
}

function queryByKey() {
  defHttp.get(
    {
      url: urlList.queryByKey,
      params: { keyWord: searchValue.value }
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      genData = res?.result
      gData.value = genData
      generateList(genData);
    } else {
      message.warning(res?.message || '未查询到数据！')
    }
  })
}

function onSelect(selectedKeys, e) {
  if(e.selectedNodes[0] && e.selectedNodes[0].disableCheckbox) {
    return
  }
  selectKeys.value = selectedKeys
  emit('select', e.selectedNodes[0] ? e.selectedNodes[0] : '')
}

function onCheck(checkedKeys, e) {
  if(checkStrictly.value) {
    checkKeys.value = checkedKeys.checked
  } else {
    checkKeys.value = checkedKeys
  }
}

function toggleExpand() {
  expandAll.value = !expandAll.value
  if(expandAll.value) {
    const expanded = dataList
      .map((item: any) => {
        return getParentKey(item.key, gData.value);
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    expandedKeys.value = expanded;
    autoExpandParent.value = true;
  } else {
    expandedKeys.value = [];
    autoExpandParent.value = false;
  }
}

function toggleCheck() {
  checkedAll.value = !checkedAll.value
  if(checkedAll.value) {
    const checked = dataList
      .map((item: any) => {
        return getParentKey(item.key, gData.value);
      }).filter(i =>  i != undefined)
    checkKeys.value = checked;
    console.log(' checkKeys.value',  checkKeys.value)
  } else {
    checkKeys.value = [];
  }
}

function onResetSelect() {
  selectKeys.value = []
}

defineExpose({
  loadRegionList,
  onResetSelect
})
</script>





<style scoped lang="less">

</style>