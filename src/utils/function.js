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
}

export const setScrollBar = function (ele, that) {
    that.$jQuery(ele)
        .mCustomScrollbar({
            theme: "dark",
            scrollAmount: 50,
            mouseWheelPixels: 200
        });
    that.$jQuery(ele)
        .find(".mCSB_inside > .mCSB_container")
        .css("margin-right", "0");
}

export const transformLocTimeToUtc = function (time, format = "YYYY-MM-DD HH:mm:ss") {
    return moment(time).utc().format(format);
}
export const transformUtcToLocTime = function (date, format = "YYYY-MM-DD HH:mm:ss") {
    var utcDate = moment.utc(date).toDate();
    return moment(utcDate).local().format(format);
}

export const transformUtcToLocTimeForGraphs = function (date, format = "MMM DD HH:mm") {
    var utcDate = moment.utc(date).toDate();
    return moment(utcDate).local().format(format);
}

export const transformToSymbols = function (name) {
    let symbol;
    switch (name) {
        case "UsDollars":
            symbol = "$";
            break;
        case "PerKilowattHour":
            symbol = "KWH";
            break;
        case "PerMinute":
            symbol = "min";
            break;
        default:
            symbol = name;
    }
    return symbol
}

export const transformLangCookieToSymbol = function (languageCookie) {
    let localLanguage;
    if (languageCookie.includes('zh-Hans') || languageCookie.includes('zh-hans')) {
        localLanguage = "zh-cn"
    } else if (languageCookie.includes('zh-Hant') || languageCookie.includes('zh-hant')) {
        localLanguage = "zh-tw"
    } else if (languageCookie.includes('vi-VN') || languageCookie.includes('vi-vn')) {
        localLanguage = "vi"
    } else if (languageCookie.includes('en-US') || languageCookie.includes('en-us')) {
        localLanguage = "en"
    } else if (languageCookie.includes('es') || languageCookie.includes('eS')) {
        localLanguage = "es"
    }
    else {
        localLanguage = "en"
    }
    return localLanguage
}

export const updateLangCookie = function (oldLang, newLang) {
    const languageCookie = ("; " + document.cookie).split(`; fii.culture=`).pop().split(";")[0];
    let cookieSymbol;
    switch (newLang) {
        case "en":
            cookieSymbol = "en-US"
            break;
        case "vi":
            cookieSymbol = "vi-VN"
            break;
        case "zh-cn":
            cookieSymbol = "zh-Hans"
            break;
        case "zh-tw":
            cookieSymbol = "zh-Hant"
            break;
        case "es":
            cookieSymbol = "es"
            break;
        default:
            cookieSymbol = "en-US"
            break;
    }

    let newCookie;
    if (oldLang === "vi") {
        newCookie = languageCookie.replaceAll("vi-VN", cookieSymbol)
    } else if (oldLang === "en") {
        newCookie = languageCookie.replaceAll("en-US", cookieSymbol)
    } else if (oldLang === "zh-cn") {
        newCookie = languageCookie.replaceAll("zh-Hans", cookieSymbol)
    } else if (oldLang === "zh-tw") {
        newCookie = languageCookie.replaceAll("zh-Hant", cookieSymbol)
    } else if (oldLang === "es") {
        newCookie = languageCookie.replaceAll("es", cookieSymbol)
    }

    let expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))

    document.cookie = `fii.culture=${newCookie};expires=${expiryDate};path=/;`
}
