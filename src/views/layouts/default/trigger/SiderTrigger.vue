<template>
    <span @click="toggleCollapsed" style="padding:0 20px">
        <MenuUnfoldOutlined v-if="getCollapsed" :style="{ fontSize: '16px' }" />
        <MenuFoldOutlined v-else :style="{ fontSize: '16px' }" />
    </span>
</template>
<script lang="ts" setup>
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
const { getCollapsed, toggleCollapsed } = useMenuSetting();

</script>
  