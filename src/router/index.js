import { $GLOBAL_PROJECT } from '@/utils/global'
import { v4 as uuidv4 } from "uuid"
import Vue from 'vue'
import Router from 'vue-router'
import redirect from '../router/redirect'
import store from '../store/store'
import * as types from '../store/types'

//先不跑登入
Vue.use(Router)

let routes = [
    {
        path: '/login',
        meta: { title: 'Login' },
        name: 'Login',
        component: () => import('@/components/Login.vue'),
        hidden: true
    },
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
                path: '/info',
                iconCls: 'ic_dashboard_o',
                name: 'menu.information',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/location', component: () => import('@/views/info/location.vue'), name: 'menu.location', hidden: false },
                    // { path: '/statistics', component: () => import('@/views/info/statistics.vue'), name: 'menu.statistics', hidden: true },
                    // { path: '/report', component: () => import('@/views/info/report.vue'), name: 'menu.report', hidden: true },
                ]
            },
            {
                path: '/chargingStation',
                iconCls: 'ic_charging_o',
                name: 'menu.management',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/station', component: () => import('@/views/chargingStation/station.vue'), name: 'menu.station', hidden: false },
                    // { path: '/kiosk', component: () => import('@/views/chargingStation/kiosk.vue'), name: 'menu.kiosk', hidden: true },
                    // { path: '/kiosk/kioskDetail', component: () => import('@/views/chargingStation/kioskDetail.vue'), name: 'kioskDetail', hidden: true },
                    { path: '/station/stationDetail', component: () => import('@/views/chargingStation/stationDetail.vue'), name: 'stationDetail', hidden: true },
                    { path: '/chargePoint', component: () => import('@/views/chargingStation/chargePoint.vue'), name: 'menu.chargePoint', hidden: false },
                    // { path: '/chargingSession', component: () => import('@/views/chargingStation/chargingSession.vue'), name: 'menu.chargingSession', hidden: true },
                    // { path: '/chargePointAlert', component: () => import('@/views/chargingStation/chargePointAlert.vue'), name: 'menu.chargePointAlert', hidden: true },
                    // { path: '/setting', component: () => import('@/views/chargingStation/setting.vue'), name: 'menu.setting', hidden: false }
                    { path: '/chargePoint/chargePointDetail', component: () => import('@/views/chargingStation/chargePointDetail.vue'), name: 'chargePointDetail', hidden: true },
                    { path: '/chargePrice', component: () => import('@/views/setting/chargePrice.vue'), name: 'menu.price', hidden: false },
                    { path: '/idTag', component: () => import('@/views/setting/idTags.vue'), name: 'menu.idTag', hidden: false },
                    { path: '/cars', component: () => import('@/views/setting/cars.vue'), name: 'menu.cars', hidden: false },
                    { path: '/chargingProfile', component: () => import('@/views/setting/chargingProfile.vue'), name: 'chargingStation.chargingProfile', hidden: false }
                ]
            },
            {
                path: '/analyticsInfo',
                iconCls: 'ic_analytics_o',
                name: 'menu.analytics',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/analytics', component: () => import('@/views/analytics/overview.vue'), name: 'menu.overview', hidden: false },
                ]
            },
            // {
            //     path: '/billing',
            //     iconCls: 'ic_billing_o',
            //     name: 'menu.billing',
            //     hasChild: true,
            //     component: () => import('@/components/data.vue'),
            //     children: [
            //         { path: '/billingLog', component: () => import('@/views/billing/billingLog.vue'), name: 'menu.billingLog', hidden: false },
            //     ]
            // },
            // {
            //     path: '/support',
            //     iconCls: 'ic_support_o',
            //     name: 'menu.support',
            //     hasChild: true,
            //     component: () => import('@/components/data.vue'),
            //     children: [
            //         { path: '/workOrder/summary', component: () => import('@/views/support/workOrderSum.vue'), name: 'menu.workOrder', hidden: false },
            //         { path: '/workOrder/history', component: () => import('@/views/support/workOrderHistory.vue'), hidden: true }
            //     ]
            // },
            {
                path: '/account',
                iconCls: 'ic_user_o',
                name: 'menu.account',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    // { path: '/account', component: () => import('@/views/account/account1.vue'), name: 'menu.account', hidden: false },
                    { path: '/operator', component: () => import('@/views/account/operator.vue'), name: 'menu.operator', hidden: false },
                    // { path: '/member', component: () => import('@/views/account/endUser.vue'), name: 'menu.member', hidden: true },
                    // { path: '/member/memberDetail', component: () => import('@/views/account/accountDetail.vue'), name: 'accountDetail', hidden: true },
                    // { path: '/member/idTagDetail', component: () => import('@/views/account/idTagDetail.vue'), name: 'idTagDetail', hidden: true },
                ]
            },
            {
                path: '/contact',
                iconCls: 'ic_support_o',
                name: 'menu.contact',
                hasChild: true,
                component: () => import('@/components/data.vue'),
                children: [
                    { path: '/contactadmin', component: () => import('@/views/info/contact.vue'), name: 'Contact', hidden: false }

                ]
            },
            // {
            //     path: '/setting',
            //     iconCls: 'ic_setting_o',
            //     name: 'menu.setting',
            //     hasChild: true,
            //     component: () => import('@/components/data.vue'),
            //     children: [
            //         { path: '/cars', component: () => import('@/views/setting/cars.vue'), name: 'menu.cars', hidden: false }
            //     ]
            // },
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
    }]

const router = new Router({
    base: `/${$GLOBAL_PROJECT}/`,
    mode: 'history',
    routes
})

/**
 * @description 页面刷新时重新对token 进行赋值操作
 */
if (window.localStorage.getItem('fiics-token')) {
    store.commit(types.LOGIN, window.localStorage.getItem('fiics-token'));
}
// create a uuid on route
let uuidValue = window.localStorage.getItem("fiics-uuid");
if (uuidValue === null || uuidValue === undefined) {
    let uuid = uuidv4();
    window.localStorage.setItem("fiics-uuid", uuid)
}
/**
 * @description 处理页面跳转前后的路由逻辑操作
 */
router.beforeEach((to, from, next) => {
    if (to.path !== "/login") {
        if (store.state.token && to.path !== "/") {
            next();
        } else {
            redirect();
        }
    } else {
        next();
    }
})

export default router
