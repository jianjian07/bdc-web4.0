import type { AppRouteRecordRaw } from '../types';
import { REDIRECT_NAME, LAYOUT, EXCEPTION_COMPONENT, PAGE_NOT_FOUND_NAME } from '../constant';

// 404 on a page
export const PAGE_NOT_FOUND_ROUTE: AppRouteRecordRaw = {
    path: '/:path(.*)*',
    name: PAGE_NOT_FOUND_NAME,
    component: LAYOUT,
    meta: {
        title: 'ErrorPage',
        hideBreadcrumb: true,
        hideMenu: true,
    },
    children: [
        {
            path: '/:path(.*)*',
            name: PAGE_NOT_FOUND_NAME + 'Child',
            component: () => import('/@/views/sys/404/index.vue'),
            meta: {
                title: 'ErrorPage',
                hideBreadcrumb: true,
                hideMenu: true,
            },
        },
    ],
};

export const REDIRECT_ROUTE: AppRouteRecordRaw = {
    path: '/redirect',
    name: 'RedirectTo',
    component: LAYOUT,
    redirect: '/redirect/index',
    meta: {
        title: REDIRECT_NAME,
    },
    children: [
        {
            path: 'index',
            name: REDIRECT_NAME,
            component: () => import('/@/views/sys/redirect/index.vue'),
            meta: {
                title: REDIRECT_NAME
            },
        },
    ],
};
export const ERROR_LOG_ROUTE: AppRouteRecordRaw = {
    path: '/error-log',
    name: 'ErrorLog',
    component: LAYOUT,
    redirect: '/error-log/list',
    meta: {
        title: 'ErrorLog',
        hideBreadcrumb: true,
        hideChildrenInMenu: true,
    },
    children: [
        {
            path: 'list',
            name: 'ErrorLogList',
            component: () => import('/@/views/sys/error-log/index.vue'),
            meta: {
                title: '日志',
                hideBreadcrumb: true,
                currentActiveMenu: '/error-log',
            },
        },
    ],
};

export const REFRESH_ROUTE: AppRouteRecordRaw = {
    path: '/refresh',
    name: 'Refresh',
    component: () => import('/@/views/sys/redirect/index.vue'),
    meta: {
        title: 'Refresh',
    }
};