export const REDIRECT_NAME = 'Redirect';

export const PARENT_LAYOUT_NAME = 'ParentLayout';

export const PAGE_NOT_FOUND_NAME = 'PageNotFound';

export const EXCEPTION_COMPONENT = () => import('/@/views/sys/exception/Exception.vue');
// export const EXCEPTION_401 = () => import('/@/views/sys/401/index.vue');
/**
 * @description: default layout
 */
export const LAYOUT = () => import('/@/views/layouts/default/index.vue');
// export const LAYOUTBDC = () => import('/@/views/layouts/bdc/index.vue');
// export const LAYOUTSZLS = () => import('/@/views/layouts/lhszls/index.vue');
/**
 * @description: parent-layout
 */
export const getParentLayout = (_name?: string) => {
  return () =>
    new Promise((resolve) => {
      resolve({
        name: PARENT_LAYOUT_NAME,
      });
    });
};
