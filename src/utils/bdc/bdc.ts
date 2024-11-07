import { defHttp } from "../http/axios";
import { router } from "/@/router";
import { guid } from '/@/utils';

export function extractData(options: any) {
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
        "djdl": "CQ",
        "slbh": slbh,
        "guid": "process1713234366021",
        // "regType": "",
        // "djlb": "",
        "dyhList": dyhList
    }
    defHttp.post({
        url: '/api/zrzy-bdc/bdc/case/addCase',
        data: _data
    }, { withToken: true }).then((res) => {
        if (res.success) {
            open.value = false
            reload.value = guid()
        }
    })
    // console.log("选中的单元" + JSON.stringify(_data))
}