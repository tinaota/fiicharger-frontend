// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import * as Echarts from 'echarts';
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import "font-awesome/css/font-awesome.min.css";
import $ from "jquery";
import "jquery-mousewheel";
import Vue from "vue";
import VueGtag from "vue-gtag";
import "../public/libs/jquery-ui-1.12.1.custom/jquery-ui.min";
import "../public/libs/jquery-ui-1.12.1.custom/jquery-ui.min.css";
import "../public/libs/malihu-custom-scrollbar-plugin-master/jquery.mCustomScrollbar.concat.min";
import "../public/libs/malihu-custom-scrollbar-plugin-master/jquery.mCustomScrollbar.js";
import "../public/libs/malihu-custom-scrollbar-plugin-master/jquery.mCustomScrollbar.min.css";
import App from "./App";
import "./assets/icon/iconfont.css";
import axios from "./http/http";
import i18n from "./lang/lang";
import router from "./router/index";
import store from "./store/store";

window.i18n = i18n
Vue.config.productionTip = false

Vue.prototype.$echarts = Echarts
Vue.prototype.$jQuery = $

Vue.use(ElementUI, { size: "mini" });
Vue.use(
    VueGtag,
    {
        config: { id: "G-X1GNPE9P5D" }
    },
    router
);

export const app = new Vue({
    router,
    store,
    i18n,
    axios,
    render: (h) => h(App)
}).$mount("#app");
