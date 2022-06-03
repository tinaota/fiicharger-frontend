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