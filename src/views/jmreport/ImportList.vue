<template>
  <div class="import-list">
    <a-table :columns="columns" :data-source="listData" :pagination="false" row-key="id" :rowSelection="rowSelection" bordered
             size="small">
      <template #bodyCell="{ column, text, record, index }">
        <div v-if="column.dataIndex == 'isExist'">
          {{ record.existsList.length ? '是' : '否' }}
        </div>
        <div v-if="column.dataIndex == 'existsList'">
          {{ getExistsList(record.existsList) }}
        </div>
        <div v-if="column.dataIndex == 'importType'">
          <template v-if="record.checked">
            <a-select v-model:value="record[column.dataIndex]" style="width: 100%"
                      :options="getImportTypeOptions(record.existsList)">
            </a-select>
          </template>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue"
import { message } from "ant-design-vue"

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    key: 'id'
  }, {
    title: '报表名称',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: '是否已存在',
    dataIndex: 'isExist',
    key: 'isExist'
  }, {
    title: '已存在集合',
    dataIndex: 'existsList',
    key: 'existsList'
  }, {
    title: '导入类型',
    dataIndex: 'importType',
    key: 'importType',
    width: 150
  }
]

let selectedKeys = ref<any>([])
let selectedRows = ref<any>([])
let listData = ref<any>([])

const rowSelection = computed(() => {
  return {
    mode: 'checkbox',
    selectedRowKeys: selectedKeys.value,
    onChange: (selectedRowKeys: any, selectRows: any) => {
      selectedKeys.value = selectedRowKeys
      selectedRows.value = selectRows
    },
    onSelect(record: any, selected: any) {
      record.checked = selected
      if (!record.checked) {
        record.importType = null
      }
    },
    onSelectAll(selected: any, _selectionRows: any, changeRows: any) {
      changeRows.forEach(row => {
        row.checked = selected
      })
    }
  }
})

watch(() => props.formData.validateList, (newVal) => {
  listData.value = newVal
  initData()
}, {
  immediate: true,
  deep: true
})

/**
 * 初始化
 */
function initData() {
  listData.value = listData.value.map((tree) => {
    tree.checked = tree.defaultChecked
    if (tree.defaultChecked) {
      tree.importType = '1'
    }
    return tree
  })
  
  selectedKeys.value = listData.value.filter(tree => tree.checked).map(m => m.id)
  selectedRows.value = listData.value.filter(tree => tree.checked)
}

/**
 * 获取重复列表集合
 * @param list
 */
function getExistsList(list) {
  let str = ''
  let arr = []
  if (list.length) {
    for (let i = 0; i < list.length; i++) {
      arr.push(`${list[i].name}(${list[i].id})`)
    }
    str = arr.join(',')
  }
  return str
}

/**
 * 获取导入类型
 * @param list
 */
function getImportTypeOptions(list) {
  const options = [
    list.length
      ? { label: '覆盖', value: '2' }
      : { label: '新增', value: '1' },
    { label: '副本', value: '3' }
  ]
  return options
}

defineExpose({
  selectedRows
})
</script>

<style lang="less" scoped>

</style>