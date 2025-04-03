import { message, Modal } from "ant-design-vue"
import { defHttp } from "../http/axios";
import { router } from "/@/router";
import { guid } from "..";
import { createVNode, nextTick } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
// 是否使用业务约束
const checkFlag = true
/**
 * 列表提取
 * @param options 
 */
export async function extractData(options: any) {
    const route = router.currentRoute.value;
    const { data, dtype, open, reload, regType, ywlx } = options
    const slbh = route.query.slbh?.toString()
    let dyhList: any = []
    let lcid = "";
    switch (regType) {
        case '0101':
            for (let index = 0; index < data.length; index++) {
                const dyh = data[index];
                dyhList.push({ bdcdyh: dyh.bdcdyh, zddm: dyh.zddm, qllx: dyh.qllx })
            }
            break;
        case '0102':
        case '0103':
        case '0104':
        case '0105':
        case '0106':
        case '0201':
        case '0202':
        case '0203':
        case '0204':
        case '0205':
        case '0206':
        case '0401'://查封
        case '0402'://续查封
        case '0404'://解查封
        case '0102,0102':
        case '0103,0102':
        case '0302':
        case '0303':
        case '0304':
        case '0305':
        case '0306':
        case '0312':
        case '0313':
        case '0314':
        case '0315':
        case '0316':
            for (let index = 0; index < data.length; index++) {
                const dyh = data[index];
                dyhList.push({ bdcdyh: dyh.bdcdyh, zddm: dyh.zddm, ssywh: dyh.ywh, bdcqzh: dyh.bdcqzh, qllx: dyh.qllx })
            }
            break;
        case '0204,0102,0201':
            for (let index = 0; index < data.length; index++) {
                const dyh = data[index];
                dyhList.push({ bdcdyh: dyh.bdcdyh, zddm: dyh.zddm, bdcqzh: dyh.bdcqzh, qllx: dyh.qllx })
            }
            break;
        case '0212':
        case '0213':
        case '0214':
        case '0215':
        case '0216':
            for (let index = 0; index < data.length; index++) {
                const dyh = data[index];
                dyhList.push({ zddm: dyh.zddm, bdcqzh: dyh.bdcqzh })
            }
            break;
    }
    options.okLoading.value = true
    let check = checkFlag ? await checkLogic({ slbh: slbh, bdcModels: dyhList}) : true
    options.okLoading.value = false
    if (check) {
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
                nextTick(() => {
                    const { getTabsShow } = useTabsSetting()
                    if (getTabsShow.value) {
                        const tabStore = useTabsStore()
                        tabStore.refreshTab()
                    } else {
                        router.push('/refresh')
                    }
                })
            } else {
                message.warning(res.message)
            }
        })
    }
}

export async function extractDataLpb(options: any) {
    const route = router.currentRoute.value;
    const { data, dtype, open, reload, regtype } = options
    const slbh = route.query.slbh?.toString()
    let dyhList: any = []
    let fwxxList = data.fwxxList
    for (let index = 0; index < fwxxList.length; index++) {
        const dyh = fwxxList[index];
        dyhList.push({ zddm: data.zddm, bdcdyh: dyh.bdcdyh, preywh: dyh.ywh, qllx: 4 })
    }
    options.okLoading.value = true
    let check = checkFlag ? await checkLogic({ slbh: slbh, bdcModels: dyhList }) : true
    options.okLoading.value = false
    if (check) {
        let _data: any =
        {
            // "djdl": "CQ",
            "slbh": slbh,
            "ywlx": '2',
            "zddm": data.zddm,
            "vtype": 2,
            "zbm": data.zbm,
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
                nextTick(() => {
                    const { getTabsShow } = useTabsSetting()
                    if (getTabsShow.value) {
                        const tabStore = useTabsStore()
                        tabStore.refreshTab()
                    } else {
                        router.push('/refresh')
                    }
                })
                
                // router.push('/refresh')
            } else {
                message.warning(res.message)
            }
        })
    }
}

/**
 * 创建案卷逻辑检查
 * @param params
 */
export function checkLogic(options) {
    return new Promise((resolve) => {
        defHttp.post({
            url: '/api/zrzy-logic/logic/check/checkLogic',
            data: options
        }, { withToken: true }).then((res) => {
            if (res && res.success) {
                const checkResult = res.result
                if (checkResult.code == 1) {
                    // 通过
                    resolve(true)
                } else if (checkResult.code == 0) {
                    // 提醒
                    Modal.confirm({
                        title: '提示',
                        icon: createVNode(ExclamationCircleOutlined),
                        content: createVNode('div', { style: 'color:red;' }, checkResult.message),
                        onOk() {
                            resolve(true)
                        },
                        onCancel() {
                            resolve(false)
                        }
                    });
                } else {
                    // 限制
                    Modal.error({
                        title: '提示',
                        content: checkResult.message,
                    });
                    resolve(false)
                }
            } else {
                message.warning('创建案卷逻辑检查发生错误')
                resolve(false)
            }
        })
    })
}
