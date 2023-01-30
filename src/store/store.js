import Vue from "vue";
import Vuex from "vuex";
import * as types from "./types";
Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        token: null,
        nowSelectTab: "station",
        tabsArr: ["station"],
        role: localStorage.getItem("fiics-role") ? localStorage.getItem("fiics-role") : "",
        userInfo: localStorage.getItem("fiics-user") ? JSON.parse(localStorage.getItem("fiics-user")) : {},
        darkTheme:
            localStorage.getItem("fiics-dark-theme") !== null
                ? JSON.parse(localStorage.getItem("fiics-dark-theme"))
                : false,
        permissionEditable:
            localStorage.getItem("fiics-permission-editable") !== null
                ? JSON.parse(localStorage.getItem("fiics-permission-editable"))
                : false,
        organizationList:
            localStorage.getItem("fiics-organizationList") !== null
                ? JSON.parse(localStorage.getItem("fiics-organizationList"))
                : false,
        selectedOrganization:
            localStorage.getItem("fiics-selectedOrganization") !== null
                ? JSON.parse(localStorage.getItem("fiics-selectedOrganization"))
                : false
    },
    mutations: {
        [types.LOGIN]: (state, data) => {
            window.localStorage.setItem("fiics-token", data);
            state.token = data;
        },
        [types.LOGOUT]: (state) => {
            let uuid = localStorage.getItem("fiics-uuid");
            let fiicsDarkTheme =
                localStorage.getItem("fiics-dark-theme") !== null ? localStorage.getItem("fiics-dark-theme") : false;
            window.localStorage.clear();
            window.localStorage.setItem("fiics-uuid", uuid);
            window.localStorage.setItem("fiics-dark-theme", fiicsDarkTheme);
            state.token = null;
            state.lang = "en";
            state.role = "";
        },
        [types.ROLE]: (state, data) => {
            state.role = data;
            window.localStorage.setItem("fiics-role", data);
        },
        [types.USERINFO]: (state, data) => {
            state.userInfo = data;
            localStorage.setItem("fiics-user", JSON.stringify(data));
        },
        [types.SELECT_NOW_TAB]: (state, { path, router, changePath }) => {
            state.nowSelectTab = path;
            if (changePath) router.push(`/${path}`);
        },
        [types.DARKTHEME]: (state, data) => {
            state.darkTheme = data;
            window.localStorage.setItem("fiics-dark-theme", `${data}`);
        },
        [types.UPDATE_PERMISSION]: (state, data) => {
            state.permissionEditable = data;
            window.localStorage.setItem("fiics-permission-editable", `${data}`);
        },
        [types.UPDATE_ORGANIZATIONS]: (state, data) => {
            state.organizationList = data;
            window.localStorage.setItem("fiics-organizationList", JSON.stringify(data));
        },
        [types.UPDATE_SELECTED_ORGANIZATION]: (state, data) => {
            state.selectedOrganization = data;
            window.localStorage.setItem("fiics-selectedOrganization", JSON.stringify(data));
        }
    },
    actions: {
        setUser({ commit }, payload) {
            commit(types.USERINFO, payload);
        }
    }
});
