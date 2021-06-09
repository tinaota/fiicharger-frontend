import Vue from 'vue'
import Router from 'vue-router'
import i18n from '../lang/lang'
import store from '../store/store'
import * as types from '../store/types'
import { $GLOBAL_PROJECT } from '@/utils/global'

//先不跑登入
Vue.use(Router)

let routes = [
    // {
    //     path: '/login',
    //     meta: { title: 'Login' },
    //     name: 'Login',
    //     component: () => import('@/components/Login.vue'),
    //     hidden: true
    // },
    {
        path: '/',
        meta: { title: 'Home' },
        ename: 'Home',
        name: 'app_name',
        iconCls: 'el-icon-info',
        hidden: false,
        component: () => import('@/components/Home.vue'),
        children: [
            {
                path: '/dashboard',
                iconCls: 'ic_dashboard_o',
                name: 'menu.dashboard',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/map', component: () => import('@/views/dashboard/map.vue'), name: 'menu.map', hidden: false },
                    { path: '/statistics', component: () => import('@/views/dashboard/statistics.vue'), name: 'menu.statistics', hidden: false },
                ]
            },
            {
                path: '/chargingStation',
                iconCls: 'ic_charging_o',
                name: 'menu.chargingStation',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/stationList', component: () => import('@/views/chargingStation/stationList.vue'), name: 'menu.stationList', hidden: false },
                    { path: '/stationListDetail', component: () => import('@/views/chargingStation/stationListDetail.vue'), name: 'stationListDetail', hidden: true },
                    { path: '/chargeBoxList', component: () => import('@/views/chargingStation/chargeBoxList.vue'), name: 'menu.chargeBoxList', hidden: false },
                    { path: '/chargingSession', component: () => import('@/views/chargingStation/chargingSession.vue'), name: 'menu.chargingSession', hidden: false },
                    { path: '/stationAlert', component: () => import('@/views/chargingStation/stationAlert.vue'), name: 'menu.stationAlert', hidden: false },
                    { path: '/setting', component: () => import('@/views/chargingStation/setting.vue'), name: 'menu.setting', hidden: false }
                ]
            },
            {
                path: '/userAccount',
                iconCls: 'ic_user_o',
                name: 'menu.userAccount',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/accountList', component: () => import('@/views/userAccount/accountList.vue'), name: 'menu.accountList', hidden: false },
                    { path: '/billingLog', component: () => import('@/views/userAccount/billingLog.vue'), name: 'menu.billingLog', hidden: false },
                ]
            }
        ]
    },
    {
        path: '/404',
        meta: { title: 'Error' },
        name: 'Error',
        component: () => import('@/components/NotFound.vue'),
        hidden: true
    },
    {
        path: '*',
        meta: { title: 'NotFound' },
        name: 'NotFound',
        redirect: { path: '/404' },
        hidden: true
    }
]

const router = new Router({
    base: `/${$GLOBAL_PROJECT}/`,
    mode: 'history',
    routes
})

/**
 * @description 页面刷新时重新对token 进行赋值操作
 */
// if (window.sessionStorage.getItem('fiics-token')) {
//     store.commit(types.LOGIN, window.sessionStorage.getItem('fiics-token'));
// }


/**
 * @description 处理页面跳转前后的路由逻辑操作
 */
router.beforeEach((to, from, next) => {
    if (from.path === '/' && to.path === '/') {
        next({ path: '/statistics' });
    } else {
        next();
    }
    // if (to.path !== "/login") {
    //     if (store.state.token && to.path !== "/") {
    //         next();
    //     } else {
    //         store.commit(types.LOGOUT);
    //         next({ path: '/login' });
    //     }
    // } else {
        // next();
    // }
    // axios.__axiosPromiseArr.forEach((ele, index) => {
    //     ele.cancel();
    //     delete axios.__axiosPromiseArr[index]
    // })
})

export default router
