<template>
  <div class="print-list">
    <a-spin :spinning="spinning">
      <div class="print-content">
        <a-col :md="4" style="border-right:1px solid #ebedf0; height: 100%">
          <h4 style="text-align: center;padding-top: 14px;color: #1890ff">打印清单</h4>
          <div class="print-tree">  
            <a-tree
              v-if="list.length>0"
              v-model:selectedKeys="selectedKeys"
              @select="onSelect"
              :tree-data="list"
              :field-names="{ title:'btnName', key:'id0' }"
              class="print-tree"
            >
            </a-tree>
            <a-empty v-else />
          </div>
        </a-col>
        <a-col :md="20" style="height: 100%;">
          <div class="print-iframe">
            <iframe :src="iframeUrl" frameborder="0" width="100%" height="100%" scrolling="auto"
                    style="background-color: #fff;"></iframe>
          </div>
        </a-col>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router"
import { onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { isJsonData } from "/@/views/online/utils/commonUtils"

const route = useRoute()
// 加载
let spinning = ref<boolean>(false)
// 打印清单列表
let list = ref<any>([])
// 积木报表地址
let iframeUrl = ref<string>('')
// 选中
let selectedKeys = ref<any>([])

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

enum api {
  list = '/magicapi/zrzy-form/magic/form/form/printBtn'
}

onMounted(() => {
  initData()
})

/**
 * 初始化
 */
function initData() {
  spinning.value = true
  let slbh = route.query.slbh || props.formData.slbh || 'CQSC202412130000181'
  if (slbh) {
    defHttp.get({ url: api.list, params: { slbh: slbh } }, { withToken: true }).then((res) => {
      if (!res.message) {
        list.value = res || []
      } else {
        message.warning(res?.message)
      }
      if (list.value.length) {
        selectedKeys.value = [list.value[0].id0]
        setUrl(list.value[0])
      }
      spinning.value = false
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
  selectedKeys.value = [data.id0]
  setUrl(data)
}

/**
 * 设置url
 * @param item
 */
function setUrl(item) {
  let correctedBz = item.bz
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // 键名加双引号
      .replace(/'/g, '"'); // 单引号变双引号
  let params = item.bz ? (isJsonData(correctedBz) ? JSON.parse(correctedBz) : correctedBz) : ''
  if (params.code) {
    const routeSlbh = route.query.slbh || props.formData.slbh // 从路由获取的 slbh
    let domain = `${window.settingConfig.jmreportDomain}/zrzy-form/`
    let url = `${domain}jmreport/view/${params.code}`
    const queryParams = new URLSearchParams()
    const slbhValue = params.slbh ? params.slbh.toString() : routeSlbh
    if (slbhValue) {
      queryParams.append('slbh', slbhValue)
    }
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'code' && key !== 'slbh' && (typeof value === 'string' || typeof value === 'number')) {
        queryParams.append(key, value.toString())
      }
    })
    url += `?${queryParams.toString()}`
    iframeUrl.value = url
  } else {
    message.warning('该打印条目配置的模版code有误!')
  }
}
</script>

<style lang="less" scoped>
.print-list {
  width: 100%;
  height: 100%;
  
  .print-content {
    height: 100%;
    width: 100%;
    display: flex;
    
    .print-tree {
      height: calc(100% - 60px);
      overflow: auto;
    }
    
    .print-iframe {
      height: 100%;
      overflow: hidden;
    }
  }
  
  :deep(.ant-spin-container) {
      height: 100%;
  }

  :deep(.ant-spin-nested-loading) {
      height: 100%;
  }
}
</style>