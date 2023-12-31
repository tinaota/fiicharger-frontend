import moment from "moment";
/**
 * @description 在視窗發生改變時，重新渲染圖表
 * @param {Array} chartsId 放置圖表的HTML ID 數組
 * @param {Object} echarts echars實例
 */
export const resizeCharts = function (chartsId, echarts) {
    for (var i = 0, len = chartsId.length; i < len; i++) {
        var chart = document.getElementById(chartsId[i]);
        echarts && chart && echarts.getInstanceByDom(chart).resize();
    }
};

export const setScrollBar = function (ele, that) {
    that.$jQuery(ele).mCustomScrollbar({
        theme: "dark",
        scrollAmount: 50,
        mouseWheelPixels: 200
    });
    that.$jQuery(ele).find(".mCSB_inside > .mCSB_container").css("margin-right", "0");
};

export const transformLocTimeToUtc = function (time, format = "YYYY-MM-DD HH:mm:ss") {
    return moment(time).utc().format(format);
};
export const transformUtcToLocTime = function (date, format = "lll") {
    var utcDate = moment.utc(date).toDate();
    return moment(utcDate).local().format(format);
};

export const transformUtcToLocTimeForGraphs = function (date, format = "lll") {
    var utcDate = moment.utc(date).toDate();
    return moment(utcDate).local().format(format);
};

export const convertSecondsToTime = (timeInSeconds, format) => {
    const millisecond = timeInSeconds * 1000;
    const hours = moment.duration(millisecond).hours();
    const minutes = moment.duration(millisecond).minutes();
    const seconds = moment.duration(millisecond).seconds();
    return moment().set({ hour: hours, minute: minutes, second: seconds }).format(format);
};

export const transformSecondsToReadableForm = function (timeInSeconds) {
    timeInSeconds = Number(timeInSeconds);
    var days = Math.floor(timeInSeconds / (3600 * 24));
    var hours = Math.floor((timeInSeconds % (3600 * 24)) / 3600);
    var minutes = Math.floor((timeInSeconds % 3600) / 60);
    var seconds = Math.floor(timeInSeconds % 60);

    var dayDisplay = days > 0 ? days + "d " : "";
    var hourDisplay = hours > 0 ? hours + "h " : "";
    var minuteDisplay = minutes > 0 ? minutes + "m " : "";
    var secondDisplay = seconds > 0 ? seconds + "s" : "";
    return (dayDisplay + hourDisplay + minuteDisplay + secondDisplay).replace(/,\s*$/, "");
};

export const transformToSymbols = function (name) {
    let symbol;
    switch (name) {
        case "UsDollars":
            symbol = "$";
            break;
        case "PerKilowattHour":
            symbol = "kWh";
            break;
        case "PerMinute":
            symbol = "min";
            break;
        default:
            symbol = name;
    }
    return symbol;
};

export const transformLangCookieToSymbol = function (languageCookie) {
    let localLanguage;
    if (languageCookie.includes("zh-Hans") || languageCookie.includes("zh-hans")) {
        localLanguage = "zh-cn";
    } else if (languageCookie.includes("zh-Hant") || languageCookie.includes("zh-hant")) {
        localLanguage = "zh-tw";
    } else if (languageCookie.includes("vi-VN") || languageCookie.includes("vi-vn")) {
        localLanguage = "vi";
    } else if (languageCookie.includes("en-US") || languageCookie.includes("en-us")) {
        localLanguage = "en";
    } else if (languageCookie.includes("es") || languageCookie.includes("eS")) {
        localLanguage = "es";
    } else {
        localLanguage = "en";
    }
    return localLanguage;
};

export const updateLangCookie = function (oldLang, newLang) {
    const languageCookie = ("; " + document.cookie).split(`; fii.culture=`).pop().split(";")[0];
    let cookieSymbol;
    switch (newLang) {
        case "en":
            cookieSymbol = "en-US";
            break;
        case "vi":
            cookieSymbol = "vi-VN";
            break;
        case "zh-cn":
            cookieSymbol = "zh-Hans";
            break;
        case "zh-tw":
            cookieSymbol = "zh-Hant";
            break;
        case "es":
            cookieSymbol = "es";
            break;
        default:
            cookieSymbol = "en-US";
            break;
    }

    let newCookie;
    if (oldLang === "vi") {
        newCookie = languageCookie.replaceAll("vi-VN", cookieSymbol);
    } else if (oldLang === "en") {
        newCookie = languageCookie.replaceAll("en-US", cookieSymbol);
    } else if (oldLang === "zh-cn") {
        newCookie = languageCookie.replaceAll("zh-Hans", cookieSymbol);
    } else if (oldLang === "zh-tw") {
        newCookie = languageCookie.replaceAll("zh-Hant", cookieSymbol);
    } else if (oldLang === "es") {
        newCookie = languageCookie.replaceAll("es", cookieSymbol);
    }

    let expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    document.cookie = `fii.culture=${newCookie};expires=${expiryDate};path=/;`;
};

export const getDefaultFont = () => {
    const languageCookie = ("; " + document.cookie).split(`; fii.culture=`).pop().split(";")[0];
    let defaultFont;
    if (languageCookie.includes("Hant")) {
        defaultFont = "NotoSansTC";
    } else if (languageCookie.includes("Hans")) {
        defaultFont = "NotoSansSC";
    } else {
        defaultFont = "Roboto";
    }
    return defaultFont;
};

export const getCurrencySymbolsFromCurrencyCode = (currencyCode) => {
    let currencySymbol;
    switch (currencyCode) {
        case "USD":
            currencySymbol = "$";
            break;
        case "EUR":
            currencySymbol = "€";
            break;
        case "CNY":
            currencySymbol = "¥";
            break;
        case "INR":
            currencySymbol = "₹";
            break;
        case "JPY":
            currencySymbol = "¥";
            break;
        case "KRW":
            currencySymbol = "₩";
            break;
        case "MXN":
            currencySymbol = "$";
            break;
        case "NPR":
            currencySymbol = "रू";
            break;
        case "TWD":
            currencySymbol = "NT$";
            break;
        default:
            currencySymbol = currencyCode;
    }
    return currencySymbol;
};

export const getNewlyAddedItems = (selectedList, originalList) => {
    let addedItems = selectedList?.filter((item) => !originalList?.includes(item));
    let updatedItems = [];
    if (addedItems?.length > 0) {
        addedItems.map((eachId) => {
            updatedItems.push({
                type: "Add",
                value: eachId
            });
        });
    }
    return updatedItems;
};

export const getNewlyRemovedItems = (selectedList, originalList) => {
    let removedItems = originalList?.filter((item) => !selectedList?.includes(item));
    let updatedItems = [];
    if (removedItems?.length > 0) {
        removedItems.map((eachId) => {
            updatedItems.push({
                type: "Remove",
                value: eachId
            });
        });
    }
    return updatedItems;
};

export const convertToAMorPM = (time, format = "hh:mm:ss A") => {
    // time should be in format HH:mm:ss
    let hours = parseInt(time.substring(0, 2));
    let minutes = parseInt(time.substring(3, 5));
    let seconds = parseInt(time.substring(6, 8)) || 0;
    let newTime;
    if (hours === 0) {
        newTime = "00:" + moment().startOf("day").add("minutes", minutes).add("seconds", seconds).format(format.substring(3));
    } else {
        newTime = moment().startOf("day").add("hours", hours).add("minutes", minutes).add("seconds", seconds).format(`${format}`);
    }
    return newTime;
};

// catching errors in the api call
// only console errors in development
export const catchErrors = (errorFunction, err) => {
    let environment = process?.env?.NODE_ENV;
    if (environment === "development") {
        console.log(errorFunction, err);
    }
    // return the message popup to be displayed
    let _errors;
    if (err?.data?.errors) {
        _errors = Object.values(err?.data?.errors);
    } else if (err?.data && err?.data !== "") {
        _errors = err?.data;
    } else if (err && err?.data !== "") {
        _errors = err;
    } else {
        _errors = i18n.t("error_network");
    }
    return _errors.toString();
};
