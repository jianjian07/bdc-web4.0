<template>
  <div class="foot-css">
    <div class="foot-btn-css" v-if="leftBtnList.length > 0">
      <a-space :size="spaceSize">
        <template v-for="(btn, index) in leftBtnList">
          <a-button size="small" type="primary" @click="handleClick(btn)">{{ btn.btnName }}</a-button>
        </template>
      </a-space>
    </div>
    <div class="foot-btn-middle-css" id="btn-middle-list">
      <div class="button-container" v-if="middleBtnList.length > 0">
        <div class="foot-btn-css">
          <a-space :size="spaceSize">
            <a-button v-if="canScrollLeft" class="scroll-button" size="small" type="primary" @click="scrollLeft">
              <template #icon>
                <DoubleLeftOutlined />
              </template>
            </a-button>
            <template v-for="(btn, index) in visibleButtons" :key="index">
              <template v-if="btn.funName == 'batchQlqt'">
                <!--                <template v-if="!sfybz && isPl">-->
                <!--                  <a-button size="small" type="primary" @click="handleClick(btn)">{{ btn.btnName }}</a-button>-->
                <!--                </template>-->
                <template v-if="!sfybz">
                  <a-button size="small" type="primary" @click="handleClick(btn)">{{ btn.btnName }}</a-button>
                </template>
              </template>
              <a-button v-else size="small" type="primary" @click="handleClick(btn)">{{ btn.btnName }}</a-button>
            </template>
            <a-button v-if="canScrollRight" class="scroll-button" size="small" type="primary" @click="scrollRight">
              <template #icon>
                <DoubleRightOutlined />
              </template>
            </a-button>
          </a-space>
        </div>
      </div>
    </div>
    <div v-if="rightBtnList.length > 0" class="foot-btn-css foot-btn-right-css">
      <a-space :size="spaceSize">
        <template v-for="(btn, index) in rightBtnList.slice(0, 3)">
          <a-button size="small" type="primary" @click="handleClick(btn)">{{ btn.btnName }}</a-button>
        </template>
        <a-popover placement="bottomRight" v-if="rightBtnList.length > 3">
          <template #content>
            <div class="right-other-list">
              <template v-for="(btn, index) in rightBtnList.slice(3, rightBtnList.length)">
                <a-button class="right-other-btn" size="small" type="primary" @click="handleClick(btn)">{{ btn.btnName
                  }}</a-button>
              </template>
            </div>
          </template>
          <a-button size="small" type="primary" style="transform: rotate(90deg)">
            <template #icon>
              <DoubleRightOutlined />
            </template>
          </a-button>
        </a-popover>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import * as bdc from '/@/views/bdc/public/bdc'
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons-vue'
import { isJsonData } from "/@/views/online/utils/commonUtils"
import { message } from "ant-design-vue"

const props = defineProps({
  vueRefs: {
    type: Object,
    default: []
  },
  btnList: {
    type: Object,
    default: []
  },
  spinning: {
    type: Boolean,
    default: false
  },
  sfybz: {
    type: Boolean,
    default: false
  },
  isPl: {
    type: Boolean,
    default: false
  },
  isAllFinished: {
    type: Boolean,
    dafault: false
  },
  jdmc: {
    type: String,
    default: ''
  },
  regType: {
    type: String,
    default: ''
  },
})
const eventBus = inject('scopedEventBus', null)
let _vueRefs: any = computed(() => { return props.vueRefs })
let _jdmc: any = computed(() => { return props.jdmc })
// 左侧基础按钮
let leftBtnList = ref<any>([])
// 左侧copy
let leftBtnListCopy = ref<any>([])
// 中侧按钮
let middleBtnList = ref<any>([])
// 中侧Copy
let middleBtnListCopy = ref<any>([])
// 右侧按钮
let rightBtnList = ref<any>([])
// 右侧Copy
let rightBtnListCopy = ref<any>([])
// 按钮间隔
const spaceSize = 16
// 保存loading
let loading = ref<boolean>(false)
// 定义每次最多显示的按钮数量
let maxVisibleButtons = ref(0);
// 定义当前可见范围的起始索引
const startIndex = ref(0);

const emit = defineEmits(['update:spinning'])

watch(() => props.spinning, (newVal) => {
  loading.value = newVal
})

watch(() => loading.value, (newVal) => {
  emit('update:spinning', newVal)
})

watch(() => props.btnList, (newVal: any) => {
  leftBtnList.value = newVal && newVal.left ? newVal.left : []
  middleBtnList.value = newVal && newVal.center ? newVal.center : []
  rightBtnList.value = newVal && newVal.right ? newVal.right : []
  leftBtnListCopy.value = JSON.parse(JSON.stringify(leftBtnList.value))
  middleBtnListCopy.value = JSON.parse(JSON.stringify(middleBtnList.value))
  rightBtnListCopy.value = JSON.parse(JSON.stringify(rightBtnList.value))
  nextTick(() => {
    maxVisibleButtons.value = getMaxMiddleBtnCount()
  })
}, {
  immediate: true,
  deep: true
})

onMounted(() => {
  loading.value = props.spinning
  eventBus.on('setHiddenBtnList', getHiddenBtnList)
  eventBus.emit('getHiddenBtnList')
})

onBeforeUnmount(() => {
  eventBus.off('setHiddenBtnList', getHiddenBtnList)
})

/**
 * 设置按钮
 * @param btnList
 */
function getHiddenBtnList(btnList: any) {
  // 如果没有设置 默认都是显示 
  if (btnList && btnList.length > 0) {
    leftBtnList.value = filterButtonsByAnwz('left', btnList, leftBtnListCopy.value);
    rightBtnList.value = filterButtonsByAnwz('right', btnList, rightBtnListCopy.value);
    middleBtnList.value = filterButtonsByAnwz('center', btnList, middleBtnListCopy.value);
  } else {
    leftBtnList.value = leftBtnListCopy.value
    rightBtnList.value = rightBtnListCopy.value
    middleBtnList.value = middleBtnListCopy.value
  }
}

function filterButtonsByAnwz(anwz: string, btnList: any[], allCopyList: any[]) {
  const removeNames = btnList
    .filter(item => item.anwz === anwz)
    .map(item => item.btnName);

  return allCopyList.filter(item => !removeNames.includes(item.btnName));
}

function getMaxMiddleBtnCount() {
  let count = 0
  let dom = document.getElementById('btn-middle-list')
  let btnList = visibleButtons.value.length ? visibleButtons.value : middleBtnList.value
  if (dom) {
    // 按钮可占宽度(去掉左右边距和左右按钮宽度)
    let btnWidth = dom.offsetWidth - 30 - 20 - 34 * 2
    let width = 0
    for (let i = 0; i < btnList.length; i++) {
      let name = btnList[i].btnName
      width += (name.length) * 14 + 14
      if (i !== 0) {
        width += (spaceSize / 2)
      }
      if (width < btnWidth) {
        count++
      } else {
        break
      }
    }
  }
  return count
}

/**
 * 按钮点击事件
 */
async function handleClick(btn) {
  if (!props.isAllFinished) {
    message.warning('表单还未加载完毕!')
    return
  } else {
    if (btn.funName && bdc[btn.funName]) {
      // 显示使用 避免打包被剔除
      const _bdcFun = bdc['baseSave']
      const _ref = _vueRefs.value
      const _jdmcStr = _jdmc.value
      const _on = eventBus?.on
      // 修正非 JSON 格式字符串
      btn.bz = btn.bz || ''
      let correctedBz = btn.bz
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // 键名加双引号
        .replace(/'/g, '"'); // 单引号变双引号
      let params = btn.bz ? (isJsonData(correctedBz) ? JSON.parse(correctedBz) : `'${correctedBz}'`) : ''
      let _params = `(_vueRefs.value, loading, _jdmc.value,eventBus${params ? (',' + JSON.stringify(params)) : params})`
      if (btn.anwz == 'center') {
        params.regType = props.regType
        _params = `(${params ? JSON.stringify(params) : params})`
      }
      await eval(`bdc[btn.funName]` + _params)
    }
  }
}

// 计算当前可见的按钮
const visibleButtons = computed(() =>
  middleBtnList.value.slice(startIndex.value, startIndex.value + maxVisibleButtons.value)
);

// 判断是否可以右滚动
const canScrollRight = computed(() =>
  startIndex.value + maxVisibleButtons.value < middleBtnList.value.length
);

// 判断是否可以左滚动
const canScrollLeft = computed(() =>
  startIndex.value > 0
);

// 右滚动函数
const scrollRight = () => {
  if (canScrollRight.value) {
    startIndex.value = Math.min(startIndex.value + maxVisibleButtons.value, middleBtnList.value.length - maxVisibleButtons.value);
    nextTick(() => {
      maxVisibleButtons.value = getMaxMiddleBtnCount()
    })
  }
};

// 左滚动函数
const scrollLeft = () => {
  if (canScrollLeft.value) {
    startIndex.value = Math.max(startIndex.value - maxVisibleButtons.value, 0);
    nextTick(() => {
      maxVisibleButtons.value = getMaxMiddleBtnCount()
    })
  }
};

// function saveVue3() {
//   checkDemoRefs()
//   sendSaveFun('baseSave', vueRefs)
// }

function getMultipleRef(list: any[], arr: any[]) {
  list.forEach((item: any) => {
    if (Array.isArray(item)) {
      let _list = getMultipleRef(item, [])
      arr = [...arr, ..._list]
    } else {
      arr.push(item)
      if ((item && item.multipleRef && item.multipleRef())) {
        // console.log('item.multipleRef(',item.multipleRef())
        return getMultipleRef(item.multipleRef(), arr)
      } else if (item && item.$ && item.$.exposed && item.$.exposed.multipleRef && item.$.exposed.multipleRef()) {
        // console.log('item.$.exposed.multipleRef()',item.$.exposed.multipleRef())
        return getMultipleRef(item.$.exposed.multipleRef(), arr)
      } else if (item && item._ && item._.exposed && item._.exposed.multipleRef && item._.exposed.multipleRef()) {
        // console.log('item._.exposed.multipleRef()')
        return getMultipleRef(item._.exposed.multipleRef(), arr)
      }
    }
  })
  return arr
}
</script>

<style lang="less" scoped>
.foot-css {
  height: 45px;
  background-color: #1890ff33;
  padding: 5px;
  display: flex;
}

.foot-btn-css {
  background-color: #fff;
  height: 35px;
  line-height: 35px;
  padding: 0px 10px;
}

.foot-btn-right-css {
  //position: absolute;
  //right: 0px;
  //text-align: right;
}

.foot-btn-middle-css {
  height: 35px;
  line-height: 35px;
  padding: 0px 10px;
  margin: 0 5px;
  flex: auto;
  overflow: hidden;
}

.button-container {
  display: flex;
  overflow: hidden;
  align-items: center;
}

.right-other-list {
  max-width: 400px;
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>