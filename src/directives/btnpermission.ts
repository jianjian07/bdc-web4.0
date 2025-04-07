import type { Directive } from 'vue'
import { usePermissionStore } from "/@/store/modules/permission"
const permission: Directive = {
    mounted(el: any, binding: any) {
        const { value } = binding
        if (!value)
            return
        const curValue = binding.value
        const permissionList = usePermissionStore().getPermissionList
        // const permissionList = ['form:info:view', 'form:info:print', 5]
        // 可根据自己的业务修改此处实现逻辑
        if (!permissionList.includes(curValue))
            el.style.display = 'none'
        else
            el.style.display = 'auto'
    },
}

export default permission