import { AppRouteModule } from "/@/router/types";
const modules = import.meta.glob('../../views/**/*.{vue,tsx}')
// const modules1 = import.meta.glob('../views/**/*.{vue,tsx}')
export function dynamicRouter(routeList: AppRouteModule[]) {

    const list: AppRouteModule[] = []
    routeList.forEach((item, index) => {
        if (item.component != "wonderform") {
            list.push({
                ...item,
                component: modules[`../../views/${item.component}.vue`],
                meta: {
                    cache: item.cache,
                    component: item.component,
                    componentName: item.componentName
                }
            })
            // 是否存在子集
            if (item.children && item.children.length) {
                list[index].children = dynamicRouter(item.children)
            }
        }
    })
    return list;
}
