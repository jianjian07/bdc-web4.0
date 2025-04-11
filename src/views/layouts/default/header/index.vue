<template>
    <layout-header style="background: #fff; padding: 0;height: 48px;line-height: 48px;border-bottom: 1px solid #eee;">
        <div style="display: flex;padding: 0 8px;align-items: center;">
            <sider-trigger></sider-trigger>
            <div style="font-size: 20px;font-weight: 600;letter-spacing: 0.1em;">不动产登记信息管理系统</div>
            <div class="icons-list" style="position: absolute;right: 20px;display: flex;">
                <c-notice></c-notice>
                <a-dropdown class="oper-css">
                    <div class="ant-dropdown-link" @click.prevent>
                        <img style="border-radius: 50%;width: 25px;height: 25px;margin-top: -5px;"
                            :src="getAvatarUrl" />
                        <span style="margin-left: 10px;">{{ userInfo.realname }}</span>
                    </div>
                    <template #overlay>
                        <a-menu>
                            <a-menu-item key="1" @click="logOut"><poweroff-outlined />
                                <span style="margin:10px;">退出系统</span>
                            </a-menu-item>
                            <a-menu-item key="2" @click="toggleTabs">
                                <TagsOutlined />
                                <span style="margin:10px;">标签页</span>
                            </a-menu-item>
                            <a-menu-item key="3" @click="toggleBlackWhite">
                                <SyncOutlined />
                                <span style="margin:10px;">切换主题</span>
                            </a-menu-item>
                            <!-- <a-menu-item key="3"><key-outlined />
                                <span style="margin:10px;">修改密码</span>
                            </a-menu-item> -->
                        </a-menu>
                    </template>
                </a-dropdown>

            </div>
        </div>

    </layout-header>
</template>
<script setup lang="ts">
import { LayoutHeader, Modal } from 'ant-design-vue';
import SiderTrigger from './../trigger/SiderTrigger.vue'
import { PoweroffOutlined, TagsOutlined, SyncOutlined } from '@ant-design/icons-vue';
import { computed, defineAsyncComponent } from 'vue';
import { getUrl } from '/@/utils';
import { useUserStore } from '/@/store/modules/user';
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { toggleBlackWhite } from "/@/settings/initSetting"
const CNotice = defineAsyncComponent(() => import("/@/views/layouts/default/header/Notice.vue"));
const userStore = useUserStore();
const userInfo = userStore.getUserInfo
const { toggleShowTabs } = useTabsSetting()
/**
 * 退出
 */
function logOut() {
    Modal.confirm({
        title: '温馨提示',
        content: `是否确认退出系统?`,
        onOk() {
            userStore.logout(true);
        }
    })
}

/**
 * 是否显示标签页
 */
function toggleTabs() {
    toggleShowTabs()
}
/**
 * 头像  临时固定
 */
const getAvatarUrl = computed(() => {
    return getUrl('images/user/photo.png')
});
</script>
<style lang="less" scoped>
@import url("./index.less");

.icons-list :deep(.anticon) {
    font-size: 20px;
}
</style>
