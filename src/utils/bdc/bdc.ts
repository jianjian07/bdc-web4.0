import { message } from "ant-design-vue";
import { defHttp } from "../http/axios";
import { router } from "/@/router";
import { guid } from "..";
/**
 * 列表提取
 * @param options 
 */
export function extractData(options: any) {
    const route = router.currentRoute.value;
    const { data, dtype, open, reload, regType, ywlx } = options
    const slbh = route.query.slbh?.toString()
    let dyhList: any = []

    for (let index = 0; index < data.length; index++) {
        const dyh = data[index];
        dyhList.push({ bdcdyh: dyh.bdcdyh, zddm: dyh.zddm })
    }
    let lcid = "";
    switch (regType) {
        case '0101':
            lcid = "1780060462306840577"
            break;
        case '0102':
            lcid = "1780060462306840577"
            break;
    }
    let _data: any =
    {
        "ywlx": ywlx,
        "slbh": slbh,
        "lcid": lcid,
        "dyhList": dyhList
    }
    defHttp.post({
        url: '/api/zrzy-bdc/bdc/case/addCase',
        data: _data
    }, { withToken: true }).then((res) => {
        if (res.success) {
            message.success('数据提取成功')
            options.open.value = false
            options.reload.value = guid()
            router.push('/refresh')
        }
    })
}
export function extractDataLpb(options: any) {
    const route = router.currentRoute.value;
    const { data, dtype, open, reload } = options
    const slbh = route.query.slbh?.toString()
    let dyhList = []

    for (let index = 0; index < data.length; index++) {
        const dyh = data[index];
        dyhList.push({ bdcdyh: dyh.bdcdyh })
    }
    let _data: any =
    {
        // "djdl": "CQ",
        "slbh": slbh,
        "ywlx": '2',
        "lcid": "1780060462306840577",
        "dyhList": dyhList
    }
    defHttp.post({
        url: '/api/zrzy-bdc/bdc/case/addCase',
        data: _data
    }, { withToken: true }).then((res) => {
        if (res.success) {
            message.success('数据提取成功')
            options.open.value = false
            options.reload.value = guid()
        }
    })
}