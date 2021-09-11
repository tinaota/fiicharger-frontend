<template>
    <div :id="id" :ref="id"> </div>
</template>
<script>
import { resizeCharts } from "@/utils/function";
export default {
    name: "line-chart",
    props: {
        id: String,
        chartData: {
            type: Object,
            default: function() {
                return {
                    xList: [],
                    yList: [],
                };
            }
        }
    },
    data() {
        return {
            lang: '',
            timeList: [],
            nameList: [],
            seriesData: [],
            legendList: [],
            yAxisData: []
        };
    },
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.prePareData();
        this.draw();
        window.addEventListener("resize", this.resizeCharts, false);
    },
    watch: {
        chartData: {
            deep: true,
            handler() {
                this.prePareData();
                this.draw();
            }
        }
    },
    computed: {
        chartId: function() {
            let chart = this.$echarts.init(this.$refs[this.id]);
            return chart;
        }
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
            this.timeList = that.chartData.xList;
            that.seriesData = [];
            that.nameList = [];
            that.legendList = [];
            const rightOffset = (this.lang === 'en') ? ['190', '20'] : ['190', '20'];
            let maxKwh = that.chartData.yList.length > 0 ? Math.max(...that.chartData.yList[0].value) : 100;
            that.chartData.yList && that.chartData.yList.forEach((item, idx) => {
                let info = {
                        name: item.name,
                        type: "line",
                        symbol:'circle',
                        symbolSize: 10,
                        data: item.value,
                        // areaStyle: {},
                        yAxisIndex: idx
                    };
                let legend = {
                        data: [{
                            name: item.name,
                            icon: "circle",
                        }],
                        top: "5",
                        right: rightOffset[idx],
                        textStyle: {
                            fontSize: 14,
                            color: "#525E69"
                        }
                    };
                that.seriesData.push(info);
                that.nameList.push(item.name);
                that.legendList.push(legend);
            });
            that.yAxisData = [
                {
                            type: "value",
                            name: "(kWh)",
                            min: 0,
                            max: Math.round(maxKwh/100)*100 + 300,
                            axisLabel: {
                                margin: 10,
                                textStyle: {
                                    fontSize: 14,
                                    color: "#1FD286"
                                }
                            },
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: '#525E69'
                                }
                            },
                            nameTextStyle: {
                                padding: [0, 0, 0, -55],
                                color: "#1FD286",
                                fontWeight: 'bold',
                                fontSize: 14
                            },
                            splitLine: {
                                lineStyle: {
                                    color: "#E5E9F2"
                                }
                            }
                        },
                        {
                            type: "value",
                            min: 0,
                            axisLabel: {
                                margin: 10,
                                textStyle: {
                                    fontSize: 14,
                                    color: "#1E5EFF"
                                }
                            },
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: '#525E69'
                                }
                            },
                            // nameTextStyle: {
                            //     padding: [0, 0, 5, 55],
                            //     color: "#0c83ff",
                            //     fontWeight: 'bold',
                            //     fontSize: 14
                            // },
                            splitLine: {
                                lineStyle: {
                                    color: "#E5E9F2"
                                }
                            }
                        }
                    ];
            if (that.chartData.yList.length && !that.chartData.yList[1].value.length) {
                that.yAxisData[1].max = 100;
            }
        },
        draw() {
            const color = ["#1FD286", "#1E5EFF"];
            let options = {
                color: color,
                tooltip: {
                    trigger: "axis",
                    formatter: function(params) {
                        let result = params[0].name + '<br/>',
                            unit = ["kWh", ""];
                        params.forEach((p, idx) => {
                            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color[idx]};"></span>
                                        ${p.seriesName} : ${p.value} ${unit[idx]} <br/>`;
                        });
                        return result;
                    },
                    padding: [12,20],
                    borderColor: "#FFFFFF",
                    borderWidth: 1,
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: this.legendList,
                grid: {
                    left: "25",
                    right: "20",
                    top: "60",
                    bottom: "0",
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    data: this.timeList,
                    boundaryGap: false,
                    nameTextStyle: {
                        padding: [0, 0, -50, 2],
                        color: "#525E69"
                    },
                    axisLine: {
                        lineStyle: {
                            color: " #525E69"
                        }
                    },
                    axisLabel: {
                        margin: 16,
                        textStyle: {
                            fontSize: 14,
                            color: "#525E69"
                        }
                    },
                },
                yAxis:  this.yAxisData,
                series: this.seriesData
            };
            this.chartId.setOption(options);
        },
        resizeCharts: function() {
            resizeCharts([this.id], this.$echarts);
        },
    }
};
</script>
<style>
</style>