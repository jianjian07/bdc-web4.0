import { useUserStore, useUserStoreWithOut } from "/@/store/modules/user"
import { Modal, message } from "ant-design-vue"
import { cModal } from "/@/components/cModal/index"
import { computed, createVNode, nextTick } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { currentRoute, router } from "/@/router"
import { defHttp } from "/@/utils/http/axios"
import { checkLogic } from "/@/utils/bdc/bdc"
import { Base64 } from "js-base64"
import {
  saveFormData,
  saveHandleData,
  getFormInfo,
  validateInfos,
  setInputValue,
  setValidateInfos,
  updateFormDatas
} from 'form-imagining'
import { guid } from "/@/utils";
import { getDictItemsByCode } from "/@/views/online/utils/commonUtils"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { useAppStore } from "/@/store/modules/app.ts"
import { downloadPdfByCanvas, generatePdfByHtml } from "/@/views/system/contract/genPdf.ts"

const userStore = useUserStore()
// 权利人信息
let qlrxxObj = {}
// route
let route = currentRoute

enum api {
  configList = '/api/zrzy-dzzw/caseConfig/getCaseState',
  addQlr = '/api/zrzy-bdc/bdc/qlr/add',
  editQlr = '/api/zrzy-bdc/bdc/qlr/update'
}

/**
 * 获取bdc项目下的图片
 * @param name
 */
export function getBdcImgUrl(name) {
  return new URL(`/src/assets/images/${name}`, import.meta.url).href
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
  // console.log('arr', arr)
  return arr
}

/**
 * 保存/移交
 * @param _type
 * @param demoRefs
 */
export async function sendSaveFun(type: string, demoRefs: any, btn: any, loading: any, eventBus: any, params?: any,) {
  return new Promise(async (resolve) => {
    if (btn && btn.loading !== undefined) {
      btn.loading = true
    }
    if (loading) {
      loading.value = true
    }
    if (type == 'baseSave') {
      userStore.setSaveFormFlag(false)
    } else {
      userStore.setSaveFormFlag(true)
    }
    let beforeRes = true
    let commonSaveRes: unknown
    let afterRes = true
    let validate = true
    if (params && params.beforeFun) {
      let _beforeFun = getSaveEventBusFuncStr(params.beforeFun)
      beforeRes = await eval(_beforeFun)
      console.log('beforeRes', beforeRes)
    }
    if (beforeRes) {
      // 校验通过才能执行保存接口
      if (params?.validateSave) {
        commonSaveRes = await saveHandleData(demoRefs, params?.params)
      } else {
        commonSaveRes = await saveFormData(demoRefs, params?.params)
      }
      console.log('commonSaveRes', commonSaveRes)
      if (commonSaveRes && params && params.afterFun) {
        let _afterFun = getSaveEventBusFuncStr(params.afterFun)
        afterRes = await eval(_afterFun)
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
    if (loading) {
      loading.value = false
    }
    if (btn && btn.loading !== undefined) {
      btn.loading = false
    }
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
        validate = !commonSaveRes.find(com => !com.validate)
        saveStatus = true
        if (validate) {
          msg = type === 'baseSave' ? "保存成功!" : "保存成功,可进行移交!"
        } else {
          // 表单暂存，校验不通过，也提示表单保存成功
          msg = "暂存成功!"
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
    // console.log('saveStatus', saveStatus)
    // console.log('validate', validate)
    resolve({ status: saveStatus, validate: validate })
  })
}

/**
 * 保存前/后方法参数默认传递 局部eventbus
 * @param fun
 */
function getSaveEventBusFuncStr(fun) {
  let str = ''
  // 提取函数名
  const funName = fun.substring(0, fun.indexOf('(')).trim();
  const paramStr = fun.substring(fun.indexOf('(') + 1, fun.lastIndexOf(')')).trim();

  // 插入 eventBus 到第一个参数
  let finalParamStr = paramStr ? `eventBus, ${paramStr}` : `eventBus`;
  str = `${funName}(${finalParamStr})`;
  return str
}

export async function baseSave(demoRefs: any, btn: any, loading: any,  jdmc: string, eventBus: any, params: any) {
  return await sendSaveFun('baseSave', demoRefs, btn, loading, eventBus, params)
}

export async function handOver(demoRefs: any, btn: any, loading: any, jdmc: string, eventBus: any, params: any) {
  let res: any = await sendSaveFun('handOver', demoRefs, btn, loading, eventBus, params)
  if (res && res.status && res.validate) {
    const slbh = route.query.slbh == null ? '' : route.query.slbh.toString()
    let checkRes: any = true
    if (['收件','受理', '初审', '复审', '核定', '审核', '登簿', '记载登记簿'].includes(jdmc)) {
      checkRes = await checkSeal(slbh, btn, loading)
    }
    if (checkRes) {
      let btnList = await getHandleCkbzBtn()
      let footerList = btnList.length ? btnList.map((btn) => { return { func: markRight, ...btn } }) : []
      let modal = cModal({
        title: '移交',
        width: '45vw',
        filePath: 'views/bdc/public/HandleModal',
        footerExtendBtn: footerList,
        isDefaultBtn: !footerList.find(f => f.isDefaultBtn == false),
        onOk: async (res: any) => {
          if (res) {
            modal.destroy()
            // 关闭当前标签页
            closeCurrentTab()
          }
        }
      })

      async function markRight(res) {
        if (res && res.markRight) {
          let _result = await res.markRight()
          console.log(_result)
          if (_result) {
            modal.destroy()
            // 关闭当前标签页
            closeCurrentTab()
          }
        }
      }

    }
  }
  return res
}

/**
 * 关闭当前页面
 */
export function closeCurrentTab() {
  const tabStore = useTabsStore()
  const { getTabsShow } = useTabsSetting()
  if (getTabsShow.value) {
    const currentTab = computed(() => tabStore.getCurrentTab)
    tabStore.removeTab(currentTab.value)
    setTimeout(() => {
      if (tabStore.getCurrentTab.fullPath == '/bdc/case/list' || tabStore.getCurrentTab.fullPath == '/bdc/case/AdminList') {
        const tabStore = useTabsStore()
        tabStore.refreshTab()
        // router.push('/refresh')
      }
    }, 500)
  } else {
    router.push('/analysis')
  }
}

/**
 * 提交(查封台账)
 * @param demoRefs
 * @param loading
 * @param type
 */
export async function submit(demoRefs: any, btn: any, loading: any, jdmc: string, eventBus: any, obj: any) {
  if (obj && obj.type == 'cftz') {
    let res = await getFormInfo(demoRefs)
    let find = res.find(r => r.validate == false)
    let validateFlag = !find
    if (!validateFlag) {
      // message.warning('请检查表单填写')
    } else {
      let el: any = document.getElementById('qszt') as HTMLElement
      if (el) {
        let query = route.query
        if (query.jf == '1') {
          // 解封界面 状态提交改为2
          setInputValue(el, '2')
        } else {
          // 查封界面 状态提交改为1
          setInputValue(el, '1')
        }
      }
      let newInfo = await getFormInfo(demoRefs)
      let allRes: any = []
      for (let i = 0; i < res.length; i++) {
        const promiseRes = await updateFormDatas(newInfo[i])
        allRes.push(promiseRes)
      }
      let status = allRes ? allRes.filter(r => r).length == res.length : false
      if (status) {
        let yw = await updateYwblqk()
        if (yw) {
          message.success('提交成功!')
          closeCurrentTab()
        }
      }
    }
  }
}

/**
 * 查封台账更新业务办理情况
 */
function updateYwblqk() {
  let slbh = route.query.slbh
  return new Promise((resolve, reject) => {
    defHttp.put({ url: '/api/zrzy-bdc/bdc/bdcCftz/updateYwblqkBySlbh', params: { slbh: slbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
      } else {
        message.warning('更新业务办理情况出错')
        resolve(false)
      }
    })
  })
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
 * 批量解查封
 * @param demoRefs
 * @param spinning
 * @param params
 */
export async function sendPlJcf(demoRefs: any, spinning: any, params?: any) {
  spinning.value = true
  let saveRes: any = false
  let _result = await getFormInfo(demoRefs)
  if (_result) {
    let find = _result.filter(r => r.formId == '77')[0]
    if (find && find.validate) {
      let data = find.data[0].bdc_cftz
      const newQlrData = {};
      let arr = params.id0Checks || []
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          newQlrData[key.toLowerCase()] = data[key];
        }
      }
      let merged = Object.assign({}, newQlrData, { qszt: '2' });
      arr = arr.map((item) => {
        return {
          id0: item,
          ...merged
        }
      })
      saveRes = await editBatchJcf(arr)
    }
  }
  spinning.value = false
  return saveRes
}

function editBatchJcf(arr) {
  return new Promise((resolve, reject) => {
    defHttp.put({ url: '/api/zrzy-bdc/bdc/bdcCftz/editBatch', data: arr }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
        message.success('提交成功!')
      } else {
        resolve(false)
        message.warning('提交失败!')
      }
    })
  })
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
    let find = _result.filter(r => r.formId == '55' || r.formId == '116' || r.formId == '109' || r.formId == '117')[0]
    if (find && find.validate) {
      let qlrData = find.data[0].bdc_qlr
      const newQlrData = {};
      let qlrid = params.qlrid ? { qlrid: params.qlrid } : {}
      let sxh = type == 'add' ? { sxh: params.sxh } : {}
      let _param = {
        ywh: params.ywh,
        bdcdyh: params.bdcdyh,
        slbh: params.slbh,
        qlrlb: params.qlrlb,
        oldZjh: params.zjh,
        ...qlrid,
        ...sxh
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
export async function showFile(demoRefs: any, btn: any, loading: any, jdmc: string, eventBus: any, params?: any) {
  eventBus.emit('showFile', params?.manage || false)
}

/**
 * 附件按钮（新标签页）
 * @param params
 */
export function showFileNewBlank(demoRefs: any, btn:any, loading: any, jdmc: string, eventBus: any, params?: any) {
  let query = route.query
  const urlSearchParams = new URLSearchParams(query)
  urlSearchParams.set('manage', params?.manage ?? false) // 设置 manage 参数
  const queryString = urlSearchParams.toString()
  window.open('/ssofile/blankIndex?' + queryString, '_blank')
}

/**
 * 审批过程按钮
 * @param demoRefs
 * @param loading
 * @param params
 */
export async function showSpPanel(demoRefs: any, btn: any, loading: any, jdmc: string, eventBus: any, params?: any) {
  eventBus.emit('showSpPanel')
}

/**
 * 刷新表单列表
 * @param demoRefs
 * @param loading
 */
export function reloadTable(eventBus: any) {
  eventBus.emit('onTableReload')
  return true
}

/**
 * 跳转至积木报表的 预览页面
 * @param url
 * @param id
 * @param token
 */
export async function print(params: { code: string, [key: string]: string | number }) {
  // let domain = window._CONFIG['domianURL']
  const routeSlbh = route.query.slbh?.toString(); // 从路由获取的 slbh
  let domain = ''
  let url: any = ''
  const queryParams = new URLSearchParams()
  const slbhValue = params.slbh ? params.slbh.toString() : routeSlbh
  if (slbhValue) {
    queryParams.append('slbh', slbhValue)
  }
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'code' && key !== 'slbh' && (typeof value === 'string' || typeof value === 'number')) {
      queryParams.append(key, value.toString())
    }
  })

  if (params.code.includes('.frx')) {
    let obj = Object.fromEntries(queryParams.entries())
    let reportName = params.code.replace(/\.frx$/, '')
    let _data = {
      ...obj,
      reportName,
      printType: 'pdf'
    }
    url = await getReportUrl(_data)
  } else {
    const userStore = useUserStoreWithOut();
    const token = userStore.getToken
    domain = `${window.settingConfig.jmreportDomain}/zrzy-form/`
    url = `${domain}jmreport/view/${params.code}`
    url += `?${queryParams.toString()}&token=${token}`
  }
  if (url) {
    window.open(url, '_blank')
  }
}

/**
 * 获取FastReport地址
 * @param data
 */
function getReportUrl(data) {
  return new Promise((resolve) => {
    defHttp.post({ url: '/api/zrzy-bdc/bdc/FastReport/printFastReport', data: data }, { withToken: true }).then((res) => {
      if (res && res.success) {
        //let urlCertView = `${window.settingConfig.kkFileDomain}/onlinePreview?officePreviewType=pdf&url=${Base64.encode(res.result)}`;
        //resolve(urlCertView);
        resolve(res.result);
      } else {
        message.warning(res?.message || '获取地址失败!')
        resolve(false)
      }
    })
  })
}

/**
 * 记载登记簿 支持重复记载
 * @param params
 * cType为0不生成证号
 * @returns
 */
export async function register(demoRefs: any, btn: any, loading: any, jdmc: string, eventBus: any, params: any) {
  const slbh = route.query.slbh == null ? '' : route.query.slbh.toString()
  const cType = (params == undefined || params.cType == null) ? '1' : params.cType
  const callback = params?.callback
  let checkRes = await checkSeal(slbh, btn, loading)
  if (!checkRes) {
    return
  }
  if (btn && btn.loading !== undefined) {
    btn.loading = true
  }
  loading.value = true
  defHttp.get({
    url: '/api/zrzy-bdc/bdc/register/isRegister',
    params: { slbh: slbh }
  }, { withToken: true }
  ).then((res: any) => {
    loading.value = false
    if (btn && btn.loading !== undefined) {
      btn.loading = false
    }
    if (res.success) {
      djb(slbh, cType, btn, loading, callback);
    } else {
      if (res.result == '-1') {
        message.error(res?.message)
      } else {
        Modal.confirm({
          title: res?.message + ",确定要重复记载吗？",
          content: '受理编号：' + slbh,
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            djb(slbh, "0", btn, loading, callback);
          },
          onCancel() {
          },
        });
      }
    }
  }).catch((error: any) => {
    loading.value = false
    if (btn && btn.loading !== undefined) {
      btn.loading = false
    }
    message.warning("记载失败" + error)
  })
}

/**
 * 保存移交逻辑校验
 */
function checkSeal(slbh: string, btn: any, loading?: any) {
  return new Promise((resolve, reject) => {
    if (btn && btn.loading !== undefined) {
      btn.loading = true
    }
    if (loading) {
      loading.value = true
    }
    defHttp.post({
      url: '/api/zrzy-logic/logic/check/checkSeal',
      params: { slbh: slbh }
    }, { withToken: true }).then((res: any) => {
      if (btn && btn.loading !== undefined) {
        btn.loading = false
      }
      if (loading) {
        loading.value = false
      }
      if (res && res.success && res.result.code == 1) {
        resolve(true)
      } else if (res && res.success && res.result.code == 0) {
        Modal.confirm({
          title: '提示',
          icon: createVNode(ExclamationCircleOutlined),
          content: createVNode('div', { style: 'color:red' }, res?.message || res?.result?.message),
          onOk() {
            resolve(true)
          },
          onCancel() {
            resolve(false)
          }
        });
      } else {
        message.warning(res?.message || res?.result?.message || '逻辑校验不通过!')
        resolve(false)
      }
    }).catch((error: any) => {
      if (btn && btn.loading !== undefined) {
        btn.loading = false
      }
      if (loading) {
        loading.value = false
      }
      resolve(false)
      message.success("逻辑校验失败!" + error)
    })
  })
}

//登记簿逻辑
function djb(slbh: string, cType: string, btn: any, loading?: any, callback?: any) {
  if (btn && btn.loading !== undefined) {
    btn.loading = true
  }
  if (loading) {
    loading.value = true
  }
  defHttp.post({
    url: '/api/zrzy-bdc/bdc/register/saveRegister',
    params: { slbh: slbh, cType: cType }
  }, { withToken: true }
  ).then(async (res: any) => {
    if (btn && btn.loading !== undefined) {
      btn.loading = false
    }
    if (loading) {
      loading.value = false
    }
    if (res && res.success) {
      message.success(res?.message)
      let _callbackRes = true
      if (callback) {
        _callbackRes = await eval(callback)
      }
      if (_callbackRes) {
        // 刷新
        const tabStore = useTabsStore()
        tabStore.refreshTab()
        // router.push('/refresh')
      }
    } else {
      message.warning(res?.message || '记载失败!')
    }
  }).catch((error: any) => {
    if (btn && btn.loading !== undefined) {
      btn.loading = false
    }
    if (loading) {
      loading.value = false
    }
    message.warning("记载失败" + error)
  })
}

/**
 * 归档页保存
 * @param params
 * @returns
 */
export function savaGd() {
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
export function baseGd(demoRefs: any, btn: any, loading: any, jdmc: string, eventBus: any, params: any) {
  const slbh = route.query.slbh?.toString()
  const taskId = route.query.taskId?.toString()
  return new Promise(async (resolve, reject) => {
    let validateFlag = true
    if (params?.validate) {
      let res = await getFormInfo(demoRefs)
      let find = res.find(r => r.validate == false)
      validateFlag = !find
    }
    if (validateFlag) {
      Modal.confirm({
        title: "确定要进行归档吗？",
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        async onOk() {
          defHttp.get({
            url: '/api/zrzy-bdc/bdc/process/complete',
            params: { slbh: slbh, taskId: taskId }
          }, { withToken: true }).then((res) => {
            if (res && res.success) {
              message.success(res?.message || '归档成功!')
              closeCurrentTab()
              resolve(true)
            } else {
              message.warning(res?.message || '归档失败!')
              resolve(false)
            }
          })
        }
      })
    }
  })
}
/**
 * 根据受理编号设置权利其他情况
 * @param viewData
 * @param fields
 */
export async function setQlqtqkBySlbh(viewData: any, fields: any, params: any, basicInfo: any) {
  if (viewData.value && fields) {
    if (fields.includes('.')) {
      let key = fields.split('.')
      if (!viewData.value[key[0]][key[1]]) {
        let slbh = route.query.slbh
        let result = await getQlqtqkBySLBH(slbh, viewData, params, basicInfo)
        viewData.value[key[0]][key[1]] = result
      }
    } else {
      if (!viewData.value[fields]) {
        let slbh = route.query.slbh
        let result = await getQlqtqkBySLBH(slbh, viewData, params, basicInfo)
        viewData.value[fields] = result
      }
    }
  }
}

/**
 * 根据受理编号设置权利其他情况
 * @param viewData
 * @param fields
 */
export async function setQlqtqkByYwh(viewData: any, fields: any, params: any, basicInfo: any) {
  if (viewData.value && fields) {
    if (fields.includes('.')) {
      let key = fields.split('.')
      if (!viewData.value[key[0]][key[1]]) {
        let slbh = route.query.slbh
        let ywh = params?.ywh
        let result = await getQlqtqkByMap(slbh, ywh, viewData, params, basicInfo)
        viewData.value[key[0]][key[1]] = result
      }
    } else {
      if (!viewData.value[fields]) {
        let slbh = route.query.slbh
        let ywh = params?.ywh
        let result = await getQlqtqkByMap(slbh, ywh, viewData, params, basicInfo)
        viewData.value[fields] = result
      }
    }
  }
}

/**
 * 根据受理编号获取权利其他配置
 * @param slbh
 */
export function getQlqtqkBySLBH(slbh: any, viewData: any, params: any = null, basicInfo: any) {
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/getConfigQlqtBySlbh',
      params: {
        slbh: slbh,
        sfybz: params?.sfybz || '',
        qllx: params?.qllx || ''
      },
      data: {}
    }, { withToken: true }
    ).then((res: any) => {
      if (res && res.success) {
        let result = manageQLQT(res.result, viewData, basicInfo)
        resolve(result)
      } else {
        message.warning(res?.message || '查询出错！')
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
export function getQlqtqkByMap(slbh: any, ywh: any, viewData: any, params: any = null, basicInfo: any) {
  const quickParam = { ywh: ywh, slbh: slbh, sfybz: params?.sfybz || '', qllx: params?.qllx || '' }
  const xmlParam = { ywh: ywh, slbh: slbh, sfybz: params?.sfybz || '', qllx: params?.qllx || '' }
  const param = { quickParam: quickParam, xmlParam: xmlParam }
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/getConfigQlqtByMap',
      data: param
    }, {
      withToken: true
    }).then((res: any) => {
      if (res && res.success) {
        let result = manageQLQT(res.result, viewData, basicInfo)
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
 * 批量生成权利其他情况
 */
export function batchQlqt() {
  return new Promise((resolve, reject) => {
    let slbh = route.query.slbh
    defHttp.post({
      url: '/api/zrzy-bdc/bdcdj/bdcQlqtpz/updateQlqtBatch',
      params: { slbh: slbh }
    }, {
      withToken: true
    }).then((res: any) => {
      if (res && res.success) {
        resolve(true)
        message.success('成功生成!')
      } else {
        message.warning(res?.message)
        resolve(false)
      }
    })
  }).catch(err => {
    message.warning(err)
  })
}

/**
 * 替换获取到的权利其他配置值中的占位符为实际值
 * 规则为获取所有匹配 viewData.value. 形式的占位符并替换成实际值
 * @param qlqtConfig
 * @param viewData
 */
function manageQLQTOld(qlqtConfig: any, viewData: any) {
  // 获取未赋值的占位符，从表单数据中赋值
  // let reg = /viewData\.value\.[^;；"”\s\u4e00-\u9fa5]*;?/g //匹配以viewData.value.开头并以分号/反引号/中文/空格结尾的
  // let reg = /(?<=\[)\S+(?=\])/g //匹配中括号，返回结果不包括中括号
  let reg = /(?<=\$)(viewData\.value\.[^\$]+)(?=\$)/g; //匹配$viewData.value.***$，返回结果不包括$
  let qlqtmatch = qlqtConfig.match(reg)
  if (qlqtmatch) {
    qlqtConfig = qlqtConfig.replaceAll('$', '')
    qlqtmatch.forEach((value) => {
      // 获取表名及字段名
      let arr = value.split('.')
      if (arr && arr.length == 4 && viewData.value[arr[2]]) {
        let realValue = viewData.value[arr[2]][arr[3]] ? viewData.value[arr[2]][arr[3]] : ''
        qlqtConfig = qlqtConfig.replace(value, realValue)
      } else {
        console.log('占位符格式不正确！应为 $viewData.value.[表名].[字段名]$')
      }

    })
  }
  return qlqtConfig
}

/**
 * 替换获取到的权利其他配置值中的占位符为实际值
 * 规则为获取所有匹配 viewData.value./ basicInfo.value 形式的占位符并替换成实际值
 * @param qlqtConfig
 * @param viewData
 */
function manageQLQT(qlqtConfig: string, viewData: any, basicInfo: any) {
  const reg = /\$(viewData|basicInfo)\.value(?:\.[^\$]+)+\$/g; // 匹配 $viewData.value.xxx$ 或 $basicInfo.value.xxx.xxx$

  const qlqtmatch = qlqtConfig.match(reg)
  if (qlqtmatch) {
    qlqtmatch.forEach((match) => {
      const cleanMatch = match.slice(1, -1) // 去掉首尾的 $
      const parts = cleanMatch.split('.')  // 分割为 [viewData, value, bdc_dydj, dyfs] 或 [basicInfo, value, dyfs]

      const source = parts[0] // viewData 或 basicInfo
      const path = parts.slice(2)

      let rootData = source === 'viewData' ? viewData : basicInfo;
      let realValue: any = rootData?.value;

      for (const key of path) {
        if (realValue && realValue[key] != null) {
          realValue = realValue[key];
        } else {
          realValue = ''
          break;
        }
      }

      qlqtConfig = qlqtConfig.replace(match, realValue);
    });
  }

  return qlqtConfig;
}

/**
 * 生成证号
 */
export function createCard() {
  return new Promise((resolve, reject) => {
    let slbh = route.query.slbh
    defHttp.post({ url: '/api/zrzy-bdc/bdc/card/getCard', params: { slbh: slbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        message.warning(res?.message)
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
 * @param gyfs
 * @param isSave
 */
export function validateQlbl(validateKey, qlrList, value, gyfs, isSave?: boolean) {
  if (qlrList.length >= 0 && gyfs == '2') {
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
          if (isSave) {
            message.warning('权利比例总和不能超过100%')
          }
        } else {
          setValidateInfos(validateKey, 'validating', '');
        }
      } else {
        // 输入值格式不正确
        setValidateInfos(validateKey, 'error', '请输入正确的比例');
        if (isSave) {
          message.warning('输入值格式不正确')
        }
      }
    }
  } else {
    setValidateInfos(validateKey, 'validating', '');
  }
}

/**
 * 通过业务号删除数据
 * @param ywh
 */
export function delDataByYwh(ywh) {
  return new Promise((resolve) => {
    defHttp.delete({
      url: '/api/zrzy-bdc/bdc/case/deleteBusinessData',
      params: { type: 2 },
      data: { ywh: ywh }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('删除成功')
        resolve(true)
      } else {
        message.error('删除失败')
        resolve(false)
      }
    })
  })
}

/**
 * 通过受理编号删除数据
 * @param slbh
 */
export function delDataBySlbh(slbh) {
  return new Promise((resolve) => {
    defHttp.delete({
      url: '/api/zrzy-bdc/bdc/case/deleteBusinessData',
      params: { type: 1 },
      data: { slbh: slbh }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('删除成功')
        resolve(true)
      } else {
        message.error('删除失败')
        resolve(false)
      }
    })
  })
}

/**
 * 通过受理编号和幢编码删除数据
 * @param slbh
 * @param zbm
 */
export function delDataBySlbhZbm(slbh, zbm) {
  return new Promise((resolve) => {
    defHttp.delete({
      url: '/api/zrzy-bdc/bdc/case/deleteBusinessData',
      params: { type: 3 },
      data: { slbh: slbh, zbm: zbm }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('删除成功')
        resolve(true)
      } else {
        message.error('删除失败')
        resolve(false)
      }
    })
  })
}

/**
 * 通过受理编号和不动产单元号删除数据
 * @param slbh
 * @param bdcdyh
 */
export function delDataBySlbhBdcdyh(slbh, bdcdyh) {
  return new Promise((resolve) => {
    defHttp.delete({
      url: '/api/zrzy-bdc/bdc/case/deleteBusinessData',
      params: { type: 4 },
      data: { slbh: slbh, bdcdyh: bdcdyh }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('删除成功')
        resolve(true)
      } else {
        message.error('删除失败')
        resolve(false)
      }
    })
  })
}

/**
 * 通过主键删除数据
 * @param keyName
 * @param keyValue
 * @param tableName
 */
export function delDataByKey(keyName, keyValue, tableName) {
  return new Promise((resolve) => {
    if (keyValue && keyName && tableName) {
      defHttp.post({
        url: '/imaginform/zrzy-form/form/report/deleteRow',
        params: {
          keyCol: keyName,
          tableName: tableName,
          keyValue: keyValue,
        }
      }, { withToken: true }).then((res) => {
        if (res && res.success) {
          message.success('删除成功!')
          resolve(true)
        } else {
          message.warning('删除失败!')
          resolve(false)
        }
      })
    } else {
      message.warning('请确认参数传递正确!')
      resolve(false)
    }
  })
}

/**
 * 注销其中一户
 * @param ywh
 * @param djlx
 */
export function logOffDataByYwh(ywh, djlx) {
  return new Promise((resolve) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdc/case/delDataByYwh',
      params: { ywh: ywh, djlx: djlx },
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('注销成功')
        resolve(true)
      } else {
        message.error('注销失败')
        resolve(false)
      }
    })
  })
}

/**
 * 获取缴费单位
 * @param viewData
 * @param fields
 */
export function getPayMan(viewData, tableName, field) {
  const slbh = route.query.slbh?.toString()
  if (!viewData.value[tableName][field]) {
    if (slbh) {
      defHttp.get({ url: '/api/zrzy-bdc/bdc/sf/getPayMan', params: { slbh: slbh } }, { withToken: true }).then((res) => {
        if (res && res.success) {
          viewData.value[tableName][field] = res.result
        } else {
          message.warning('获取缴费单位出错!')
        }
      })
    } else {
      console.log('受理编号未获取到!')
    }
  }
}

/**
 * 预览登记簿
 * @param record
 */
export function previewDjb(record?: any) {
  const slbh = route.query.slbh?.toString()
  if (record || slbh) {
    router.push({ path: '/djb/preview', query: { slbh: slbh, ywh: record?.ywh } })
  }
}

/**
 * 查看登记簿
 * @param record
 */
export function lookDjb(record?: any) {
  const slbh = route.query.slbh?.toString()
  if (record || slbh) {
    router.push({ path: '/djb/print', query: { slbh: slbh, ywh: record?.ywh } })
  }
}

/**
 * 创建查封台账
 */
export function addCfCase() {
  defHttp.post({ url: '/api/zrzy-bdc/bdc/bdcCftz/start', data: { lcid: 'cf1735093073136' } }, { withToken: true }).then(res => {
    if (res.success) {
      router.push({ path: '/bdc/blcasedoing', query: { slbh: res.result.slbh, jf: '0' } });
    } else {
      message.error('创建失败')
    }
  })
}

/**
 * 编辑查封台账
 * @param type 0 查封 1 解封
 */
export function editCfOrJfCase(slbh, type) {
  if (slbh) {
    router.push({ path: '/bdc/blcasedoing', query: { slbh: slbh, jf: type } });
  } else {
    message.warning('受理编号为空!')
  }
}

/**
 * 导入查封台账
 */
export function importCfCase() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';

  document.body.appendChild(fileInput);

  // 监听用户选择文件后
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) {
      alert('请选择一个文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    defHttp.post(
      {
        url: '/api/zrzy-bdc/bdc/bdcCftz/importExcel',
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      },
      { withToken: true, withTimeout: false }
    ).then((res: any) => {
      if (res && res.success) {
        message.success('导入成功!')
      } else {
        message.warning(res?.message || '导入失败!')
      }

      // 清理掉临时创建的 input
      document.body.removeChild(fileInput);
    })
  });

  fileInput.click();
}

/**
 * 选择审批意见
 * @param viewData
 * @param fields
 */
export async function chooseSpyj(viewData: any, fields: any) {
  if (viewData.value && fields) {
    if (fields.includes('.')) {
      let key = fields.split('.')
      if (!viewData.value[key[0]][key[1]]) {
        let spyj = await getSpyj()
        if (spyj) {
          viewData.value[key[0]][key[1]] = spyj
        }
      }
    } else {
      if (!viewData.value[fields]) {
        let spyj = await getSpyj()
        if (spyj) {
          viewData.value[fields] = spyj
        }
      }
    }
  }
}

function getSpyj() {
  return new Promise((resolve, reject) => {
    let modal = cModal({
      title: '审批意见',
      width: 800,
      filePath: 'views/bdc/pages/public/SpyjList',
      onOk: async (res: any) => {
        // res为弹窗内组件的dom
        let row = await res.getSelectRow()
        if (row && row.length > 0) {
          resolve(row[0].designContent)
          modal.destroy()
        } else {
          message.warning('请选中一条数据!')
        }
      },
      onCancel: () => {
        resolve(false)
        modal.destroy()
      }
    })
  })
}

/**
 * 选择库格
 * @param slbh
 * @param viewData
 */
export function chooseKgLpb(slbh, viewData) {
  let modal = cModal({
    title: '库格楼盘表',
    isFullScreen: true,
    filePath: 'views/system/filemanage/components/KgLpb',
    formData: {
      slbh: slbh,
      id: viewData.value.bdc_yw_gd.pjh,
      dahgg: viewData.value.bdc_yw_gd.dahgg
    },
    onOk: async (res: any) => {
      if (res) {
        viewData.value.bdc_yw_gd.dacfjbm = res
        modal.destroy()
      }
    }
  })
}

/**
 * 获取库房选项
 */
export function getKfOptions() {
  return new Promise((resolve, reject) => {
    defHttp.get({
      url: '/api/zrzy-bdc/arch/arch/getArchiveCodeTbl',
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        message.warning(res?.message)
        resolve([])
      }
    })
  })
}

/**
 * 根据库房id查询排架下拉字典
 * @param kfid
 */
export function getPjOptionsByKf(kfid) {
  return new Promise((resolve, reject) => {
    if (kfid) {
      defHttp.get({
        url: '/api/zrzy-bdc/arch/arch/getPjCodeTbl',
        params: { kfid: kfid }
      }, { withToken: true }).then((res) => {
        if (res && res.success) {
          resolve(res.result)
        } else {
          message.warning(res?.message)
          resolve([])
        }
      })
    } else {
      resolve([])
    }
  })
}

/**
 * 生成档案号
 */
export function createDah(viewData, tableName, field) {
  defHttp.get({
    url: '/api/zrzy-bdc/arch/arch/genArchiveCode'
  }, { withToken: true }).then((res) => {
    if (res && res.success) {
      viewData.value[tableName][field] = res.result
    } else {
      message.warning(res?.message)
    }
  })
}

/**
 * 获取构建逻辑校验参数
 * @param wwSlbh
 */
export function getLogicModel(wwSlbh) {
  return new Promise((resolve, reject) => {
    defHttp.post({
      url: '/api/zrzy-bdc/bdcww/wwtobdc/getLogicCheckModel',
      params: {
        wwSlbh: wwSlbh
      }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        message.warning(res?.message)
        resolve(false)
      }
    })
  })
}

/**
 * 逻辑校验
 * @param options
 */
export async function checkLogicFun(options) {
  return await checkLogic(options)
}

/**
 * 外网收件提取/退件
 * @param options
 */
export function handleWwsjFun(options) {
  return new Promise((resolve, reject) => {
    let defUrl = `/api/zrzy-bdc/bdcww/wwtobdc/${options.action}`;
    defHttp.post({ url: defUrl, params: { wwSlbh: options.slbh, yj: options.yj, allowEdit: options.allowEdit } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        // 退件result为null,避免后续判断问题,给个1返回值
        resolve(res.result || 1)
      } else {
        message.warning(res?.message)
        resolve(false)
      }
    })
  })
}

/**
 * 关联数据
 * @param options
 */
export async function relateData(options: any) {
  return new Promise((resolve, reject) => {
    const { data } = options
    const slbh = route.query.slbh?.toString()
    let dyhList: any = []
    for (let index = 0; index < data.length; index++) {
      const dyh = data[index];
      dyhList.push({ bdcdyh: dyh.bdcdyh, ywh: dyh.ywh, bdcqzh: dyh.bdcqzh })
    }
    let _data: any = {
      "slbh": slbh,
      "dyhList": dyhList
    }
    defHttp.post({
      url: '/api/zrzy-bdc/bdc/glgx/relate',
      data: _data
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
        message.success('数据关联成功')
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
        message.warning(res?.message || '数据关联发生错误')
        resolve(false)
      }
    })
  })
}

/**
 * 获取部门选项
 */
export function getDeptOptions() {
  return new Promise((resolve, reject) => {
    let url = '/api/zrzy-system/sys/dept/deptTree'
    defHttp.get({ url: url }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result || [])
      } else {
        resolve([])
      }
    })
  })
}

/**
 * 获取区域选项
 */
export function getRegionOptions() {
  return new Promise((resolve, reject) => {

    function normalizeTreeData(list: any[]) {
      return list.map(item => {
        const newItem = {
          ...item,
          key: item.areaCode,
          value: item.areaCode,
        }
        if (item.children?.length) {
          newItem.children = normalizeTreeData(item.children)
        }
        return newItem
      })
    }
    let url = '/api/zrzy-system/sys/areacode/queryAreaTreeAndZdgs'
    defHttp.get({ url: url }, { withToken: true }).then((res) => {
      if (res && res.success) {
        let list = normalizeTreeData(res.result)
        resolve(list || [])
      } else {
        resolve([])
      }
    })
  })
}


/**
 * 获取子系统选项
 */
export function getSystemList() {
  return new Promise((resolve) => {
    defHttp.get(
        {
          url: '/api/zrzy-system/sys/sysSubsystem/list',
          params: { pageSize: 1000, pageNo: 1 }
        },
        { withToken: true }
    ).then((res: any) => {
      if (res && res.success) {
        resolve(res.result.records || [])
      } else {
        resolve([])
      }
    })
  })
}

export function cc() {
  message.success('ccccc')
}

/**
 * 创建分割合并转移登记流程
 * @param ywlx 业务类型
 * @param slbh 受理编号
 * @param dyhList 待转移单元列表
 */
export function createFghbZy(ywlx, slbh, dyhList) {
  return new Promise(async (resolve) => {
    let _data: any =
    {
      "ywlx": ywlx,
      "slbh": slbh,
      "dyhList": dyhList
    }
    defHttp.post({
      url: '/api/zrzy-bdc/bdc/case/addCaseFghbzy',
      data: _data
    }, { withToken: true }).then((res) => {
      if (res.success) {
        message.success('转移成功')
        resolve(true)
      } else {
        message.warning(res?.message)
        resolve(false)
      }
    }).catch((e) => {
      message.error(e)
      resolve(false)
    })
  })
}

/**
 * 刷新权利人
 * @param qlrxsmc
 * @description 所有都刷新不传参数,多个逗号隔开
 */
export function reloadQlrList(eventBus: any, qlrxsmc?: string) {
  eventBus.emit('reloadQlrList', qlrxsmc)
}

/**
 * 更新权利人信息
 * @param list
 */
export function updateQlrxxList(obj) {
  qlrxxObj = obj
}

/**
 * 获取权利人共有情况
 */
export function getQlrGyqk() {
  debugger
  let gyqk = ''
  let usefulQlrList = []
  for (const key in qlrxxObj) {
    let qlrlxmc = qlrxxObj[key].qlrlxmc
    if (['权利人', '抵押权人', '预告权利人'].includes(qlrlxmc)) {
      usefulQlrList = qlrxxObj[key].list
    }
  }
  if (usefulQlrList.length) {
    let gyfs = usefulQlrList[0].gyfs
    let gyfsLabel = getDictItemsByCode('gyfs').find(f => f.value == gyfs)?.label
    if (gyfsLabel == '按份共有') {
      gyqk = '按份共有: '
      for (let i = 0; i < usefulQlrList.length; i++) {
        gyqk += `${usefulQlrList[i].qlrmc}占${usefulQlrList[i].qlbl}`
        gyqk += i != usefulQlrList.length - 1 ? '，' : ''
      }
    } else {
      gyqk = gyfsLabel
    }
  }
  return gyqk
}

/**
 * 获取权利人附记
 */
export function getQlrFj() {
  let fj = ''
  let usefulQlrList = []
  for (const key in qlrxxObj) {
    let qlrlxmc = qlrxxObj[key].qlrlxmc
    if (['权利人', '抵押人', '预告权利人', '预告抵押人'].includes(qlrlxmc)) {
      usefulQlrList = qlrxxObj[key].list
    }
  }
  if (usefulQlrList.length) {
    for (let i = 0; i < usefulQlrList.length; i++) {
      fj += `${usefulQlrList[i].qlrmc} ${usefulQlrList[i].zjh}`
      fj += i != usefulQlrList.length - 1 ? '，' : ''
    }
  }
  return fj
}

/**
 * 批量重新上报
 * @param ids
 */
export function plReport(ids) {
  return new Promise((resolve, reject) => {
      defHttp.post({ url: '/api/zrzy-report/bdc/report/reReportBatch', data: ids }, {
          withToken: true,
          withTimeout: false
      }).then((res) => {
      if (res && res.success) {
        message.success('上报成功!' + res?.message)
        resolve(true)
      } else {
        message.warning(res?.message || '上报失败!')
        resolve(false)
      }
    })
  })
}

/**
 * 单个重新上报
 * @param id
 */
export function reReport(id, type = 'business') {
  return new Promise((resolve) => {
    let url = type == 'register' ? '/api/zrzy-report/bdc/report/register/reReport' : '/api/zrzy-report/bdc/report/reReport'
    defHttp.post({ url: url, params: { id: id } }, { withToken: true, withTimeout: false }).then((res) => {
      if (res && res.success) {
        message.success('上报成功!' + res?.message)
        resolve(true)
      } else {
        message.warning(res?.message || '上报失败!')
        resolve(false)
      }
    })
  })
}

/**
 * 复制信息
 * @param text
 */
export function copyText(text: string) {
  const nav = navigator
  nav.clipboard
    .writeText(text)
    .then(() => {
      message.success("内容已复制到剪切板！");
    })
    .catch((error) => {
      message.warning("操作失败： ", error);
    });
}

/**
 * 判断 base64 是否以图片的头部签名开头
 * @param str
 */
export function processBase64Image(str: string): string {
  const imageMimeTypes = {
    jpeg: /^\/9j\/[A-Za-z0-9+/=]+$/,
    png: /^iVBORw0KGgo[A-Za-z0-9+/=]+$/,
    gif: /^R0lGODlh[A-Za-z0-9+/=]+$/,
    webp: /^UklGR[A-Za-z0-9+/=]+$/,
  }

  for (const [type, regex] of Object.entries(imageMimeTypes)) {
    if (regex.test(str)) {
      return `data:image/${type};base64,${str}`
    }
  }

  return str
}

/**
 * 提取base64的字符串
 * @param str
 */
export function extractPureBase64(str: string): string {
  const match = str.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/);
  if (match) {
    return match[1]
  }
  return str
}

/**
 * 获取企业信息(权利人中查询)
 * @param qlrmc
 * @param zjh
 */
export function getQyxxList(qlrmc, zjh) {
  return new Promise((resolve) => {
    let data = {
      searchData: [{
        name: "qlrmc",
        searchType: "like",
        value: qlrmc || ''
      }, {
        name: "zjh",
        searchType: "like",
        value: zjh || ''
      }],
      id: "51",
      isPage: true,
      current: 1,
      size: 1
    }
    defHttp.post({ url: '/imaginform/zrzy-form/form/report/list', data: data }, { withToken: true }).then((res) => {
      if (res && res.success) {
        const result = JSON.parse(res.result)
        resolve(result.records)
      } else {
        resolve([])
      }
    })
  })
}

/**
 * 获取移交窗口补正按钮
 */
async function getHandleCkbzBtn() {
  return new Promise((resolve) => {
    const slbh = route.query.slbh
    if (!slbh) {
      resolve([])
      return []
    }
    defHttp.get({ url: '/api/zrzy-bdc/hi/taskinst/getTaskInfo', params: { slbh: slbh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        let taskList = res.result
        const taskLength = taskList.length
        if (taskLength < 2) {
          resolve([])
          return []
        }
        // 查询当前节点以及上一节点信息
        const nodeName = taskList[taskLength - 1].jdmc
        if (!nodeName) {
          resolve([])
          return []
        }
        const beforeTask = taskList[taskLength - 2]
        // 1.判断不展示“窗口补正”的节点
        const hidBtnNodeName = ["归档", "缮证", "登簿", "记载登记簿", "发证"]
        if (hidBtnNodeName.indexOf(nodeName) > -1) {
          resolve([])
          return []
        }
        let text = "窗口补正"
        if (nodeName == '收件' || nodeName == '受理') {
          if (beforeTask.deleteReason == '窗口补正') {
            // 2.收件节点，如果是发起的“窗口补正”，则展示按钮“完成补正”
            text = "完成补正"
          } else {
            // 3.收件节点，如果不是发起的“窗口补正”，则不展示按钮
            resolve([])
            return []
          }
        }
        // 4.非收件节点，显示“窗口补正”
        // 新增 结果意见选择补齐补正时才显示 ; 窗口补正到收件节点时需要找倒数第二条数据显示完成补正
        let lastCzjg = taskList[taskLength - 1].czjg || taskList[taskLength - 2].czjg ||''
        let btnList = lastCzjg == '5' ? [{ name: text, type: 'primary', isDefaultBtn: text == '窗口补正' }] : []

        resolve(btnList)
        return btnList
      }
    }).catch(() => {
      resolve([])
      return []
    })
  })
}

/**
 * 通过小区名称和幢号查询自然幢号(预售许可信息中)
 * @param xqmc
 * @param zh
 */
export function getZrzhByXqmcAndZh(xqmc: string, zh: string) {
  return new Promise((resolve) => {
    defHttp.get({ url: '/api/zrzy-bdc/bdc/bdcZsx/getZrzListByPage', params: { zh: zh, xqmc: xqmc, pageNo: 1, pageSize: 10 } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result.records)
      } else {
        resolve([])
      }
    })
  })
}

/**
 * 单个消费
 * @param obj
 */
export function sendMsgSingle(obj) {
  return new Promise((resolve) => {
    obj = convertSnakeKeysToCamel(obj)
    let url = '/api/zrzy-api/api/mq/log/sendMsgSingle'
    defHttp.post({ url: url, data: obj }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
        message.success('发送成功!')
      } else {
        resolve(false)
        message.warning('发送失败!' + res?.message)
      }
    })
  })
}

/**
 * 批量消费
 * @param list
 */
export function sendMsgList(list) {
  return new Promise((resolve) => {
    list = list.map(item => convertSnakeKeysToCamel(item))
    let url = '/api/zrzy-api/api/mq/log/sendMsgList'
    defHttp.post({ url: url, data: list }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
        message.success('发送成功!')
      } else {
        resolve(false)
        message.warning('发送失败!' + res?.message)
      }
    })
  })
}

/**
 * 下划线转驼峰
 * @param str
 */
function snakeToCamel(str: string) {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * 短横线对象转为驼峰对象
 * @param obj
 */
function convertSnakeKeysToCamel(obj: any) {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = obj[key];
  }
  return result;
}

/**
 * 创建合同逻辑检查
 * @param params
 */
export function checkHtLogic(_data) {
  return new Promise((resolve) => {
    defHttp.post({
      url: '/api/zrzy-bdc/clf/ht/checkHtLogic',
      data: _data
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        // 通过
        resolve(true)
      } else if (res && res.code == -1) {
        // 提醒
        Modal.confirm({
          title: '提示',
          icon: createVNode(ExclamationCircleOutlined),
          content: createVNode('div', { style: 'color:red;' }, res.message),
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
          content: res.message,
        });
        resolve(false)
      }
    })
  })
}

/**
 * 新建合同
 * @param arr
 */
export function addContract(arr: any) {
  return new Promise(async (resolve) => {
    let url = '/api/zrzy-bdc/clf/ht/addContract'
    let _data = { bdcdyh: arr[0].bdcdyh, bdcqzh: arr[0].bdcqzh, djsj: arr[0].djsj, ywh: arr[0].ywh }
    // 逻辑检查
    let check = await checkHtLogic(_data)
    if (check) {
      defHttp.post({ url: url, data: _data }, { withToken: true }).then((res) => {
        if (res && res.success) {
          resolve(res.result)
        } else {
          message.warning(res?.message)
          resolve(false)
        }
      })
    } else {
      resolve(false)
    }
  })
}
/**
 * 提交合同逻辑检查
 * @param params
 */
export function verifyHtLogic(htlsh) {
  return new Promise((resolve) => {
    defHttp.post({
      url: '/api/zrzy-bdc/clf/ht/verifyHtLogic',
      params: { htlsh: htlsh }
    }, { withToken: true }).then((res) => {
      if (res && res.success) {
        // 通过
        resolve(true)
      } else {
        // 限制
        Modal.error({
          title: '提示',
          content: res.message,
        });
        resolve(false)
      }
    })
  })
}
/**
 * 提交合同
 * @param arr
 */
export function submitContract(htlsh) {
  return new Promise(async (resolve) => {
    // 逻辑检查
    let check = await verifyHtLogic(htlsh)
    if (check) {
      const res = await updateHtZt(htlsh, 'tijiao')
      return resolve(res)
    }
  })
}
/**
 * 更新合同状态
 * @param czlx
 */
export function updateHtZt(htlsh, czlx) {
  return new Promise((resolve) => {
    let url = '/api/zrzy-bdc/clf/ht/updateHtZt'
    let str = ''
    switch (czlx) {
      case 'tijiao':
        str = '提交'
        break;
      case 'chehui':
        str = '撤回'
        break;
      case 'chexiao':
        str = '撤销'
        break;
    }
    defHttp.post({ url: url, params: { htlsh: htlsh, czlx: czlx } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success(str + '成功!')
        resolve(true)
      } else {
        message.warning(res?.message || str + '失败!')
        resolve(false)
      }
    })
  })
}

/**
 * 通过合同编号删除合同
 * @param htlsh
 */
export function deleteHtByHtbh(htlsh) {
  return new Promise((resolve) => {
    let url = '/api/zrzy-bdc/clf/ht/deleteHtByHtbh'
    defHttp.delete({ url: url, params: { htlsh: htlsh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        message.success('删除成功!')
        resolve(true)
      } else {
        message.warning(res?.message || '删除失败!')
        resolve(false)
      }
    })
  })
}

/**
 * 根据合同编号提取附件
 */
export async function addFjByHtbh(loading: any) {
  const slbh = route.query.slbh
  if (!slbh) {
    message.error("未获取到受理编号，请检查!")
    return
  }
  if (loading) {
    loading.value = true
  }
  defHttp.post({
    url: '/api/zrzy-bdc/clf/ht/copyFjByHtbh',
    params: { slbh: slbh }
  }, { withToken: true }).then((res) => {
    if (res.success) {
      message.success(res.result)
    } else {
      message.error(res.message)
    }
  })
  loading.value = false
}

/**
 * 根据受理编号修改合同状态
 */
export function updateHtztBySlbh() {
  return new Promise((resolve) => {
    const slbh = route.query.slbh
    if (!slbh) {
      message.error("未获取到受理编号，请检查!")
      resolve(false)
      return
    }
    defHttp.post({
      url: '/api/zrzy-bdc/clf/ht/updateHtztBySlbh',
      params: { slbh: slbh }
    }, { withToken: true }).then((res) => {
      if (res.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

/**
 * 不予登记
 */
export async function handTerminate(demoRefs: any, btn:any, loading: any, jdmc: string, eventBus: any, params: any) {
  let res: any = await sendSaveFun('handOver', demoRefs, btn, loading, eventBus, params)
  if (res && res.status && res.validate) {
    Modal.confirm({
      title: '提示',
      icon: createVNode(ExclamationCircleOutlined),
      content: createVNode('div', { style: 'color:red;' }, '是否不予登记？确认后案件将强制归档！'),
      onOk() {
        let url = '/api/zrzy-bdc/bdc/process/terminate'
        const slbh = route.query.slbh
        defHttp.get({ url: url, params: { slbh: slbh } }, { withToken: true }).then((res) => {
          if (res && res.success) {
            message.success('操作成功!')
            // 关闭当前标签页
            closeCurrentTab()
          } else {
            message.warning(res?.message || '操作失败!')
          }
        })
      }
    });
  }
  return res
}

/**
 * 金额数字转中文读法
 * @param num
 * @param options round 是否四舍五入小数
 */
export function numberToChinese(money, options = { round: true }) {
  if (typeof money === "string") {
    money = parseFloat(money);
    if (isNaN(money)) throw new Error("请输入有效的数字");
  }
  if (!Number.isFinite(money) || money < 0) {
    throw new Error("请输入有效的非负数字");
  }
  if (options.round) {
    money = Math.round(money * 100) / 100;
  } else {
    money = Math.floor(money * 100) / 100;
  }
  let cnMoney = "零元整";
  let strOutput = "";
  let strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';
  money += "00";
  let intPos = money.indexOf('.');
  if (intPos >= 0) {
    money = money.substring(0, intPos) + money.substr(intPos + 1, 2);
  }
  strUnit = strUnit.substr(strUnit.length - money.length);
  for (let i = 0; i < money.length; i++) {
    strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(money.substr(i, 1), 1) + strUnit.substr(i, 1);
  }
  cnMoney = strOutput.replace(/零角零分$/, '整').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");
  return cnMoney;
}
/**
 * 手写签名
 * @param 获取regtype
 */
export function getSignature(params?: any){
  let modal = cModal({
    title: '电子签名',
    // width: 1000,
    isFullScreen: true,
    footer:false,
    filePath: 'views/signature/index',
    formData: {
      slbh: route.query.slbh,
      regType: params.regType,
    }
  })
}

export function downloadPdf(params: any) {
  // generatePdfByHtml(params.title, params.className, params.text)
  // downloadPdfByCanvas(params.title, params.className, params.text)
}

/**
 * @Description 批量生成附记和共有情况
 * @param c_type fj(仅生成附记) gyqk(仅生成共有情况) 空时，均生成
 */
export function batchFjAndGyqk(param: { type: any }) {
    return new Promise((resolve) => {
        let params: any = { slbh: route.query.slbh }
        let text = "附记和共有情况"
        if (param.type) {
            params.type = param.type
            text = param.type == "fj" ? "附记" : "共有情况"
        }
        defHttp.put({
            url: '/api/zrzy-bdc/bdc/public/updateFjAndGyqk',
            params: params
        }, {
            withToken: true
        }).then((res: any) => {
            if (res && res.success) {
                resolve(true)
                message.success(`${text}成功生成!`)
            } else {
                message.warning(res?.message)
                resolve(false)
            }
        })
    }).catch(err => {
        message.warning(err)
    })
}
/**
 * 查看宗地图分层分户图
 * @param ftid
 */
export function viewZdt(ftid: string) {
  let base = window?.settingConfig?.proxyBaseDomain
  let encodeUrl = encodeURIComponent(Base64.encode(`${base}/zrzy-bdc/bdcdj/upfiles/ft/download?id=${ftid}`))
  window.open(`${window?.settingConfig?.kkFileDomain}/onlinePreview?url=${encodeUrl}`)
}
