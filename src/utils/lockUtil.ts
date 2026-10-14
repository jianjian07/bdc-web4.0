import { useUserStoreWithOut } from "/@/store/modules/user"
import { usePermissionStoreWithOut } from "/@/store/modules/permission"
import { router } from "/@/router"
import { message } from "ant-design-vue"
import { PageEnum } from "/@/enums/pageEnum"
import { doLogout } from "/@/api/sys/user"

const timeOut = 60 * 60 * 1000; //设置超时时间: 60分钟
const timeInterval = 30 * 1000 // 定时器间隔时间 30秒

window.onload = function () {
  window.document.onmousedown = function () {
    const userStore = useUserStoreWithOut();
    userStore.setLastOperateTime(new Date().getTime())
  };
  window.document.onmousemove = function () {
    const userStore = useUserStoreWithOut();
    userStore.setLastOperateTime(new Date().getTime())
  };
  window.document.onkeydown = function () {
    const userStore = useUserStoreWithOut();
    userStore.setLastOperateTime(new Date().getTime())
  };
};

/**
 * 超时锁屏
 */
function checkTimeout() {
  const userStore = useUserStoreWithOut()
  let currentTime = new Date().getTime() //更新当前时间
  let lastTime = userStore.getLastOperateTime

  const pageList = ['/login', '/401']
  if ((currentTime - lastTime) > timeOut) {
    if (pageList.includes(router.currentRoute.value.path)) return; // 已是登陆页或是401时不操作
    if (userStore.getLoginInfo.userpwd && !(userStore.getIsLocked == 'true')) {
      userStore.lockScreen()
    } else if (!userStore.getLoginInfo.userpwd) {
      if (userStore.getToken) {
        doLogout()
      }
      userStore.resetState()
      const permissionStore = usePermissionStoreWithOut()
      permissionStore.resetState();
      userStore.setLastOperateTime(new Date().getTime())
      router.push(PageEnum.BASE_LOGIN)
      message.warning('超时且用户登陆信息获取出错，退出并返回登陆页！')
    }
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