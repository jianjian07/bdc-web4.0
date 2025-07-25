<template>
  <div class="syj-jf-detail">
    <a-table style="margin-bottom: 10px" :columns="baseColumns" :data-source="dataSource" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'jsfj'">
          <a-input-number
              v-model:value="record[column.dataIndex]"
              :precision="2"
              prefix="￥"
              :min="0"
              style="width: 100%"
              @blur="onBlurJsfj"
          />
        </template>
        <template v-else-if="column.dataIndex == 'bnmj'">
          <a-input-number
              v-model:value="record[column.dataIndex]"
              :precision="2"
              :min="0"
              :max="record.jzmj"
              style="width: 100%"
              @blur="onBlurBnmj"
          />
        </template>
        <template v-else>
          {{ formatNumberStr(record[column.dataIndex]) }}
        </template>
      </template>
    </a-table>
    <a-table :loading="loading" :columns="totalColumns" :data-source="totalDataSource" :pagination="false"
             bordered></a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { router } from "/@/router"
import { message } from "ant-design-vue"
import { debounce } from 'lodash-es'

const props = defineProps({
  nsj: {
    type: [String, Number],
    default: ''
  },
  jzmj: {
    type: [String, Number],
    default: ''
  },
  ykjfy: {
    type: [String, Number],
    default: ''
  },
  jsfjg: {
    type: [String, Number],
    default: ''
  },
  bnmj: {
    type: [String, Number],
    default: ''
  },
  htbh: {
    type: String,
    default: ''
  }
})

const baseColumns = [
  {
    title: '纳税价(元/㎡)',
    dataIndex: 'nsj',
    key: 'nsj',
    width: '25%',
  },
  {
    title: '经适房价(元/㎡)',
    dataIndex: 'jsfj',
    key: 'jsfj',
    width: '20%',
  },
  {
    title: '建筑面积(㎡)',
    dataIndex: 'jzmj',
    key: 'jzmj',
    width: '15%',
  },
  {
    title: '标内面积(㎡)',
    dataIndex: 'bnmj',
    key: 'bnmj',
    width: '20%',
  },
  {
    title: '应扣、减费用(元/㎡)',
    dataIndex: 'ykjfy',
    key: 'ykjfy',
    width: '20%',
  }
]

const totalColumns = [
  {
    title: '计算次数',
    dataIndex: 'jscsStr',
    key: 'jscsStr',
    width: '25%',
  },
  {
    title: '计算房价(元/㎡)',
    dataIndex: 'jsfjStr',
    key: 'jsfjStr',
    width: '20%',
  },
  {
    title: '计算面积(㎡)',
    dataIndex: 'jsmjStr',
    key: 'jsmjStr',
    width: '15%',
  },
  {
    title: '收益比例(%)',
    dataIndex: 'syblStr',
    key: 'syblStr',
    width: '20%',
  },
  {
    title: '收益金额',
    dataIndex: 'syjeStr',
    key: 'syjeStr',
    width: '20%',
  }
]

let dataSource = ref<any>([
  {
    nsj: '',
    jsfj: '',
    jzmj: '',
    bnmj: '',
    ykjfy: ''
  }
])
let loading = ref<boolean>(false)
const totalDataSource = ref<any[]>([])

// 防抖计算 异步分段
const updateTotalDataSource = debounce(() => {
  loading.value = true
  if (mountedFlag.value === false) {
    totalDataSource.value = []
    loading.value = false
    return
  }

  // 后端有数据且不是用户修改时
  if (backTotalDataSource.value.length > 0 && !isUserChange.value) {
    totalDataSource.value = backTotalDataSource.value
    loading.value = false
    return
  }

  const source = dataSource.value[0]
  if (!source.jsfj || !source.jzmj) {
    totalDataSource.value = []
    nextTick(() => {
      isUserChange.value = false
      loading.value = false
    })
    return
  }

  const jscs = Number(source.nsj) - Number(source.jsfj) - Number(source.ykjfy)
  const jsfj = Number(source.jsfj)
  const jsmj = Number(source.bnmj)

  let currentJscs = jscs
  let prevJscs = Number(source.nsj)
  let num = 1

  const result: any[] = []

  function processChunk() {
    let count = 0
    const MAX_CHUNK = 100  // 每轮最多算多少条

    while (currentJscs > 0 && count < MAX_CHUNK) {
      const sybl = 5 + (num - 1) * 10

      const currentFj = currentJscs >= jsfj ? jsfj : currentJscs
      const syje = currentFj * jsmj * (sybl / 100)

      const finalJscsStr = num === 1
          ? `${formatNumberStr(source.nsj)} - ${formatNumberStr(source.jsfj)} - ${formatNumberStr(source.ykjfy)} = ${formatNumberStr(jscs)}`
          : `${formatNumberStr(prevJscs)} - ${formatNumberStr(jsfj)} = ${formatNumberStr(currentJscs)}`

      result.push({
        jscs: currentJscs,
        jscsStr: finalJscsStr,
        jsfj: currentFj,
        jsfjStr: `￥${formatNumberStr(currentFj)}`,
        jsmj,
        jsmjStr: formatNumberStr(jsmj),
        sybl,
        syblStr: `${formatNumberStr(sybl)}%`,
        syje,
        syjeStr: `￥${formatNumberStr(syje)}`,
        sxh: num
      })

      prevJscs = currentJscs
      currentJscs = currentJscs - jsfj
      num++
      count++

      if (currentJscs <= 0) {
        currentJscs = 0
        break
      }
    }

    if (currentJscs > 0) {
      setTimeout(processChunk, 0)
    } else {
      totalDataSource.value = result
      nextTick(() => {
        isUserChange.value = false
        loading.value = false
      })
    }
  }

  processChunk()
}, 300)

const emit = defineEmits(['update:jsfjg', 'update:bnmj'])

// 初始化加载
let mountedFlag = ref<boolean>(false)
// 后端查询数据
let backTotalDataSource = ref<any>([])
// 是否是用户手动修改数据
let isUserChange = ref<boolean>(false)

// 纳税价相关用户操作在表单blur事件中触法计算 这里只监听赋值
watch(() => props.nsj, (newVal) => {
  if (mountedFlag.value) {
    dataSource.value[0].nsj = newVal || 0.00
  }
})

// 建筑面积只读 不会更改
// watch(() => props.jzmj, (newVal) => {
//   if (mountedFlag.value) {
//     dataSource.value[0].jzmj = newVal || 0.00
//     dataSource.value[0].bnmj = dataSource.value[0].bnmj || dataSource.value[0].jzmj
//   }
// })

// 应扣减费用 金额表格发生变化计算
watch(() => props.ykjfy, (newVal) => {
  if (mountedFlag.value) {
    dataSource.value[0].ykjfy = newVal || 0.00
    isUserChange.value = true
    updateTotalDataSource()
  }
})


enum api {
  list = '/api/zrzy-bdc/clf/ht/getSyjmxListByHtlsh',
  save = '/api/zrzy-bdc/clf/ht/saveSyjList'
}

onMounted(() => {
  initData()
})

/**
 * 查询数据
 */
function initData() {
  dataSource.value[0] = {
    nsj: props.nsj || 0.00,
    jsfj: props.jsfjg || 2940.00,
    jzmj: props.jzmj || 0.00,
    bnmj: props.bnmj || props.jzmj || 0.00,
    ykjfy: props.ykjfy || 0.00
  }

  const route = router.currentRoute.value

  defHttp.get({ url: api.list, params: { htlsh: route.query.htlsh } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      backTotalDataSource.value = res.result.map((item) => {
        return {
          id: item.id,
          htbh: item.htbh,
          htlsh: item.htlsh,
          jscsStr: item.jscs,
          jsfjStr: item.jsfj,
          jsmjStr: item.jsmj,
          syblStr: item.sybl,
          syjeStr: item.syje,
          sxh: item.sxh
        }
      })
      mountedFlag.value = true
    } else {
      message.error(res.message)
      mountedFlag.value = true
    }
    updateTotalDataSource()
  })
}

/**
 * 格式化数字,逗号分隔,保留两位小数
 * @param num
 */
function formatNumberStr(num) {
  if (!num && num !== 0) {
    num = 0
  }
  return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * 保存
 */
function saveData() {
  return new Promise((resolve, reject) => {
    if (totalDataSource.value == backTotalDataSource.value) {
      resolve(true)
      return
    }

    const htlsh = router.currentRoute.value.query.htlsh
    let data = totalDataSource.value.map((item) => {
      return {
        htbh: props.htbh,
        htlsh: htlsh,
        jscs: item.jscsStr,
        jsfj: item.jsfjStr,
        jsmj: item.jsmjStr,
        sybl: item.syblStr,
        syje: item.syjeStr,
        sxh: item.sxh
      }
    })
    defHttp.post({ url: api.save, data: data, params: { htlsh: htlsh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
      } else {
        message.warning(res?.message || '保存收益金计算发生错误!')
        resolve(false)
      }
    }).catch((err) => {
      reject(err)
    })
  })
}

function onBlurJsfj(e) {
  isUserChange.value = true
  if (!dataSource.value[0].jsfj && dataSource.value[0].jsfj != 0.00) {
    dataSource.value[0].jsfj = 2940.00
  }
  updateTotalDataSource()
  emit('update:jsfjg', dataSource.value[0].jsfj)
}

function onBlurBnmj(e) {
  isUserChange.value = true
  if (!dataSource.value[0].bnmj && dataSource.value[0].bnmj != 0.00) {
    dataSource.value[0].bnmj = 0.00
  }
  updateTotalDataSource()
  emit('update:bnmj', dataSource.value[0].bnmj)
}

/**
 * 父组件调用
 */
function onUserChange() {
  isUserChange.value = true
  updateTotalDataSource()
}

defineExpose({
  saveData,
  onUserChange
})

</script>

<style scoped lang="less">
.syj-jf-detail {
  margin-bottom: 10px;
}
</style>