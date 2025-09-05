<template>
 <div class="djb-print">
    <a-spin :spinning="spinning">
      <div class="djb-content">
        <a-col :md="4" style="border-right:1px solid #ebedf0; height: 100%">
          <h4 style="text-align: center;padding-top: 14px;color: #1890ff">不动产登记簿目录</h4>
          <div class="djb-tree">  
            <a-tree
              v-if="list.length>0"
              v-model:selectedKeys="selectedKeys"
              @select="onSelect"
              block-node
              :tree-data="list"
              :field-names="{ children:'children', title:'filenamereal', key:'id0' }"
              class="djb-tree"
            >
               <template #title="node">
                  <div class="tree-row-content">
                    <div class="left">
                      <span class="left-name">
                        {{ node.filenamereal }}
                      </span>
                    </div>
                    <div v-if="selectedKeys && selectedKeys[0] == node.id0" class="right">
                      <DownloadOutlined @click="handleDownLoad(node)"/>
                    </div>
                  </div>
                </template>
            </a-tree>
            <a-empty v-else />
          </div>
        </a-col>
        <a-col :md="20" style="height: 100%;">
          <div class="djb-iframe">
            <iframe :src="iframeUrl" frameborder="0" width="100%" height="100%" scrolling="auto"
                    style="background-color: #fff;"></iframe>
          </div>
        </a-col>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { Base64 } from "js-base64"
import { message } from "ant-design-vue"
import { DownloadOutlined } from '@ant-design/icons-vue';
import { currentRoute } from "/@/router"

const route = currentRoute;
// 加载
let spinning = ref<boolean>(false)
// 登记簿列表
let list = ref<any>([])
// 选中
let selectedKeys = ref<any>([])
// 参数
let queryString = ''
// 积木报表地址
let iframeUrl = ref<string>('')

enum api {
  list = '/api/zrzy-bdc/bdc/bdcDjb/getAndPrintIfNeeded',
  download = '/api/zrzy-bdc/bdc/bdcDjb/download'
}

onMounted(() => {
  initData()
})

function initData() {
  spinning.value = true
  let ywh = route.query.ywh
  let slbh = route.query.slbh
  if (ywh || slbh) {
    defHttp.get({ url: api.list, params: { slbhOrYwh: ywh || slbh } }, { withToken: true, withTimeout: false }).then((res) => {
      if (res && res.success) {
        list.value = res.result
        if (list.value.length) {
          selectedKeys.value = [list.value[0].id0]
          setUrl(list.value[0].id0, list.value[0].filename)
        }
      } else {
        message.warning(res?.message)
      }
      spinning.value = false
    }).catch(err => {
      spinning.value = false
      message.warning(err)
    })
  } else {
    spinning.value = false
  }
}

/**
 * 选中
 * @param selectedKeys
 * @param e
 */
function onSelect(keys, e) {
   let data = e.node.dataRef
  selectedKeys.value = [data.id0]
  setUrl(data.id0, data.filename)
}

/**
 * 设置iframe地址
 * @param id
 */
function setUrl(id0,name) {
  let newName = name.replace(/\.(?=[^.]*$)/, `${id0}.`);
  let encodeUrl = encodeURIComponent(Base64.encode(`${window.settingConfig.baseDomain}/zrzy-bdc/bdc/bdcDjb/download?id0=${id0}&fullfilename=${newName}`))
  iframeUrl.value = `${window.settingConfig.kkFileDomain}/onlinePreview?url=${encodeUrl}&officePreviewType=pdf`
  console.log('iframeUrl.value',`${window.settingConfig.baseDomain}/zrzy-bdc/bdc/bdcDjb/download?id0=${id0}&fullfilename=${newName}`)
  // defHttp.get({ url: api.download, params: { id0: id0 }, responseType: "blob" }, { withToken: true }).then((res) => {
  //   //处理二进制数据并创建 Blob 对象
  //     const blob = new Blob([res])
  //   console.log('blob',blob)
  //     const elink = document.createElement('a')
  //     elink.download = name
  //     elink.style.display = 'none'
  //     elink.href = URL.createObjectURL(blob)
  //     document.body.appendChild(elink)
  //     elink.click()
  //     URL.revokeObjectURL(elink.href)
  //     document.body.removeChild(elink)
  // })
}

/**
 * 下载
 * @param node
 */
function handleDownLoad(node) {
  let newName = node.filename.replace(/\.(?=[^.]*$)/, `${node.id0}.`);
  const link = document.createElement('a');
  link.href = `${window.settingConfig.baseDomain}/zrzy-bdc/bdc/bdcDjb/download?id0=${node.id0}&fullfilename=${newName}`;
  link.download = newName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<style lang="less" scoped>
.djb-print {
  width: 100%;
  height: 100%;
  
  .djb-content {
    height: 100%;
    width: 100%;
    display: flex;
    
    .djb-tree {
      height: calc(100% - 60px);
      overflow: auto;
    }
    
    .djb-iframe {
      height: 100%;
      overflow: hidden;
    }
  }
  .tree-row-content {
    display: flex;
    justify-content: space-between;
    
    .left {
      width: 70%;
    }
    
    .right {
      margin-right: 10px;
    }
  }
}
</style>