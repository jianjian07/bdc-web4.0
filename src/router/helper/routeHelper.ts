import { AppRouteModule } from "/@/router/types";
const modules = import.meta.glob('/src/views/**/*.vue');

export function dynamicRouter(routeList: AppRouteModule[]) {
    const list: AppRouteModule[] = [];
    routeList.forEach(async (item) => {
        if (item.component !== "wonderform") {
            const componentName = getComponentName(item); // 使用缓存路由必须 确保 name 唯一
            let tab: any = {
                ...item,
                name: item.children && item.children.length ? item.title : componentName,
                component: item.children && item.children.length ? modules[`/src/views/${item.component}.vue`] 
                  : () =>  getComponent(item.component, componentName),
                meta: {
                    cache: item.cache,
                    component: item.component,
                    componentName: componentName,
                    path: item.path,
                    iframe: item.iframe,
                    iframeUrl: item.url,
                    title: item.title
                }
            };

            list.push(tab);

            if (item.children && item.children.length) {
                tab.children = dynamicRouter(item.children);
            }
        }
    });

    // console.log(" 最终动态路由列表:", list);
    return list;
}

/**
 * 动态生成路由 需要把组件的name也同步, 不然缓存路由失效
 * @param componentPath
 * @param componentName
 */
const getComponent = async (componentPath: string, componentName: string) => {
    const importPath = `/src/views/${componentPath}.vue`;

    const mod = await modules[importPath](); // 动态加载组件
    const component = mod.default;

    if (component) {
        return {
            ...component, // 创建一个新的对象，避免直接修改 `mod.default`
            name: componentName, // 赋值 name，确保 keep-alive 识别
        };
    }

    return component;
};


export function dynamicRouterOld(routeList: AppRouteModule[]) {

    const list: AppRouteModule[] = []
    routeList.forEach((item, index) => {
        if (item.component != "wonderform") {
            list.push({
                ...item,
                component: modules[`/src/views/${item.component}.vue`],
                meta: {
                    cache: item.cache,
                    component: item.component,
                    componentName: item.componentName,
                    iframe: item.iframe,
                    iframeUrl: item.url
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


/**
 * 生成唯一的组件name (缓存用, 但如果是/:code 这种或是 /xx但地址栏增加了参数 
 * route读取不到跳转路由时的地址, 因为这里是登陆之后还没进入具体页面读的地址, 所以路由没有query params信息 
 * 只是这种缓存路由刷新的话 开多个标签页手动刷新时会把name相同的都刷新)
 * @param item
 */
function getComponentName(item) {
    if (!item.meta) {
        item.meta = {};
    }

    // 提取组件路径
    const nameParts = item.component?.split('/') ?? [];
    const fileName = nameParts[nameParts.length - 1] || '';

    let dynamicId = '';

    // 处理动态参数（params）
    if (item.params) {
        dynamicId = Object.values(item.params).join('-');
        // console.log('处理动态参数（params')
    }

    // 处理 path 里的动态参数
    if (!dynamicId && item.path) {
        const dynamicMatch = item.path.match(/\/([^\/]+)\/([^\/]+)$/); // 匹配 `/xxx/:code` 形式
        if (dynamicMatch) {
            dynamicId = dynamicMatch[2]; // 取 `:code` 的实际值
        }
    }

    // 处理 query 参数
    let queryId = '';
    if (item.query) {
        queryId = Object.entries(item.query).map(([key, value]) => `${key}-${value}`).join('-');
        // console.log('处理 query 参数',item)
    }
    
    

    // 处理 index.vue 的情况
    if (fileName === 'index') {
        const parentName = nameParts[nameParts.length - 2] || 'index';
        item.meta.componentName = `${item.componentName ? item.componentName + '-' : ''}${parentName}Index${dynamicId}${queryId ? '-' + queryId : ''}`;
    } else {
        item.meta.componentName = `${item.componentName ? item.componentName + '-' : ''}${fileName}${dynamicId ? '-' + dynamicId : ''}${queryId ? '-' + queryId : ''}`;
    }

    return item.meta.componentName;
}

export function setRouteList(arr) {
  let newData = arr.map(item => {
    item.title = item.name
    if (item.children) {
      item.children = setRouteList(item.children)
    }
    return item
  })
  return newData
}
