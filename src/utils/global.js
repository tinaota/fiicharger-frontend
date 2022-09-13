export const $GLOBAL_PROJECT = "FiiCharger";
export const $GLOBAL_AUTH = "/gatekeeper";
export const $GLOBAL_VEHICLE = "/vehicle";
export const $GLOBAL_CHARGER = "/cosmos";
export const $GLOBAL_BASE_URL = window.location.origin
export const $GLOBAL_GRAFANA = `${$GLOBAL_BASE_URL}/grafii/d`
export const $GLOBAL_REDIRECT_URL = `${$GLOBAL_BASE_URL}/${$GLOBAL_PROJECT}/login`
export const $GLOBAL_PAGE_LIMIT = 10;
export const $GLOBAL_CLIENT_ID = "7c13221fcef3e92495d6ed610023accb.webapp.fii-usa.com";
export const $GLOBAL_VERSION = process.env.VUE_APP_VERSION.slice(0, process.env.VUE_APP_VERSION.indexOf('-')) || '0.0.0';
export const $GLOBAL_LANG = {
    "en": "English",
    "es": "Español",
    "zh-cn": "简体中文",
    "zh-tw": "繁體中文",
    "vi": "Tiếng Việt"
};
export const $GLOBAL_CURRENCY = {
    1: "$",
    2: "NT$"
};
export const $ALL_DATA_COUNT = 200;
export const $GLOBAL_REFRESH = 10000;

