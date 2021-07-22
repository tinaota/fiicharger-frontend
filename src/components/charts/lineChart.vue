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
            timeList: [],
            nameList: [],
            seriesData: [],
            legendList: [],
            yAxisData: []
        };
    },
    created() {},
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
            /*chart.showLoading({
                text: '',
                color: '#409EFF',
                maskColor: 'rgba(0, 0, 0, 0.9)',
                spinnerRadius: 20,
                lineWidth: 2
            });*/
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
            that.chartData.yList && that.chartData.yList.forEach((item, idx) => {
                let rightOffset = 0;
                if (!idx) {
                    rightOffset = that.chartData.yList.length * 76 - 35;
                } else {
                    rightOffset = (that.chartData.yList.length - idx) * 76 - 55;
                }
                let info = {
                        name: item.name,
                        type: "line",
                        symbol:'circle',
                        symbolSize: 10,
                        data: item.value,
                        areaStyle: {},
                        yAxisIndex: idx,
                        // itemStyle: {
                        //     color: '#162951',
                        //     borderColor: color[idx],
                        //     borderWidth: 2,
                        //     borderType: 'solid',
                        // },
                        // lineStyle: {
                        //     normal: {
                        //         color: color[idx]
                        //     }
                        // }
                    };
                let legend = {
                        // itemHeight: 10,
                        // symbolSize: 10,
                        data: [{
                            name: item.name,
                            icon: "circle",
                        }],
                        top: "0",
                        right: rightOffset.toString(),
                        textStyle: {
                            fontSize: 14,
                            color: "#525E69"
                        },
                        // itemStyle: {
                        //     color: color[idx]
                        // }
                    };
                that.seriesData.push(info);
                that.nameList.push(item.name);
                that.legendList.push(legend);
            });
            that.yAxisData = [
                        {
                            type: "value",
                            name: "(kWh)",
                            axisLabel: {
                                margin: 16,
                                textStyle: {
                                    fontSize: 14,
                                    color: "#0c83ff"
                                }
                            },
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: '#525E69'
                                }
                            },
                            nameTextStyle: {
                                padding: [0, 0, 5, -55],
                                color: "#0c83ff",
                                fontWeight: 'bold',
                                fontSize: 14
                            },
                            splitLine: {
                                lineStyle: {
                                    color: "#525E69"
                                }
                            }
                        },
                        {
                            type: "value",
                            name: "(%)",
                            min: 0,
                            max: 100,
                            axisLabel: {
                                margin: 16,
                                textStyle: {
                                    fontSize: 14,
                                    color: "#3ADB65"
                                }
                            },
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: '#525E69'
                                }
                            },
                            nameTextStyle: {
                                padding: [0, 0, 5, 55],
                                color: "#3ADB65",
                                fontWeight: 'bold',
                                fontSize: 14
                            },
                            splitLine: {
                                lineStyle: {
                                    color: "#525E69"
                                }
                            }
                        }];
        },
        draw() {
            const color = ["#0c83ff", "#3ADB65"];
            let options = {
                color: color,
                tooltip: {
                    trigger: "axis",
                    formatter: function(params) {
                        let result = params[0].name + '<br/>';
                        params.forEach((p, idx) => {
                            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color[idx]};"></span>
                                        ${p.seriesName} : ${p.value} ${(idx)? '%':'kWh'} <br/>`;
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
                    left: "20",
                    right: "20",
                    top: "70",
                    bottom: "20",
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
            // if (this.timeList.length > 0) {
            //     this.chartId.hideLoading();
            // }
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