import { isObject } from "./is"
import { nextTick } from "vue"
const baseApiUrl = '';
/**
 * 深度合并
 * @param src
 * @param target
 * @returns
 */
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
    let key: string
    for (key in target) {
        src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
    }
    return src
}
/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
    let parameters = '';
    for (const key in obj) {
        parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
    }
    parameters = parameters.replace(/&$/, '');
    return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}
/**
 * 获取images路径下的图片
 */
export function getImageUrl(name: string) {
    return new URL(`/src/assets/images/${name}.png`, import.meta.url).href;
}
export function getUrl(name: string) {
    return new URL(`/src/assets/${name}`, import.meta.url).href;
}
/**
 *  获取文件服务访问路径
 * @param fileUrl 文件路径
 * @param prefix(默认http)  文件路径前缀 http/https
 */
export const getFileAccessHttpUrl = (fileUrl, prefix = 'http') => {
    let result = fileUrl;
    try {
        if (fileUrl && fileUrl.length > 0 && !fileUrl.startsWith(prefix)) {
            //判断是否是数组格式
            let isArray = fileUrl.indexOf('[') != -1;
            if (!isArray) {
                let prefix = `${baseApiUrl}/sys/common/static/`;
                // 判断是否已包含前缀
                if (!fileUrl.startsWith(prefix)) {
                    result = `${prefix}${fileUrl}`;
                }
            }
        }
    } catch (err) { }
    return result;
};

const S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

/**
 * 生成guid
 */
export function guid() {
    const timestamp = Date.now().toString(16);
    return (S4() + S4() + '-' + S4() + '-' + timestamp + '-' + S4() + '-' + S4() + S4() + S4()
    );
}
/**对比属性**/
/**
 * 比较两个对象的属性值，返回变化的属性
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @returns 不同属性值组成的对象
 */
export function compareObjects(obj1: any, obj2: any) {
    // 定义一个空数组用于存储不同的属性值
    let diff: any = {}
    for (const key in obj1) {
        // 如果属性值不同，则将该属性和obj1和obj2的值存入diff对象
        if (obj1[key] !== obj2[key]) {
            diff[key] = obj2[key];
        }
    }
    return diff;
}
/**对比属性**/

/**
 * 流畅滑动到div底部
 * @param id
 * @param time
 */
export function scrollOnTheEnd(id, time) {
  nextTick(() => {
    let msg = document.getElementById(id)
    let start = msg.scrollTop;
    let end = msg.scrollHeight;
    let distance = end - start;
    let startTime = null;

    function scrollStep(timestamp) {
      if (!startTime) startTime = timestamp;
      let progress = timestamp - startTime;
      let scrollPos = start + distance * (progress / time)
      msg.scrollTop = scrollPos;
  
      if (progress < time) { 
        window.requestAnimationFrame(scrollStep);
      } else {
        msg.scrollTop = end
      }
    }

    window.requestAnimationFrame(scrollStep);
  })
}

/**
 * 获取父级id
 * @param id
 * @param tree
 */
export function getParentId(id: string | number, tree: any) {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.id === id)) {
        parentKey = node.id
      } else if (getParentId(id, node.children)) {
        parentKey = getParentId(id, node.children)
      }
    }
  }
  return parentKey
}

/**
 * 获取所有的父节点数据
 * @param data 树形数组
 * @param arr 父节点数组
 * @returns
 */
export function getAllParentKeys(data: any = [], arr: any = []) {
  data.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      arr.push(item.id)
      return getAllParentKeys(item.children, arr)
    }
  })
  return arr
}