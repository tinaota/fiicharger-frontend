import Vuex from 'vuex'
import Vue from 'vue'
import * as types from './types'
import {app} from '../main'
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        token: null,
        lang:''
    },
    mutations: {
        [types.LOGIN]: (state, data) => {
            window.sessionStorage.setItem('fiics-token', data)
            state.token = data
        },
        [types.LOGOUT]: (state) => {
            window.sessionStorage.clear();
            state = {
                token: null,
                lang: 'en',
            };
        },
        [types.LANG]: (state, data) => {
            state.lang = data;
            if (app && app.$i18n) {
                app.$i18n.locale = data;
            }
        }
    },
    actions: {
        setLang({commit}, payload) {
            commit(types.LANG, payload);
        }
    }
})