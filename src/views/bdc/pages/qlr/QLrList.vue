<template>
    <a-table :dataSource="dataSource" :columns="columns" >
        <template #title>权利人信息</template>
    </a-table>
</template>

<script setup lang="ts">
let dataSource = [
    {
        key: '1',
        name: '张三',
        zjh: '1234567899',
        address: '西湖区湖底公园1号',
    },
    {
        key: '2',
        name: '李四',
        zjh:  '1234567899',
        address: '西湖区湖底公园1号',
    },
]

const columns = [
    {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '证件号',
        dataIndex: 'zjh',
        key: 'zjh',
    },
    {
        title: '住址',
        dataIndex: 'address',
        key: 'address',
    },
]
</script>

<style scoped lang="less">

</style>