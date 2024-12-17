import { message, Modal } from "ant-design-vue"
import { defHttp } from "../http/axios";
import { router } from "/@/router";
import { guid } from "..";
import { createVNode } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
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
            for (let index = 0; index < data.length; index++) {
                const dyh = data[index];
                dyhList.push({ bdcdyh: dyh.bdcdyh, zddm: dyh.zddm, ssywh: dyh.ywh, bdcqzh: dyh.bdcqzh, qllx: dyh.qllx })
            }
            break;
    }
  options.okLoading.value = true
  let check = await checkLogic(slbh, dyhList)
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
            router.push('/refresh')
        }
    })
  }
}

export async function extractDataLpb(options: any) {
    const route = router.currentRoute.value;
    const { data, dtype, open, reload, regtype } = options
    const slbh = route.query.slbh?.toString()
    let dyhList = []

    for (let index = 0; index < data.length; index++) {
        const dyh = data[index];
        dyhList.push({ bdcdyh: dyh.bdcdyh, preywh: dyh.ywh, qllx: 4 })
    }
    options.okLoading.value = true
    let check = await checkLogic(slbh, dyhList)
    options.okLoading.value = false
    if (check) {
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
                router.push('/refresh')
            }
        })
    }
}

/**
 * 创建案卷逻辑检查
 * @param params
 */
export function checkLogic(slbh, bdcModels) {
    return new Promise((resolve) => {
         defHttp.post({
            url: '/api/zrzy-logic/logic/check/checkLogic',
            data: {
              slbh: slbh,
              bdcModels: bdcModels
            }
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