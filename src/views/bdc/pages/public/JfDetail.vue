<template>
  <div class="jf-detail">
    <a-button style="margin-bottom: 10px; float: right" @click="handelAdd">新增</a-button>
    <a-table :columns="columns" :data-source="jfxx" size="small" :loading="loading" :pagination="false" style="padding-bottom: 8px">
      <template #headerCell="{ title, column }">
        <template v-if="column.rules?.find(r => r.required)">
          <span class="required-text">{{ title }}</span>
        </template>
        <span v-else>{{ title }}</span>
      </template>
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'action'">
          <a-popconfirm :disabled="column.disabled" cancel-text="取消" ok-text="确定" title="是否确定删除该项？"
                        @confirm="handleDel(record, index)">
            <a-button type="link">删除</a-button>
          </a-popconfirm>
        </template>
        <template v-else-if="column.key === 'jfxm'">
          <a-select style="width: 100%;" v-model:value="record.sfxbh" :options="jfxmOptions" :disabled="column.disabled" :dropdownMatchSelectWidth="false"
                    :placeholder="'请选择' + column.title" :field-names="{ label: 'sfxmc', value: 'sfxbh' }" @change="(value) => handleChangeSfxbh(value, column, record)"></a-select>
        </template>
        <template v-else-if="['sl','sfjs','sfsx','jme','yse'].includes(column?.key)">
          <a-tooltip :trigger="['focus','contextmenu']" placement="bottom" :arrow="false" color="red">
            <template v-if="record[column.dataIndex + 'StatusMsg']" #title>
              <span>{{ record[column.dataIndex + 'StatusMsg'] }}</span>
            </template>
            <a-input-number :status="record[column.dataIndex + 'Status']" style="width: 100%" v-model:value="record[column.key]" :disabled="column.disabled" :placeholder="'请输入' + column.title"
                            @focus="setInputStatus(column, record)" @change="(value) => handleChangeValue(value, column, record)"/>
          </a-tooltip>
        </template>
        <template v-else>
          <a-input style="width: 100%; min-width: 100px" v-model:value="record[column.key]" :disabled="column.disabled" :placeholder="'请输入' + column.title"></a-input>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { validateRules, setInputStatus } from "/@/views/online/utils/commonUtils"
import { useRoute } from "vue-router"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
const route = useRoute()
const columns = [
  {
    title: '缴费项目',
    dataIndex: "jfxm",
    key: 'jfxm',
    width: 150
  }, {
    title: '数量',
    dataIndex: "sl",
    key: 'sl',
    width: 80,
    rules: [{ required: true, message: '请输入数量' },{ pattern: /^([1-9]\d*|0)$/, message: '请输入数量' }]
  }, {
    title: '收费标准',
    dataIndex: "sfjs",
    key: 'sfjs',
    width: 100,
    rules: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }]
  },{
    title: '收费上限',
    dataIndex: "sfsx",
    key: 'sfsx',
    width: 100,
    rules: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }]
  },{
    title: '减免金额',
    dataIndex: "jme",
    key: 'jme',
    width: 100,
    rules: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }]
  },{
    title: '减免原因',
    dataIndex: "jmyy",
    key: 'jmyy',
  },{
    title: '备注',
    dataIndex: "bz",
    key: 'bz',
  },{
    title: '应缴金额',
    dataIndex: "yse",
    key: 'yse',
    width: 100,
    disabled: true,
    rules: [{ pattern: /^(0|([1-9][0-9]*)|([0]\.\d{0,2}|[1-9][0-9]*\.\d{0,2}))$/, message: '必须是金额' }]
  },{
    title: '操作',
    dataIndex: "action",
    key: 'action',
    width: 80
  }
]

// 缴费信息
let jfxx = ref<any>([])
// 缴费项目
let jfxmOptions = ref<any>([])
// loading
let loading = ref<any>(false)

let props = defineProps({
  viewData: {
    type: Object,
    default: {}
  }
})
enum api {
  getOptions = '/api/zrzy-bdc/bdc/sfconfig/queryAllList',
//  list = '/api/zrzy-bdc/bdc/sfx/list',
  list = '/api/zrzy-bdc/bdc/sf/getChargeDetials',
  del = '/api/zrzy-bdc/bdc/sfx/delete',
  save = '/api/zrzy-bdc/bdc/sfx/saveOrUpdate'
}

const emit = defineEmits(['getYjje'])

onMounted(() => {
  getJfxmOptions()
  initData()
})

/**
 * 获取缴费项目配置
 */
function getJfxmOptions() {
   defHttp.get({ url: api.getOptions }, { withToken: true }).then((res) => {
    if (res && res.success) {
      jfxmOptions.value = res.result
    }
  })
}

/**
 * 获取数据
 */
function initData() {
  let slbh = route.query.slbh
  defHttp.get({ url: api.list, params: { slbh: slbh } }, { withToken: true }).then((res) => {
    if (res && res.success) {
      jfxx.value = res.result
      getYjje()
    }
  })
}

/**
 * 应缴金额
 */
function getYjje() {
  let jfje = 0
  jfxx.value.forEach(item => {
    jfje += item.yse || 0
  })
  emit('getYjje',jfje)
  return jfje
}



/**
 * 添加
 */
function handelAdd() {
  jfxx.value.push({})
}

/**
 * 移除
 * @param record
 */
function handleDel(record, index) {
  if (record.id) {
    defHttp.get({ url: api.del, params: { id: record.id } }, { withToken: true }).then((res) => {
      if (res) {
        jfxx.value.splice(index, 1)
        getYjje()
        message.success('删除成功')
      } else {
        message.error('删除失败')
      }
    })
  } else {
    jfxx.value.splice(index, 1)
    getYjje()
  }
}

/**
 * 数据变化
 * @param value
 * @param callback
 */
function handleChangeValue(value, column, record) {
  if (column.key == 'sl' || column.key == 'jme' || column.key == 'sfjs') {
    record.yse = (record.sl || 0) * (record.sfjs || 0) - (record.jme || 0)
  }
  getYjje()
  setInputStatus(column, record)
}

/**
 * 选择缴费项目
 * @param value
 * @param column
 * @param record
 */
function handleChangeSfxbh(value, column, record) {
  let find = jfxmOptions.value.find(item => item.sfxbh == value)
  if (find) {
    record.sfsx = find.sfsx
    record.sfjs = find.sffy
    record.sfxmc = find.sfxmc
  }
  record.yse = (record.sl || 0) * (record.sfjs || 0) - (record.jme || 0)
  getYjje()
}

function saveData() {
  return new Promise((resolve, reject) => {
     if (validateTable()) {
      let params = jfxx.value.map((item) => {
        let ruleColumn = columns.filter((column: any) => column.rules)
        for (let i = 0; i < ruleColumn.length; i++) {
          delete item[ruleColumn[i].dataIndex + 'Status']
        }
        item.slbh = route.query.slbh
        // item.sse = props.viewData?.BDC_SF?.SFJE
        item.sfsm = props.viewData?.bdc_sf?.bz
        return item
      })
       defHttp.post({
          url: api.save,
          data: params
      }, { withToken: true }).then((res) => {
          if (res && res.success) {
            resolve(true)
            initData()
          } else {
            resolve(false)
          }
       })
    } else {
        resolve(false)
     }
  })
}

/**
 * 列表校验
 */
function validateTable() {
  for (let i = 0; i < jfxx.value.length; i++) {
    let record = jfxx.value[i]
    let ruleColumn = columns.filter((column: any) => column.rules)
    for (let j = 0; j < ruleColumn.length; j++) {
      setInputStatus(ruleColumn[j], record)
      if (record[ruleColumn[j].dataIndex+ 'Status'] == 'error') {
        message.warning('请检查缴费信息填写')
        return false
      }
    }
  }
  return true
}

defineExpose({
  getYjje,
  saveData
})
</script>

<style lang="less" scoped>
@import url('/@/assets/less/form.less');
</style>
