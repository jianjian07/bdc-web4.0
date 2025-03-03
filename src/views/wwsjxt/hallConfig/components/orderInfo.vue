<template>
  <div class="hallInfo">
    <div v-if="hallInfo?.id" class="wonder-table-css">
      <div class="wonder-table-toolbar">
          <a-button type="primary" @click="addData">
              <template #icon>
                  <plus-outlined />
              </template>
              添加预约信息
          </a-button>
      </div>
      <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
          @change="onChange($event, loadData)">
          <template #bodyCell="{ column, text, index, record }">
            <template v-if="column.key == 'index'">
              {{ pagination.current * pagination.pageSize - pagination.pageSize + index + 1 }}
            </template>
            <template v-if="column.type == 'select'">
              <div>
                <a-select
                  v-if="editableData[record.id]"
                  v-model:value="editableData[record.id][column.dataIndex]"
                  allow-clear
                  :options="getDictItemsByCode(column.dict)"
                  style="width: 100%"
                >
                </a-select>
                <template v-else>
                  {{ getLabelByCode(column.dict, text) }}
                </template>
              </div>
            </template>
            <template v-if="column.type == 'inputNumber'">
              <div>
                <a-input-number
                  v-if="editableData[record.id]"
                  v-model:value="editableData[record.id][column.dataIndex]"
                  style="margin: -5px 0; width: 100%; text-align: center;"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <div class="editable-row-operations">
                <a-space v-if="editableData[record.id]">
                  <a @click="save(record.id)">保存</a>
                  <a-popconfirm title="确定取消?" @confirm="cancel(record.id)">
                    <a>取消</a>
                  </a-popconfirm>
                </a-space>
                <a-sapce v-else>
                  <a-button type="link" size="small" @click="edit(record.id)">编辑</a-button>
                  <a-divider type="vertical" />
                  <a-popconfirm title="确定删除?" @confirm="onDelete(index)">
                    <a-button type="link" size="small" style="color: #ff4d4f">删除</a-button>
                  </a-popconfirm>
                </a-sapce>
              </div>
            </template>
          </template>
      </a-table>
    </div>
    <a-empty style="padding-top: 80px;" v-else description="点击左侧操作列查询预约信息" ></a-empty>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { cloneDeep } from 'lodash-es';
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils';

const columns = [
  { title: "序号", key: "index", align: "center", width: 80 },
  { title: "登记类型", dataIndex: "yyDjlx", type: 'select', dict: 'yydjlx', align: "center", width: 200 },
  { title: "预约总数", dataIndex: "yyzs", type: 'inputNumber', align: "center", width: 200  },
  { title: '操作', dataIndex: 'action', align: "center", width: 180 }
]
let datalist:any = ref([]);
const editableData: any = reactive({});

let pagination = ref({
  total: 0,
  current: 1,
  pageSize: 10,
})

const urlList = {
  add: '/api/zrzy-wwsj/wwsj/yypz/save',
  delete: '/api/zrzy-wwsj/wwsj/yypz/delete',
  list: '/api/zrzy-wwsj/wwsj/yypz/list' 
}

const props = defineProps({
  hallInfo: {
    type: Object,
    default: () => ({})
  }
})

watch(() => props.hallInfo, (newVal) => {
  if (newVal && newVal.id) {
    loadData()
  } else {
    datalist.value = []
  }
}, {
  immediate: true
})


const edit = (index: string) => {
  if(!index) {
    index = 'editId'
  }
  editableData[index] = cloneDeep(datalist.value.filter(item => index === item.id)[0]);
};

const save = (index: string) => {
  let url = urlList.add
  
  if(editableData[index].id == 'editId') { // 新增
    delete editableData[index].id
  }

  defHttp.post(
    {
      url: url,
      data: { 
        dtid: props.hallInfo.id ,
        dtmc: props.hallInfo.dtmc,
        areaCode: props.hallInfo.areaCode,
        ...editableData[index]
      }
    },
    { withToken: true }
  ).then((res: any) => {
    console.log(res)
    if(res && res.success) {
      message.success(res.message || '操作成功！')
      loadData()
      delete editableData[index];
    } else {
      message.warning(res.message || '操作失败！')
    }
  }).catch(err => {
    message.warning(err)
  })
};
const cancel = (index: string) => {
  delete editableData[index];
};

const onDelete = (index: string) => {
  if(datalist.value[index].id !== 'editId') {
    // 存在id，使用接口删除
    defHttp.delete(
      {
        url: urlList.delete,
        params: { id: datalist.value[index].id }
      },
      { withToken: true }
    ).then((res: any) => {
      if(res && res.success) {
        message.success('删除成功！')
        datalist.value.splice(index, 1)
      } else {
        message.warning('删除失败！')
      }
    })
  } else {
    // 直接在dataSource中去掉就可以
    datalist.value.splice(index, 1)
    message.success('删除成功！')
  }
}

function loadData() {
  // 加载预约信息数据
  defHttp.get(
    {
      url: urlList.list,
      params: {
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        dtid: props.hallInfo.id
      }
    },
    { withToken: true }
  ) .then((res: any) => {
    if(res && res.success) {
      datalist.value = res.result.records
      pagination.value.total = res.result.total
    } else {
      message.warning('加载预约数据失败')
    }
  })
}

function addData() {
  if(editableData['editId']) {
    message.warning('请先保存当前编辑数据！')
    return
  }
  // 添加大厅信息
  datalist.value.push({
    yyDjlx: '',
    yyzs: '',
    id: 'editId'
  })
  editableData['editId'] = cloneDeep(datalist.value[datalist.value.length - 1]);
}

function onChange(pag: any, callback: any) {
  pagination.value = pag
  callback()
}

function getLabelByCode(dict: any, value: any) {
  let arr = getDictItemsByCode(dict)
  let find = findNode(arr, value)
  return find ? find.label : ''
}

/**
 * 循环遍历
 * @param arr
 * @param key
 */
 function findNode(arr, key) {
  for (let i = 0; i < arr.length; i++) {
    let node = arr[i];
    if (node.value === key) return node;
    if (node.children && node.children.length > 0) {
      let foundNode = findNode(node.children, key);
      if (foundNode) return foundNode;
    }
  }
  return null;
}
</script>

<style scoped lang="less">
// table通用样式，保持项目内样式一致
@import url('/@/assets/less/table.less');
.hallInfo {
  flex: 1;
  padding: 10px;
}
</style>