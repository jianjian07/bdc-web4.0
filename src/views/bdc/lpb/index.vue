<template>
  <div style="width: 100%; text-align: center; height: 100%">
    <div class="legend-tool-bar">
      <div style="flex: 1"></div>
      <div class="legend-icon">
        <a-space>
          <span style="white-space: nowrap">图例版：</span>
          <template v-for="item in ZT_CONFIG" :key="'legend-' + item.ybKey">
            <span class="zt" :style="{ backgroundColor: item.color }"></span>
            <span style="white-space: nowrap">{{ item.label }}</span>
          </template>
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
          <a-button size="small" type="primary" @click="handleTemSave">
            <template #icon>
              <PushpinOutlined />
            </template>暂存
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
              <a-button type="primary" @click="handleLoad">
                <template #icon>
                  <SearchOutlined />
                </template>查询
              </a-button>
            </div>
          </a-form>
        </div>
        <div class="search-result">
          <a-table id="table_ld" class="zrz-table ant-table-striped" :columns="zrzColumns" :data-source="zrzTableData"
            :pagination="pagination" :loading="tableLoading" :scroll="{ y: 300 }" :custom-row="customRow"
            :row-class-name="(_record, index) => _record.zbm == currentZrzInfo.zbm ? 'active-table-row' : (getTemClass(_record) ? 'tem-table-row' : null)"
            row-key="zbm" @change="handleTableChange" size="small">
          </a-table>
        </div>
      </div>
      <div class="lpb-content">
        <div v-if="cxxData.length" class="lpb-content-search-tool">
          <div style="width: 20%; margin: 0 10px">
            <a-form-item label="层">
              <a-select style="width: 100%" allow-clear v-model:value="filterLpb.cData" :options="cxxOptions"
                :field-names="{ label: 'wlc', value: 'wlc' }"></a-select>
            </a-form-item>
          </div>
          <!--          <div style="width: 30%; margin: 0 10px">-->
          <!--            <a-form-item label="户" style="display: flex; flex-wrap: nowrap;">-->
          <!--              <a-input style="width: 100%" v-model:value="filterLpb.hData"></a-input>-->
          <!--            </a-form-item>-->
          <!--          </div>-->
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
              <tr v-for="(row, cIndex) in lpbRows" :key="row.cInfo.wlc">
                <td class="title">{{ row.cInfo.wlc }}</td>
                <td class="title">{{ getMycStr(row.cInfo.myc) }}</td>
                <template v-for="(unit, dyIndex) in row.units" :key="row.cInfo.wlc.toString()+unit.dy.dyh">
                  <td v-for="(cell, fwIndex) in unit.cells" :colspan="cell.fw.colspan" :rowspan="cell.fw.rowspan"
                    :key="cell.fw.wlc + '-' + cell.fw.dyh + '-' + fwIndex"
                    :class="checkFw?.bdcdyh === cell.fw.bdcdyh ? 'dy-css' : 'dy-css-base'" @click="onCheck(cell.fw)">

                    <!-- 在办状态色块(公共部位/限制登记不展示在办态) -->
                    <div class="fw-td">
                      <template v-for="item in ZT_CONFIG_ZB" :key="'zb-' + item.zbKey">
                        <span v-if="cell.fw[item.zbKey] == 1" class="zbzt"
                          :style="{ backgroundColor: item.color }"></span>
                      </template>
                    </div>
                    <a-checkbox v-if="cell.inCase || cell.canCheck" :class="{ caseCheck: cell.inCase }"
                      :checked="cell.fw.checked" :col="fwIndex" :row="cIndex" :dy="dyIndex"
                      @change="onChangeCheckedBox(fwIndex, cIndex, dyIndex, cell.fw)">
                    </a-checkbox>
                    <span style="cursor: pointer"
                      :class="[(cell.inCase || cell.canCheck) ? 'checked-shbw' : 'unchecked-shbw']">{{
            cell.fw.shbw }}</span>
                    <!-- 已办状态色块 -->
                    <div class="fw-td">
                      <template v-for="item in ZT_CONFIG" :key="'yb-' + item.ybKey">
                        <span v-if="cell.fw[item.ybKey] == 1" class="zt"
                          :style="{ backgroundColor: item.color }"></span>
                      </template>
                    </div>

                    <!-- {{ cell.fw.shbw + '|' + cell.fw.colspan }} -->
                  </td>
                  <template v-for="blanc in unit.blanks">
                    <td></td>
                  </template>
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
          <div class="lpb-info-title lpb-info-row">
            <a @click="queryHis(checkFw.bdcdyh)">{{ checkFw.bdcdyh }}</a>
          </div>
          <!--          <div class="lpb-info-btn lpb-info-row">-->
          <!--            <a-space>-->
          <!--              <a-button type="primary" size="small">-->
          <!--                登记簿-->
          <!--              </a-button>-->
          <!--            </a-space>-->
          <!--          </div>-->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { defHttp } from '/@/utils/http/axios';
import { CheckSquareOutlined, UnorderedListOutlined, PauseOutlined, SearchOutlined, PushpinOutlined } from '@ant-design/icons-vue';
import { message } from "ant-design-vue"
import { checkShowLpb, getYwStr, getDictStr, getTreeDictStr, ZT_CONFIG, ZT_CONFIG_ZB } from "/@/views/bdc/lpb/lpb"
import { cModal } from "/@/components/cModal/index"
import { currentRoute } from "/@/router"
const route = currentRoute;

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
// 查询的楼盘表信(筛选用)
let lpbData = ref<any>()
// 暂存
let temFwList = ref<any>([])
// function getShbw(wlc: any, dyh: any, hbh: any) {
//     const match = fwxx.find((t: any) => t.wlc === wlc && t.dyh === dyh && t.hbh === hbh);
//     return match ? match : null;
// }
// let zl = '园林办事处（城南）第二十五街坊潜江市红梅东路3号名筑仕嘉16栋'
let showAll = ref(false)
let regType = ref<string>()

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
  { label: '户型', value: 'hx', dict: 'hx' },
  { label: '户型结构', value: 'hxjg', dict: 'hxjg' },
  { label: '房屋用途', value: 'fwyt', treeDict: 'fwyt' },
  { label: '房屋类型', value: 'fwlx', dict: 'fwlx' },
  { label: '房屋性质', value: 'fwxz', dict: 'fwxz' },
  { label: '建筑面积(㎡)', value: 'jzmj' },
  { label: '土地独用面积(㎡)', value: 'dytdmj' },
  { label: '土地分摊面积(㎡)', value: 'ftjzmj' },
  { label: '测绘状态', value: 'chzt', dict: 'chzt' }
]

enum api {
  list = '/api/zrzy-bdc/bdc/bdcZsx/getZrzListByPage',
  lpb = '/api/zrzy-bdc/bdc/lpb/lpb',
  model = '/api/zrzy-bdc/bdc/bl/getCaseModel',
  dyxx = '/api/zrzy-bdc/bdc/case/getDyxxList',
  detail = '/api/zrzy-bdc/bdc/lpb/lpbFw'
}

const emit = defineEmits(['ok'])

onMounted(async () => {
  let slbh = route.query.slbh
  if (slbh) {
    getSlsqModel()
  } else {
    await initCurrentCase()
    loadList()
  }
})

function handleLoad() {
  pagination.value.current = 1
  checkFw.value = null
  cxxData.value = []
  currentZrzInfo.value = {}
  loadList()
}

// 获取登记类型
function getSlsqModel() {
  let slbh = route.query.slbh
  defHttp.get({ url: api.model, params: { slbh: slbh } }, { withToken: true }).then(async (res) => {
    if (res && res.success) {
      regType.value = res.result?.regtype
    }
    await initCurrentCase()
    loadList()
  })
}

/**
 * 获取当前案卷的不动产单元号数组
 */
function initCurrentCase() {
  return new Promise((resolve, reject) => {
    let slbh = route.query.slbh
    if (!slbh) {
      message.warning("未获取到受理编号，请刷新地址重试！")
      resolve(false)
      return
    }
    defHttp.get({ url: api.dyxx, params: { slbh: slbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        currentCase.value = res.result
        if (res.result.length) {
          currentZrzInfo.value.zbm = res.result[0].zbm
          currentZrzInfo.value.zl = res.result[0].zl
          currentZrzInfo.value.zddm = res.result[0].zddm
          zrzData.value.zddm = res.result[0].zddm
          temFwList.value = Object.values(
            currentCase.value.reduce((acc: Record<string, any>, item) => {
              if (!acc[item.zbm]) {
                acc[item.zbm] = {
                  zbm: item.zbm,
                  fwxxList: []
                }
              }
              acc[item.zbm].fwxxList.push(item)
              return acc
            }, {})
          )
          loadFwxx(false, true)
        }
        resolve(true)
      } else {
        message.warning('获取当前案卷不动产单元号失败')
        resolve(false)
      }
    })
  })

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
}

async function loadFwxx(isFilter = false, initCheck = false) {
  if (!regType.value) {
    message.warning("未获取到登记类型，请刷新地址重试！")
    return
  }
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
      let _case = [...currentCase.value]
      if (temFwList.value.length) {
        temFwList.value.forEach(item => {
          const zbm = item.zbm
          const zddm = item.zddm
          item.fwxxList.forEach(fw => {
            const exists = _case.some(c => c.zbm === zbm && c.bdcdyh === fw.bdcdyh)
            if (!exists) {
              _case.push({
                zbm,
                zddm,
                bdcdyh: fw.bdcdyh
              })
            }
          })
        })
      }
      // if (initCheck) {
      initFwxxChecked(false, false, _case)
      // }
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
      // 浅拷贝合并,避免污染 fwxx 中的原始对象
      checkFw.value = { ...item, ...res.result }
    } else {
      message.warning('获取房屋属性失败')
    }
  })
}

/**
 * 设置最大户数
 */
function setMaxHs() {
  let _total = 0
  let _max = 0
  dyxx.value.forEach((dy) => {
    let dyMaxhs = 0
    cxx.value.forEach((cInfo) => {
      let fwList = fwxx.value.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh)
      dyMaxhs = fwList.length > dyMaxhs ? fwList.length : dyMaxhs
    })
    dy.maxHs = dyMaxhs
    _total += dyMaxhs
    _max = dyMaxhs > _max ? dyMaxhs : _max
  })
  totalHs.value = _total
  maxHs.value = _max
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
 * @param caseList 案卷中已有的不动产单元(命中则强制选中)
 */
function initFwxxChecked(isChecked, reverse = false, caseList: any[] = []) {
  const _cxx = cxx.value || []
  const _dyxx = dyxx.value || []
  // 楼盘表展示的过滤条件:物理层号、单元号必须同时命中
  // 这里用 Set 做严格等值匹配,与矩阵中的 `t.wlc === cInfo.wlc && t.dyh === dy.dyh` 保持一致
  // (避免层号/单元号存在数字与字符串类型差异时,把未展示的户也置为选中)
  const wlcSet = new Set<any>(_cxx.map((item: any) => item.wlc))
  const dyhSet = new Set<any>(_dyxx.map((item: any) => item.dyh))
  const caseKeys = new Set<any>((caseList || []).map((item: any) => item.bdcdyh))
    ; (fwxx.value || []).forEach((fw: any) => {
      if (!wlcSet.has(fw.wlc) || !dyhSet.has(fw.dyh)) return
      fw.checked = reverse ? !fw.checked : isChecked
      // 初始化已选中
      if (caseList && caseList.length && caseKeys.has(fw.bdcdyh)) {
        fw.checked = true
      }
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
 * 暂存勾选值
 */
function handleTemSave() {
  const data = lpbData.value.fwList.filter(t => t.checked == true)
  updateOrPush(temFwList.value, {
    zbm: currentZrzInfo.value.zbm,
    fwxxList: data.map((item) => {
      item.zddm = currentZrzInfo.value.zddm
      item.zbm = currentZrzInfo.value.zbm
      return item
    })
  })

  message.success('暂存成功!')
}

/**
 * 勾选框状态(当前户是否已属于本案卷)
 * @param fwInfo
 */
function getClass(fwInfo) {
  return caseBdcdyhSet.value.has(fwInfo.bdcdyh)
}

/**
 * 当前户是否可以选择
 * 已重构: 统一走 checkShowLpb 规则引擎,支持任意组合登记类型
 * @param fwInfo
 */
function checkShow(fwInfo) {
  if (!regType.value) return false
  return checkShowLpb(regType.value, fwInfo)
}

defineExpose({
  handleOk
})
/**
 * 本案卷中当前幢已包含的不动产单元号(缓存,案卷数据变化才重算)
 */
const caseBdcdyhSet = computed(() => {
  const zbm = currentZrzInfo.value?.zbm
  const set = new Set<any>()
    ; (currentCase.value || []).forEach((item: any) => {
      if (item.zbm == zbm) {
        set.add(item.bdcdyh)
      }
    })
  return set
})
/**
 * 每户可勾选结果缓存(只与 登记类型 + 房屋自身状态 有关)
 * 单独缓存的原因:checkShowLpb 是纯业务校验,
 * 与"选中哪一幢、显示哪一层、渲染了几次"无关,
 * 放在模板里调用会被组件的每次重渲染反复触发(一户也会被调用多次)
 */
const fwCheckMap = computed(() => {
  const map = new Map<any, boolean>()
    ; (fwxx.value || []).forEach((fw: any) => {
      map.set(fw, checkShow(fw))
    })
  return map
})
/**
 * 楼盘表单元格矩阵(层 -> 单元 -> 户)
 * 只负责组装展示结构,勾选校验统一走 fwCheckMap 缓存,避免重复计算
 */
const lpbRows = computed<any[]>(() => {
  const _cxx = cxx.value || []
  const _dyxx = dyxx.value || []
  const _fwxx = fwxx.value || []
  return _cxx.map((cInfo: any) => ({
    cInfo,
    units: _dyxx.map((dy: any) => {
      const cells = _fwxx
        .filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh)
        .map((fw: any) => ({
          fw,
          inCase: getClass(fw),
          canCheck: fwCheckMap.value.get(fw) === true
        }))
      return { dy, cells, blanks: Math.max((dy.maxHs || 0) - cells.length, 0) }
    })
  }))
})
/**
 * 筛选楼盘表
 */
function handleFilterLpb() {
  const wlc = filterLpb.value.cData;
  dyxx.value = lpbData.value.dyhList;
  cxxData.value = wlc
    ? lpbData.value.cxxList.filter(item => item.wlc == wlc)
    : lpbData.value.cxxList;
  // 同批次赋值,避免先清空再赋值造成的两次渲染(勾选校验重复计算)
  cxx.value = cxxData.value;
  fwxx.value = wlc ? lpbData.value.fwList.filter(item => item.wlc == wlc) : lpbData.value.fwList
}
/**
 * 提取数据
 */
function handleOk() {
  if (lpbData.value == undefined) {
    message.error("请选择要提取的房源")
    return
  }
  const data = lpbData.value.fwList.filter(t => t.checked == true)
  let okData = []
  if (!temFwList.value.length) {
    temFwList.value = [{
      zbm: currentZrzInfo.value.zbm,
      fwxxList: data.map((item) => {
        item.zddm = currentZrzInfo.value.zddm
        item.zbm = currentZrzInfo.value.zbm
        return item
      })
    }]
  } else {
    updateOrPush(temFwList.value, {
      zbm: currentZrzInfo.value.zbm,
      fwxxList: data.map((item) => {
        item.zddm = currentZrzInfo.value.zddm
        item.zbm = currentZrzInfo.value.zbm
        return item
      })
    })
  }

  okData = temFwList.value
    .filter(item => item.fwxxList && item.fwxxList.length > 0)
    .flatMap(item => item.fwxxList)
  if (okData.length == 0) {
    message.error("请选择要提取的房源")
  } else {
    emit('ok', { reload: true, data: { fwxxList: okData } })
    // extractDataLpb({
    //   data: data
    // })
  }
}

function updateOrPush(arr: any[], obj: any) {
  const index = arr.findIndex(item => item.zbm === obj.zbm)
  if (index !== -1) {
    arr[index] = obj // 替换
  } else {
    arr.push(obj) // 添加
  }
}

/**
 * 暂存效果
 * @param record
 */
function getTemClass(record) {
  let temZbms = temFwList.value.filter(f => f.fwxxList.length).map(m => m.zbm)
  return temZbms.includes(record.zbm)
}

function onClose() {
  checkFw.value = null
}

function getMycStr(myc) {
  if (!myc) return '';
  return myc.endsWith('层') ? myc : myc + '层';
}

/**
 * 查看单元历史回溯
 * @param bdcdyh
 */
function queryHis(bdcdyh) {
  cModal({
    title: '历史回溯',
    width: 1000,
    filePath: 'views/bdc/query/Dycx',
    formData: {
      bdcdyh: bdcdyh
    },
    footer: false
  })
}
</script>

<style scoped lang="less">
@import url('/@/views/bdc/lpb/lpb.less');
</style>
