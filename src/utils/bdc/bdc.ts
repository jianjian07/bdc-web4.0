import { router } from "/@/router";


export function extractData(options: any) {
    const route = router.currentRoute.value;
    const { data, dtype } = options
    const slbh = route.query.slbh?.toString()
    let dyhList = []

    for (let index = 0; index < data.length; index++) {
        const dyh = data[index];
        dyhList.push({ bdcdyh: dyh.bdcdyh })
    }
    let _options: any =
    {
        "djdl": "CQ",
        "slbh": slbh,
        "guid": "process1713234366021",
        // "regType": "",
        // "djlb": "",
        "dyhList": dyhList
    }
    // defHttp.post({
    //     url: '/api/zrzy-bdc/bdc/case/addCase',
    //     data: _data
    // }, { withToken: true }).then((res) => {
    //     open.value = false
    //     reload.value = guid()
    //     console.log('数据提取成功')
    // })
    console.log("选中的单元" + JSON.stringify(_options))
}