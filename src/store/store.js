import Vuex from 'vuex'
import Vue from 'vue'
import * as types from './types'
import {app} from '../main'
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        lang:''
    },
    mutations: {
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