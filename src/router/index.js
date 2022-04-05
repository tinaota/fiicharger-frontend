import Vue from 'vue'
import Router from 'vue-router'
import i18n from '../lang/lang'
import store from '../store/store'
import * as types from '../store/types'
import { $GLOBAL_PROJECT } from '@/utils/global'

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
                    { path: '/statistics', component: () => import('@/views/info/statistics.vue'), name: 'menu.statistics', hidden: false },
                    { path: '/report', component: () => import('@/views/info/report.vue'), name: 'menu.report', hidden: false },
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
                    { path: '/kiosk', component: () => import('@/views/chargingStation/kiosk.vue'), name: 'menu.kiosk', hidden: true },
                    { path: '/kiosk/kioskDetail', component: () => import('@/views/chargingStation/kioskDetail.vue'), name: 'kioskDetail', hidden: true },
                    { path: '/station/stationDetail', component: () => import('@/views/chargingStation/stationDetail.vue'), name: 'stationDetail', hidden: true },
                    { path: '/chargePoint', component: () => import('@/views/chargingStation/chargePoint.vue'), name: 'menu.chargePoint', hidden: false },
                    { path: '/chargingSession', component: () => import('@/views/chargingStation/chargingSession.vue'), name: 'menu.chargingSession', hidden: false },
                    { path: '/chargePointAlert', component: () => import('@/views/chargingStation/chargePointAlert.vue'), name: 'menu.chargePointAlert', hidden: false },
                    // { path: '/setting', component: () => import('@/views/chargingStation/setting.vue'), name: 'menu.setting', hidden: false }
                    { path: '/chargePointDetail', component: () => import('@/views/chargingStation/chargePointDetail.vue'), name: 'chargePointDetail', hidden: true },
                    { path: '/cars', component: () => import('@/views/setting/cars.vue'), name: 'menu.cars', hidden: false }
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
                    { path: '/member', component: () => import('@/views/account/endUser.vue'), name: 'menu.member', hidden: false },
                    { path: '/member/memberDetail', component: () => import('@/views/account/accountDetail.vue'), name: 'accountDetail', hidden: true },
                    { path: '/member/idTagDetail', component: () => import('@/views/account/idTagDetail.vue'), name: 'idTagDetail', hidden: true },
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
if (window.sessionStorage.getItem('fiics-token')) {
    store.commit(types.LOGIN, window.sessionStorage.getItem('fiics-token'));
}

/**
 * @description 处理页面跳转前后的路由逻辑操作
 */
router.beforeEach((to, from, next) => {
    if (to.path !== "/login") {
        if (store.state.token && to.path !== "/") {
            // var userData = window.sessionStorage.getItem('fiics-user') || null;
            // if (userData && userData.accountInfo && userData.accountInfo.accPermissionType) {
            //     var accPermissionType = userData.accountInfo.accPermissionType;
            //     if (accPermissionType !== 2 && accPermissionType !== 4 ) {
            //         next();
            //     } else if (this.userData.accPermissionType === 2) {
            //         if (to.path !== '/account/accountDetail'...) {
            //             next();
            //         } else {
            //             next({ path: '/404' });
            //         }
            //     } else {
            //         if (to.path !== '/location'...) {
            //             next();
            //         } else {
            //             next({ path: '/404' });
            //         }
            //     }
            // } else {
            //     store.commit(types.LOGOUT);
            //     next({ path: '/login' });
            // }
            next();
        } else {
            store.commit(types.LOGOUT);
            let url = 'https://test-charger.fiimart.com/Gatekeeper/auth/authorize?response_type=code&client_id=gatekeeper&redirect_uri=http://localhost:8081/login'
            window.location.replace(url);
        }
    } else {
        next();
    }
    // axios.__axiosPromiseArr.forEach((ele, index) => {
    //     ele.cancel();
    //     delete axios.__axiosPromiseArr[index]
    // })
})

export default router
