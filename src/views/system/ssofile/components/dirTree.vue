<template>
  <div class="ssoFileTree">
    <div class="treeList">
      <div class="batchDownLoadBtn" v-permission="'report:file:download'">
        <a-button type="primary" v-if="showFileDownLoadBtn" :icon="h(DownOutlined)" @click="batchDownLoad">下载</a-button>
      </div>
      <a-directory-tree v-if="ssoFileList && ssoFileList.length > 0" :tree-data="ssoFileList"
        v-model:expandedKeys="expandedKeys" :load-data="loadFileList" :selectable="true" :checkable="isCheckabled"
        @select="handleSelectTreeNode" v-model:checkedKeys="checkedKeys" show-icon style="width: 100%">
        <template #icon="">
        </template>
        <template #title="{ dataRef }">
          <div class="customTitle">
            <div style="display: flex; align-items: center;">
              <FileIcon v-if="dataRef.parentId == '0' || dataRef.dirkey" type="folder" />
              <FileIcon v-else :file-name="dataRef.title" />
              <div v-if="dataRef.parentId == '0'">
                <a-tooltip :title="dataRef.materialName + `（${dataRef.children.length}个）`">
                  <div class="text-ellipsis">
                    {{ dataRef.materialName }}
                    <span style="color: #5094f9;font-weight: 600;">（{{ dataRef.children.length }}个）</span>
                  </div>
                </a-tooltip>
              </div>
              <template v-else>
                <a-tooltip :title="dataRef.title">
                  <div class="text-ellipsis">
                    {{ dataRef.title }}
                  </div>
                </a-tooltip>
              </template>
            </div>
            <div v-if="dataRef.parentId != '0' && !dataRef.dirkey">
              <a-button class="file-preview-btn" type="link" block>查看</a-button>
            </div>
          </div>
        </template>
      </a-directory-tree>
      <a-empty v-else description="暂无材料信息" />
    </div>
    <div v-if="filePreview" class="filePreview">
      <div class="oprBtns">
        <a @click="downLoadFile">下载</a>
        <a @click="closePreview">关闭</a>
      </div>
      <iframe :src="previewData.previewUrl" style="border: none" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, watch, inject, computed } from 'vue'
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';
import { Base64 } from 'js-base64';
import { DownOutlined } from '@ant-design/icons-vue'
import FileIcon from '/@/components/FileIcon.vue'
import { findNode } from "/@/views/online/utils/commonUtils.ts"
import { ContentTypeEnum } from "/@/enums/httpEnum.ts"
import { usePermissionStore } from "/@/store/modules/permission.ts"
import { formatToDateTime } from "/@/views/online/utils/dateUtil.ts"
const eventBus = inject('scopedEventBus', null)
const permissionList = usePermissionStore().getPermissionList
let ssoFileList: any = ref([])
let filePreview: any = ref(false)
let previewData: any = ref('')
let expandedKeys: any = ref([])

const urlList = {
  dirList: '/api/zrzy-bdc/bdcdj/upfiles/file/getDirListForView', // 获取最外层目录，适配一个流程对应多个业务的情况
  queryAll: '/api/zrzy-bdc/bdcdj/upfiles/file/queryMaterialTreeList', // 根据dirkey获取附件目录树和附件
  // 附件材料
  downLoadFile: '/api/zrzy-bdc/bdcdj/upfiles/file/download', // 附件下载
}
const baseApi = ref('')
const kkFileApi = ref('')
const proxyBaseApi = ref('')
let checkedKeys: any = ref([])

const props = defineProps({
  isManage: {
    type: Boolean,
    default: false
  },
  formData: { //流程信息
    type: Object,
    default: {}
  }
})

const isCheckabled = computed(() => {
  return permissionList.includes('report:file:download')
})

const selectedFileKeys = computed(() => {
  return checkedKeys.value.map((key) => {
    let find = findNode(ssoFileList.value, key, 'id')
    return {
      fileType: find?.fileType,
      id: find?.id,
    }
  }).filter((item) => item.fileType !== 'folder')
})

const showFileDownLoadBtn = computed(() => {
  return selectedFileKeys.value.length > 0
})

enum api {
  batchDownload = '/api/zrzy-bdc/bdcdj/upfiles/file/downloadPl' // 批量下载
}

watch(() => props.formData, (val) => {
  if (val.slbh) {
    loadDirList()
  }
}, {
  immediate: true,
  deep: true
})


onMounted(() => {
  kkFileApi.value = window.settingConfig.kkFileDomain
  baseApi.value = window.settingConfig.baseDomain
  proxyBaseApi.value = window.settingConfig.proxyBaseDomain
})

function loadDirList() {
  // 查询当前实例所有的附件目录树和附件
  defHttp.get(
    {
      url: urlList.dirList,
      params: { slbh: props.formData.slbh, db: props.formData.db } // 查询参数：受理编号 流程实例ID
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      // 默认获取第一条数据下面的附件树
      if (res?.result?.length) {
        ssoFileList.value = res?.result.map(ele => {
          return {
            dirkey: ele.dirkey,
            title: ele.title,
            key: ele.dirkey,
            parentId: ele.parentId,
            selectable: ele.parentId && ele.parentId != '0' ? true : false
          }
        })
        expandedKeys.value = [res?.result[0].dirkey]
      }
    } else {
      message.warning(res?.message || '未查询到数据！')
    }
  })
}

function loadFileList(node) {
  return new Promise(resolve => {
    if (node?.dataRef?.children || !node.dirkey) {
      resolve(true)
      return
    }
    // 查询当前目录下所有的附件目录树和附件
    defHttp.get(
      {
        url: urlList.queryAll,
        params: { slbh: node.dirkey, db: props.formData.db } // 查询参数：dirkey
      },
      { withToken: true }
    ).then((res: any) => {
      if (res?.success) {
        node.dataRef.children = res?.result.map(ele => {
          return {
            ...ele,
            selectable: ele.parentId && ele.parentId != '0' ? true : false,
          }
        })
        ssoFileList.value = [...ssoFileList.value];
        resolve(true)
      } else {
        message.warning(res?.message || '未查询到数据！')
        resolve(true)
      }
    })
  })
}

function previewFile(data: any) {
  // 后端返回kkFile路径预览附件
  eventBus.emit('previewFile', true)
  filePreview.value = true
  previewData.value = data
  let format = ''
  if (data.title && data.title.includes('.')) {
    let arr = data.title.split('.')
    format = arr[arr.length - 1]
  }
  format = format.toLowerCase();
  let officePreviewType = ''
  // 需要 PDF 效果的类型
  const pdfPreferred = ['pdf', 'doc', 'docx']
  if (format && pdfPreferred.includes(format)) {
    officePreviewType = '&officePreviewType=pdf'
  }
  let base = ['jpg', 'png', 'jpeg'].includes(format) ? proxyBaseApi.value : baseApi.value
  let newName = data.title.replace(/\.(?=[^.]*$)/, `${data.id}.`);
  let encodeUrl = encodeURIComponent(Base64.encode(`${base}/zrzy-bdc/bdcdj/upfiles/file/download?id=${data.id}&db=${props.formData.db}&fullfilename=${newName}`))
  //previewData.value.previewUrl = `${kkFileApi.value}/onlinePreview?url=${encodeUrl}${officePreviewType}`
  //长治linux中4.0和4.4在以pdf模式预览电子签名pdf时都不显示签名，改回默认jpg模式
  previewData.value.previewUrl = `${kkFileApi.value}/onlinePreview?url=${encodeUrl}`
}

function closePreview() {
  filePreview.value = false
  eventBus.emit('previewFile', false)
}

function downLoadFile() {
  defHttp
    .get({
      url: urlList.downLoadFile,
      params: { id: previewData.value.id },
      responseType: "blob"
    }, { withToken: true, withTimeout: false })
    .then((res: any) => {
      if (res.size == 0) {
        message.error('下载附件出错！')
        return
      }
      //处理二进制数据并创建 Blob 对象
      const blob = new Blob([res])
      const elink = document.createElement('a')
      elink.download = previewData.value.title
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href)
      document.body.removeChild(elink)
    }).catch((err: any) => {
      console.log("附件报错", err);
    });
}

function handleSelectTreeNode(selectedKeys, e) {
  let dataRef = e.node.dataRef
  if (dataRef.parentId != '0' && !dataRef.dirkey) {
    previewFile(dataRef)
  }
}

function batchDownLoad() {
  if (selectedFileKeys.value.length > 0) {
    let ids = selectedFileKeys.value.map((item) => item.id).join(',')
    defHttp.post({
      url: api.batchDownload,
      responseType: "blob",
      params: { ids: ids },
      headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED }
    }, { withToken: true }).then((res: any) => {
      if (res.size == 0) {
        message.error('下载附件出错！')
        return
      }
      const blob = new Blob([res])
      const elink = document.createElement('a')
      let title = '附件_' + props.formData.slbh + '_'
      title = title + formatToDateTime(new Date().getTime()) + '.zip'
      elink.download = title
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href)
      document.body.removeChild(elink)
    }).catch((err: any) => {
      console.log("附件报错", err);
      message.error('下载附件出错！')
    })
  }
}

</script>

<style scoped lang="less">
.ssoFileTree {
  display: flex;
  width: 100%;
  height: 100%;

  .text-ellipsis {
    width: 180px;
    /* 定义容器宽度 */
    white-space: nowrap;
    /* 确保文本在一行内显示 */
    overflow: hidden;
    /* 隐藏超出容器的内容 */
    text-overflow: ellipsis;
    /* 使用省略号表示被截断的文本 */
  }

  .addNewBtn {
    padding-bottom: 10px;

    button {
      margin-right: 5px;
    }
  }

  .treeList {
    width: 100%;
    height: 100%;
    overflow: auto;
    min-width: 300px;
    max-width: 350px;

    .customTitle {
      height: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .oprBtns {
        .fileBtn {
          display: none;
        }
      }

      &:hover {
        .oprBtns {
          .fileBtn {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
          }
        }
      }
    }

    :deep(.ant-tree) {
      .ant-tree-switcher {
        line-height: 30px;
      }
    }
  }

  .filePreview {
    flex: 1;
    position: relative;
    height: 100%;

    .oprBtns {
      position: absolute;
      right: 0px;
      top: 0px;

      a {
        padding-right: 8px;
      }
    }

    iframe {
      width: 100%;
      height: 100%;
      margin-top: 20px;
    }
  }


  :deep(.ant-tree-node-selected) {
    .file-preview-btn {
      color: white;
    }
  }
}
</style>
