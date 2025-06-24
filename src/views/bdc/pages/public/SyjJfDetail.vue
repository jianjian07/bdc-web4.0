<template>
  <div class="syj-jf-detail">
    <a-table style="margin-bottom: 10px" :columns="baseColumns" :data-source="dataSource" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'jsfj'">
          <a-input-number
            v-model:value="record[column.dataIndex]"
            :precision="2"
            :formatter="value => {
              const num = Number(value || 0).toFixed(2);
              const parts = num.split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              return `￥${parts.join('.')}`;
            }"
            :parser="value => value.replace(/[￥,\s]/g, '')"
            :min="0"
            style="width: 100%"
          />
        </template>
        <template v-else-if="column.dataIndex == 'bnmj'">
          <a-input-number
            v-model:value="record[column.dataIndex]"
            :precision="2"
            :formatter="value => {
              const num = Number(value || 0).toFixed(2);
              const parts = num.split('.');
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              return `${parts.join('.')}`;
            }"
            :parser="value => value.replace(/,/g, '')"
            :min="0"
            :max="record.jzmj"
            style="width: 100%"
          />
        </template>
        <template v-else>
          {{ formatNumberStr(record[column.dataIndex]) }}
        </template>
      </template>
    </a-table>
    <a-table :columns="totalColumns" :data-source="totalDataSource" :pagination="false" bordered></a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { router } from "/@/router"
import { message } from "ant-design-vue"

const props = defineProps({
  nsj: {
    type: [String,Number],
    default: ''
  },
  jzmj: {
    type: [String,Number],
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

const totalDataSource = computed(() => {
  if (mountedFlag.value === false) {
    return []
  } 
  
  // 后端有数据且不是用户修改时
  if (backTotalDataSource.value.length > 0 && !isUserChange.value) {
    return backTotalDataSource.value
  }
  
  const source = dataSource.value[0]
  if (!source.jsfj || !source.jzmj) {
    return []
  } else {
    const result: any = []
   
    let num = 1
    let jscs = Number(source.nsj) - Number(source.jsfj) - Number(source.ykjfy)
    let jsfj = Number(source.jsfj)
    let jsmj = Number(source.bnmj)
    
    let currentJscs = jscs
    let prevJscs = Number(source.nsj)
    
    while (currentJscs > 0) {
      let sybl = 5 + (num - 1) * 10
      const currentFj = jscs >= jsfj ? jsfj : currentJscs
      // 计算房价*计算面积*收益比例
      const syje = currentFj * jsmj * (sybl / 100)
      
      let jscsStr = ''
      if (num == 1) {
        jscsStr = `${formatNumberStr(source.nsj)} - ${formatNumberStr(source.jsfj)} - ${formatNumberStr(source.ykjfy)} = ${formatNumberStr(jscs)}`
      } else {
        jscsStr = `${formatNumberStr(prevJscs)} - ${formatNumberStr(jsfj)} = ${formatNumberStr(currentJscs)}`
      }
      
      const item = {
        jscs: currentJscs,
        jscsStr: jscsStr,
        jsfj: currentFj,
        jsfjStr: `￥${formatNumberStr(currentFj)}`,
        jsmj: jsmj,
        jsmjStr: formatNumberStr(jsmj),
        sybl: sybl,
        syblStr: `${formatNumberStr(sybl)}%`,
        syje: syje,
        syjeStr: `￥${formatNumberStr(syje)}`,
        sxh: num
      }
      
      result.push(item)
      
      prevJscs = currentJscs
      currentJscs = currentJscs - jsfj
      num++
      
      if (currentJscs <= 0 || currentJscs < jsfj) {
        // 最后一轮
        const finalSybl = 5 + (num - 1) * 10;
        const finalSyje = currentJscs * jsmj * (finalSybl / 100);
        const finalJscsStr = `${formatNumberStr(prevJscs)} - ${formatNumberStr(jsfj)} = ${formatNumberStr(currentJscs)}`;
  
        result.push({
          jscs: currentJscs,
          jscsStr: finalJscsStr,
          jsfj: currentJscs,
          jsfjStr: `￥${formatNumberStr(currentJscs)}`,
          jsmj: jsmj,
          jsmjStr: formatNumberStr(jsmj),
          sybl: finalSybl,
          syblStr: `${formatNumberStr(finalSybl)}%`,
          syje: finalSyje,
          syjeStr: `￥${formatNumberStr(finalSyje)}`,
          sxh: num
        });
        break;
      }
    }
    return result
  }
})

const emit = defineEmits(['update:jsfjg','update:bnmj'])

// 初始化加载
let mountedFlag = ref<boolean>(false)
// 后端查询数据
let backTotalDataSource = ref<any>([])
// 是否是用户手动修改数据
let isUserChange = ref<boolean>(false)

watch(() => props.nsj, (newVal) => {
  if (mountedFlag.value) {
    dataSource.value[0].nsj = newVal || 0.00
    isUserChange.value = true
  }
})

watch(() => props.jzmj, (newVal) => {
  if (mountedFlag.value) {
    dataSource.value[0].jzmj = newVal || 0.00
    dataSource.value[0].bnmj = dataSource.value[0].bnmj || dataSource.value[0].jzmj
    isUserChange.value = true
  }
})

watch(() => props.ykjfy, (newVal,oldValue) => {
  if (mountedFlag.value) {
    dataSource.value[0].ykjfy = newVal || 0.00
    isUserChange.value = true
  }
})

watch(() => props.jsfjg, (newVal) => {
  if (mountedFlag.value) {
    dataSource.value[0].jsfj = newVal || 2940.00
    isUserChange.value = true
  }
})

watch(() => props.bnmj, (newVal) => {
  if (mountedFlag.value) {
    dataSource.value[0].bnmj = newVal || dataSource.value[0].jzmj || 0.00
    isUserChange.value = true
  }
})

watch(() => dataSource.value[0].jsfj, (newVal) => {
  if (mountedFlag.value) {
    isUserChange.value = true
    emit('update:jsfjg',newVal)
  }
})

watch(() => dataSource.value[0].bnmj, (newVal) => {
  if (mountedFlag.value) {
    isUserChange.value = true
    emit('update:bnmj',newVal)
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
    bnmj: props.bnmj || props.jzmj || 0.00 ,
    ykjfy: props.ykjfy || 0.00
  }
  
  const route = router.currentRoute.value;
  
  defHttp.get({ url: api.list, params: { htlsh: route.query.htlsh } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      backTotalDataSource.value = res.result.map((item) => {
        return {
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
  })
}

/**
 * 格式化数字,逗号分隔,保留两位小数
 * @param num
 */
function formatNumberStr(num) {
  if (!num && num !==0) {
    num = 0
  }
  return Number(num).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * 保存
 */
function saveData() {
  return new Promise((resolve, reject) => {
    let data = totalDataSource.value.map((item) => {
      return { 
        htbh: props.htbh,
        htlsh: router.currentRoute.value.query.htlsh,
        jscs: item.jscsStr,
        jsfj: item.jsfjStr,
        jsmj: item.jsmjStr,
        sybl: item.syblStr,
        syje: item.syjeStr,
        sxh: item.sxh
      }
    })
    defHttp.post({ url: api.save, data: data }, { withToken: true }).then((res) => {
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

defineExpose({
  saveData
})

</script>

<style scoped lang="less">
.syj-jf-detail {
  margin-bottom: 10px;
}
</style>