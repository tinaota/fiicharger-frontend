/**
 * @description 在視窗發生改變時，重新渲染圖表
 * @param {Array} chartsId 放置圖表的HTML ID 數組
 * @param {Object} echarts echars實例
 */
export const resizeCharts = function(chartsId, echarts) {
    for (var i = 0, len = chartsId.length; i < len; i++) {
        var chart = document.getElementById(chartsId[i]);
        echarts && chart && echarts.getInstanceByDom(chart).resize();
    }
}

export const setScrollBar = function(ele, that) {
    that.$jQuery(ele)
        .mCustomScrollbar({
            theme: "dark",
            scrollAmount: 50,
            mouseWheelPixels:200
        });
        that.$jQuery(ele)
        .find(".mCSB_inside > .mCSB_container")
        .css("margin-right", "0");
}