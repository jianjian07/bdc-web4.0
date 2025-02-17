import { LoginParams, LoginResultModel } from "./model/userModel";
// import {defHttp} from "/@/utils/http";
// import ceshi from "/@/utils/http/ceshi";
// import { defHttp } from "/@/utils/http/demo";
import { defHttp } from "/@/utils/http/axios";
import * as CryptoJS from "crypto-js";
import JSEncrypt from "jsencrypt";

enum api {
  // getTokenApi = '/api/auth/oauth/token',
  getTokenApiTyyw = '/tyyw/auth/oauth/token',
  getTokenApi = '/api/zrzy-system/api/v1/auth/authorization',
  getUserInfoApi = '/api/zrzy-system/sys/v1/user/getUserInfo',//旧，未使用
  logoutApi = '/api/zrzy-system/api/v1/auth/logOut'
  // licenseApi = '/onemap/zrzy-om-licence/licence',
  // getDictApi = '/magicapi/zrzy-om-sjsw/magic/wlgz/dic/list',//旧，未使用
}


/**
 * @description: 用户登录
 */
export function login_tyyw(params: LoginParams) {
  const encryPwd = encryption({
    data: {
      password: params.password
    },
    key: 'zondyzrzykjghsyb',
    param: ['password']
  })
  const password = encodeURIComponent(encryPwd.password)
  return new Promise((resolve) => {
    let url = `${api.getTokenApiTyyw}?username=${params.username}&password=${password}&grant_type=password&scope=server`
    defHttp.post({
      url: url,
      headers: { 'Authorization': `Basic ${window.btoa('zrzy:zrzy')}` }
    }, { withToken: false }).then((res) => {
      resolve({
        userId: res.user_id,
        username: res.username,
        token: 'Bearer' + ' ' + res.access_token
      })
    }).catch((err => {
      resolve(null)
    }))
  })
  // licence()
}
/**
 * @description: 用户登录
 */
export function loginApi(params: LoginParams) {
  return new Promise((resolve) => {
    defHttp.put({
      url: api.getTokenApi,
      data: { username: params.username, password: params.password }
    }, { withToken: false }).then((res) => {
      if (res && res.code == 200) {
        resolve({
          // userId: res.user_id,
          username: params.username,
          token: 'Bearer' + ' ' + res.result.access_token
        })
      } else {
        resolve({
          code: res.code,
          message: res.message
        })
      }
    }).catch((err => {
      resolve(null)
    }))
  })
}

/**
 * 退出 清理token
 */
export function doLogout() {
    return new Promise((resolve) => {
        defHttp.post({ url: api.logoutApi }, { withToken: true }).then((res) => {
            resolve(true)
        }).catch(err => {
            resolve(false)
        })
    })
}

/**
 * @description: 得到用户信息
 */
export function getUserInfo() {
  return new Promise((resolve) => {
     defHttp.get({ url: api.getUserInfoApi }, { withToken: true }).then((res) => {
        if (res && res.code == 200) {
            resolve({
                username: res.result.username,
                userId: res.result.id,
                realname: res.result.realName
            })
        } else {
            resolve(null)
        }
    }).catch((err => {
        resolve(null)
    }))
  })
}
/**
 * 获取数据字典
 */
export function getSysDict() {
  // return new Promise((resolve) => {
  //   defHttp.post({ url: api.getDictApi }, { withToken: true }).then((res) => {
  //     if (res && res.length > 0) {
  //       resolve(res)
  //     } else {
  //       resolve(false)
  //     }
  //   }).catch(err => {
  //     resolve(false)
  //   })
  // })
}

// 密码加密
function encryption(params: any) {
  let key = params.key
  const data = params.data
  const type = params.type
  const param = params.param
  const result = JSON.parse(JSON.stringify(data))
  if (type === 'Base64') {
    param.forEach(ele => {
      result[ele] = btoa(result[ele])
    })
  } else {
    param.forEach(ele => {
      let data = result[ele]
      key = CryptoJS.enc.Latin1.parse(key)
      let iv = key
      // 加密
      let encrypted = CryptoJS.AES.encrypt(
        data,
        key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding
      })
      result[ele] = encrypted.toString()
    })
  }
  return result
}
/**
 * licence验证
 * @returns
 */
export function licence() {
  const serial = 'VSsFbGdYWAywnAvk'
  const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA23dIWmSBmtAdMpogulfN
RwiaM9BXNGd7ug28iHyu1bGxL+xJLcw1SE6o9AcHkXi/TcVDRDn9sOoeNhHF+CZL
XrXeXoEfKxOn3fDWekVpTH6D01OyKVQL708I+0w8GEeDjtQRsGNeFhQfUOD+R1qh
TtK3fYDsZ7+j6bl3RAsxuXy+5fecduSr++QQXsl1chTY+v151SyQzjOc8HGnYR7Q
CyAKZ97vdaT7ynlK++Ok+bwm9trDHJPQYLQHT1nEOSZHZS0PMstVkFAyBtXkaPhK
vdD+dWiCv2QNHPXsNoSnpOFh7DJ5rteEPevG/5nYaIjd8l0i/TV6J64hbtphqrvS
kQIDAQAB
-----END PUBLIC KEY-----`
  const code = getRandom(6)
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPublicKey(PUBLIC_KEY);
  const checksum = jsEncrypt.encrypt(`${serial}@${Date.now()}@${code}`)
  // return new Promise<string>((resolve) => {
  //   defHttp.post({ url: api.licenseApi, params: { serial: serial, checksum: checksum } }, {}).then((res) => {
  //     if (res.result) {
  //       resolve('true')
  //     } else {
  //       resolve('false')
  //     }
  //   }).catch((err => {
  //     resolve('false')
  //   }))
  // })
}
export function getRandom(e) {
  e = e || 32;
  const t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  const a = t.length;
  let n = "";
  for (let i = 0; i < e; i++) {
    n += t.charAt(Math.floor(Math.random() * a));
  }
  return n
}
