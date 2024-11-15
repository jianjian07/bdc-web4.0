<template>
  <div class="fileTableContent">
    <div class="oprbtn">
      <!-- <a-button type="primary" danger @click="deleteBatch">删除</a-button> -->
    </div>
    <a-table
      :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
      :columns="columns"
      :data-source="data"
    >
    <template #bodyCell="{ column, text, record }">
      <template v-if="['materialName'].includes(column.dataIndex)">
        <div>
          <a-input
            v-if="editableData[record.key]"
            v-model:value="editableData[record.key][column.dataIndex]"
            style="margin: -5px 0"
          />
          <template v-else>
            {{ text }}
          </template>
        </div>
      </template>
      <template v-else-if="column.dataIndex === 'operation'">
        <div class="editable-row-operations">
          <span v-if="editableData[record.key]">
            <a-button type="link" size="small" @click="save(record.key)">保存</a-button>
            <a-button type="link" size="small" @click="cancel(record.key)">取消</a-button>
          </span>
          <span v-else>
            <!-- <a-button type="link" size="small" @click="edit(record.key)">编辑</a-button> -->
            <a-button type="link" size="small" @click="downLoadFile(record.key, record.materialName)">下载</a-button>
            <a-button type="link" size="small" @click="previewFile(record.key)">查看</a-button>
            <a-popconfirm title="确认删除?" @confirm="deleteFile(record.key)">
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm> 
          </span>
        </div>
      </template>
    </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es';
import { onMounted, reactive, defineProps, ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import type { UnwrapRef } from 'vue';

const data: any = ref([])
const columns = [
  {
    title: '名称',
    dataIndex: 'materialName',
    width: 200
  },
  {
    title: '文件类型',
    dataIndex: '',
  },
  {
    title: '目录名称',
    dataIndex: '',
  },
  {
    title: '提交时间',
    dataIndex: '',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
]
type Key = string | number;
const state = reactive<{
  selectedRowKeys: Key[];
  loading: boolean;
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
})

const dataSource = ref(data);
const editableData: UnwrapRef<any> = reactive({});

// const edit = (key: Key) => {
//   editableData[key] = cloneDeep(dataSource.value.filter((item: { key: Key; }) => key === item.key)[0]);
// };
const save = (key: Key) => {
  Object.assign(dataSource.value.filter((item: { key: Key; }) => key === item.key)[0], editableData[key]);

  delete editableData[key];
};
const cancel = (key: Key) => {
  delete editableData[key];
};

const urlList = {
  // 附件材料
  addFile: '/api/zrzy-bdc/bdcdj/upfiles/file/addFile', // 添加材料
  getFileList: '/api/zrzy-bdc/bdcdj/upfiles/file/queryFileList', // 附件列表
  downLoadFile: '/api/zrzy-bdc/bdcdj/upfiles/file/download', //附件下载
  deleteCatalogOrFile: '/api/zrzy-bdc/bdcdj/upfiles/casematerial/deleteMaterialAndUpfiles', // 删除附件目录
}

const props = defineProps({
  formData: { //流程信息
    type: Object,
    default: {}
  }
})

onMounted(() => {
  loadFileList()
})

function loadFileList() {
  // 查询当前实例所有的附件目录树和附件
  defHttp.get(
    {
      url: urlList.getFileList,
      params: { procInstId: props.formData.procInstId } // 查询参数：受理编号 流程实例ID
    },
    { withToken: true }
  ).then((res: any) => {

    if (res?.success) {
      data.value = res?.result
    } else {
      message.warning(res?.message)
    }
  })
}

const onSelectChange = (selectedRowKeys: Key[]) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys;
}

function downLoadFile(id: any, name: any) {
  defHttp
    .get({
        url: urlList.downLoadFile,
        params: { id: id },
        responseType: "blob"
    }, { withToken: true })
    .then((res:any) => {
        if (res.size == 0) {
            message.error('下载附件出错！')
            return
        }
        //处理二进制数据并创建 Blob 对象
        const blob = new Blob([res])
        const elink = document.createElement('a')
        elink.download = name
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href)
        document.body.removeChild(elink)
    }).catch((err:any) => {
      console.log("附件报错", err);
    });
}

function previewFile(id: any) {
  // 使用kkfile预览附件
  message.info('使用kkfile预览附件')
}

// 删除附件目录或者文件
function deleteFile(id: any, type: String = '') {
  defHttp.put(
    {
      url: urlList.deleteCatalogOrFile, // 删除附件目录,
      data: [
        {
          id: id, // 目录或者文件的id
          fileType: type // 目录为foler，不传为file
        }
      ]
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      message.success(type == 'folder' ? '目录删除成功' : '文件删除成功')
      loadFileList()
    } else {
      message.warning(res?.message)
    }
  })
}

</script>

<style scoped lang="less">
.fileTableContent {
  .oprbtn {
    padding-bottom: 10px;
    button {
      margin-right: 5px;
    }
  }
}
</style>