<template>
  <div class="TdytList">
    <div class="oprBtns">
      <a-button @click="onAddNew()">
        新增
      </a-button>
    </div>
    <a-table :data-source="dataSource" :columns="columns" :row-key="record => record.id0" :pagination="false" @change="handleTableChange" class="userTable">
      <template #bodyCell="{ column, text, index, record }">
        <template v-if="column.type == 'treeSelect'">
          <div>
            <a-tree-select
              v-if="editableData[record.id0]"
              v-model:value="editableData[record.id0][column.dataIndex]"
              show-search
              style="margin: -5px 0; width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              allow-clear
              :tree-data="getTreeDictItemsByCode(column.dict)"
            >
            </a-tree-select>
            <template v-else>
              <a-input :value="getLabelByCode(column.dict, text)" :bordered="false" readonly style="text-align: center;width: 100%"/>
            </template>
          </div>
        </template>
        <template v-if="column.type == 'inputNumber'">
          <div>
            <a-input-number
              v-if="editableData[record.id0]"
              v-model:value="editableData[record.id0][column.dataIndex]"
              style="margin: -5px 0; width: 100%"
              @change="(value) => onNumberChange(value, record.id0, column.dataIndex)"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-if="column.type == 'date'">
          <div>
            <a-date-picker 
              v-if="editableData[record.id0]"
              v-model:value="editableData[record.id0][column.dataIndex]"
              style="margin: -5px 0; width: 100%"
              @change="(date) => onDateChange(date, record.id0, column.dataIndex)"
              valueFormat="YYYY-MM-DD"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a-space v-if="editableData[record.id0]">
              <a @click="save(record.id0)">保存</a>
              <a-popconfirm title="确定取消?" @confirm="cancel(record.id0)">
                <a>取消</a>
              </a-popconfirm>
            </a-space>
            <a-sapce v-else>
              <a-button type="link" size="small" @click="edit(record.id0)" :disabled="disabled">编辑</a-button>
              <a-divider type="vertical" />
              <a-popconfirm title="确定删除?" @confirm="onDelete(index)">
                <a-button type="link" size="small" :style="{color: disabled ? '' :'#ff4d4f'}" :disabled="disabled">删除</a-button>
              </a-popconfirm>
            </a-sapce>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { ref, watch, reactive } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';
import { getTreeDictItemsByCode } from '/@/utils/form/commonUtils';

let dataSource: any = ref([])
const editableData: any = reactive({});

const columns = [
  {
    title: '土地用途',
    dataIndex: 'tdyt',
    align: 'center',
    type: 'treeSelect',
    dict: 'tdyt',
    width: 200
  },
  {
    title: '权利性质',
    dataIndex: 'qlxz',
    align: 'center',
    type: 'treeSelect',
    dict: 'qlxz',
    width: 200
  },
  {
    title: '使用期限(年)',
    dataIndex: 'tdsyqx',
    align: 'center',
    type: 'inputNumber',
    width: 150
  },
  {
    title: '起始日期',
    dataIndex: 'syqqssj',
    align: 'center',
    type: 'date',
    width: 200
  },
  {
    title: '终止日期',
    dataIndex: 'syqjssj',
    align: 'center',
    type: 'date',
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'operation',
    align: 'center',
    width: 200
  },
]
// 分页
const pagination = ref<any>({ 
  total: 0,
  current: 1,
  pageSize: 100,
  showSizeChanger: false, 
  showTotal: (total: Number) => `共 ${total} 条数据` 
})

const urlList = {
  queryList: '/api/zrzy-bdc/bdc/bdcTdyt/list', // 分页列表查询
  add: '/api/zrzy-bdc/bdc/bdcTdyt/add', // 添加
  edit: '/api/zrzy-bdc/bdc/bdcTdyt/edit', // 编辑
  delete: '/api/zrzy-bdc/bdc/bdcTdyt/delete', // 通过id删除
  deleteBatch: '/api/zrzy-bdc/bdc/bdcTdyt/deleteBatch', //批量删除
  queryByID: '/api/zrzy-bdc/bdc/bdcTdyt/queryById', // 通过id查询
}

const props = defineProps({
  slbh: { // 受理编号
    type: String,
    default: ''
  },
  ywh: { // 业务号
    type: String,
    default: ''
  },
  zddm: { // 宗地代码
    type: String,
    default: ''
  },
  disabled: {
    type: String,
    default: false
  }
})

watch(() => props.zddm, (val) => {
  if(val) {
    loadData()
  }
}, {
  immediate: true
})

const edit = (index: string) => {
  if(!index) {
    index = 'editId'
  }
  editableData[index] = cloneDeep(dataSource.value.filter(item => index === item.id0)[0]);
};

const save = (index: string) => {
  let url = urlList.edit
  let method = 'put'
  if(editableData[index].id0 == 'editId') { // 新增
    url = urlList.add
    method = 'post'
    delete editableData[index].id0
  }

  defHttp[method](
    {
      url: url,
      data: editableData[index]
    },
    { withToken: true }
  ).then((res: any) => {
    if(res && res.success) {
      message.success(res.message)
      loadData()
      delete editableData[index];
    } else {
      message.warning(editableData[index].id ? '编辑失败！' : '添加失败！')
    }
  }).catch(err => {
    message.warning(err)
  })
};
const cancel = (index: string) => {
  delete editableData[index];
};

const onDelete = (index: string) => {
  if(dataSource.value[index].id0 !== 'editId') {
    // 存在id，使用接口删除
    defHttp.delete(
      {
        url: urlList.delete,
        params: { id: dataSource.value[index].id0 }
      },
      { withToken: true }
    ).then((res: any) => {
      if(res && res.success) {
        message.success('删除成功！')
        dataSource.value.splice(index, 1)
      } else {
        message.warning('删除失败！')
      }
    })
  } else {
    // 直接在dataSource中去掉就可以
    dataSource.value.splice(index, 1)
    message.success('删除成功！')
  }
}

function loadData() {
  if(!props.ywh && !props.slbh) {
    message.warning('未获取到业务号和受理编号！')
    return
  }
  // 获取土地用途列表
  defHttp.get(
    {
      url: urlList.queryList,
      params: {
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
        slbh: props.slbh,
        ywh: props.ywh,
        zddm: props.zddm
      }
    },
    { withToken: true }
  ).then((res: any) => {
    if(res?.success) {
      dataSource.value = res.result.records
      pagination.value.total = res.result.total
    } else {
      message.warning(res?.message)
    }
  })
}

function onAddNew() {
  if(!props.ywh && !props.slbh) {
    message.warning('未获取到业务号和受理编号，不允许新增！')
    return
  }
  if(Object.keys(editableData).length ||(dataSource.value.length && dataSource.value[dataSource.value.length - 1].id0 == 'editId')) {
    message.warning('已存在编辑状态的列表，请先进行保存或者删除！')
    return
  }
  dataSource.value.push({
    slbh: props.slbh,
    ywh: props.ywh,
    zddm: props.zddm,
    id0: 'editId'
  })
  editableData['editId'] = cloneDeep(dataSource.value[dataSource.value.length - 1]);
}

function handleTableChange(pag:any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function onDateChange(dateString, index, dataIndex) {
  // 根据期限起始日期算终止日期
  if(editableData[index].tdsyqx && editableData[index].syqqssj && dataIndex == 'syqqssj') {
    let originalDate = new Date(dateString);
    let newDate = addYears(originalDate, editableData[index].tdsyqx)
    editableData[index].syqjssj = timestampToDate(newDate)
  }
}

function addYears(date, years) {
  const oneDay = 24 * 60 * 60 * 1000; // 每天的毫秒数
  const totalMilliseconds = Math.round(years * 365 * oneDay); // 计算总的毫秒数
  const newDate = new Date(date.getTime() + totalMilliseconds); // 新日期
  return newDate;
}

function timestampToDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function onNumberChange(value, index, dataIndex) {
  if(value && editableData[index].syqqssj && dataIndex == 'tdsyqx') {
    let originalDate = new Date(editableData[index].syqqssj);
    let newDate = addYears(originalDate, editableData[index].tdsyqx)
    editableData[index].syqjssj = timestampToDate(newDate)
  }
}


function getLabelByCode(dict: any, value: any) {
  let arr = getTreeDictItemsByCode(dict)
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
@import url('/@/assets/less/style_lb.less');

.TdytList {
  padding: 0 10px 20px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  .oprBtns {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 10px;
    text-align: right;
    width: 100%;
  }

  .userTable {
    flex: 1;
    overflow-y: hidden;
  }
}
</style>