import Vuex from 'vuex'
import Vue from 'vue'
import * as types from './types'
import { app } from '../main'
Vue.use(Vuex)
export default new Vuex.Store({
    state: {
        token: null,
        lang: '',
        nowSelectTab: location.pathname.includes('kiosk') ? 'kiosk' : 'station',
        tabsArr: ['station', 'kiosk'],
        role: '',
        userInfo: localStorage.getItem('fiics-user') ? JSON.parse(localStorage.getItem('fiics-user')) : {}
    },
    mutations: {
        [types.LOGIN]: (state, data) => {
            window.localStorage.setItem('fiics-token', data)
            state.token = data
        },
        [types.LOGOUT]: (state) => {
            let uuid = localStorage.getItem('uuid');
            let fiicsLang = localStorage.getItem('fiics-lang')
            window.localStorage.clear();
            window.localStorage.setItem('uuid', uuid);
            window.localStorage.setItem('fiics-lang', fiicsLang)
            state = {
                token: null,
                lang: 'en',
                role: ''
            };
        },
        [types.LANG]: (state, data) => {
            state.lang = data;
            if (app && app.$i18n) {
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