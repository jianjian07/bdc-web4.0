<template>
  <div :class="{'scroll-container': true, scrollable: scrollable}" ref="scrollRef">
    <a-list item-layout="horizontal" :data-source="scrollList">
      <template #renderItem="{ item }">
        <a-list-item @click="showModal(item)" :style="{height: itemHeight + 'px'}" @mouseover="toggleAnimation(false)" @mouseleave="toggleAnimation(true)">
          <a-list-item-meta>
            <template #description>
              <div style="display: flex; justify-content: space-between;">
                <div style="width: 100%; overflow: hidden; display: flex; flex-wrap: nowrap;">
                  <a-tag color="red" v-if="item.priority == 'H'">高</a-tag>
                  <a-tag color="yellow" v-if="item.priority == 'M'">中</a-tag>
                  <a-tag color="green" v-if="item.priority == 'L'">低</a-tag>
                  <a-tooltip :title="item.msgAbstract">
                    <span class="text-ellipsis">{{  item.msgAbstract }}</span>
                  </a-tooltip>
                  </div>
                <div style="width: 350px; padding-left: 5px; text-overflow: ellipsis;overflow: hidden;white-space: nowrap;" v-if="item.sendTime">发布时间：{{ item.sendTime }}</div>
              </div>
            </template>
            <template #title>
              <a style="color: #333">{{ item.title }}</a>
            </template>
            <template #avatar>
              <!-- <svg-icon  :name="item.msgCategory == '1' ? 'tzgg' : item.msgCategory == '2' ? 'xttz' : item.msgCategory == '3' ? 'gsgg' : 'qttz'" width="30px" height="30px" ></svg-icon> -->
              <svg-icon :name="category ? 'qttz' : 'tzgg'"  width="30px" height="30px" ></svg-icon>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { defHttp } from "/@/utils/http/axios"
import { cModal } from "/@/components/cModal/index"

enum api {
  tasklist = '/api/zrzy-system/sys/sysTzgg/list',
}

let scrollRef: any = ref(null)
let spinning: any = ref(false)
let dataList: any = ref([])
let scrollList: any = ref([])
let running: any = ref(true)
let animId: any = ref(null)
let top = 0;
let index = 0
let itemHeight: any = ref(70)
let scrollable: any = ref(false)

const props = defineProps({
  category: {
    type: String,
    default: null
  }
})

watch(() => props.category, (val) => {
  if(val) {
    itemHeight.value = 70
  }
  loadData()
}, {
  immediate: true
})

onMounted(() => {
  top = 0
  index = 0
  watch(() => dataList.value, (val) => {
    if (val?.length) {
      if (dataList.value.length > (Math.ceil(scrollRef.value?.offsetHeight / itemHeight.value) || 3)) {
        scroll()
      } else {
        scrollable.value = true
      }
    }
  }, {
    immediate: true
  })
})


const scroll = () => {
  scrollRef.value?.scrollTo({
    top: top++
  })

  if(top % itemHeight.value === 0) {
    const target = scrollList.value[index]
    scrollList.value.push(target)

    if(index < (dataList.value.length - 1)) {
      index++
    } else {
      top = 0
      index = 0
      scrollRef.value?.scrollTo({
        top: 0
      })
      scrollList.value = [ ...dataList.value ]
    }
  }
  if(running.value) {
    animId.value = requestAnimationFrame(scroll)
  }
}

function toggleAnimation(flag: any) {
  if(dataList.value.length <= (Math.ceil(scrollRef.value?.offsetHeight / itemHeight.value) || 3)) {
    return 
  }
  running.value = flag
  if(running.value) {
    scroll()
  } else {
    cancelAnimationFrame(animId)
  }
}

function loadData() {
  spinning.value = true
  defHttp.get({ 
    url: api.tasklist, 
    params: {
      pageNo: 1,
      pageSize: 100,
      msgCategory: props.category
    }, 
  }, { withToken: true }).then(res => {
      if (res.success) {
          const result: any = res.result
          dataList.value = result.records
          scrollList.value = [...dataList.value]
      }
      spinning.value = false
  }).catch(() => {
      spinning.value = false
  })
}

function showModal(record: any) {
  let modal = cModal({
    title: `查看【${record.title}】`,
    width: 1000,
    filePath: 'views/system/tzgg/components/tzggModal',
    footer: false,
    formData: {
      type: 'view',
      record: record
    },
    onOk: async () => {
      modal.destroy()
    },
    onCancel: () => {
      modal.destroy()
    }
  })
}
</script>

<style lang="less" scoped>
.scroll-container {
  overflow: hidden;
  height: 100%;
  :deep(.ant-list-item) {
    padding: 10px 0px !important;
  }
  :deep(.ant-list-item-meta) {
    align-items: center !important;
  }
}
.scrollable {
  overflow: auto;
}

.text-ellipsis {
  flex: 1; /* 定义容器宽度 */
  white-space: nowrap; /* 确保文本在一行内显示 */
  overflow: hidden; /* 隐藏超出容器的内容 */
  text-overflow: ellipsis; /* 使用省略号表示被截断的文本 */
}
</style>