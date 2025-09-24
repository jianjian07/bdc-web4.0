<template>
  <div class="ssoFileTree">
    <div class="treeList">
      <div class="batchDownLoadBtn" v-permission="'report:file:download'">
        <a-button type="primary" v-if="showFileDownLoadBtn" :icon="h(DownOutlined)" @click="batchDownLoad">下载</a-button>
      </div>
      <a-directory-tree v-if="ssoFileList && ssoFileList.length > 0" :tree-data="ssoFileList" v-model:expandedKeys="expandedKeys" :load-data="loadFileList"  :selectable="true" :checkable="isCheckabled" @select="handleSelectTreeNode"
        v-model:checkedKeys="checkedKeys" show-icon  style="width: 100%">
        <template #icon="">
        </template>
        <template #title="{ dataRef }">
          <div class="customTitle">
            <div style="display: flex; align-items: center;">
              <!-- <FolderOutlined v-if="dataRef.parentId == '0'" style="padding-right: 3px;" /> -->
              <icon v-if="dataRef.parentId == '0' || dataRef.dirkey" :style="{ paddingRight: '5px' }">
                <template #component>
                  <svg t="1731576790518" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="2613" width="16" height="16">
                    <path
                      d="M918.673 883H104.327C82.578 883 65 867.368 65 848.027V276.973C65 257.632 82.578 242 104.327 242h814.346C940.422 242 958 257.632 958 276.973v571.054C958 867.28 940.323 883 918.673 883z"
                      fill="#FFE9B4" p-id="2614"></path>
                    <path
                      d="M512 411H65V210.37C65 188.597 82.598 171 104.371 171h305.92c17.4 0 32.71 11.334 37.681 28.036L512 411z"
                      fill="#FFB02C" p-id="2615"></path>
                    <path
                      d="M918.673 883H104.327C82.578 883 65 865.42 65 843.668V335.332C65 313.58 82.578 296 104.327 296h814.346C940.422 296 958 313.58 958 335.332v508.336C958 865.32 940.323 883 918.673 883z"
                      fill="#FFCA28" p-id="2616"></path>
                  </svg>
                </template>
              </icon>
              <icon v-else style="padding-right: 5px;">
                <template #component>
                  <!-- ppt -->
                  <svg v-if="dataRef.title.split('.')[1] == 'ppt'" t="1731576637505" class="icon" viewBox="0 0 1024 1024"
                    version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1774" width="16" height="16">
                    <path
                      d="M179 64h468.5l223 225.5V935c0 13.807-11.193 25-25 25H179c-13.807 0-25-11.193-25-25V89c0-13.807 11.193-25 25-25z"
                      fill="#FF7861" p-id="1775"></path>
                    <path d="M647.5 64v200.5c0 13.807 11.193 25 25 25h198L647.5 64z" fill="#FFB0A4" p-id="1776"></path>
                    <path
                      d="M670.098 478.093C677.884 486.056 682 497.51 682 514.5c0 16.989-4.116 28.444-11.902 36.407-8.313 8.504-22.397 14.822-43.202 18.093H318c-19.33 0-35 15.67-35 35v157c0 19.33 15.67 35 35 35s35-15.67 35-35V639h276.5a35 35 0 0 0 4.95-0.352C709.214 627.968 752 584.203 752 514.5s-42.786-113.468-117.55-124.148a35 35 0 0 0-4.95-0.352H318c-19.33 0-35 15.67-35 35s15.67 35 35 35h308.896c20.805 3.271 34.889 9.589 43.202 18.093z"
                      fill="#FFFFFF" p-id="1777"></path>
                  </svg>
                  <!-- xlsx -->
                  <svg v-else-if="['xlsx', 'xls'].includes(dataRef.title.split('.')[1])" t="1731576666581" class="icon"
                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1992" width="16"
                    height="16">
                    <path
                      d="M179 64h468.5l223 225.5V935c0 13.807-11.193 25-25 25H179c-13.807 0-25-11.193-25-25V89c0-13.807 11.193-25 25-25z"
                      fill="#00C090" p-id="1993"></path>
                    <path d="M647.5 64v200.5c0 13.807 11.193 25 25 25h198L647.5 64z" fill="#68DBBF" p-id="1994"></path>
                    <path
                      d="M677.007 388.282L297.22 769.07c-13.65 13.685-13.623 35.846 0.062 49.497 13.685 13.652 35.846 13.624 49.498-0.061l379.786-380.787c13.652-13.685 13.624-35.846-0.061-49.498-13.686-13.65-35.846-13.623-49.498 0.062z"
                      fill="#FFFFFF" p-id="1995"></path>
                    <path
                      d="M297.22 436.718l379.787 380.787c13.652 13.685 35.812 13.713 49.498 0.061 13.685-13.651 13.713-35.812 0.061-49.497L346.78 387.282c-13.652-13.685-35.813-13.713-49.498-0.062-13.685 13.652-13.713 35.813-0.062 49.498z"
                      fill="#FFFFFF" p-id="1996"></path>
                  </svg>
                  <!-- doc -->
                  <svg v-else-if="['doc', 'docx'].includes(dataRef.title.split('.')[1])" t="1731576693757" class="icon"
                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2177" width="16"
                    height="16">
                    <path
                      d="M179 64h468.5l223 225.5V935c0 13.807-11.193 25-25 25H179c-13.807 0-25-11.193-25-25V89c0-13.807 11.193-25 25-25z"
                      fill="#4A8DFF" p-id="2178"></path>
                    <path d="M647.5 64v200.5c0 13.807 11.193 25 25 25h198L647.5 64z" fill="#E5F0FF" p-id="2179"></path>
                    <path
                      d="M693.153 784.6C714.698 808.196 754 792.953 754 761V389h-70v281.758L544.847 518.35c-13.879-15.201-37.815-15.201-51.694 0L354 670.758V389h-70v372c0 31.954 39.302 47.197 60.847 23.6L519 593.857 693.153 784.6z"
                      fill="#FFFFFF" p-id="2180"></path>
                  </svg>
                  <!-- pdf -->
                  <svg v-else-if="dataRef.title.split('.')[1] == 'pdf'" t="1731576719515" class="icon"
                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2395" width="16"
                    height="16">
                    <path
                      d="M179 64h468.5l223 225.5V935c0 13.807-11.193 25-25 25H179c-13.807 0-25-11.193-25-25V89c0-13.807 11.193-25 25-25z"
                      fill="#FF4867" p-id="2396"></path>
                    <path d="M647.5 64v200.5c0 13.807 11.193 25 25 25h198L647.5 64z" fill="#FF97A9" p-id="2397"></path>
                    <path
                      d="M691.919 812c-44.4 0-84.22-76.189-105.17-125.732-35.243-14.71-74.092-28.45-111.831-37.331-33.022 21.788-89.214 54.4-132.365 54.4-26.778 0-46.064-13.461-53.14-36.914-5.411-19.29-0.832-32.613 4.995-39.83 11.377-15.543 34.825-23.453 69.929-23.453 28.443 0 64.517 4.996 104.754 14.71 25.945-18.457 52.307-39.829 75.756-62.45-10.406-49.404-21.784-129.479 7.076-166.393 14.29-17.625 36.074-23.454 62.436-15.543 28.86 8.326 39.82 25.951 43.15 39.829 12.21 48.155-43.15 113.103-80.473 151.267 8.325 33.029 19.286 67.862 32.606 99.78 53.556 23.87 117.24 59.536 124.456 98.394 2.913 13.461-1.249 25.951-12.21 36.915-9.435 7.771-19.425 12.351-29.97 12.351zM652 728c9.768 21.74 19.081 32 23.99 32 0.76 0 1.823-0.333 3.341-1.664 1.822-1.996 1.822-3.327 1.518-4.547-1.012-5.713-9.262-15.085-28.849-25.789z m-281.922-88c-15.62 0-19.913 3.774-21.22 5.535-0.373 0.566-1.493 2.264-0.373 6.666 0.933 3.774 3.547 7.799 11.636 7.799 10.143 0 24.829-5.723 41.879-15.975-12.196-2.704-22.962-4.025-31.922-4.025zM523 620.582c9.333 2.6 19.01 5.951 28 9.418-3.264-8.551-5.898-17.449-8.13-26A629.121 629.121 0 0 1 523 620.582zM588.966 433c-3.32 0-5.649 1.229-7.745 3.511-6.173 7.783-6.872 27.386-2.097 52.489 18.111-19.427 27.953-37.275 25.507-46.813-0.35-1.404-1.398-5.676-9.842-8.134-2.33-0.702-4.076-1.053-5.823-1.053z"
                      fill="#FFFFFF" p-id="2398"></path>
                  </svg>
                  <!-- zip -->
                  <svg v-else-if="['zip', 'rar'].includes(dataRef.title.split('.')[1])" t="1731577074126" class="icon"
                    viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3285" width="16"
                    height="16">
                    <path
                      d="M179 64h468.5l223 225.5V935c0 13.807-11.193 25-25 25H179c-13.807 0-25-11.193-25-25V89c0-13.807 11.193-25 25-25z"
                      fill="#576A95" p-id="3286"></path>
                    <path d="M647.5 64v200.5c0 13.807 11.193 25 25 25h198L647.5 64z" fill="#BBC3D4" p-id="3287"></path>
                    <path
                      d="M573.2 614.597v121.678a30.391 30.391 0 0 1-8.932 21.509 30.508 30.508 0 0 1-21.549 8.91h-62.238a30.52 30.52 0 0 1-21.549-8.905A30.392 30.392 0 0 1 450 736.27V614.597h123.2z m-30.48 69.71h-62.24v61.096h62.24v-61.096z m29.46-191.386v61.096h-61.213V492.92h61.214zM511.73 64v61.6H573.2v61.6h-61.478v57.036H573.2v61.6h-61.471v60.844H573.2v60.844h-61.471v60.839H450v-60.844h61.471v-60.844H450v-60.839h61.471v-61.6H450v-61.6h61.471V125.6H450V64h61.729z"
                      fill="#FFFFFF" p-id="3288"></path>
                  </svg>
                  <!-- image -->
                  <svg v-else-if="['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(dataRef.title.split('.')[1])"
                    t="1731577646284" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="20298" width="16" height="16">
                    <path
                      d="M862.460501 1005.075664H161.501574a46.533388 46.533388 0 0 1-33.411503-14.828488 48.202067 48.202067 0 0 1-14.335469-34.511314v-887.433799A52.563387 52.563387 0 0 1 128.090071 33.828673a45.168105 45.168105 0 0 1 33.411503-14.790563h477.848969l270.856931 279.389948v657.345728a49.567349 49.567349 0 0 1-14.335469 34.511315 45.243954 45.243954 0 0 1-33.411504 14.790563zM445.594163 429.874449a17.02811 17.02811 0 0 0-13.311507 7.395282l-160.951668 273.663346a15.624903 15.624903 0 0 0 0 16.383393 14.411318 14.411318 0 0 0 13.311507 8.229621h454.71501a17.255657 17.255657 0 0 0 14.032073-8.229621 16.952261 16.952261 0 0 0-0.796415-16.383393l-97.655642-159.28299a15.169809 15.169809 0 0 0-13.311507-7.395282 17.483204 17.483204 0 0 0-13.311507 7.395282L576.016592 637.131958 458.829821 437.459353a15.169809 15.169809 0 0 0-13.235658-7.584904z m213.287508-61.665272a41.148106 41.148106 0 1 0 39.062257 41.072257 40.162068 40.162068 0 0 0-39.062257-40.996408z"
                      fill="#6B72C7" p-id="20299"></path>
                    <path
                      d="M910.283323 298.390134h-221.934299a44.826784 44.826784 0 0 1-33.29773-14.790564 48.126218 48.126218 0 0 1-14.25962-34.511314V19.000185z m0 0"
                      fill="#FEF19E" p-id="20300"></path>
                  </svg>
                  <!-- unknow -->
                  <svg v-else t="1731577154581" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="3705" width="16" height="16">
                    <path
                      d="M205.5 64H665l232 232v639c0 13.807-11.193 25-25 25H205.5c-13.807 0-25-11.193-25-25V89c0-13.807 11.193-25 25-25z m449.145 25H205.5v846H872V306.355L654.645 89z"
                      fill="#B7B7BD" p-id="3706"></path>
                    <path
                      d="M665 64l-11 23.5v197c0 13.807 11.193 25 25 25h194.5L897 296 665 64z m14 49.355L850.145 284.5H679V113.355z"
                      fill="#B7B7BD" p-id="3707"></path>
                    <path d="M255 571m10 0l556 0q10 0 10 10l0 0q0 10-10 10l-556 0q-10 0-10-10l0 0q0-10 10-10Z"
                      fill="#B7B7BD" p-id="3708"></path>
                    <path d="M255 707m10 0l556 0q10 0 10 10l0 0q0 10-10 10l-556 0q-10 0-10-10l0 0q0-10 10-10Z"
                      fill="#B7B7BD" p-id="3709"></path>
                    <path d="M255 639m10 0l556 0q10 0 10 10l0 0q0 10-10 10l-556 0q-10 0-10-10l0 0q0-10 10-10Z"
                      fill="#B7B7BD" p-id="3710"></path>
                    <path d="M255 774m10 0l556 0q10 0 10 10l0 0q0 10-10 10l-556 0q-10 0-10-10l0 0q0-10 10-10Z"
                      fill="#B7B7BD" p-id="3711"></path>
                    <path d="M255 842m10 0l556 0q10 0 10 10l0 0q0 10-10 10l-556 0q-10 0-10-10l0 0q0-10 10-10Z"
                      fill="#B7B7BD" p-id="3712"></path>
                    <path d="M67 193m16 0l287 0q16 0 16 16l0 287q0 16-16 16l-287 0q-16 0-16-16l0-287q0-16 16-16Z"
                      fill="#CCCCCC" p-id="3713"></path>
                    <path
                      d="M226.274 240c14.845 0 29.79 4.862 41.18 13.738C280.444 263.86 288 278.458 288 295.57c0 22.53-15.93 43.423-46.252 63.48l-0.31 0.203V387c0 6.525-5.208 11.834-11.695 11.996l-0.305 0.004c-6.627 0-12-5.373-12-12v-34.314a12 12 0 0 1 5.673-10.196C250.988 325.189 264 309.227 264 295.57c0-9.498-3.99-17.207-11.298-22.902-7.059-5.5-16.796-8.668-26.428-8.668-9.598 0-19.202 3.147-26.147 8.625-7.064 5.571-10.985 13.116-11.123 22.435l-0.004 0.51c0 6.628-5.373 12-12 12s-12-5.372-12-12c0-33.201 28.361-55.57 61.274-55.57zM230 453c9.389 0 17-7.611 17-17s-7.611-17-17-17-17 7.611-17 17 7.611 17 17 17z"
                      fill="#FFFFFF" p-id="3714"></path>
                  </svg>
                </template>

              </icon>
              <div v-if="dataRef.parentId == '0'">
                <a-tooltip :title="dataRef.materialName + `（${ dataRef.children.length }个）`">
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
import Icon, {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
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
  if(val.slbh) {
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
      if(res?.result?.length) {
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
    if(node?.dataRef?.children || !node.dirkey) {
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
  let base = ['jpg','png','jpeg'].includes(format) ? proxyBaseApi.value : baseApi.value
  let newName = data.title.replace(/\.(?=[^.]*$)/, `${data.id}.`);
  let encodeUrl = encodeURIComponent(Base64.encode(`${base}/zrzy-bdc/bdcdj/upfiles/file/download?id=${data.id}&db=${props.formData.db}&fullfilename=${newName}`))
  previewData.value.previewUrl = `${kkFileApi.value}/onlinePreview?url=${encodeUrl}${officePreviewType}`
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
      headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED } }, { withToken: true }).then((res: any) => {
      if (res.size == 0) {
        message.error('下载附件出错！')
        return
      }
      const blob = new Blob([res])
      const elink = document.createElement('a')
      let title = '附件_'
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
    width: 180px; /* 定义容器宽度 */
    white-space: nowrap; /* 确保文本在一行内显示 */
    overflow: hidden; /* 隐藏超出容器的内容 */
    text-overflow: ellipsis; /* 使用省略号表示被截断的文本 */
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

    :deep(.ant-tree){
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
