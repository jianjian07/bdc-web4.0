<template>
  <div style="width: 100%; text-align: center; height: 100%">
    <div class="legend-tool-bar">
      <div style="flex: 1"></div>
      <div class="legend-icon">
        <a-space>
          <span style="white-space: nowrap">图例版：</span>
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
      <div class="legend-btn">
        <a-space>
          <a-button size="small" type="primary" @click="checkAll">
            <template #icon>
              <CheckSquareOutlined />
            </template>全选
          </a-button>
          <a-button size="small" type="primary" @click="checkReverse">
            <template #icon>
              <CheckSquareOutlined />
            </template>反选
          </a-button>
          <a-button size="small" type="primary" @click="checkRow">
            <template #icon>
              <UnorderedListOutlined />
            </template>选行
          </a-button>
          <a-button size="small" type="primary" @click="checkCol">
            <template #icon>
              <PauseOutlined />
            </template>选列
          </a-button>
        </a-space>
      </div>
    </div>
    <div class="lpb-main">
      <div class="lpb-search-bar">
        <div class="search-tool">
          <a-form :model="zrzData" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-form-item label="宗地代码">
              <a-input v-model:value="zrzData.zddm"></a-input>
            </a-form-item>
            <a-form-item label="栋号">
              <a-input v-model:value="zrzData.dh"></a-input>
            </a-form-item>
            <a-form-item label="土地坐落">
              <a-input v-model:value="zrzData.tdzl"></a-input>
            </a-form-item>
            <a-form-item label="房屋坐落">
              <a-input v-model:value="zrzData.fwzl"></a-input>
            </a-form-item>
            <a-form-item label="小区名称">
              <a-input v-model:value="zrzData.xqmc"></a-input>
            </a-form-item>
            <a-form-item label="测量号">
              <a-input v-model:value="zrzData.clh"></a-input>
            </a-form-item>
            <div style="display: flex; justify-content: end">
              <a-button type="primary" @click="loadList">
                <template #icon>
                  <SearchOutlined />
                </template>查询
              </a-button>
            </div>
          </a-form>
        </div>
        <div class="search-result">
          <a-table class="zrz-table ant-table-striped" :columns="zrzColumns" :data-source="zrzTableData"
            :pagination="pagination" :loading="tableLoading" :scroll="{ y: 300 }" :custom-row="customRow"
            :row-class-name="(_record, index) => _record.zbm == currentZrzInfo.zbm ? 'active-table-row' : null"
            row-key="zbm" @change="handleTableChange" size="small">
          </a-table>
        </div>
      </div>
      <div class="lpb-content">
        <div v-if="cxxData.length" class="lpb-content-search-tool">
          <div style="width: 30%">
            <a-form-item label="层">
              <a-select style="width: 100%" allow-clear v-model:value="filterLpb.cData" :options="cxxOptions"
                :field-names="{ label: 'wlc', value: 'wlc' }"></a-select>
            </a-form-item>
          </div>
          <div style="margin: 0 10px">
            <a-form-item label="户">
              <a-input style="width: 100%" v-model:value="filterLpb.hData"></a-input>
            </a-form-item>
          </div>
          <a-button type="primary" @click="handleFilterLpb">查询</a-button>
        </div>
        <template v-if="cxxData.length">
          <table style="margin: auto;">
            <thead>
              <tr class="title">
                <td style="border: 0;background-color: #fff;"> </td>
                <td style="border: 0;background-color: #fff;"> </td>
                <td colspan="6" id="divtitle"
                  style="border: 0;background-color: #39bd8a;border-radius: 26px 26px 0px 0px; /* 去掉右下角的圆角 */">
                  {{ currentZrzInfo.zl }}
                </td>
              </tr>
              <tr class="title">
                <td>物理层</td>
                <td>名义层</td>
                <td v-for="(item, index) in dyxx" :key="'dy' + index" :colspan="maxHs">{{ item.dyh }}单元</td>
              </tr>
            </thead>
            <tbody class="ant-table-tbody">
              <tr v-for="(cInfo, cIndex) in cxx" :key="cInfo.wlc">
                <td class="title">{{ cInfo.wlc }}</td>
                <td class="title">{{ cInfo.myc }}层</td>
                <template v-for="(dy, dyIndex) in dyxx" :key="cInfo.wlc.toString()+dy.dyh">
                  <td v-for="(fwInfo, fwIndex) in fwxx.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh)"
                    :colspan="fwInfo.colspan" :rowspan="fwInfo.rowspan" :key="fwIndex"
                    :class="checkFw?.bdcdyh === fwInfo.bdcdyh ? 'dy-css' : 'dy-css-base'" @click="onCheck(fwInfo)">

                    <div class="fw-td">
                      <span v-if="fwInfo.zbhtbazt == 1" class="zbzt" style="background-color: #FE9E38"></span>
                      <span v-if="fwInfo.zbcqxzzt == 1" class="zbzt" style="background-color: #75FBD4"></span>
                      <span v-if="fwInfo.zbdyqzt == 1" class="zbzt" style="background-color: #50A68D"></span>
                      <span v-if="fwInfo.zbdyzt == 1" class="zbzt" style="background-color: #0000FF"></span>
                      <span v-if="fwInfo.zbggbwzt == 1" class="zbzt" style="background-color: #805B23"></span>
                      <span v-if="fwInfo.zbjzqzt == 1" class="zbzt" style="background-color: #A5D147"></span>
                      <span v-if="fwInfo.zbhtqyzt == 1" class="zbzt" style="background-color: #FCFC60"></span>
                      <span v-if="fwInfo.zbcqzt == 1" class="zbzt" style="background-color: #FF0000"></span>
                      <span v-if="fwInfo.zbxzdjzt == 1" class="zbzt" style="background-color: #BF6B97"></span>
                      <span v-if="fwInfo.zbcfzt == 1" class="zbzt" style="background-color: #C0C0C0"></span>
                      <span v-if="fwInfo.zbygzt == 1" class="zbzt" style="background-color: #9900FF"></span>
                      <span v-if="fwInfo.zbyyzt == 1" class="zbzt" style="background-color: #9A992F"></span>
                    </div>
                    <a-checkbox v-if="getClass(fwInfo) || checkShow(fwInfo)" :class="{ caseCheck: getClass(fwInfo) }"
                      :checked="fwInfo.checked" :col="fwIndex" :row="cIndex" :dy="dyIndex"
                      @change="onChangeCheckedBox(fwIndex, cIndex, dyIndex, fwInfo)">
                    </a-checkbox>
                    <span style="cursor: pointer"
                      :class="[(getClass(fwInfo) || checkShow(fwInfo)) ? 'checked-shbw' : 'unchecked-shbw']">{{
            fwInfo.shbw }}</span>
                    <div class="fw-td">
                      <span v-if="fwInfo.htbazt == 1" class="zt" style="background-color: #FE9E38"></span>
                      <span v-if="fwInfo.cqxzzt == 1" class="zt" style="background-color: #75FBD4"></span>
                      <span v-if="fwInfo.dyqzt == 1" class="zt" style="background-color: #50A68D"></span>
                      <span v-if="fwInfo.dyzt == 1" class="zt" style="background-color: #0000FF"></span>
                      <span v-if="fwInfo.ggbwzt == 1" class="zt" style="background-color: #805B23"></span>
                      <span v-if="fwInfo.jzqzt == 1" class="zt" style="background-color: #A5D147"></span>
                      <span v-if="fwInfo.htqyzt == 1" class="zt" style="background-color: #FCFC60"></span>
                      <span v-if="fwInfo.cqzt == 1" class="zt" style="background-color: #FF0000"></span>
                      <span v-if="fwInfo.xzdjzt == 1" class="zt" style="background-color: #BF6B97"></span>
                      <span v-if="fwInfo.cfzt == 1" class="zt" style="background-color: #C0C0C0"></span>
                      <span v-if="fwInfo.ygzt == 1" class="zt" style="background-color: #9900FF"></span>
                      <span v-if="fwInfo.yyzt == 1" class="zt" style="background-color: #9A992F"></span>
                    </div>

                    <!-- {{ fwInfo.shbw + '|' + fwInfo.colspan }} -->
                  </td>
                  <template
                    v-for="blanc in (dy.maxHs - fwxx.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh).length)">
                    <td></td>
                  </template>
                  <!-- <td v-for="(item) in cInfo.hh" :key="cInfo.wlc.toString() + item" class="dy-css"
                        :rowspan="getShbw(cInfo.wlc, dy.dyh, item)?.conspan">
                        <div v-if="getShbw(cInfo.wlc, dy.dyh, item)">
                            {{ getShbw(cInfo.wlc, dy.dyh, item).shbw }}

                        </div>
                        <div v-else></div>
                    </td> -->
                </template>
              </tr>
            </tbody>

            <!-- <tr v-for="(cInfo) in cxx2" :key="cInfo.wlc">
                <td>{{ cInfo.wlc }}</td>
                <td>{{ cInfo.myc }}层</td>
                <template v-for="(dy) in dyxx" :key="cInfo.wlc.toString()+dy.dyh">
                    <td v-for="(item) in cInfo.hh" class="dy-css">
                        <div v-if="getShbw(cInfo.wlc, dy.dyh, item)">
                            {{ getShbw(cInfo.wlc, dy.dyh, item) }}
                        </div>
                        <div v-else></div>
                    </td>
                </template>
            </tr> -->
          </table>
          <!-- <div v-if="showAll && cxxData.length > 5" style="text-align: center;padding: 10px;">
            当前只显示<span style="color: #1677ff;">5</span>层，点击 <a-button type="link" @click="onShowAll">加载全部</a-button>
          </div> -->
        </template>
        <template v-else>
          <a-empty />
        </template>

      </div>
      <div v-if="checkFw && checkFw.shbw" class="lpb-info">
        <div class="lpb-info-header">
          <span>房屋</span>
          <span @click="onClose" style="padding: 0 5px;cursor: pointer">x</span>
        </div>
        <div class="lpb-info-content">
          <div class="lpb-info-title lpb-info-row">{{ checkFw.bdcdyh }}</div>
          <div class="lpb-info-btn lpb-info-row">
            <a-space>
              <a-button type="primary" size="small">
                登记簿
              </a-button>
              <a-button type="primary" size="small">
                打印
              </a-button>
            </a-space>
          </div>
          <a-form :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
            <template v-for="(item) in fwKeys">
              <a-form-item :label="item.label">
                <span style="color: #5e8cdc">{{ checkFw[item.value] }}</span>
              </a-form-item>
            </template>
          </a-form>
        </div>
      </div>
    </div>
  </div>
  <a-button @click="handleOk" style="display: none">ddd</a-button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { defHttp } from '/@/utils/http/axios';
import { CheckSquareOutlined, UnorderedListOutlined, PauseOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { message } from "ant-design-vue"
import { checkShowForSingle, checkShowForZh } from "/@/views/bdc/lpb/lpb"
import { extractDataLpb } from '/@/utils/bdc/bdc';
import { router } from "/@/router"

// 查询条件
let zrzData = ref<any>({
  zddm: '',
  dh: '',
  tdzl: '',
  fwzl: '',
  xqmc: '',
  clh: ''
})
// 查询数据
let zrzTableData = ref<any>([])
// 表格列名
let zrzColumns = ref<any>([
  {
    title: '栋号',
    dataIndex: 'dh',
    key: 'dh',
    width: 60
  }, {
    title: '楼幢坐落',
    dataIndex: 'zl',
    key: 'zl',
    width: 'auto'
  }
])
// 表格查询loading
let tableLoading = ref<boolean>(false)
// 分页
const pagination = ref<any>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条数据`
})
// 最大户数
let maxHs = ref<number>(0)
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
// 表格行事件
const customRow = (record) => {
  return {
    onClick: (event) => {
      if (!record.zbm) {
        message.warning('幢编码为空,无法加载楼盘表')
        return
      }
      currentZrzInfo.value = record
      loadFwxx()
    }
  }
}
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
// function getShbw(wlc: any, dyh: any, hbh: any) {
//     const match = fwxx.find((t: any) => t.wlc === wlc && t.dyh === dyh && t.hbh === hbh);
//     return match ? match : null;
// }
// let zl = '园林办事处（城南）第二十五街坊潜江市红梅东路3号名筑仕嘉16栋'
let showAll = ref(false)
const date1 = new Date().getTime()
console.log('date1:' + date1)
// console.log(fwxx)
const date2 = new Date().getTime()
console.log('date2:' + date2)
console.log('时间差:' + (date2 - date1))
let regType = ref('0101')

// 详细信息
const fwKeys = [
  { label: '室号', value: 'shbw' },
  { label: '权利人', value: 'qlr' },
  { label: '坐落', value: 'zl' },
  { label: '已办业务', value: 'yb' },
  { label: '在办业务', value: 'zb' },
  { label: '实际层', value: 'sjc' },
  { label: '名义层', value: 'myc' },
  { label: '户号', value: 'hh' },
  { label: '户型', value: 'hx' },
  { label: '户型结构', value: 'hxjg' },
  { label: '房屋用途', value: 'fwyt' },
  { label: '房屋类型', value: 'fwlx' },
  { label: '房屋性质', value: 'fwxz' },
  { label: '建筑面积(㎡)', value: 'jzmj' },
  { label: '土地独用面积(㎡)', value: 'tddymj' },
  { label: '土地分摊面积(㎡)', value: 'tdftmj' }
]

enum api {
  list = '/api/zrzy-bdc/bdc/bdcZsx/getZrzListByPage',
  lpb = '/api/zrzy-bdc/bdc/lpb/lpb',
  model = '/api/zrzy-bdc/bdc/slsq/getSlsqModel'
}


onMounted(() => {
  let route = router.currentRoute.value
  let slbh = route.query.slbh
  if (slbh) {
    getSlsqModel()
  } else {
    initCurrentCase()
    loadList()
  }
})

// 获取登记类型
function getSlsqModel() {
  let route = router.currentRoute.value
  let slbh = route.query.slbh
  defHttp.get({ url: api.model, params: { slbh: slbh } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      regType.value = res.result?.regtype || '0101'
    } 
    initCurrentCase()
    loadList()
  })
}

/**
 * 获取当前案卷的不动产单元号数组
 */
function initCurrentCase() {

}

/**
 * 加载幢列表
 */
function loadList(flag?: boolean) {
  let params = {
    pageNo: pagination.value.current,
    pageSize: pagination.value.pageSize,
    ...zrzData.value
  }
  defHttp.get({ url: api.list, params: params }, { withToken: true }).then((res) => {
      if (res && res.success) {
        zrzTableData.value = res.result.records
        pagination.value.total = res.result.total
      } else {
        zrzTableData.value = []
        pagination.value.total = 0
      }
     if (flag && zrzTableData.value.length) {
        // 默认选中第一条
        currentZrzInfo.value = zrzTableData.value[0]
        loadFwxx()
     }
  })
  // zrzTableData.value = [
  //   { id: '2', zddm: '429005048032GB31004', dh: '30', zl: '测试数据2', zbm: '05048032GB31004000210' },
  //   { id: '1', zddm: '429005048025GB00202', dh: '25', zl: '测试数据', zbm: '05048025GB00202000216' }
  // ]
}

async function loadFwxx(isFilter = false) {
  if (currentZrzInfo.value && currentZrzInfo.value.zbm) {
    const res = await defHttp.get({ url: api.lpb, params: { zbm: currentZrzInfo.value.zbm } }, { withToken: true })
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
    }
  }

}

function onCheck(item: any) {
  // todo 获取详细房屋数据
  checkFw.value = item
  console.log(item);
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
    maxHs.value = dyMaxhs
  })
}

function onShowAll() {
  showAll.value = false
  cxx.value = JSON.parse(JSON.stringify(cxxData.value))
  setMaxHs()
}
// watch(() => cxx1.value, async (newVal) => {
//     console.log("cxx1变了" + newVal)
// })

/**
 * 表格变化
 * @param pag
 */
function handleTableChange(pag) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadList(true)
}


/**
 * 设置所有fwxx选中状态
 * @param isChecked
 * @param reverse
 * @param currentCase
 */
function initFwxxChecked(isChecked, reverse = false, currentCase = []) {
  let _cxx = cxx.value || []
  let _dyxx = dyxx.value || []
  _cxx.forEach((_cxxItem, _cxxIndex) => {
    _dyxx.forEach((_dyxxItem, _dyxxIndex) => {
      let _fwxx = fwxx.value.filter((t: any) => t.wlc === _cxxItem.wlc && t.dyh === _dyxxItem.dyh)
      for (let i = 0; i < _fwxx.length; i++) {
        _fwxx[i].checked = reverse ? !_fwxx[i].checked : isChecked
        // 初始化已选中
        if (currentCase && currentCase.length) {
          for (let j = 0; j < currentCase.length; j++) {
            let caseItem = currentCase[j]
            if (caseItem.bdcdyh == _fwxx[i].bdcdyh) {
              _fwxx[i].checked = true
              break;
            }
          }
        }
      }
    })
  })
}

/**
 * 勾选框
 * @param colIndex
 * @param dyIndex
 * @param rowIndex
 * @param fwInfo
 */
function onChangeCheckedBox(colIndex, rowIndex, dyIndex, fwInfo) {
  fwInfo.checked = !fwInfo.checked
  currentFw.value.colIndex = colIndex
  currentFw.value.rowIndex = rowIndex
  currentFw.value.dyIndex = dyIndex
}

/**
 * 设置行选或者列选
 * @param type
 */
function setCheckRowOrCol(type) {
  let _cxx = cxx.value || []
  let _dyxx = dyxx.value || []
  _cxx.forEach((_cxxItem, _cxxIndex) => {
    _dyxx.forEach((_dyxxItem, _dyxxIndex) => {
      let _fwxx = fwxx.value.filter((t: any) => t.wlc === _cxxItem.wlc && t.dyh === _dyxxItem.dyh)
      for (let i = 0; i < _fwxx.length; i++) {
        let _col = i
        let _row = _cxxIndex
        let _dy = _dyxxIndex
        if (type == 'row') {
          if (_row == currentFw.value.rowIndex) {
            _fwxx[i].checked = true
          }
        } else {
          if (_dy == currentFw.value.dyIndex && _col == currentFw.value.colIndex) {
            _fwxx[i].checked = true
          }
        }
      }
    })
  })
}

/**
 * 全选
 */
function checkAll() {
  initFwxxChecked(true)
}

/**
 * 反选
 */
function checkReverse() {
  initFwxxChecked(true, true)
}

/**
 * 选行
 */
function checkRow() {
  setCheckRowOrCol('row')
}

/**
 * 选列
 */
function checkCol() {
  setCheckRowOrCol('col')
}

/**
 * 勾选框状态
 * @param fwInfo
 */
function getClass(fwInfo) {
  let caseBdcdyh = currentCase.value.filter(item => (item.zbm == currentZrzInfo.value.zbm) && item.bdcdyh == fwInfo.bdcdyh)
  return caseBdcdyh.length > 0
}

/**
 * 当前户是否可以选择
 * @param fwInfo
 */
function checkShow(fwInfo) {
  if (fwInfo && fwInfo.shbw) {
    if (regType.value.split(',').length == 1) {
      return checkShowForSingle(regType.value, fwInfo)
    } else {
      return checkShowForZh(regType.value, fwInfo)
    }
  } else {
    return false
  }
}
defineExpose({
  handleOk
})
/**
 * 筛选楼盘表
 */
function handleFilterLpb() {

}
/**
 * 提取数据
 */
function handleOk() {
  const data = fwxx.value.filter(t => t.checked == true)
  if (data.length == 0) {
    message.error("请选择要提取的房源")
  } else {
    extractDataLpb({
      data: data
    })
  }
}

function onClose() {
  checkFw.value = null
}
</script>

<style scoped lang="less">
@import url('/@/views/bdc/lpb/lpb.less');
</style>