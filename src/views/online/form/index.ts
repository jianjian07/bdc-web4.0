import { defHttp } from "/@/utils/http/axios"

enum Api {
    queryUrl = '/api/zrzy-form/form/query'
}
/**
 * 查询报表
 * @param params
 */
export const getForm = async (params: any) => {
    const data = await defHttp.post({ url: Api.queryUrl, data: params }, { withToken: true })
    if (data.success) {
        return data.result
    } else {
        return null
    }
}

