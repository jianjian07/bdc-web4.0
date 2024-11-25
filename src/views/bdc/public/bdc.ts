import { useUserStore } from "/@/store/modules/user"
import { saveFormData, saveHandleData, validateInfos } from "/@/utils/form/wonder1.0.1"
import { message } from "ant-design-vue"
import { cModal } from "/@/components/cModal/index"
import { computed } from "vue"
import { useTabsStore } from "/@/store/modules/tabs"
import { useTabsSetting } from "/@/hooks/setting/useTabsSetting"
import { router } from "/@/router"

const userStore = useUserStore()

enum api {
  configList = '/api/zrzy-dzzw/caseConfig/getCaseState',
  getSzUserInfo = '/api/zrzy-system/api/v1/auth/singleToken',
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
          msg = type === 'baseSave' ? "保存成功!" : "移交成功!"
        } else {
          // 表单暂存，校验不通过，也提示表单保存成功
          msg = "暂存成功"
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
      msg = type === 'baseSave' ? "保存成功!" : "移交成功!"
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
  } else {
    message.error('表单保存失败!')
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

