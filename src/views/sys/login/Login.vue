<template>
    <div class="dl-root" v-if="showLogin">
        <!-- 左侧 品牌 / 数据可视化展示区 -->
        <div class="dl-hero">
            <div class="dl-hero-deco">
                <span class="dl-ring dl-ring-1"></span>
                <span class="dl-ring dl-ring-2"></span>
                <span class="dl-ring dl-ring-3"></span>
                <div class="dl-sheen"></div>
            </div>

            <!-- 数据网络拓扑 -->
            <svg class="dl-net" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g stroke="rgba(150,190,255,0.18)" stroke-width="1">
                    <line v-for="(l, i) in links" :key="'l' + i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" />
                </g>
                <g>
                    <circle v-for="(n, i) in nodes" :key="'n' + i" :cx="n.x" :cy="n.y" :r="n.r"
                        :fill="n.accent ? '#5b8cff' : 'rgba(180,205,255,0.55)'"
                        :class="['dl-node', { 'dl-node-accent': n.accent }]"
                        :style="{ animationDelay: (i % 7) * 0.4 + 's' }" />
                </g>
            </svg>

            <div class="dl-hero-content">
                <div class="dl-brand">
                    <span class="dl-logo">
                        <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                            <ellipse cx="16" cy="8" rx="11" ry="4.4" stroke="currentColor" stroke-width="2" />
                            <path d="M5 8v16c0 2.4 4.9 4.4 11 4.4S27 26.4 27 24V8" stroke="currentColor"
                                stroke-width="2" />
                            <path d="M5 16c0 2.4 4.9 4.4 11 4.4S27 18.4 27 16" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </span>
                    <span class="dl-brand-name">{{ title }}</span>
                </div>

                <h1 class="dl-hero-title">数据中台</h1>
                <p class="dl-hero-sub">统一数据资产 · 智能治理 · 全景洞察</p>
            </div>

            <div class="dl-copyright">© {{ year }} 不动产登记信息管理系统 · 数据中台</div>
        </div>

        <!-- 右侧 登录表单区 -->
        <div class="dl-form-wrap">
            <div class="dl-form-card">
                <div class="dl-form-head">
                    <div class="dl-form-badge">
                        <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
                            <ellipse cx="16" cy="8" rx="11" ry="4.4" stroke="currentColor" stroke-width="2" />
                            <path d="M5 8v16c0 2.4 4.9 4.4 11 4.4S27 26.4 27 24V8" stroke="currentColor"
                                stroke-width="2" />
                            <path d="M5 16c0 2.4 4.9 4.4 11 4.4S27 18.4 27 16" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </div>
                    <h2>登录数据中台</h2>
                    <p>欢迎回来，请使用统一账号登录</p>
                </div>

                <a-form ref="formRef" :model="formData" layout="vertical" class="dl-form">
                    <a-form-item label="账号" name="username" :rules="[{ required: true, message: '请输入账号' }]">
                        <a-input v-model:value="formData.username" size="large" placeholder="请输入账号 / 手机号" allow-clear>
                            <template #prefix>
                                <UserOutlined class="dl-icon" />
                            </template>
                        </a-input>
                    </a-form-item>

                    <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
                        <a-input-password v-model:value="formData.password" size="large" placeholder="请输入密码"
                            @keyup.enter="handleLogin">
                            <template #prefix>
                                <LockOutlined class="dl-icon" />
                            </template>
                        </a-input-password>
                    </a-form-item>

                    <a-form-item v-if="tenantList.length" label="租户" name="tenantId"
                        :rules="[{ required: true, message: '请选择租户' }]">
                        <a-select v-model:value="formData.tenantId" :options="tenantList"
                            :fieldNames="{ label: 'name', value: 'id' }" size="large" placeholder="请选择租户"
                            style="width: 100%" @change="handleTenantChange" />
                    </a-form-item>

                    <a-form-item>
                        <a-button type="primary" block size="large" class="dl-submit" :loading="loading"
                            @click="handleLogin">
                            登 录
                        </a-button>
                    </a-form-item>
                </a-form>

                <div class="dl-foot">
                    <a @click="forgetPassword">忘记密码</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '/@/store/modules/user';
import { notification } from 'ant-design-vue';
import { encryptionAES } from '/@/utils/cipher';
import { router } from '/@/router';
import { getToken } from '/@/utils/auth';
import { defHttp } from '/@/utils/http/axios';

const userStore = useUserStore();
const title = window?.settingConfig?.appTitle || '不动产登记信息管理系统';
const year = new Date().getFullYear();

const formData = reactive({
    username: '',
    password: '',
    tenantId: undefined as string | number | undefined,
});

const formRef: any = ref();
const tenantList = ref<any[]>([]);
const loading = ref<boolean>(false);
const showLogin = ref<boolean>(false);

// 生成确定性数据网络拓扑（用于装饰）
function genNetwork() {
    let seed = 20241014;
    const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    const count = 26;
    const pts: any[] = [];
    for (let i = 0; i < count; i++) {
        pts.push({
            x: 40 + rand() * 520,
            y: 40 + rand() * 520,
            r: rand() > 0.82 ? 4.5 : 2,
            accent: rand() > 0.9,
        });
    }
    const links: any[] = [];
    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            if (Math.sqrt(dx * dx + dy * dy) < 130) {
                links.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[j].x, y2: pts[j].y });
            }
        }
    }
    return { nodes: pts, links };
}
const { nodes, links } = genNetwork();

function handleLogin() {
    if (!formData.username || !formData.password) {
        notification.warning({ message: '登录失败', description: '请输入账号密码', duration: 3 });
        return;
    }
    if (tenantList.value.length && !formData.tenantId) {
        formRef.value?.validateFields(['tenantId']).catch(() => { });
        notification.warning({ message: '登录失败', description: '请选择租户', duration: 3 });
        return;
    }
    loading.value = true;
    const loginParam: any = {
        username: encryptionAES(formData.username),
        password: encryptionAES(formData.password),
    };
    if (formData.tenantId) loginParam.tenantId = formData.tenantId;

    userStore.login(loginParam).then((res: any) => {
        loading.value = false;
        if (res?.tenantList?.length && !formData.tenantId) {
            tenantList.value = res.tenantList;
            notification.warning({ message: '登录提示', description: '该用户有多租户，请选择租户', duration: 3 });
        } else if (res) {
            notification.success({ message: '登录提示', description: '欢迎回到数据中台', duration: 3 });
        } else {
            notification.error({ message: '登录失败', duration: 3 });
        }
    }).catch((err) => {
        loading.value = false;
        notification.error({ message: '登录失败', description: err?.message || '登录异常', duration: 3 });
    });
}

function handleTenantChange() {
    formRef.value?.clearValidate(['tenantId']);
}

watch(() => [formData.username, formData.password], () => {
    tenantList.value = [];
    formData.tenantId = undefined;
    formRef.value?.clearValidate(['tenantId']);
});

function forgetPassword() {
    notification.info({ message: '提示', description: '请联系系统管理员重置密码', duration: 3 });
}

function backToSys() {
    router.push('/login');
}

onMounted(async () => {
    const status = await getLicenseStatus();
    if (!status) {
        showLogin.value = false;
        router.push('/init');
        return;
    }
    showLogin.value = true;
    const token = getToken();
    if (token) {
        router.push('/analysis');
    }
});

function getLicenseStatus() {
    return new Promise<boolean>((resolve) => {
        const url = '/api/zrzy-system/sys/common/verifyLicense';
        defHttp.post({ url }, { withToken: false }).then((res: any) => {
            if (res && res.success) {
                resolve(!!res.result?.success);
            } else {
                resolve(false);
            }
        }).catch(() => resolve(false));
    });
}
</script>

<style scoped lang="less">
.dl-root {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    background: #0a1430;
}

/* ============ 左侧品牌区 ============ */
.dl-hero {
    position: relative;
    flex: 0 0 56%;
    max-width: 56%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 7%;
    color: #fff;
    overflow: hidden;
    background:
        radial-gradient(120% 120% at 18% 12%, #163a7a 0%, rgba(22, 58, 122, 0) 55%),
        linear-gradient(155deg, #0a1736 0%, #0d2150 48%, #0a2a57 100%);
}

.dl-hero-deco {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.dl-ring {
    position: absolute;
    border: 1px solid rgba(120, 165, 255, 0.14);
    border-radius: 50%;
}

.dl-ring-1 {
    width: 620px;
    height: 620px;
    right: -220px;
    bottom: -240px;
    border-color: rgba(120, 165, 255, 0.16);
    animation: dl-spin 60s linear infinite;
}

.dl-ring-2 {
    width: 420px;
    height: 420px;
    right: -120px;
    bottom: -160px;
    animation: dl-spin 45s linear infinite reverse;
}

.dl-ring-3 {
    width: 260px;
    height: 260px;
    right: -40px;
    bottom: -90px;
    border-color: rgba(120, 165, 255, 0.22);
    animation: dl-spin 30s linear infinite;
}

@keyframes dl-spin {
    to {
        transform: rotate(360deg);
    }
}

.dl-sheen {
    position: absolute;
    top: -30%;
    left: -20%;
    width: 70%;
    height: 80%;
    background: radial-gradient(closest-side, rgba(91, 140, 255, 0.12), transparent);
    filter: blur(20px);
}

.dl-net {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.9;
}

.dl-node {
    transform-box: fill-box;
    transform-origin: center;
    animation: dl-pulse 3.4s ease-in-out infinite;
}

.dl-node-accent {
    filter: drop-shadow(0 0 6px rgba(91, 140, 255, 0.9));
}

@keyframes dl-pulse {

    0%,
    100% {
        opacity: 0.45;
    }

    50% {
        opacity: 1;
    }
}

.dl-hero-content {
    position: relative;
    z-index: 2;
}

.dl-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 56px;
}

.dl-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    color: #cfe0ff;
    background: rgba(91, 140, 255, 0.14);
    border: 1px solid rgba(120, 165, 255, 0.3);
    backdrop-filter: blur(6px);
}

.dl-brand-name {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: rgba(207, 224, 255, 0.85);
}

.dl-hero-title {
    font-size: 54px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin: 0;
    color: #fff;
}

.dl-hero-sub {
    margin: 18px 0 48px;
    font-size: 15px;
    letter-spacing: 0.18em;
    color: rgba(180, 205, 255, 0.7);
}

.dl-copyright {
    position: absolute;
    bottom: 22px;
    left: 7%;
    z-index: 2;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: rgba(180, 205, 255, 0.4);
}

/* ============ 右侧表单区 ============ */
.dl-form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
        radial-gradient(80% 60% at 50% 0%, #eaf1fb 0%, rgba(234, 241, 251, 0) 60%),
        #f3f6fb;
    padding: 24px;
}

.dl-form-card {
    width: 100%;
    max-width: 396px;
    background: #fff;
    border-radius: 16px;
    padding: 40px 38px 30px;
    box-shadow: 0 16px 48px rgba(20, 45, 95, 0.1);
}

.dl-form-head {
    text-align: center;
    margin-bottom: 30px;

    .dl-form-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        border-radius: 13px;
        margin-bottom: 16px;
        color: #fff;
        background: linear-gradient(135deg, #5b8cff, #36d1c4);
        box-shadow: 0 8px 20px rgba(91, 140, 255, 0.35);
    }

    h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
        color: #16233f;
    }

    p {
        margin: 8px 0 0;
        font-size: 13px;
        color: #8a94a6;
    }
}

.dl-icon {
    color: #5b8cff;
}

:deep(.ant-input-affix-wrapper),
:deep(.ant-select-selector) {
    border-radius: 10px !important;
}

:deep(.ant-form-item-label>label) {
    color: #5a667f;
    font-size: 13px;
}

.dl-submit {
    height: 46px;
    font-size: 15px;
    letter-spacing: 4px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #5b8cff, #3f7bf0);
    box-shadow: 0 10px 22px rgba(63, 123, 240, 0.32);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 28px rgba(63, 123, 240, 0.42);
    }
}

.dl-foot {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    font-size: 13px;
    color: #8a94a6;

    a {
        color: #5b8cff;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: #3f7bf0;
        }
    }

    .dl-dot-sep {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #cfd6e2;
    }
}

/* ============ 响应式 ============ */
@media (max-width: 960px) {
    .dl-root {
        flex-direction: column;
    }

    .dl-hero {
        flex: none;
        max-width: 100%;
        height: 40%;
        padding: 32px 8%;
    }

    .dl-hero-title {
        font-size: 36px;
    }

    .dl-form-wrap {
        flex: 1;
        align-items: flex-start;
        padding-top: 26px;
    }
}
</style>
