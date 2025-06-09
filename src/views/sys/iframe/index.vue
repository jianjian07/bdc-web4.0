<template>
  <div class="iframe-index">
    <iframe
        :src="src"
        width="100%"
        height="100%"
        frameborder="0"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useAppStore } from "/@/store/modules/app"
import { useRouter } from "vue-router"
import md5 from 'crypto-js/md5';
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { useUserStore } from "/@/store/modules/user.ts"
const appStore = useAppStore()
const router = useRouter()
let src = computed(() => appStore.getIframeSrc)

onMounted(() => {
  if (router.currentRoute.value.meta.iframe && router.currentRoute.value.meta.iframeUrl) {
    let fullUrl: any = router.currentRoute.value.meta.iframeUrl
    const urlObj = new URL(fullUrl);
    
    const base = `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port}`; 
    const path = `${urlObj.pathname}${urlObj.search}`;  
    
    if (base == (window.settingConfig.tyywDomain || 'http://192.168.27.250:8800')) {
      defaultLogin(base, path)
    } else {
      appStore.setIframeSrc(router.currentRoute.value.meta.iframeUrl)
    }
  }
})

/**
 * 统一运维免登录
 * @param baseUrl
 * @param pathUrl
 */
function defaultLogin(baseUrl, pathUrl) {
  const userStore = useUserStore();
  const userInfo = userStore.getUserInfo
  let ts = new Date().getTime()
  let loginId = userInfo.username
  let msg = 'ts=' + ts +'|loginid=' + loginId
  msg = md5(msg)
  let loginParams = {
    loginid: loginId,
    ts: ts,
    message: msg
  }
  let ssoUrl = '/tyyw/sys/zrzy-usermanager-biz/SSO/loginSSOSimpleWithToken'
  let url = ssoUrl + '?loginid=' + loginParams.loginid + '&ts=' + loginParams.ts + '&message=' + loginParams.message + '&clientId=zrzy-dzzw'
  defHttp.get({ url: url }, { withToken: false }).then((res) => {
    if (res) {
      let redirect = encodeURIComponent(pathUrl)
      let iframeurl = `${baseUrl}/user/loginByCode?access_token=${res.access_token}&refresh_token=${res.refresh_token}&expires_in=${res.expires_in}&password_tip=false&redirect=${redirect}`
      appStore.setIframeSrc(iframeurl)
    } else {
      message.warning(res?.msg || '登录失败')
    }
  })
}
</script>

<style lang="less" scoped>
.iframe-index {
  width: 100%;
  height: 100%;
}
</style>
