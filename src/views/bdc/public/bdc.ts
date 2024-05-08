
import { useUserStore } from "/@/store/modules/user"
import { saveFormData, saveHandleData } from "/@/utils/form/wonder1.0.1"
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
 * 保存/移交
 * @param _type 
 * @param demoRefs 
 */
export async function sendSaveFun(_type: string, demoRefs: any) {
  let commonSaveRes: unknown
  commonSaveRes = await saveFormData(demoRefs)
  // commonSaveRes = await saveHandleData(demoRefs) //移交
  console.log('commonSaveRes', commonSaveRes)
  const errorList = (document as any).querySelectorAll(".ant-form-item-has-error");
  if (errorList && errorList.length > 0) {
    // 由于校验失败ant会自动给失败表单项添加类名，直接获取即可
    errorList[0].scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
}