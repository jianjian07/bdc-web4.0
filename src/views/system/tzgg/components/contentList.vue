<template>
  <div class="scroll-container" ref="scrollRef">
    <a-list item-layout="horizontal" :data-source="scrollList">
      <template #renderItem="{ item }">
        <a-list-item @click="showModal(item)" style="height: 80px" @mouseover="toggleAnimation(false)" @mouseleave="toggleAnimation(true)">
          <a-list-item-meta
          >
            <template #description>
              <a-tag color="red" v-if="item.priority == 'H'">高</a-tag>
              <a-tag color="yellow" v-if="item.priority == 'M'">中</a-tag>
              <a-tag color="green" v-if="item.priority == 'L'">低</a-tag>
              <span>{{  item.msgAbstract }}</span>
            </template>
            <template #title>
              <a>{{ item.title }}</a>
            </template>
            <template #avatar>
              <svg-icon  :name="item.msgCategory == '1' ? 'tzgg' : item.msgCategory == '2' ? 'xttz' : item.msgCategory == '3' ? 'gsgg' : 'qttz'" width="30px" height="30px" ></svg-icon>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { defHttp } from "/@/utils/http/axios"
import { cModal } from "/@/components/cModal/index"

enum api {
  tasklist = '/api/zrzy-bdc/sys/sysTzgg/list',
}

let scrollRef: any = ref(null)
let spinning: any = ref(false)
let dataList: any = ref([])
let scrollList: any = ref([])
let running: any = ref(false)
let animId: any = ref(null)
let top = 0;
let index = 0

loadData()

onMounted(() => {
  scroll()
})

const scroll = () => {
  scrollRef.value.scrollTo({
    top: top++
  })

  if(top % 80 === 0) {
    const target = scrollList.value[index]
    scrollList.value.push(target)

    if(index < dataList.value.length - 1) {
      index++
    } else {
      top = 0
      index = 0
      scrollRef.value.scrollTo({
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
      pageSize: 100
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
      modal.close()
    }
  })
}
</script>

<style lang="less" scoped>
.scroll-container {
  overflow: hidden;
  height: 150px;
}
</style>