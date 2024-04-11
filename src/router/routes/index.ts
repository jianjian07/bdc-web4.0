import { LAYOUT } from '../constant';
import { PageEnum } from '/@/enums/pageEnum';

const RootRoute = [
  {
    path: '/',
    name: 'Root',
    redirect: PageEnum.BASE_HOME,
    meta: {
      title: 'Root',
    },
  },
  // {
  //   path: '/dashboard',
  //   name: 'Dashboard',
  //   component: LAYOUT,
  //   redirect: '/dashboard/analysis',
  //   meta: {
  //     orderNo: 10,
  //     icon: 'ion:grid-outline',
  //     title: '主页',
  //   },
  //   children: [
  //     {
  //       path: 'analysis',
  //       name: 'Analysis',
  //       component: () => import('/@/views/dashboard/Analysis/index.vue'),
  //       meta: {
  //         // affix: true,
  //         title: '分析页',
  //       },
  //     },
  //   ],
  // },
  {
    path: '/login',
    name: 'Login',
    component: () => import('/@/views/sys/login/Login.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/401',
    name: '401',
    component: () => import('/@/views/sys/401/index.vue'),
    meta: {
      title: '401',
    },
  },
]

export const basicRoutes = RootRoute;
