import Vue from 'vue'
import VueI18n from 'vue-i18n'
import locale from 'element-ui/lib/locale';

import en from './locales/en.json'
import tw from './locales/zh-tw.json'
import cn from './locales/zh-cn.json'
import vi from './locales/vi.json'

import enLocale from 'element-ui/lib/locale/lang/en'
import twLocale from 'element-ui/lib/locale/lang/zh-TW'
import cnLocale from 'element-ui/lib/locale/lang/zh-CN'
import viLocale from 'element-ui/lib/locale/lang/vi'

Vue.use(VueI18n)
const messages = {
    "en":  Object.assign(en, enLocale),
    "zh-tw": Object.assign(tw, twLocale),
    "zh-cn": Object.assign(cn, cnLocale),
    "vi": Object.assign(vi, viLocale),
}

const i18n = new VueI18n({
    locale: window.navigator.userLanguage || window.navigator.language || 'en',
    messages
})
var language = window.navigator.userLanguage || window.navigator.language;
var langLowerCase = language.toLowerCase()
if (window.localStorage.getItem('fiics-lang') === null) {
    window.localStorage.setItem("fiics-lang", langLowerCase)
}

locale.i18n((key, value) => i18n.t(key, value))
export default i18n