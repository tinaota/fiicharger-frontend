<template>
    <div :id="id" :ref="id"></div>
</template>
<script>
import { resizeCharts } from "@/utils/function";
const DEFAULT_MAXSECONDS = 24 * 60 * 60;
export default {
    name: "BarChart",
    props: {
        id: String,
        chargingRateUnit: String,
        chartData: {
            type: Array,
            default: function () {
                return [];
            }
        }
    },
    data() {
        return {
            seriesData: []
        };
    },
    computed: {
        chartId: function () {
            let chart = this.$echarts.init(this.$refs[this.id]);
            return chart;
        }
    },
    watch: {
        chartData: {
            deep: true,
            handler() {
                this.prePareData();
                this.draw();
            }
        },
        chargingRateUnit() {
            this.prePareData();
        }
    },
    mounted() {
        this.prePareData();
        this.draw();
        window.addEventListener("resize", this.resizeCharts, false);
    },
    beforeDestroy() {
        if (this.chartId) {
            this.chartId.clear();
        }
        window.removeEventListener("resize", this.resizeCharts, false);
    },
    methods: {
        prePareData() {
            const that = this;
            that.seriesData = [];
            that.chartData.forEach((item, idx) => {
                const length = that.chartData.length;
                item.endTime = item.endTime.substring(0, 5) + "PM";
                item.chargingRateUnit = this.chargingRateUnit;
                let info = {
                    name: item.id,
                    type: "bar",
                    stack: that.id,
                    data: [item.duration],
                    barWidth: 20,
                    emphasis: {
                        focus: "series"
                    }
                };
                if (idx === 0 && length === 1) {
                    info.itemStyle = {
                        normal: {
                            barBorderRadius: [50, 50, 50, 50]
                        }
                    };
                } else if (idx === 0) {
                    info.itemStyle = {
                        normal: {
                            barBorderRadius: [50, 0, 0, 50]
                        }
                    };
                } else if (idx === length - 1) {
                    info.itemStyle = {
                        normal: {
                            barBorderRadius: [0, 50, 50, 0]
                        }
                    };
                } else {
                    info.itemStyle = {
                        normal: {
                            barBorderRadius: [0, 0, 0, 0]
                        }
                    };
                }
                that.seriesData.push(info);
            });
        },
        draw() {
            const that = this;
            let options = {
                tooltip: {
                    formatter: function (params) {
                        const data = that.chartData[params.componentIndex];
                        let result = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
                            params.color
                        };"></span>
                                      <b>${params.seriesName}</b><br/>
                                      <div>${i18n.t("general.time")}: ${data.time + " ~ " + data.endTime} <div>
                                      <div>${i18n.t("chargingProfile.numberPhases")}: ${data.numberPhases} <div>
                                      <div>${i18n.t("chargingProfile.limit")}: ${data.limit} ${data.chargingRateUnit}<div>
                                      `;
                        return result;
                    },
                    padding: [12, 20],
                    position: "top",
                    borderColor: "#FFFFFF",
                    borderWidth: 1,
                    axisPointer: {
                        type: "shadow"
                    }
                },
                grid: {
                    left: "0",
                    right: "10",
                    top: "0",
                    bottom: "0"
                },
                xAxis: {
                    type: "value",
                    min: 0,
                    max: DEFAULT_MAXSECONDS,
                    show: false
                },
                yAxis: [
                    {
                        type: "category",
                        show: false,
                        data: [""]
                    }
                ],
                series: this.seriesData
            };
            this.chartId.setOption(options);
        },
        resizeCharts: function () {
            resizeCharts([this.id], this.$echarts);
        }
    }
};
</script>
<style>
</style>
