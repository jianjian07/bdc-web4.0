<template>
  <div class="look-kg-lpb">
    <div class="lpb-content" v-for="(value,key) in list">
      <template v-if="list[key].length">
         <table style="margin: auto">
            <thead>
              <tr class="title">
                <td :colspan="maxHs + 1" id="divtitle"
                  style="border: 0;background-color: #39bd8a;border-radius: 26px 26px 0px 0px; /* 去掉右下角的圆角 */">
                  {{ key == 'zmList' ? '正面' : '反面' }}
                </td>
              </tr>
              <tr class="title">
                <td></td>
                <td v-for="(item, index) in maxLs" :key="'ls' + index">{{ item }}列</td>
              </tr>
            </thead>
            <tbody class="ant-table-tbody">
              <tr v-for="hs in maxHs" :key="hs">
                <td class="title">{{ hs }}行</td>
                <template v-for="ls in maxLs" :key="hs.toString() + ls">
                  <td v-for="(info) in list[key].filter((t: any) => Number(t.pjzh) == ls && Number(t.pjjh) == hs)" 
                      :key="info.pjjh + '-' + info.pjzh">
                    <div style="display: flex;flex-direction: column">
                      <span>{{ info.code }}</span>
                      <span>{{ info.name }}</span>
                    </div>
                  </td>
                </template>
              </tr>
            </tbody>
         </table>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})

let list = ref<any>({
  zmList: [],
  fmList: []
})
// 最大行数
let maxHs = ref<number>(0)
// 最大列数
let maxLs = ref<number>(0)

enum api {
  getLpb = '/api/zrzy-bdc/arch/arch/kgLpb'
}

onMounted(() => {
  initData()
})

/**
 * 初始化id
 */
function initData() {
  let id = props.formData.id
  defHttp.get({ url: api.getLpb, params: { pjid: id } }, { withToken: true }).then((res: any) => {
    if (res && res.success) {
      list.value.zmList = res.result.zmKgList || []
      list.value.fmList = res.result.fmKgList || []
      maxLs.value = res.result.zs 
      maxHs.value = res.result.js
    } else {
      message.warning(res?.message)
    }
  })
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

.look-kg-lpb {
  width: 100%;
}

.lpb-content {
  margin-bottom: 10px;
  text-align: center;
}
</style>