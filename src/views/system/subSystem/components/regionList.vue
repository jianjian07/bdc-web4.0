<template>
  <div style="display: flex; flex-direction: column; padding: 10px; max-height: 100%;">
    <a-spin :spinning="spinning">
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
      <div class="regionList" style="flex: 1; overflow-y: auto; min-height: 200px;">
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
          :fieldNames="{key: 'areaCode', title: 'titleAndValue'}"
        >
          <template #title="{ titleAndValue }">
            <span v-if="titleAndValue.indexOf(searchValue) > -1">
              {{ titleAndValue.substring(0, titleAndValue.indexOf(searchValue)) }}
              <span style="color: #f50">{{ searchValue }}</span>
              {{ titleAndValue.substring(titleAndValue.indexOf(searchValue) + searchValue.length) }}
            </span>
            <span v-else>{{ titleAndValue }}</span>
          </template>
        </a-tree>
      </div>
      <div v-if="gData.length" style="display: flex; justify-content: center;">
        <a-button type="primary" @click="onSave">
          保存
        </a-button>
      </div>
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { DownOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  selectSystem: {
    type: Object,
    default: null
  }
})

const urlList = {
  queryTreeAndZdgs: '/api/zrzy-bdc/sys/areacode/queryAreaTreeAndZdgs',
  queryZDGSList: '/api/zrzy-bdc/sys/sysSubArea/list',
  save: '/api/zrzy-bdc/sys/sysSubArea/save'
}

let genData: any = [];
let dataList: any = [];

let checkStrictly: any = ref(true) // 父子关联 flase 关联  true 不关联
let expandAll: any = ref(false) // 展开所有 false 合并 true 展开
let checkedAll: any = ref(false) // 全部勾选 false 取消 true 勾选

let spinning = ref<boolean>(false)

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
let checkNodes = ref([])

const onExpand = (keys: string[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

watch(searchValue, () => {
  // const expanded = dataList
  //   .map((item: any) => {
  //     if (item.title.indexOf(value) > -1) {
  //       return getParentKey(item.key, gData.value);
  //     }
  //     return null;
  //   })
  //   .filter((item, i, self) => item && self.indexOf(item) === i);
  // // expandedKeys.value = expanded;
  // searchValue.value = value;
  // autoExpandParent.value = true;
});

watch(() => props.selectSystem, val => {
  if(val) {
    // TODO 查询当前子系统已添加的区域列表 赋值给 checkKeys
    loadZDGSData()
  } else {
    checkKeys.value = []
  }
}, {
  immediate: true
})

onMounted(() => {
  loadRegionList()
})


function loadRegionList() {
  spinning.value = true
  defHttp.get(
    {
      url: urlList.queryTreeAndZdgs,
      params: { mainArea: true }
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      genData = res?.result
      setData(genData)
      gData.value = genData
      generateList(genData);
      toggleExpand()
    } else {
      message.warning(res?.message || '未查询到行政区域数据！')
    }
    spinning.value = false
  }).catch(err => {
    spinning.value = false
  })
}

function setData(data) {
  for(let i=0; i< data.length; i++) {
    data[i].disableCheckbox = false
    if(data[i].children) {
      setData(data[i].children)
    }
  }
}

function loadZDGSData() {
  var params = {
    pageNo: 1,
    pageSize: -1,
    order: 'desc,asc',
    column: 'id,areaCode',
    subsystemid: props.selectSystem.id
  }
  // 获取宗地归属
  defHttp.get(
    {
      url: urlList.queryZDGSList,
      params: params
    },
    { withToken: true }
  ).then((res: any) => {
    if(res?.success) {
      if( res?.result?.records?.length ) {
        checkKeys.value = res.result.records.map(ele => {
          return ele.zdgs || ele.areaCode //宗地归属为空，则返回areaCode
        }).join(',').split(',')

        checkNodes.value = res.result.records.map(ele => {
          return {
            areaCode: ele.areaCode,
            areaName: ele.areaName,
            subsystemname: ele.subsystemname,
            subsystemid: ele.subsystemid,
            zdgs: ele.zdgs
          }
        })
      } else {
        checkKeys.value = []
        checkNodes.value = []
      }
    } else {
      message.warning(res?.message)
    }
  })
}

function onSelect(selectedKeys, e) {
  if(e.selectedNodes[0] && e.selectedNodes[0].disableCheckbox) {
    return
  }
  selectKeys.value = selectedKeys
}

function onCheck(checkedKeys, e) {
  checkNodes.value = e.checkedNodes.map(ele => {
    return {
      areaCode: ele.type == '2' ? ele.parentCode : ele.areaCode,
      areaName: ele.type == '2' ? ele.parentName : ele.areaName,
      subsystemname: props.selectSystem.name,
      subsystemid: props.selectSystem.id,
      zdgs: ele.type == '2' ? ele.areaCode : '' //选择为区县，宗地归属置空
    }
  })
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
  } else {
    checkKeys.value = [];
  }
}

function onResetSelect() {
  selectKeys.value = []
}

function onSave() {
  defHttp.post(
    {
      url: urlList.save,
      data: checkNodes.value,
      params: { subsystemid: props.selectSystem.id }
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      message.success('保存成功！')
    } else {
      message.warning(res?.message || '保存失败')
    }
  })
}

defineExpose({
  loadRegionList,
  onResetSelect
})
</script>





<style scoped lang="less">
.regionList {
  :deep(.ant-tree-checkbox) {
    margin-block-start: 0px !important;
  }
}
</style>