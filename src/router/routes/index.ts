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
  {
    path: '/init',
    name: 'init',
    component: () => import('/@/views/sys/login/InitIndex.vue'),
    meta: {
      title: '系统初始化',
    },
  },
  {
    path: '/viewpdf',
    name: 'RViewPdf',
    component: () => import('/@/views/online/preport/RViewPdf.vue'),
    meta: {
      title: '在线预览',
    },
  }
]

export const basicRoutes = RootRoute;
