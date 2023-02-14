import { v4 as uuidv4 } from "uuid";
import Vue from "vue";
import Router from "vue-router";
import redirect from "../router/redirect";
import store from "../store/store";
import * as types from "../store/types";

//先不跑登入
Vue.use(Router);

// menuName is for menu while name is for google analytics tracking
let routes = [
    {
        path: "/login",
        meta: { title: "Login" },
        name: "Login",
        menuName: "Login",
        component: () => import("@/components/Login.vue"),
        hidden: true
    },
    {
        path: "/",
        meta: { title: "Home" },
        ename: "Home",
        name: "app_name",
        menuName: "Home",
        iconCls: "el-icon-info",
        hidden: false,
        component: () => import("@/components/Home.vue"),
        children: [
            {
                path: "/info",
                iconCls: "ic_dashboard_o",
                name: "Information",
                menuName: "menu.information",
                hasChild: true,
                component: () => import("@/components/data.vue"),
                children: [
                    {
                        path: "/location",
                        component: () => import("@/views/info/location.vue"),
                        name: "Location",
                        menuName: "menu.location",
                        hidden: false
                    }
                ]
            },
            {
                path: "/chargingStation",
                iconCls: "ic_charging_o",
                name: "Management",
                menuName: "menu.management",
                hasChild: true,
                hidden: false,
                component: () => import("@/components/data.vue"),
                children: [
                    {
                        path: "/station",
                        component: () => import("@/views/chargingStation/station.vue"),
                        name: "Station",
                        menuName: "menu.station",
                        hidden: false
                    },
                    {
                        path: "/station/stationDetail",
                        component: () => import("@/views/chargingStation/stationDetail.vue"),
                        name: "Station Detail",
                        menuName: "stationDetail",
                        hidden: true
                    },
                    {
                        path: "/chargePoint",
                        component: () => import("@/views/chargingStation/chargePoint.vue"),
                        name: "ChargePoint",
                        menuName: "menu.chargePoint",
                        hidden: false
                    },
                    {
                        path: "/chargePoint/chargePointDetail",
                        component: () => import("@/views/chargingStation/chargePointDetail.vue"),
                        name: "ChargePoint Detail",
                        menuName: "chargePointDetail",
                        hidden: true
                    },
                    {
                        path: "/idTag",
                        component: () => import("@/views/setting/idTags.vue"),
                        name: "Id Tag",
                        menuName: "menu.idTag",
                        hidden: false
                    },
                    {
                        path: "/tariff",
                        component: () => import("@/views/setting/tariff.vue"),
                        name: "Price",
                        menuName: "menu.tariff",
                        hidden: false,
                        title: "testinf tariff"
                    },
                    {
                        path: "/cars",
                        component: () => import("@/views/setting/cars.vue"),
                        name: "Vehicle",
                        menuName: "menu.cars",
                        hidden: false
                    },
                    {
                        path: "/chargingProfile",
                        component: () => import("@/views/setting/chargingProfile.vue"),
                        name: "Charging Profile",
                        menuName: "chargingStation.chargingProfile",
                        hidden: false
                    }
                ]
            },
            {
                path: "/analyticsInfo",
                iconCls: "ic_analytics_o",
                name: "Analytics",
                menuName: "menu.analytics",
                hasChild: true,
                hidden: true,
                component: () => import("@/components/data.vue"),
                children: [
                    {
                        path: "/analytics",
                        component: () => import("@/views/analytics/overview.vue"),
                        name: "Analytics Overview",
                        menuName: "menu.overview",
                        hidden: true
                    }
                ]
            },
            {
                path: "/reportInfo",
                iconCls: "ic_report_o",
                name: "Report",
                menuName: "menu.report",
                hasChild: true,
                hidden: false,
                component: () => import("@/components/data.vue"),
                children: [
                    {
                        path: "/reports",
                        component: () => import("@/views/reports/overview.vue"),
                        name: "Reports Overview",
                        menuName: "menu.overview",
                        hidden: false
                    }
                ]
            },
            {
                path: "/account",
                iconCls: "ic_user_o",
                name: "Account",
                menuName: "menu.account",
                hasChild: true,
                hidden: false,
                component: () => import("@/components/data.vue"),
                children: [
                    {
                        path: "/organization",
                        component: () => import("@/views/account/organization.vue"),
                        name: "Organization",
                        menuName: "menu.organization",
                        hidden: false
                    },
                    {
                        path: "/user",
                        component: () => import("@/views/account/user.vue"),
                        name: "User",
                        menuName: "general.user",
                        hidden: false
                    }
                ]
            },
            {
                path: "/support",
                iconCls: "ic_support_o",
                name: "Support",
                menuName: "menu.support",
                hasChild: true,
                hidden: false,
                component: () => import("@/components/data.vue"),
                children: [
                    {
                        path: "/contactadmin",
                        component: () => import("@/views/info/contact.vue"),
                        name: "Contact",
                        menuName: "menu.contact",
                        hidden: false
                    },
                    {
                        path: "/reportissues",
                        component: () => import("@/views/info/reportIssues.vue"),
                        name: "Report Issues",
                        menuName: "menu.reportIssues",

                        hidden: false
                    }
                ]
            }
        ]
    },
    {
        path: "/404",
        meta: { title: "Error" },
        name: "Error",
        component: () => import("@/components/NotFound.vue"),
        hidden: true
    },
    {
        path: "*",
        meta: { title: "NotFound" },
        name: "NotFound",
        redirect: { path: "/404" },
        hidden: true
    }
];

const router = new Router({
    mode: "history",
    routes
});

/**
 * @description 页面刷新时重新对token 进行赋值操作
 */
if (window.localStorage.getItem("fiics-token")) {
    store.commit(types.LOGIN, window.localStorage.getItem("fiics-token"));
}
// create a uuid on route
let uuidValue = window.localStorage.getItem("fiics-uuid");
if (uuidValue === null || uuidValue === undefined) {
    let uuid = uuidv4();
    window.localStorage.setItem("fiics-uuid", uuid);
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
});

export default router;
