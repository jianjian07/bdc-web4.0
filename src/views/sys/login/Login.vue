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
                <g stroke="rgba(56,189,248,0.14)" stroke-width="1">
                    <line v-for="(l, i) in links" :key="'l' + i" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" />
                </g>
                <g>
                    <circle v-for="(n, i) in nodes" :key="'n' + i" :cx="n.x" :cy="n.y" :r="n.r"
                        :fill="n.accent ? '#38bdf8' : 'rgba(148,163,184,0.45)'"
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

                <!-- 监控大屏风格的特性指标卡 -->
                <div class="dl-feature-grid">
                    <div v-for="f in features" :key="f.label" class="dl-feature-card">
                        <div class="dl-feature-icon" :style="{
                            color: f.color,
                            background: `radial-gradient(circle at 30% 30%, ${f.color}2e, ${f.color}10)`,
                            boxShadow: `inset 0 0 0 1px ${f.color}3d, 0 0 16px ${f.color}26`
                        }">
                            <component :is="f.icon" />
                        </div>
                        <div class="dl-feature-meta">
                            <div class="dl-feature-label">{{ f.label }}</div>
                            <div class="dl-feature-desc">{{ f.desc }}</div>
                        </div>
                        <i class="dl-feature-glow" :style="{ background: `radial-gradient(circle, ${f.color}2b, transparent 70%)` }" />
                    </div>
                </div>
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
import { UserOutlined, LockOutlined, DatabaseOutlined, DeploymentUnitOutlined, FundOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '/@/store/modules/user';
import { notification } from 'ant-design-vue';
import { encryptionAES } from '/@/utils/cipher';
import { router } from '/@/router';
import { getToken } from '/@/utils/auth';
import { defHttp } from '/@/utils/http/axios';

const userStore = useUserStore();
const title = window?.settingConfig?.appTitle || '不动产登记信息管理系统';
const year = new Date().getFullYear();

// 监控大屏风格的特性指标卡(与 dataops/monitor 配色一致)
const features = [
    { label: '数据资产', desc: '统一汇聚 · 全量纳管', icon: DatabaseOutlined, color: '#38bdf8' },
    { label: '智能治理', desc: '质量稽核 · 自动修复', icon: DeploymentUnitOutlined, color: '#6366f1' },
    { label: '全景洞察', desc: '实时监控 · 可视分析', icon: FundOutlined, color: '#34d399' }
];

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
/* ============================================================
   登录页 · 暗色大屏主题
   参考 dataops/monitor 监控大屏: 深蓝渐变底 + 玻璃拟态面板
   + 霓虹青/靛蓝点缀 + 光晕效果
   ============================================================ */
@cyan: #38bdf8;
@indigo: #6366f1;
@border-glass: rgba(148, 163, 184, 0.16);

.dl-root {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    color: #cbd5e1;
    background:
        radial-gradient(1100px 420px at 12% -8%, rgba(56, 189, 248, 0.16), transparent 60%),
        radial-gradient(900px 380px at 88% -4%, rgba(99, 102, 241, 0.14), transparent 55%),
        radial-gradient(700px 500px at 50% 118%, rgba(99, 102, 241, 0.1), transparent 60%),
        linear-gradient(180deg, #0b1220 0%, #0d1526 55%, #0b1220 100%);
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
    color: #e2e8f0;
    overflow: hidden;
}

.dl-hero-deco {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.dl-ring {
    position: absolute;
    border: 1px solid rgba(56, 189, 248, 0.12);
    border-radius: 50%;
}

.dl-ring-1 {
    width: 620px;
    height: 620px;
    right: -220px;
    bottom: -240px;
    border-color: rgba(56, 189, 248, 0.14);
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
    border-color: rgba(99, 102, 241, 0.24);
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
    background: radial-gradient(closest-side, rgba(56, 189, 248, 0.14), transparent);
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
    filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.9));
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
    color: #7dd3fc;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.3);
    backdrop-filter: blur(6px);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.18);
}

.dl-brand-name {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: rgba(203, 213, 225, 0.85);
}

.dl-hero-title {
    font-size: 54px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin: 0;
    color: #f1f5f9;
    text-shadow: 0 0 40px rgba(56, 189, 248, 0.25);
}

.dl-hero-sub {
    margin: 18px 0 44px;
    font-size: 15px;
    letter-spacing: 0.18em;
    color: #7c8aa0;
}

/* ---------- 特性指标卡(大屏 stat-card 同款) ---------- */
.dl-feature-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    max-width: 560px;
}

.dl-feature-card {
    position: relative;
    min-width: 0;
    padding: 14px 14px 12px;
    background: rgba(148, 163, 184, 0.055);
    border: 1px solid @border-glass;
    border-radius: 14px;
    overflow: hidden;
    backdrop-filter: blur(6px);
    transition: transform 0.2s ease, border-color 0.25s ease, box-shadow 0.25s ease;

    &:hover {
        transform: translateY(-2px);
        border-color: rgba(56, 189, 248, 0.35);
        box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.08), 0 8px 28px rgba(2, 6, 23, 0.5);
    }
}

.dl-feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    margin-bottom: 10px;
}

.dl-feature-meta {
    min-width: 0;
}

.dl-feature-label {
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
    letter-spacing: 0.04em;
}

.dl-feature-desc {
    margin-top: 4px;
    font-size: 12px;
    color: #7c8aa0;
    letter-spacing: 0.02em;
}

.dl-feature-glow {
    position: absolute;
    top: -34px;
    right: -30px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    pointer-events: none;
}

.dl-copyright {
    position: absolute;
    bottom: 22px;
    left: 7%;
    z-index: 2;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: #475569;
}

/* ============ 右侧表单区 ============ */
.dl-form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 24px;

    /* 表单卡片背后的柔和光晕 */
    &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 560px;
        height: 560px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.12), transparent 65%);
        pointer-events: none;
    }
}

/* 玻璃拟态面板(monitor .panel 同款) */
.dl-form-card {
    position: relative;
    width: 100%;
    max-width: 400px;
    background: rgba(148, 163, 184, 0.055);
    border: 1px solid @border-glass;
    border-radius: 16px;
    padding: 40px 38px 28px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 28px rgba(2, 6, 23, 0.5);
    transition: border-color 0.25s ease, box-shadow 0.25s ease;

    &:hover {
        border-color: rgba(56, 189, 248, 0.35);
    }
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
        color: #7dd3fc;
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(99, 102, 241, 0.16));
        border: 1px solid rgba(56, 189, 248, 0.35);
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.22);
    }

    h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0.5px;
        color: #f1f5f9;
    }

    p {
        margin: 8px 0 0;
        font-size: 13px;
        color: #7c8aa0;
    }
}

.dl-icon {
    color: #7dd3fc;
}

/* ---------- 表单控件暗色适配 ---------- */
:deep(.ant-form-item-label > label) {
    color: #94a3b8 !important;
    font-size: 13px;
}

:deep(.ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before) {
    color: #f87171;
}

:deep(.ant-input-affix-wrapper),
:deep(.ant-select-selector) {
    background: rgba(148, 163, 184, 0.07) !important;
    border: 1px solid rgba(148, 163, 184, 0.22) !important;
    border-radius: 10px !important;
    box-shadow: none !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.ant-input) {
    background: transparent !important;
    color: #e2e8f0 !important;
    caret-color: #38bdf8;
}

:deep(.ant-input::placeholder),
:deep(.ant-select-selection-placeholder) {
    color: #52607a !important;
}

:deep(.ant-input-affix-wrapper .ant-input-prefix) {
    margin-inline-end: 9px;
}

:deep(.ant-select-selection-item) {
    color: #e2e8f0 !important;
}

:deep(.ant-select-arrow) {
    color: #94a3b8 !important;
}

:deep(.ant-input-clear-icon) {
    color: #52607a;
}

/* 聚焦态: 霓虹青描边 + 柔光 */
:deep(.ant-input-affix-wrapper-focused),
:deep(.ant-input-affix-wrapper:focus-within),
:deep(.ant-select-focused .ant-select-selector) {
    border-color: rgba(56, 189, 248, 0.55) !important;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12), 0 0 16px rgba(56, 189, 248, 0.12) !important;
}

/* ---------- 提交按钮(青→靛渐变 + 光晕, 同大屏主色) ---------- */
.dl-submit {
    height: 46px;
    font-size: 15px;
    letter-spacing: 4px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    color: #f8fafc;
    background: linear-gradient(135deg, #38bdf8, #6366f1);
    box-shadow: 0 8px 24px rgba(56, 189, 248, 0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

    &:hover {
        filter: brightness(1.08);
        transform: translateY(-1px);
        box-shadow: 0 12px 30px rgba(56, 189, 248, 0.4);
    }
}

.dl-foot {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    font-size: 13px;
    color: #7c8aa0;

    a {
        color: #7dd3fc;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: #bae6fd;
        }
    }
}

/* ============ 响应式 ============ */
@media (max-width: 960px) {
    .dl-root {
        flex-direction: column;
        overflow-y: auto;
    }

    .dl-hero {
        flex: none;
        max-width: 100%;
        height: auto;
        padding: 36px 8% 28px;
    }

    .dl-brand {
        margin-bottom: 28px;
    }

    .dl-hero-title {
        font-size: 36px;
    }

    .dl-hero-sub {
        margin-bottom: 28px;
    }

    .dl-form-wrap {
        flex: 1;
        align-items: flex-start;
        padding-top: 10px;
        padding-bottom: 32px;
    }
}

@media (max-width: 640px) {
    .dl-feature-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
