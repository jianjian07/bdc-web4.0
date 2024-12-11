import { defHttp } from "/@/utils/http/axios"

enum Api {
    queryUrl = '/api/zrzy-form/form/report/query'
}
/**
 * 查询报表
 * @param params
 */
export const getReport = async (params: any) => {
    const data = await defHttp.get({ url: Api.queryUrl, params }, { withToken: true })
    return data.result
}
