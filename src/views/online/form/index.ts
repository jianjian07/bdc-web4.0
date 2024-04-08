import { defHttp } from "/@/utils/http/axios"

enum Api {
    queryUrl = '/magicapi/zrzy-form/magic/form/form/query'
}
/**
 * 查询报表
 * @param params
 */
export const getForm = async (params: any) => {
    const data = await defHttp.post({ url: Api.queryUrl, params }, { withToken: true })
    return data
}

