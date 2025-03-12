<template>
  <!--    <h1>我是redirect页</h1>-->
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { useRouter } from "vue-router"

export default defineComponent({
  name: 'Redirect',
  setup() {
    const router = useRouter();
    const replaceRoute = (url: string, query: Record<string, any>) => {
      router.replace({ path: url, query, name });
    }
    return {
      replaceRoute
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm: any) => {
      vm.replaceRoute(from.fullPath, from.query, from.name);
    })
  }
})
</script>