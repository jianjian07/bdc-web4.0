<template>
    <div v-for="(item) in flowList">
        <a @click="onClick(item)"> {{ item.procName }}</a>
    </div>

</template>

<script setup lang="ts">
import { addFlow, getDegisnList } from '/@/views/bdc/utils/case'
function onClick(item: any) {
    const params = {
        regType: '0101',
        guid: item.procKey
    }
    addFlow(params)
}

let flowList: any = await getDegisnList()

</script>

<style scoped lang="less"></style>