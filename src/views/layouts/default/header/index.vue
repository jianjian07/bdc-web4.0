<template>
    <layout-header style="background: #fff; padding: 0;height: 48px;line-height: 48px;border-bottom: 1px solid #eee;">
        <div style="display: flex;padding: 0 8px;align-items: center;">
            <sider-trigger></sider-trigger>
            <div style="font-size: 20px;font-weight: 600;letter-spacing: 0.1em;">不动产登记系统</div>
            <div style="position: absolute;right: 20px;">
                <a-dropdown class="oper-css">
                    <div class="ant-dropdown-link" @click.prevent>
                        <img style="border-radius: 50%;width: 30px;height: 30px;" :src="getAvatarUrl" />
                        <span style="margin-left: 10px;">{{ userInfo.realname }}</span>
                    </div>
                    <template #overlay>
                        <a-menu>
                            <a-menu-item key="1" @click="logOut"><poweroff-outlined />
                                <span style="margin:10px;">退出系统</span>
                            </a-menu-item>
                            <a-menu-item key="2" @click="toggleTabs"><poweroff-outlined />
                                <span style="margin:10px;">标签页</span>
                            </a-menu-item>
                            <a-menu-item key="2"><key-outlined />
                                <span style="margin:10px;">修改密码</span>
                            </a-menu-item>
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
import { PoweroffOutlined, KeyOutlined } from '@ant-design/icons-vue';
import { computed } from 'vue';
import { getUrl } from '/@/utils';
import { useUserStore } from '/@/store/modules/user';
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
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
.oper-css {
    padding: 0 10px;
}

.oper-css:hover {
    cursor: pointer;
    background-color: #e5e7eb;
}
</style>
