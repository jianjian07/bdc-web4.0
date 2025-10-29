<template>
  <div class="look-lpb" style="width: 100%; text-align: center; height: 100%; overflow: hidden">
    <a-tabs :activeKey="currentZrzInfo.zbm" tab-position="left" animated @change="handleChange" :style="{ height: '100%' }">
      <a-tab-pane v-for="(item,index) in zrzTableData" :key="item.zbm" :tab="item.dh">
        <div class="legend-tool-bar">
          <div class="legend-icon">
            <a-space>
                图例版：
                <span class="zt" style="background-color: #FE9E38"></span><span style="white-space: nowrap">合同备案</span>
                <span class="zt" style="background-color: #75FBD4"></span><span style="white-space: nowrap"> 拆迁限制</span>
                <span class="zt" style="background-color: #50A68D"></span><span style="white-space: nowrap"> 地役权</span>
                <span class="zt" style="background-color: #0000FF"></span><span style="white-space: nowrap"> 抵押权</span>
                <span class="zt" style="background-color: #805B23"></span><span style="white-space: nowrap"> 公共部位</span>
                <span class="zt" style="background-color: #A5D147"></span><span style="white-space: nowrap"> 居住权</span>
                <span class="zt" style="background-color: #FCFC60"></span><span style="white-space: nowrap"> 合同签约</span>
                <span class="zt" style="background-color: #FF0000"></span><span style="white-space: nowrap"> 不动产权</span>
                <span class="zt" style="background-color: #BF6B97"></span><span style="white-space: nowrap"> 限制登记</span>
                <span class="zt" style="background-color: #C0C0C0"></span><span style="white-space: nowrap"> 查封(其他限制)</span>
                <span class="zt" style="background-color: #9900FF"></span><span style="white-space: nowrap"> 预告</span>
                <span class="zt" style="background-color: #9A992F"></span><span style="white-space: nowrap"> 异议</span>
            </a-space>
          </div>
        </div>
        <div class="lpb-main">
          <div class="lpb-content">
            <div v-if="cxxData.length" class="lpb-content-search-tool">
              <div style="width: 20%; margin: 0 10px">
                <a-form-item label="层">
                  <a-select style="width: 100%" allow-clear v-model:value="filterLpb.cData" :options="cxxOptions"
                    :field-names="{ label: 'wlc', value: 'wlc' }"></a-select>
                </a-form-item>
              </div>
              <a-button type="primary" @click="handleFilterLpb">查询</a-button>
            </div>
            <template v-if="cxxData.length">
              <table>
                <thead>
                  <tr class="title">
                    <td :colspan="totalHs + 2" id="divtitle"
                      style="border: 0;background-color: #39bd8a;border-radius: 26px 26px 0px 0px; /* 去掉右下角的圆角 */">
                      {{ currentZrzInfo.zl }}
                    </td>
                  </tr>
                  <tr class="title">
                    <td>物理层</td>
                    <td>名义层</td>
                    <td v-for="(item, index) in dyxx" :key="'dy' + index" :colspan="item.maxHs">{{ item.dyh }}单元</td>
                  </tr>
                </thead>
                <tbody class="ant-table-tbody">
                  <tr v-for="(cInfo, cIndex) in cxx" :key="cInfo.wlc">
                    <td class="title">{{ cInfo.wlc }}</td>
                    <td class="title">{{ cInfo.myc }}层</td>
                    <template v-for="(dy, dyIndex) in dyxx" :key="cInfo.wlc.toString()+dy.dyh">
                      <td v-for="(fwInfo, fwIndex) in fwxx.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh)"
                        :colspan="fwInfo.colspan" :rowspan="fwInfo.rowspan" :key="fwInfo.wlc + '-' + fwInfo.dyh + '-' + fwIndex"
                        :class="checkFw?.bdcdyh === fwInfo.bdcdyh ? 'dy-css' : 'dy-css-base'" @click="onCheck(fwInfo)">
                            <div class="fw-td">
                                <span v-if="fwInfo.zbhtbazt == 1" class="zbzt" style="background-color: #FE9E38"></span>
                                <span v-if="fwInfo.zbcqxzzt == 1" class="zbzt" style="background-color: #75FBD4"></span>
                                <span v-if="fwInfo.zbdyqzt == 1" class="zbzt" style="background-color: #50A68D"></span>
                                <span v-if="fwInfo.zbdyzt == 1" class="zbzt" style="background-color: #0000FF"></span>
<!--                                <span v-if="fwInfo.zbggbwzt == 1" class="zbzt" style="background-color: #805B23"></span>-->
                                <span v-if="fwInfo.zbjzqzt == 1" class="zbzt" style="background-color: #A5D147"></span>
                                <span v-if="fwInfo.zbhtqyzt == 1" class="zbzt" style="background-color: #FCFC60"></span>
                                <span v-if="fwInfo.zbcqzt == 1" class="zbzt" style="background-color: #FF0000"></span>
<!--                                <span v-if="fwInfo.zbxzdjzt == 1" class="zbzt" style="background-color: #BF6B97"></span>-->
                                <span v-if="fwInfo.zbcfzt == 1" class="zbzt" style="background-color: #C0C0C0"></span>
                                <span v-if="fwInfo.zbygzt == 1" class="zbzt" style="background-color: #9900FF"></span>
                                <span v-if="fwInfo.zbyyzt == 1" class="zbzt" style="background-color: #9A992F"></span>
                            </div>
                           <span style="cursor: pointer" >{{ fwInfo.shbw }}</span>
                          <div class="fw-td">
                            <span v-if="fwInfo.htbazt == 1" class="zt" style="background-color: #FE9E38"></span>
                            <span v-if="fwInfo.cqxzzt == 1" class="zt" style="background-color: #75FBD4"></span>
                            <span v-if="fwInfo.dyqzt == 1" class="zt" style="background-color: #50A68D"></span>
                            <span v-if="fwInfo.dyzt == 1" class="zt" style="background-color: #0000FF"></span>
                            <span v-if="fwInfo.ggbw == 1" class="zt" style="background-color: #805B23"></span>
                            <span v-if="fwInfo.jzqzt == 1" class="zt" style="background-color: #A5D147"></span>
                            <span v-if="fwInfo.htqyzt == 1" class="zt" style="background-color: #FCFC60"></span>
                            <span v-if="fwInfo.cqzt == 1" class="zt" style="background-color: #FF0000"></span>
                            <span v-if="fwInfo.xzdj == 1" class="zt" style="background-color: #BF6B97"></span>
                            <span v-if="fwInfo.cfzt == 1" class="zt" style="background-color: #C0C0C0"></span>
                            <span v-if="fwInfo.ygzt == 1" class="zt" style="background-color: #9900FF"></span>
                            <span v-if="fwInfo.yyzt == 1" class="zt" style="background-color: #9A992F"></span>
                          </div>
                        </td>
                        <template v-for="blanc in (dy.maxHs - fwxx.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh).length)">
                          <td></td>
                        </template>
                    </template>
                </tr>
                </tbody>
            </table>
              <div v-if="showAll && cxxData.length > 5" style="text-align: center;padding: 10px;">
              当前只显示<span style="color: #1677ff;">5</span>层，点击 <a-button type="link" @click="onShowAll">加载全部</a-button>
              </div>
            </template>
            <template v-else>
              <a-empty/>
            </template>
          </div>
          <div v-if="checkFw && checkFw.shbw" class="lpb-info">
            <div class="lpb-info-header">
              <span>房屋</span>
              <span @click="onClose" style="padding: 0 5px;cursor: pointer">x</span>
            </div>
            <div class="lpb-info-content">
              <div class="lpb-info-title lpb-info-row">
                <a @click="queryHis(checkFw.bdcdyh)">{{ checkFw.bdcdyh }}</a>
              </div>
              <div v-if="isShowFcfht=='1' && checkFw.ftid" class="lpb-info-title lpb-info-row">
                <a @click="viewFcfht(checkFw.ftid)">分层分户图</a>
              </div>
                <a-form :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                  <template v-for="(item) in fwKeys">
                    <a-form-item :label="item.label">
                      <template v-if="item.label == '权利人'">
                        <span style="color: #5e8cdc">{{ checkFw['ygqlr'] || checkFw['qlr'] }}</span>
                      </template>
                      <template v-else-if="item.label == '已办业务' || item.label == '在办业务'">
                        <span style="color: #5e8cdc">{{ getYwStr(item.value, checkFw) }}</span>
                      </template>
                      <template v-else-if="item.label == '实际层' || item.label == '名义层'">
                        <span style="color: #5e8cdc">{{ checkFw[item.value] }}层</span>
                      </template>
                      <template v-else-if="item.dict">
                        <span style="color: #5e8cdc">{{ getDictStr(item.dict, checkFw[item.value]) }}</span>
                      </template>
                      <template v-else-if="item.treeDict">
                        <span style="color: #5e8cdc">{{ getTreeDictStr(item.treeDict, checkFw[item.value]) }}</span>
                      </template>
                      <template v-else>
                         <span style="color: #5e8cdc">{{ checkFw[item.value] }}</span>
                      </template>
                    </a-form-item>
                  </template>
                </a-form>
              </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { getYwStr, getDictStr, getTreeDictStr } from "/@/views/bdc/lpb/lpb"
import { message } from "ant-design-vue"
import { router } from "/@/router"
import { Base64 } from "js-base64"

// 最大户数
let maxHs = ref<number>(0)
// 总户数
let totalHs = ref<number>(0)
// 当前选择的幢数据
let currentZrzInfo: any = ref({})
// 当前案卷的不动产单元数组
let currentCase = ref<any>([])
// 当前选中的房屋
let currentFw = ref<any>({
  rowIndex: -1,
  colIndex: -1,
  dyIndex: -1
})
// 单元信息
let dyxx = ref<any>([])
// 层信息(总)
let cxxData = ref<any>([])
// 层信息(显示)
let cxx = ref<any>([])
// 房屋信息
let fwxx = ref<any>([])
// 选中的房屋
let checkFw = ref<any>({})
// 筛选楼盘表
let filterLpb = ref<any>({
  cData: null,
  hData: null
})
// 查询层下拉框
let cxxOptions = ref<any>([])
// 查询的楼盘表信(筛选用)
let lpbData = ref<any>()
let showAll = ref(false)
let zrzTableData = ref<any>([])
// 是否显示分层分户图
let isShowFcfht = ref<string>('')
// 详细信息
const fwKeys = [
  { label: '室号', value: 'shbw' },
  { label: '权利人', value: 'qlr' },
  { label: '坐落', value: 'fwzl' },
  { label: '已办业务', value: 'yb' },
  { label: '在办业务', value: 'zb' },
  { label: '实际层', value: 'wlc' },
  { label: '名义层', value: 'myc' },
  { label: '户号', value: 'hh' },
  { label: '户型', value: 'hx' , dict: 'hx'},
  { label: '户型结构', value: 'hxjg', dict: 'hxjg' },
  { label: '房屋用途', value: 'fwyt', treeDict: 'fwyt' },
  { label: '房屋类型', value: 'fwlx', dict: 'fwlx' },
  { label: '房屋性质', value: 'fwxz', dict: 'fwxz' },
  { label: '建筑面积(㎡)', value: 'jzmj' },
  { label: '土地独用面积(㎡)', value: 'dytdmj' },
  { label: '土地分摊面积(㎡)', value: 'ftjzmj' },
  { label: '测绘状态', value: 'chzt', dict: 'chzt'  }
]

enum api {
  detail = '/api/zrzy-bdc/bdc/lpb/lpbFw',
  list = '/api/zrzy-bdc/bdc/bdcZsx/getZrzListByPage'
}

onMounted(() => {
  let route = router.currentRoute.value
  let zddm = route.query.zddm
  isShowFcfht=route.query.fcfht;
  if (zddm) {
    loadList(zddm)
  }
})

function handleChange(value) {
  let find = zrzTableData.value.find(f => f.zbm == value)
  if (find) {
    currentZrzInfo.value = find
  }
  loadFwxx()
}

/**
 * 加载幢列表
 */
function loadList(zddm) {
  let params = {
    pageNo: 1,
    pageSize: 999,
    zddm: zddm
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
      if (res && res.success) {
        zrzTableData.value = res.result.records
      } else {
        zrzTableData.value = []
      }
     if (zrzTableData.value.length) {
        // 默认选中第一条
        currentZrzInfo.value = zrzTableData.value[0]
        loadFwxx()
     }
  })
}

async function loadFwxx(isFilter = false) {
    if (currentZrzInfo.value && currentZrzInfo.value.zbm) {
      const res = await defHttp.get({ url: '/api/zrzy-bdc/bdc/lpb/lpb', params: { zbm: currentZrzInfo.value.zbm } }, { withToken: true })
      if (res && res.result) {
        dyxx.value = res.result.dyhList
        cxxData.value = res.result.cxxList
        // showAll.value = cxxData.value.length > 5
        // cxx.value = cxxData.value.slice(cxxData.value.length - 5, cxxData.value.length)
        cxx.value = cxxData.value
        fwxx.value = res.result.fwList
        setMaxHs()
        if (!isFilter) {
           cxxOptions.value = JSON.parse(JSON.stringify(cxxData.value))
        }
        lpbData.value = {
          dyhList: dyxx.value,
          cxxList: cxxData.value,
          fwList: fwxx.value
        }
      }
    }

}

function onCheck(item: any) {
  defHttp.get({ url: api.detail, params: { bdcdyh: item.bdcdyh } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      checkFw.value = Object.assign(item, res.result)
    } else {
      message.warning('获取房屋属性失败')
    }
  })
}

/**
 * 设置最大户数
 */
function setMaxHs() {
  dyxx.value.forEach((dy) => {
    let dyMaxhs = 0
    cxx.value.forEach((cInfo) => {
      let fwList = fwxx.value.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh)
      dyMaxhs = fwList.length > dyMaxhs ? fwList.length : dyMaxhs
    })
    dy.maxHs = dyMaxhs
    totalHs.value += dy.maxHs
    maxHs.value = dyMaxhs
  })
}

function onShowAll() {
  showAll.value = false
  cxx.value = JSON.parse(JSON.stringify(cxxData.value))
  setMaxHs()
}

/**
 * 筛选楼盘表
 */
function handleFilterLpb() {
  const wlc = filterLpb.value.cData;
  dyxx.value = lpbData.value.dyhList;
  cxxData.value = wlc
    ? lpbData.value.cxxList.filter(item => item.wlc == wlc)
    : lpbData.value.cxxList;
  cxx.value = [];
  nextTick(() => {
    cxx.value = cxxData.value;
    fwxx.value = wlc ? lpbData.value.fwList.filter(item => item.wlc == wlc) : lpbData.value.fwList
  })
}

function onClose() {
  checkFw.value = null
}

/**
 * 查看单元历史回溯
 * @param bdcdyh
 */
function queryHis(bdcdyh){
  router.push('/query/dyxx?bdcdyh=' + bdcdyh)
}
/**
 * 查看宗地图分层分户图
 * @param ftid
 */
function viewFcfht(ftid) {
  let base = window?.settingConfig?.proxyBaseDomain
  let encodeUrl = encodeURIComponent(Base64.encode(`${base}/zrzy-bdc/bdcdj/upfiles/ft/download?id=${ftid}&fullfilename=${ftid}.jpg`))
  window.open(`${window?.settingConfig?.kkFileDomain}/onlinePreview?url=${encodeUrl}`)
}


</script>

<style lang="less" scoped>
td {
    border: 1px solid #39bd8a;
    width: 100px;
    height: 30px;
}

.title {

    background-color: #f2f2f2;
}

.zt {

    width: 8px;
    height: 8px;
    float: left;
    margin-left: 8px;
    border-radius: 50%;

  &:nth-of-type(1) {
    margin-left: 0px;
  }
}

.zbzt {
  width: 8px;
  height: 8px;
  float: left;
  margin-left: 8px;

  &:nth-of-type(1) {
    margin-left: 0px;
  }
  //border-radius: 3px;
}

.dy-css-base {
    cursor: pointer;
}

.dy-css {
    right: 0;
    bottom: 0;
    cursor: pointer;
    position: relative;

    &:before {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;
        border: 12px solid rgba(255, 153, 0, 0.8);
        border-top-color: transparent;
        border-left-color: transparent;
    }

    &:after {
        content: "";
        width: 5px;
        height: 10px;
        position: absolute;
        right: 4px;
        bottom: 5px;
        border: 1px solid #fff;
        border-top-color: transparent;
        border-left-color: transparent;
        transform: rotate(45deg);
    }
}

.legend-tool-bar {
  height: 50px;
  border-bottom: 1px solid rgba(5, 5, 5, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lpb-main {
  height: calc(100% - 50px);
  display: flex;

  .lpb-content {
    flex: auto;
    padding: 15px;
    //width: calc(100% - 300px);
    height: 100%;
    overflow: auto;

    .lpb-content-search-tool {
      display: flex;
    }

    .fw-td {
      text-align: center;
      align:center;
      display:flex;
      flex-wrap: nowrap;
      flex-direction:row;
      justify-content:center;
      //padding-left: 8px;
      padding-top: 2px;
      padding-bottom: 2px;
    }

    .checked-shbw {
      padding-left: 8px;
      padding-top: 2px;
      padding-bottom: 2px;
    }

    .unchecked-shbw {
      padding-left: 0px;
      padding-top: 2px;
      padding-bottom: 2px;
    }
  }

  .lpb-info {
    width: 300px;
    height: 100%;
    border-left: 1px solid rgba(5, 5, 5, 0.06);

    .lpb-info-header {
      height: 30px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      text-align: left;
      border-bottom: 1px solid rgba(5, 5, 5, 0.06);
    }

    .lpb-info-content {
      display: flex;
      flex-direction: column;
      height: calc(100% - 30px);
      overflow: auto;

      .lpb-info-row {
        padding: 10px 15px;
        border-bottom: 1px solid rgba(5, 5, 5, 0.06);
      }

      .lpb-info-title {
        color: #4678b2;
        font-weight: bold;
      }

      :deep(.ant-form-item-row) {
        padding: 7px 15px;
        border-bottom: 1px solid rgba(5, 5, 5, 0.06);
      }

      :deep(.ant-form-item) {
        margin-bottom: 0;
      }
    }
  }
}

.look-lpb {
  :deep(.ant-tabs-content) {
    height: 100%;
  }
}

.lpb-info {
  width: 300px;
  height: 100%;
  border-left: 1px solid rgba(5, 5, 5, 0.06);

  .lpb-info-header {
    height: 30px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    border-bottom: 1px solid rgba(5, 5, 5, 0.06);
  }

  .lpb-info-content {
    display: flex;
    flex-direction: column;
    height: calc(100% - 30px);
    overflow: auto;

    .lpb-info-row {
        padding: 10px 15px;
        border-bottom: 1px solid rgba(5, 5, 5, 0.06);
    }

    .lpb-info-title {
        color: #4678b2;
        font-weight: bold;
    }

    :deep(.ant-form-item-row) {
        padding: 7px 15px;
        border-bottom: 1px solid rgba(5, 5, 5, 0.06);
    }

    :deep(.ant-form-item) {
        margin-bottom: 0;
    }
  }
}


</style>
