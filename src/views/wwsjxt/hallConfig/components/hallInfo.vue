<template>
  <div class="hallInfo">
    <div class="wonder-table-css">
      <div class="wonder-table-toolbar">
          <a-button type="primary" @click="onShowModal(null, 'new')">
              <template #icon>
                  <plus-outlined />
              </template>
              添加大厅信息
          </a-button>
      </div>
      <a-table :columns="columns" :data-source="datalist" :pagination="pagination"
          @change="onChange($event, loadData)">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
                <a-space>
                    <template #split>
                        <a-divider type="vertical" />
                    </template>
                    <a @click="onShowModal(record, 'edit')">编辑</a>
                    <a @click="orderInfo(record)">预约信息</a>
                    <a-popconfirm title="是否确定删除该项？" ok-text="确定" cancel-text="取消"
                        @confirm="deleteData(record)">
                        <a style="color:#ff4d4f">删除</a>
                    </a-popconfirm>
                </a-space>
            </template>
          </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, h, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { cModal } from '/@/components/cModal/index';

const columns = [
  { title: "序号", dataIndex: "id", align: "center", width: 80 },
  { title: "大厅名称", dataIndex: "name", align: "center"  },
  { title: "所属区", dataIndex: "type", align: "center" },
  { title: '操作', key: 'action', align: "center", width: 200 }
]
let datalist = ref([]);

let pagination = ref({
    total: 0,
    current: 1,
    pageSize: 10,
})

const emit = defineEmits(['hallInfo'])

onMounted(() => {
  loadData() // 初始化加载数据
})

function loadData() {
  // 加载数据
  datalist.value = [{
    id: 1,
    name: '大厅1',
    type: '区1'
  }]
}

function orderInfo(record: any) {
  // 预约信息
  emit('hallInfo', record)
}

function deleteData(record: any) {
  // 删除数据
}

function onChange(pag: any, callback: any) {
  pagination.value = pag
  callback()
}

function onShowModal(data: any = null, type: String = 'new') {
  //新增 编辑 查看
  let title = type == 'new' ? '新增' : type == 'edit' ? '编辑' : '查看'
  let modal = cModal({
    title: `${title}`,
    width: 600,
    filePath: 'views/wwsjxt/hallConfig/components/addHall',
    footerStyle: { 'text-align': 'center' },
    footer: type == 'view' ? false : true,
    formData: {
      type: type, // 新增/编辑
      itemData: data, //当前操作的数据行
    },
    onOk: async (res: any) => {
      if (type == 'view') {
        modal.destroy()
      } else {
        modal.setConfirmLoading(true)
        // res为弹窗内组件的dom
        let validator = await res.onSubmit()
        if (validator) {
          modal.destroy()
          loadData()
        }
        modal.setConfirmLoading(false)
      }

    },
    onCancel: () => {
      modal.close()
    }
  })
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