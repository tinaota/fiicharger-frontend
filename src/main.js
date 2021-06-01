// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import Echarts from 'echarts'
import router from './router/index'
import store from './store/store'
import axios from './http/http'
import i18n from './lang/lang'
import $ from 'jquery'
import VuePapaParse from 'vue-papa-parse'
import 'jquery-mousewheel'
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.min.css'
import '../static/libs/jquery-ui-1.12.1.custom/jquery-ui.min.css'
import '../static/libs/malihu-custom-scrollbar-plugin-master/jquery.mCustomScrollbar.min.css'
import '../static/libs/jquery-ui-1.12.1.custom/jquery-ui.min'
import '../static/libs/malihu-custom-scrollbar-plugin-master/jquery.mCustomScrollbar.concat.min'
import '../static/libs/malihu-custom-scrollbar-plugin-master/jquery.mCustomScrollbar.js'
import './assets/icon/iconfont.css'

window.i18n = i18n
Vue.config.productionTip = false

Vue.prototype.$echarts = Echarts
Vue.prototype.$jQuery = $

Vue.use(ElementUI, { size: 'mini' });
Vue.use(VuePapaParse)
export const app = new Vue({
    router,
    store,
    i18n,
    axios,
    render: h => h(App)
}).$mount('#app')