let environment = process.env.NODE_ENV
let base_url = process.env.VUE_APP_BASE_LOGIN_URL

export const $GLOBAL_PROJECT = "FiiCharger";
export const $GLOBAL_HTTP = "/EV_Charging_Web"; //EV_Charging_Web EV_Charging_Web_test
export const $GLOBAL_AUTH = environment === 'development' ? "Gatekeeper" : base_url + '/Gatekeeper';
export const $GLOBAL_VEHICLE = environment === 'development' ? "Vehicle" : base_url + '/Vehicle';
export const $GLOBAL_VERSION = "2.3.0";
export const $GLOBAL_LANG = {
    "en": "English",
    "zh-tw": "繁體中文",
    "zh-cn": "简体中文",
    "vi": "Tiếng Việt"
};
export const $GLOBAL_CURRENCY = {
    1: "$",
    2: "NT$"
};
