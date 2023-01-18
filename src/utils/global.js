export const $GLOBAL_AUTH = "/gatekeeper";
export const $GLOBAL_VEHICLE = "/vehicle";
export const $GLOBAL_CHARGER = "/cosmos";
export const $GLOBAL_BASE_URL = window.location.origin
export const $GLOBAL_GRAFANA = `${$GLOBAL_BASE_URL}/grafii/d`
export const $GLOBAL_REDIRECT_URL = `${$GLOBAL_BASE_URL}/login`
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

export const $POWER_TYPE_LIST = [
    { name: "AC single phase", value: "AC_1_PHASE" },
    { name: "AC two phases", value: "AC_2_PHASE" },
    {
        name: "AC two phases w/ split phase",
        value: "AC_2_PHASE_SPLIT"
    },
    { name: "AC three phases", value: "AC_3_PHASE" },
    { name: "DC", value: "DC" }
]

export const $CONNECTOR_TYPE_LIST = [
    { name: "CHAdeMO, DC", value: "CHADEMO" },
    { name: "ChaoJi", value: "CHAOJI" },
    { name: "Type A, NEMA 1-15, 2 pins", value: "DOMESTIC_A" },
    { name: "Type B, NEMA 5-15, 3 pins", value: "DOMESTIC_B" },
    { name: "Type C, CEE 7/17, 2 pins", value: "DOMESTIC_C" },
    { name: "Type D, 3 pins", value: "DOMESTIC_D" },
    { name: "Type E, CEE 7/5, 3 pins", value: "DOMESTIC_E" },
    {
        name: "Type F, CEE 7/4, Schuko, 3 pin)",
        value: "DOMESTIC_F"
    },
    {
        name: "Type G, BS 1363, Commonwealth, 3 pins",
        value: "DOMESTIC_G"
    },
    { name: "Type H, SI-32, 3 pins", value: "DOMESTIC_H" },
    { name: "Type I, AS 3112, 3 pins", value: "DOMESTIC_I" },
    { name: "Type J, SEV 1011, 3 pins", value: "DOMESTIC_J" },
    {
        name: "Type K, DS 60884-2-D1, 3 pins",
        value: "DOMESTIC_K"
    },
    {
        name: "Type L, CEI 23-16-VII, 3 pins",
        value: "DOMESTIC_L"
    },
    { name: "Type M, BS 546, 3 pins", value: "DOMESTIC_M" },
    { name: "Type N, NBR 14136, 3 pins", value: "DOMESTIC_N" },
    {
        name: "Type O, TIS 166-2549, 3 pins",
        value: "DOMESTIC_O"
    },
    { name: "Guobiao GB/T 20234.2 AC", value: "GBT_AC" },
    { name: "Guobiao GB/T 20234.3 DC", value: "GBT_DC" },
    {
        name: "IEC 60309-2 16A single phase",
        value: "IEC_60309_2_single_16"
    },
    {
        name: "IEC 60309-2 16A three phase",
        value: "IEC_60309_2_three_16"
    },
    {
        name: "IEC 60309-2 32A three phase",
        value: "IEC_60309_2_three_32"
    },
    {
        name: "IEC 60309-2 64A three phase",
        value: "IEC_60309_2_three_64"
    },
    { name: "Type 1, SAE J1772", value: "IEC_62196_T1" },
    { name: "Type 1 combo, DC", value: "IEC_62196_T1_COMBO" },
    { name: "Type 2, Mennekes", value: "IEC_62196_T2" },
    { name: "Type 2 combo, DC", value: "IEC_62196_T2_COMBO" },
    { name: "Type 3A", value: "IEC_62196_T3A" },
    { name: "Type 3C, Scame", value: "IEC_62196_T3C" },
    { name: "NEMA 5-20, 3 pins", value: "NEMA_5_20" },
    { name: "NEMA 6-30, 3 pins", value: "NEMA_6_30" },
    { name: "NEMA 6-50, 3 pins", value: "NEMA_6_50" },
    { name: "NEMA 10-30, 3 pins", value: "NEMA_10_30" },
    { name: "NEMA 10-50, 3 pins", value: "NEMA_10_50" },
    { name: "NEMA 14-30, 3 pins", value: "NEMA_14_30" },
    { name: "NEMA 14-50, 3 pins", value: "NEMA_14_50" },
    {
        name: "On-board bottom-up pantograph",
        value: "PANTOGRAPH_BOTTOM_UP"
    },
    {
        name: "Off-board top-down pantograph",
        value: "PANTOGRAPH_TOP_DOWN"
    },
    {
        name: "Tesla Roadster-type, round, 4 pins",
        value: "TESLA_R"
    },
    {
        name: "Tesla Model-S-type, oval, 5 pins",
        value: "TESLA_S"
    }
]
