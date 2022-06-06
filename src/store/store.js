import Vuex from 'vuex'
import Vue from 'vue'
import * as types from './types'
import { app } from '../main'
Vue.use(Vuex)
export default new Vuex.Store({
    state: {
        token: null,
        lang: localStorage.getItem('fiics-lang') ? localStorage.getItem('fiics-lang') : 'en', 
        nowSelectTab: 'station',
        tabsArr: ['station'],
        role: '',
        userInfo: localStorage.getItem('fiics-user') ? JSON.parse(localStorage.getItem('fiics-user')) : {},
        darkTheme: localStorage.getItem('fiics-dark-theme') !== null ? JSON.parse(localStorage.getItem('fiics-dark-theme')) : false,
        permissionEditable: localStorage.getItem('fiics-permission-editable') !== null ? JSON.parse(localStorage.getItem('fiics-permission-editable')) : false,
    },
    mutations: {
        [types.LOGIN]: (state, data) => {
            window.localStorage.setItem('fiics-token', data)
            state.token = data
        },
        [types.LOGOUT]: (state) => {
            let uuid = localStorage.getItem('fiics-uuid');
            let fiicsLang = localStorage.getItem('fiics-lang')
            let fiicsDarkTheme = localStorage.getItem('fiics-dark-theme') !== null ? localStorage.getItem('fiics-dark-theme') : false
            window.localStorage.clear();
            window.localStorage.setItem('fiics-uuid', uuid);
            window.localStorage.setItem('fiics-lang', fiicsLang)
            window.localStorage.setItem('fiics-dark-theme', fiicsDarkTheme)
            state = {
                token: null,
                lang: 'en',
                role: ''
            };
        },
        [types.LANG]: (state, data) => {
            state.lang = data;
            if (app && app.$i18n) {
                localStorage.setItem("fiics-lang", data);
                app.$i18n.locale = data;
            }
        },
        [types.ROLE]: (state, data) => {
            state.role = data;
        },
        [types.USERINFO]: (state, data) => {
            state.userInfo = data;
            localStorage.setItem("fiics-user", JSON.stringify(data));
        },
        [types.SELECT_NOW_TAB]: (state, { path, router, changePath }) => {
            state.nowSelectTab = path
            if (changePath) router.push(`/${path}`)
        },
        [types.DARKTHEME]: (state, data) => {
            state.darkTheme = data;
            window.localStorage.setItem('fiics-dark-theme', `${data}`)
        },
        [types.UPDATE_PERMISSION]: (state, data) => {
            state.permissionEditable = data;
            window.localStorage.setItem('fiics-permission-editable', `${data}`)
        }
    },
    actions: {
        setLang({ commit }, payload) {
            commit(types.LANG, payload);
        },
        setUser({ commit }, payload) {
            commit(types.USERINFO, payload);

        }
    }
})