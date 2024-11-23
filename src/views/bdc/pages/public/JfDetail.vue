<template>
  <div class="jf-detail">
    <a-button style="margin-bottom: 10px" @click="handelAdd">新增</a-button>
    <a-table :columns="columns" :data-source="jfxx" size="small" :loading="loading">
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
          <a-select style="width: 100%;" v-model:value="record.jfxbh" :options="jfxmOptions" :disabled="column.disabled" :placeholder="'请选择' + column.title"></a-select>
        </template>
        <template v-else-if="['sl','sfbz','sfsx','jme','yse'].includes(column?.key)">
          <a-tooltip :trigger="['focus','contextmenu']" placement="bottom" :arrow="false" color="red">
            <template v-if="validateRules(column.rules, record[column.key])" #title>
              <span>{{ validateRules(column.rules, record[column.key]) }}</span>
            </template>
            <a-input-number :status="record[column.key + 'Status']" style="width: 100%;" v-model:value="record[column.key]" :disabled="column.disabled" :placeholder="'请输入' + column.title" 
                            @focus="setInputStatus(column, record)" @change="(value) => handleChangeValue(value, column, record)"/>
          </a-tooltip>
        </template>
        <template v-else>
          <a-input style="width: 100%;" v-model:value="record[column.key]" :disabled="column.disabled" :placeholder="'请输入' + column.title"></a-input>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { defineExpose, onMounted, ref } from 'vue'
import { validateRules, setInputStatus } from "/@/utils/form/commonUtils"
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
    dataIndex: "sfbz",
    key: 'sfbz',
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
    width: 150
  },{
    title: '备注',
    dataIndex: "bz",
    key: 'bz',
    width: 100
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
    key: 'action'
  }
]

// 缴费信息
let jfxx = ref<any>([])
// 缴费项目
let jfxmOptions = ref<any>([])
// loading
let loading = ref<any>(false)

/**
 * 获取缴费项目配置
 */
function getJfxmOptions() {
  
}

/**
 * 获取数据
 */
function initData() {
  
}

/**
 * 应缴金额
 */
function getYjje() {
  let jfje = 0
  jfxx.value.forEach(item => {
    jfje += item.yse
  })
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
    // todo
  } else {
    jfxx.value.splice(index, 1)
  }
}

/**
 * 数据变化
 * @param value
 * @param callback
 */
function handleChangeValue(value, column, record) {
  if (column.key == 'sl' || column.key == 'jme' || column.key == 'sfbz') {
    record.yse = (record.sl || 0) * (record.sfbz || 0) - (record.jme || 0)
  }
  setInputStatus(column, record)
}

defineExpose({
  getYjje
})
</script>

<style lang="less" scoped>
@import url('/@/assets/less/form.less');
</style>