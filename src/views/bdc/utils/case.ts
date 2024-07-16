import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"
import { router } from "/@/router"

enum api {
    roleDegisnList = '/tyyw/jeecg-cloud-joa/joa/designform/designFormCommuse/roleDegisnList', //工作流列表  返回对象错误
    list = '/tyyw/jeecg-cloud-joa/joa/designform/designFormCommuse/queryPorcessList',
    ceshi = "/tyyw/jeecg-cloud-bpm/process/extActProcessForm/list",
    add = '/api/zrzy-bdc/bdc/process/start',
    taskList = '/api/zrzy-bdc/bdc/process/list',//自己
    taskList1 = '/tyyw/jeecg-cloud-bpm/process/extActDesignFlowData/list?column=createTime&order=desc&pageNo=1&pageSize=10',//jeecg
    sss = '/tyyw/zrzy-cloud-bpm/act/task/list?column=createTime&order=des'//统一运维
}

/**
 * @description: 获取流程设计列表
 */
export function getDegisnList() {
    return new Promise((resolve) => {
        defHttp.get({ url: api.list }, { withToken: true }).then(res => {
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
            router.push({ path: '/bdc/casedoing', query: { slbh: res.result.slbh, taskId: res.result.taskId } });
        } else {
            message.error('流程创建失败')
        }

    }).catch(err => {
        message.error('流程创建失败' + err)
    })
}