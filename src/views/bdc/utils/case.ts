import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import { router } from "/@/router"

enum api {
    porcessList = '/tyyw/jeecg-cloud-joa/joa/designform/designFormCommuse/queryPorcessList',
    add = '/api/zrzy-bdc/bdc/process/start',
    taskList = '/api/zrzy-bdc/bdc/process/list',//自己
    addBL = '/api/zrzy-bdc/bdc/bl/startBl',
    // taskList1 = '/tyyw/jeecg-cloud-bpm/process/extActDesignFlowData/list?column=createTime&order=desc&pageNo=1&pageSize=10',//jeecg
    // sss = '/tyyw/zrzy-cloud-bpm/act/task/list?column=createTime&order=des'//统一运维
}

/**
 * @description: 获取流程设计列表
 */
export function getDegisnList() {
    return new Promise((resolve) => {
        defHttp.get({ url: api.porcessList }, { withToken: true }).then(res => {
            resolve(res.result)
        })
    })
}
/**
 * @description: 添加流程
 */
export function addFlow(params: any) {
    defHttp.post({ url: api.add, data: { ...params } }, { withToken: true }).then(res => {
        if (res.success) {
            router.push({ path: '/bdc/casedoing', query: { slbh: res.result.slbh, nodeId: res.result.nodeId, taskId: res.result.taskId } });
        } else {
            message.error('流程创建失败')
        }

    }).catch(err => {
        message.error('流程创建失败' + err)
    })
}
/**
 * @description: 添加流程
 */
export function addFlowBL(params: any) {
    defHttp.post({ url: api.addBL, data: { ...params } }, { withToken: true }).then(res => {
        if (res.success) {
            router.push({ path: '/bdc/blcasedoing', query: { slbh: res.result.slbh } });
        } else {
            message.error('流程创建失败')
        }

    }).catch(err => {
        message.error('流程创建失败' + err)
    })
}


export function getBpmList(sxlx = 1) {
  return new Promise((resolve) => {
    defHttp.get({ url: "/api/zrzy-bdc/flow/sxml/treeList", params: {} }, { withToken: true }).then((res) => {
      if (res && res.success) {
        let list = res.result.filter(item => item.sxlx == sxlx) || []
        resolve(list || [])
      } else {
        message.warning(res?.message || '')
        resolve([])
      }
    })
  })
}
