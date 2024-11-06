<template>
  <CImaginForm v-if="show" :id="id"></CImaginForm>
</template>
<script lang="ts">
export default {
  name: 'Design'
}
</script>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
import { defHttp } from '/@/utils/http/axios';

const route = useRoute();
const code = ref(route.params?.code.toString());
let id = Number.parseInt(code.value)
let show = ref(false)
enum api {
  unlockFormUrl = '/api/zrzy-form/form/unlockForm',
}
onMounted(() => {
  // 参数初始化完成后再加载设计器 解决切换报错问题
  show.value = true
})
/**
 * 解锁
 * @param record
 */
function unLock() {
  defHttp.post({ url: api.unlockFormUrl, params: { id: id } }, { withToken: true }).then((res) => {
    if (res.success) {
      // console.log('res',res)
    } else {
      message.error(res.message)
    }
  })
}

onBeforeUnmount(() => {
  unLock()
})
</script>

<style scoped lang="less"></style>
