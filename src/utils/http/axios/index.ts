import { RequestHttp } from "./axios";
import { ContentTypeEnum } from "/@/enums/httpEnum";
import { deepMerge } from '/@/utils'
function createAxios() {
    // 无人机token
    // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3b3Jrc3BhY2VfaWQiOiJlM2RlYTBmNS0zN2YyLTRkNzktYWU1OC00OTBhZjMyMjgwNjkiLCJzdWIiOiJDbG91ZEFwaVNhbXBsZSIsInVzZXJfdHlwZSI6IjEiLCJuYmYiOjE2NzU5MDk5NzMsImxvZyI6IkxvZ2dlcltjb20uZGppLnNhbXBsZS5jb21tb24ubW9kZWwuQ3VzdG9tQ2xhaW1dIiwiaXNzIjoiREpJIiwiaWQiOiJhMTU1OWU3Yy04ZGQ4LTQ3ODAtYjk1Mi0xMDBjYzQ3OTdkYTIiLCJleHAiOjE2NzU5OTYzNzMsImlhdCI6MTY3NTkwOTk3MywidXNlcm5hbWUiOiJhZG1pblBDIn0.3Bp-cnfrvwkxXYeOoZXIrhZmffoyCtIFrvw9uWGwiec'
    return new RequestHttp({
        timeout: 15 * 1000,//设置超时
        headers: { 'Content-Type': ContentTypeEnum.JSON },//请求头
        // baseURL: 'https://3681g61c24.goho.co'//基础路径
        // baseURL: "",
        // headers: { 'Content-Type': ContentTypeEnum.JSON, 'Authorization': 'Bearer 77874245-5016-4950-8d3e-90b048cf2c78' },//请求头
        // baseURL: import.meta.env.VITE_GLOB_CESHI//基础路径a
    })
}
export const defHttp = createAxios()
