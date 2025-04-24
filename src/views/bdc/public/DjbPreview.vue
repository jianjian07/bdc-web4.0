<template>
  <div class="djb-preview">
    <a-spin :spinning="spinning">
      <div class="djb-content">
        <a-col :md="4" style="border-right:1px solid #ebedf0; height: 100%">
          <h4 style="text-align: center;padding-top: 14px;color: #1890ff">不动产登记簿目录</h4>
          <div class="djb-tree">  
            <a-tree
              v-if="list.length>0"
              v-model:selectedKeys="selectedKeys"
              @select="onSelect"
              :tree-data="list"
              :field-names="{ children:'children', title:'name', key:'id' }"
              class="djb-tree"
            >
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
import { useRoute } from "vue-router"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { useUserStore } from "/@/store/modules/user"
const userStore = useUserStore();
const token = userStore.getToken
const route = useRoute()
// 加载
let spinning = ref<boolean>(false)
// 登记簿列表
let list = ref<any>([])
// 参数
let queryString = ''
// 积木报表地址
let iframeUrl = ref<string>('')
// 选中
let selectedKeys = ref<any>([])

enum api {
  list = '/api/zrzy-bdc/bdc/bdcDjb/getPreviewList'
}

onMounted(() => {
  initData()
})

/**
 * 初始化数据
 */
function initData() {
  // 19990000010006
  spinning.value = true
  let ywh = route.query.ywh
  let slbh = route.query.slbh
  if (ywh || slbh) {
    defHttp.get({ url: api.list, params: { slbhOrYwh: ywh || slbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        if (res.result) {
          list.value = res.result.djbList || []
          let params = res.result.queryParam || {}
          const result = Object.entries(params)
              .filter(([key, value]) => value !== null) 
              .map(([key, value], index) => `${index === 0 ? '?' : '&'}${key}=${value}`) 
              .join('') 
          queryString = result
          if (list.value.length) {
            selectedKeys.value = [list.value[0].id]
            setUrl(list.value[0].id)
          }
        }
      } else {
        message.warning(res?.message)
      }
       spinning.value = false
    }).catch(err => {
       message.warning(err)
       spinning.value = true
    })
  }
}

/**
 * 选中
 * @param selectedKeys
 * @param e
 */
function onSelect(keys, e) {
  let data = e.node.dataRef
  selectedKeys.value = [data.id]
  setUrl(data.id)
}

/**
 * 设置iframe地址
 * @param id
 */
function setUrl(id) {
  let domain = `${window.settingConfig.jmreportDomain}/zrzy-form/`
  let url = `${domain}jmreport/view/${id}${queryString ? `&token=${token}` : `?token=${token}`}`
  iframeUrl.value = url
}
</script>

<style lang="less" scoped>
.djb-preview {
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
}
</style>