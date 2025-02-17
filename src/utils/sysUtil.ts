import { useUserStoreWithOut } from "/@/store/modules/user"
import { usePermissionStoreWithOut } from "/@/store/modules/permission"
import { router } from "/@/router"
import { message } from "ant-design-vue"
import { PageEnum } from "/@/enums/pageEnum"
import { doLogout } from "/@/api/sys/user"

const timeOut = 60 * 60 * 1000; //设置超时时间: 60分钟
const timeInterval = 30 * 1000 // 定时器间隔时间 30秒

window.onload = function() {
  window.document.onmousedown = function() {
    const userStore = useUserStoreWithOut();
    userStore.setLastOperateTime(new Date().getTime())
  };
  window.document.onmousemove = function() {
    const userStore = useUserStoreWithOut();
    userStore.setLastOperateTime(new Date().getTime())
  };
};

/**
 * 超时检查
 */
async function checkTimeout() {
  const userStore = useUserStoreWithOut()
  const permissionStore = usePermissionStoreWithOut()
  let currentTime = new Date().getTime() //更新当前时间
  let lastTime = userStore.getLastOperateTime

  const pageList = ['/login', '/401']
  if ((currentTime - lastTime) > timeOut) {
    // 跳到登陆页
    if (pageList.includes(router.currentRoute.value.path)) return; // 已是登陆页或是401时不跳转
    // 判断是否超时
    if (this.getToken) {
      try {
        await doLogout();
        // 退出系统时设置最后操作时间
        userStore.setLastOperateTime(new Date().getTime())
      } catch {
        // console.log('注销Token失败');
      }
    }
    userStore.resetState()
    permissionStore.resetState();
    // console.log('由于长时间未操作系统, 自动退出到登录页面!')
    message.warning('由于长时间未操作系统, 自动退出到登录页面!')
    router.push(PageEnum.BASE_LOGIN)
  }
}

export default function () {
  /* 定时器 间隔时长 检测是否长时间未操作页面 */
  window.setInterval(checkTimeout, timeInterval)
}

//设置cookie
export function setCookie(name, value, seconds) {
  seconds = seconds || 0;
  let expires = "";
  if (seconds != 0) {
    let date = new Date();
    date.setTime(date.getTime() + (seconds * 1000));
    expires = "expires=" + date.toUTCString(); // date.toGMTString() 已弃用
  }
  document.cookie = name + "=" + escape(value) + expires + "; path=/; SameSite=Strict";
}

//取得cookie
export function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') { //判断一下字符串有没有前导空格
      c = c.substring(1, c.length); //有的话，从第二位开始取
    }
    if (c.indexOf(nameEQ) == 0) { //如果含有name
      return unescape(c.substring(nameEQ.length, c.length)); //解码并截取我们要值
    }
  }
  return false;
}