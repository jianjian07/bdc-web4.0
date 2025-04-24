<template>
  <div class="node-line-list">
    <a-row style="padding: 10px">
      <a-col v-if="nodeList && nodeList.length" :span="3">
        <a-tabs v-model:activeKey="activeKey" class="tab-left" default-active-key size="small" tab-position="left"
                @change="nodeClick">
          <a-tab-pane v-for="item in nodeList" :key="item.processNodeCode" :tab="item.processNodeName"
                      class="tab-panel"/>
        </a-tabs>
      </a-col>
      <a-col :span="(nodeList && nodeList.length) ? 21 : 24">
        <a-row>
          <a-col :span="12">
            <a-form-item label="移交规则">
              <a-select v-model:value="transferRule" :fieldNames="{ label: 'ruleName', value: 'ruleCode'}"
                        :maxTagCount="5"
                        :options="userStore.getTransferRuleList"
                        mode="multiple">
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row style="width: 100%;display: block">
          <a-table :columns="columns" :data-source="lineRule" :pagination="false" bordered>
            <template #bodyCell="{ column, text, record, index }">
              <template v-if="column.dataIndex == 'ruleArr'">
                <a-select v-model:value="record[column.dataIndex]" :fieldNames="{ label: 'ruleName', value: 'ruleCode'}"
                          :maxTagCount="5" :options="userStore.getLineRuleList" mode="multiple" style="width: 100%">
                </a-select>
              </template>
            </template>
          </a-table>
        </a-row>
        <div style="margin-top: 20px; text-align: center">
          <a-button type="primary" @click="saveRule">保存</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { useUserStore } from "/@/store/modules/user"
import { cloneDeep } from "lodash-es"
import { message } from "ant-design-vue"

const userStore = useUserStore()

let props = defineProps({
  lcid: {
    type: String,
    default: ""
  },
  baseInfo: {
    type: Object,
    default: null
  }
})

enum api {
  nodelistUrl = '/api/zrzy-bdc/act/process/extActProcessNode/list',
  lineList = '/api/zrzy-bdc/act/process/extActProcess/getAllLine',
  getRuleList = '/api/zrzy-bdc/node/list',
  save = '/api/zrzy-bdc/node/saveAllByJdid'
}

let nodeList = ref([])
let lcid = ref(props.lcid)
let jdid = ref()
let activeKey = ref()
// 所有集合
let list = ref<any>([])
// 移交规则
let transferRule = ref<any>([])
// 线规则
let lineRule = ref<any>([])
// 列
const columns = [
  { title: "线id", dataIndex: "lineid", width: '200px', align: 'center' },
  { title: "线名称", dataIndex: "linename", align: 'center' },
  { title: "线规则", dataIndex: "ruleArr", align: 'center', width: '300px' }
]

/**
 * 节点点击
 */
function nodeClick(key: any) {
  jdid.value = key
}

watch(() => props.lcid, (newValue, _oldValue) => {
  lcid.value = newValue
  getNode()
})

watch(() => jdid.value, async (newVal) => {
  await getList()
  getLineList()
})

onMounted(() => {
  getNode()
})

/**
 * 获取节点信息
 */
function getNode() {
  return new Promise((resolve, reject) => {
    jdid.value = ''
    defHttp.get({ url: api.nodelistUrl, params: { processId: lcid.value } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        nodeList.value = res.result
        if (res.result.length) {
          jdid.value = res.result[0].processNodeCode
          activeKey.value = res.result[0].processNodeCode
        }
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * 查询数据
 */
function getList() {
  return new Promise((resolve, reject) => {
    if (lcid.value && jdid.value) {
      defHttp.get({
        url: api.getRuleList,
        params: { lcid: lcid.value, jdid: jdid.value }
      }, { withToken: true }).then((res) => {
        if (res && res.success) {
          list.value = res.result.records
          let findNode = list.value.find(f => f.type == 'node')
          transferRule.value = (findNode && findNode.handoverrule) ? (findNode.handoverrule.includes(',') ? findNode.handoverrule.split(',') : [findNode.handoverrule]) : []
        } else {
          message.warning(res.message)
        }
        resolve(true)
      })
    }
  })
}


/**
 * 获取线数据
 */
function getLineList() {
  if (lcid.value && jdid.value) {
    defHttp.post({
      url: api.lineList,
      params: { lcid: lcid.value, jdid: jdid.value }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        let findLine = list.value.filter(f => f.type == 'line')
        lineRule.value = res.result.map((line) => {
          let rule = getRuleName(line, findLine)
          return {
            lineid: line.id,
            linename: getLineName(line.sourceRef, line.targetRef),
            rule: rule,
            ruleArr: rule ? (rule.includes(',') ? rule.split(',') : [rule]) : []
          }
        })
      } else {
        message.warning(res.message)
      }
    })
  }

}

/**
 * 获取线名称
 * @param source
 * @param target
 */
function getLineName(source, target) {
  let findSource = nodeList.value.find(f => f.processNodeCode == source)?.processNodeName || source
  let findTarget = nodeList.value.find(f => f.processNodeCode == target)?.processNodeName || target
  return findSource + '→' + findTarget
}

/**
 * 获取线规则名称
 * @param line
 */
function getRuleName(line, lines) {
  let find = lines.find(l => l.lineid == line.id)
  return find ? find.rule : ''
}

/**
 * 保存
 */
function saveRule() {
  const { lcmc } = props.baseInfo
  const currentJdid = jdid.value
  const currentJdmc = nodeList.value.find(f => f.processNodeCode === currentJdid)?.processNodeName || ''
  const currentLcid = lcid.value
  let node = {
    handoverrule: transferRule.value.join(','),
    id0: list.value.find(f => f.type == 'node')?.id0,
    jdid: currentJdid,
    jdmc: currentJdmc,
    lcid: currentLcid,
    lcmc: lcmc,
    type: "node"
  }
  let lines = lineRule.value.filter(line => line.linename)
  if (lines && lines.length) {
    lines = lines.map((line) => {
      return {
        jdid: currentJdid,
        jdmc: currentJdmc,
        lcid: currentLcid,
        lcmc: lcmc,
        lineid: line.lineid,
        linename: line.linename,
        rule: line.ruleArr?.join(',') || '',
        type: "line"
      }
    })
  }
  let data = [
    node,
    ...lines
  ]

  defHttp.post({
    url: api.save,
    data: data
  }, { withToken: true }).then((res) => {
    if (res && res.success) {
      message.success('保存成功')
    } else {
      message.warning('保存失败')
    }
  })
}

</script>

<style lang="less" scoped>

</style>