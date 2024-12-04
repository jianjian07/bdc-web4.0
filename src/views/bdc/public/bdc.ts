import { useUserStore } from "/@/store/modules/user"
import { getFormInfo, saveFormData, saveHandleData, setValidateInfos, validateInfos } from "/@/utils/form/wonder1.0.1"
import { Modal, message } from "ant-design-vue"
import { cModal } from "/@/components/cModal/index"
import { computed } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { router } from "/@/router"
import { defHttp } from "/@/utils/http/axios"
import eventBus from "/@/views/bdc/djlc/eventBus"

const userStore = useUserStore()

enum api {
  configList = '/api/zrzy-dzzw/caseConfig/getCaseState',
  getSzUserInfo = '/api/zrzy-system/api/v1/auth/singleToken',
  addQlr = '/api/zrzy-bdc/bdc/qlr/add',
  editQlr = '/api/zrzy-bdc/bdc/qlr/update'
}

/**
 * 获取容器
 */
export function getTarget() {
  return document.getElementById('public-vue')
}

/**
 * 获取多级ref
 * @param list
 * @param arr
 */
export function getMultipleRef(list: any[], arr: any[]) {
  list.forEach((item: any) => {
    if (Array.isArray(item)) {
      let _list = getMultipleRef(item, [])
      arr = [...arr, ..._list]
    } else {
      arr.push(item)
      if ((item && item.multipleRef && item.multipleRef())) {
        return getMultipleRef(item.multipleRef(), arr)
      } else if (item && item.$ && item.$.exposed && item.$.exposed.multipleRef && item.$.exposed.multipleRef()) {
        return getMultipleRef(item.$.exposed.multipleRef(), arr)
      } else if (item && item._ && item._.exposed && item._.exposed.multipleRef && item._.exposed.multipleRef()) {
        return getMultipleRef(item._.exposed.multipleRef(), arr)
      }
    }
  })
  console.log('arr', arr)
  return arr
}

/**
 * 保存/移交
 * @param _type
 * @param demoRefs
 */
export async function sendSaveFun(type: string, demoRefs: any, loading: any, params?: any) {
  return new Promise(async (resolve) => {
    loading.value = true
    if (type == 'baseSave') {
      userStore.setSaveFormFlag(false)
    } else {
      userStore.setSaveFormFlag(true)
    }
    let beforeRes = true
    let commonSaveRes: unknown
    let afterRes = true
    if (params && params.beforeFun) {
      beforeRes = await eval(params.beforeFun)
      console.log('beforeRes', beforeRes)
    }
    if (beforeRes) {
      commonSaveRes = await saveFormData(demoRefs, params?.params)
      console.log('commonSaveRes', commonSaveRes)
      if (commonSaveRes && params && params.afterFun) {
        afterRes = await eval(params.afterFun)
      }
      console.log('afterRes', afterRes)
      const errorList = (document as any).querySelectorAll(".ant-form-item-has-error")
      if (errorList && errorList.length > 0) {
        // 由于校验失败ant会自动给失败表单项添加类名，直接获取即可
        errorList[0].scrollIntoView({
          block: "center",
          behavior: "smooth",
        })
      }
    }
    loading.value = false
    userStore.setSaveFormFlag(true)
    console.log('validateInfos', validateInfos)
    let saveStatus
    let msg
    // 表单是否需要保存
    // let isSubmit = getFormIsSubmit(demoRefs)
    let isSubmit = true
    if (isSubmit) {
      // 基础保存成功但是校验不通过时 不提示保存成功
      if (beforeRes && commonSaveRes && afterRes) {
        const validate = !commonSaveRes.find(com => !com.validate)
        saveStatus = validate
        if (validate) {
          msg = type === 'baseSave' ? "保存成功!" : "保存成功,可进行移交!"
        } else {
          // 表单暂存，校验不通过，也提示表单保存成功
          msg = "暂存成功!"
          message.success(msg)
          resolve(saveStatus)
          return
        }
      } else {
        saveStatus = false
        msg = ""
      }
      // console.log('errorList', errorList)
    } else {
      msg = type === 'baseSave' ? "保存成功!" : "保存成功,可进行移交!"
      saveStatus = true
    }
    if (msg) {
      saveStatus ? message.success(msg) : message.error(msg)
    }

    resolve(saveStatus)
  })
}

export async function baseSave(demoRefs: any, loading: any, params: any) {
  return await sendSaveFun('baseSave', demoRefs, loading, params)
}

export async function handOver(demoRefs: any, loading: any, params: any) {
  let res = await sendSaveFun('handOver', demoRefs, loading, params)
  if (res) {
    let modal = cModal({
      title: '移交',
      width: '45vw',
      filePath: 'views/bdc/public/HandleModal',
      onOk: async (res: any) => {
        if (res && res.handleOk) {
          let _result = await res.handleOk()
          if (_result) {
            modal.destroy()
            // 关闭当前标签页
            const tabStore = useTabsStore()
            const { getTabsShow } = useTabsSetting()
            if (getTabsShow) {
              const currentTab = computed(() => tabStore.getCurrentTab)
              tabStore.removeTab(currentTab.value)
            } else {
              router.push('/analysis')
            }
          }
        }
      }
    })
  }
  return res
}

// 保存前方法测试
export async function aa(demoRefs, test) {
  console.log('demoRefs', demoRefs)
  console.log('aaTest', test)
  return true
}

/**
 * 退回
 * @param val1
 * @param val2
 */
export function handBack(demoRefs: any, loading: any, val1, val2) {
  console.log('val1', val1)
  console.log('val2', val2)
}

/**
 * 权利人新增保存
 * @param type
 * @param demoRefs
 * @param spinning
 * @param params
 */
export async function sendQlrSaveFun(type: string, demoRefs: any, spinning: any, params?: any) {
  spinning.value = true
  let saveRes: any = false
  let _result = await getFormInfo(demoRefs)
  if (_result) {
    let find = _result.filter(r => r.formId == 55)[0]
    if (find && find.validate) {
      let qlrData = find.data[0].BDC_QLR
      const newQlrData = {};
      let _param = {
        ywh: params.ywh,
        slbh: params.slbh,
        qlrlb: params.qlrlb,
        qlrid: params.qlrid
      }
      for (const key in qlrData) {
        if (qlrData.hasOwnProperty(key)) {
          newQlrData[key.toLowerCase()] = qlrData[key];
        }
      }
      let merged = Object.assign({}, newQlrData, _param);
      saveRes = await updateQlrData(type, merged)
    }
  }
  spinning.value = false
  return saveRes
}

/**
 * 新增或编辑权利人
 * @param type
 * @param data
 */
function updateQlrData(type, data) {
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: type == 'add' ? api.addQlr : api.editQlr,
      data: data
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('保存成功')
        resolve(true)
      } else {
        message.error('保存失败')
        resolve(false)
      }
    })
  })
}

/**
 * 附件按钮
 * @param manage 是否默认展示为管理状态
 */
export async function showFile(params?: any) {
  eventBus.emit('showFile', params?.manage || false)
}
/**
 * 跳转至积木报表的 预览页面
 * @param url
 * @param id
 * @param token
 */
export function print(params: { code: string }) {
  // let domain = window._CONFIG['domianURL']
  const route = router.currentRoute.value;
  const slbh = route.query.slbh?.toString()
  let domain = 'http://192.168.27.87:7004/zrzy-form/'
  let url = `${domain}jmreport/view/${params.code}`
  url += `?slbh=${slbh}`
  window.open(url, '_blank')
}

/**
 * 记载登记簿 支持重复记载
 * @param params 
 * @returns 
 */
export function register(demoRefs: any, loading: any, params: any) {
  const route = router.currentRoute.value;
  const slbh = route.query.slbh == null ? '' : route.query.slbh.toString()
  const cType = params.cType == null ? '1' : params.cType
  // loading.value = true
  defHttp.get({
    url: '/api/zrzy-bdc/bdc/register/isRegister',
    params: { slbh: slbh }
  }, { withToken: true }
  ).then((res: any) => {
    if (res.success) {
      djb(slbh, cType);
    } else {
      if (res.result == '-1') {
        message.error(res.message)
      } else {
        Modal.confirm({
          title: res.message + ",确定要重复记载吗？",
          content: '受理编号：' + slbh,
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            djb(slbh, "0");
          },
          onCancel() {
          },
        });
      }
    }
  }).catch((error: any) => {
    message.success("记载失败" + error)
  })
}
//登记簿逻辑
function djb(slbh: string, cType: string) {
  defHttp.post({
    url: '/api/zrzy-bdc/bdc/register/saveRegister',
    params: { slbh: slbh, cType: cType }
  }, { withToken: true }
  ).then((res: any) => {
    message.success(res.message)
  }).catch((error: any) => {
    message.success("记载失败" + error)
  })
}

/**
 * 归档页保存
 * @param params 
 * @returns 
 */
export function savaGd(demoRefs: any, loading: any, params: any) {
  const route = router.currentRoute.value;
  const slbh = route.query.slbh?.toString()
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdc/yw/addGd',
      params: { slbh: slbh }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
export function baseGd(demoRefs: any, loading: any, params: any) {
  const route = router.currentRoute.value;
  const slbh = route.query.slbh?.toString()
  const taskId = route.query.taskId?.toString()
  return new Promise((resolve, reject) => {
    defHttp.get({
      url: '/api/zrzy-bdc/bdc/process/complete',
      params: { slbh: slbh, taskId: taskId }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
/**
 * 根据受理编号设置权利其他情况
 * @param viewData
 * @param fields
 */
export async function setQlqtqkBySlbh(viewData: any, fields: any) {
  let route = router.currentRoute.value
  if (viewData.value && fields) {
    if (fields.includes('.')) {
      let key = fields.split('.')
      if (!viewData.value[key[0]][key[1]]) {
        let slbh = route.query.slbh
        let result = await getQlqtqkBySLBH(slbh, viewData)
        viewData.value[key[0]][key[1]] = result
      }
    } else {
      if (!viewData.value[fields]) {
        let slbh = route.query.slbh
        let result = await getQlqtqkBySLBH(slbh, viewData)
        viewData.value[fields] = result
      }
    }
  }
}

/**
 * 根据受理编号获取权利其他配置
 * @param slbh
 */
export function getQlqtqkBySLBH(slbh: any, viewData: any) {
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/getConfigQlqtBySlbh',
      params: { slbh: slbh },
      data: {}
    }, { withToken: true }
    ).then((res: any) => {
      if (res && res.success) {
        let result = manageQLQT(res.result, viewData)
        resolve(result)
      } else {
        reject()
      }
    }).catch((error: any) => {
      console.log(error)
      reject()
    })
  })
}


/**
 * 根据业务号获取权利其他配置
 * @param slbh
 * @param ywh
 */
export function getQlqtqkByMap(slbh: any, ywh: any, viewData: any) {
  const quickParam = { ywh: ywh, slbh: slbh }
  const xmlParam = { ywh: ywh, slbh: slbh }
  const param = { quickParam: quickParam, xmlParam: xmlParam }
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/getConfigQlqtByMap',
      data: param
    }, {
      withToken: true
    }).then((res: any) => {
      if (res && res.success) {
        let result = manageQLQT(res.result, viewData)
        resolve(result)
      } else {
        reject()
      }
    }).catch(err => {
      console.log(err)
      reject()
    })
  })
}

/**
 * 替换获取到的权利其他配置值中的占位符为实际值
 * 规则为获取所有匹配 viewData.value. 形式的占位符并替换成实际值
 * @param qlqtConfig
 * @param viewData
 */
function manageQLQT(qlqtConfig: any, viewData: any) {
  // 获取未赋值的占位符，从表单数据中赋值
  let reg = /viewData\.value\.[^;；"”\s\u4e00-\u9fa5]*;?/gm //匹配以viewData.value.开头并以分号/反引号/中文/空格结尾的
  // let reg = /(?<=\[)\S+(?=\])/gm //匹配中括号，返回结果不包括中括号
  let qlqtmatch = qlqtConfig.match(reg)
  if (qlqtmatch) {
    qlqtConfig = qlqtConfig.replace('[', '')
    qlqtConfig = qlqtConfig.replace(']', '')
    qlqtmatch.forEach((value) => {
      // 获取表名及字段名
      let arr = value.split('.')
      if (arr && arr.length == 4 && viewData.value[arr[2]]) {
        let realValue = viewData.value[arr[2]][arr[3]] ? viewData.value[arr[2]][arr[3]] : ''
        qlqtConfig = qlqtConfig.replace(value, realValue)
      } else {
        console.log('占位符格式不正确！应为viewData.value.[表名].[字段名]，如有单位，中间请空格')
      }

    })
  }
  return qlqtConfig
}

/**
 * 生成证号
 */
export function createCard() {
  return new Promise((resolve, reject) => {
    let route = router.currentRoute.value
    let slbh = route.query.slbh
    defHttp.post({ url: '/api/zrzy-bdc/bdc/card/getCard', params: { slbh: slbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        message.warning(res.message)
        resolve(false)
      }
    })
  })
}

/**
 * 校验有效的权利比例
 * @param validateKey
 * @param qlrList
 * @param value
 */
export function validateQlbl(validateKey, qlrList, value) {
  if (qlrList.length > 0 && qlrList[0].gyfs == '2') {
    // 校验权利比例
    if (!validateInfos[validateKey]) {
      validateInfos[validateKey] = {
        validateStatus: 'validating',
        help: ''
      }
    }
    let validateStatus = validateInfos[validateKey]['validateStatus']
    let type = validateInfos[validateKey]['type']
    if ((validateStatus == 'validating' && type == 'default') || type != 'default') {
      // 处理脚本
      if (value && /^(100|[1-9]?\d(\.\d{1,2})?)%$/.test(value)) {
        // 将输入值的百分比转换为数字
        const qlblNum = parseFloat(value.slice(0, -1));
        const sum = qlrList.reduce((acc, item) => {
          // 累加有效的权利比例
          const itemQlbl = item.qlbl ? parseFloat(item.qlbl.slice(0, -1)) : 0;
          return acc + itemQlbl;
        }, qlblNum);

        // 验证总和是否超过 100
        if (sum > 100) {
          setValidateInfos(validateKey, 'error', '权利比例总和不能超过100%');
        } else {
          setValidateInfos(validateKey, 'validating', '');
        }
      } else {
        // 输入值格式不正确
        setValidateInfos(validateKey, 'error', '请输入正确的比例');
      }
    }
  } else {
    setValidateInfos(validateKey, 'validating', '');
  }
}
