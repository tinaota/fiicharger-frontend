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
                    { path: '/location', component: () => import('@/views/dashboard/location.vue'), name: 'menu.location', hidden: false },
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
                    { path: '/station', component: () => import('@/views/chargingStation/station.vue'), name: 'menu.station', hidden: false },
                    { path: '/station/stationDetail', component: () => import('@/views/chargingStation/stationDetail.vue'), name: 'stationDetail', hidden: true },
                    { path: '/chargeBox', component: () => import('@/views/chargingStation/chargeBox.vue'), name: 'menu.chargeBox', hidden: false },
                    { path: '/chargingSession', component: () => import('@/views/chargingStation/chargingSession.vue'), name: 'menu.chargingSession', hidden: false },
                    // { path: '/setting', component: () => import('@/views/chargingStation/setting.vue'), name: 'menu.setting', hidden: false }
                ]
            },
            {
                path: '/memberAccount',
                iconCls: 'ic_user_o',
                name: 'menu.memberAccount',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/account', component: () => import('@/views/memberAccount/account.vue'), name: 'menu.account', hidden: false },
                    { path: '/account/accountDetail', component: () => import('@/views/memberAccount/accountDetail.vue'), name: 'accountDetail', hidden: true },
                    { path: '/billingLog', component: () => import('@/views/memberAccount/billingLog.vue'), name: 'menu.billingLog', hidden: false },
                ]
            },
            {
                path: '/support',
                iconCls: 'ic_user_o',
                name: 'menu.support',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/workOrder', component: () => import('@/views/support/workOrder.vue'), name: 'menu.workOrder', hidden: false },
                    { path: '/chargeBoxAlert', component: () => import('@/views/support/chargeBoxAlert.vue'), name: 'menu.chargeBoxAlert', hidden: false },
                ]
            },
            {
                path: '/setting',
                iconCls: 'ic_user_o',
                name: 'menu.setting',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/accountMgt', component: () => import('@/views/setting/accountMgt.vue'), name: 'menu.accountMgt', hidden: false },
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
        next({ path: '/location' });
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
